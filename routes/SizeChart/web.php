<?php

use App\Http\Controllers\SizeChart\DashboardController;
use App\Http\Controllers\SizeChart\RuleController;
use App\Http\Controllers\SizeChart\SettingController;
use App\Http\Controllers\SizeChart\SizeChartController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Models\SizeChart\SCRule;
use App\Models\SizeChart\SCSizeChart;

// Route::group(['middleware' => ['verify.embedded', 'verify.shopify']], function () {
//     Route::get('/', function () {
//         return Inertia::render('Components/EmbeddedApp');
//     })->name('home');

//     Route::get('/get_shop_data', [DashboardController::class, 'get_shop_data'])->name('shop_data.get');
// });

Route::group(['middleware' => ['auth']], function () {
    Route::inertia('/size_chart/dashboard', 'Applications/SizeChart/Dashboard')->name('index_size_chart');
    Route::get('/size_chart/dashboard/data', [DashboardController::class, 'index'])->name('dashboard.get');
    Route::inertia('/size_chart/size-charts', 'Applications/SizeChart/SizeCharts')->name('size.charts');
    Route::inertia('/size_chart/new-size-chart', 'Applications/SizeChart/NewSizeChart')->name('size_charts.new');
    Route::inertia('/size_chart/rules', 'Applications/SizeChart/Rules')->name('rules');
    Route::get('/size_chart/settings', [SettingController::class, 'getSetting'])->name('settings_size_chart');
    Route::inertia('/size_chart/new-rule', 'Applications/SizeChart/NewRule')->name('new.rule');
    Route::get('/size_chart/edit-rule/{rule}', function (SCRule $rule) {
        return Inertia::render('Applications/SizeChart/EditRule', [
            'rule' => $rule,
        ]);
    })->name('edit.rule');
    Route::get('/size_chart/get-rule/{id}', [RuleController::class, 'getRule'])->name('get.rule');
    Route::post('/size_chart/update-rule/{id}', [RuleController::class, 'updateRule'])->name('update.rule');
    Route::post('/size_chart/add-rule', [RuleController::class, 'saveRule'])->name('add.rule');
    Route::get('/size_chart/getRules', [RuleController::class, 'getRules'])->name('rules.get');
    Route::get('/size_chart/getAllRules', [RuleController::class, 'getAllRules'])->name('rules.all.get');
    Route::post('/size_chart/setStatus/{id}', [RuleController::class, 'setStatus'])->name('rules.set.status');


    Route::get('/size_chart/getSizeCharts', [SizeChartController::class, 'getSizeCharts'])->name('size_charts.get');
    Route::post('/size_chart/setSizeChartStatus/{id}', [SizeChartController::class, 'setStatus'])->name('size_charts.set.status');
    Route::post('/size_chart/saveSizeChart', [SizeChartController::class, 'saveSizeChart'])->name('size_charts.save');
    Route::get('/size_chart/edit-sizechart/{size_chart}', function (SCSizeChart $size_chart) {
        return Inertia::render('Applications/SizeChart/EditSizeChart', [
            'size_chart' => $size_chart,
        ]);
    })->name('size_charts.edit');
    Route::post('/size_chart/updateSizeChart/{id}', [SizeChartController::class, 'updateSizeChart'])->name('size_charts.update');
    Route::post('/size_chart/updateSetting', [SettingController::class, 'updateSetting'])->name('settings.update');

    Route::post("/size_chart/delete_rule", [RuleController::class, 'delete_rule']);
    Route::post("/size_chart/delete_size_chart", [SizeChartController::class, 'delete_size_chart']);
});
