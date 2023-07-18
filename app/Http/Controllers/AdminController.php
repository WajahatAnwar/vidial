<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Plan;
use App\Models\User;
use Mailgun\Mailgun;
use App\Models\Video;
use Illuminate\Http\Request;
use App\Models\EmailTemplate;
use App\Models\Log;

class AdminController extends Controller
{
    public function showadminlogin()
    {
    }
    public function fetchingdataofusers()
    {

        $user_info = User::with(['plan', 'videos_count', 'mail_count'])
            ->where('role_id', config('constants.user'))
            ->withCount('videos')
            ->get();

        $store_list = [];
        
        foreach ($user_info as $user) {
            $video_count = Video::where("status", config('constants.video_approved'))->where("user_id", $user->id)->count();
            
            $approved_videos_count = $user->videos_count;
            $plan_info = $user->plan;
            $send_mail_count = $user->mail_count->count();

            if ($user) {
                $store_list[] = [
                    'id' => $user->id,
                    'store_name' => $user->name,
                    'plan_name' => $plan_info ? $plan_info->name : null,
                    'approved_video' => $video_count,
                    'email_send' => $send_mail_count,
                    'Watermark' => $user->water_mark,
                    'install_date'=>$user->formatted_created_at,
                    'install_status'=> $user->deleted_at ? 0 : 1,
                    'store_email'=> $user->email
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
        // $user = User::find(105);

        //     if ($user) {
        //         $scriptTag = $user->api()->rest('GET', '/admin/api/2023-01/script_tags.json');
        //          dd($scriptTag);
        //         if (isset($scriptTag['body']['script_tags'][0]['id'])) {
        //             $id = $scriptTag['body']['script_tags'][0]['id'];

        //             $scriptTagDel = $user->api()->rest('delete', '/admin/api/2023-01/script_tags/' . $id . '.json');
        //             \Log::info('removed scriptag');
        //             \Log::info(json_encode($user));
        //         }else {
        //             \Log::info('not removed scriptag');
        //             \Log::info('not removed scriptag' . json_encode($user));
        //         }
            
        //     }
        

        dd('script completed');
        
        
    }
}
