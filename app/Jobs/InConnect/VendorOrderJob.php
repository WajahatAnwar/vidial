<?php

namespace App\Jobs\InConnect;

use App\Traits\GeneralTrait;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use App\Traits\InConnect\VendorTrait;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class VendorOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, VendorTrait, GeneralTrait;

    public $timeout = 600;
    public $tries = 2;

    private $data;
    private $user;
    private $inconnectOrder;
    private $order;
    private $vendor;
    private $gooselyRule;
    private $onlyTest;
    private $oneTimeDecorator;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($user, $data, $inconnectOrder, $order, $vendor, $gooselyRule, $onlyTest = false, $oneTimeDecorator)
    {
        $this->onQueue('que_orders');

        $this->user = $user;
        $this->data = $data;
        $this->inconnectOrder = $inconnectOrder;
        $this->order = $order;
        $this->vendor = $vendor;
        $this->gooselyRule = $gooselyRule;
        $this->onlyTest = $onlyTest;
        $this->oneTimeDecorator = $oneTimeDecorator;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->inconnectOrder->is_archived)
            return;

        $update = $this->inconnectOrder->updates()->updateOrCreate([
            'name' => 'Purchase Order for ' . $this->vendor->name,
            'type' => 'sent_to_vendor'
        ], [
            'initiated_at' => now()
        ]);

        $user = $this->user;
        $shopifyOrder = $this->data;
        $order = $this->order;
        $vendor = $this->vendor;
        $gooselyRule = $this->gooselyRule;
        $onlyTest = $this->onlyTest;
        $oneTimeDecorator = $this->oneTimeDecorator;

        $this->updateOrderEntry($shopifyOrder->name, $user->id, 'vendorOrderJob');

        // Log::info(json_encode($vendor));

        $ignored_products = $user->inconnect_account->ignored_products;
        $final_ignored_list = [];
        foreach ($ignored_products as $ignored_product) {
            array_push($final_ignored_list, $ignored_product->product_origin->product_id);
        }

        $ignored_product_types = $user->inconnect_account->ignored_product_types;
        $final_ignored_product_type_list = [];
        foreach ($ignored_product_types as $ignored_product_type) {
            array_push($final_ignored_product_type_list, $ignored_product_type->name);
        }

        $line_items = [];
        $sage_items = [];
        $color = '';
        $size = '';

        $direct_check = $user->inconnect_account->direct_vendors()->where('vendor_id', $vendor->id)->first();

        if ($user->inconnect_account->decorators()->first()->vendor_stock_status) {
            $user->inconnect_account->decorators()->first()->vendor_stocks()->get()->each(function ($item_inside) use (&$direct_check, $vendor) {
                if ($item_inside->shopify_vendor->name == $vendor->name)
                    $direct_check = true;
            });
        }

        $vendor_process = $user->inconnect_account->vendor_sync;

        foreach ($order['body']['data']['order']['lineItems']['edges'] as $item) {

            if (in_array($item['node']['product']['legacyResourceId'], $final_ignored_list)) {
                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Product is in ignored list for Order ' . $shopifyOrder->name,
                ]);
                continue;
            }

            if (in_array($item['node']['product']['productType'], $final_ignored_product_type_list)) {
                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Ignored Product ' . $item['node']['product']['productType'] . ' Type for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                continue;
            }

            if (!in_array($item['node']['product']['vendor'], $vendor->shopifyVendors()->pluck('name')->toArray())) {
                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Product vendor ' . $item['node']['product']['vendor'] . ' is not supported for Order ' . $shopifyOrder->name,
                ]);
                continue;
            }

            $line_item['lineNumber'] = $item['node']['variant']['sku'];
            $line_item['description'] = $item['node']['title'];
            $line_item['lineType'] = 'New';
            // $line_item['lineItemTotal'] = $item['node']['variant']['price'];
            $line_item['allowPartialShipments'] = false;
            $line_item['ToleranceDetails'] = [
                "tolerance" => "AllowUnderrun",
            ];
            foreach ($item['node']['variant']['selectedOptions'] as $option) {
                if ($option['name'] == 'Color') {
                    $color = $option['value'];
                }
                if ($option['name'] == 'Size') {
                    $size = $option['value'];
                }
            }

            $sku = $item['node']['variant']['sku'];

            // logger("JANGO: " . json_encode($item['node']['variant']));

            $barcode = $item['node']['variant']['barcode'];

            if (str_contains($sku, '-')) {
                $sku = explode('-', $sku);
                $sku = $sku[0];
            }

            if ($direct_check) {
                $line_item['lineItemTotal'] = 0;
                $partId = '';
            } else {
                if (!$shopifyOrder->shipping_address && $shopifyOrder->billing_address) {
                    $shopifyOrder->shipping_address = $shopifyOrder->billing_address;
                }
                // logger("CHECKING 0: " . json_encode([$sku, $color, $size, $this->inconnectOrder, $barcode, $vendor, $shopifyOrder->shipping_address->province_code]));
                $partData = $this->getVendorPartId($sku, $color, $size, $this->inconnectOrder, $barcode, $vendor, $shopifyOrder->shipping_address->province_code);
                // logger("PART: " . json_encode($partData));
                $line_item['lineItemTotal'] = $partData['price'];
                $partId = $partData['partId'];
            }

            $line_item['PartArray'] = [
                "Part" => [
                    "partId" => $partId,
                    "customerSupplied" => false,
                    "Quantity" => [
                        'value' => $item['node']['quantity'],
                        'uom' => 'EA',
                    ],
                ],
            ];
            $line_item['productItemNumber'] = $item['node']['variant']['sku'];
            $line_item['quantity'] = $item['node']['quantity'];
            $line_items[] = $line_item;
            $sage_item['item_id'] = $this->replaceSkuWithIntactItemId($item['node']['variant']['sku']);
            $sage_item['quantity'] = $item['node']['quantity'];
            $sage_item['price'] = $line_item['lineItemTotal'];
            $sage_item['location_id'] = $vendor->intactLocation->location_id;
            $sage_item['department_id'] = $vendor->intactDepartment->department_id;
            $sage_item['class_id'] = $user->inconnect_account->intact_class->class_id;
            $sage_items[] = $sage_item;
        }

        if (count($line_items) <= 0 && $vendor_process) {

            !$update->completed_at && $update->update([
                'completed_at' => now(),
                'failed_at' => null,
                'tries' => $update->tries + 1
            ]);

            $this->inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'No Line Items to Sync for Order ' . $shopifyOrder->name . " for vendor.",
            ]);
            return;
        }

        $shipping_method = $vendor->shipping_method;

        if ($shipping_method) {
            $shipping_method = explode('-', $shipping_method);
        } else {
            $this->inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => "Shipping Method is not set for Order " . $shopifyOrder->name . " for vendor.",
            ]);
            return;
        }

        $decorator = $user->inconnect_account->decorators()->first();

        $purchaseOrderData = [
            'orderType' => 'Blank',
            'orderNumber' => $vendor->po_prefix . removeHash($shopifyOrder->name),
            'totalAmount' => $order['body']['data']['order']['subtotalPriceSet']['presentmentMoney']['amount'],
            'orderDate' => Carbon::now()->format('Y-m-d\TH:i:s.u'),
            'rush' => false,
            'currency' => $order['body']['data']['order']['subtotalPriceSet']['presentmentMoney']['currencyCode'],
            'ShipmentArray' => [
                'Shipment' => [
                    'ShipTo' => [
                        'shipmentId' => "",
                        'ContactDetails' => [
                            'attentionTo' => $vendor->po_prefix . $shopifyOrder->name,
                            'address1' => $decorator->address->address_line_1,
                            'address2' => $decorator->address->address_line_2,
                            'city' => $decorator->address->city,
                            'region' => $decorator->address->state,
                            'companyName' => $decorator->name,
                            'phone' => "800-362-7643",
                            'email' => "ccintacct@clubcolors.com",
                            'country' => "US",
                            'postalCode' => $decorator->address->zip_code,
                        ],
                        'customerPickup' => false,
                    ],
                    'packingListRequired' => false,
                    'blindShip' => false,
                    'allowConsolidation' => true,
                    'FreightDetails' => [
                        'carrier' => $shipping_method[0] ?? '',
                        'service' => $this->vendor->name == 'Alpha' ? 'Surface' : $shipping_method[1],
                    ],
                ],
            ],
            'LineItemArray' => [
                'LineItem' => $line_items,
            ],
            'termsAndConditions' => 'termsAndConditions',
        ];

        if ($vendor->name == "Piranha Brands" || $vendor->name == "Scrub Authority") {
            $purchaseOrderData['OrderContactArray'] = [
                'Contact' => [
                    'contactType' => 'Sales',
                    'ContactDetails' => [
                        'attentionTo' => $vendor->po_prefix . $shopifyOrder->name,
                        'address1' => "2000 Center Drive",
                        'address2' => "East D315",
                        'city' => "Hoffman Estates",
                        'region' => "IL",
                        'companyName' => "Club Colors",
                        'phone' => "847-490-3636",
                        'email' => "ccintacct@clubcolors.com",
                        'country' => "US",
                        'postalCode' => "60192",
                    ],
                ]
            ];
        }

        if ($onlyTest) {
            logger("MAIN FLOW: 1" . json_encode($purchaseOrderData, JSON_PRETTY_PRINT));
        }

        if (!$direct_check) {
            if ($user->inconnect_account->vendor_sync && !(isset($gooselyRule['rule']['shopifyOrder']) && $gooselyRule['rule']['shopifyOrder']) && !$onlyTest) {
                if ($this->inconnectOrder->vendorPurchaseOrders()->where('vendor_id', $vendor->id)->exists()) {
                    $this->inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'priority' => TRUE,
                        'description' => 'The purchase order for ' . $shopifyOrder->name . ' is already placed to ' . $this->vendor->name . ' vendor.',
                    ]);

                    $update->update([
                        'completed_at' => now(),
                        'failed_at' => null,
                        'tries' => $update->tries + 1
                    ]);

                    $oneTimeDecorator && $this->decideDecorator($user, $shopifyOrder, $this->inconnectOrder, $order, $gooselyRule, false, $onlyTest);
                } else {
                    $response = $this->sendPo($purchaseOrderData, $this->inconnectOrder, $vendor);
                    // logger()->info(json_encode($response, JSON_PRETTY_PRINT));
                    if (!$response) {
                        $this->inconnectOrder->logs()->create([
                            'user_id' => $user->id,
                            'priority' => TRUE,
                            'description' => 'The Part ID for one of the products in Order ' . $shopifyOrder->name . ' is currently unavailable. As the order is not sent to vendor so it will also not sent to decorator.',
                        ]);

                        !$update->completed_at && $update->update([
                            'failed_at' => now(),
                            'tries' => $update->tries + 1
                        ]);

                        // return;
                    } else {
                        if (isset($response->transactionId)) {
                            $purchaseOrder = $this->inconnectOrder->vendorPurchaseOrders()->updateOrCreate([
                                'po_number' => $response->transactionId,
                                'purchase_order_no' => $purchaseOrderData['orderNumber'],
                                'vendor_id' => $vendor->id,
                            ]);
                            $this->inconnectOrder->update([
                                'vendor_sent' => true,
                                'vendor_order_id' => $this->inconnectOrder->vendor_order_id ? $this->inconnectOrder->vendor_order_id . ', ' . $response->transactionId : $response->transactionId
                            ]);

                            $update->update([
                                'completed_at' => now(),
                                'failed_at' => null,
                                'tries' => $update->tries + 1
                            ]);

                            $oneTimeDecorator && $this->decideDecorator($user, $shopifyOrder, $this->inconnectOrder, $order, $gooselyRule, false, $onlyTest);
                        } else {

                            if (!$update->completed_at && strpos(@$response->ServiceMessageArray->ServiceMessage->description, "PO already exists") !== false) {
                                $update->update([
                                    'completed_at' => now(),
                                    'failed_at' => null,
                                    'tries' => $update->tries + 1
                                ]);
                                $oneTimeDecorator && $this->decideDecorator($user, $shopifyOrder, $this->inconnectOrder, $order, $gooselyRule, false, $onlyTest);
                            }

                            !$update->completed_at && $update->update([
                                'failed_at' => now(),
                                'tries' => $update->tries + 1
                            ]);

                            // return;
                        }
                    }
                }
            } else {

                if (!$user->inconnect_account->vendor_sync) {
                    $this->inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'type' => 'info',
                        'description' => 'Vendor Sync is off for Order ' . $shopifyOrder->name,
                    ]);
                } else {
                    // logger("RULE CODE: VENDOR CANCELLED");
                }

                $update->update([
                    'completed_at' => now(),
                    'failed_at' => null,
                    'tries' => $update->tries + 1
                ]);
                $oneTimeDecorator && $this->decideDecorator($user, $shopifyOrder, $this->inconnectOrder, $order, $gooselyRule, false, $onlyTest);
            }
        } else {
            $this->inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'type' => 'info',
                'description' => 'Vendor (' .  $vendor->name . ') is set to directly sent to Decorator for Order ' . $shopifyOrder->name,
            ]);

            $update->update([
                'completed_at' => now(),
                'failed_at' => null,
                'tries' => $update->tries + 1
            ]);

            $oneTimeDecorator && $this->decideDecorator($user, $shopifyOrder, $this->inconnectOrder, $order, $gooselyRule, false, $onlyTest);
        }

        $payload = [
            'due_date' => now()->addDays(15)->format('Y-m-d'),
            'vendor_id' => $vendor->intactVendor->vendor_id,
            'reference_no' => removeHash($shopifyOrder->name),
            'document_no' => $vendor->po_prefix . removeHash($shopifyOrder->name),
            'line_items' => $sage_items
        ];

        if ($onlyTest) {
            logger("MAIN FLOW: 2" . json_encode($payload, JSON_PRETTY_PRINT));
        }

        if ($user->inconnect_account->intact_sync) {
            if (!$this->inconnectOrder->vendor_intact_sent || 1) {
                $check_one = "";
                $check_two = "";
                if ($shopifyOrder->financial_status)
                    $check_one = $user->inconnect_account->statuses->where("financial_status_" . $shopifyOrder->financial_status, true)->first();
                if ($shopifyOrder->fulfillment_status && $shopifyOrder->fulfillment_status != "fulfilled")
                    $check_two = $user->inconnect_account->statuses->where("fulfillment_status_" . $shopifyOrder->fulfillment_status, true)->first();

                $no_intact_for_vendor_stock = false;
                $decorator = $user->inconnect_account->decorators()->first();
                $decorator->vendor_stocks()->get()->each(function ($item_inside) use (&$no_intact_for_vendor_stock, $item) {
                    // logger(json_encode($item_inside));
                    if ($item_inside->shopify_vendor->name == $item['node']['product']['vendor'])
                        $no_intact_for_vendor_stock = true;
                });

                if (($check_one || $check_two) && !(isset($gooselyRule['rule']['intacctOrder']) && $gooselyRule['rule']['intacctOrder']) && !$no_intact_for_vendor_stock) {
                    IntacctOrderCreateJob::dispatch($payload, $vendor->name . '|vendor', $this->inconnectOrder, @$purchaseOrder, null, null, $onlyTest);
                } else {
                    // logger("RULE CODE: INTACCT ORDER FOR VENDOR CANCELLED");
                    // logger("Intacct order is not sent due to stock vendors");
                }
            }
        } else {
            $this->inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'Intacct Sync (for Vendor) Disabled for Store ' . $user->name . ' for Order ' . $shopifyOrder->name,
            ]);
            // return;
        }
    }
}
