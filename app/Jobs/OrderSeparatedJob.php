<?php

namespace App\Jobs\AllInOne;

use App\Models\AllInOne\Order;
use App\Models\AllInOne\OrderLineItem;
use App\Models\AllInOne\Refund;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class OrderSeparatedJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;
    public $tries = 2;

    /**
     * Create a new job instance.
     *
     * @return void
     */

    public $order = "";
    public $user = "";

    public function __construct($order, $user)
    {
        $this->order = $order;
        $this->user = $user;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $order = $this->order;
        $user = $this->user;

        // Log::info(json_encode("ORDER SEPARATED" . $order->name));

        $current_order = Order::updateOrCreate(
            [
                'order_id' => $order->id,
            ],
            [
                'order_name' => $order->name,
                'customer_id' => isset($order->customer) ? $order->customer->id : NULL,
                'user_id' => $user->id,
                'email' =>  $order->email,
                'contact_email' =>  $order->contact_email,
                'phone_no' => $order->phone,
                'order_created_at' => $order->created_at,
                'customer_name' => isset($order->customer) ? $order->customer->first_name . " " . $order->customer->last_name : NULL,
                'total' => $order->subtotal_price,
                'final_total' => $order->total_price,
                'payment_status' => $order->financial_status,
                'fulfillment_status' => $order->fulfillment_status
            ]
        );

        $response8 = $user->api()->rest('GET', '/admin/api/2023-04/orders/' . $order->id . '/refunds.json');

        if ($response8['errors'] == false) {

            // Log::info(json_encode("REFUNDS", $response8['errors']));

            if (count($response8['body']['refunds']) > 0) {
                foreach ($response8['body']['refunds'] as $key9 => $refund) {

                    $refund_amount = 0;

                    foreach ($refund->refund_line_items as $key10 => $refund_item) {
                        $refund_amount = $refund_amount + $refund_item->subtotal;
                    }

                    // Log::info(json_encode("ORDER REFUND" . $refund_amount));

                    Refund::updateOrCreate(
                        [
                            'refund_id' => $refund->id,
                        ],
                        [
                            'user_id' => $user->id,
                            'local_order_id' => $current_order->id,
                            'order_id' => $order->id,
                            'refund_note' => $refund->note,
                            'refund_amount' => $refund_amount,
                        ]
                    );
                }
            }
        } else {
            sendApiLog(false, 'API RESPONSE', $response8);
            // DB::commit();
            // return true;
        }

        foreach ($order->line_items as $key9 => $line_item) {

            // Log::info(json_encode("ORDER LINE ITEM" . $line_item->name));

            OrderLineItem::updateOrCreate(
                [
                    'line_item_id' => $line_item->id,
                ],
                [
                    'user_id' => $user->id,
                    'local_order_id' => $current_order->id,
                    'order_id' => $order->id,
                    'product_id' => $line_item->product_id,
                    'name' => $line_item->name,
                    'price' => $line_item->price,
                    'quantity' => $line_item->quantity,
                    'weight' => $line_item->grams,
                ]
            );
        }
    }
}
