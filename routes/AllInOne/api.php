<?php

use App\Http\Controllers\AllInOne\ImageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('generate-images', [ImageController::class, 'getImages']);
