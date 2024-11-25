<?php

namespace App\Jobs\InConnect;

use App\Mail\InConnect\OrderUpdateMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class OrderUpdateMailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;
    public $tries = 2;

    private $data;
    private $order;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($data, $order)
    {
        $this->onQueue('que_orders');

        $this->data = $data;
        $this->order = $order;
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

        $order = $this->order;
        $user = $order->user;
        $shopify_order = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order->shopify_order_id . '.json', ['fields' => 'id,email,name,shipping_address,line_items,customer,subtotal_price,fulfillments'])['body']['order'];
        $data = array_merge((array) $this->data->email_data, [
            'customer_name' => $shopify_order['customer']['first_name'] . ' ' . $shopify_order['customer']['last_name'],
            'email' => $shopify_order['email'],
            'shipping_address' => implode(', ', array_filter([
                $shopify_order['shipping_address']['address1'],
                $shopify_order['shipping_address']['address2'],
                $shopify_order['shipping_address']['city'],
                $shopify_order['shipping_address']['province'],
                $shopify_order['shipping_address']['zip'],
                $shopify_order['shipping_address']['country'],
            ])),
            'line_items' => $shopify_order['line_items']->toArray(),
            'subtotal_price' => $shopify_order['subtotal_price'],
            'fulfillments' => $shopify_order['fulfillments']->toArray(),
        ]);
        $data['body'] = str_replace('%CUSTOMER_NAME%', $data['customer_name'], $data['body']);
        $data['body'] = str_replace('%CUSTOMER_ADDRESS%', $data['shipping_address'], $data['body']);
        $data['body'] = str_replace('%ORDER_EMAIL%', $data['email'], $data['body']);
        $data['body'] = str_replace('%TRACKING_ID%', $data['fulfillments'][0]['tracking_number'] ?? '', $data['body']);
        $data['body'] = str_replace('%ORDER_NUMBER%', $data['order_number'], $data['body']);
        $this->data->email_data = $data;
        $this->data->is_sent = TRUE;
        $this->data->save();

        $message = (new OrderUpdateMail($data))->onQueue('que_orders');
        Mail::to($data['email'])->queue($message);
    }
}
