<?php

use App\Models\Video;
use App\Models\User;
use App\Models\Orders;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoogleDriveController;
use Osiset\ShopifyApp\Contracts\Queries\Shop;
use Osiset\ShopifyApp\Messaging\Jobs\WebhookInstaller;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Util;
use App\Jobs\SyncAllCustomers;
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

Route::get('/jobs',function(Shop $query){
    $users = User::whereNotNull('password')->where('role_id',2)->get();
    // $users = User::where('id',151)->get();
    foreach($users as $user) {
        $shopName = ShopDomain::fromNative($user->name);
        $shop = $query->getByDomain($shopName);
        $shopId = $shop->getId();
        WebhookInstaller::dispatch($shopId, Util::getShopifyConfig('webhooks'));
    }

    dd('webhooks re-installed');
});

// redirect if authenticated
Route::view('/login', 'non_embedded')->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::view('/forget-password', 'non_embedded')->name('forget');
Route::get('/reset/password/{token}', [AuthController::class, 'createNewPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPasswordAction']);
Route::post('/set-password', [AuthController::class, 'setPassword']);
Route::get('/getSession', [AuthController::class, 'getSession']);

/*********************** Admin routes *******************/

Route::middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return view('non_embedded');
    });
    Route::get('getDataofallPlans', [AdminController::class, 'fetchingdataofusers']);
    Route::post('update_status_for_water_mark', [AdminController::class, 'update_status_for_water_mark']);
    Route::get('customer_settings', [SettingsController::class, 'getSettings']);
    Route::post('save_customer_settings', [SettingsController::class, 'saveSettings']);
    Route::get('customer_email_settings', [SettingsController::class, 'getSettings']);
    Route::post('save-user-email-tab', [SettingsController::class, 'saveEmailTab']);
    Route::get('fetch-user-email-settings', [SettingsController::class, 'fetchEmailSettings']);
    Route::post('save-user-email-settings', [SettingsController::class, 'saveEmailSettings']);
    Route::get('u-logs', [SettingsController::class, 'logs'])->name('logs');

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
Route::post('save-email-tab', [SettingsController::class, 'saveEmailTab'])->middleware(['verify.shopify']);


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
    Route::post('save-email-settings', [SettingsController::class, 'saveEmailSettings']);
    Route::get('fetch-email-settings', [SettingsController::class, 'fetchEmailSettings']);
    Route::post('checkuploadedlogo', [SettingsController::class, 'checkuploadedlogo']);
    Route::post('check-handle', [SettingsController::class, 'checkHandle']);
    Route::post('store_handle', [SettingsController::class, 'saveHandle']);
    Route::post('save-email-creds', [SettingsController::class, 'saveEmailCredentials']);
    Route::get('update-app', [DashboardController::class, 'updateApp']);
    Route::get('sync-customers', [DashboardController::class, 'syncCustomers']);
    Route::get('customer-webhook', [DashboardController::class, 'customerWebhook']);
    Route::post('save-klavio-settings', [SettingsController::class, 'saveKlavioCreds'])->name('connect.klavio');
    Route::get('logs', [SettingsController::class, 'logs'])->name('logs');
    Route::get('shop-id', function() {
 $users = User::where('role_id','2')->get();
    foreach($users as $user){
        // shop api
        $shop_id = null;
        $response = $user->api()->rest('GET','/admin/api/2024-07/shop.json');
        if(isset($response['body']['shop']['id'])){
            $shop_id = $response['body']['shop']['id'];
        }
        if($shop_id){
            $user->store_id = $shop_id;
            $user->save();
        }
    }
    dd('done');
    });
Route::get('test', function() {
    dd('come on');
      $users = User::where('role_id','2')
      ->whereNotNull('store_id')
      ->get();
      
//    dd($users);
//     $response = Http::withHeaders([
//         'Content-Type' => 'application/json',
//         'X-Mantle-Customer-Api-Token' => 'd8de0340-f3d1-4127-ac60-9d85a34140c6',
//         'X-Mantle-App-Id' => '58db85bd-50b1-4c84-82cf-8492b91913d4',
//     ])->post('https://appapi.heymantle.com/v1/usage_events', [
//         'customerId' => '46c5d728-f011-4f65-86cd-49b70aa562bf',
//         'eventId' => '1122',
//         'eventName' => 'vidial_testing_event',
//     ]);

//     return $response->json();
     foreach($users as $user){
      
 $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-Mantle-App-Api-Key' => env('MANTLE_API_KEY'),
            'X-Mantle-App-Id' => env('MANTLE_AP_ID'),
        ])->post('https://appapi.heymantle.com/v1/identify', [
            'platform' => 'shopify',
            'platformId' => $user->store_id,
            'myshopifyDomain' => $user->name,
            'name' => $user->store_name,
            'email' => $user->email,
            'accessToken' => $user->password,
        ]);

        $response = $response->json();
        $user->mantle_token = $response['apiToken'];
        $user->save();
      

}
  dd('token done');

    if ($response->status() === 401) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    return $response->json();
});

    
    
    
});

//Email setting Portion
Route::get('fatch_orders', [OrdersController::class, 'fetch_orders'])->middleware(['verify.shopify']);

Route::get('send_test_email', [OrdersController::class, 'sendtest_email'])->middleware(['verify.shopify']);

Route::get('send_customers', [OrdersController::class, 'customers_send_email'])->middleware(['verify.shopify']);

Route::get('review_updated/{id}', [OrdersController::class, 'review_updated'])->name('review_updated');

Route::get('get_plans', [OrdersController::class, 'get_plans'])->name('get_plans')->middleware(['verify.shopify']);
Route::get('testEmail',[AdminController::class, 'testEmail']);

Route::get('s/{handle}', [SettingsController::class, 'landingPage2']);

Route::get('connect-gd', [GoogleDriveController::class, 'connectDrive'])->name('google.connect');
Route::get('google-login', [GoogleDriveController::class, 'googleLogin'])->name('google.login');
Route::get('gd-success', [GoogleDriveController::class, 'gdSuccess'])->name('google.success');

Route::view('/{any}', 'non_embedded')->where('any', '^(?!webhook).*$')->name('non_embedded');
