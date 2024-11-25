<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Analytics\OrderController;
use App\Http\Controllers\Analytics\ProductController;
use App\Http\Controllers\Analytics\ReportController;
use App\Http\Controllers\Analytics\DashboardController;
use App\Http\Controllers\Analytics\CollectionController;

// non-embedded
Route::group(['middleware' => ['auth']], function () {
    // INERTIA
    Route::inertia('/analytics/dashboard', 'Applications/Analytics/Dashboard')->name('index_analytics');
    Route::inertia('/analytics/reports', 'Applications/Analytics/Reports')->name('reports');
    Route::inertia('/analytics/products', 'Applications/Analytics/Products')->name('products');
    Route::inertia('/analytics/collections', 'Applications/Analytics/Collections')->name('collections');
    Route::inertia('/analytics/orders', 'Applications/Analytics/Orders')->name('orders');
    Route::inertia('/analytics/settings', 'Applications/Analytics/Settings')->name('settings_analytics');

    // BASIC
    Route::post('/analytics/fetch-dashboard-content', [DashboardController::class, 'fetchDashboardContent']);
    Route::get('/analytics/fetch-dashboard-content-ii', [DashboardController::class, 'fetchDashboardContentTwo']);

    Route::get('/analytics/fetch-products-list', [ProductController::class, 'productsList'])->name('products.list');

    Route::get('/analytics/fetch-collections-list', [CollectionController::class, 'collectionsList'])->name('collections.list');

    Route::get('/analytics/fetch-orders-list', [OrderController::class, 'ordersList'])->name('orders.list');
    Route::get('/analytics/fetch-all-filters', [OrderController::class, 'ordersFilters']);

    Route::get('/analytics/get_dashboard_data', [CollectionController::class, 'get_dashboard_data']);
    Route::get('/analytics/fetch-report-content', [ReportController::class, 'fetchReportContent']);
    Route::post('/analytics/generate-report-logs', [ReportController::class, 'reportLogs']);
    Route::post('/analytics/save-settings', [ReportController::class, 'SaveSettings']);
    Route::get('/analytics/fetch-settings-content', [ReportController::class, 'getSettings']);

    Route::get('/analytics/export-orders', [OrderController::class, 'exportOrders']);
    Route::get('/analytics/export-products', [ProductController::class, 'exportProducts']);
    Route::get('/analytics/export-collections', [CollectionController::class, 'exportCollections']);

    Route::post('/analytics/export-orders-refine', [OrderController::class, 'exportOrdersRefine']);
    Route::post('/analytics/export-products-refine', [ProductController::class, 'exportProductsRefine']);
    Route::post('/analytics/export-collections-refine', [CollectionController::class, 'exportCollectionsRefine']);
});

Route::get('/analytics/export-two', [DashboardController::class, 'exportTwo']);
