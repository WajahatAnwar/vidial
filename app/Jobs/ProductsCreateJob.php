<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\VirtualOptions\Color;
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
use App\Jobs\InConnect\IntacctProductCreateJob;
use App\Models\InConnect\ShopifySize;
use App\Models\InConnect\ProductType;
use App\Models\VirtualOptions\UserColor;
use App\Models\InConnect\GooselyRule;

class ProductsCreateJob implements ShouldQueue
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
        // config()->set('shopify-app.job_queues.webhooks', 'que_cp');

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
        $payload = $this->data;

        $user = User::where('name', $shop->name)->first();

        // Log::info("create product job " . $user->name);
        // Log::info(json_encode($payload));

        //GRAPH QL ENTRY
        $query = <<<GRAPHQL
        {
            product(id: "gid://shopify/Product/{$payload->id}") {
              legacyResourceId
              title
              tracksInventory
              totalInventory
              variants(first: 250) {
                edges {
                    node {
                        id
                        legacyResourceId
                        title
                        selectedOptions {
                            name
                            value
                        }
                        inventoryQuantity
                        sku
                        compareAtPrice
                        price
                        image {
                            url
                        }
                    }
                }
              }
            }
        }
        GRAPHQL;
        $graphql_product = $user->api()->graph($query);
        if (!@$graphql_product['body']['data']) {
            logger()->info(json_encode($graphql_product));
        } else {
            $product_tracked = $graphql_product['body']['data']['product']['tracksInventory'];
            $total_inventory = $graphql_product['body']['data']['product']['totalInventory'];
        }

        $image_link = "";
        if (isset($payload->image)) {
            $image_link = $payload->image->src;
        } else {
            $image_link = config('app.url') . '/images/ph_front.jpg';
        }

        $current_product = Product::updateOrCreate([
            'product_id' => $payload->id,
        ], [
            'product_tags' => $payload->tags,
            'product_title' => $payload->title,
            'product_handle' => $payload->handle,
            'product_vendor' => $payload->vendor,
            'product_type' => $payload->product_type,
            'user_id' => $user->id,
            'description' => "default description",
            'product_image' => $image_link,
            'status' => $payload->status,
            'product_created_at' => $payload->created_at,
            'product_tracked' => @$product_tracked,
            'total_inventory' => @$total_inventory,
            // 'variants_json' => json_encode($payload->variants)
        ]);

        ProductType::updateOrCreate([
            'name' => $payload->product_type,
        ]);

        $color_position = "";
        $size_position = "";

        if (isset($payload->options)) {
            foreach ($payload->options as $key => $option) {
                if ($option->name == "color" || $option->name == "Color") {

                    foreach ($option->values as $key => $color) {
                        $color_inside = Color::updateOrCreate([
                            'color' => $color,
                        ]);

                        UserColor::updateOrCreate([
                            'user_id' => $user->id,
                            'color_id' => $color_inside->id,
                        ]);
                    }
                }

                if ($option->name == "size" || $option->name == "Size") {
                    foreach ($option->values as $key => $size) {
                        ShopifySize::updateOrCreate([
                            'name' => $size,
                        ]);
                    }
                }

                if ($option->name == "Color" || $option->name == "color") {
                    $color_position = $option->position;
                }

                if ($option->name == "Size" || $option->name == "size") {
                    $size_position = $option->position;
                }
            }
        }

        if (@$graphql_product['body']['data']) {
            $variants = $graphql_product['body']['data']['product']['variants'];
            foreach ($variants['edges'] as $variant) {
                // Log::info($variant['node']['title']);
                $product_variant = $current_product->variants()->updateOrCreate([
                    'product_id' => $graphql_product['body']['data']['product']['legacyResourceId'],
                    'variant_id' => $variant['node']['legacyResourceId'],
                ], [
                    'user_id' => $user->id,
                    'title' => $variant['node']['title'],
                    'option1' => @$variant['node']['selectedOptions'][0]['value'],
                    'option2' => @$variant['node']['selectedOptions'][1]['value'],
                    'option3' => @$variant['node']['selectedOptions'][2]['value'],
                    'price' => $variant['node']['price'],
                    'image_url' => isset($variant['node']['image']['url']) ? $variant['node']['image']['url'] : config('app.url') . '/images/ph_front.jpg',
                    'quantity' => isset($variant['node']['inventoryQuantity']) ? $variant['node']['inventoryQuantity'] : 0,
                    // 'inventory_tracked' => $variant['node']['inventoryItem']['tracked'],
                    'sku' => $variant['node']['sku'],
                    'compare_at_price'=> $variant['node']['compareAtPrice']
                ]);

                if (!$product_variant->intacct_item_id || ($product_variant->intacct_item_id && $variant['node']['sku'] != $product_variant->intacct_item_id)) {
                    $intacctPayload = [
                        'vendor_name' => $current_product->product_vendor,
                        'title' => $current_product->product_title,
                        'item_id' => $variant['node']['sku'],
                        'price' => $variant['node']['price'],
                        'shipping_weight' => 0.00,
                        'brand' => '',
                        'subbrand' => '',
                        'category' => '',
                        'subcategory' => '',
                        'size1' => $size_position == 1 ? @$variant['node']['selectedOptions'][0]['value'] : @$variant['node']['selectedOptions'][1]['value'],
                        'style' => '',
                        'color' => $color_position == 1 ? substr(@$variant['node']['selectedOptions'][0]['value'], 0, 30) : substr(@$variant['node']['selectedOptions'][1]['value'], 0, 30),
                    ];

                    $gooselyRule = GooselyRule::with('product_type')->where(function ($q) use($current_product) {
                        $q->whereHas('product_type', function ($q) use ($current_product) {
                            $q->where('name', $current_product->product_type);
                        });
                    })->first();

                    if ($user->inconnect_account && !(isset($gooselyRule['intacctOrder']) && $gooselyRule['intacctOrder'])) {
                        IntacctProductCreateJob::dispatch($intacctPayload, $variant['node']['legacyResourceId']);
                    } else {
                        // logger("RULE CODE: INTACCT ITEM NOT SYNCING 3");
                    }
                }
            }
        } else if (isset($payload->variants)) {
            foreach ($payload->variants as $key => $variant) {
                $product_variant = $current_product->variants()->updateOrCreate([
                    'product_id' => $variant->product_id,
                    'variant_id' => $variant->id,
                ], [
                    'user_id' => $user->id,
                    'title' => $variant->title,
                    'option1' => $variant->option1,
                    'option2' => $variant->option2,
                    'option3' => $variant->option3,
                    'price' => $variant->price,
                    'quantity' => isset($variant->inventory_quantity) ? $variant->inventory_quantity : 0,
                    // 'inventory_tracked' => $variant->inventory_management ? true : false,
                    'sku' => $variant->sku
                ]);

                if (!$product_variant->intacct_item_id || ($product_variant->intacct_item_id && $variant->sku != $product_variant->intacct_item_id)) {
                    $intacctPayload = [
                        'vendor_name' => $current_product->product_vendor,
                        'title' => $current_product->product_title,
                        'item_id' => $variant->sku,
                        'price' => $variant->price,
                        'shipping_weight' => 0.00,
                        'brand' => '',
                        'subbrand' => '',
                        'category' => '',
                        'subcategory' => '',
                        'size1' => $size_position == 1 ? $variant->option1 : $variant->option2,
                        'style' => '',
                        'color' => $color_position == 1 ? substr($variant->option1, 0, 30) : substr($variant->option2, 0, 30),
                    ];

                    $gooselyRule = GooselyRule::with('product_type')->where(function ($q) use($current_product) {
                        $q->whereHas('product_type', function ($q) use ($current_product) {
                            $q->where('name', $current_product->product_type);
                        });
                    })->first();

                    if ($user->inconnect_account && !(isset($gooselyRule['intacctOrder']) && $gooselyRule['intacctOrder'])) {
                        IntacctProductCreateJob::dispatch($intacctPayload, $variant->id);
                    } else {
                        // logger("RULE CODE: INTACCT ITEM NOT SYNCING 4");
                    }
                }
            }
        }

        if (isset($payload->images)) {
            foreach ($payload->images as $key => $image) {

                // Log::info("IMAGE CREATING: " . $image->admin_graphql_api_id);

                $current_product->images()->updateOrCreate(
                    [
                        'image_id' => $image->admin_graphql_api_id,
                        'product_id' => $current_product->product_id,
                    ],
                    [
                        'user_id' => $user->id,
                        'image_src' => $image->src,
                    ]
                );
            }
        }

        // Log::info(json_encode($current_product));
        return true;
    }
}
