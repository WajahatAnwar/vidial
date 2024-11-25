<?php

namespace App\Http\Controllers\InConnect;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\InConnect\IdexTrait;
use App\Traits\InConnect\IntacctTrait;
use App\Traits\InConnect\ScreenProTrait;
use App\Traits\InConnect\VendorTrait;
use App\Traits\GeneralTrait;
use App\Models\InConnect\OrderEntry;
use App\Models\InConnect\InconnectOrder;
use App\Models\AllInOne\User;
use App\Jobs\InConnect\IntacctSalesOrderJob;
use App\Jobs\InConnect\IntacctVendorInvoiceJob;
use Illuminate\Support\Facades\Http;
use App\Jobs\InConnect\FulfillOrderJob;
use App\Jobs\InConnect\MasterVendorOrderJob;
use App\Jobs\InConnect\VendorOrderJob;
use App\Models\InConnect\Batch;
use App\Models\InConnect\BatchSetting;
use App\Models\InConnect\ShopifyVendorVendor;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Jobs\InConnect\OrderCreateJob;

class CronJobsController extends Controller
{
    use IdexTrait, IntacctTrait, GeneralTrait, ScreenProTrait, VendorTrait;

    private function missingIntacctPoDecorator()
    {
        // BELOW ARE THE IDEX ORDERS THAT ARE SENT BUT DOESN'T HAVE INCONNECT ORDER OR ITS ID
        $orders = OrderEntry::with('inconnectOrder')
            ->whereHasIn('inconnectOrder', function ($q) {
                $q->whereNull('decorator_intacct_order_id');
                $q->where('decorator_intact_sent', false);
            })
            ->whereHasIn('inconnectOrder.updates', function ($q) {
                $q->whereIn('name', [
                    'Purchase Order for SanMar',
                    'Purchase Order for Piranha Brands',
                    'Purchase Order for S&S Activewear',
                    'Purchase Order for Alpha'
                ]);
            })
            ->whereDoesntHaveIn('inconnectOrder.updates', function ($q) {
                $q->whereIn('name', [
                    'Intacct Purchase Order for Idex'
                ]);
            })
            ->where('idexOrderJob', '>', 0)
            ->whereNull('intacctOrderCreateJobDecorator')
            ->where('intacctStatus', '>', 0)
            ->get();

        $access_token = $this->getAccessToken();

        foreach ($orders as $key => $orderEntry) {
            $inconnectOrder = $orderEntry->inconnectOrder;
            $user = User::find($inconnectOrder->user_id);
            $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $inconnectOrder->shopify_order_id . '.json');

            if (isset($orderResponse['body']['order'])) {
                $shopifyOrder = $orderResponse['body']['order'];
                $order = $this->graphQLOrderResponse($inconnectOrder->shopify_order_id, $user);
                $gooselyRule = $this->gooselyRuleProcess($order);
                $order = json_decode(json_encode($order), true);
                $order['original'] = $order;
                $order = json_decode(json_encode($order), true);
                $order['original'] = $order;
                $this->decideDecorator($user, $shopifyOrder, $inconnectOrder, $order, $gooselyRule, false, false, false, $access_token);
            } else {
                // logger("This user is uninstalled or needs update" . json_encode($user));
            }
        }
    }

    private function missingPoDecorator()
    {
        // BELOW ARE THE DECORATORS ORDERS THAT HAVE MISSING PURHCASE ORDER AND INTACT PURCHASE ORDER FOR DECORATOR
        $orders = OrderEntry::with('inconnectOrder')
            ->whereHasIn('inconnectOrder.decorator', function ($q) {
                $q->whereIn('name', ['Idex', 'Screen Pro Graphics']);
            })
            ->whereDoesntHaveIn('inconnectOrder.updates', function ($q) {
                $q->whereIn('name', [
                    'Purchase Order for Screen Pro Graphics',
                    'Purchase Order for Club Colors Buyer LLC',
                    'Purchase Order for Idex'
                ]);
            })
            ->get();

        foreach ($orders as $key => $orderEntry) {
            $inconnectOrder = $orderEntry->inconnectOrder->updates()->updateOrCreate([
                'name' => 'Purchase Order for ' . $orderEntry->inconnectOrder->decorator->name,
                'type' => 'sent_to_decorator',
                'initiated_at' => now(),
                'failed_at' => now(),
                'tries' => 1
            ]);

            $request = new Request();
            $request->merge(['order_id' => $orderEntry->inconnectOrder->id]);
            $orderController = new OrderController();
            $orderController->restart($request);
        }
    }

    public function processValidator()
    {
        $this->missingIntacctPoDecorator();
        sleep(60);
        $this->missingPoDecorator();
    }

    public function processSalesInvoice()
    {
        $orders = InconnectOrder::where('fulfillment_status', 'fulfilled')->whereHas('updates', function ($q) {
            $q->where('type', 'intacct_sales_invoice')->whereNull('completed_at');
        })->get();

        foreach ($orders as $key => $order) {
            $user = User::find($order->user_id);
            $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order->shopify_order_id . '.json');
            if (isset($orderResponse['body']['order'])) {
                $shopifyOrder = $orderResponse['body']['order'];
                IntacctSalesOrderJob::dispatch($shopifyOrder, $order, 'Sales Invoice');
            } else {
                // logger("This user is uninstalled or needs update" . json_encode($user));
            }
        }
    }

    public function processVendorInvoices()
    {
        $orders = InconnectOrder::whereHas('updates', function ($q) {
            $q->where('type', 'intacct_vendor_invoice')->whereNull('completed_at');
        })->get();

        foreach ($orders as $key => $order) {
            $order->vendorPurchaseOrders->each(function ($order_inside) {
                IntacctVendorInvoiceJob::dispatch($order_inside);
            });
        }
    }

    private function updateIdexPoStatusFunctionality($inconnectOrders)
    {
        $access_token = $this->getAccessToken();

        $response = Http::withToken($access_token)->post('https://portal.idexint.com/api/v1/orders/query', [
            'customerID' => '46499100-dc6e-4617-baca-093fa787c15f',
            'purchaseOrderList' => $inconnectOrders->pluck('decorator_order_id')
        ]);

        try {
            $idexOrders = $response->json();
            foreach ($idexOrders as $idexOrder) {
                $inconnectOrder = $inconnectOrders->where('decorator_order_id', $idexOrder['purchaseOrder'])->first();
                if ($inconnectOrder) {

                    $inconnectOrder->update([
                        'idex_tracking_company' => isset($idexOrder['shipments'][0]['carrier']) ? $idexOrder['shipments'][0]['carrier'] : null,
                        'idex_tracking_number' => isset($idexOrder['shipments'][0]['tracking']) ? $idexOrder['shipments'][0]['tracking'] : null
                    ]);

                    if ($idexOrder['status'] == "Goods" || $idexOrder['status'] == "Production") { // Review

                        if (!$inconnectOrder->updates()->where('name', 'Received on Idex')->exists()) {
                            $inconnectOrder->updates()->create([
                                'name' => 'Received on Idex',
                                'type' => 'received_on_decorator',
                                'initiated_at' => now(),
                                'completed_at' => now(),
                                'failed_at' => null,
                                'tries' => 1
                            ]);
                        }
                    }

                    if ($idexOrder['status'] == "Shipped" || $idexOrder['status'] == "Closed") { // Canceled

                        if (!$inconnectOrder->updates()->where('name', 'Shipped from Idex')->exists()) {
                            $inconnectOrder->updates()->create([
                                'name' => 'Shipped from Idex',
                                'type' => 'shipped_from_decorator',
                                'initiated_at' => now(),
                                'completed_at' => now(),
                                'failed_at' => null,
                                'tries' => 1
                            ]);
                        }

                        FulfillOrderJob::dispatch($inconnectOrder, $access_token);
                    }
                }
            }
            return "Done!";
        } catch (\Exception $e) {
            Log::info($e->getMessage());
        }
    }

    public function updateIdexPoStatus()
    {
        // $inconnectOrders = InconnectOrder::where('shopify_order_name', "#24VLBP1055")->whereNotNull('decorator_order_id')->whereNull('fulfillment_status')->get();
        $inconnectOrders = InconnectOrder::whereNotNull('decorator_order_id')->whereNull('fulfillment_status')->get();
        $this->updateIdexPoStatusFunctionality($inconnectOrders);
        // $inconnectOrders = InconnectOrder::where('fulfillment_status','fulfilled')->whereNotNull('decorator_order_id')->whereNull('idex_tracking_company')->get();
        // $this->updateIdexPoStatusFunctionality($inconnectOrders);
    }

    private function fetchAllOrders($user, $date)
    {
        $allOrders = [];
        $hasNextPage = true;
        $orders_next = null;
        while ($hasNextPage) {
            $orders_next = $orders_next ? '"' . $orders_next . '"' : 'null';
            $query = <<<GRAPHQL
            {
                orders(first: 250, query: "created_at:>=$date", after:$orders_next) {
                    edges {
                        node {
                            legacyResourceId
                        }
                    }
                    pageInfo {
                        endCursor
                        hasNextPage
                    }
                }
            }
            GRAPHQL;
            $response = $user->api()->graph($query);
            if (isset($response['body']['data']['orders']['edges']) && count($response['body']['data']['orders']['edges']) > 0) {
                $orders = $response['body']['data']['orders']->toArray();
                $orders = removeNodesAndEdges($orders);
                foreach ($orders as $order) {
                    $allOrders[] = $order['legacyResourceId'];
                }
            } else {
                logger("USER NEEDS UPDATE: " . json_encode($user->name));
                // logger("ERROR PAYLOAD: " . json_encode($response));
                break;
            }

            $hasNextPage = $response['body']['data']['orders']['pageInfo']['hasNextPage'];
            $orders_next = $response['body']['data']['orders']['pageInfo']['endCursor'];
        }

        return $allOrders;
    }

    public function syncPreviousOrders(Request $request)
    {
        $users = User::when($request->get('user_id'), function ($q) use ($request) {
            $q->where('id', $request->user_id);
        })->whereHas('inconnect_account')->where('role_id', 2)->whereNotNull('password')->whereNull('deleted_at')->get();
        foreach ($users as $key => $user) {
            $filtered = $user->applications->where('id', 6)->first();
            // logger(json_encode($user));
            // logger(json_encode($filtered->pivot->status));
            if ($filtered->pivot->status) {
                $date = Carbon::now()->subDay(30)->startOfDay()->format("Y-m-d");
                $orders = $this->fetchAllOrders($user, $date);
                if (count($orders) > 0) {
                    // logger("ALL ORDER IDS: " . json_encode($orders));
                    $inconnect_account_date = $user->inconnect_account->created_at;
                    foreach ($orders as $orderId) {
                        $existing_order = InconnectOrder::where('user_id', $user->id)->where('shopify_order_id', $orderId)->first();
                        // logger("EXISTING ORDER: " . json_encode($existing_order));
                        if (!$existing_order) {
                            $myOrder =  $user->api()->rest('GET', '/admin/api/2024-04/orders/' . $orderId . '.json');
                            if ($myOrder['errors'] == false) {
                                // logger("EXISTING ORDER PLACED: " . $myOrder['body']['order']['name']);
                                $myOrder = $myOrder['body']['order'];
                                $orderController = new OrderController();
                                $orderController->realOrdersCreateJob($user, $myOrder);
                            } else {
                                // logger("CRON ORDER LOG: " . json_encode($myOrder));
                            }
                        }
                    }
                } else {
                    // logger("ORDERS LESS THAN 0: " . json_encode($orders));
                }
            }
        }

        return sendResponse(true, 'Orders Synced Successfully');
    }

    public function runBatchOrders()
    {
        $day = Carbon::today()->format('l'); // Get today's day in full format (e.g., Monday)

        $vendorBatches = BatchSetting::where('batch_status', '1')->whereHas('batches',)->with(['batches' => function ($query) {
            $query->where('batch_status', 'unfulfilled')->latest(); // Get only the latest batch
        }, 'batches.batchOrders'])->where('batch_day', $day)->get();

        foreach ($vendorBatches as $vendorBatch) {

            $latestBatch = $vendorBatch->batches->take(1);
            $latestBatch = $latestBatch[0];

            $orderSum = $latestBatch->batchOrders->sum('price');

            if ($orderSum >= $latestBatch->batchSetting->batch_threshold) {

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

                $running_batch = $latestBatch;
                $running_batch->update([
                    'batch_status' => 'fulfilled'
                ]);

                Batch::create([
                    'batch_setting_id' => $vendorBatch->id,
                    'batch_status' => 'unfulfilled'
                ]);
            } 
            // else 
            // {

            //     foreach ($latestBatch->batchOrders as $key => $oneOrder) {
            //         $inconnect_order = $oneOrder->inconnectOrder;
            //         $days = Carbon::parse($inconnect_order->created_at)->diffInDays(Carbon::now());
            //         if ($days >= $oneOrder->batch->batchSettings->days_count) {
            //             $user = $inconnect_order->user;
            //             $excludedVendors = $user->inconnect_account->ignored_vendors->pluck('id')->toArray();
            //             $shopifyVendorFound = ShopifyVendorVendor::whereNotIn('vendor_id', $excludedVendors)
            //                 ->whereHas('shopifyVendor', function ($q) use ($order, $excludedVendors, $latestBatch) {
            //                     $q->where('name', $latestBatch->batchSetting->vendor->name); // Assuming $key should be $order->vendor_name
            //                     $q->whereNotIn('id', $excludedVendors);
            //                 })
            //                 ->with('vendor')
            //                 ->first();

            //             $shopifyOrderData = $this->graphQLOrderResponse($inconnect_order->shopify_order_id, $user);

            //             $shopifyOrder = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $inconnect_order->shopify_order_id . '.json');

            //             $gooselyRule = $this->gooselyRuleProcess($shopifyOrderData);

            //             if ($shopifyVendorFound?->vendor) {
            //                 VendorOrderJob::dispatch($user, $shopifyOrder['body']['order'], $inconnect_order, $shopifyOrderData, $shopifyVendorFound->vendor, $gooselyRule, false, false);
            //                 $oneOrder->sent_by = 'manual';
            //                 $oneOrder->save();
            //             }
            //         }
            //     }
            // }
        }
    }
}
