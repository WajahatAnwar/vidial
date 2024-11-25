<?php

namespace App\Jobs\InConnect;

use App\Models\InConnect\InconnectLog;
use App\Traits\InConnect\IdexTrait;
use App\Traits\InConnect\IntacctTrait;
use App\Traits\InConnect\ScreenProTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Traits\GeneralTrait;

class IntacctOrderCreateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, IntacctTrait, IdexTrait, GeneralTrait, ScreenProTrait;

    public $timeout = 600;
    public $tries = 2;

    private $data;
    private $type;
    private $inconnectOrder;
    private $purchaseOrder;
    private $orderID;
    private $logID;
    private $onlyTest;
    private $idexToken;
    private $batch;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($data, $type, $inconnectOrder = null, $purchaseOrder = null, $orderID = null, $logID = null, $onlyTest = false, $idexToken = false, $batch = false)
    {
        $this->onQueue('que_orders');

        $this->data = $data;
        $this->type = $type;
        $this->inconnectOrder = $inconnectOrder;
        $this->purchaseOrder = $purchaseOrder;
        $this->orderID = $orderID;
        $this->logID = $logID;
        $this->onlyTest = $onlyTest;
        $this->idexToken = $idexToken;
        $this->batch = $batch;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->inconnectOrder && $this->inconnectOrder->is_archived)
            return;

        if ($this->logID) {
            $to_be_deleted = InconnectLog::find($this->logID);
            if ($to_be_deleted)
                $to_be_deleted->delete();
        }

        $payload = $this->data;

        // Log::info(json_encode($payload));

        if (strpos($this->type, 'vendor') !== false) {

            if ($this->inconnectOrder)
                $this->updateOrderEntry($this->inconnectOrder->shopify_order_name, $this->inconnectOrder->user_id, 'intacctOrderCreateJobVendor');

            $type = explode("|", $this->type);
            $vendor_name = $type[0];

            if($this->inconnectOrder) {
                $update = $this->inconnectOrder->updates()->updateOrCreate([
                    'name' => 'Intacct Purchase Order for ' . $vendor_name,
                    'type' => 'sent_to_intacct_for_vendor'
                ], [
                    'initiated_at' => now()
                ]);
            } else if($this->batch) {
                $update = $this->batch->updates()->updateOrCreate([
                    'name' => 'Intacct Purchase Order for ' . $vendor_name,
                    'type' => 'sent_to_intacct_for_vendor'
                ], [
                    'initiated_at' => now()
                ]);
            }

            if ($this->onlyTest) {
                logger("MAIN FLOW: 4" . json_encode($payload, JSON_PRETTY_PRINT));
                return true;
            }

            $order = $this->createPurchaseOrder($payload);
            // logger()->info(json_encode($order, JSON_PRETTY_PRINT));

            if (isset($order['operation']['result']['key'])) {
                if ($this->purchaseOrder) {
                    $this->purchaseOrder->update([
                        'intact_po_number' => $order['operation']['result']['key'],
                        'intact_payload' => $payload
                    ]);
                } else if($this->batch) {
                    $this->batch->update([
                        'intacct_po_number' => $order['operation']['result']['key'],
                        'intacct_payload' => $payload
                    ]);
                }

                if($this->inconnectOrder) {
                    $this->inconnectOrder->update([
                        'vendor_intacct_order_id' => $this->inconnectOrder->vendor_intacct_order_id ? $this->inconnectOrder->vendor_intacct_order_id . ', ' . $order['operation']['result']['key'] : $order['operation']['result']['key']
                    ]);
                }
                
                $update->update([
                    'completed_at' => now(),
                    'failed_at' => null,
                    'tries' => $update->tries + 1
                ]);
            } else {

                if (strpos(@$order['operation']['result']['errormessage']['error'][0]['description2'], "is already used") !== false) {
                    if ($this->purchaseOrder) {
                        $this->purchaseOrder->update([
                            'intact_po_number' => "Purchase Order-" . $payload['document_no'],
                            'intact_payload' => $payload
                        ]);
                    } else if($this->batch) {
                        $this->batch->update([
                            'intacct_po_number' => "Purchase Order-" . $payload['document_no'],
                            'intacct_payload' => $payload
                        ]);
                    }

                    $update->update([
                        'completed_at' => now(),
                        'failed_at' => null,
                        'tries' => $update->tries + 1
                    ]);
                }

                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1
                ]);
            }
        }

        if (strpos($this->type, 'decorator') !== false) {

            $this->updateOrderEntry($this->inconnectOrder->shopify_order_name, $this->inconnectOrder->user_id, 'intacctOrderCreateJobDecorator');

            $type = explode("|", $this->type);
            $decorator_name = $type[0];

            $update = $this->inconnectOrder->updates()->updateOrCreate([
                'name' => 'Intacct Purchase Order for ' . $decorator_name,
                'type' => 'sent_to_intacct_for_decorator'
            ], [
                'initiated_at' => now()
            ]);

            if (stripos($this->inconnectOrder->decorator->name, 'idex') !== false) {
                $access_token = !$this->idexToken ? $this->getAccessToken() : $this->idexToken;
                $response = Http::withToken($access_token)->post('https://portal.idexint.com/api/v1/orders/query', [
                    'customerID' => '46499100-dc6e-4617-baca-093fa787c15f',
                    'orderIDList' => [
                        "{$this->orderID}"
                    ]
                ]);
                $response_data = $response->json();
            }

            foreach ($payload['line_items'] as &$line_item) {
                if (stripos($this->inconnectOrder->decorator->name, 'idex') !== false) {
                    $order = $response_data[0];
                    if (isset($order['line_items'])) {
                        $foundLineItem = collect($order['line_items'])->firstWhere('productItemNumber', $line_item['item_id']);
                        if ($foundLineItem) {
                            $line_item['price'] = (float) $foundLineItem['poTotalPriceLine'] / (float) $line_item['quantity'];
                            $line_item['price'] = $line_item['price'];
                        }
                    }
                }

                if (stripos($this->inconnectOrder->decorator->name, 'screen pro graphics') !== false) {
                    $line_item['price'] = (float) $line_item['quantity'] * (float) $this->calculateSPPrice((float) $line_item['quantity'], $line_item['stitch_count'], $this->inconnectOrder->decorator);
                }
            }

            $payload['line_items'][] = [
                'item_id' => 'Fulfillment',
                'quantity' => 1,
                'price' => 3,
                'location_id' => $payload['line_items'][0]['location_id'],
                'department_id' => $payload['line_items'][0]['department_id'],
            ];

            if ($this->onlyTest) {
                logger("MAIN FLOW: 5" . json_encode($payload, JSON_PRETTY_PRINT));
                return true;
            }

            $order = $this->createPurchaseOrder($payload);

            if (isset($order['operation']['result']['key'])) {
                $this->inconnectOrder->update([
                    'decorator_intacct_order_id' => $order['operation']['result']['key'],
                ]);

                $update->update([
                    'completed_at' => now(),
                    'failed_at' => null,
                    'tries' => $update->tries + 1
                ]);

                $this->inconnectOrder->update(['decorator_intact_sent' => true]);
            } else {
                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1
                ]);
            }
        }

        // Log::info(json_encode(@$order, JSON_PRETTY_PRINT));
    }
}
