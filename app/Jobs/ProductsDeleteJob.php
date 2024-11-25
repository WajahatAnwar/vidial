<?php

namespace App\Jobs;

use App\Models\ProductImage;
use App\Models\CollectionProduct;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\VirtualOptions\DropdownChargesProduct;
use App\Models\VirtualOptions\InputFieldsProduct;
use App\Models\VirtualOptions\LogoChargesProduct;
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

class ProductsDeleteJob implements ShouldQueue
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
    public function __construct(string $domain, $data)
    {
        config()->set('shopify-app.job_queues.webhooks', 'que_cp');

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

        $deletion_object = $this->data;

        // Log::info(json_encode("delete product job"));
        // Log::info(json_encode($shop));

        Product::where('product_id', $deletion_object->id)->delete();
        LogoChargesProduct::where('product_id', $deletion_object->id)->delete();
        InputFieldsProduct::where('product_id', $deletion_object->id)->delete();
        DropdownChargesProduct::where('product_id', $deletion_object->id)->delete();
        CollectionProduct::where('product_id', $deletion_object->id)->delete();
        ProductVariant::where('product_id', $deletion_object->id)->delete();
        ProductImage::where('product_id', $deletion_object->id)->delete();

        return true;
    }
}
