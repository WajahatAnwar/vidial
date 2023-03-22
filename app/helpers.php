<?php

use App\Models\Collection;
use App\Models\CollectionProduct;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Log;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Crypt;
use App\Models\Orders;
use App\Models\Log;

if (!function_exists('update_log_file')) {
    function update_log_file($data)
    {
        Log::create($data);
    }
}
function vite_assets(): HtmlString
{


    $devServerIsRunning = false;

    if (app()->environment('local')) {
        try {
            Http::get("http://localhost:3000");
            $devServerIsRunning = true;
        } catch (Exception) {
        }
    }

    if ($devServerIsRunning) {
        return new HtmlString(<<<HTML
            <script type="module" src="http://localhost:3000/@vite/client"></script>
            <script type="module" src="http://localhost:3000/resources/js/app.js"></script>
        HTML);
    }

    $manifest = json_decode(file_get_contents(
        public_path('build/manifest.json')
    ), true);

    return new HtmlString(<<<HTML
        <script type="module" src="/build/{$manifest['resources/js/app.js']['file']}"></script>
        <link rel="stylesheet" href="/build/{$manifest['resources/js/app.js']['css'][0]}">
    HTML);
}

function sync_products($request)
{
    $user = User::where('name', $request->name)->first();

    // Log::info(json_encode($user));

    $perPage = 250;
    $productCount = $user->api()->rest('GET', '/admin/api/2022-01/products/count.json')['body']['count'];

    $iterations = ceil($productCount / $perPage);

    $next = null;

    DB::beginTransaction();
    try {

        $user = User::where('name', $request->name)->first();

        $collections_list = array();

        $response2 = $user->api()->rest('get', '/admin/api/2021-10/smart_collections.json');
        // $data = $response2['body']['smart_collections'];
        foreach ($response2['body']['smart_collections'] as $value) {
            array_push($collections_list, $value);
        }

        $response3 = $user->api()->rest('get', '/admin/api/2021-10/custom_collections.json');
        foreach ($response3['body']['custom_collections'] as $value) {
            array_push($collections_list, $value);
        }
        // return $collections_list;
        //new new new new new
        foreach ($collections_list as $key => $value) {

            $image_link = "";
            if (isset($value->image)) {
                $image_link = $value->image->src;
            } else {
                $image_link = '/default_image_src';
            }

            Collection::updateOrCreate([
                'collection_id' => $value['id'],
            ], [
                'collection_title' => $value['title'],
                'collection_handle' => $value['handle'],
                'collection_image' => $image_link,
                'user_id' => $user->id
            ]);
        }

        CollectionProduct::where('user_id', $user->id)->delete();

        $all_collections = Collection::where('user_id', $user->id)->get();

        foreach ($all_collections as $key => $value) {

            //GETTING COLLECTION PRODUCTS ######################################################
            $refined_products = array();

            $perPage = 250;
            $next = null;

            do {

                $response = $user->api()->rest('GET', '/admin/api/2021-10/collections/' . $value->collection_id . '/products.json', [
                    'limit' => $perPage,
                    'page_info' => $next
                ]);

                // return $response;
                foreach ($response['body']['products'] as $product) {
                    array_push($refined_products, $product);
                }

                $link = $response['link'];
                if ($link)
                    $next = $link->next;

                // return count($response['body']['products']);
                if (count($response['body']['products']) < 250)
                    break;
            } while (true);

            // return $refined_products;

            foreach ($refined_products as $key => $value2) {

                $new_collection_product = new CollectionProduct;
                $new_collection_product->user_id = $user->id;
                $new_collection_product->collection_id = $value->collection_id;
                $new_collection_product->product_id = $value2->id;
                $new_collection_product->save();
            }
            //GETTING COLLECTION PRODUCTS ###################################################### END
        }

        for ($i = 0; $i < $iterations; $i++) {
            $response = $user->api()->rest('GET', '/admin/api/2022-01/products.json', [
                'limit' => $perPage,
                'page_info' => $next
            ]);
            foreach ($response['body']['products'] as $product) {

                $image_link = "";
                if (isset($product->image)) {
                    $image_link = $product->image->src;
                } else {
                    $image_link = '/default_image_src';
                }

                Product::updateOrCreate([
                    'product_id' => $product->id,
                ], [
                    'product_tags' => $product['tags'],
                    'product_title' => $product['title'],
                    'product_handle' => $product['handle'],
                    'user_id' => $user->id,
                    'description' => "defauld description",
                    'product_image' => $image_link,
                ]);
            }
            $link = $response['link'];
            if ($link) {
                $next = $link->next;
            }
        }

        DB::commit();

        // $new = Product::where('user_id', $user->id)->get();

        return response()->json([
            'success' => true,
            'message' => 'Products and collections added to the system',
            // 'data' => $new
        ]);
    } catch (Exception $e) {
        DB::rollBack();
        return $e->getMessage();
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
       function dateFormat($date){
        return $date;
        return $newDate = Carbon::createFromFormat('Y-m-d H:i:s', $date)
        ->format('m/d/Y');
       }
    }
}
/***** set language ******/
if (!function_exists('setLan')) {
    function setLan($locale){
        return App::setLocale($locale);
    }
}
/***** Split store name ******/
if (!function_exists('splitStoreName')) {
    function splitStoreName($store){
        $store = explode(".", $store, 2);
        return $store[0];
    }
}

/****** check link expiration  *******/
if(!function_exists('checkLinkExpiration')){
    function checkLinkExpiration($request){
         // check link expiration
    if ($request->filled('order_id')) {
        try {
            $order_id = Crypt::decryptString($request->order_id);
            $order=Orders::find($order_id);


        // check order existance
        if(!$order){
           return abort(404);
        }
        // check replied or not
        if($order->replied){
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
if(!function_exists('getCurrencySymbol')){
function getCurrencySymbol($currency_code){
    $currencies = array(
        "GBP" => "£",
        "USD" => "$",
        "EUR" => "€",
        "TRY" => "₺",
        "JPY"=>"¥",
        "AUD"=>"$",
        "CAD"=>"$"
    );
    if(isset($currencies[$currency_code])){
       return $currencies[$currency_code];
    }
    return $currency_code;
}
}
