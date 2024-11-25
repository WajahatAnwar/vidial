<?php

use App\Http\Controllers\AllInOne\AuthController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\VirtualOptions\ApplicatorController;
use App\Http\Controllers\VirtualOptions\ColorsController;
use App\Http\Controllers\VirtualOptions\ConditionController;
use App\Http\Controllers\VirtualOptions\DashboardController;
use App\Http\Controllers\VirtualOptions\LogoController;
use App\Http\Controllers\VirtualOptions\OptionSetController;

Route::group(['middleware' => ['auth']], function () {

    Route::inertia('/virtual_options/dashboard', 'Applications/VirtualOptions/Dashboard/Dashboard')->name('index_virtual_options');
    Route::inertia('/virtual_options/colors', 'Applications/VirtualOptions/Colors/Colors')->name('colors');
    Route::inertia('/virtual_options/logos', 'Applications/VirtualOptions/Logos/Logos')->name('logos');
    Route::inertia('/virtual_options/option_sets', 'Applications/VirtualOptions/OptionSets/OptionSets')->name('option_sets');
    Route::inertia('/virtual_options/stores_list',  'Applications/VirtualOptions/Applicator/Applicator')->name('stores');

    Route::get('/virtual_options/colors_list',  [ColorsController::class, 'get_colors_list'])->name('colors.get');
    Route::get('/virtual_options/color_families_list',  [ColorsController::class, 'color_families_list']);
    Route::post('/virtual_options/add_color_family',  [ColorsController::class, 'add_color_family']);
    Route::post('/virtual_options/assign_color_family',  [ColorsController::class, 'assign_color_family']);
    Route::post('/virtual_options/remove_color_family',  [ColorsController::class, 'remove_color_family']);
    Route::post('/virtual_options/get_family_editing_data',  [ColorsController::class, 'get_family_editing_data']);
    Route::post('/virtual_options/update_family_name',  [ColorsController::class, 'update_family_name']);
    Route::post('/virtual_options/delete_family',  [ColorsController::class, 'delete_family']);
    Route::post('/virtual_options/get_color_and_its_families',  [ColorsController::class, 'get_color_and_its_families']);

    Route::get('/virtual_options/logos_list',  [LogoController::class, 'logos_list'])->name('logos.get');
    Route::get('/virtual_options/logo_groups_list',  [LogoController::class, 'logo_groups_list']);
    Route::post('/virtual_options/add_logo_group',  [LogoController::class, 'add_logo_group']);
    Route::get('/virtual_options/get_add_logo_data',  [LogoController::class, 'get_add_logo_data']);
    Route::get('/virtual_options/get_logo_editing_data',  [LogoController::class, 'get_logo_editing_data']);
    Route::post('/virtual_options/add_logo',  [LogoController::class, 'add_logo']);
    Route::get('/virtual_options/color_families_table',  [LogoController::class, 'color_families_table'])->name('color_families_table.get');
    Route::post('/virtual_options/assign_logo_color_families',  [LogoController::class, 'assign_logo_color_families']);
    Route::get('/virtual_options/logo_groups_table',  [LogoController::class, 'logo_groups_table'])->name('logo_groups_table.get');
    Route::post('/virtual_options/assign_logo_logo_groups',  [LogoController::class, 'assign_logo_logo_groups']);
    Route::post('/virtual_options/get_logo_group_editing_data',  [LogoController::class, 'get_logo_group_editing_data']);
    Route::post('/virtual_options/update_logo_group_name',  [LogoController::class, 'update_logo_group_name']);
    Route::post('/virtual_options/delete_logo_group',  [LogoController::class, 'delete_logo_group']);
    Route::post('/virtual_options/remove_logo',  [LogoController::class, 'remove_logo']);
    Route::post('/virtual_options/remove_logo_two',  [LogoController::class, 'remove_logo_two']);
    Route::post('/virtual_options/delete_logos',  [LogoController::class, 'delete_logos']);

    Route::post('/virtual_options/options_list_sort',  [OptionSetController::class, 'options_list_sort']);
    Route::post('/virtual_options/manage_new_sort',  [OptionSetController::class, 'manage_new_sort']);

    Route::get('/virtual_options/options_list',  [OptionSetController::class, 'options_list'])->name('options.get');
    Route::get('/virtual_options/options_sets_list',  [OptionSetController::class, 'options_sets_list']);
    Route::post('/virtual_options/add_option_set',  [OptionSetController::class, 'add_option_set']);
    Route::get('/virtual_options/options_sets_table',  [OptionSetController::class, 'options_sets_table'])->name('options_sets_table.get');
    Route::post('/virtual_options/get_option_set_editing_data',  [OptionSetController::class, 'get_option_set_editing_data']);
    Route::post('/virtual_options/update_option_set_name',  [OptionSetController::class, 'update_option_set_name']);
    Route::post('/virtual_options/delete_option_set',  [OptionSetController::class, 'delete_option_set']);
    Route::post('/virtual_options/add_option',  [OptionSetController::class, 'add_option']);
    Route::get('/virtual_options/get_add_option_data',  [OptionSetController::class, 'get_add_option_data']);
    Route::get('/virtual_options/get_logo_group_logos',  [OptionSetController::class, 'get_logo_group_logos']);
    Route::post('/virtual_options/assign_option_option_sets',  [OptionSetController::class, 'assign_option_option_sets']);
    Route::post('/virtual_options/delete_options',  [OptionSetController::class, 'delete_options']);
    Route::post('/virtual_options/delete_selected_options',  [OptionSetController::class, 'delete_selected_options']);
    Route::post('/virtual_options/remove_option',  [OptionSetController::class, 'remove_option']);
    Route::get('/virtual_options/get_option_editing_data',  [OptionSetController::class, 'get_option_editing_data']);
    Route::post('/virtual_options/assign_option_specific',  [OptionSetController::class, 'assign_option_specific']);

    Route::get('/virtual_options/get_regarding_options',  [ConditionController::class, 'get_regarding_options']);
    Route::get('/virtual_options/get_regarding_option_data',  [ConditionController::class, 'get_regarding_option_data']);

    Route::get('/virtual_options/products_list',  [ApplicatorController::class, 'get_products_list'])->name('products.get');
    Route::get('/virtual_options/applicator_filters',  [ApplicatorController::class, 'applicator_filters']);
    Route::post('/virtual_options/assign_option_set',  [ApplicatorController::class, 'assign_option_set']);
    Route::post('/virtual_options/remove_option_set',  [ApplicatorController::class, 'remove_option_set']);

    Route::post('/virtual_options/get_dashboard_data', [DashboardController::class, 'get_dashboard_data']);
});
