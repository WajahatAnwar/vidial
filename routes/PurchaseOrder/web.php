<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PurchaseOrder\ButtonController;
use App\Http\Controllers\PurchaseOrder\DashboardController;
use App\Http\Controllers\PurchaseOrder\EmailController;
use App\Http\Controllers\PurchaseOrder\OrdersController;
use App\Http\Controllers\PurchaseOrder\RuleController;
use App\Http\Controllers\PurchaseOrder\ShippingController;
use App\Http\Controllers\PurchaseOrder\StoreController;
use App\Http\Controllers\PurchaseOrder\StoreFrontController;
use App\Models\PurchaseOrder\POEmail;
use App\Models\PurchaseOrder\PORule;
use Illuminate\Contracts\Validation\Rule;

Route::get("merchant_view", [DashboardController::class, 'merchant_view']);

Route::group(['middleware' => ['auth']], function () {

    Route::inertia('/purchase_order/dashboard', 'Applications/PurchaseOrder/Dashboard')->name('index_purchase_order');
    Route::inertia('/purchase_order/stores', 'Applications/PurchaseOrder/Stores')->name('stores_purchase_order');
    Route::inertia('/purchase_order/orders', 'Applications/PurchaseOrder/Orders')->name('orders_purchase_order');
    Route::inertia('/purchase_order/rules', 'Applications/PurchaseOrder/Rules')->name('rules_purchase_order');
    Route::inertia('/purchase_order/emails', 'Applications/PurchaseOrder/Emails')->name('emails_purchase_order');
    Route::inertia('/purchase_order/settings', 'Applications/PurchaseOrder/Settings')->name('settings_purchase_order');
    Route::inertia('/purchase_order/shipping', 'Applications/PurchaseOrder/Shipping')->name('shipping_purchase_order');

    Route::inertia('/purchase_order/new_email', 'Applications/PurchaseOrder/NewEmail')->name('new_email_purchase_order');

    Route::get('/purchase_order/edit_email/{email}', function (POEmail $email) {
        return inertia('Applications/PurchaseOrder/EditEmail', compact('email'));
    })->name('edit_email_purchase_order');

    Route::inertia('/purchase_order/new_rule', 'Applications/PurchaseOrder/NewRule')->name('new_rule_purchase_order');

    Route::get('/purchase_order/edit_rule/{rule_id}', function ($rule_id) {
        $rule = PORule::with('stores')->where('id', $rule_id)->first();
        return inertia('Applications/PurchaseOrder/EditRule', compact('rule'));
    })->name('edit_rule_purchase_order');

    Route::get("/purchase_order/stores_list", [RuleController::class, 'stores_list']);
    Route::post("/purchase_order/add_new_rule", [RuleController::class, 'add_new_rule']);
    Route::get("/purchase_order/get_rules", [RuleController::class, 'get_rules'])->name('po_rules_list');
    Route::post("/purchase_order/edit_existing_rule", [RuleController::class, 'edit_existing_rule']);
    Route::post("/purchase_order/delete_rule", [RuleController::class, 'delete_rule']);


    Route::get("/purchase_order/get_stores_and_rules", [StoreController::class, 'get_stores_and_rules'])->name('po_stores');
    Route::post("/purchase_order/remove_rule", [StoreController::class, 'remove_rule']);
    Route::post("/purchase_order/apply_rule", [StoreController::class, 'apply_rule']);
    Route::post("/purchase_order/update_colors", [StoreController::class, 'update_colors']);
    Route::post("/purchase_order/set_store_email", [StoreController::class, 'set_store_email']);

    Route::post("/purchase_order/add_new_email", [EmailController::class, 'add_new_email']);
    Route::get("/purchase_order/get_emails", [EmailController::class, 'get_emails'])->name('po_emails_list');
    Route::post("/purchase_order/edit_existing_email", [EmailController::class, 'edit_existing_email']);
    Route::post("/purchase_order/delete_email", [EmailController::class, 'delete_email']);
    Route::post("/purchase_order/change_email_status", [EmailController::class, 'change_email_status']);

    Route::get("/purchase_order/get_button_settings", [ButtonController::class, 'get_button_settings']);
    Route::post("/purchase_order/set_button_settings", [ButtonController::class, 'set_button_settings']);
    Route::post("/purchase_order/change_order_status", [ButtonController::class, 'change_order_status']);
    Route::post("/purchase_order/import_csv", [ButtonController::class, 'import_csv']);
    Route::get("/purchase_order/export_csv", [ButtonController::class, 'export_csv']);
    Route::post("/purchase_order/remove_csv", [ButtonController::class, 'remove_csv']);

    Route::post("/purchase_order/set_button_settings_two", [ButtonController::class, 'set_button_settings_two']);

    Route::get("/purchase_order/get_orders", [OrdersController::class, 'get_orders'])->name('po_orders_list');
    Route::post("/purchase_order/approve_selected", [OrdersController::class, 'approve_selected']);

    Route::get("/purchase_order/get_dashboard_data", [DashboardController::class, 'get_dashboard_data']);

    Route::post("/purchase_order/change_discount_field_status", [DashboardController::class, 'discount_settings']);

    //SHIPPIGN ROUTES
    Route::get("/purchase_order/get_shipping_data", [ShippingController::class, 'get_shipping_data']);
    Route::post("/purchase_order/add_edit_price_shipping", [ShippingController::class, 'add_edit_price_shipping']);
    Route::post("/purchase_order/delete_price_shipping", [ShippingController::class, 'delete_price_shipping']);

    Route::post("/purchase_order/add_edit_location_shipping", [ShippingController::class, 'add_edit_location_shipping']);
    Route::post("/purchase_order/delete_location_shipping", [ShippingController::class, 'delete_location_shipping']);

    Route::post("/purchase_order/add_edit_rule_shipping", [ShippingController::class, 'add_edit_rule_shipping']);
    Route::post("/purchase_order/delete_rule_shipping", [ShippingController::class, 'delete_rule_shipping']);

    Route::post("/purchase_order/apply_rule_two", [ShippingController::class, 'apply_rule_two']);
    Route::post("/purchase_order/delete_rule_two", [ShippingController::class, 'delete_rule_two']);

    // Route::get("/purchase_order/testing", [StoreFrontController::class, 'shipping']);
});
