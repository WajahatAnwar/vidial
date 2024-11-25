<?php

use App\Http\Controllers\Punchout\DashboardController;
use App\Http\Controllers\Punchout\GatewayController;
use App\Http\Controllers\Punchout\DeveloperController;
use App\Http\Controllers\Punchout\SimulatorController;
use App\Http\Controllers\Punchout\SystemMessageController;
use App\Http\Controllers\Punchout\SettingController;
use App\Http\Controllers\Punchout\ToolsController;
use App\Models\AllInOne\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => ['auth']], function () {

    Route::prefix('punchout')->group(function () {

        Route::prefix('dashboard')->group(function () {

            Route::get('/stats', [DashboardController::class, 'dashboard'])->name('punchout.dashboard.stats');
            Route::get('/order/stats', [DashboardController::class, 'dashboardOrders'])->name('punchout.dashboard.orders.get');

        });

        Route::inertia('/dashboard', 'Applications/Punchout/Dashboard/Dashboard')->name('punchout.dashboard');
        Route::inertia('/reports', 'Applications/Punchout/Reports/Reports')->name('punchout.reports');
        Route::inertia('/developer', 'Applications/Punchout/Developer/Developer')->name('punchout.developer');

        Route::inertia('/tools', 'Applications/Punchout/Tools/Tools')->name('punchout.tools');
        Route::inertia('/settings', 'Applications/Punchout/Settings/Settings')->name('punchout.settings');
        Route::inertia('/system-messages', 'Applications/Punchout/SystemMessages/SystemMessages')->name('punchout.system-messages');

        Route::inertia('/gateway-activity/sessions', 'Applications/Punchout/GatewayActivity/GatewayActivity')->name('punchout.gateway-activity.sessions');
        Route::inertia('/gateway-activity/order-requests', 'Applications/Punchout/GatewayActivity/GatewayActivity')->name('punchout.gateway-activity.order-requests');
        Route::inertia('/gateway-activity/order-invoices', 'Applications/Punchout/GatewayActivity/GatewayActivity')->name('punchout.gateway-activity.order-invoices');

        Route::prefix('simulator')->group(function () {

            Route::prefix('catalogs')->group(function () {

                Route::get('/', [SimulatorController::class, 'indexCatalogs'])->name('punchout.simulator.catalogs');
                Route::get('/get', [SimulatorController::class, 'getCatalogs'])->name('punchout.simulator.catalogs.get');

            });

            Route::prefix('orders')->group(function () {

                Route::get('/', [SimulatorController::class, 'indexOrders'])->name('punchout.simulator.orders');
                Route::get('/get', [SimulatorController::class, 'getOrders'])->name('punchout.simulator.orders.get');
                Route::get('/{id}', [SimulatorController::class, 'getOrder'])->name('punchout.simulator.order');
                Route::post('/{id}/update-status', [SimulatorController::class, 'updateStatus'])->name('punchout.simulator.order.update-status');

            });

            Route::get('/{id}/start', [SimulatorController::class, 'startPunchout'])->name('punchout.simulator.start-punchout');
            Route::post('/{id}/punchin', [SimulatorController::class, 'punchin'])->name('punchout.simulator.punchin');


        });

        Route::prefix('gateway')->group(function () {

            Route::prefix('sessions')->group(function () {

                Route::get('/list', [GatewayController::class, 'sessionsList'])->name('punchout.sessions.list');
                Route::get('/detail/{session}', [GatewayController::class, 'fetchSessionDetail'])->name('punchout.session.detail');

            });

            Route::prefix('order-requests')->group(function () {

                Route::get('/list', [GatewayController::class, 'orderRequestLists'])->name('punchout.orderRequests.list');
                Route::post('/create-note/{order}', [GatewayController::class, 'createNote'])->name('punchout.order-request.create-note.post');
                Route::get('/detail/{order}', [GatewayController::class, 'orderRequestDetails'])->name('punchout.orderRequests.detail');
                Route::post('/create-invoice', [GatewayController::class, 'CreateInvoice'])->name('punchout.createinvoice.post');
                Route::post('/create-invoice-original', [GatewayController::class, 'CreateInvoiceFromOriginalOrder'])->name('punchout.createinvoiceORG.post');
                Route::post('/recreate-order/{order}', [GatewayController::class, 'recreateConfirmOrder'])->name('punchout.orderRequests.recreate');

            });

            Route::prefix('order-invoices')->group(function () {

                Route::post('/create-note/{invoice}', [GatewayController::class, 'createInvoiceNote'])->name('punchout.order-invoice.create-note.post');
                Route::get('/list', [GatewayController::class, 'orderInvoicesLists'])->name('punchout.orderInvoices.list');
                Route::get('/detail/{invoice}', [GatewayController::class, 'orderInvoiceDetails'])->name('punchout.orderInvoice.detail');
                Route::post('/push/{invoice}', [GatewayController::class, 'orderInvoicePush'])->name('punchout.orderInvoice.push');
                Route::post('/update/{invoice}/{status}', action: [GatewayController::class, 'orderInvoiceUpdate'])->name('punchout.orderInvoice.updateStatus');

            });

        });

        Route::prefix('developer')->group(function () {

            Route::get('/fetch-clients-list', [DeveloperController::class, 'gatewayClientsList'])->name('punchout.clients_list.list');
            Route::get('/fetch-networks', [DeveloperController::class, 'getNetworks'])->name('punchout.networks.list');
            Route::post('/create', [DeveloperController::class, 'createGatewayClient'])->name('punchout.create_client.list');
            Route::post('/create-cxml-post', [DeveloperController::class, 'createCXMLPost'])->name('punchout.cxml_post.create');

        });

        Route::prefix('system-messages')->group(function () {

            Route::get('/get-system-messages', [SystemMessageController::class, 'getSystemMessages'])->name('punchout.system-messages.get');

        });

        Route::prefix('settings')->group(function () {

            Route::get('/get-catalogs', [SettingController::class, 'getCatalogs'])->name('punchout.catalogs.get');
            Route::get('/get-gateway-client', [SettingController::class, 'getGatewayClient'])->name('punchout.gateway.client.get');
            Route::get('/get-account-address', [SettingController::class, 'getAccountAddress'])->name('punchout.account.address.get');
            Route::post('/account-address/create', [SettingController::class, 'createAccountAddress'])->name('punchout.account_address.create');

        });

        Route::prefix('tools')->group(function () {

            Route::prefix('custom-quote')->group(function () {

                Route::get('/get', [ToolsController::class, 'getCustomQuote'])->name('punchout.custom.quote.get');
                Route::get('/get-items/{id}', [ToolsController::class, 'getCustomQuoteItems'])->name('punchout.custom.quote.items.get');
                Route::post('/delete/{id}', [ToolsController::class, 'deleteCustomQuote'])->name('punchout.custom.quote.delete');
                Route::post('/line-items/create', [ToolsController::class, 'createLineItems'])->name('punchout.custom.quote.line.item.create');
                Route::post('/line-items/delete/{lineItem}', [ToolsController::class, 'deleteLineItems'])->name('punchout.custom.quote.line.item.delete');
                Route::post('/push-to-shopify', [ToolsController::class, 'pushToShopify'])->name('punchout.custom.quote.push.shopify.create');
                Route::post('/create', [ToolsController::class, 'createQuote'])->name('punchout.custom.quote.create');
                Route::get('/fetch-types', [ToolsController::class, 'getTypes'])->name('punchout.custom.quote.type.list');

            });

            Route::prefix('discount-code')->group(function () {

                Route::get('/get', [ToolsController::class, 'getDiscountCodes'])->name('punchout.discount.codes.get');
                Route::get('/get/{id}', [ToolsController::class, 'getDiscountCodeById'])->name('punchout.discount.code.get.id');
                Route::get('/get-options', [ToolsController::class, 'getDiscountCodeOptions'])->name('punchout.discount.code.select.options');
                Route::post('/delete/{id}', [ToolsController::class, 'deleteDiscountCode'])->name('punchout.discount.code.delete');
                Route::post('/create', [ToolsController::class, 'createDiscountCode'])->name('punchout.discount.code.create');

            });

            Route::prefix('product-quantity-limit')->group(function () {

                Route::get('/get', [ToolsController::class, 'getProductQuantity'])->name('punchout.product.quantity.get');
                Route::post('/delete/{id}', [ToolsController::class, 'deleteProductQuantity'])->name('punchout.product.quantity.delete');
                Route::post('/create', [ToolsController::class, 'createProductQuantity'])->name('punchout.product.quantity.create');
                Route::post('/single/create', [ToolsController::class, 'createSingleProductQuantity'])->name('punchout.product.quantity.single.create');

            });

        });

    });

});

Route::prefix('punchout')->group(function () {

    Route::prefix('gateway')->group(function () {

        Route::match(['GET', 'POST'], '/{id}/punchout', [GatewayController::class, 'punchout'])->name('punchout.gateway.punchout');
        Route::post('/{id}/order-request', [GatewayController::class, 'orderRequest'])->name('punchout.gateway.order.request');
        Route::get('/{id}/session/start', [GatewayController::class, 'startPunchoutSession'])->name('punchout.gateway.session.start');
        Route::match(['GET', 'POST'], '/checkout/{id}', [GatewayController::class, 'checkout'])->name('punchout.checkout');
        Route::post('/{id}/punchin', [GatewayController::class, 'punchin'])->name('punchout.gateway.punchin');
        Route::get('/{id}/profile', [GatewayController::class, 'profile'])->name('punchout.gateway.profile');
        Route::get('/{id}/credentials', [GatewayController::class, 'credentials'])->name('punchout.gateway.credentials');
        Route::post('/{id}/credentials/authenticate', [GatewayController::class, 'authenticateCredentials'])->name('punchout.gateway.credentials.authenticate');

    });

});

// CONVERT PUNCHOUT USERS TO USERS
Route::get('/punchout/add-punchout-users-to-users', function () {
    $old_users = DB::connection('punchout_conn')->table('users')->get();
    DB::transaction(function () use ($old_users) {
        foreach ($old_users as $key => $old) {
            $existing_user = User::where('email', $old->email)->first();
            if (!$existing_user) {
                $new_user = new User();
                $new_user->fill([
                    // password_reset to Reset@321
                    'password' => Hash::make('Reset@321'),
                    'role_id' => 4,
                    'name' => $old->name,
                    'email' => $old->email,
                    'created_at' => $old->created_at,
                    'updated_at' => $old->updated_at,
                    'old_user_id' => $old->id,
                    'access_level_id' => $old->access_level_id,
                    'account_id' => $old->account_id,
                    'status_id' => $old->status_id,
                    'lastname' => $old->lastname,
                    'username' => $old->username,
                    'quick_login_code' => $old->quick_login_code,
                    'hash' => $old->hash,
                    'last_login' => $old->last_login,
                    'last_known_ip' => $old->last_known_ip,
                    'auto_login_token' => $old->auto_login_token,
                    'password_recovery_token' => $old->password_recovery_token,
                    'uuid' => $old->uuid,
                    'hashid' => $old->hashid,
                    'phone' => $old->phone,
                    'hr_parent_id' => $old->hr_parent_id,
                    'hr_parent_index' => $old->hr_parent_index,
                    'hr_department_id' => $old->hr_department_id,
                    'hr_area_id' => $old->hr_area_id,
                    'hr_status' => $old->hr_status,
                    'hr_all_access' => $old->hr_all_access,
                    'is_terminated' => $old->is_terminated,
                ]);
                $new_user->save();
            } else {
                logger($old->email . ' already exists');
            }
        }
    });
});
