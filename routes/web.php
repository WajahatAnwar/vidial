<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\RulesController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController;
use App\Jobs\videoMail;
use App\Mail\sendCoupen;
use App\Models\Plan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Osiset\ShopifyApp\Http\Middleware\Billable;
use App\Models\Setting;
use App\Http\Controllers\InstallationController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/



Route::get('/',[InstallationController::class,'index'])->middleware(['verify.shopify' ,'billable' ])->name('home');

Route::post('sync_store',[CampaignController::class,'sync_store'])->middleware(['verify.shopify']);

Route::get('get_create_campaign_data',[CampaignController::class,'get_create_campaign_data'])->middleware(['verify.shopify']);

Route::post('add_new_discount_rule',[CampaignController::class,'add_new_discount_rule'])->middleware(['verify.shopify']);

Route::post('add_new_campaign',[CampaignController::class,'add_new_campaign'])->middleware(['verify.shopify']);

Route::post('change_campaign_status',[CampaignController::class,'change_campaign_status'])->middleware(['verify.shopify']);

Route::get('get_all_campaigns',[CampaignController::class,'get_all_campaigns'])->middleware(['verify.shopify']);

Route::get('get_editing_campaign',[CampaignController::class,'get_editing_campaign'])->middleware(['verify.shopify']);

Route::post('update_existing_campaign',[CampaignController::class,'update_existing_campaign'])->middleware(['verify.shopify']);

Route::post('make_campaign_duplicate',[CampaignController::class,'make_campaign_duplicate'])->middleware(['verify.shopify']);

Route::get('delete_campaign',[CampaignController::class,'delete_campaign'])->middleware(['verify.shopify']);


Route::get('get_current_settings',[SettingsController::class,'get_current_settings'])->middleware(['verify.shopify']);

Route::post('change_pop_up_type',[SettingsController::class,'change_pop_up_type'])->middleware(['verify.shopify']);

Route::post('get_dashboard_data',[DashboardController::class,'get_dashboard_data'])->middleware(['verify.shopify']);

Route::post('save_settings',[SettingsController::class,'saveSettings'])->middleware(['verify.shopify']);
Route::get('get_settings',[SettingsController::class,'getSettings'])->middleware(['verify.shopify']);
// Landing Page View
Route::get('landingPage/{locale}',[SettingsController::class,'landingPage']);
// Landing Page
Route::get('uploadVideo/{locale}',[SettingsController::class,'uploadVideo'])->name('uploadVideo');
// upload video on Dropbox
Route::post('uploadVideo',[VideoController::class,'uploadDropboxVideo']);

Route::post('saveVideo',[VideoController::class,'saveVideo']);
Route::get('test',[VideoController::class,'testing']);
Route::group(['middleware' => 'verify.shopify'], function () {
    Route::get('getPendingVideos',[VideoController::class,'getPendingVideos']);
    Route::post('videoOperation',[VideoController::class,'videoOperation']);
    Route::post('saveLocale',[SettingsController::class,'saveLocale']);
    Route::get('getDashboardContent',[DashboardController::class,'getDashboardContent']);
    Route::get('getApprovedVideos',[VideoController::class,'getApprovedVideos']);
    Route::get('getPendingVideoCount',[DashboardController::class,'getPendingVideoCount']);


});
// Route::view('/{any}', 'welcome')->where('any', '^(?!webhook).*$')->middleware(['verify.shopify'])->name('welcome');


//Email setting Portion

Route::get('fatch_orders', [OrdersController::class , 'fetch_orders'])->middleware(['verify.shopify']);
Route::get('send_test_email', [OrdersController::class , 'sendtest_email'])->middleware(['verify.shopify']);
Route::get('send_customers', [OrdersController::class , 'customers_send_email'])->middleware(['verify.shopify']);
Route::get('review_updated/{id}' ,[OrdersController::class , 'review_updated'])->name('review_updated');
Route::get('get_plans', [OrdersController::class, 'get_plans'])->name('get_plans')->middleware(['verify.shopify']);
// Route::get('test', [OrdersController::class, 'test'])->middleware(['verify.shopify']);
// Route::post('update_plan', [OrdersController::class, 'set_plans'])->name('set_plans');
// Route::get('billing/{id}/{name}', [OrdersController::class, 'set_plans'])->middleware(['verify.shopify' , 'billable']);
// Route::post('/webhook/orders-get', [OrdersController::class,'fetch_orders'])->middleware('auth.webhook');
Route::get('redirect_back', function () {
    return redirect()->back();
});


Route::get('/test-email',[EmailController::class,'email']);

