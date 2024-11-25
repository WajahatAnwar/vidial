<?php

use App\Models\Collection;
use App\Models\CollectionProduct;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Exception\ConnectException;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;

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
                                'compare_at_price' => $variant['node']['compareAtPrice']
                            ];
                        }

                        ProductVariant::upsert($variantsData, ['variant_id'], [
                            'product_id',
                            'user_id',
                            'title',
                            'option1',
                            'option2',
                            'option3',
                            'price',
                            'image_url',
                            'quantity',
                            'sku',
                            'compare_at_price'
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

                                    $fetchedCollections = collect($fetchedCollections)->map(function ($collection) use ($existing_collection, $productsUpdated) {
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
                    'product_tags',
                    'product_title',
                    'product_handle',
                    'product_vendor',
                    'product_type',
                    'user_id',
                    'description',
                    'product_image',
                    'status',
                    'product_created_at',
                    'product_tracked',
                    'total_inventory',
                    'published_at'
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

        if ($intacctSync)
            $user->product_sync = Carbon::now();
        else
            $user->collection_sync = Carbon::now();
        $user->save();

        // sendApiLog(true, $user->name, 'PRODUCTS AND COLLECTIONS SYNC SUCCESS');
    }
}

if (!function_exists('deleteImages')) {
    function deleteImages($product_id, $user, $fetchedImages)
    {
        ProductImage::where('user_id', $user->id)
            ->where('product_id', $product_id)
            ->whereNotIn('image_id', $fetchedImages)
            ->delete();
    }
}

if (!function_exists('deleteVariants')) {
    function deleteVariants($product_id, $user, $fetchedVariants)
    {
        ProductVariant::where('user_id', $user->id)
            ->where('product_id', $product_id)
            ->whereNotIn('variant_id', $fetchedVariants)
            ->delete();
    }
}

if (!function_exists('deleteCollections')) {
    function deleteCollections($user, $fetchedCollections)
    {
        $ids = collect($fetchedCollections)->pluck('collection_id');
        Collection::where('user_id', $user->id)->whereNotIn('collection_id', $ids)->get()->each(function ($collection) use ($user) {
            CollectionProduct::where('user_id', $user->id)->where('collection_id', $collection->collection_id)->delete();
        });
        Collection::where('user_id', $user->id)->whereNotIn('collection_id', $ids)->delete();
        collect($fetchedCollections)->each(function ($collection) use ($user) {
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

//VIDIAL FUNCTIONS ####################################################################################

if (!function_exists('update_log_file')) {
    function update_log_file($data)
    {
        // create log into DB
        Log::create($data);
    }
}

// Dropbox
if (!function_exists('getDropboxToken')) {
    function getDropboxToken()
    {
        $dropbox = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode(env('DROPBOX_CLIENT_ID') . ':' . env('DROPBOX_SECRET_ID'))
        ])->asForm()->post('https://api.dropboxapi.com/oauth2/token', [
            'grant_type' => 'authorization_code',
            'code' => env('AUTHORIZATION_CODE', '_UAy1dwO1s4AAAAAAAAAHEFoDnr9-Ppfe8hkLu_Ougw')
        ]);
        return $dropbox->json();
    }
}

if (!function_exists('updateDropboxToken')) {
    function updateDropboxToken()
    {
        $dropbox = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode(env('DROPBOX_CLIENT_ID') . ':' . env('DROPBOX_SECRET_ID'))
        ])->asForm()->post('https://api.dropboxapi.com/oauth2/token', [
            'grant_type' => 'refresh_token',
            'refresh_token' => env('REFRESH_TOKEN')
        ]);
        // Config::set('dropbox.accessToken', $dropbox['access_token']);
        return $dropbox->json();
    }

    if (!function_exists('dateFormat')) {
        function dateFormat($date)
        {
            return $date;
            return $newDate = Carbon::createFromFormat('Y-m-d H:i:s', $date)
                ->format('m/d/Y');
        }
    }
}
/***** set language ******/
if (!function_exists('setLan')) {
    function setLan($locale)
    {
        return App::setLocale($locale);
    }
}
/***** Split store name ******/
if (!function_exists('splitStoreName')) {
    function splitStoreName($store)
    {
        $store = explode(".", $store, 2);
        return $store[0];
    }
}

/****** check link expiration  *******/
if (!function_exists('checkLinkExpiration')) {
    function checkLinkExpiration($request)
    {
        // check link expiration
        if ($request->filled('order_id')) {
            try {
                $order_id = Crypt::decryptString($request->order_id);
                $order = Orders::find($order_id);


                // check order existance
                if (!$order) {
                    return abort(404);
                }
                // check replied or not
                if ($order->replied) {
                    return abort(419);
                }
                return $order;
            } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                return abort(404);
            }
        }
        return false;
    }
}

/********** get currency symbol ******/
if (!function_exists('getCurrencySymbol')) {
    function getCurrencySymbol($currency_code)
    {
        $currencies = array(
            "GBP" => "£",
            "USD" => "$",
            "EUR" => "€",
            "TRY" => "₺",
            "JPY" => "¥",
            "AUD" => "$",
            "CAD" => "$"
        );
        if (isset($currencies[$currency_code])) {
            return $currencies[$currency_code];
        }
        return $currency_code;
    }
}

/****** sending mail ******/

if (!function_exists('sendMail')) {
    function sendMail($to, $subject, $view, $data = [], $from = 'Vidial', $user_id)
    {
        try {
            $api_secret_key = env('MAILGUN_SECRET');
            $end_point = env('MAILGUN_ENDPOINT');
            $domain = env('MAILGUN_DOMAIN');
            $mail_user_name = env('MAIL_USERNAME');
            $emailCreds = EmailCredentials::where('user_id', $user_id)->where('is_active', 1)->first();
            if ($emailCreds) {
                $api_secret_key = $emailCreds->api_secret_key;
                $end_point = $emailCreds->endpoint;
                $domain = $emailCreds->domain;
                $mail_user_name = $emailCreds->mail_user_name;
            }
            $mgClient = Mailgun::create(
                $api_secret_key, // Mailgun API Key
                $end_point
            );
            //$domain = env('MAILGUN_DOMAIN');

            $html = view($view, $data)->render();

            $params = [
                'from' => $from . " < " . $mail_user_name . " >",
                'to' => $to,
                'subject' => $subject,
                'html' => $html,
            ];

            $mgClient->messages()->send($domain, $params);

            // Return true if email sending is successful
            return true;
        } catch (\Exception $e) {
            // Log the error
            CustomLog::info('Error sending email: ' . $e->getMessage());

            // Return false to indicate failure
            return false;
        }
    }
}

if (!function_exists('emailLanguageConverter')) {
    function emailLanguageConverter($locale, $user_id)
    {

        $user = User::with('settings')->find($user_id);
        saveEnLanguage($locale, $user_id, $user);
    }
}

if (!function_exists('saveEnLanguage')) {
    function saveEnLanguage($locale, $user_id, $user)
    {
        if ($locale == 'en') {
            $Eng = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Claim your discount code",
                    'type' => 'UGC_Star_Approved',
                    'body' => '<p style="text-align: left;">Hello,</p>
<p style="text-align: left;">Congratulations, your video has been approved and marked as a Star video! This means you’re getting an even better discount for submitting an especially great video.&nbsp;</p>
<p style="text-align: left;">We appreciate your support and thank you so much for taking the time to make your video.</p>
<p style="text-align: left;">Here is your Discount code:</p>
<h1 style="text-align: left;">{{discount_code}}</h1>
<p style="text-align: left;">You can use this code at the checkout to receive your {{amount}} discount.<br><br>{{button}}</p>',
                    'btn_text' => 'Shop Now',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Claim your discount code",
                    'type' => 'UGC_Approved',
                    'body' => '<p style="text-align: left;">Hello,</p>
<p style="text-align: left;">Congratulations, your video has been approved!&nbsp;</p>
<p style="text-align: left;">We appreciate your support and thank you so much for taking the time to make your video.</p>
<p style="text-align: left;">Here is your Discount code:</p>
<h1 style="text-align: left;">{{discount_code}}</h1>
<p style="text-align: left;">You can use this code at the checkout to receive your {{amount}} Discount.<br><br>{{button}}</p>',
                    'btn_text' => 'Shop Now',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Send a video and we'll send a big discount",
                    'type' => 'Post_Purchase',
                    'body' => "<p style='text-align: left;'>Hello {{name}},</p>
<p style='text-align: left;'>You recently made a purchase from us and we'd love to hear your thoughts!</p>
<p style='text-align: left;'>We are offering a <strong>{{amount}} discount code</strong> to our store in exchange for a video where you give us feedback about your experience.</p>
<p style='text-align: left;'>Could you take 30 seconds of your time for <strong>{{amount}} </strong>?</p><p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Record Video',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Update about your video",

                    'type' => 'UGC_Declined',
                    'body' => '<p style="text-align: left;">Hello,</p>
<p style="text-align: left;">Sorry, your video was not approved for the following reason:</p>
<p style="text-align: left;"><em>&ldquo;{{reason_decline}}&rdquo;</em></p>
<p style="text-align: left;">No worries, you can still try again and get your <strong>{{amount}}</strong>!</p>
<p style="text-align: left;">{{button}}</p>',
                    'btn_text' => 'Record Video',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Share your Thoughts on {{storename}}",
                    'type' => 'Reminder',
                    'body' => "<p style='text-align: left;'>Hello {{name}},</p>
<p style='text-align: left;'>We noticed you haven't yet submitted your video review!&nbsp;</p>
<p style='text-align: left;'>Remember, we're offering a <strong>{{amount}} discount code</strong> for just 30 seconds of your time!</p>
<p style='text-align: left;'>Your thoughts and feedback are important to us, and we're excited to hear what you think about your purchase.</p>
<p style='text-align: left;'>Don't miss out on this opportunity. Could you take 30 seconds to share your experience and claim your <strong>{{amount}} Gift Card</strong>?<br><br>{{button}}</p>",
                    'btn_text' => 'Submit a Review',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                )
            );

            foreach ($Eng as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }

        /**** French ******/
        if ($locale == 'fr') {
            $fr = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Réclamez votre carte-cadeau de {{amount}}!",
                    'type' => 'UGC_Star_Approved',
                    'body' => "<p style='text-align: left;'>Bonjour,&nbsp;</p>
<p style='text-align: left;'>F&eacute;licitations, votre avis vid&eacute;o pour {{storename}} a &eacute;t&eacute; approuv&eacute;!</p>
<p style='text-align: left;'>Nous sommes constamment inspir&eacute;s par la cr&eacute;ativit&eacute; et la passion de nos clients, et nous appr&eacute;cions votre soutien.</p>
<p style='text-align: left;'>Voici votre code de r&eacute;duction :</p>
<h1 style='text-align: left;'><strong>{{discount_code}}</strong></h1>
<p style='text-align: left;'>Vous pouvez utiliser le code au moment de l&rsquo;achat pour recevoir votre r&eacute;duction de {{amount}}.</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Achetez Maintenant',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Réclamez votre carte-cadeau de {{amount}}!",
                    'type' => 'UGC_Approved',
                    'body' => "<p style='text-align: left;'>Bonjour,&nbsp;</p>
<p style='text-align: left;'>F&eacute;licitations, votre avis vid&eacute;o pour {{storename}} a &eacute;t&eacute; approuv&eacute;!</p>
<p style='text-align: left;'>Nous sommes constamment inspir&eacute;s par la cr&eacute;ativit&eacute; et la passion de nos clients, et nous appr&eacute;cions votre soutien.</p>
<p style='text-align: left;'>Voici votre code de r&eacute;duction :</p>
<h1 style='text-align: left;'><strong>{{discount_code}}</strong></h1>
<p style='text-align: left;'>Vous pouvez utiliser le code au moment de l&rsquo;achat pour recevoir votre r&eacute;duction de {{amount}}.</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Achetez Maintenant',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Nous avons une question pour vous",
                    'type' => 'Post_Purchase',
                    'body' => "<p style='text-align: left;'>Bonjour {{name}},</p>
<p style='text-align: left;'>Vous avez r&eacute;cemment fait un achat chez {{storename}}. Nous aimerions conna&icirc;tre votre avis!</p>
<p style='text-align: left;'>Nous aimerions vous offrir une <strong>carte-cadeau de {{amount}}</strong> pour notre boutique en &eacute;change d'une courte vid&eacute;o o&ugrave; vous partagez votre avis sur votre achat.</p>
<p style='text-align: left;'>Pourriez-vous prendre 30 secondes de votre temps pour une <strong>carte-cadeau de {{amount}}</strong>?</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Je donne mon avis',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Message concernant votre avis",
                    'type' => 'UGC_Declined',
                    'body' => "<p style='text-align: left;'>Bonjour,</p>
<p style='text-align: left;'>D&eacute;sol&eacute;, votre avis vid&eacute;o pour {{storename}} n'a pas &eacute;t&eacute; approuv&eacute; pour la raison suivante :</p>
<p style='text-align: left;'><em>&ldquo;{{reason_decline}}&rdquo;</em></p>
<p style='text-align: left;'>Ne vous inqui&eacute;tez pas, vous pouvez toujours essayer &agrave; nouveau et obtenir votre carte-cadeau de <strong>{{amount}}</strong>!</p>
<p style='text-align: left;'>&nbsp;</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Je donne mon avis',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Partagez votre avis sur {{storename}}",
                    'type' => 'Reminder',
                    'body' => "<p style='text-align: left;'>Bonjour {{name}},</p>
<p style='text-align: left;'>Nous avons remarqu&eacute; que vous n'avez pas encore soumis votre avis vid&eacute;o pour votre r&eacute;cent achat chez {{storename}}.&nbsp;</p>
<p style='text-align: left;'>Rappelez-vous, nous offrons une <strong>carte-cadeau de {{amount}}</strong> pour seulement 30 secondes de votre temps!</p>
<p style='text-align: left;'>Vos impressions et vos commentaires sont importants pour nous, et nous sommes impatients d'entendre ce que vous pensez de votre achat.</p>
<p style='text-align: left;'>Ne manquez pas cette opportunit&eacute;. Pourriez-vous prendre 30 secondes pour partager votre exp&eacute;rience et r&eacute;clamer votre <strong>carte-cadeau de {{amount}}</strong>?</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Je donne mon avis',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                )
            );

            foreach ($fr as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }


        /*** German ***/

        if ($locale == 'de') {
            $de = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Fordern Sie Ihre {{amount}} Geschenkkarte an!",
                    'type' => 'UGC_Star_Approved',
                    'body' => "<p style='text-align: left;'>Hallo,&nbsp;</p>
<p style='text-align: left;'>Gl&uuml;ckwunsch, Ihre Video-Bewertung f&uuml;r {{storename}} wurde genehmigt!</p>
<p style='text-align: left;'>Wir sind st&auml;ndig von der Kreativit&auml;t und Leidenschaft unserer Kunden inspiriert und wir sch&auml;tzen Ihre Unterst&uuml;tzung.</p>
<p style='text-align: left;'>Hier ist Ihr Rabattcode:</p>
<h1 style='text-align: left;'><strong>{{discount_code}}</strong></h1>
<p style='text-align: left;'>Sie k&ouml;nnen diesen Code an der Kasse verwenden, um Ihren {{amount}} Rabatt zu erhalten</p>

<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Jetzt kaufen',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Fordern Sie Ihre {{amount}} Geschenkkarte an!",
                    'type' => 'UGC_Approved',
                    'body' => "<p style='text-align: left;'>Hallo,&nbsp;</p>
<p style='text-align: left;'>Gl&uuml;ckwunsch, Ihre Video-Bewertung f&uuml;r {{storename}} wurde genehmigt!</p>
<p style='text-align: left;'>Wir sind st&auml;ndig von der Kreativit&auml;t und Leidenschaft unserer Kunden inspiriert und wir sch&auml;tzen Ihre Unterst&uuml;tzung.</p>
<p style='text-align: left;'>Hier ist Ihr Rabattcode:</p>
<h1 style='text-align: left;'><strong>{{discount_code}}</strong></h1>
<p style='text-align: left;'>Sie k&ouml;nnen diesen Code an der Kasse verwenden, um Ihren {{amount}} Rabatt zu erhalten</p>

<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Jetzt kaufen',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Wir haben eine Frage an Sie",
                    'type' => 'Post_Purchase',
                    'body' => "<p style='text-align: left;'>Hallo {{name}},</p>
<p style='text-align: left;'>Sie haben k&uuml;rzlich bei {{storename}} eingekauft. Wir w&uuml;rden gerne Ihre Meinung h&ouml;ren!</p>
<p style='text-align: left;'>Wir m&ouml;chten Ihnen eine <strong>{{amount}} Geschenkkarte</strong> f&uuml;r unseren Shop anbieten, im Austausch f&uuml;r ein kurzes Video, in dem Sie Ihre Eindr&uuml;cke von Ihrem Kauf teilen.</p>
<p style='text-align: left;'>W&uuml;rden Sie 30 Sekunden Ihrer Zeit f&uuml;r eine <strong>{{amount}} Geschenkkarte</strong> aufwenden?</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Ich bewerte',
                    'btn_color' => '#28282B',
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Nachricht zu Ihrer Bewertung",
                    'type' => 'UGC_Declined',
                    'body' => "<p style='text-align: left;'>Hallo,<br>Leider wurde Ihre Video-Bewertung f&uuml;r {{storename}} aus folgendem Grund nicht genehmigt:</p>
<p style='text-align: left;'><em>&ldquo;{{reason_decline}}&rdquo;</em></p>
<p style='text-align: left;'>Machen Sie sich keine Sorgen, Sie k&ouml;nnen es immer noch einmal versuchen und Ihre <strong>{{amount}}</strong> Geschenkkarte erhalten!</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Ich bewerte',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Teilen Sie Ihre Meinung über {{storename}}",
                    'type' => 'Reminder',
                    'body' => "<p style='text-align: left;'>Hallo {{name}},</p>
<p style='text-align: left;'>Wir haben bemerkt, dass Sie Ihre Video-Bewertung f&uuml;r Ihren k&uuml;rzlichen Einkauf bei {{storename}} noch nicht eingereicht haben.</p>
<p style='text-align: left;'>&nbsp;Denken Sie daran, wir bieten eine <strong>{{amount}} Geschenkkarte</strong> f&uuml;r nur 30 Sekunden Ihrer Zeit!</p>
<p style='text-align: left;'>Ihre Gedanken und Ihr Feedback sind uns wichtig, und wir freuen uns darauf, was Sie &uuml;ber Ihren Einkauf denken.</p>
<p style='text-align: left;'>Verpassen Sie nicht diese Gelegenheit. K&ouml;nnten Sie sich 30 Sekunden Zeit nehmen, um Ihre Erfahrung zu teilen und Ihre <strong>{{amount}} Geschenkkarte</strong> zu beanspruchen?</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Ich bewerte',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                )
            );

            foreach ($de as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }

        /**** Spanish ***/

        if ($locale == 'es') {
            $sp = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "¡Reclama tu tarjeta de regalo de {{amount}}!",
                    'type' => 'UGC_Star_Approved',
                    'body' => "<p style='text-align: left;'>Hola,&nbsp;</p>
<p style='text-align: left;'>&iexcl;Felicidades, tu rese&ntilde;a en v&iacute;deo para {{storename}} ha sido aprobada!</p>
<p style='text-align: left;'>Nos inspira constantemente la creatividad y la pasi&oacute;n de nuestros clientes, y apreciamos tu apoyo.</p>
<p style='text-align: left;'>Aqu&iacute; est&aacute; tu c&oacute;digo de descuento:</p>
<h1 style='text-align: left;'><strong>{{discount_code}}</strong></h1>
<p style='text-align: left;'>Puedes usar este c&oacute;digo en la caja para recibir tu descuento de {{amount}}.</p>
<p style='text-align: center;'>{{button}}</p>
",
                    'btn_text' => 'Comprar ahora',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "¡Reclama tu tarjeta de regalo de {{amount}}!",
                    'type' => 'UGC_Approved',
                    'body' => "<p style='text-align: left;'>Hola,&nbsp;</p>
<p style='text-align: left;'>&iexcl;Felicidades, tu rese&ntilde;a en v&iacute;deo para {{storename}} ha sido aprobada!</p>
<p style='text-align: left;'>Nos inspira constantemente la creatividad y la pasi&oacute;n de nuestros clientes, y apreciamos tu apoyo.</p>
<p style='text-align: left;'>Aqu&iacute; est&aacute; tu c&oacute;digo de descuento:</p>
<h1 style='text-align: left;'><strong>{{discount_code}}</strong></h1>
<p style='text-align: left;'>Puedes usar este c&oacute;digo en la caja para recibir tu descuento de {{amount}}.</p>
<p style='text-align: center;'>{{button}}</p>
",
                    'btn_text' => 'Comprar ahora',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Tenemos una pregunta para ti",
                    'type' => 'Post_Purchase',
                    'body' => "<p style='text-align: left;'>Hola {{name}},</p>
<p style='text-align: left;'>Has hecho una compra recientemente en {{storename}}. &iexcl;Nos gustar&iacute;a conocer tu opini&oacute;n!</p>
<p style='text-align: left;'>Nos gustar&iacute;a ofrecerte una <strong>tarjeta regalo de {{amount}}</strong> para nuestra tienda a cambio de un breve v&iacute;deo en el que compartas tu opini&oacute;n sobre tu compra.</p>
<p style='text-align: left;'>&iquest;Podr&iacute;as dedicar 30 segundos de tu tiempo a cambio de una <strong>tarjeta regalo de {{amount}}</strong>?</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Dejo mi opinión',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Mensaje acerca de tu reseña",
                    'type' => 'UGC_Declined',
                    'body' => "<p style='text-align: left;'>Hola,</p>
<p style='text-align: left;'>Lo sentimos, tu rese&ntilde;a en v&iacute;deo para {{storename}} no fue aprobada por la siguiente raz&oacute;n:</p>
<p style='text-align: left;'><em>&ldquo;{{reason_decline}}&rdquo;</em></p>
<p style='text-align: left;'>&iexcl;No te preocupes, a&uacute;n puedes intentarlo de nuevo y obtener tu tarjeta de regalo de <strong>{{amount}}</strong>!</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Dejo mi opinión',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Comparte tu opinión sobre {{storename}}",
                    'type' => 'Reminder',
                    'body' => "<p style='text-align: left;'>Hola {{name}},</p>
<p style='text-align: left;'>Hemos notado que a&uacute;n no has enviado tu rese&ntilde;a en v&iacute;deo sobre tu reciente compra en {{storename}}.&nbsp;</p>
<p style='text-align: left;'>Recuerda, &iexcl;estamos ofreciendo una <strong>tarjeta de regalo de {{amount}}</strong> por solo 30 segundos de tu tiempo!</p>
<p style='text-align: left;'>Tus pensamientos y comentarios son importantes para nosotros, y estamos emocionados de escuchar lo que piensas sobre tu compra.</p>
<p style='text-align: left;'>No te pierdas esta oportunidad. &iquest;Podr&iacute;as tomar 30 segundos para compartir tu experiencia y reclamar tu <strong>tarjeta de regalo de {{amount}}</strong>?</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Dejo mi opinión',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                )
            );

            foreach ($sp as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }

        /*** Portuguese ***/
        if ($locale == 'pt') {
            $portu = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Reivindique o seu cartão-presente de {{amount}}!",
                    'type' => 'UGC_Star_Approved',
                    'body' => "<p style='text-align: left;'>Ol&aacute;,</p>
<p style='text-align: left;'>Parab&eacute;ns, a sua avalia&ccedil;&atilde;o em v&iacute;deo para a {{storename}} foi aprovada!</p>
<p style='text-align: left;'>Estamos constantemente inspirados pela criatividade e paix&atilde;o dos nossos clientes, e agradecemos o seu apoio.</p>
<p style='text-align: left;'>Aqui est&aacute; o seu c&oacute;digo de desconto:</p>
<h1 style='text-align: left;'><strong>{{discount_code}}</strong></h1>
<p style='text-align: left;'>Voc&ecirc; pode usar este c&oacute;digo no momento da compra para receber o seu desconto de {{amount}}.</p>

<p style='text-align: center;'>{{button}}</p>
",
                    'btn_text' => 'Compre Agora',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Reivindique o seu cartão-presente de {{amount}}!",
                    'type' => 'UGC_Approved',
                    'body' => "<p style='text-align: left;'>Ol&aacute;,</p>
<p style='text-align: left;'>Parab&eacute;ns, a sua avalia&ccedil;&atilde;o em v&iacute;deo para a {{storename}} foi aprovada!</p>
<p style='text-align: left;'>Estamos constantemente inspirados pela criatividade e paix&atilde;o dos nossos clientes, e agradecemos o seu apoio.</p>
<p style='text-align: left;'>Aqui est&aacute; o seu c&oacute;digo de desconto:</p>
<h1 style='text-align: left;'><strong>{{discount_code}}</strong></h1>
<p style='text-align: left;'>Voc&ecirc; pode usar este c&oacute;digo no momento da compra para receber o seu desconto de {{amount}}.</p>

<p style='text-align: center;'>{{button}}</p>
",
                    'btn_text' => 'Compre Agora',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Temos uma pergunta para você",
                    'type' => 'Post_Purchase',
                    'body' => "<p style='text-align: left;'>Ol&aacute; {{name}},</p>
<p style='text-align: left;'>Voc&ecirc; fez recentemente uma compra na {{storename}}. Gostar&iacute;amos de conhecer a sua opini&atilde;o!</p>
<p style='text-align: left;'>Gostar&iacute;amos de oferecer-lhe um <strong>cart&atilde;o-presente de {{amount}}</strong> para a nossa loja em troca de um curto v&iacute;deo onde compartilha a sua opini&atilde;o sobre a sua compra.</p>
<p style='text-align: left;'>Voc&ecirc; poderia tirar 30 segundos do seu tempo para um <strong>cart&atilde;o-presente de {{amount}}?</strong></p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Deixe sua opinião',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Mensagem sobre a sua avaliação",
                    'type' => 'UGC_Declined',
                    'body' => "<p style='text-align: left;'>Ol&aacute;,</p>
<p style='text-align: left;'>Desculpe, a sua avalia&ccedil;&atilde;o em v&iacute;deo para {{storename}} n&atilde;o foi aprovada pelo seguinte motivo:</p>
<p style='text-align: left;'><em>&ldquo;{{reason_decline}}&rdquo;</em></p>
<p style='text-align: left;'>N&atilde;o se preocupe, voc&ecirc; ainda pode tentar novamente e obter o seu cart&atilde;o-presente de <strong>{{amount}}</strong>!</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Deixe sua opinião',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Compartilhe sua opinião sobre {{storename}}",
                    'type' => 'Reminder',
                    'body' => "<p style='text-align: left;'>Ol&aacute; {{name}},</p>
<p style='text-align: left;'>Notamos que voc&ecirc; ainda n&atilde;o enviou sua avalia&ccedil;&atilde;o em v&iacute;deo para sua compra recente na {{storename}}.</p>
<p style='text-align: left;'>Lembre-se, estamos oferecendo um <strong>cart&atilde;o-presente de {{amount}}</strong> por apenas 30 segundos do seu tempo!</p>
<p style='text-align: left;'>Suas impress&otilde;es e coment&aacute;rios s&atilde;o importantes para n&oacute;s, e estamos ansiosos para ouvir o que voc&ecirc; pensa sobre sua compra.</p>
<p style='text-align: left;'>N&atilde;o perca essa oportunidade. Voc&ecirc; poderia tirar 30 segundos para compartilhar sua experi&ecirc;ncia e reivindicar seu <strong>cart&atilde;o-presente de {{amount}}</strong>?</p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Deixe sua opinião',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                )
            );

            foreach ($portu as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }

        /**** Italian ***/
        if ($locale == 'it') {
            $it = array(
                array(
                    'user_id' => $user_id,
                    'subject' => "Richiedi la tua Gift Card da {{amount}}!",
                    'type' => 'UGC_Star_Approved',
                    'body' => "<p style='text-align: left;'>Ciao,&nbsp;</p>
<p style='text-align: left;'>Complimenti, la tua recensione video per {{storename}} &egrave; stata approvata!</p>
<p style='text-align: left;'>Siamo costantemente ispirati dalla creativit&agrave; e dalla passione dei nostri clienti, e apprezziamo il tuo sostegno.</p>
<p style='text-align: left;'>Ecco il tuo codice di sconto:</p>
<h1 style='text-align: left;'><strong>{{discount_code}}</strong></h1>

<p style='text-align: left;'>&Egrave; possibile utilizzare questo codice alla cassa per ricevere il vostro sconto di {{amount}}.</p><p style='text-align: left;''>&nbsp;{{button}}&nbsp;</p>",
                    'btn_text' => 'Acquista ora',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Richiedi la tua Gift Card da {{amount}}!",
                    'type' => 'UGC_Approved',
                    'body' => "<p style='text-align: left;'>Ciao,&nbsp;</p>
<p style='text-align: left;'>Complimenti, la tua recensione video per {{storename}} &egrave; stata approvata!</p>
<p style='text-align: left;'>Siamo costantemente ispirati dalla creativit&agrave; e dalla passione dei nostri clienti, e apprezziamo il tuo sostegno.</p>
<p style='text-align: left;'>Ecco il tuo codice di sconto:</p>
<h1 style='text-align: left;'><strong>{{discount_code}}</strong></h1>

<p style='text-align: left;'>&Egrave; possibile utilizzare questo codice alla cassa per ricevere il vostro sconto di {{amount}}.</p><p style='text-align: left;''>&nbsp;{{button}}&nbsp;</p>",
                    'btn_text' => 'Acquista ora',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Abbiamo una domanda per te",
                    'type' => 'Post_Purchase',
                    'body' => "<p style='text-align: left;'>Ciao {{name}},</p>
<p style='text-align: left;'>Hai recentemente fatto un acquisto da {{storename}}. Ci piacerebbe conoscere la tua opinione!</p>
<p style='text-align: left;'>Vorremmo offrirti una <strong>Gift Card da {{amount}}</strong> per il nostro negozio in cambio di un breve video in cui condividi la tua opinione sul tuo acquisto.</p>
<p style='text-align: left;'>Saresti disposto a dedicare 30 secondi del tuo tempo per una <strong>Gift Card da {{amount}}?</strong></p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Lascio una recensione',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),
                array(
                    'user_id' => $user_id,
                    'subject' => "Messaggio riguardo alla tua recensione",
                    'type' => 'UGC_Declined',
                    'body' => '<p style="text-align: left;">Ciao,</p>
<p style="text-align: left;">Siamo spiacenti, la tua recensione video per {{storename}} non &egrave; stata approvata per il seguente motivo:</p>
<p style="text-align: left;"><em>&ldquo;{{reason_decline}}&rdquo;</em></p>
<p style="text-align: left;">Non preoccuparti, puoi sempre riprovare e ottenere la tua Gift Card da <strong>{{amount}}!</strong></p>
<p style="text-align: left;">{{button}}</p>',
                    'btn_text' => 'Lascia una recensione',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                ),

                array(
                    'user_id' => $user_id,
                    'subject' => "Condividi la tua opinione su {{storename}}",
                    'type' => 'Reminder',
                    'body' => "<p style='text-align: left;'>Ciao {{name}},</p>
<p style='text-align: left;'>Abbiamo notato che non hai ancora inviato la tua recensione video per il tuo recente acquisto su {{storename}}.&nbsp;</p>
<p style='text-align: left;'>Ricorda, stiamo offrendo una <strong>Gift Card da {{amount}}</strong> per soli 30 secondi del tuo tempo!</p>
<p style='text-align: left;'>I tuoi pensieri e i tuoi feedback sono importanti per noi, e siamo ansiosi di sentire cosa pensi del tuo acquisto.</p>
<p style='text-align: left;'>Non perdere questa opportunit&agrave;. Potresti prenderti 30 secondi per condividere la tua esperienza e richiedere la tua <strong>Gift Card da {{amount}}?</strong></p>
<p style='text-align: center;'>{{button}}</p>",
                    'btn_text' => 'Lascia una recensione',
                    'btn_color' => '#28282B',
                    'from' => auth()->user()->store_name,
                    'logo' => ''
                )
            );

            foreach ($it as $lang) {
                EmailTemplate::updateOrCreate(
                    ['user_id' => $user_id, 'type' => $lang['type']],
                    $lang
                );
            }
        }

        return;




        /********* for post purchase ****/
    }
}

/****************** create connection with Google Drive ***********************/
if (!function_exists('connectGoogleDrive')) {
    function connectGoogleDrive($user)
    {

        $gClient = new \Google_Client();
        // $this->gClient->setApplicationName('web client latest'); // ADD YOUR AUTH2 APPLICATION NAME (WHEN YOUR GENERATE SECRATE KEY)
        $gClient->setClientId($user->googleDriveCreds->client_id);
        $gClient->setClientSecret($user->googleDriveCreds->secret_key);
        $gClient->setRedirectUri(route('google.login'));
        $gClient->setDeveloperKey($user->googleDriveCreds->api_key);
        $gClient->setScopes(array(
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive'
        ));

        $gClient->setAccessType("offline");

        $gClient->setApprovalPrompt("force");
        return $gClient;
    }
}
if (!function_exists('customerCreateUpdate')) {
    function customerCreateUpdate($payload, $shop)
    {
        $user = User::where('name', $shop->name)->first();

        try {

            Customer::updateOrCreate(
                [
                    'customer_id' => $payload->id,
                ],
                [
                    'user_id' => $user->id,
                    'customer_id' =>  $payload->id,
                    'first_name' => $payload->first_name,
                    'last_name' => $payload->last_name,
                    'email' => $payload->email,
                    'customer_created_at' => $payload->created_at,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Customer Created/Updated',
            ]);
        } catch (Exception $e) {

            // Log::info($e);
            return $e->getMessage();
        }
    }
}
/*************** sync customers ************/
if (!function_exists('syncCustomers')) {
    function syncCustomers($request)
    {
        $user = User::where('name', $request->name)->first();

        $perPage = 250;
        $customersCount = $user->api()->rest('GET', '/admin/api/2023-10/customers/count.json')['body']['count'];
        CustomLog::info($customersCount);
        CustomLog::info("cusotmer count");

        $iterations = ceil($customersCount / $perPage);

        $next = null;

        // DB::beginTransaction();

        try {

            for ($i = 0; $i < $iterations; $i++) {
                $response = $user->api()->rest('GET', '/admin/api/2023-10/customers.json', [
                    'limit' => $perPage,
                    'page_info' => $next,
                ]);
                foreach ($response['body']['customers'] as $customer) {
                    CustomLog::info('eeewwwmy customers create eewww');


                    Customer::updateOrCreate(
                        [
                            'customer_id' => $customer->id,
                        ],
                        [
                            'user_id' => $user->id,
                            'customer_id' =>  $customer->id,
                            'first_name' => $customer->first_name,
                            'last_name' => $customer->last_name,
                            'email' => $customer->email,
                            'customer_created_at' => $customer->created_at,
                            'orders_count' => $customer->orders_count
                        ]
                    );
                }
                $link = $response['link'];
                if ($link) {
                    $next = $link->next;
                }
            }

            // DB::commit();

            // $new = Product::where('user_id', $user->id)->get();

            return response()->json([
                'success' => true,
                'message' => 'Customer Created/Updated',
            ]);
        } catch (Exception $e) {
            // DB::rollBack();
            CustomLog::info($e);
            return $e->getMessage();
        }
    }
}
