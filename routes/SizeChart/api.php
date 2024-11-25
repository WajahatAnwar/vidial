<?php

use App\Http\Controllers\SizeChart\RuleController;
use App\Http\Controllers\SizeChart\SettingController;
use Illuminate\Support\Facades\Route;

Route::post('/size_chart/apply-rule', [RuleController::class, 'applyRule'])->name('rules.apply');
Route::get('/size_chart/get-setting', [SettingController::class, 'getSettings']);
