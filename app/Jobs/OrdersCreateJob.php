<?php namespace App\Jobs;

use App\Models\Campaign;
use App\Models\CampaignDiscount;
use App\Models\DiscountedOrder;
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
    public $domain;

    /**
     * The webhook data
     *
     * @var object
     */
    public $data;

    /**
     * Create a new job instance.
     *
     * @param string   $shopDomain The shop's myshopify domain.
     * @param stdClass $data       The webhook data (JSON decoded).
     *
     * @return void
     */
    public function __construct($domain, $data)
    {
        $this->domain = $domain;
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
    public function handle(IShopCommand $shopCommand, IShopQuery $shopQuery, CancelCurrentPlan $cancelCurrentPlanAction): bool
    {
        $this->domain = ShopDomain::fromNative($this->domain);

        $shop = $shopQuery->getByDomain($this->domain);
        $shopId = $shop->getId();

        // Log::info(json_encode($shop));

        $order = $this->data;

        // Log::info(json_encode($order));

        // Log::info(json_encode($order->discount_codes));

        if(count($order->discount_codes) == 0) {

        } else if(count($order->discount_codes) > 0) {

            $discount_check = false;

            foreach ($order->discount_codes as $key1 => $value1) {
                // Log::info(json_encode($value1));

                $discounts = CampaignDiscount::where('user_id',$shop->id)->get();

                foreach ($discounts as $key2 => $value2) {

                    if($value2->discount_code == $value1->code) {
                        $discount_check = true;
                        break;
                    }

                }
            }

            if($discount_check == true) {

                $new_discounted_order = new DiscountedOrder;
                $new_discounted_order->user_id = $shop->id;
                $new_discounted_order->shopify_order_id = $order->id;
                $new_discounted_order->shopify_customer_id = $order->customer->id;
                $new_discounted_order->order_no = $order->order_number;
                $new_discounted_order->billing_address = $order->billing_address->address1;
                $new_discounted_order->shipping_address = $order->shipping_address->address1;
                $new_discounted_order->customer_name = $order->customer->first_name." ".$order->customer->last_name;
                $new_discounted_order->email = $order->customer->email;
                $new_discounted_order->phone = $order->customer->phone;
                $new_discounted_order->country = $order->shipping_address->country;
                $new_discounted_order->line_items = (json_encode($order->line_items));
                $new_discounted_order->sub_total_price = $order->subtotal_price;
                $new_discounted_order->save();

            }
        }

        return true;
    }
}
