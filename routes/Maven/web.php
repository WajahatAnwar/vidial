<?php

use App\Http\Controllers\Maven\GooselyApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['auth']], function () {

    Route::prefix('maven')->group(function () {

        // Route::get('/tokens/create', function (Request $request) {
        //     if ($request->token_identifier == "")
        //         return sendResponse(false, "Property 'token_identifier' Required! any string can work.");
        //     $token = $request->user()->createToken($request->token_identifier);
        //     return ['token' => $token->plainTextToken];
        // });

        Route::prefix('goosely')->group(function () {
            Route::inertia('/purchase-orders', 'Applications/Maven/Goosely/PurchaseOrders')->name('maven.goosely.orders');
            Route::inertia('/logs', 'Applications/Maven/Goosely/Logs')->name('maven.goosely.logs');

            Route::controller(GooselyApiController::class)->group(function () {
                Route::get('/orders-list', 'ordersList')->name('maven.goosely.orders.list');
                Route::get('/logs-list', 'logsList')->name('maven.goosely.logs.list');
                Route::get('/maven-listing', 'mavenListing')->name('maven.listing');
                Route::get('/maven-orders', 'mavenOrders')->name('maven.orders');
                // Route::post('/generate-invoice', 'generateInvoice')->name('maven.goosely.generate.invoice');
            });
        });

    });
});
