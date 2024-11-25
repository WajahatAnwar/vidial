<?php

// use App\Http\Controllers\AuthController;
// use App\Http\Controllers\ButtonController;
// use App\Http\Controllers\DashboardController;
// use App\Http\Controllers\EmailController;
// use App\Http\Controllers\OrdersController;
// use App\Http\Controllers\RuleController;
// use App\Http\Controllers\StoreController;
// use App\Http\Controllers\VendorController;
// use App\Http\Controllers\ProductsController;
// use App\Http\Controllers\TestController;
// use Illuminate\Support\Facades\Redirect;

use App\Http\Controllers\OrderSplitter\DashboardController;
use App\Http\Controllers\OrderSplitter\LogsController;
use App\Http\Controllers\OrderSplitter\OakHallController;
use App\Http\Controllers\OrderSplitter\OrdersController;
use App\Http\Controllers\OrderSplitter\TestController;
use App\Http\Controllers\OrderSplitter\VendorController;
use App\Models\AllInOne\User;
use App\Models\OrderSplitter\OSVendor;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::group(['middleware' => ['auth']], function () {

    Route::inertia('/order_splitter/dashboard', 'Applications/OrderSplitter/Dashboard')->name('index_order_splitter');
    Route::inertia('/order_splitter/vendors', 'Applications/OrderSplitter/Vendors')->name('vendors_order_splitter');
    Route::inertia('/order_splitter/add_vendor', 'Applications/OrderSplitter/AddVendor')->name('add_vendor');
    // Route::inertia('/order_splitter/oak_hall', 'Applications/OrderSplitter/OakHall')->name('oak_hall_order_listing');


    Route::get('/order_splitter/edit_vendor/{vendor}', function ($vendor) {
        $vendor = OSVendor::with(['tags_rel', 'vendors.shopify_vendor','shop'])->where('id', $vendor)->first();
        return inertia('Applications/OrderSplitter/EditVendor', compact('vendor'));
    })->name('edit_vendor');

    Route::inertia('/order_splitter/stores',  'Applications/OrderSplitter/Stores')->name('stores_orders_splitter');
    Route::inertia('/order_splitter/orders',  'Applications/OrderSplitter/Orders')->name('orders_orders_splitter');
    Route::inertia('/order_splitter/splitted_orders',  'Applications/OrderSplitter/SplittedOrders')->name('split_orders');

    Route::get("/order_splitter/get_vendors", [VendorController::class, 'get_vendors'])->name('vendors_list.get');
    Route::post("/order_splitter/import_vendors", [VendorController::class, 'import_vendors']);
    Route::post("/order_splitter/delete_vendor", [VendorController::class, 'delete_vendor']);
    Route::post("/order_splitter/add_new_vendor", [VendorController::class, 'add_new_vendor']);
    Route::post("/order_splitter/edit_existing_vendor", [VendorController::class, 'update_vendor']);

    Route::post("/order_splitter/get_dashboard_data", [DashboardController::class, 'get_dashboard_data']);

    Route::get("/order_splitter/get_stores", [OrdersController::class, 'stores_list'])->name('stores_list.get');

    Route::get('/order_splitter/{user}/orders', function (User $user) {
        return inertia('Applications/OrderSplitter/Orders', compact('user'));
    })->name('os_orders');

    Route::get("/order_splitter/get_orders", [OrdersController::class, 'get_orders'])->name('os_orders_list.get');

    Route::get('/order_splitter/{user}/orders/{order_id}', function (User $user, $order_id) {
        return inertia('Applications/OrderSplitter/SplittedOrders', compact('user', 'order_id'));
    })->name('os_splitted_orders');

    Route::get("/order_splitter/get_splitted_orders", [OrdersController::class, 'get_orders_vendors'])->name('os_splitted_orders_list.get');

    // Logs
    Route::get('/order_splitter/logs', [LogsController::class, 'index'])->name('logs_order_splitter');

    /**** start - https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7827422208 ********************/

    Route::prefix('order_splitter')->controller(OakHallController::class)->group(function () {
        Route::get('/oakHall', 'orderListing')->name('oak_hall_order_listing');
        Route::get('/get-orders', 'fetchOrders')->name('oak_hall_order.get');
        Route::get('/get-orders-detail', 'fetchOrdersDetail')->name('oak_hall_order.detail');
        Route::get('/get-oakhall-orders', 'oakHallOrders')->name('oak_hall_order.shipstation');
    });

    /**** end - https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7827422208 ********************/


    Route::get('/order_splitter/oakHall_test', [TestController::class, 'testOkHall']);

    Route::get('/order_splitter/fetch-logs-list', [LogsController::class, 'logsList'])->name('ic_logs_os.list');
    Route::get('/order_splitter/test1', [TestController::class, 'testShipStation']);

    Route::get('/order_splitter/get_shopify_vendors', [VendorController::class, 'get_shopify_vendors']);


    Route::get('oakHall', function () {
        $startDate = '01-01-2023';
        $endDate = '12-12-2024'; // M-d-y
        $pageNumber = 1;
        $token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkFwaU9ha0hhbGwiLCJyb2xlIjoiY2xpZW50Iiwidk5hbSI6Ilh6aXhXK2hwYndoUjdpR1RFeFRtVFE9PSIsIm5iZiI6MTcyNzM3OTI2NSwiZXhwIjoxODIxOTg3MjY1LCJpYXQiOjE3MjczNzkyNjV9.bfBGoQ4tI_U88WcZVnPX2ZJgbLf_zwp7acs-JR8RDhk";
        $response = Http::withToken($token)
        ->get('https://bbcloud-oakhall-api.azurewebsites.net/api/salesorders', [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'pageNumber' => $pageNumber,
        ]);

        if ($response->successful()) {
            $orders = $response->json();
            return $orders;
            // Process your orders here
        } else {
            // Handle errors
            $error = $response->body();
            return $error;
        }
       
    });
});

Route::post('/order_splitter/get-fullfill-orders', [OrdersController::class, 'fulfillOrder']);
Route::post('order_splitter/shipment-response', [OakHallController::class, 'shipmentResponse'])->name('oak_hall_order.shipment.response');

Route::get('/order_splitter/place_order_manual', [OrdersController::class, 'place_order_manual']);
