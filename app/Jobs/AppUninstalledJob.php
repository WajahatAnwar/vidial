<?php

namespace App\Jobs;

use App\Models\AllInOne\Collection;
use App\Models\AllInOne\CollectionProduct;
use App\Models\VirtualOptions\InputFieldsProduct;
use App\Models\VirtualOptions\LogoChargesProduct;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\ProductImage;
use App\Models\AllInOne\ProductVariant;
use App\Models\AllInOne\User;
use App\Models\VirtualOptions\DropdownChargesProduct;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use stdClass;
use Osiset\ShopifyApp\Contracts\Commands\Shop;
use Osiset\ShopifyApp\Contracts\Queries\Shop as QueriesShop;
use Osiset\ShopifyApp\Actions\CancelCurrentPlan;

class AppUninstalledJob extends \Osiset\ShopifyApp\Messaging\Jobs\AppUninstalledJob
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
        $this->shopDomain = $shopDomain;
        $this->data = $data;
    }

    // public function

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(Shop $shopCommand, QueriesShop $shopQuery, CancelCurrentPlan $cancelCurrentPlanAction): bool
    {
        $this->shopDomain = ShopDomain::fromNative($this->shopDomain);

        $shop = $shopQuery->getByDomain($this->shopDomain);

        $user = User::where('name', $shop->name)->first();

        if (!empty($user)) {

            $shopId = $shop->getId();

            Collection::where('user_id', $user->id)->delete();
            CollectionProduct::where('user_id', $user->id)->delete();
            Collection::where('user_id', $user->id)->delete();
            InputFieldsProduct::where('user_id', $user->id)->delete();
            LogoChargesProduct::where('user_id', $user->id)->delete();
            DropdownChargesProduct::where('user_id', $user->id)->delete();
            Product::where('user_id', $user->id)->delete();
            ProductImage::where('user_id', $user->id)->delete();
            ProductVariant::where('user_id', $user->id)->delete();
            //DELETING COMMANDS
            $shopCommand->softDelete($shopId);
        }

        return true;
    }
}
