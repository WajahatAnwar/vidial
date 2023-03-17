<?php

namespace App\Http\Controllers;

use Auth;
use App\Models\Plan;
use App\Models\Setting;
use Illuminate\Http\Request;

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
        // Setting::firstOrNew(['user_id'=>$shop->id],[
        //     'user_id'=>$shop->id,
        //     'store_credit'=>50,
        //     'logo'=>'',
        //     'instructions'=>'[]',
        //     'instruction_title'=>'',
        //     'video'=>'',
        //     'page_color'=>'#000000',
        //     'page_display_to_customers'=>5,
        //     'email_sent_to_customer'=>2,
        //     'page_link'=>10,
        //     'locale'=>'en',
        //     'email_status'=>true
        // ]);
        // dd($shopData['body']['shop']['currency']);
         return view('welcome');
    }
}
