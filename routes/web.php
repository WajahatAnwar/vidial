<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\InstallationController;
use Illuminate\Support\Facades\Artisan;

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

Route::get(
    '/app-install',
    [AuthController::class, 'app_install_index']
)->middleware(['verify.shopify', 'billable', 'update.plan'])->name('home');

// redirect if authenticated
Route::view('/login', 'non_embedded')->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::view('/forget-password', 'non_embedded')->name('forget');
Route::get('/reset/password/{token}', [AuthController::class, 'createNewPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPasswordAction']);
Route::post('/set-password', [AuthController::class, 'setPassword']);
Route::get('/getSession', [AuthController::class, 'getSession']);

Route::middleware(['auth'])->group(function () {

    Route::get('/', function () {
        return view('non_embedded');
    });
    Route::get('getDataofallPlans', [AdminController::class, 'fetchingdataofusers']);
    Route::post('update_status_for_water_mark', [AdminController::class, 'update_status_for_water_mark']);

});


##################################################################### SIMPLE ROUTES ####################################################################

// Landing Page View
Route::get('landingPage/{locale}', [SettingsController::class, 'landingPage']);
// Landing Page
Route::get('uploadVideo/{locale}/{order_id?}', [SettingsController::class, 'uploadVideo'])->name('uploadVideo');
// upload video on Dropbox
Route::post('uploadVideo', [VideoController::class, 'uploadDropboxVideo']);

Route::get('congratulations/{locale}', [VideoController::class, 'congratulations']);

Route::get('terms_and_conditions', [VideoController::class, 'termsAndConditions']);

Route::post('saveVideo', [VideoController::class, 'saveVideo']);



Route::get('redirect_back', function () {
    return redirect()->back();
});

Route::get('/test-email', [EmailController::class, 'email']);

Route::get('/cron', function () {
    Artisan::call('schedule:run');
});


###################################################### VERIFY SHOPIFY ROUTES ###############################################

Route::post('sync_store', [CampaignController::class, 'sync_store'])->middleware(['verify.shopify']);

Route::get('get_create_campaign_data', [CampaignController::class, 'get_create_campaign_data'])->middleware(['verify.shopify']);

Route::post('add_new_discount_rule', [CampaignController::class, 'add_new_discount_rule'])->middleware(['verify.shopify']);

Route::post('add_new_campaign', [CampaignController::class, 'add_new_campaign'])->middleware(['verify.shopify']);

Route::post('change_campaign_status', [CampaignController::class, 'change_campaign_status'])->middleware(['verify.shopify']);

Route::get('get_all_campaigns', [CampaignController::class, 'get_all_campaigns'])->middleware(['verify.shopify']);

Route::get('get_editing_campaign', [CampaignController::class, 'get_editing_campaign'])->middleware(['verify.shopify']);

Route::post('update_existing_campaign', [CampaignController::class, 'update_existing_campaign'])->middleware(['verify.shopify']);

Route::post('make_campaign_duplicate', [CampaignController::class, 'make_campaign_duplicate'])->middleware(['verify.shopify']);

Route::get('delete_campaign', [CampaignController::class, 'delete_campaign'])->middleware(['verify.shopify']);

Route::get('get_current_settings', [SettingsController::class, 'get_current_settings'])->middleware(['verify.shopify']);

Route::post('change_pop_up_type', [SettingsController::class, 'change_pop_up_type'])->middleware(['verify.shopify']);

Route::post('get_dashboard_data', [DashboardController::class, 'get_dashboard_data'])->middleware(['verify.shopify']);

Route::post('save_settings', [SettingsController::class, 'saveSettings'])->middleware(['verify.shopify']);

Route::get('get_settings', [SettingsController::class, 'getSettings'])->middleware(['verify.shopify']);

Route::group(['middleware' => 'verify.shopify'], function () {
    Route::get('getPendingVideos', [VideoController::class, 'getPendingVideos']);
    Route::post('videoOperation', [VideoController::class, 'videoOperation']);
    Route::post('rejectVideo', [VideoController::class, 'rejectVideo']);
    Route::post('saveLocale', [SettingsController::class, 'saveLocale']);
    Route::get('getDashboardContent', [DashboardController::class, 'getDashboardContent']);
    Route::get('getApprovedVideos', [VideoController::class, 'getApprovedVideos']);
    Route::get('getPendingVideoCount', [DashboardController::class, 'getPendingVideoCount']);
    Route::post('downloadVideo', [VideoController::class, 'downloadVideo']);
    Route::get('test', [VideoController::class, 'test']);
    Route::post('removeInspirationalVideo', [SettingsController::class, 'removeInspirationalVideo']);
    Route::post('removeLogo', [SettingsController::class, 'removeLogo']);
    Route::post('fetchCurrentUser', [SettingsController::class, 'fetchCurrentUser']);
});

//Email setting Portion
Route::get('fatch_orders', [OrdersController::class, 'fetch_orders'])->middleware(['verify.shopify']);

Route::get('send_test_email', [OrdersController::class, 'sendtest_email'])->middleware(['verify.shopify']);

Route::get('send_customers', [OrdersController::class, 'customers_send_email'])->middleware(['verify.shopify']);

Route::get('review_updated/{id}', [OrdersController::class, 'review_updated'])->name('review_updated');

Route::get('get_plans', [OrdersController::class, 'get_plans'])->name('get_plans')->middleware(['verify.shopify']);

######################################################################## EXTRA ROUTES ########################################################################

Route::view('/{any}', 'non_embedded')->where('any', '^(?!webhook).*$')->name('non_embedded');
