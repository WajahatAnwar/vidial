<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\GoogleDriveController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Jobs\SyncProductsJob;
use App\Models\Setting;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

use Osiset\ShopifyApp\Util;
use Osiset\ShopifyApp\Contracts\Queries\Shop;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Messaging\Jobs\WebhookInstaller;

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
    // $users = User::where('id',151)->get();
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

Route::get('/test-email', [EmailController::class, 'email']);


Route::get('/cron', function () {
    Artisan::call('schedule:run');
});

//Email setting Portion
Route::get('fatch_orders', [OrdersController::class, 'fetch_orders'])->middleware(['verify.shopify']);

Route::get('send_test_email', [OrdersController::class, 'sendtest_email'])->middleware(['verify.shopify']);

Route::get('send_customers', [OrdersController::class, 'customers_send_email'])->middleware(['verify.shopify']);

Route::get('review_updated/{id}', [OrdersController::class, 'review_updated'])->name('review_updated');

Route::get('get_plans', [OrdersController::class, 'get_plans'])->name('get_plans')->middleware(['verify.shopify']);
Route::get('testEmail', [AdminController::class, 'testEmail']);

Route::get('s/{handle}', [SettingsController::class, 'landingPage2']);

Route::get('connect-gd', [GoogleDriveController::class, 'connectDrive'])->name('google.connect');

Route::get('google-login', [GoogleDriveController::class, 'googleLogin'])->name('google.login');

Route::get('gd-success', [GoogleDriveController::class, 'gdSuccess'])->name('google.success');

//PUBLIC END ############################################################################################

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
    Route::inertia('/ugc-approved-email', 'MyApplication/UgcApprovedEmail')->name('single-ugc-approved-email');
    Route::inertia('/ugc-declined-email', 'MyApplication/UgcDeclinedEmail')->name('single-ugc-declined-email');
    Route::inertia('/ugc-star-approved', 'MyApplication/UgcStarApproved')->name('single-ugc-star-approved');

    Route::get('single-fetch-email-settings', [SettingsController::class, 'fetchEmailSettings'])->name('single-fetch-email-settings');



});

//NON EMBEDDED END ######################################################################################

//SHOPIFY ROUTES
Route::group(['middleware' => ['verify.embedded', 'verify.shopify', 'billable', 'update.plan']], function () {

    Route::get('/', [AuthController::class, 'index'])->name('home');

    Route::get('/get_shop_real', function () {
        $user = Auth::user();
        $user = User::find($user->id);
        $response = $user->api()->rest('GET', 'admin/api/2024-01/webhooks.json');
        return responseJson(true, 'Shop Name Retrieved', Auth::user()->name, $response);
    })->name('get_shop_real.get');

    //VIDIAL ROUTES

    Route::inertia('/settings', 'MyApplication/Settings')->name('settings');

    // Video-related routes
    Route::inertia('/videos-to-review', 'MyApplication/VideosToReview')->name('videos-to-review');
    Route::inertia('/approved-videos', 'MyApplication/ApprovedVideos')->name('approved-videos');

    // Email-related routes
    Route::inertia('/email', 'MyApplication/Email')->name('email');
    Route::inertia('/plans', 'MyApplication/Plans')->name('plans');
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
    Route::inertia('/logs', 'MyApplication/Logs')->name('logs');
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
    Route::post('save-email-settings', [SettingsController::class, 'saveEmailSettings'])->name('save-email-settings');
    Route::get('fetch-email-settings', [SettingsController::class, 'fetchEmailSettings'])->name('fetch-email-settings');
    Route::post('checkuploadedlogo', [SettingsController::class, 'checkuploadedlogo'])->name('checkuploadedlogo');
    Route::post('check-handle', [SettingsController::class, 'checkHandle'])->name('check-handle');
    Route::post('store_handle', [SettingsController::class, 'saveHandle'])->name('store_handle');
    Route::post('save-email-creds', [SettingsController::class, 'saveEmailCredentials'])->name('save-email-creds');
    Route::get('update-app', [DashboardController::class, 'updateApp'])->name('update-app');
    Route::get('sync-customers', [DashboardController::class, 'syncCustomers'])->name('sync-customers');
    Route::get('customer-webhook', [DashboardController::class, 'customerWebhook'])->name('customer-webhook');
    Route::post('save-klavio-settings', [SettingsController::class, 'saveKlavioCreds'])->name('connect.klavio');
    Route::get('logs-content', [SettingsController::class, 'logs'])->name('logs-content');
    Route::get('shop-id', function () {
        $users = User::where('role_id', '2')->get();
        foreach ($users as $user) {
            // shop api
            $shop_id = null;
            $response = $user->api()->rest('GET', '/admin/api/2024-07/shop.json');
            if (isset($response['body']['shop']['id'])) {
                $shop_id = $response['body']['shop']['id'];
            }
            if ($shop_id) {
                $user->store_id = $shop_id;
                $user->save();
            }
        }
        dd('done');
    });

    Route::get('test', function () {

        $user = User::where('id', '301')->first();

        $webhooks = $user->api()->rest('get', '/admin/api/2021-07/webhooks.json');
        dd($webhooks);

        foreach ($webhooks['body']['webhooks'] as $key => $value) {
            $parsedUrl = parse_url($value['address'], PHP_URL_PATH);

            // Split the path by "/"
            $pathParts = explode('/', $parsedUrl);

            // Get the value after 'webhook'
            $valueAfterWebhook = end($pathParts);
            $webhookPayload = [
                'webhook' => [
                    'topic' => $value['topic'],
                    'address' => url('webhook/' . $valueAfterWebhook),
                    'format' => 'json'
                ]
            ];
            $response = $user->api()->rest('put', '/admin/api/2024-04/webhooks/' . $value['id'] . '.json', $webhookPayload);
        }

        $webhooks = $user->api()->rest('get', '/admin/api/2021-07/webhooks.json');
        dd($webhooks);

        // update webhook
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

        foreach ($users as $user) {

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

        if ($response->status() === 401) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $response->json();
    });
});

//SHOPIFY ROUTES END ######################################################################################
