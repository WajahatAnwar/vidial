<?php

namespace App\Http\Controllers\Analytics;
use App\Http\Controllers\Controller;
use App\Models\AllInOne\Collection;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\Order;
use App\Models\Analytics\ALReportLog;
use App\Models\Analytics\ALSetting;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Getting Report Content
     */
    public function fetchReportContent()
    {
        $data['ordersCount'] = Order::count();
        $data['productsCount'] = Product::count();
        $data['collectionsCount'] = Collection::count();
        $data['reportLogs'] = ALReportLog::all();
        return responseJson(true, 'Fetch Data Successfully', $data);
    }

    /**
     * Generating report logs
     */
    public function reportLogs(Request $request){
        reportLog($request->type);
            return responseJson(true,'Logs created successfully',null);
    }

    /**
     * Save Admin Settings
     */

    public function saveSettings(Request $request){
        $settings = ALSetting::whereNotNull('low_stock')->first();
        if($settings){
            $settings->low_stock = $request->low_stock;
            $settings->save();
        }else {
            ALSetting::create(['low_stock' => $request->low_stock]);
        }

        return responseJson(true,'Settings Saved Successfully',null);
    }

    /**
     * Fetch Admin Settings
     */

     public function getSettings(){
        $data['settings'] = ALSetting::whereNotNull('low_stock')->first();
        return responseJson(true,'Get Settings',$data);
     }
}
