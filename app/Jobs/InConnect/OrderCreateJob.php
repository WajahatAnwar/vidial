<?php

namespace App\Jobs\InConnect;

use App\Models\AllInOne\ProductVariant;
use App\Models\InConnect\BatchItem;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use App\Models\InConnect\InconnectOrder;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Models\InConnect\ShopifyVendorVendor;
use App\Models\InConnect\ShopifyShippingField;
use App\Models\InConnect\GooselyRule;
use App\Traits\GeneralTrait;
use App\Models\InConnect\BatchSetting;
use App\Traits\InConnect\VendorTrait;

class OrderCreateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, GeneralTrait ,VendorTrait;

    public $timeout = 600;
    public $tries = 2;

    private $payload;
    private $user;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($user, $payload)
    {
        $this->onQueue('que_orders');
        $this->payload = $payload;
        $this->user = $user;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $payload = $this->payload;
        $user = $this->user;

        // NULL CUSTOMER CHECK
        if(!$payload->customer) {
            $this->updateOrderEntry($payload->name, $user->id, 'noCustomer');
            return true;
        }

        $order = $this->graphQLOrderResponse($payload->id, $user);
        // Log::info("GENERAL ORDER" . json_encode($order));

        foreach ($payload->shipping_lines as $key => $shipping) {
            if ($shipping->source && $shipping->title) {
                ShopifyShippingField::updateOrCreate([
                    'source' => $shipping->source,
                    'title' => $shipping->title,
                ]);
            }
        }

        $decorator = $user->inconnect_account->decorators()->first();
        $is_vip = false;
        if (
            $decorator->pivot->vip_customers &&
            $payload->customer &&
            (str_contains($payload?->customer?->tags, 'vip') || str_contains($payload?->customer?->tags, 'VIP'))
        ) {
            $is_vip = true;
        }

        $inconnectOrder = InconnectOrder::updateOrCreate([
            'shopify_order_id' => $payload->id,
        ], [
            'user_id' => $user->id,
            'inconnect_account_id' => $user->inconnect_account->id,
            'shopify_customer_id' => $payload->customer->id,
            'shopify_customer_name' => $payload->customer->first_name . " " . $payload->customer->last_name,
            'shopify_order_id' => $payload->id,
            'shopify_order_no' => $payload->order_number,
            'shopify_order_name' => $payload->name,
            'is_vip' => $is_vip,
        ]);

        $inconnectOrder->updates()->where('type', 'received')->delete();
        $inconnectOrder->updates()->create([
            'name' => 'Received from Shopify',
            'type' => 'received',
            'initiated_at' => now(),
            'completed_at' => now(),
            'failed_at' => null,
            'tries' => 1
        ]);

        $this->updateOrderEntry($payload->name, $user->id, 'orderCreateJob', $inconnectOrder->id);

        $riskLevel = $order['body']['data']['order']['risk']['assessments'][0]['riskLevel'];
        $fraud_statuses = $user->inconnect_account->fraud_statuses;
        if ($fraud_statuses->{strtolower($riskLevel)} && in_array($riskLevel, ["LOW", "MEDIUM", "HIGH"]) && $inconnectOrder->fraud_status != "APPROVED") {
            $inconnectOrder->update(['fraud_status' => "FRAUD"]);
            $storeName = $user->store_name ? $user->store_name : $user->name;
            $inconnectOrder->logs()->create(['user_id' => $user->id, 'priority' => TRUE, 'description' => "Fraudulent Order Detected for Store $storeName"]);
            $this->updateOrderEntry($payload->name, $user->id, 'fraudOrderTwo');
            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'Order is considered fraud by second law for ' . $user->name . ' for Order ' . $payload->name,
            ]);
            return true;
        }

        $gooselyRule = $this->gooselyRuleProcess($order);
        // CANCELLATION DUE TO RULES OF GOOSELY
        if(isset($gooselyRule['rule']['shopifyOrder']) && $gooselyRule['rule']['shopifyOrder']) {
            $cancel_response = $user->api()->rest('post', '/admin/api/2024-01/orders/'. $payload->id . '/cancel.json', [
                "reason" => "Goosely Rules"
            ]);
            $this->updateOrderEntry($payload->name, $user->id, 'cancelByRule');
            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'Order is cancel by goosely rule for ' . $user->name . ' for Order ' . $payload->name,
            ]);
            return true;
            //   logger("RULE CODE: SHOPIFY ORDER CANCELLED");
        }

        if ($user->inconnect_account) {
            $lineItems = $order['body']['data']['order']['lineItems']['edges'];
            foreach ($payload->line_items as $key => $line_item) {

                $needIntacct = true;
                $variant = ProductVariant::with('product')->where('sku', $line_item->sku)->whereNull('intacct_item_id')->where('user_id', $user->id)->first();

                if($variant) {
                    // GETTING ITEM BY DATABASE FIRST. IF NOT FOUND THEN CREATE NEW ITEM
                    $db_found = ProductVariant::where('sku', $line_item->sku)->whereNotNull('intacct_item_id')->first();
                    if ($db_found) {
                        $variant->intacct_item_id = $db_found->intacct_item_id;
                        $variant->save();
                        $needIntacct = false;
                    }
                }

                if ($variant && $needIntacct) {
                    foreach ($lineItems[$key]['node']['variant']['selectedOptions'] as $option) {
                        if ($option['name'] == 'Color') {
                            $color = $option['value'];
                        }
                        if ($option['name'] == 'Size') {
                            $size = $option['value'];
                        }
                    }

                    $load = [
                        'vendor_name' => $line_item->vendor,
                        'title' => $line_item->name,
                        'item_id' => $line_item->sku,
                        'price' => $line_item->price,
                        'shipping_weight' => 0.00,
                        'brand' => '',
                        'subbrand' => '',
                        'category' => '',
                        'subcategory' => '',
                        'size1' => @$size,
                        'style' => '',
                        'color' => substr(@$color, 0, 30)
                    ];

                    $gooselyRuleInside = GooselyRule::with('product_type')->where(function ($q) use ($variant) {
                        $q->whereHas('product_type', function ($q) use ($variant) {
                            $q->where('name', $variant->product->product_type);
                        });
                    })->first();

                    if (!(isset($gooselyRuleInside['intacctOrder']) && $gooselyRuleInside['intacctOrder'])) {
                        IntacctProductCreateJob::dispatchSync($load, $variant->variant_id);
                    } else {
                        $inconnectOrder->logs()->create([
                            'user_id' => $user->id,
                            'priority' => TRUE,
                            'description' => 'Item not created on intacct by rule for ' . $user->name . ' for Order ' . $payload->name,
                        ]);
                    }
                }
            }
        }

        if ($user->inconnect_account->intact_sync) {
          if (!$inconnectOrder->intact_sales_order_id && !(isset($gooselyRule['rule']['intacctOrder']) && $gooselyRule['rule']['intacctOrder'])) {
            IntacctSalesOrderJob::dispatch($payload, $inconnectOrder);
          } else {
            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'Item sales order not created by goosely rule for ' . $user->name . ' for Order ' . $payload->name,
            ]);
          }
        } else {
            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'Intacct Sync (for Sales Order) Disabled for Store ' . $user->name . ' for Order ' . $payload->name,
            ]);
            // return;
        }

        if ($user->inconnect_account) {

            $lineItems = $order['body']['data']['order']['lineItems'];
            $lineItems = collect($lineItems['edges']);

            $vendors = $lineItems->groupBy('node.product.vendor');
            $excludedVendors = $user->inconnect_account->ignored_vendors->pluck('id')->toArray();
            $oneTimeDecorator = true;
            $vendors->each(function ($splitLineItems, $key) use ($user, $payload, $inconnectOrder, $order, $excludedVendors, $gooselyRule, &$oneTimeDecorator) {

                $order = json_decode(json_encode($order), true);
                $order['original'] = $order;
                $order['body']['data']['order']['lineItems']['edges'] = $splitLineItems->toArray();

                $shopifyVendor = ShopifyVendorVendor::whereNotIn('vendor_id', $excludedVendors)->whereHas('shopifyVendor', function ($q) use ($key, $excludedVendors) {
                    $q->where('name', $key);
                    $q->whereNotIn('id', $excludedVendors);
                })->with('vendor')->first();

                if ($shopifyVendor?->vendor) {

                    $batch = BatchSetting::where('batch_status', true)->where('vendor_id', $shopifyVendor->vendor->id)->first();
                    if ($batch) {
                        $orderLineItemsData = [];
                        $totalPrice = 0;
                        $vendor_batch = $batch->batches()->where('batch_status','unfulfilled')->latest()->first();
                        foreach ($splitLineItems as $itemInside) {

                            $skuInside = $itemInside['node']['variant']['sku'];
                            if (str_contains($skuInside, '-')) {
                                $skuInside = explode('-', $skuInside);
                                $skuInside = $skuInside[0];
                            }

                            $barcodeInside = $itemInside['node']['variant']['barcode'];
                            $vendorInside = $itemInside['node']['product']['vendor'];
                            $quantityInside = $itemInside['node']['quantity'];
                            $orderLineItemsData[] = [
                                'sku' => $skuInside,
                                'quantity' => $quantityInside
                            ];
                            $colorInside = null;
                            $sizeInside = null;

                            foreach ($itemInside['node']['variant']['selectedOptions'] as $optionInside) {
                                if ($optionInside['name'] == 'Color') {
                                    $colorInside = $optionInside['value'];
                                }
                                if ($optionInside['name'] == 'Size') {
                                    $sizeInside = $optionInside['value'];
                                }
                            }

                            // logger(json_encode([$skuInside, $colorInside, $sizeInside, $inconnectOrder, $barcodeInside, $shopifyVendor->vendor, $payload->shipping_address->province_code]));
                            $partDataInside = $this->getVendorPartId($skuInside, $colorInside, $sizeInside, $inconnectOrder, $barcodeInside, $shopifyVendor->vendor, $payload->shipping_address->province_code);
                            $totalPrice = (float) $totalPrice + ($partDataInside['price'] * $quantityInside);
                            // logger('single price :'.$partDataInside['price']);
                        }
                        $batchRecord = $vendor_batch->batchOrders()->create([
                            'inconnect_order_id' => $inconnectOrder->id,
                            'price' => $totalPrice
                        ]);
                        foreach($orderLineItemsData as $orderLineItemData) {
                            BatchItem::create([
                                'batch_id' => $batchRecord->batch->id,
                                'inconnect_order_id' => $inconnectOrder->id,
                                'sku' => $orderLineItemData['sku'],
                                'quantity' => $orderLineItemData['quantity']
                            ]);
                        }
                       
                        $inconnectOrder->batch_status = 'unfulfilled';
                        $inconnectOrder->save();
                    } else {
                        VendorOrderJob::dispatch($user, $payload, $inconnectOrder, $order, $shopifyVendor->vendor, $gooselyRule, false, $oneTimeDecorator);
                        $oneTimeDecorator = false;
                    }
                }
            });

            if ($oneTimeDecorator) {
                $order = json_decode(json_encode($order), true);
                $order['original'] = $order;
                $this->decideDecorator($user, $payload, $inconnectOrder, $order, $gooselyRule);
            }
        } else {
            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'Goosely Account status is off for Store ' . $user->name,
            ]);
            return;
        }
    }
}
