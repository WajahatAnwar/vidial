<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\User;
use App\Models\Video;
use Illuminate\Http\Request;
use App\Models\EmailTemplate;
use Carbon\Carbon;
class AdminController extends Controller
{
    public function showadminlogin()
    {
    }
    public function fetchingdataofusers()
    {

        $user_info = User::with(['plan', 'videos_count', 'mail_count'])
            ->where('role_id', "2")
            ->withCount('videos')
            ->get();

        $store_list = [];
        
        foreach ($user_info as $user) {
            $video_count = Video::where("status", "Approved")->where("user_id", $user->id)->count();
            
            $approved_videos_count = $user->videos_count;
            $plan_info = $user->plan;
            $send_mail_count = $user->mail_count->count();

            if ($user != null) {
                $store_list[] = [
                    'id' => $user->id,
                    'store_name' => $user->name,
                    'plan_name' => $plan_info ? $plan_info->name : null,
                    'approved_video' => $video_count,
                    'email_send' => $send_mail_count,
                    'Watermark' => $user->water_mark,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'User Plan Shown',
            'user_details' => $store_list,
        ]);
    }

    public function update_status_for_water_mark(Request $request)
    {
        $user_info = User::where('id', $request->user_id)
            ->update([
                'water_mark' => $request->status
            ]);


        return response()->json([
            'success' => true,
            'message' => 'WaterMark Status Updated',
            'user_details' => $user_info,
            // 'updated_record' => $store_list
        ]);
    }

    // test email

    public function testEmail()
    {
        dd(emailLanguageConverter('fr',5));
        $date1 = Carbon::parse(Carbon::now());
        $date2 = Carbon::parse('2023-04-12 07:51:15');
        $diffInHours = $date1->diffInHours($date2);
        
        $user_template= EmailTemplate::with('user')->where('user_id',5)
        ->where('type','=', 'Post_Purchase')
        ->first();

        if($user_template){
            $body['body'] = str_replace('{{name}}', 'Ali ahmed', $user_template['body']);
            $body['body'] = str_replace('{{amount}}', '100', $body['body']);
           
            
            $body['btn_text'] =  $user_template['btn_text'];
            $body['btn_color'] =  $user_template['btn_color'];
            sendMail('ali@swishtag.com', $user_template['subject'], 'emails.Post_Purchase', ['body' => $body]);
            dd('sent');
        }


        //dd(sendMail('ali@swishtag.com', $postPurchase['subject'], $postPurchase['body'],$params));
    }
}
