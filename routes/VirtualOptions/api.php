<?php

use App\Http\Controllers\VirtualOptions\StoreFrontController;
use Illuminate\Support\Facades\Route;

Route::get('/virtual_options/get_product_options',  [StoreFrontController::class, 'get_product_options']);
Route::post('/virtual_options/get_logo_cash',  [StoreFrontController::class, 'get_logo_cash']);
Route::get('/virtual_options/fonts/arial',  [StoreFrontController::class, 'get_font_one']);
Route::get('/virtual_options/fonts/brush',  [StoreFrontController::class, 'get_font_two']);
Route::get('/virtual_options/fonts/sf_bold',  [StoreFrontController::class, 'sf_bold']);
Route::get('/virtual_options/fonts/sf_medium',  [StoreFrontController::class, 'sf_medium']);
Route::get('/virtual_options/fonts/sf_regular',  [StoreFrontController::class, 'sf_regular']);
