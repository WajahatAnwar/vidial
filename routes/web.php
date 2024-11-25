<?php

use App\Models\AllInOne\Collection;
use App\Models\AllInOne\CollectionProduct;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Route;

//ALL IN ONE
Route::prefix('')->group(base_path(path: 'routes/AllInOne/web.php'));
//VIRTUAL OPTIONS
Route::prefix('')->group(base_path(path: 'routes/VirtualOptions/web.php'));
//SIZE CHART
Route::prefix('')->group(base_path(path: 'routes/SizeChart/web.php'));
//ANALYTICS
Route::prefix('')->group(base_path(path: 'routes/Analytics/web.php'));
//ORDER SPLITTER
Route::prefix('')->group(base_path(path: 'routes/OrderSplitter/web.php'));
//PURCHASE ORDER
Route::prefix('')->group(base_path(path: 'routes/PurchaseOrder/web.php'));
//IN CONNECT
Route::prefix('')->group(base_path(path: 'routes/InConnect/web.php'));
//FILTER
Route::prefix('')->group(base_path(path: 'routes/Filter/web.php'));
//RACOON
Route::prefix('')->group(base_path(path: 'routes/Racoon/web.php'));
//MAVEN
Route::prefix('')->group(base_path(path: 'routes/Maven/web.php'));
//PUNCHOUT
Route::prefix('')->group(base_path(path: 'routes/Punchout/web.php'));
//CROPIFY
Route::prefix('')->group(base_path(path: 'routes/Cropica/web.php'));

//
