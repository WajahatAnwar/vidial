<?php

use App\Http\Controllers\AllInOne\AuthController;
use App\Http\Controllers\Filter\DashboardContrller;
use App\Http\Controllers\Filter\FilterApplicator;
use App\Http\Controllers\Filter\FilterController;
use App\Http\Controllers\Filter\FilterSetController;
use App\Http\Controllers\Filter\PreRequisiteController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\VirtualOptions\ApplicatorController;
use App\Http\Controllers\VirtualOptions\ColorsController;
use App\Http\Controllers\VirtualOptions\ConditionController;
use App\Http\Controllers\VirtualOptions\DashboardController;
use App\Http\Controllers\VirtualOptions\LogoController;
use App\Http\Controllers\VirtualOptions\OptionSetController;

Route::get('/filter/pre-requisite', [PreRequisiteController::class, 'preRequisite']);

Route::group(['middleware' => ['auth']], function () {

    Route::prefix('filter')->group(function () {

        Route::inertia('/dashboard', 'Applications/Filter/Dashboard/Dashboard')->name('index_filters');
        Route::inertia('/filter_sets', 'Applications/Filter/FilterSets/FilterSets')->name('filter_sets');
        Route::inertia('/applicator',  'Applications/Filter/Applicator/Applicator')->name('filter_applicator');
        Route::inertia('/store',  'Applications/Filter/Stores/Stores')->name('filter_stores');

        //NEW ROUTES
        Route::get('/filter_sets_list',  [FilterSetController::class, 'filter_sets_list']);
        Route::post('/add_filter_set',  [FilterSetController::class, 'add_filter_set']);
        Route::post('/get_filter_set_editing_data',  [FilterSetController::class, 'get_filter_set_editing_data']);
        Route::post('/update_filter_set_name',  [FilterSetController::class, 'update_filter_set_name']);
        Route::get('/filter_sets_table',  [FilterSetController::class, 'filter_sets_table'])->name('filter_sets_table.get');
        Route::get('/filters_list',  [FilterController::class, 'filters_list'])->name('filters.get');
        Route::get('/get_add_filter_data',  [FilterController::class, 'get_add_filter_data']);
        Route::post('/add_filter',  [FilterController::class, 'add_filter']);
        Route::get('/get_filter_editing_data',  [FilterController::class, 'get_filter_editing_data']);
        Route::post('/assign_filter_filter_sets',  [FilterController::class, 'assign_filter_filter_sets']);
        Route::post('/remove_filter',  [FilterController::class, 'remove_filter']);
        Route::post('/assign_filter_specific',  [FilterController::class, 'assign_filter_specific']);
        Route::post('/delete_filter_set',  [FilterController::class, 'delete_filter_set']);
        Route::post('/delete_selected_filters',  [FilterController::class, 'delete_selected_filters']);
        Route::post('/filters_list_sort',  [FilterController::class, 'filters_list_sort']);
        Route::post('/manage_new_sort_filters',  [FilterController::class, 'manage_new_sort_filters']);

        Route::get('/get_collections_list',  [FilterApplicator::class, 'get_collections_list'])->name('filters.collections.get');
        Route::get('/applicator_filters',  [FilterApplicator::class, 'applicator_filters']);
        Route::get('/get_stores_list',  [FilterApplicator::class, 'getStoresList'])->name('filters.stores.get');
        Route::post('/assign_filter_set',  [FilterApplicator::class, 'assign_filter_set']);
        Route::post('/assign_collection_sort',  [FilterApplicator::class, 'assign_colleciton_sort']);
        Route::post('/assign_filter_set_store',  [FilterApplicator::class, 'assignFilterSetStore']);
        Route::post('/remove_store_filter_set',  [FilterApplicator::class, 'removeDefaultFilterSet']);
        Route::post('/remove_filter_set',  [FilterApplicator::class, 'remove_filter_set']);
        Route::post('/change_status', [FilterApplicator::class, 'change_status']);
        Route::post('/update_colors', [FilterApplicator::class, 'updateColors']);
        

        Route::post('/get_dashboard_data', [DashboardContrller::class, 'get_dashboard_data']);
    });
});
