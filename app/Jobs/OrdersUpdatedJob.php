<?php

namespace App\Jobs;

use stdClass;
use App\Models\AllInOne\Order;
use App\Models\AllInOne\OrderLineItem;
use App\Models\AllInOne\Refund;
use App\Models\AllInOne\User;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use App\Models\InConnect\InconnectOrder;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Jobs\InConnect\IntacctSalesOrderJob;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Contracts\Queries\Shop as IShopQuery;

class OrdersUpdatedJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Shop's myshopify domain
     *
     * @var ShopDomain|string
     */
    public $shopDomain;

    /**
     * The webhook data
     *
     * @var object
     */
    public $data;
    public $timeout = 600;
    public $tries = 2;

    /**
     * Create a new job instance.
     *
     * @param string   $shopDomain The shop's myshopify domain.
     * @param stdClass $data       The webhook data (JSON decoded).
     *
     * @return void
     */
    public function __construct($shopDomain, $data)
    {
        config()->set('shopify-app.job_queues.webhooks', 'que_orders');

        $this->shopDomain = $shopDomain;
        $this->data = $data;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(IShopQuery $shopQuery): bool
    {
        $this->shopDomain = ShopDomain::fromNative($this->shopDomain);
        $shop = $shopQuery->getByDomain($this->shopDomain);
        $payload = $this->data;

        // Log::info("order updated job" . $payload->name);
        // Log::info(json_encode($payload));

        $user = User::where('name', $shop->name)->first();

        // RACOON CANCEL CHECK
        $to_be_cancel = Order::whereNull('cancelled_at')->where('order_id', $payload->id)->where('user_id', $user->id)->where('is_fraud', true)->first();
        if($to_be_cancel && $payload->cancelled_at) {
            $to_be_cancel->on_hold = false;
            $to_be_cancel->cancelled_at = now();
            $to_be_cancel->cancel_reason = "Cancelled through OrdersUpdatedJob - Shopify";
            $to_be_cancel->save();
        }

        // sync_orders($shop);

        $inconnectOrder = InconnectOrder::where('shopify_order_id', $payload->id)->first();
        if (isset($inconnectOrder) && $payload->fulfillment_status == "fulfilled") {
            $inconnectOrder->fulfillment_status = $payload->fulfillment_status;
            $inconnectOrder->save();

            if (!$inconnectOrder->updates()->where('name', 'Shipped from Idex')->exists()) {
                $inconnectOrder->updates()->create([
                    'name' => 'Fulfilled from Shopify',
                    'type' => 'fulfilled',
                    'initiated_at' => now(),
                    'completed_at' => now(),
                    'failed_at' => null,
                    'tries' => 1
                ]);
            }

            if (!$inconnectOrder->updates()->where('name', 'Intacct Sales Invoice')->exists()) {
                IntacctSalesOrderJob::dispatch($payload, $inconnectOrder, 'Sales Invoice');
            }
        }

        $order = Order::updateOrCreate(
            [
                'order_id' => $payload->id,
            ],
            [
                'order_name' => $payload->name,
                'customer_id' => isset($payload->customer) ? $payload->customer->id : NULL,
                'user_id' => $user->id,
                'email' => $payload->email,
                'contact_email' => $payload->contact_email,
                'phone_no' => $payload->phone,
                'order_created_at' => $payload->created_at,
                'customer_name' => isset($payload->customer) ? $payload->customer->first_name . " " . $payload->customer->last_name : NULL,
                'total' => $payload->subtotal_price,
                'final_total' => $payload->total_price,
                'payment_status' => $payload->financial_status,
                'fulfillment_status' => $payload->fulfillment_status,
                'cancelled_at' => $payload->cancelled_at,
                'cancel_reason' => $payload->cancel_reason
            ]
        );

        if (isset($payload->line_items)) {
            foreach ($payload->line_items as $key9 => $line_item) {

                OrderLineItem::updateOrCreate(
                    [
                        'line_item_id' => $line_item->id,
                    ],
                    [
                        'user_id' => $user->id,
                        'local_order_id' => $order->id,
                        'order_id' => $payload->id,
                        'product_id' => $line_item->product_id,
                        'name' => $line_item->name,
                        'price' => $line_item->price,
                        'quantity' => $line_item->quantity,
                        'weight' => $line_item->grams,
                    ]
                );
            }
        }

        // $response8 = $user->api()->rest('GET', '/admin/api/2023-04/orders/' . $order->order_id . '/refunds.json');

        // if ($response8['errors'] == false) {

        //     // Log::info(json_encode("REFUNDS", $response8['errors']));

        //     if (count($response8['body']['refunds']) > 0) {
        //         foreach ($response8['body']['refunds'] as $key9 => $refund) {

        //             $refund_amount = 0;

        //             foreach ($refund->refund_line_items as $key10 => $refund_item) {
        //                 $refund_amount = $refund_amount + $refund_item->subtotal;
        //             }

        //             // Log::info(json_encode("ORDER REFUND" . $refund_amount));

        //             Refund::updateOrCreate(
        //                 [
        //                     'refund_id' => $refund->id,
        //                 ],
        //                 [
        //                     'user_id' => $user->id,
        //                     'local_order_id' => $order->id,
        //                     'order_id' => $order->order_id,
        //                     'refund_note' => $refund->note,
        //                     'refund_amount' => $refund_amount,
        //                 ]
        //             );
        //         }
        //     }
        // } else {
        //     sendApiLog(false, 'API RESPONSE', $response8);
        //     // DB::commit();
        //     // return true;
        // }

        // Log::info(json_encode($order));
        return true;
    }
}
