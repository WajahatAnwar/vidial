<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Racoon\RestrictionController;
use App\Http\Controllers\Racoon\OrderController;

// non-embedded
Route::group(['middleware' => ['auth']], function () {

    Route::prefix('racoon')->group(function () {
        Route::resource('restrictions', RestrictionController::class)->only([
            'index','create','store','update','destroy'
        ]);
        Route::get('/fetch-restrictions-list', [RestrictionController::class, 'restrictionsList'])->name('restrictions.list');
        Route::get('/fetch-collections-list/{user}', [RestrictionController::class, 'collectionsList'])->name('restrictions.collections.list');
        
        Route::get('/orders', [OrderController::class, 'index'])->name('rc_orders.index');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('rc_orders.show');
        Route::get('/fetch-orders-list', [OrderController::class, 'ordersList'])->name('rc_orders.list');

        Route::post('/cancel-order', [OrderController::class, 'cancel'])->name('rc_orders.cancel');
        Route::post('/process-order', [OrderController::class, 'process'])->name('rc_orders.process');

        Route::fallback(function () {
            return redirect()->route('restrictions.index');
        });
        Route::get('/send-fraud-order-email', [RestrictionController::class, 'sendFraudOrderEmail'])->name('send-fraud-order-mail');
    });
});