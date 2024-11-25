<?php

use App\Http\Controllers\Punchout\GatewayController;
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

Route::prefix('punchout')->group(function () {
    Route::post('cart', [GatewayController::class, 'cartAttempt']);
});
