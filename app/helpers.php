<?php

use App\Jobs\AllInOne\OrderSeparatedJob;
use App\Jobs\InConnect\IntacctProductCreateJob;
use App\Models\AllInOne\Collection;
use App\Models\AllInOne\CollectionProduct;
use App\Models\VirtualOptions\Color;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\ProductVariant;
use App\Models\AllInOne\ProductImage;
use App\Models\AllInOne\User;
use App\Models\Analytics\ALReportLog;
use App\Models\InConnect\ShopifySize;
use App\Models\InConnect\ProductType;
use App\Models\PurchaseOrder\POLocationShipping;
use App\Models\PurchaseOrder\POPriceShipping;
use App\Models\VirtualOptions\UserColor;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use LaravelShipStation\Models\Order as LaravelOrder;
use LaravelShipStation\Models\AdvancedOptions;
use LaravelShipStation\Models\Address;
use LaravelShipStation\Models\OrderItem;
use App\Models\OrderSplitter\OSSplitOrder;
use App\Models\OrderSplitter\OSVendorOrder;
use App\Models\OrderSplitter\OrderSplitterLog;
use App\Models\OrderSplitter\OSVendor;
use Illuminate\Support\Facades\Http;
use LaravelShipStation\Models\Weight;
use App\Models\InConnect\GooselyRule;
use GuzzleHttp\Exception\ConnectException;

if (!function_exists('simpleValidate')) {
    function simpleValidate($validator)
    {
        $error = $validator->errors()->first();
        return response()->json([
            'success' => false,
            'message' => $error,
        ], 422);
    }
}

if (!function_exists('getHeadersAsString')) {
    function getHeadersAsString()
    {
        $headers = getallheaders();

        // Print all headers
        $headersString = "";
        foreach ($headers as $header => $value) {
            $headersString .= "$header: $value\n";
        }
        return $headersString;
    }
}


if (!function_exists('sendResponse')) {
    function sendResponse($success, $message = '', $data = null, $data2 = null, $data3 = null, $code = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'data2' => $data2,
            'data3' => $data3,
        ], $code);
    }
}

if (!function_exists('sendApiLog')) {
    function sendApiLog($success, $message = '', $data = null, $code = 200)
    {
        Log::info($message . json_encode($data));
    }
}

if (!function_exists('responseJson')) {
    function responseJson($success = true, $message = '', $data = null, $data2 = null, $code = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'data2' => $data2,
        ], $code);
    }
}

if (!function_exists('syncProductsV2')) {
    function syncProductsV2($user, $intacctSync = false)
    {
        // logger()->info("INTACCT SYNC IS: " . ($intacctSync ? "'ON' " : "'OFF' ")  . json_encode($user));
        $next = null;
        $collections_next = null;
        $variants_next = null;

        $fetchedCollections = [];
        
        $query = function ($products_next, $collections_next = null, $variants_next = null) {
            $products_next = $products_next ?  '"' . $products_next . '"' : 'null';
            $collections_next = $collections_next ? '"' . $collections_next . '"' : 'null';
            $variants_next = $variants_next ? '"' . $variants_next . '"' : 'null';

            // GUIDE: VARIANT LEVEL
            // inventoryItem {
            //     tracked
            // }

            // GUIDE: LEVEL
            // resourcePublicationsV2(first: 3) {
            //     edges {
            //         node {
            //             publishDate
            //             publication {
            //                 name
            //             }  
            //         }
            //     }
            // }

            return <<<GRAPHQL
            {
                products(first: 150, after: $products_next) {
                    edges {
                        node {
                            id
                            legacyResourceId
                            handle
                            title
                            descriptionHtml
                            tags
                            vendor
                            productType
                            featuredImage {
                                id
                                height
                                width
                                url
                            }
                            status
                            tracksInventory
                            totalInventory
                            publishedAt
                            createdAt
                            variants(first: 250, after: $variants_next) {
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
                                pageInfo {
                                    startCursor
                                    endCursor
                                    hasNextPage
                                    hasPreviousPage
                                }
                            }
                            collections(first: 250, after: $collections_next) {
                                edges {
                                    node {
                                        id
                                        legacyResourceId
                                        handle
                                        title
                                        image {
                                            id
                                            height
                                            width
                                            url
                                        }
                                        updatedAt
                                    }
                                }
                                pageInfo {
                                    startCursor
                                    endCursor
                                    hasNextPage
                                    hasPreviousPage
                                }
                            }
                            images(first: 50) {
                                edges {
                                    node {
                                        id
                                        height
                                        width
                                        url
                                    }
                                }
                            }
                            options(first: 3) {
                                id
                                name
                                position
                                values
                            }
                        }
                    }
                    pageInfo {
                        startCursor
                        endCursor
                        hasNextPage
                        hasPreviousPage
                    }
                }
            }
            GRAPHQL;
        };
        $next = null;
        do {

            try {

                $product_query = $query($next);
                sleep(2);
                $result = $user->api()->graph($product_query);

                if (!($result['status'] >= 200 && $result['status'] < 300)) {
                    logger()->info("ERROR SHOP1: " . $user->name . " " . json_encode($result));
                    return false;
                }
                if (!@$result['body']['data']) {
                    logger()->info("ERROR SHOP2: " . $user->name . " " . json_encode($result));
                    return false;
                }

                // return $result;
                // logger()->info(json_encode($result));
                $products = $result['body']['data']['products'];

                $productsData = [];
                foreach ($products['edges'] as $key => $product) {
                    $productsData[] = [
                        'product_id' => $product['node']['legacyResourceId'],
                        'product_tags' => implode(',', $product['node']['tags']->toArray()),
                        'product_title' => $product['node']['title'],
                        'product_handle' => $product['node']['handle'],
                        'product_vendor' => $product['node']['vendor'],
                        'product_type' => $product['node']['productType'],
                        'user_id' => $user->id,
                        'description' => "default description",
                        'product_image' => $product['node']['featuredImage']['url'] ?? env('APP_URL') . '/images/ph_front.jpg',
                        'status' => $product['node']['status'],
                        'product_created_at' => $product['node']['createdAt'],
                        'product_tracked' => $product['node']['tracksInventory'],
                        'total_inventory' => $product['node']['totalInventory'],
                        'published_at' => $product['node']['publishedAt']
                    ];

                    if($intacctSync) {
                        ProductType::updateOrCreate([
                            'name' => $product['node']['productType'],
                        ]);

                        $color_position = "";
                        $size_position = "";

                        foreach ($product['node']['options'] as $key1 => $option) {
                            if ($option['name'] == "color" || $option['name'] == "Color") {
                                foreach ($option['values'] as $key2 => $color) {
                                    $color_inside = Color::updateOrCreate([
                                        'color' => $color,
                                    ]);
                                    UserColor::updateOrCreate([
                                        'user_id' => $user->id,
                                        'color_id' => $color_inside->id
                                    ]);
                                }
                            }

                            if ($option['name'] == "size" || $option['name'] == "Size") {
                                foreach ($option['values'] as $key2 => $size) {
                                    ShopifySize::updateOrCreate([
                                        'name' => $size,
                                    ]);
                                }
                            }

                            if ($option['name'] == "Color" || $option['name'] == "color") {
                                $color_position = $option['position'];
                            }

                            if ($option['name'] == "Size" || $option['name'] == "size") {
                                $size_position = $option['position'];
                            }
                        }
                    }

                    // $current_product->images()->delete();
                    $fetchedImages = [];
                    foreach ($product['node']['images']['edges'] as $key1 => $image) {

                        // Log::info("IMAGE CREATING: " . $image['node']['id']);

                        ProductImage::updateOrCreate(
                            [
                                'image_id' => $image['node']['id'],
                                'product_id' => $product['node']['legacyResourceId'],
                            ],
                            [
                                'user_id' => $user->id,
                                'image_src' => $image['node']['url'],
                            ]
                        );
                        $fetchedImages[] = $image['node']['id'];
                    }

                    /**** start -- https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7697420680 ***************************/
                    deleteImages($product['node']['legacyResourceId'], $user, $fetchedImages);
                    /**** end -- https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7697420680 *****************************/

                    $variants = $product['node']['variants'];
                    $fetchedVariants = [];
                    $variantsData = [];
                    do {
                        foreach ($variants['edges'] as $variant) {
                            $fetchedVariants[] = $variant['node']['legacyResourceId'];
                            $variantsData[] = [
                                'variant_id' => $variant['node']['legacyResourceId'],
                                'product_id' => $product['node']['legacyResourceId'],
                                'user_id' => $user->id,
                                'title' => $variant['node']['title'],
                                'option1' => @$variant['node']['selectedOptions'][0]['value'],
                                'option2' => @$variant['node']['selectedOptions'][1]['value'],
                                'option3' => @$variant['node']['selectedOptions'][2]['value'],
                                'price' => $variant['node']['price'],
                                'image_url' => $variant['node']['image']['url'] ?? env('APP_URL') . '/images/ph_front.jpg',
                                'quantity' => $variant['node']['inventoryQuantity'] ?? 0,
                                // 'inventory_tracked' => $variant['node']['inventoryItem']['tracked'],
                                'sku' => $variant['node']['sku'],
                                'compare_at_price'=> $variant['node']['compareAtPrice']
                            ];

                            if($intacctSync) {
                                // THIS DATABASE INTERACTION IN FOREACH SLOWING PROCESS OF SAVING A LITTLE BIT
                                $need_to_create_on_intacct = ProductVariant::where('variant_id', $variant['node']['legacyResourceId'])->first();
                            
                                if(!$need_to_create_on_intacct || ($variant['node']['sku'] && $need_to_create_on_intacct && !$need_to_create_on_intacct->intacct_item_id)) {
                                    $intacctPayload = [
                                        'vendor_name' => $product['node']['vendor'],
                                        'title' => $product['node']['title'],
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
        
                                    $gooselyRule = GooselyRule::with('product_type')->where(function ($q) use ($product) {
                                        $q->whereHas('product_type', function ($q) use ($product) {
                                            $q->where('name', $product['node']['productType']);
                                        });
                                    })->first();
        
                                    if ($user->inconnect_account && !(isset($gooselyRule['intacctOrder']) && $gooselyRule['intacctOrder'])) {
                                        // logger("ITEM TO CREATE: " . $variant['node']['sku'] . " " . $variant['node']['legacyResourceId']);
                                        IntacctProductCreateJob::dispatch($intacctPayload, $variant['node']['legacyResourceId']);
                                    }
                                }
                            }
                        }
                        
                        ProductVariant::upsert($variantsData, ['variant_id'], [
                            'product_id', 'user_id', 'title', 'option1', 'option2', 'option3', 'price', 'image_url', 'quantity', 'sku','compare_at_price'
                        ]);

                        /**** start -- https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7697420680 ***************************/
                        deleteVariants($product['node']['legacyResourceId'], $user, $fetchedVariants);
                        /**** end -- https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7697420680 ***************************/

                        if (@$variants['pageInfo']['hasNextPage']) {
                            $variants_next = $variants['pageInfo']['endCursor'];
                            $variant_query = $query($next, null, $variants_next);
                            sleep(2);
                            $variants_result = $user->api()->graph($variant_query);
                            if (!@$variants_result['body']['data']) {
                                logger()->info("ERROR SHOP3: " . $user->name . " " . json_encode($variants_result));
                                return false;
                            }
                            $variants = $variants_result['body']['data']['products']['edges'][$key]['node']['variants'];
                            // logger()->info('variant next page');
                        } else {
                            $variants_next = null;
                        }
                    } while ($variants_next != null);

                    $collections = $product['node']['collections'];

                    do {
                        $collectionsData = [];
                        foreach ($collections['edges'] as $collection) {

                            // $converted = $collection['node']['resourcePublicationsV2']->toArray();
                            // $publications = removeNodesAndEdges($converted);
                            // $publicationsRefined = collect($publications)->map(function ($item) {
                            //     return [
                            //         'name' => $item['publication']['name'],
                            //         'publishDate' => $item['publishDate']
                            //     ];
                            // });
                            // $status = $publicationsRefined->where("name","Online Store")->first();
                            // logger(json_encode($publicationsRefined));
                            // logger("COLLECTION STATUS: " . json_encode($status));

                            $collectionsData[] = [
                                'collection_id' => $collection['node']['legacyResourceId'],
                                'collection_title' => $collection['node']['title'],
                                'collection_handle' => $collection['node']['handle'],
                                'collection_image' => $collection['node']['image']['src'] ?? env('APP_URL') . '/images/ph_front.jpg',
                                'user_id' => $user->id,
                                'collection_created_at' => $collection['node']['updatedAt'],
                                // 'published_at' => @$status['publishDate'],
                                'published_at' => "2024-10-07T17:31:52Z",
                            ];

                        $existing_collection = collect($fetchedCollections)->where('collection_id', $collection['node']['legacyResourceId'])->first();
                        // logger("test1: " . json_encode($existing_collection));

                        if (!$existing_collection) {
                            $fetchedCollections = collect($fetchedCollections)->push([
                                'collection_id' => $collection['node']['legacyResourceId'],
                                'products' => [$product['node']['legacyResourceId']]
                            ]);
                            // logger("test2: " . json_encode($fetchedCollections));
                        } else {
                            $existing_product = collect($existing_collection['products'])->contains($product['node']['legacyResourceId']);
                            if (!$existing_product) {
                                $productsUpdated = collect($existing_collection['products'])->push($product['node']['legacyResourceId']);
                                
                                $fetchedCollections = collect($fetchedCollections)->map(function($collection) use ($existing_collection, $productsUpdated) {
                                    return $collection['collection_id'] === $existing_collection['collection_id']
                                        ? ['collection_id' => $existing_collection['collection_id'], 'products' => $productsUpdated->toArray()]
                                        : $collection;
                                })->values()->toArray();
                                // logger("test3: " . json_encode($productsUpdated));
                            }
                        }

                            CollectionProduct::updateOrCreate([
                                'product_id' => $product['node']['legacyResourceId'],
                                'collection_id' => $collection['node']['legacyResourceId'],
                            ], [
                                'user_id' => $user->id,
                            ]);
                        }

                        Collection::upsert($collectionsData, ['collection_id'], ['collection_title', 'collection_handle', 'collection_image', 'user_id', 'collection_created_at', 'published_at']);

                        // collection with product save here
                        if (@$collections['pageInfo']['hasNextPage']) {
                            $collections_next = $collections['pageInfo']['endCursor'];
                            $collection_query = $query($next, $collections_next, null);
                            sleep(2);
                            $collections_result = $user->api()->graph($collection_query);
                            if (!@$collections_result['body']['data']) {
                                logger()->info("ERROR SHOP4: " . $user->name . " " . json_encode($collections_result));
                                return false;
                            }
                            $collections = $collections_result['body']['data']['products']['edges'][$key]['node']['collections'];
                            // logger()->info('collection next page');
                        } else {
                            $collections_next = null;
                        }
                    } while ($collections_next != null);
                    // logger()->info(json_encode($product, JSON_PRETTY_PRINT));
                    // logger()->info($product['node']['title'] . ' PRODUCT ADDED');
                }

                Product::upsert($productsData, ['product_id'], [
                    'product_tags', 'product_title', 'product_handle', 'product_vendor',
                    'product_type', 'user_id', 'description', 'product_image',
                    'status', 'product_created_at', 'product_tracked', 'total_inventory', 'published_at'
                ]);

                if (@$products['pageInfo']['hasNextPage']) {
                    $next = $products['pageInfo']['endCursor'];
                    // logger()->info("SHOP: " . $user->name . "::: " . json_encode($next));
                } else {
                    $next = null;
                }
            } catch (ConnectException $e) {
                logger()->error("ERROR SHOP5: " . $user->name . " " . $e->getMessage());
                break;
            } catch (Exception $e) {
                logger()->error("ERROR SHOP6: " . $user->name . " " . $e->getMessage());
                break;
            }
        } while ($next != null);

        deleteCollections($user, $fetchedCollections);

        if($intacctSync) 
            $user->product_sync = Carbon::now();
        else  
            $user->collection_sync = Carbon::now();
        $user->save();

        // sendApiLog(true, $user->name, 'PRODUCTS AND COLLECTIONS SYNC SUCCESS');
    }
}

if(!function_exists('deleteImages')){
    function deleteImages($product_id ,$user, $fetchedImages){
        ProductImage::where('user_id', $user->id)
        ->where('product_id',$product_id)
        ->whereNotIn('image_id', $fetchedImages)
        ->delete();
    }
}

if(!function_exists('deleteVariants')){
    function deleteVariants($product_id, $user, $fetchedVariants){
        ProductVariant::where('user_id', $user->id)
        ->where('product_id',$product_id)
        ->whereNotIn('variant_id', $fetchedVariants)
        ->delete();
    }
}

if(!function_exists('deleteCollections')){
    function deleteCollections($user, $fetchedCollections){
        $ids = collect($fetchedCollections)->pluck('collection_id');    
        Collection::where('user_id', $user->id)->whereNotIn('collection_id', $ids)->get()->each(function($collection) use($user) {
            CollectionProduct::where('user_id', $user->id)->where('collection_id', $collection->collection_id)->delete();
        });
        Collection::where('user_id', $user->id)->whereNotIn('collection_id', $ids)->delete();
        collect($fetchedCollections)->each(function($collection) use($user){
            $to_be_deleted = CollectionProduct::where('user_id', $user->id)->where('collection_id', $collection['collection_id'])
            ->whereNotIn('product_id', $collection['products'])->delete();
        }); 
    }
}

if (!function_exists('sync_orders')) {
    function sync_orders($request)
    {
        DB::beginTransaction();

        $user = User::where('name', $request->name)->first();
        // Log::info(json_encode($user));

        $perPage = 250;
        $response6 = $user->api()->rest('GET', '/admin/api/2023-04/orders/count.json', [
            'status' => 'any'
        ]);

        // Log::info(json_encode($response6));

        if ($response6['errors'] == false) {

            // Log::info(json_encode("ORDER COUNT" . $response6['body']['count']));

            // $productCount = $response6['body']['count'];

            // $iterations = ceil($productCount / $perPage);

            // Log::info($iterations);

            // $next = null;

            // for ($i = 0; $i < $iterations; $i++) {

            //     if ($i == 0) {
            //         $response7 = $user->api()->rest('GET', '/admin/api/2023-04/orders.json', [
            //             'status' => 'any',
            //             'limit' => $perPage,
            //             'page_info' => $next,
            //         ]);
            //     } else {
            //         $response7 = $user->api()->rest('GET', '/admin/api/2023-04/orders.json', [
            //             'limit' => $perPage,
            //             'page_info' => $next,
            //         ]);
            //     }

            //     // Log::info(json_encode($response7));

            //     if ($response7['errors'] == false) {

            //         Log::info(json_encode("ORDER" . $response7['errors']));

            //         foreach ($response7['body']['orders'] as $order) {
            //             OrderSeparatedJob::dispatch($order, $user);
            //         }

            //         Log::info("THIS IS MY LINK");
            //         Log::info(json_encode($response7['link']));

            //         if (!$response7['link']) {
            //             // Log::info("HERE IS THE BREAK 2 INSIDE");
            //             break;
            //         }

            //         $link = $response7['link'];
            //         if ($link) {
            //             $next = $link->next;
            //         }
            //     } else {
            //         sendApiLog(false, 'API RESPONSE', $response7);
            //         // DB::commit();
            //         // return true;
            //     }
            // }

            DB::commit();

            $user->order_sync = Carbon::now();
            $user->save();

            // sendApiLog(true, "ORDERS SYNC SUCCESS", 'ORDERS SYNC SUCCESS');
            //
            //
        } else {

            sendApiLog(false, 'API RESPONSE', $response6);
            DB::commit();
            return true;
        }
    }
}

if (!function_exists('reportLog')) {
    function reportLog($type)
    {
        ALReportLog::updateOrCreate(['report_type' => $type], ['report_type' => $type, 'last_viewed' => Carbon::now()]);
        return;
    }
}

if (!function_exists('shipping')) {
    function shipping($order, $request)
    {
        // Log::info("IN SHIPPING FUNCTION");
        // Log::info(json_encode($order));
        // Log::info(json_encode($request));

        $user = User::with('rule_rel')->where('name', $request->shop)->first();
        // return $user;

        //INITIALS
        $final_shipping_amount = 0.00;
        $shipping_check = false;
        $no_shipping_check = false;
        $currency_spc = "USD";
        // if ($request->country == "Canada") {
        //     $currency_spc = "CAD";
        // }
        // Log::info($currency_spc);

        $shipping_product_title = "SHIP001";
        $title_change_check = false;

        //RULE BASED SHIPPING
        if (isset($user->rule_rel)) {
            // $request->city
            // $request->country
            // dd($user->rule_rel);

            if ($user->rule_rel->p_o_rule_type_id == 1) {
                if ($request->city == $user->rule_rel->first_value || $request->country == $user->rule_rel->first_value) {
                    $final_shipping_amount = (float) $user->rule_rel->shipping_price;
                    $shipping_check = true;
                }
            } else if ($user->rule_rel->p_o_rule_type_id == 2) {
                $tag_check = false;
                foreach (json_decode($request->cart_items)->items as $key => $value) {
                    $product = Product::where('product_id', $value->product_id)->first();
                    foreach (explode(",", $product->product_tags) as $key2 => $value2) {
                        if ($value2 == $user->rule_rel->first_value && $tag_check == false) {
                            $final_shipping_amount = (float) $user->rule_rel->shipping_price;
                            $tag_check = true;
                            $shipping_check = true;
                        }
                    }
                }
            } else if ($user->rule_rel->p_o_rule_type_id == 3) {
                $title_change_check = true;
                if ($request->city == $user->rule_rel->first_value || $request->country == $user->rule_rel->first_value) {
                } else {
                    $final_shipping_amount = 0.00;
                    $shipping_check = true;
                }
            } else if ($user->rule_rel->p_o_rule_type_id == 4) {
                if ($request->city == $user->rule_rel->first_value || $request->country == $user->rule_rel->first_value) {
                    $final_shipping_amount = 0.00;
                    $no_shipping_check = true;
                } else {
                }
            }
        }

        //LOCATION BASED SHIPPING
        $location_ship = POLocationShipping::get();

        foreach ($location_ship as $key => $value) {
            if ($request->city == $value->location_name || $request->country == $value->location_name) {
                if ($shipping_check == false) {
                    $final_shipping_amount = (float) $value->shipping_price;
                    $shipping_check = true;
                }
            }
        }

        //PRICE BASED SHIPPING
        $price_ship = POPriceShipping::get();
        $order_sub_total = 74;
        // dd($order_sub_total);

        foreach ($price_ship as $key => $value) {
            if ($order_sub_total >= $value->min && $order_sub_total <= $value->max) {
                if ($title_change_check) {
                    $shipping_product_title = "Ground Shipping: $" . $value->shipping_price;
                }
                if ($shipping_check == false) {
                    $final_shipping_amount = (float) $value->shipping_price;
                    $shipping_check = true;
                }
            }
        }

        // Log::info(json_encode($final_shipping_amount));
        // Log::info(json_encode($no_shipping_check));
        // Log::info(json_encode($shipping_check));
        // Log::info(json_encode($currency_spc));
        // Log::info(json_encode($shipping_product_title));
        // return array($final_shipping_amount, $no_shipping_check, $shipping_check, $currency_spc, $shipping_product_title);

        // Log::info(json_encode($order['admin_graphql_api_id']));

        if (!$no_shipping_check) {

            $editOrderBeginMutation = <<<GQL
        mutation beginEdit{
            orderEditBegin(id: "{$order['admin_graphql_api_id']}"){
                calculatedOrder{
                    id
                    lineItems(first: 50) {
                        edges {
                            node {
                                id
                                variant {
                                    id
                                    variant_id: legacyResourceId
                                }
                            }
                        }
                    }
                }
                }
            }
        GQL;

            // Log::info(json_encode($editOrderBeginMutation));

            $calculatedOrder = $user->api()->graph($editOrderBeginMutation);
            if ($calculatedOrder['errors']) {
                // Log::info(json_encode($calculatedOrder));
                if (count($calculatedOrder['errors']) > 0) {
                    return true;
                }
            }
            $calculatedOrder = $calculatedOrder['body']['data']['orderEditBegin']['calculatedOrder'];
            if (!$calculatedOrder) {
                return sendResponse(false, 'An error occurred while updating the order! May be your order is using multiple currencies, which isn\'t allowed!');
            }
            $calculatedOrderId = $calculatedOrder['id'];
            // Log::info(json_encode($calculatedOrderId));

            $addCustomItemToOrder = <<<GQL
            mutation addCustomItemToOrder {
                orderEditAddCustomItem(id: "{$calculatedOrderId}",
                title: "{$shipping_product_title}",
                quantity: 1,
                price: {
                    amount: {$final_shipping_amount},
                    currencyCode: {$currency_spc}
                },
                requiresShipping: true) {
                  calculatedOrder {
                    id
                    addedLineItems(first: 5) {
                      edges {
                        node {
                          id
                        }
                      }
                    }
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
            GQL;
            $response_in = $user->api()->graph($addCustomItemToOrder);
            if ($response_in['errors']) {
                // Log::info(json_encode($response_in));
                if (count($response_in['errors']) > 0) {
                    return true;
                }
            }
            $commitEdit = <<<GQL
        mutation commitEdit {
            orderEditCommit(id: "{$calculatedOrderId}", notifyCustomer: false, staffNote: "I edited the order! It was me!") {
              order {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        GQL;
            $orderEditCommitted = $user->api()->graph($commitEdit);
            if ($orderEditCommitted['errors']) {
                // Log::info(json_encode($orderEditCommitted));
                if (count($orderEditCommitted['errors']) > 0) {
                    return true;
                }
            }
            return sendResponse(true, 'Order updated successfully. Credit: Umar!');
        }
    }
}

if (!function_exists('removeNodesAndEdges')) {

    // $collections['body']['data']['collections']->toArray()
    function removeNodesAndEdges(&$array)
    {
        if (is_array($array) && !isset($array['edges'])) {
            foreach ($array as $key => $val) {
                $array[$key] = removeNodesAndEdges($val);
            }
        } else if (is_array($array) && isset($array['edges'])) {
            $array = $array['edges'];
            foreach ($array as &$value) {
                $value = $value['node'];
                foreach ($value as &$val) {
                    if (isset($val['edges']) || is_array($val)) {
                        removeNodesAndEdges($val);
                    }
                }
            }
        }
        return $array;
    }
}

if (!function_exists('findVendor')) {
    function findVendor($tags, $shopify_vendor, $user)
    {
        $tags = explode(',', $tags);
        foreach ($tags as $key => $tag) {
            $tags[$key] = trim($tag);
        }
        // Log::info(json_encode($tags));
        $vendor = OSVendor::where('type', "tags")->where(function ($q) use ($tags) {
            $q->whereHas('tags_rel', function ($q) use ($tags) {
                $q->whereIn('name', $tags);
            });
        })->first();

        if (!$vendor) {
            //WHERE HAS WITHIN WHERE HAS. IT IS GOOD WHEN NEEDED TO APPLY QUERY ON SECOND OR THIRD LEVEL.
            $vendor = OSVendor::where('user_id', $user->id)->where('type', "shopify_vendor")->whereHas('vendors', function ($q) use ($shopify_vendor) {
                $q->whereHas('shopify_vendor', function ($q) use ($shopify_vendor) {
                    $q->where('name', $shopify_vendor);
                });
            })->first();
        }

        // Log::info(json_encode($vendor));
        return $vendor;
    }
}

if (!function_exists('orderSplitterJob')) {
    function orderSplitterJob($user, $payload, $testing = null)
    {
        // NULL CUSTOMER CHECK
        if(!$payload->customer) {  
            $final['status'] = false;
            $final['message'] = 'Order has no customer - Order Splitter Check';
            return $final;
        }
        
        $payload->line_items = collect($payload->line_items)->map(function ($line_item) {
            $line_item->properties = collect($line_item->properties)->reject(function ($property) {
                return isset($property->name) && $property->name == '_distinct';
            })->values()->all();
            return $line_item;
        })->all();
        // Log::info(json_encode($payload));

        $myOrder = $payload;
        $payload = $payload;
        $shopUser = $user;

        $filteredObjects = $user->applications->where('id', 1);
        $filteredObjects = $filteredObjects->first();

        // Log::info("ORDER SPLITTER WORKING AND STATUS IS " . json_encode($filteredObjects->pivot->status));

        if (!$filteredObjects->pivot->status) {
            $final['status'] = false;
            $final['message'] = 'Application is off!';
            return $final;
        }

        //CHECKING IF THE STATUS OF APP IS ON THEN RUN ORDER SPLITTER
        if ($filteredObjects->pivot->status) {
            //MASSAB OLD CODE
            $new_split_order = new OSSplitOrder;
            $new_split_order->user_id = $shopUser->id;
            $new_split_order->name = $myOrder->name;
            $new_split_order->shopify_order_id = $myOrder->id;
            $new_split_order->shopify_customer_id = $myOrder->customer->id;
            $new_split_order->order_no = $myOrder->order_number;
            $new_split_order->billing_address = ($myOrder->billing_address !== null) ? $myOrder->billing_address->address1 : null;
            $new_split_order->shipping_address = ($myOrder->shipping_address !== null) ? $myOrder->shipping_address->address1 : null;
            $new_split_order->email = $myOrder->customer->email;
            $new_split_order->phone = $myOrder->customer->phone;
            $new_split_order->country = ($myOrder->shipping_address !== null) ? $myOrder->shipping_address->country : null;
            // $new_split_order->line_items = (json_encode($myOrder->line_items));
            $new_split_order->total_price = $myOrder->total_price;

            if (!$testing) {
                $new_split_order->save();

                OrderSplitterLog::create([
                    'user_id' => $shopUser->id,
                    'o_s_split_order_id' => $new_split_order->id,
                    'type' => "info",
                    'description' => "Order #$new_split_order->order_no has been added to Order Splitter"
                ]);
            }

            $line_items = collect($payload->line_items);
            // Log::info(json_encode($line_items));

            // Log::info(json_encode($shopUser));

            $product_ids = $line_items->pluck('product_id')->toArray();
            $product_ids = implode(",", $product_ids);
            $productsApi = $shopUser->api()->rest('GET', '/admin/api/2022-07/products.json', [
                'ids' => $product_ids,
                'fields' => 'id,tags,images,image,vendor'
            ]);

            $product_tags = collect($productsApi['body']['products']);

            $line_items = $line_items->transform(function ($value) use ($product_tags, $shopUser) {
                $value->vendor_id = null;
                $product = $product_tags->where('id', $value->product_id)->first();
                if ($product) {
                    $tags = $product['tags'];
                    $shopify_vendor = $product['vendor'];
                    // Log::info("VENDOR INFO");
                    $vendor = findVendor($tags, $shopify_vendor, $shopUser);
                    // Log::info(json_encode($vendor));

                    if (isset($vendor)) {
                        $value->vendor_id = $vendor->id;
                        // Log::info("VENDOR FOUND");
                    } else {
                        // Log::info("VENDOR NOT FOUND");
                    }
                }
                return $value;
            });

            // Log::info(json_encode($line_items));

            $line_items = $line_items->groupBy('vendor_id')->toArray();

            // Log::info(json_encode($line_items));

            foreach ($line_items as $key => $group) {

                // Log::info("FINDING ID: " . $key);
                $titles = collect($group)->pluck('title')->toArray();
                // Log::info("FINDING GROUP: " . json_encode($titles));
                $vendor = OSVendor::with(['tags_rel', 'vendors.shopify_vendor'])->find($key);
                // Log::info("VENDOR DETAIL");
                // Log::info(json_encode($vendor));

                if (isset($vendor)) {

                    $order = new LaravelOrder();

                    if (isset($payload->shipping_address)) {
                        $payload_shipping_address = $payload->shipping_address;
                    }

                    if (isset($payload->billing_address)) {
                        $payload_billing_lines = $payload->billing_address;
                    }

                    foreach ($group as $line_item) {
                        $product = $product_tags->where('id', $line_item->product_id)->first();
                        $weight = new Weight();
                        $weight->units = 'grams';
                        $weight->value = $line_item->grams;
                        $orderItem = new OrderItem();
                        $orderItem->lineItemKey = $line_item->id;
                        $orderItem->sku = $line_item->sku;
                        $orderItem->name = $line_item->title;
                        $orderItem->quantity = $line_item->fulfillable_quantity;
                        $orderItem->unitPrice  = $line_item->price;
                        $orderItem->weight  = $weight;
                        $orderItem->imageUrl  = @$product['image']['src'];
                        $orderItem->options = $line_item->properties;
                        $order->items[] = $orderItem;
                    }

                    $bill_to_address = null;
                    if (isset($payload->billing_address)) {
                        $bill_to_address = new Address();
                        $bill_to_address->name = $payload_billing_lines->first_name . ' ' . $payload_billing_lines->last_name;
                        $bill_to_address->street1 = $payload_billing_lines->address1;
                        $bill_to_address->street2 = $payload_billing_lines->address2;
                        $bill_to_address->city = $payload_billing_lines->city;
                        $bill_to_address->state = $payload_billing_lines->province;
                        $bill_to_address->postalCode = $payload_billing_lines->zip;
                        $bill_to_address->country = "US";
                        $bill_to_address->phone = $payload_billing_lines->phone;
                    }

                    $ship_to_address = null;
                    if (isset($payload->shipping_address)) {
                        $ship_to_address = new Address();
                        $ship_to_address->name = $payload_shipping_address->first_name . ' ' . $payload_shipping_address->last_name;
                        $ship_to_address->street1 = $payload_shipping_address->address1;
                        $ship_to_address->street2 = $payload_shipping_address->address2;
                        $ship_to_address->city = $payload_shipping_address->city;
                        $ship_to_address->state = $payload_shipping_address->province;
                        $ship_to_address->postalCode = $payload_shipping_address->zip;
                        $ship_to_address->country = "US";
                        $ship_to_address->phone = $payload_shipping_address->phone;
                    }

                    $advanced_options = new AdvancedOptions();
                    $advanced_options->storeId = $vendor->vendor_store_id;
                    $advanced_options->warehouseId = 0;
                    $order->orderNumber = $payload->name;
                    $order->customerEmail = $payload->email;
                    $order->orderDate = $payload->created_at;
                    $order->amountPaid = $payload->subtotal_price;
                    $order->taxAmount = $payload->total_tax;
                    $order->shippingAmount = $payload->total_shipping_price_set->shop_money->amount;
                    $order->orderStatus = 'awaiting_shipment';
                    $order->billTo = $bill_to_address;
                    $order->shipTo = $ship_to_address;
                    $order->advancedOptions = $advanced_options;

                    if (count($payload->shipping_lines) > 0) {
                        $order->requestedShippingService = $payload->shipping_lines[0]->title;
                    }

                    $orders_arr = array($order);
                    $curl = curl_init();
                    $keys_pub = $vendor->vendor_private_key;
                    $keys_sec = $vendor->vendor_secret_key;
                    $auth_key = base64_encode($keys_pub . ":" . $keys_sec);

                    if (!$testing) {
                        $response_api = Http::connectTimeout(90)->timeout(90)->withHeaders([
                            'Content-Type' => 'application/json',
                            'Authorization' => 'Basic ' . $auth_key
                        ])->post('https://ssapi.shipstation.com/orders/createorders', $orders_arr);
                        $json_api = $response_api->json();

                        // Log::info(json_encode($json_api));
                    }

                    //OLD MASSAB CODE
                    $new_order_vendor = new OSVendorOrder;
                    $new_order_vendor->split_order_id = $new_split_order->id ?? null;
                    $new_order_vendor->user_id = $shopUser->id;
                    $new_order_vendor->order_id = $myOrder->id;
                    $new_order_vendor->shipstation_order_id = @$json_api['results'][0]['orderId'];
                    $new_order_vendor->order_no = $myOrder->order_number;
                    $new_order_vendor->shopify_customer_id = $myOrder->customer->id;
                    $new_order_vendor->vendor_id = $vendor->id;
                    $new_order_vendor->vendor_name = $vendor->vendor_name;
                    $new_order_vendor->product_names = implode(', ', $titles);
                    // $new_order_vendor->order_items = json_encode($order->items);

                    if (!$testing) {
                        $new_order_vendor->save();

                        $new_split_order->ship_station_status = true;
                        $new_split_order->save();

                        OrderSplitterLog::create([
                            'user_id' => $shopUser->id,
                            'o_s_split_order_id' => $new_split_order->id,
                            'type' => "success",
                            'description' => "$vendor->vendor_name of line items within Order #$new_split_order->order_no has been found for [" . implode(', ', $titles) . "]"
                        ]);
                    }
                } else {

                    $new_order_vendor = new OSVendorOrder;
                    $new_order_vendor->split_order_id = $new_split_order->id ?? null;
                    $new_order_vendor->user_id = $shopUser->id;
                    $new_order_vendor->order_id = $myOrder->id;
                    // $new_order_vendor->shipstation_order_id = NULL;
                    $new_order_vendor->order_no = $myOrder->order_number;
                    $new_order_vendor->shopify_customer_id = $myOrder->customer->id;
                    $new_order_vendor->product_names = implode(', ', $titles);
                    // $new_order_vendor->vendor_id = NULL;
                    // $new_order_vendor->vendor_name = NULL;
                    // $new_order_vendor->order_items = NULL;

                    if (!$testing) {
                        $new_order_vendor->save();

                        OrderSplitterLog::create([
                            'user_id' => $shopUser->id,
                            'o_s_split_order_id' => $new_split_order->id,
                            'type' => "info",
                            'description' => "No Vendor for line items within Order #$new_split_order->order_no for [" . implode(', ', $titles) . "]"
                        ]);
                    }
                }
            }

            if (!$testing) {
                if ($new_split_order->ship_station_status) {
                    OrderSplitterLog::create([
                        'user_id' => $shopUser->id,
                        'o_s_split_order_id' => $new_split_order->id,
                        'type' => "success",
                        'description' => "One of the vendor of line items of Order #$new_split_order->order_no has been shipped to ShipStaion"
                    ]);
                } else {
                    OrderSplitterLog::create([
                        'user_id' => $shopUser->id,
                        'o_s_split_order_id' => $new_split_order->id,
                        'type' => "error",
                        'description' => "No vendor of line items of Order #$new_split_order->order_no sent to ShipStation"
                    ]);
                }
            }

            // Log::info(json_encode($product_tags, JSON_PRETTY_PRINT));
        }

        $final['status'] = true;
        $final['message'] = 'Order Placed Successfully';
        return $final;
    }
}

if (!function_exists('calculateDueDate')) {
    function calculateDueDate($days, $excludedDates, $exclude)
    {
        // Assuming excludedDates are in 'm-d' format directly
        $excludedDatesFormatted = [];
        foreach ($excludedDates as $date) {
            $excludedDatesFormatted[] = $date;
        }

        $currentDate = new DateTime();
        $dueDate = clone $currentDate;
        $addedDays = 0;

        while ($addedDays < $days) {
            $dueDate->modify('+1 day');
            $dayOfWeek = $dueDate->format('N');
            $formattedDate = $dueDate->format('m-d');

            // Check if the day is a weekend or an excluded date
            if ((!$exclude || $dayOfWeek < 6) && !in_array($formattedDate, $excludedDatesFormatted)) {
                $addedDays++;
            }
        }

        return $dueDate->format('Y-m-d');
    }
}

if (!function_exists('replaceSpecialCharacters')) {
    function replaceSpecialCharacters($input_string)
    {
        // Replace apostrophes with a space
        $result = preg_replace("/'/", ' ', $input_string);
        // Return the result
        return $result;
    }
}

if (!function_exists('removeHash')) {
    function removeHash($inputString)
    {
        return str_replace('#', '', $inputString);
    }
}

if (!function_exists('simplexml_read_entire_element')) {
    function simplexml_read_entire_element(\SimpleXMLElement $element, $glue = ', ')
    {
        $string = '';

        // If element has more than one child, process the children
        if ($element->count() > 1) {
            foreach ($element as $child) {
                $string .= (string) $child . $glue;
            }

            // Remove the trailing glue, if any
            $string = rtrim($string, $glue);

            return $string;
        }

        // Otherwise, return the element as a string
        return (string) $element;
    }
}
