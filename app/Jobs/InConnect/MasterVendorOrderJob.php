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
use Illuminate\Support\Str;
use App\Models\InConnect\Decorator;

class MasterVendorOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, VendorTrait, GeneralTrait;

    public $timeout = 600;
    public $tries = 2;

    private $vendorItems;
    private $intacctItems;
    private $vendor;
    private $batch;
    private $currency;
    private $totalAmount;
    private $ordersReferences;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($vendorItems, $intacctItems, $vendor, $batch, $currency, $totalAmount, $ordersReferences)
    {
        $this->onQueue('que_orders');

        $this->vendorItems = $vendorItems;
        $this->intacctItems = $intacctItems;
        $this->vendor = $vendor;
        $this->batch = $batch;
        $this->currency = $currency;
        $this->totalAmount = $totalAmount;
        $this->ordersReferences = $ordersReferences;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $vendorItems = $this->vendorItems;
        $intacctItems = $this->intacctItems;
        $vendor = $this->vendor;
        $batch = $this->batch;
        $currency = $this->currency;
        $totalAmount = $this->totalAmount;

        $masterPoName = '_MasterPO_Batch-' . $batch->id;

        $update = $batch->updates()->updateOrCreate([
            'name' => 'Purchase Order for ' . $this->vendor->name,
            'type' => 'sent_to_vendor'
        ], [
            'initiated_at' => now()
        ]);
 
        $decorator = Decorator::where('name', 'Idex')->first();

        $shipping_method = $vendor->shipping_method;

        if ($shipping_method) {
            $shipping_method = explode('-', $shipping_method);
        } else {
            $this->inconnectOrder->logs()->create([
                'priority' => TRUE,
                'description' => "Shipping Method is not set for Order " . $shopifyOrder->name . " for vendor.",
            ]);
            return;
        }

        $purchaseOrderData = [
            'orderType' => 'Blank',
            'orderNumber' => $vendor->po_prefix . removeHash($masterPoName),
            'totalAmount' => $totalAmount,
            'orderDate' => Carbon::now()->format('Y-m-d\TH:i:s.u'),
            'rush' => false,
            'currency' => $currency,
            'ShipmentArray' => [
                'Shipment' => [
                    'ShipTo' => [
                        'shipmentId' => "",
                        'ContactDetails' => [
                            'attentionTo' => $vendor->po_prefix . $masterPoName,
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
                'LineItem' => $vendorItems,
            ],
            'termsAndConditions' => 'termsAndConditions',
        ];

        if ($vendor->name == "Piranha Brands" || $vendor->name == "Scrub Authority") {
            $purchaseOrderData['OrderContactArray'] = [
                'Contact' => [
                    'contactType' => 'Sales',
                    'ContactDetails' => [
                        'attentionTo' => $vendor->po_prefix . $masterPoName,
                        'address1' => "2000 Center Drive",
                        'address2' => "East D315",
                        'city' => "Hoffman Estates",
                        'region' => "IL",
                        'companyName' => "Club Colors",
                        'phone' => "847-490-3636",
                        'email' => "ccintacct@clubcolors.com ",
                        'country' => "US",
                        'postalCode' => "60192",
                    ],
                ]
            ];
        }

        if ($batch->po_number) {
            $batch->logs()->create([
                'priority' => TRUE,
                'description' => 'The purchase order for ' . $masterPoName . ' is already placed to ' . $this->vendor->name . ' vendor.',
            ]);
    
            $update->update([
                'completed_at' => now(),
                'failed_at' => null,
                'tries' => $update->tries + 1
            ]);
        } else {
            $response = $this->sendPo($purchaseOrderData, null, $vendor);
            // logger()->info(json_encode($response, JSON_PRETTY_PRINT));
            if (!$response) {
                $batch->logs()->create([
                    'priority' => TRUE,
                    'description' => 'The Part ID for one of the products in Order ' . $masterPoName . ' is currently unavailable. As the order is not sent to vendor so it will also not sent to decorator.',
                ]);
    
                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1
                ]);
    
            } else {
                if (isset($response->transactionId)) {
                    $batch->update([
                        'po_number' => $response->transactionId,
                        'purchase_order_no' => $purchaseOrderData['orderNumber'],
                    ]);
    
                    $update->update([
                        'completed_at' => now(),
                        'failed_at' => null,
                        'tries' => $update->tries + 1
                    ]);
                } else {

                    if (!$update->completed_at && strpos(@$response->ServiceMessageArray->ServiceMessage->description, "PO already exists") !== false || !$update->completed_at && strpos(@$response->ServiceMessageArray->ServiceMessage->description, "Duplicated transaction detected") !== false) {
                        
                        $update->update([
                            'completed_at' => now(),
                            'failed_at' => null,
                            'tries' => $update->tries + 1
                        ]);
                        
                        $batch->update([
                            'purchase_order_no' => $purchaseOrderData['orderNumber'],
                        ]);
                    }
    
                    !$update->completed_at && $update->update([
                        'failed_at' => now(),
                        'tries' => $update->tries + 1
                    ]);
                }
            }
        }

        $payload = [
            'due_date' => now()->addDays(15)->format('Y-m-d'),
            'vendor_id' => $vendor->intactVendor->vendor_id,
            // 'reference_no' => removeHash($masterPoName),
            'reference_no' => implode(', ', $this->ordersReferences),
            'document_no' => $vendor->po_prefix . removeHash($masterPoName),
            'line_items' => $intacctItems
        ];
        
        IntacctOrderCreateJob::dispatch($payload, $vendor->name . '|vendor', null, null, null, null, false, false, $batch);
    }
}
