<?php

namespace App\Http\Controllers\SizeChart;
use App\Http\Controllers\Controller;
use App\Models\SizeChart\SCSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function getSetting()
    {
        $setting = SCSetting::first();
        if(!$setting) {
            $setting = SCSetting::create([
                'button_text' => 'Size chart'
            ]);
        }
        return Inertia::render('Applications/SizeChart/Settings', [
            'setting' => $setting,
        ]);
    }

    public function updateSetting(Request $request)
    {
        $validator = validator($request->all(), [
            'button_text' => 'required',
        ]);
        if($validator->fails()) {
            return sendResponse(false, $validator->errors()->first());
        }
        $setting = SCSetting::first();
        $updated = $setting->update($request->all());
        if(!$updated) {
            return sendResponse(false, 'An error occured while updating the setting!');
        }
        return sendResponse(true, 'Settings updated successfully!');
    }

    public function getSettings()
    {
        $setting = SCSetting::first();
        if(!$setting) {
            $setting = SCSetting::create([
                'button_text' => 'Size chart'
            ]);
        }
        return sendResponse(true, 'Size chart settings retrieved successfully!', $setting);
    }
}
