<?php

use Illuminate\Support\Facades\Route;

use App\Jobs\InConnect\GetTrackingNumberJob;
use App\Models\InConnect\VendorPurchaseOrder;
use App\Models\AllInOne\User;
use App\Models\InConnect\ProductType;
use App\Models\InConnect\ShopifyVendor;
use App\Models\InConnect\ShopifyVendorVendor;
use App\Models\InConnect\ShopifyShippingField;
use App\Http\Controllers\InConnect\BatchController;
use App\Http\Controllers\InConnect\OrderController;
use App\Http\Controllers\InConnect\VendorController;
use App\Http\Controllers\InConnect\IntacctController;
use App\Http\Controllers\InConnect\DashboardController;
use App\Http\Controllers\InConnect\DecoratorController;
use App\Http\Controllers\InConnect\EditOrderController;
use App\Http\Controllers\InConnect\PrerequisiteController;
use App\Http\Controllers\InConnect\InConnectLogController;
use App\Http\Controllers\InConnect\EmailTemplateController;
use App\Http\Controllers\InConnect\RuleController;
use App\Http\Controllers\InConnect\ShopifyAccountsController;
use App\Http\Controllers\InConnect\TrackingController;
use App\Http\Controllers\InConnect\TestController;
use App\Http\Controllers\InConnect\TestControllerTwo;
use App\Http\Controllers\InConnect\CronJobsController;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

Route::get('/goosely/update-idex-po-status', [CronJobsController::class, 'updateIdexPoStatus'])->name('ic_orders.updateIdexPoStatus');
Route::get('/goosely/generate-invoices', [VendorController::class, 'generateInvoices'])->name('ic_orders.generateInvoices');

Route::get('/goosely/pre-requisite', [PrerequisiteController::class, 'preRequisite']);

Route::get('/goosely/sync-previous-orders', [CronJobsController::class, 'syncPreviousOrders'])->name('ic_sync_prev_orders');
Route::get('/goosely/process-validator', [CronJobsController::class, 'processValidator']);
Route::get('/goosely/generate-sales-invoices', [CronJobsController::class, 'processSalesInvoice']);
Route::get('/goosely/generate-vendor-invoices', [CronJobsController::class, 'processVendorInvoices']);

Route::get('/goosely/get-intacct-vendors', [IntacctController::class, 'getIntacctVendors'])->name('ic_get_intacct_vendors');
Route::get('/goosely/get-intacct-locations', [IntacctController::class, 'getIntacctLocations'])->name('ic_get_intacct_locations');
Route::get('/goosely/get-intacct-departments', [IntacctController::class, 'getIntacctDepartments'])->name('ic_get_intacct_departments');
Route::get('/goosely/get-intacct-customers', [IntacctController::class, 'getIntacctCustomers'])->name('ic_get_intacct_customers');
Route::get('/goosely/get-intacct-classes', [IntacctController::class, 'getIntacctClasses'])->name('ic_get_intacct_classes');
Route::get('/goosely/run-batch-orders', [CronJobsController::class, 'runBatchOrders'])->name('order.batch');

Route::get('/goosely/main', [TestController::class, 'getAndUpdateInvoice']);
Route::get('/goosely/screen-pro', [TestController::class, 'screenPro']);

Route::get('/goosely/fetch-vendors', function () {
    $users = User::where('role_id', 2)->get();
    foreach ($users as $key => $user) {
        $products = [];
        do {
            $after = $products['body']['data']['products']['pageInfo']['endCursor'] ?? null;
            $after = $after ? ", after: \"$after\"" : '';
            $query = <<<GRAPHQL
        query products {
            products(first: 50 $after) {
                edges {
                  node {
                    vendor
                    productType
                  }
                }
                pageInfo {
                    hasNextPage
                    hasPreviousPage
                    startCursor
                    endCursor
                }
            }
        }
        GRAPHQL;
            $products = $user->api()->graph($query);
            if ($products['errors'] ?? false) {
                return $products['errors'];
            }
            foreach ($products['body']['data']['products']['edges'] ?? [] as $vendor) {
                $vendorName = $vendor['node']['vendor'];
                ShopifyVendor::firstOrCreate([
                    'name' => $vendorName
                ]);

                $productType = $vendor['node']['productType'];
                $productType = ProductType::firstOrCreate([
                    'name' => $productType
                ]);
            }
        } while ($products['body']['data']['products']['pageInfo']['hasNextPage']);
    }
    return 'done';
});

Route::get('/goosely/fetch-shippings', function () {
    $users = User::where('role_id', 2)->get();
    foreach ($users as $key => $user) {
        $deliveryProfiles = [];
        do {
            $after = $deliveryProfiles['body']['data']['deliveryProfiles']['pageInfo']['endCursor'] ?? null;
            $after = $after ? ", after: \"$after\"" : '';
            $query = <<<GRAPHQL
        query {
            deliveryProfiles(first: 10) {
                edges {
                    node {
                        profileLocationGroups {
                            locationGroupZones(first: 5) {
                                edges {
                                    node {
                                        methodDefinitions(first: 10) {
                                            edges {
                                                node {
                                                    id
                                                    name
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                    hasPreviousPage
                    startCursor
                    endCursor
                }
            }
        }
        GRAPHQL;
            $deliveryProfiles = $user->api()->graph($query);
            if ($deliveryProfiles['errors'] ?? false) {
                return $deliveryProfiles['errors'];
            }
            foreach ($deliveryProfiles['body']['data']['deliveryProfiles']['edges'] ?? [] as $deliveryProfile) {
                $deliveryProfile = $deliveryProfile['node']['profileLocationGroups'];
                foreach ($deliveryProfile as $profileLocationGroup) {
                    $profileLocationGroup = $profileLocationGroup['locationGroupZones']['edges'];
                    foreach ($profileLocationGroup as $locationGroupZone) {
                        $locationGroupZone = $locationGroupZone['node']['methodDefinitions']['edges'];
                        foreach ($locationGroupZone as $methodDefinition) {
                            $methodDefinition = $methodDefinition['node'];
                            $methodDefinition = ShopifyShippingField::firstOrCreate([
                                'source' => 'shopify',
                                'title' => $methodDefinition['name'],
                            ]);
                        }
                    }
                }
            }
        } while ($deliveryProfiles['body']['data']['deliveryProfiles']['pageInfo']['hasNextPage']);
    }
    return 'done';
});

Route::get('/goosely/get-trackings', function () {
    // whereNull('tracking_number')->
    $purchaseOrders = VendorPurchaseOrder::whereNull('ship_dates')->whereNotNull('purchase_order_no')->with('vendor')->get();
    foreach ($purchaseOrders as $key => $order) {
        GetTrackingNumberJob::dispatch($order);
        if($key == 950)
            break;
    }
});

Route::get('/goosely/fix-statuses', function () {
    App\Models\InConnect\InconnectOrder::each(function ($order) {
        foreach ($order->updates()->whereNull('type')->orderBy('id', 'ASC')->get() as $key => $update) {
            $statuses = ["Received", "Sent to vendor", "Sent to intacct for vendor", "Sent to decorator", "Sent to intacct for decorator", "Received on decorator", "Shipped from decorator", "Fulfilled"];

            switch ($statuses[$key]) {
                case 'Received':
                    $update->type = 'received';
                    break;
                case 'Sent to vendor':
                    $update->type = 'sent_to_vendor';
                    break;
                case 'Sent to intacct for vendor':
                    $update->type = 'sent_to_intacct_for_vendor';
                    break;
                case 'Sent to decorator':
                    $update->type = 'sent_to_decorator';
                    break;
                case 'Sent to intacct for decorator':
                    $update->type = 'sent_to_intacct_for_decorator';
                    break;
                case 'Received on decorator':
                    $update->type = 'received_on_decorator';
                    break;
                case 'Shipped from decorator':
                    $update->type = 'shipped_from_decorator';
                    break;
                case 'Fulfilled':
                    $update->type = 'fulfilled';
                    break;
                default:
                    break;
            }

            $update->name = $statuses[$key];
            $update->save();
        }
    });

    return App\Models\InConnect\InconnectOrderUpdate::select('type as UpdateName', DB::raw('COUNT(failed_at) AS OrdersCount'))
        ->groupBy('type')
        ->orderBy('UpdateName')
        ->get();
});

// non-embedded
Route::group(['middleware' => ['auth']], function () {
    // INERTIA

    Route::prefix('goosely')->group(function () {

        Route::get('abc', function () {
            $vendors_allowed_processing = ShopifyVendorVendor::whereHas('vendor', function ($q) {
                $q->where('allow_processing', TRUE);
            })->get()->pluck('vendor.name')->toArray();

            return $vendors_allowed_processing;
        });

        // Orders
        Route::get('/orders', [OrderController::class, 'index'])->name('ic_orders.index');
        Route::post('/orders/export', [OrderController::class, 'export'])->name('ic_orders.export');
        Route::get('/orders/download', [OrderController::class, 'download'])->name('ic_orders.download');
        Route::get('/fetch-orders-list', [OrderController::class, 'ordersList'])->name('ic_orders.list');
        Route::get('/orders/{id}', [OrderController::class, 'show'])->name('ic_orders.show');
        Route::post('/orders/restart', [OrderController::class, 'restart'])->name('ic_orders.restart');
        Route::post('/orders/archive', [OrderController::class, 'archive'])->name('ic_orders.archive');

        // Logs
        Route::get('/logs', [InConnectLogController::class, 'index'])->name('ic_logs.index');
        Route::get('/fetch-logs-list', [InConnectLogController::class, 'logsList'])->name('ic_logs.list');

        // Vendors
        Route::get('/vendors', [VendorController::class, 'index'])->name('ic_vendors.index');
        Route::get('/fetch-vendors-list', [VendorController::class, 'vendorsList'])->name('ic_vendors.list');
        Route::post('/vendors', [VendorController::class, 'store'])->name('ic_vendors.store');
        Route::patch('/vendors/{vendor}', [VendorController::class, 'update'])->name('ic_vendors.update');

        // Decorators
        Route::get('/decorators', [DecoratorController::class, 'index'])->name('ic_decorators.index');
        Route::get('/decorators/{decorator}/edit', [DecoratorController::class, 'edit'])->name('ic_decorators.edit');
        Route::patch('/decorators/{decorator}', [DecoratorController::class, 'update'])->name('ic_decorators.update');
        Route::post('/decorators', [DecoratorController::class, 'store'])->name('ic_decorators.store');
        Route::get('/decorators/create', [DecoratorController::class, 'create'])->name('ic_decorators.create');
        Route::get('/fetch-decorators-list', [DecoratorController::class, 'decoratorsList'])->name('ic_decorators.list');

        Route::get('/get-options/{type?}', [DecoratorController::class, 'getOptions'])->name('ic_options');

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('ic_index');
        Route::inertia('/connections', 'Applications/InConnect/Connections/Connections')->name('ic_connections');

        Route::get('/emails', [EmailTemplateController::class, 'index'])->name('ic_emails.index');
        Route::post('/emails', [EmailTemplateController::class, 'store'])->name('ic_emails.store');
        Route::patch('/emails/{emailTemplate}', [EmailTemplateController::class, 'update'])->name('ic_emails.update');

        //BATCH INERTIA ROUTES
        Route::get('/batch/settings', [BatchController::class, 'index'])->name('ic_batch.index');
        Route::get('/batch/listing', [BatchController::class, 'listing'])->name('ic_batch.listing');
        Route::get('/batch/ordersList', [BatchController::class, 'ordersList'])->name('ic_orders.list.batches');

        //BATCH LISTING ROUTES
        Route::get('/batch/list', [BatchController::class, 'list'])->name('ic_batch.list');
        Route::get('/batch/ordersListing', [BatchController::class, 'ordersListing'])->name('ic_orders.listing');

        //BATCH SAVE ROUTE
        Route::post('/batch/save', [BatchController::class, 'store'])->name('ic_batch.store');
        Route::post('/batch/status', [BatchController::class, 'status'])->name('ic_batch.status');

        //BATCH FORCE PUSH ROUTE
        Route::post('/batch/force', [BatchController::class, 'force'])->name('ic_batch.force');
        Route::get('/batch/export', [BatchController::class, 'exportBatch'])->name('ic_batch.export');
        Route::get('/batch/download', [BatchController::class, 'downloadBatch'])->name('ic_batch.download');

        //MASTER PO STATUS
        Route::post('/batch/master-po/status', [BatchController::class, 'MasterPoStatus'])->name('ic_batch.master_po.status');

        Route::inertia('/shopify-accounts', 'Applications/InConnect/Connections/ShopifyAccounts/ShopifyAccounts')->name('ic_shopifyaccounts');
        Route::inertia('/user-management', 'Applications/InConnect/UserManagement/UserManagement')->name('ic_usermanagement');

        Route::get('/goosely-rules', function () {
            return Inertia::render('Applications/InConnect/Connections/Rules/Rules', [
                'productTypes' => ProductType::all(),
            ]);
        })->name('ic_goosely_rules');
        /* BC : https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7706649261 Start */
        Route::get('/goosely-jobs', function () {
            return Inertia::render('Applications/InConnect/Connections/Jobs/Jobs', [
                'productTypes' => ProductType::all(),
            ]);
        })->name('ic_goosely_jobs');

        /* BC : https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7706649261 End */
        Route::get('/fetch-rules-list', [RuleController::class, 'rulesList'])->name('ic_rules.list');
        Route::post('/rules', [RuleController::class, 'store'])->name('ic_rules.store');
        Route::post('/rules/update', [RuleController::class, 'update'])->name('ic_rules.update');
        Route::post('/rules/destroy', [RuleController::class, 'destroy'])->name('ic_rules.destroy');

        //ABDULLAH
        Route::get('/shopify-accounts/account-create', [ShopifyAccountsController::class, 'accountCreate']);
        Route::post('/shopify-accounts/account-create', [ShopifyAccountsController::class, 'SaveInConnectAccount']);
        Route::post('/shopify-accounts/change-statuses', [ShopifyAccountsController::class, 'changeStatuses'])->name('ic_change_statuses');
        Route::post('/shopify-accounts/duplicate-inconnect', [ShopifyAccountsController::class, 'duplicateInconnect'])->name('duplicateInconnect');

        Route::inertia('/shopify-accounts', 'Applications/InConnect/Connections/ShopifyAccounts/ShopifyAccounts')->name('ic_shopifyaccounts');
        Route::inertia('/account-detail', 'Applications/InConnect/Connections/ShopifyAccounts/Connections/Connections')->name('ic_default_stepper');

        Route::get('/create_intacct_item', [IntacctController::class, 'createIntacctItem'])->name('ic_create_intacct_item');
        Route::get('/create_po_order', [IntacctController::class, 'createIntacctOrder'])->name('ic_create_intacct_order');

        Route::get('/shopify-accounts-list', [ShopifyAccountsController::class, 'index'])->name('shopify_accounts.list');

        Route::get('/get-users', [ShopifyAccountsController::class, 'getUsers'])->name('get_users');

        Route::get('/test', [DashboardController::class, 'test']);

        Route::get('/decline-fraud/{id}', [OrderController::class, 'declineFraud'])->name('decline_fraud');
        Route::post('/fraud-processed', [OrderController::class, 'fraudOrderDone'])->name('order_reinitiate');

        Route::post('/get-edit-order', [EditOrderController::class, 'getEditOrder'])->name('getEditOrder');
        Route::post('/update-order', [EditOrderController::class, 'updateOrder'])->name('updateOrder');

        Route::post('/complete-order-manually', [OrderController::class, 'completeOrderManually'])->name('completeOrderManually');
        Route::get('/test-get-orders', [TestControllerTwo::class, 'getOrders'])->name('getOrders');
        Route::controller(TrackingController::class)->group(function () {
            Route::get('/tracking', 'index')->name('ic_batch.tracking');
            Route::get('/tracking-orders', 'ordersList')->name('ic_batch.tracking_orders');
            Route::post('/tracking-export', 'export')->name('ic_orders.tracking_export');
            Route::get('/tracking-orders-download', 'download')->name('ic_batch.tracking_orders_download');
        });
    });
});

// Route::get('/inconnect_test', function() {
//     return removeHash("POS#HTCH1136");
// });

// Route::get('/goosely/remove-so', [TestController::class, 'removeSO']);

// Route::get('/goosely/check-majors', function () {
//     // $orders = App\Models\InConnect\InconnectOrder::whereNull('intact_sales_invoice_id')->whereNotNull('intact_sales_order_id')->whereNotNull('fulfillment_status')->get();
//     $orders = App\Models\InConnect\InconnectOrder::where('shopify_order_id',5791301042411)->get();

//     foreach ($orders as $key => $order_in) {
//         $user = User::find($order_in->user_id);
//         $orderResponse = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $order_in->shopify_order_id . '.json');
//         if($orderResponse['errors'] == false){
//             $shopifyOrder = $orderResponse['body']['order'];
//             logger($shopifyOrder->name);
//             App\Jobs\InConnect\IntacctSalesOrderJob::dispatch($shopifyOrder, $order_in);
//             App\Jobs\InConnect\IntacctSalesOrderJob::dispatch($shopifyOrder, $order_in, 'Sales Invoice');
//         } else {
//             logger(json_encode($orderResponse));
//             logger(json_encode($user));
//         }
//     }
//     return "ALL GOOD TO GO";
// });

// Route::get('/goosely/attachment', [TestController::class, 'addAttachmentParent']);

// Route::get('/goosely/make-perfect', function () {
//     $cas_numbers = ["CAS19896"];

//     $orders = App\Models\InConnect\InconnectOrder::whereIn("shopify_order_name", $cas_numbers)->get();
//     return $orders;
// });

// Route::get('/goosely/generate-fraud', function () {
//     $users  = User::whereHas('inconnect_account')->get();
//     // return $users;
//     foreach ($users as $key => $user) {
//         logger(json_encode($user->inconnect_account->fraud_statuses));
//         $user->inconnect_account->fraud_statuses()->create();
//     }
// });

// Route::get('/goosely/calculate-days', function () {
//     // Example usage
//     $days = 15;
//     $excludedDates = ['06-12', '06-14', '06-16'];
//     $exclude = false; // Change to false if weekends should not be excluded
//     $dueDate = calculateDueDate($days, $excludedDates, $exclude);
//     echo "The due date is: $dueDate\n";
// });

// Route::get('/goosely/check-order', function () {

//     $user = User::find(250);
//     $order = $user->api()->rest('GET', '/admin/api/2023-10/orders/6141445407035.json');
//     return $payload = $order['body']['order'];
// });

// Route::get('/goosely/check-order', function () {

//     $user = User::find(263);
//     $order = $user->api()->rest('GET', '/admin/api/2023-10/orders/5469062234251.json');
//     $payload = $order['body']['order'];

//     $modifiedPayload = replace_ampersand($payload);
//     return $modifiedPayload;
// });


// Route::get('/goosely/place-order-manual', function () {

//     $user = User::find(6);
//     $order = $user->api()->rest('GET', '/admin/api/2023-10/orders/4260224401457.json');
//     $payload = $order['body']['order'];

//     OrderCreateJob::dispatch($user, $payload);

//     return "Order No. 4260224401457 has been placed successfully";
// });


// Route::get('/goosely/delete-all', function () {

//     $orders = InconnectOrder::whereIn('user_id', [40, 176])->get();

//     foreach ($orders as $key => $order) {

//         foreach ($order->updates as $key => $update) {
//             $update->delete();
//         }

//         foreach ($order->emails as $key => $email) {
//             $email->delete();
//         }

//         foreach ($order->vendorPrices as $key => $vp) {
//             $vp->delete();
//         }


//         foreach ($order->logs as $key => $log) {
//             $log->delete();
//         }

//         foreach ($order->vendorPurchaseOrders as $key => $po_order) {
//             $po_order->delete();
//         }

//         $order->delete();
//     }

//     return "ALL OK";
// });

// Route::get('/goosely/test-idex', [TestController::class, 'index']);
