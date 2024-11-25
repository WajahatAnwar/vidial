<?php

namespace App\Jobs\InConnect;

use App\Models\InConnect\InconnectOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Traits\InConnect\IdexTrait;
use App\Traits\GeneralTrait;

class FulfillOrderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, GeneralTrait, IdexTrait;

    public $timeout = 600;
    public $tries = 2;
    private $order;
    private $idexToken;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(InconnectOrder $order, $idexToken)
    {
        $this->onQueue('que_orders');
        $this->order = $order;
        $this->idexToken = $idexToken;
    }

    private function getIdexPayload($user, $idexToken, $order)
    {
        //GETTING IDEX ITEMS DETAILS
        $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order->shopify_order_id . '.json');
        $shopifyOrder = $orderResponse['body']['order'];
        $orderInside = $this->graphQLOrderResponse($order->shopify_order_id, $user);
        $gooselyRule = $this->gooselyRuleProcess($orderInside);
        $orderInside = json_decode(json_encode($orderInside), true);
        $orderInside['original'] = $orderInside;
        return $this->idexLineItemsProcess($user, $shopifyOrder, $order, $orderInside, $gooselyRule, false, false, false, $idexToken);
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->order->is_archived)
            return;

        $user = $this->order->user;
        $idexToken = $this->idexToken;

        $update = $this->order->updates()->updateOrCreate([
            'name' => 'Fulfilled from Shopify',
            'type' => 'fulfilled'
        ], [
            'initiated_at' => now(),
        ]);

        $itemsList = false;
        if ($this->order->idex_payload) {
            $payload = json_decode($this->order->idex_payload);
            $itemsList = @$payload->line_items;
        } else {
            $payload = $this->getIdexPayload($user, $idexToken, $this->order);
            $itemsList = @$payload['payload']['line_items'];
        }

        $fulfillmentAPiResponse = $user->api()->rest('get', '/admin/api/2024-07/orders/' . $this->order->shopify_order_id . '/fulfillment_orders.json');
        // logger(json_encode($fulfillmentAPiResponse));
        foreach ($fulfillmentAPiResponse['body']['fulfillment_orders'] as $fulfillmentOrder) {
            $lineItemsArray = [];
            if ($fulfillmentOrder['status'] == 'open' || $fulfillmentOrder['status'] == 'in_progress') {
                foreach ($fulfillmentOrder['line_items'] as $lineItem) {
                    if ($lineItem['fulfillable_quantity'] > 0) {
                        if ($itemsList) {
                            // logger("using new logic");
                            // logger($lineItem['id']);
                            $exist_on_idex = collect($itemsList)->where('line_item_id', $lineItem['line_item_id'])->first();
                            // logger("FOUND: " . json_encode($exist_on_idex));
                            if ($exist_on_idex) {
                                // logger("using new logic done");
                                $lineItemsArray[] = [
                                    "id" => $lineItem['id'],
                                    "quantity" => $lineItem['fulfillable_quantity']
                                ];
                            }
                        } else {
                            !$update->completed_at && $update->update([
                                'failed_at' => now(),
                                'tries' => $update->tries + 1
                            ]);
                            $this->order->logs()->create([
                                'user_id' => $user->id,
                                'type' => 'info',
                                'description' => $this->order->shopify_order_name . "Idex payload not available neither Idex server is responding in fulfillment job."
                            ]);
                        }
                    }
                }
                $fulfillment = [
                    "line_items_by_fulfillment_order" => [
                        [
                            "fulfillment_order_id" => $fulfillmentOrder['id'],
                            "fulfillment_order_line_items" => $lineItemsArray
                        ]
                    ]
                ];
                // logger(json_encode($fulfillment));
                $fulfillmentResponse = $user->api()->rest('post', '/admin/api/2023-07/fulfillments.json', ["fulfillment" => $fulfillment]);
                // logger(json_encode($fulfillmentResponse));
                if ($fulfillmentResponse['status'] == 201) {
                    $update->update([
                        'completed_at' => now(),
                        'failed_at' => null,
                        'tries' => $update->tries + 1
                    ]);
                } else {
                    !$update->completed_at && $update->update([
                        'failed_at' => now(),
                        'tries' => $update->tries + 1
                    ]);
                }

                if ($this->order->idex_tracking_company && $this->order->idex_tracking_number) {
                    $trackingInfo = [
                        'notify_customer' => true,
                        'tracking_info' => [
                            'company' => $this->order->idex_tracking_company,
                            'number' => $this->order->idex_tracking_number,
                        ]
                    ];

                    // logger(json_encode(["fulfillment" => $trackingInfo]));
                    if (isset($fulfillmentResponse['body']['fulfillment'])) {
                        $trackingInfoResponse = $user->api()->rest('post', '/admin/api/2023-07/fulfillments/' . $fulfillmentResponse['body']['fulfillment']['id'] . '/update_tracking.json', ["fulfillment" => $trackingInfo]);
                        // logger(json_encode($trackingInfoResponse));
                    } 
                    // else
                    //     logger(json_encode($fulfillmentResponse));

                    if (isset($trackingInfoResponse['status'])) {
                        if ($trackingInfoResponse['status'] == 201) {
                            // logger('Tracking info updated for order ' . $this->order->shopify_order_id);
                        }
                    }
                }
            } else {
                $this->order->update([
                    "fulfillment_status" => "fulfilled"
                ]);
                $update->update([
                    'completed_at' => now(),
                    'failed_at' => null,
                    'tries' => $update->tries + 1
                ]);
                $this->order->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => $this->order->shopify_order_name . " Order Fulfilled because it was no more open on Shopify. It is manually done."
                ]);
            }
        }
    }
}
