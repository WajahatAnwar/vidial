<?php

use App\Http\Controllers\PurchaseOrder\StoreFrontController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post("/purchase_order/create_order",[StoreFrontController::class,'create_order']);
Route::get("/purchase_order/get_store_rule",[StoreFrontController::class,'get_store_rule']);
Route::get("/purchase_order/get_user_orders",[StoreFrontController::class,'get_user_orders']);

