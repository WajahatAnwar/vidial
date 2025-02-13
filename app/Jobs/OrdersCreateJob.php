<?php

namespace App\Jobs;

use stdClass;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use App\Models\KlavioCredential;
use App\Models\Orders;
use Carbon\Carbon;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Contracts\Queries\Shop as IShopQuery;

class OrdersCreateJob implements ShouldQueue
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
        // config()->set('shopify-app.job_queues.webhooks', 'que_orders');

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
        $order_id = $payload->id;

        // Log::info("order create job" . $payload->name);

        // $user = User::with('applications')->where('name', $shop->name)->first();

        $shop_settings = $shop ? $shop->settings : null;
        if ($shop_settings) {

            // Log::info('order create job run successfully');
            $customer_details = $payload->customer;
            if ($payload->contact_email == null || $payload->contact_email == "") {
                Log::info("We did not Found any contact Email against this order");
                Log::info(json_encode($payload));
                return true;
            }
            /********* payload for order ********/
            $order_payload = [
                'user_id' => $shop->id,
                'order_id' => $order_id,
                'email' => $payload->email ?? $payload->contact_email,
                'contect_email' => $payload->contact_email,
                'phone_no' => isset($customer_details->phone) ? $customer_details->phone : '00',
                'confirmed' => "",
                'order_created_at' => $payload->created_at,
                'remaining_mail' => $shop_settings->page_display_to_customers,
                'email_send_at' => Carbon::parse($payload->created_at)->addDays($shop->settings->page_link),
                'reminder_mail' => Carbon::parse($payload->created_at)->addWeeks($shop_settings->email_sent_to_customer),
                'email_status' => $shop_settings->email_status,
                'customer_name' => $payload->billing_address->first_name ?? ($payload->billing_address->last_name ?? 'Customer'),
                'email_service' => 'mailgun',
            ];

            /*********** klavio settings **************/
            $klavio = KlavioCredential::where('user_id', $shop->id)->first();
            if ($klavio) {
                $order_payload['email_service'] = 'klavio';
                /********* sent event to klavio *********/
                KlavioEmailJob::dispatch($klavio->api_key, $klavio->email, $order_payload);
            }
            // Log::info(json_encode($order_payload));
            // Log::info("order_payload");

            $order = Orders::updateOrCreate(['order_id' => $order_id], $order_payload);
        } else {
            Log::info("We did not Found any Setting against this shop");
            Log::info(json_encode($shop));
        }

        return true;
    }
}
