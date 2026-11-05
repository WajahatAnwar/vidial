<?php

use App\Console\Commands\EmailSendToCustomerCron;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\GoogleDriveController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ShopifyBillingReturnController;
use App\Http\Controllers\ShopifyPlanSubscribeController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;
use App\Jobs\SyncProductsJob;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Osiset\ShopifyApp\Util;
use Osiset\ShopifyApp\Contracts\Queries\Shop;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Messaging\Jobs\WebhookInstaller;
use Osiset\ShopifyApp\Http\Middleware\IframeProtection;

//PUBLIC
Route::group(['middleware' => ['guest']], function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'login_store'])->name('login.post');
});

Route::get('/sync-products', function () {
    $users = User::whereNotNull('password')->where('role_id', 2)->get();
    foreach ($users as $user) {
        SyncProductsJob::dispatch($user, true);
    }
    return responseJson(true, 'Products Synced Queued In Database');
});

Route::get('/sync-collections', function () {
    $users = User::whereNotNull('password')->where('role_id', 2)->get();
    foreach ($users as $user) {
        SyncProductsJob::dispatch($user);
    }
    return responseJson(true, 'Collections Synced Queued In Database');
});

Route::get('/jobs', function (Shop $query) {
    $users = User::whereNotNull('password')->where('role_id', 2)->get();
    foreach ($users as $user) {
        $shopName = ShopDomain::fromNative($user->name);
        $shop = $query->getByDomain($shopName);
        $shopId = $shop->getId();
        WebhookInstaller::dispatch($shopId, Util::getShopifyConfig('webhooks'));
    }
});

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

Route::get('/cron', function () {
    Artisan::call('emailtocustomer:cron');
});

Route::get('send_test_email', [OrdersController::class, 'sendtest_email'])->name('send_test_email')->middleware(['verify.shopify']);

Route::get('send_customers', [OrdersController::class, 'customers_send_email'])->middleware(['verify.shopify']);

Route::get('review_updated/{id}', [OrdersController::class, 'review_updated'])->name('review_updated');

Route::get('get-plans', [OrdersController::class, 'getPlans'])->name('get-plans')->middleware(['verify.shopify']);

// SHOPIFY_MANUAL_PLAN_CHARGE_URL. Same verify.shopify bearer session as get-plans.
// Contract: docs/shopify-manual-billing.md
Route::post('api/billing/manual-plan-charge', ShopifyPlanSubscribeController::class)
    ->name('billing.manual-plan-charge')
    ->middleware(['verify.shopify']);

// Plans stays reachable without an active charge so Select plan and the
// Shopify return banner can render. Other embedded pages stay behind billable.
Route::inertia('/plans', 'MyApplication/Plans')
    ->name('plans')
    ->middleware(['verify.shopify', 'update.plan']);

// Package billing.process is excluded so this return can land on /plans.
Route::get('billing/process/{plan?}', ShopifyBillingReturnController::class)
    ->name('billing.process')
    ->middleware(['verify.shopify'])
    ->where('plan', '^([0-9]+|)$');
Route::get('testEmail', [AdminController::class, 'testEmail']);

Route::get('s/{handle}', [SettingsController::class, 'landingPage2'])->withoutMiddleware([IframeProtection::class]);

Route::get('connect-gd', [GoogleDriveController::class, 'connectDrive'])->name('google.connect');

Route::get('google-login', [GoogleDriveController::class, 'googleLogin'])->name('google.login');

Route::get('gd-success', [GoogleDriveController::class, 'gdSuccess'])->name('google.success');

//PUBLIC END

//NON EMBEDDED
Route::group(['middleware' => ['auth']], function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::inertia('/dashboard', 'MyApplication/AdminDashboard')->name('index');
    Route::get('getDataofallPlans', [AdminController::class, 'fetchingdataofusers'])->name('getDataofallPlans');
    Route::post('update_status_for_water_mark', [AdminController::class, 'update_status_for_water_mark'])->name('update_status_for_water_mark');
    Route::get('customer_settings', [SettingsController::class, 'getSettings'])->name('customer_settings');
    Route::post('save_customer_settings', [SettingsController::class, 'saveSettings'])->name('save_customer_settings');
    Route::get('customer_email_settings', [SettingsController::class, 'getSettings'])->name('customer_email_settings');
    Route::post('save-user-email-tab', [SettingsController::class, 'saveEmailTab'])->name('save-user-email-tab');
    Route::get('fetch-user-email-settings', [SettingsController::class, 'fetchEmailSettings'])->name('fetch-user-email-settings');
    Route::post('save-user-email-settings', [SettingsController::class, 'saveEmailSettings'])->name('save-user-email-settings');
    Route::get('u-logs', [SettingsController::class, 'logs'])->name('logs')->name('u-logs');
    Route::get('getUserApprovedVideos', [VideoController::class, 'getApprovedVideos'])->name('getUserApprovedVideos');
    Route::get('getUserPendingVideos', [VideoController::class, 'getPendingVideos'])->name('getUserPendingVideos');
    Route::inertia('/single-user-settings', 'MyApplication/UserSettings')->name('single-user-settings');
    Route::inertia('/single-user-email-settings', 'MyApplication/UserEmail')->name('single-user-email-settings');
    Route::inertia('/single-user-logs', 'MyApplication/UserLogs')->name('single-user-logs');
    Route::inertia('/single-user-approved-videos', 'MyApplication/UserApprovedVideos')->name('single-user-approved-videos');
    Route::inertia('/single-user-reviewed-videos', 'MyApplication/UserReviewdVideos')->name('single-user-reviewed-videos');
    // Post-purchase emails
    Route::inertia('/single-post-purchase-email', 'MyApplication/PostPurchaseEmail')->name('single-post-purchase-email');
    Route::inertia('/single-reminder-email', 'MyApplication/ReminderEmail')->name('single-reminder-email');

    // UGC email routes
    Route::inertia('/single-ugc-approved-email', 'MyApplication/UgcApprovedEmail')->name('single-ugc-approved-email');
    Route::inertia('/single-ugc-declined-email', 'MyApplication/UgcDeclinedEmail')->name('single-ugc-declined-email');
    Route::inertia('/single-ugc-star-approved', 'MyApplication/UgcStarApproved')->name('single-ugc-star-approved');

    Route::get('single-fetch-email-settings', [SettingsController::class, 'fetchEmailSettings'])->name('single-fetch-email-settings');
    Route::post('single-save-email-settings', [SettingsController::class, 'saveEmailSettings'])->name('single-save-email-settings');

    Route::post('user-check-handle', [SettingsController::class, 'checkHandle'])->name('user_check_handle');
    Route::post('user-store-handle', [SettingsController::class, 'saveHandle'])->name('user_store_handle');


});

//NON EMBEDDED END ######################################################################################

//SHOPIFY ROUTES
Route::group(['middleware' => ['verify.shopify', 'billable', 'update.plan']], function () {

    Route::get('/', [AuthController::class, 'index'])->name('home');

    Route::get('/update-app', [AuthController::class, 'testForDiscount'])->name('update-app');

    Route::get('/app-dashboard', [AuthController::class, 'appDashboard'])->name('app.dashboard');
    Route::get('/settings-user-get', [AuthController::class, 'getuserSettings'])->name('settings.get.user');

    //VIDIAL ROUTES

    Route::inertia('/settings', 'MyApplication/Settings')->name('settings');

    // Video-related routes
    Route::inertia('/videos-to-review', 'MyApplication/VideosToReview')->name('videos-to-review');
    Route::inertia('/approved-videos', 'MyApplication/ApprovedVideos')->name('approved-videos');

    Route::inertia('/logs', 'MyApplication/Logs')->name('logs');


    // Email-related routes
    Route::inertia('/email', 'MyApplication/Email')->name('email');
    Route::inertia('/resources', 'MyApplication/Resources')->name('resources');

    // Admin dashboard
    Route::inertia('/admin-dashboard', 'MyApplication/AdminDashboard')->name('admin-dashboard');

    // User settings with optional parameters
    Route::inertia('/user-settings/{id?}', 'MyApplication/UserSettings')->name('user-settings');
    Route::inertia('/user-email-settings/{id?}', 'MyApplication/UserEmail')->name('user-email-settings');

    // Post-purchase emails
    Route::inertia('/post-purchase-email/{id?}', 'MyApplication/PostPurchaseEmail')->name('post-purchase-email');
    Route::inertia('/reminder-email/{id?}', 'MyApplication/ReminderEmail')->name('reminder-email');

    // UGC email routes
    Route::inertia('/ugc-approved-email/{id?}', 'MyApplication/UgcApprovedEmail')->name('ugc-approved-email');
    Route::inertia('/ugc-declined-email/{id?}', 'MyApplication/UgcDeclinedEmail')->name('ugc-declined-email');
    Route::inertia('/ugc-star-approved/{id?}', 'MyApplication/UgcStarApproved')->name('ugc-star-approved');

    // User logs and video routes
    Route::inertia('/user-logs/{id}', 'MyApplication/UserLogs')->name('user-logs');
    Route::inertia('/user-approved-videos/{id}', 'MyApplication/UserApprovedVideos')->name('user-approved-videos');
    Route::inertia('/user-reviewed-videos/{id}', 'MyApplication/UserReviewdVideos')->name('user-reviewed-videos');

    // Logs and onboarding
    Route::inertia('/get-started', 'MyApplication/GetStarted')->name('get-started');

    // OTHER SHOPIFY ROUTES
    Route::post('save_settings', [SettingsController::class, 'saveSettings'])->name('save_settings');
    Route::post('save-email-tab', [SettingsController::class, 'saveEmailTab'])->name('save-email-tab');
    Route::get('get_settings', [SettingsController::class, 'getSettings'])->name('get_settings');
    Route::get('getPendingVideos', [VideoController::class, 'getPendingVideos'])->name('getPendingVideos');
    Route::post('videoOperation', [VideoController::class, 'videoOperation'])->name('videoOperation');
    Route::post('rejectVideo', [VideoController::class, 'rejectVideo'])->name('rejectVideo');
    Route::post('saveLocale', [SettingsController::class, 'saveLocale'])->name('saveLocale');
    Route::get('getDashboardContent', [DashboardController::class, 'getDashboardContent'])->name('getDashboardContent');
    Route::get('getApprovedVideos', [VideoController::class, 'getApprovedVideos'])->name('getApprovedVideos');
    Route::get('getPendingVideoCount', [DashboardController::class, 'getPendingVideoCount']);
    Route::post('downloadVideo', [VideoController::class, 'downloadVideo'])->name('downloadVideo');
    Route::get('test1', [VideoController::class, 'test'])->name('test1');
    Route::post('removeInspirationalVideo', [SettingsController::class, 'removeInspirationalVideo'])->name('removeInspirationalVideo');
    Route::post('removeLogo', [SettingsController::class, 'removeLogo'])->name('removeLogo');
    Route::post('fetchCurrentUser', [SettingsController::class, 'fetchCurrentUser'])->name('fetchCurrentUser');
    Route::get('curent-user', [SettingsController::class, 'currentUser'])->name('currentUser');
    Route::get('update-version', [SettingsController::class, 'updateVersion'])->name('update-version');

    Route::get('visit-landing', [SettingsController::class, 'visitLandingPage'])->name('visitLandingPage');

    Route::post('save-email-settings', [SettingsController::class, 'saveEmailSettings'])->name('save-email-settings');
    Route::get('fetch-email-settings', [SettingsController::class, 'fetchEmailSettings'])->name('fetch-email-settings');
    Route::post('checkuploadedlogo', [SettingsController::class, 'checkuploadedlogo'])->name('checkuploadedlogo');
    Route::post('check-handle', [SettingsController::class, 'checkHandle'])->name('check-handle');
    Route::post('store_handle', [SettingsController::class, 'saveHandle'])->name('store_handle');
    Route::post('save-email-creds', [SettingsController::class, 'saveEmailCredentials'])->name('save-email-creds');
    Route::post('save-klavio-settings', [SettingsController::class, 'saveKlavioCreds'])->name('connect.klavio');
    Route::post('delete-klavio-settings', [SettingsController::class, 'deleteKlavioCreds'])->name('delete.klavio');

    Route::get('logs-content', [SettingsController::class, 'logs'])->name('logs-content');


});

//SHOPIFY ROUTES END ######################################################  ################################
