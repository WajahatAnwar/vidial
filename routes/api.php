<?php

use Illuminate\Support\Facades\Route;

//ALL IN ONE
Route::prefix('')->group(base_path(path:'routes/AllInOne/api.php'));
//VIRTUAL OPTIONS
Route::prefix('')->group(base_path(path:'routes/VirtualOptions/api.php'));
//SIZE CHART
Route::prefix('')->group(base_path(path:'routes/SizeChart/api.php'));
//ANALYTICS
Route::prefix('')->group(base_path(path:'routes/Analytics/api.php'));
//ORDER SPLITTER
Route::prefix('')->group(base_path(path: 'routes/OrderSplitter/api.php'));
//PURCHASE ORDER
Route::prefix('')->group(base_path(path: 'routes/PurchaseOrder/api.php'));
//IN CONNECT
Route::prefix('')->group(base_path(path: 'routes/InConnect/api.php'));
//FILTER
Route::prefix('')->group(base_path(path: 'routes/Filter/api.php'));
//RACOON
Route::prefix('')->group(base_path(path: 'routes/Racoon/api.php'));
//MAVEN
Route::prefix('')->group(base_path(path: 'routes/Maven/api.php'));
//PUNCHOUT
Route::prefix('')->group(base_path(path: 'routes/Punchout/api.php'));
//CROPIFY
Route::prefix('')->group(base_path(path: 'routes/Cropica/api.php'));
