<?php

use App\Jobs\InConnect\IntacctProductCreateJob;
use App\Models\Collection;
use App\Models\CollectionProduct;
use App\Models\VirtualOptions\Color;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\Analytics\ALReportLog;
use App\Models\InConnect\ShopifySize;
use App\Models\InConnect\ProductType;
use App\Models\VirtualOptions\UserColor;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
