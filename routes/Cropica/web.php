<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Cropica\CropicaController;

Route::prefix('cropica')->group(function () {
    Route::inertia('/history', 'Applications/Cropica/History/History')->name('cropica.history');

    Route::get('/fetch-history', [CropicaController::class, 'fetchHistory'])->name('cropica.fetch.history');
    Route::get('/fetch-stores', [CropicaController::class, 'fetchStores'])->name('cropica.fetch.stores');
    Route::get('/fetch-products', [CropicaController::class, 'fetchProductsFromSingleStore'])->name('cropica.fetch.products');

    Route::any('/croping-initiation', [CropicaController::class, 'initiateImageCropping'])->name('cropica.initiate.cropping');

    Route::post('/jobs/cancel', [CropicaController::class, 'cancelJob'])->name('cropica.jobs.cancel');
});
