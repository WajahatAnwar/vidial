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
        $shop->email=$shopData['body']['shop']['email'];
        $shop->store_name=$shopData['body']['shop']['name'];
        $shop->save();

        $inst =json_encode([
            ['id'=>1,'value'=>'Record a video off up to 30 seconds'],
            ['id'=>2,'value'=>'Share your genuine experience of the product'],
            ['id'=>3,'value'=>'Showcase the product'],
            ['id'=>4,'value'=>"Tell why you've decided to try  ". $shop->name],
            ['id'=>5,'value'=>"Describe the main benefits of " . $shop->name],
        ]);

        // adding settings on installation
        Setting::firstOrCreate([
            'user_id'=>$shop->id
        ],[
            'user_id'=>$shop->id,
                'store_credit'=>50,
                'logo'=>'',
                'instructions'=>$inst,
                'instruction_title'=>'Send us a video to receive a '.getCurrencySymbol($shop->store_currency).'50 Gift Card',
                'video'=>'',
                'page_color'=>'#000000',
                'page_display_to_customers'=>5,
                'email_sent_to_customer'=>2,
                'page_link'=>10,
                'locale'=>'en',
                'email_status'=>'true'
        ]);
         return view('welcome');
    }
}
