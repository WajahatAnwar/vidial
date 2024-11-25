<?php

namespace App\Http\Controllers\InConnect;

use App\Exports\InConnect\BatchExport;
use Inertia\Inertia;
use App\Traits\GeneralTrait;
use App\Traits\InConnect\VendorTrait;
use Illuminate\Http\Request;
use App\Models\InConnect\Batch;
use App\Models\InConnect\Vendor;
use App\Http\Controllers\Controller;
use App\Models\InConnect\BatchOrder;
use App\Jobs\InConnect\VendorOrderJob;
use App\Models\InConnect\BatchItem;
use App\Models\InConnect\BatchSetting;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use App\Models\InConnect\ShopifyVendorVendor;
use App\Jobs\InConnect\MasterVendorOrderJob;
use Maatwebsite\Excel\Facades\Excel;

class BatchController extends Controller
{
    use GeneralTrait, VendorTrait;

    public function index(Request $request)
    {
        return Inertia::render('Applications/InConnect/Batches/BatchSettings', [
            'batchSettings' => BatchSetting::all(),
            'shopify_vendors' => Vendor::all()
        ]);
    }

    public function listing(Request $request)
    {
        return Inertia::render('Applications/InConnect/Batches/BatchList');
    }

    public function ordersList(Request $request)
    {
        return Inertia::render('Applications/InConnect/Batches/BatchOrders');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'batch_name' => 'required',
            'batch_threshold' => 'required',
            'batch_day' => 'required',
            'vendor_id' => 'required',
            // 'days_count'=> 'required'
        ]);

        if ($validator->fails())
            return simpleValidate($validator);
        if ($request->id) {
            $setting = BatchSetting::find($request->id);
            $setting->batch_name = $request->batch_name;
            $setting->batch_threshold = $request->batch_threshold;
            $setting->batch_day = $request->batch_day;
            $setting->vendor_id = $request->vendor_id;
            $setting->days_count = $request->days_count;
            $setting->save();
            return responseJson(true, 'Batch settings updated successfully', null);
        } else {
            $setting = new BatchSetting();
            $setting->batch_name = $request->batch_name;
            $setting->batch_threshold = $request->batch_threshold;
            $setting->batch_day = $request->batch_day;
            $setting->vendor_id = $request->vendor_id;
            $setting->days_count = $request->days_count;
            $setting->save();

            Batch::create([
                'batch_setting_id' => $setting->id,
                'batch_status' => 'unfulfilled'
            ]);
            return responseJson(true, 'Batch settings save successfully', null);
        }
    }

    public function list(Request $request)
    {
        $batches = Batch::where('batch_setting_id', $request->id)
            ->with(['batchSetting', 'batchOrders', 'logs', 'updates'])
            ->withSum('batchOrders', 'price')
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereHas('batchSetting', function ($q) use ($request) {
                        $q->where('batch_name', 'LIKE', '%' . $request->q . '%');
                    });
                })->orWhereHas('batchOrders', function ($q) use ($request) {
                        $q->whereHas('inconnectOrder', function ($q) use ($request) {
                            $q->where('shopify_order_name', 'LIKE', '%' . $request->q . '%');
                        });
                    });

            })->orderBy('id', 'desc')->cursorPaginate($request->page_count);
        return responseJson(true, 'Batch settings list', $batches);
    }

    public function ordersListing(Request $request)
    {
        $batches = BatchOrder::where('batch_id', $request->id)
            ->when($request->get('q'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->whereHas('inconnectOrder', function ($q) use ($request) {
                        $q->where('shopify_order_name', 'LIKE', '%' . $request->q . '%');
                    });
                });
            })
            ->with('inconnectOrder', 'batch.batchSetting', 'batch.batchSetting.vendor')->cursorPaginate($request->page_count);
        return responseJson(true, 'Batch orders list', $batches);
    }

    public function force(Request $request)
    {
        $latestBatch = Batch::find($request->batch_id);
        // return $latestBatch->batchOrders;

        if ($latestBatch->batchOrders->count() == 0) {
            return responseJson(false, 'No orders found in the batch', null);
        }

        if ($latestBatch->batchSetting->master_po) {
            $vendorItems = [];
            $intacctItems = [];
            $currency = "USD";
            $totalAmount = 0;
            $ordersReferences = [];
            foreach ($latestBatch->batchOrders as $key => $oneOrder) {

                $inconnectOrder = $oneOrder->inconnectOrder;
                $ordersReferences[] = $inconnectOrder->shopify_order_name;
                $user = $inconnectOrder->user;

                $shopifyOrder =  $user->api()->rest('GET', '/admin/api/2024-04/orders/' . $inconnectOrder->shopify_order_id . '.json');

                if ($shopifyOrder['errors'] == false) {
                    $payload = $shopifyOrder['body']['order'];

                    $order = $this->graphQLOrderResponse($inconnectOrder->shopify_order_id, $user);
                    $gooselyRule = $this->gooselyRuleProcess($order);

                    $lineItems = $order['body']['data']['order']['lineItems'];
                    $lineItems = collect($lineItems['edges']);

                    $vendors = $lineItems->filter(function ($item) use ($latestBatch) {
                        return data_get($item, 'node.product.vendor') === $latestBatch->batchSetting->vendor->name;
                    })->groupBy('node.product.vendor');

                    $excludedVendors = $user->inconnect_account->ignored_vendors->pluck('id')->toArray();
                    $vendors->each(function ($splitLineItems, $key) use (&$vendorItems, &$intacctItems, &$currency, &$totalAmount, $latestBatch, $user, $payload, $inconnectOrder, $order, $excludedVendors, $gooselyRule, &$oneTimeDecorator) {

                        $order = json_decode(json_encode($order), true);
                        $order['original'] = $order;
                        $order['body']['data']['order']['lineItems']['edges'] = $splitLineItems->toArray();

                        $shopifyVendor = ShopifyVendorVendor::whereNotIn('vendor_id', $excludedVendors)->whereHas('shopifyVendor', function ($q) use ($latestBatch, $excludedVendors) {
                            $q->where('name', $latestBatch->batchSetting->vendor->name);
                            $q->whereNotIn('id', $excludedVendors);
                        })->with('vendor')->first();

                        if ($shopifyVendor?->vendor) {

                            $checkedResponse = $this->masterPoItemsAndIntacctItems($user, $payload, $inconnectOrder, $order, $shopifyVendor->vendor);

                            foreach ($checkedResponse['items'] as $newItem) {
                                $sku = $newItem['lineNumber'];
                                $quantity = $newItem['quantity'];
                                $found = false;
                                foreach ($vendorItems as &$existingItem) {
                                    if ($existingItem['lineNumber'] == $sku) {
                                        $existingItem['quantity'] += $quantity;
                                        $found = true;
                                        break;
                                    }
                                }
                                unset($existingItem);
                                if (!$found) {
                                    $vendorItems[] = $newItem;
                                }
                            }

                            foreach ($checkedResponse['intacct_items'] as $newItem) {
                                $sku = $newItem['item_id'];
                                $quantity = $newItem['quantity'];
                                $found = false;
                                foreach ($intacctItems as &$existingItem) {
                                    if ($existingItem['item_id'] == $sku) {
                                        $existingItem['quantity'] += $quantity;
                                        $found = true;
                                        break;
                                    }
                                }
                                unset($existingItem);
                                if (!$found) {
                                    $intacctItems[] = $newItem;
                                }
                            }

                            $currency = $checkedResponse['currency'];
                            $totalAmount = $totalAmount + $checkedResponse['total_amount'];
                        }
                    });
                }

                $inconnectOrder->batch_status = 'fulfilled';
                $inconnectOrder->save();
            }

            if (count($vendorItems) > 0) {
                // logger(json_encode([$vendorItems, $intacctItems, $currency, $totalAmount]));
                MasterVendorOrderJob::dispatch($vendorItems, $intacctItems, $latestBatch->batchSetting->vendor, $latestBatch, $currency, $totalAmount, $ordersReferences);
            }
        } else {

        foreach ($latestBatch->batchOrders as $order) {
            $inconnectOrder = $order->inconnectOrder;
            $user = $inconnectOrder->user;
            $excludedVendors = $user->inconnect_account->ignored_vendors->pluck('id')->toArray();
            $shopifyVendorFound = ShopifyVendorVendor::whereNotIn('vendor_id', $excludedVendors)
                ->whereHas('shopifyVendor', function ($q) use ($order, $excludedVendors, $latestBatch) {
                    $q->where('name', $latestBatch->batchSetting->vendor->name); // Assuming $key should be $order->vendor_name
                    $q->whereNotIn('id', $excludedVendors);
                })
                ->with('vendor')
                ->first();

            $shopifyOrderData = $this->graphQLOrderResponse($inconnectOrder->shopify_order_id, $user);

            $shopifyOrder = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $inconnectOrder->shopify_order_id . '.json');

            $gooselyRule = $this->gooselyRuleProcess($shopifyOrderData);

            if ($shopifyVendorFound?->vendor) {
                VendorOrderJob::dispatch($user, $shopifyOrder['body']['order'], $inconnectOrder, $shopifyOrderData, $shopifyVendorFound->vendor, $gooselyRule, false, false);
                $inconnectOrder->batch_status = 'fulfilled';
                $inconnectOrder->save();
            }
            }
        }

        // $running_batch = $vendorBatch->batches()->latest()->first();
        $running_batch = $latestBatch;
        $running_batch->update([
            'batch_status' => 'fulfilled'
        ]);

        Batch::create([
            'batch_setting_id' => $latestBatch->batchSetting->id,
            'batch_status' => 'unfulfilled'
        ]);

        return responseJson(true, 'Batch orders fulfilled successfully forcefully', null);
    }

    public function status(Request $request)
    {
        $batchSetting = BatchSetting::find($request->id);
        $batchSetting->batch_status = $request->is_active;
        $batchSetting->save();
        return responseJson(true, 'Batch status updated successfully', null);
    }

    public function MasterPoStatus(Request $request)
    {
        $batchSetting = BatchSetting::find($request->id);
        $batchSetting->master_po = $request->is_active;
        $batchSetting->save();
        return responseJson(true, 'Batch Master PO Status updated successfully', null);
    }

    public function exportBatch(Request $request){
        Session::put('id', $request->id);
        return responseJson(true, 'Batch orders exported successfully', null);
    }
    public function downloadBatch(Request $request)
    {
        $id = Session::get('id');
        $batchItems = BatchItem::where('batch_id', $id)->get();
        return Excel::download(new BatchExport($batchItems), 'batch_order.csv');
    }
}
