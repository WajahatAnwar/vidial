<?php

use App\Http\Controllers\Maven\GooselyApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('maven')->group(function () {
        Route::get('/user',  function (Request $request) {
            return $request->user();
        });
        Route::post('create-sales-invoice', [GooselyApiController::class, 'createSalesInvoice']);
        Route::post('create-vendor-invoice', [GooselyApiController::class, 'createVendorInvoice']);
        Route::post('create-purchase-cost', [GooselyApiController::class, 'createPurchaseCost']);
        Route::post('/add-attachment', [GooselyApiController::class, 'addAttachmentParent']);
    });
});
