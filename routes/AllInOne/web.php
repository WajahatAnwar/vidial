<?php

//COMMON
use App\Http\Controllers\AllInOne\AuthController;
use App\Http\Controllers\AllInOne\DashboardController;
use App\Http\Controllers\AllInOne\FeedController;
use App\Http\Controllers\AllInOne\UsersController;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\Collection;
use App\Models\AllInOne\CollectionProduct;
use App\Models\AllInOne\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Models\AllInOne\Application;
use App\Models\AllInOne\ApplicationStatus;
use App\Jobs\VirtualOptions\ChargesProductsOnAppInstallJob;
use App\Jobs\VirtualOptions\InputFieldProductOnAppInstallJob;
use App\Jobs\AllInOne\SyncProductsJob;
use App\Jobs\AllInOne\SyncOrdersJob;
use App\Jobs\VirtualOptions\DropdownProductOnAppInstallJob;
use App\Mail\PurchaseOrder\TestMail;
use App\Models\AllInOne\InconnectApplicationStatus;
use App\Models\AllInOne\ProductVariant;
use App\Models\AllInOne\ProductImage;
use App\Models\VirtualOptions\DropdownChargesProduct;
use App\Models\VirtualOptions\InputFieldsProduct;
use App\Models\VirtualOptions\LogoChargesProduct;
use GuzzleHttp\Psr7\Request;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Osiset\ShopifyApp\Contracts\Queries\Shop;
use Osiset\ShopifyApp\Messaging\Jobs\WebhookInstaller;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Util;

// use App\Models\VirtualOptions\Color;
// use App\Models\VirtualOptions\ColorFamily;
// use App\Models\VirtualOptions\Family;
// use Illuminate\Support\Facades\DB;

Route::group(['middleware' => ['auth']], function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::inertia('/dashboard', 'AllInOne/Dashboard/Dashboard')->name('index');

    Route::inertia('/users', 'AllInOne/Users/Users')->name('users_aio');
    Route::inertia('/ogusers', 'AllInOne/Users/UsersOriginal')->name('ogusers_aio');
    Route::inertia('/user-detail', 'AllInOne/Users/UserDetail')->name('userdetail_aio');

    Route::get('/user-detail/{user}', function ($user) {
        return Inertia::render('AllInOne/Users/UserDetail', compact('user'));
    })->name('edit.user');

    Route::get('/user-detail-data',  [UsersController::class, 'getUserData'])->name('getUserData');

    Route::post('/change-read-write', [UsersController::class, 'changeReadWrite']);

    Route::post('/regenerate-token', [UsersController::class, 'regenerateToken']);
    Route::get('/access-levels', [UsersController::class, 'accessLevels'])->name('access.levels');

    // Route::get('/dashboard', function () {
    //     $old_colors = DB::connection("virtual_options_conn")->table("colors_outsides")->get();
    //     foreach ($old_colors as $key => $family) {
    //         $new_family = new Family;
    //         $new_family->name = $family->name;
    //         $new_family->save();
    //         foreach (explode(",", $family->colors_list) as $key2 => $color) {
    //             $existing_color = Color::where('color', $color)->first();
    //             if (empty($existing_color)) {
    //                 $existing_color = new Color;
    //                 $existing_color->color = $color;
    //                 $existing_color->status = 1;
    //                 $existing_color->save();
    //             }
    //             $color_family = new ColorFamily;
    //             $color_family->color_id = $existing_color->id;
    //             $color_family->family_id = $new_family->id;
    //             $color_family->save();
    //         }
    //     }
    // })->name('index');
});

Route::group(['middleware' => ['guest']], function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'login_store'])->name('login.post');
});

Route::group(['middleware' => ['verify.embedded', 'verify.shopify']], function () {
    Route::get('/', function () {

        // $user = Auth::user();
        // return $response = $user->api()->rest('get', '/admin/api/2023-04/webhooks.json', []);

        $user = Auth::user();
        $user = User::find($user->id);
        $check = Product::where('user_id', $user->id)->first();
        if (empty($check)) {
            SyncProductsJob::dispatch($user, true);
            SyncOrdersJob::dispatch($user);
        }

        $users = User::where('role_id', 2)->get();
        $applications = Application::get();

        foreach ($applications as $key => $application) {
            foreach ($users as $key => $user_inside) {
                ApplicationStatus::updateOrCreate(
                    ['user_id' => $user_inside->id, 'application_id' => $application->id],
                    ['user_id' => $user_inside->id, 'application_id' => $application->id]
                );
            }
        }

        $check = LogoChargesProduct::first();
        if ($check) {
            $check2 = LogoChargesProduct::where('user_id', $user->id)->first();
            if (empty($check2)) {
                $user2 = User::where('role_id', 2)->whereNot('id', $user->id)->first();
                if ($user2) {

                    $charges_list = LogoChargesProduct::where('user_id', $user2->id)->get();

                    if (count($charges_list) > 0) {
                        ChargesProductsOnAppInstallJob::dispatch($charges_list, $user);
                    }
                }
            }
        }

        $check = InputFieldsProduct::first();
        if ($check) {
            $check2 = InputFieldsProduct::where('user_id', $user->id)->first();
            if (empty($check2)) {
                $user2 = User::where('role_id', 2)->whereNot('id', $user->id)->first();
                if ($user2) {

                    $charges_list = InputFieldsProduct::where('user_id', $user2->id)->get();

                    if (count($charges_list) > 0) {
                        InputFieldProductOnAppInstallJob::dispatch($charges_list, $user);
                    }
                }
            }
        }

        $check = DropdownChargesProduct::first();
        if ($check) {
            $check2 = DropdownChargesProduct::where('user_id', $user->id)->first();
            if (empty($check2)) {
                $user2 = User::where('role_id', 2)->whereNot('id', $user->id)->first();
                if ($user2) {

                    $charges_list = DropdownChargesProduct::where('user_id', $user2->id)->get();

                    if (count($charges_list) > 0) {
                        DropdownProductOnAppInstallJob::dispatch($charges_list, $user);
                    }
                }
            }
        }

        if (!isset($user->store_name)) {
            $response = $user->api()->rest('GET', '/admin/api/2023-04/shop.json');

            if ($response['errors'] == false) {
                $shopName = $response['body']['shop']['name'];
                $shop = User::find($user->id);
                $shop->store_name = $shopName;
                $shop->save();
            } else {
                sendApiLog(false, 'API RESPONSE', $response);
            }
        }

        return Inertia::render('AllInOne/EmbeddedApp/EmbeddedApp');
    })->name('home');

    Route::get('/get_shop_real', function () {
        $response = Auth::user()->api()->rest('GET', 'admin/api/2024-01/webhooks.json');
        return responseJson(true, 'Shop Name Retrieved', Auth::user()->name, $response);
    })->name('get_shop_real.get');

    // Route::get('/virtual_options/products_list_two',  [ApplicatorController::class, 'get_products_list_two'])->name('products_two.get');
    // Route::get('/virtual_options/applicator_filters_two',  [ApplicatorController::class, 'applicator_filters_two'])->name('applicator_filters_two.get');
});

Route::group(['middleware' => ['auth']], function () {
    Route::get('/all_in_one/get_dashboard', [DashboardController::class, 'get_dashboard'])->name('all_in_one_dash');
    Route::post('/all_in_one/change_status', [DashboardController::class, 'change_status']);
    Route::post('/all_in_one/sync_store_products', [DashboardController::class, 'sync_store_products']);
    Route::post('/all_in_one/sync_store_orders', [DashboardController::class, 'sync_store_orders']);

    Route::get('/all_in_one/get_all_users', [UsersController::class, 'get_all_users'])->name('users_list.get');
    Route::post('/all_in_one/add_new_user', [UsersController::class, 'add_new_user'])->name('add_new_user');
    Route::post('/all_in_one/delete_user', [UsersController::class, 'delete_user'])->name('delete_user');
    Route::post('/all_in_one/edit_user', [UsersController::class, 'edit_user'])->name('edit_user');
    Route::post('/all_in_one/reset_password', [UsersController::class, 'reset_password'])->name('reset_password');
    Route::post('/all_in_one/manage_authority', [UsersController::class, 'manage_authority']);
});

// Route::get('/test', function () {

//     $user = User::where('id', 60)->first();
//     // Log::info(json_encode($user));

//     // $pe/rPage = 250;
//     $next = null;
//     $response7 = $user->api()->rest('GET', '/admin/api/2023-04/orders.json', [
//         'status' => 'any',
//         'limit' => 250,
//         'page_info' => $next,
//     ]);

//     dd($response7);
// });

Route::get('/all_in_one/save_feed_json', [FeedController::class, 'save_feed_json']);
Route::get('/all_in_one/setup_feeds', [FeedController::class, 'setup_feeds']);
Route::get('/all_in_one/separate_run', [FeedController::class, 'separate_run']);

// Route::get('all_in_one/test/mail', function() {
//     Mail::to("atillawall@gmail.com")->send(new TestMail());
// });

// Route::get('/backend', function () {

//     // Remove duplicated rows based on variant_id
//     ProductVariant::orderBy('id') // or any column that determines which row to keep
//         ->select('variant_id', DB::raw('COUNT(variant_id) as count'))
//         ->groupBy('variant_id')
//         ->having('count', '>', 1)
//         ->get()
//         ->each(function ($duplicate) {
//             ProductVariant::where('variant_id', $duplicate->variant_id)
//                 ->orderBy('id') // or any column that determines which row to keep
//                 ->skip(1) // Skip the first occurrence (keep one)
//                 ->delete();
//         });

//     return response()->json(['message' => 'Duplicate rows removed successfully'], 200);
// });

// Route::get('/test2', function () {
//     $query = 'query {
//         shopifyqlQuery(query: "FROM products
//         VISUALIZE sum(net_sales) AS product_sales
//         TYPE BAR
//         GROUP BY product_title, product_id
//         SINCE -3m UNTIL today
//         ORDER BY product_sales DESC
//         LIMIT 5") {
//           __typename
//           ... on PolarisVizResponse {
//             tableData {
//               unformattedData
//               rowData
//             }
//           }
//           parseErrors {
//             code
//             message
//             range {
//               start {
//                 line
//                 character
//               }
//               end {
//                 line
//                 character
//               }
//             }
//           }
//         }
//       }

//       ';
//     $user = User::find(40);
//     $products = $user->api()->graph($query);
//     $row_data = $products['body']['data']['shopifyqlQuery']['tableData']['rowData']->toArray();
//     $product_ids = collect($row_data)->pluck(1)->join(',');
//     if(!$product_ids) {
//         $body = ['limit' => 5, 'fields' => 'id,title,image', 'created_at_min' => now()->subMonths(6)->toIso8601String()];
//     } else {
//         $body = ['ids' => $product_ids, 'fields' => 'id,title,image'];
//     }
//     $data = $user->api()->rest('GET', '/admin/api/2023-04/products.json', $body);
//     return $data['body']['products'];

// });

//UPDATE WEBHOOKS FOR EACH STORE
// Route::get('/jobs',function(Shop $query){
//     $users = User::whereNotNull('password')->where('role_id',2)->get();
//     foreach($users as $user) {
//         $shopName = ShopDomain::fromNative($user->name);
//          $shop = $query->getByDomain($shopName);
//         $shopId = $shop->getId();
//         WebhookInstaller::dispatch($shopId, Util::getShopifyConfig('webhooks'));
//     }
// });

//GET WEBHOOKS FOR EACH STORE
// Route::get('/jobs-result', function (Shop $query) {
//     $users = User::whereNotNull('password')->where('role_id', 2)->get();
//     foreach ($users as $user) {
//         $response = $user->api()->rest('GET', 'admin/api/2024-01/webhooks.json');
//         Log::info(json_encode($response));
//         if ($response['errors'] == true) {
//             Log::info($user->name . " " . $user->store_name . " " . json_encode($response));
//         } else {
//             $shopName = ShopDomain::fromNative($user->name);
//             $shop = $query->getByDomain($shopName);
//             $shopId = $shop->getId();
//             WebhookInstaller::dispatch($shopId, Util::getShopifyConfig('webhooks'));
//         }
//     }
// });


Route::get('/risk', function () {
    $query = <<<GRAPHQL
    {
        order(id: "gid://shopify/Order/5351503298756") {
          id
          ... on Order {
            legacyResourceId
            processedAt
            risk {
                assessments {
                    facts {
                        description
                        sentiment
                    }
                    riskLevel
                }
                recommendation
            }
          }
        }
    }
    GRAPHQL;
    $user = User::find(19);
    $response = $user->api()->graph($query);
    return $response;
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

// ALL IAMGES IN SYSTEM ID IS UPDATED TO GRAPHQL ID USING BELOW CODE
// Route::get('/ali-query', function () {

//     return $images = ProductImage::whereNot('image_id','like','%gid://shopify/ProductImage/%')->count();

//     foreach ($images as $key => $image) {
//         $image->image_id = 'gid://shopify/ProductImage/' . $image->image_id;
//         $image->save();
//     }

//     return "ALI CHA GYA";
// });

// Route::get("new-app-statuses-creation",function(){

//     $applications = Application::get();

//     $users = User::where('role_id', 2)->get();
//     foreach ($applications as $key => $application) {
//         foreach ($users as $key => $user) {
//             ApplicationStatus::updateOrCreate(
//                 ['user_id' => $user->id, 'application_id' => $application->id],
//                 ['user_id' => $user->id, 'application_id' => $application->id]
//             );
//         }
//     }

//     $users = User::where('role_id', 3)->get();
//     foreach ($applications as $key => $application) {
//         foreach ($users as $key => $user) {
//             ApplicationStatus::updateOrCreate(
//                 ['user_id' => $user->id, 'application_id' => $application->id],
//                 ['user_id' => $user->id, 'application_id' => $application->id]
//             );
//         }
//     }

//     return "ALL WORK DONE";
// });

// BELOW CODE FOR REMOVING DUPLICATED PRODUCTS FROM SYSTEM
Route::get('/products-checking', function () {

    // return $duplicateProductIds = Product::select('product_id', DB::raw('COUNT(*) as count'))
    // ->groupBy('product_id')
    // ->having('count', '>', 1)
    // ->get()->pluck('product_id');

    // foreach ($duplicateProductIds as $productId) {
    //     $productIdsToDelete = Product::where('product_id', $productId)
    //     ->orderBy('id', 'asc') // Ascending order to keep the first record
    //     ->limit(PHP_INT_MAX)   // Ensures we limit, but still fetch all records after the first
    //     ->offset(1)            // Skip the first record
    //     ->pluck('id');

    //     // Delete the duplicated records
    //     Product::destroy($productIdsToDelete);
    // }


    // return $duplicateProductIds = Collection::select('collection_id', DB::raw('COUNT(*) as count'))
    // ->groupBy('collection_id')
    // ->having('count', '>', 1)
    // ->get()->pluck('collection_id');

    // foreach ($duplicateProductIds as $productId) {
    //     $productIdsToDelete = Collection::where('collection_id', $productId)
    //     ->orderBy('id', 'asc') // Ascending order to keep the first record
    //     ->limit(PHP_INT_MAX)   // Ensures we limit, but still fetch all records after the first
    //     ->offset(1)            // Skip the first record
    //     ->pluck('id');

    //     // Delete the duplicated records
    //     Collection::destroy($productIdsToDelete);
    // }

    // return $duplicateProductIds = ProductVariant::select('variant_id', DB::raw('COUNT(*) as count'))
    // ->groupBy('variant_id')
    // ->having('count', '>', 1)
    // ->get()->pluck('variant_id');

    // foreach ($duplicateProductIds as $productId) {
    //     $productIdsToDelete = ProductVariant::where('variant_id', $productId)
    //     ->orderBy('id', 'asc') // Ascending order to keep the first record
    //     ->limit(PHP_INT_MAX)   // Ensures we limit, but still fetch all records after the first
    //     ->offset(1)            // Skip the first record
    //     ->pluck('id');

    //     // Delete the duplicated records
    //     ProductVariant::destroy($productIdsToDelete);
    // }

    // return $duplicateProductIds = ProductImage::select('image_id', DB::raw('COUNT(*) as count'))
    // ->groupBy('image_id')
    // ->having('count', '>', 1)
    // ->get();

    // foreach ($duplicateProductIds as $key => $productId) {
    //     $productIdsToDelete = ProductImage::where('image_id', $productId)
    //     ->orderBy('id', 'asc') // Ascending order to keep the first record
    //     ->limit(PHP_INT_MAX)   // Ensures we limit, but still fetch all records after the first
    //     ->offset(1)            // Skip the first record
    //     ->delete();
    // }
});

