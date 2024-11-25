<?php

namespace App\Jobs;

use stdClass;
use App\Models\User;
use App\Models\Product;
use Illuminate\Bus\Queueable;
use App\Models\Order;
use App\Traits\Racoon\RestrictionTrait;
use App\Traits\GeneralTrait;
use Illuminate\Support\Facades\Log;
use App\Models\OrderLineItem;
use App\Jobs\InConnect\OrderCreateJob;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Contracts\Queries\Shop as IShopQuery;

class OrdersCreateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, RestrictionTrait, GeneralTrait;

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
    public $timeout = 9999999999999999;
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

        Log::info("order create job" . $payload->name);

        $user = User::with('applications')->where('name', $shop->name)->first();

        $this->updateOrderEntry($payload->name, $user->id, 'ordersCreateJob');

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
                'payload' => $payload
            ]
        );

        if (isset($payload->line_items)) {
            foreach ($payload->line_items as $key9 => $line_item) {

                $productManipulate = Product::where('product_id', $line_item->product_id)->first();
                if($productManipulate) {
                    $productManipulate->total_inventory = $productManipulate->total_inventory - $line_item->quantity;
                    $productManipulate->save();
                }

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

        $filteredObjects = $user->applications->where('id', 8);
        $filteredObjects = $filteredObjects->first();
        // Log::info("RACOON WORKING AND STATUS IS " . json_encode($filteredObjects->pivot->status) . " FOR SHOP: " . $user->name);
        if ($filteredObjects->pivot->status) {
            if ($user->restrictions()->exists()) {
                if ($this->checkIfFraud($user, $payload, $order)) {
                    $this->updateOrderEntry($payload->name, $user->id, 'fraudOrder');
                    return true;
                }
            }
        }

        if ($user->inconnect_account) {
            $filteredObjects = $user->applications->where('id', 6);
            $filteredObjects = $filteredObjects->first();
            // Log::info("GOOSELY WORKING AND STATUS IS " . json_encode($filteredObjects->pivot->status) . " FOR SHOP: " . $user->name);
            if ($filteredObjects->pivot->status) {
                $this->updateOrderEntry($payload->name, $user->id, 'gooselyStatus');
                if($user->inconnect_account->intact_sync)
                    $this->updateOrderEntry($payload->name, $user->id, 'intacctStatus');
                if($user->inconnect_account->vendor_sync)
                    $this->updateOrderEntry($payload->name, $user->id, 'vendorStatus');
                if($user->inconnect_account->decorator_sync)
                    $this->updateOrderEntry($payload->name, $user->id, 'decoratorStatus');
                OrderCreateJob::dispatch($user, $payload);
            }
        } else {
            // Log::info('Goosely Account not found for Shop: ' . $user->name);
        }

        $this->updateOrderEntry($payload->name, $user->id, 'realOrdersCreateJob');

        // ORDER SPLITTER SECTION
        $order_splitter = orderSplitterJob($user, $payload);
        // ORDER SPLITTER SECTION

        // Log::info(json_encode($order));

        return true;
    }
}
