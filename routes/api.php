<?php

use App\Http\Controllers\HeyMentalPlanCreatedController;
use App\Http\Controllers\SettingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('create_plan_sync',[HeyMentalPlanCreatedController::class,'planCreated']);
Route::post('update_plan_sync',[HeyMentalPlanCreatedController::class,'planUpdated']);

Route::get('{shop_name}/get-src' , [SettingsController::class, 'getSrc']);
