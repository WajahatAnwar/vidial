<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\User;
use App\Models\Video;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function showadminlogin()
    {

    }
    public function fetchingdataofusers()
    {

        $user_info = User::with(['plan', 'videos_count','mail_count'])
            ->where('role_id', "2")
            ->withCount('videos')
            ->get();

        $store_list = [];
        dd($user_info);
        foreach ($user_info as $user) {
            $approved_videos_count = $user->videos_count;
            $plan_info = $user->plan;
            $send_mail_count = $user->mail_count->count();

            if($user != null){
                $store_list[] = [
                    'id' => $user->id,
                    'store_name' => $user->name,
                    'plan_name' => $plan_info ? $plan_info->name : null,
                    'approved_video' => $approved_videos_count,
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
            'user_details' => $user_info ,
            // 'updated_record' => $store_list
        ]);
    }
}
