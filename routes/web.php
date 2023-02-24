<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RulesController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController;
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



Route::get('/', function () {
    return view('welcome');
})->middleware(['verify.shopify'])->name('home');


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
Route::get('landingPage',[SettingsController::class,'landingPage']);
// upload Landing Page Video
Route::get('uploadVideo',[SettingsController::class,'uploadVideo']);
// upload video on Dropbox
Route::post('uploadVideo',[VideoController::class,'uploadVideo']);
// test view
Route::get('testupload',[VideoController::class,'testupload']);
Route::post('testUploaded',[VideoController::class,'testUploaded']);
Route::group(['middleware' => 'verify.shopify'], function () {
    Route::get('getPendingVideos',[VideoController::class,'getPendingVideos']);
    Route::post('videoOperation',[VideoController::class,'videoOperation']);
   
});
Route::post('test-Up',[VideoController::class,'testUp']);
Route::post('send-test-Up',[VideoController::class,'sendTest']);
// Route::view('/{any}', 'welcome')->where('any', '^(?!webhook).*$')->middleware(['verify.shopify'])->name('welcome');
