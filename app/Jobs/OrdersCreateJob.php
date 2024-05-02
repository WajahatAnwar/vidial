<?php

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\CampaignDiscount;
use App\Models\DiscountedOrder;
use App\Models\Orders;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use stdClass;
use Osiset\ShopifyApp\Contracts\Commands\Shop as IShopCommand;
use Osiset\ShopifyApp\Contracts\Queries\Shop as IShopQuery;
use Osiset\ShopifyApp\Actions\CancelCurrentPlan;

class OrdersCreateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Shop's myshopify domain
     *
     * @var ShopDomain|string
     */

    /**
     * The webhook data
     *
     * @var object
     */
    // public $data;
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
    public $shopDomain;
    public $data;
    public function __construct($shopDomain, $data)
    {
        $this->shopDomain = $shopDomain;
        $this->data = $data;
    }

    /**
     * Execute the job.
     *
     * @param IShopCommand      $shopCommand             The commands for shops.
     * @param IShopQuery        $shopQuery               The querier for shops.
     * @param CancelCurrentPlan $cancelCurrentPlanAction The action for cancelling the current plan.
     *
     * @return bool
     */
    public function handle()
    {
        // Convert domain
        // Log::info("BELOW IS MY ORDER");
        // Log::info(json_encode($this->data));

        // $shop_domain = $this->shopDomain;
        //Log::info($shop_domain);
        //Log::info("order placed");

        $payload = $this->data;
        //Log::info(json_encode($payload));
        $order_id = $payload->id;



        $this->shopDomain = ShopDomain::fromNative($this->shopDomain);
        $shop = User::where('name',$this->shopDomain->toNative())->first();
        $shop_settings =  $shop->settings;
        if($shop_settings){
       
        Log::info('order create job run successfully');
        $customer_details = $payload->customer;
          // $orders = $shop->api()->rest('GET', '/admin/orders.json');
          // foreach ($orders['body']['orders'] as $order_item) {
        if($payload->contact_email == null || $payload->contact_email == ""){
          return;
        }
        $custmerName = 'Customer';
        if(isset($payload->billing_address)){
            $custmerName = $payload->billing_address->first_name ?? $payload->billing_address->last_name;
        }
        Orders::updateOrCreate( 
        [
          'order_id' => $order_id
        ],
        [
          'user_id' =>  $shop->id,
          'order_id' => $order_id,
          'email' =>  $payload->email ?? $payload->contact_email ,
          'contect_email' =>  $payload->contact_email,
          'phone_no' => isset($customer_details->phone) ? $customer_details->phone : '00',
          'confirmed' =>  "" ,
          'order_created_at' => $payload->created_at ,
          'remaining_mail' => $shop_settings->page_display_to_customers,
          'email_send_at' => Carbon::parse($payload->created_at)->addDays($shop->settings->page_link) ,
          'reminder_mail' => Carbon::parse($payload->created_at)->addWeek($shop->settings->email_sent_to_customer),
          'email_status' => $shop_settings->email_status ,
          'customer_name'=> $custmerName,
        ]);
    }else {
        Log::info('shop settings not found');
         Log::info(json_encode($shop->id));
    }
          // }
         return true;
    }
}
