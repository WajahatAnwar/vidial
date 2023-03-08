<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Plan;
use Auth;
class InstallationController extends Controller
{
    /******* Installation App ******/
    public function index(){

        // $email_count  =  Plan::where('id',auth()->user()->plan_id)->first();
        // if(auth()->user()->init_flag == 0){
            // Auth::user()->update(['init_flag' => 1,'ugc_email_count' =>$email_count->ugc_email_count, 'ugc_video_count' =>$email_count->ugc_video_count,'remaining_email' => $email_count->ugc_email_count]);
        // }
        $shop = Auth::user();
        $shopData = $shop->api()->rest('get', '/admin/api/2023-01/shop.json');
        $shop->store_currency=$shopData['body']['shop']['currency'];
        $shop->save();
        // dd($shopData['body']['shop']['currency']);
         return view('welcome');
    }
}
