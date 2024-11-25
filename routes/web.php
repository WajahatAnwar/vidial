<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Jobs\SyncProductsJob;
use App\Models\User;
use Inertia\Inertia;

use Osiset\ShopifyApp\Util;
use Osiset\ShopifyApp\Contracts\Queries\Shop;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Messaging\Jobs\WebhookInstaller;

//PUBLIC
Route::group(['middleware' => ['guest']], function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'login_store'])->name('login.post');
});

Route::get('/sync-products', function () {
    $users = User::whereNotNull('password')->where('role_id', 2)->get();
    foreach ($users as $user) {
        SyncProductsJob::dispatch($user, true);
    }
    return responseJson(true, 'Products Synced Queued In Database');
});

Route::get('/sync-collections', function () {
    $users = User::whereNotNull('password')->where('role_id', 2)->get();
    foreach ($users as $user) {
        SyncProductsJob::dispatch($user);
    }
    return responseJson(true, 'Collections Synced Queued In Database');
});

Route::get('/jobs',function(Shop $query){
    $users = User::whereNotNull('password')->where('role_id',2)->get();
    // $users = User::where('id',151)->get();
    foreach($users as $user) {
        $shopName = ShopDomain::fromNative($user->name);
        $shop = $query->getByDomain($shopName);
        $shopId = $shop->getId();
        WebhookInstaller::dispatch($shopId, Util::getShopifyConfig('webhooks'));
    }
});

//PUBLIC END ############################################################################################

//NON EMBEDDED
Route::group(['middleware' => ['auth']], function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    // Route::inertia('/dashboard', 'MyApplication/Dashboard/Dashboard')->name('index');
    // Route::get('/all_in_one/get_dashboard', [DashboardController::class, 'get_dashboard'])->name('all_in_one_dash');
    // Route::post('/all_in_one/change_status', [DashboardController::class, 'change_status']);
    // Route::post('/all_in_one/sync_store_products', [DashboardController::class, 'sync_store_products']);
    // Route::post('/all_in_one/sync_store_orders', [DashboardController::class, 'sync_store_orders']);

    Route::inertia('/dashboard', 'MyApplication/Dashboard/Dashboard')->name('index');

    Route::get('getDataofallPlans', [AdminController::class, 'fetchingdataofusers']);
    Route::post('update_status_for_water_mark', [AdminController::class, 'update_status_for_water_mark']);
    Route::get('customer_settings', [SettingsController::class, 'getSettings']);
    Route::post('save_customer_settings', [SettingsController::class, 'saveSettings']);
    Route::get('customer_email_settings', [SettingsController::class, 'getSettings']);
    Route::post('save-user-email-tab', [SettingsController::class, 'saveEmailTab']);
    Route::get('fetch-user-email-settings', [SettingsController::class, 'fetchEmailSettings']);
    Route::post('save-user-email-settings', [SettingsController::class, 'saveEmailSettings']);
    Route::get('u-logs', [SettingsController::class, 'logs'])->name('logs');
    Route::get('getUserApprovedVideos', [VideoController::class, 'getApprovedVideos']);
    Route::get('getUserPendingVideos', [VideoController::class, 'getPendingVideos']);
});

//NON EMBEDDED END ######################################################################################

//SHOPIFY ROUTES
Route::group(['middleware' => ['verify.embedded', 'verify.shopify', 'billable', 'update.plan']], function () {
    Route::get('/', function () {

        // $user = Auth::user();
        // return $response = $user->api()->rest('get', '/admin/api/2023-04/webhooks.json', []);

        $user = Auth::user();
        $user = User::find($user->id);
        // $check = Product::where('user_id', $user->id)->first();
        // if (empty($check)) {
        //     SyncProductsJob::dispatch($user, true);
        //     SyncOrdersJob::dispatch($user);
        // }

        if (!isset($user->store_name)) {
            $response = $user->api()->rest('GET', '/admin/api/2023-04/shop.json');

            if ($response['errors'] == false) {
                $shopName = $response['body']['shop']['name'];
                $shop = User::find($user->id);
                $shop->store_name = $shopName;
                $shop->save();
            } else {
                sendApiLog(false, 'API RESPONSE', $response);
            }
        }

        return Inertia::render('MyApplication/EmbeddedApp/EmbeddedApp');
    })->name('home');

    Route::get('/get_shop_real', function () {
        $user = Auth::user();
        $user = User::find($user->id);
        $response = $user->api()->rest('GET', 'admin/api/2024-01/webhooks.json');
        return responseJson(true, 'Shop Name Retrieved', Auth::user()->name, $response);
    })->name('get_shop_real.get');
});

//SHOPIFY ROUTES END ######################################################################################
