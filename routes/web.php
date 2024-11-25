<?php

use App\Http\Controllers\AllInOne\AuthController;
use App\Http\Controllers\AllInOne\DashboardController;
use App\Models\AllInOne\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::group(['middleware' => ['auth']], function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::inertia('/dashboard', 'AllInOne/Dashboard/Dashboard')->name('index');
});

Route::group(['middleware' => ['guest']], function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'login_store'])->name('login.post');
});

Route::group(['middleware' => ['verify.embedded', 'verify.shopify']], function () {
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

        return Inertia::render('AllInOne/EmbeddedApp/EmbeddedApp');
    })->name('home');

    Route::get('/get_shop_real', function () {
        $user = Auth::user();
        $user = User::find($user->id);
        $response = $user->api()->rest('GET', 'admin/api/2024-01/webhooks.json');
        return responseJson(true, 'Shop Name Retrieved', Auth::user()->name, $response);
    })->name('get_shop_real.get');
});

Route::group(['middleware' => ['auth']], function () {
    Route::get('/all_in_one/get_dashboard', [DashboardController::class, 'get_dashboard'])->name('all_in_one_dash');
    Route::post('/all_in_one/change_status', [DashboardController::class, 'change_status']);
    Route::post('/all_in_one/sync_store_products', [DashboardController::class, 'sync_store_products']);
    Route::post('/all_in_one/sync_store_orders', [DashboardController::class, 'sync_store_orders']);
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
