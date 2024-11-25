<?php

use App\Http\Controllers\Filter\StoreFrontController;
use Illuminate\Support\Facades\Route;

Route::post('/filter/get_collection_filters',  [StoreFrontController::class, 'get_collection_filters']);
Route::get('/filter/data',  [StoreFrontController::class, 'data']);
