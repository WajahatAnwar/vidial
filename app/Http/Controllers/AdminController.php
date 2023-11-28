<?php

namespace App\Http\Controllers;

use Exception;
use Carbon\Carbon;
use App\Models\Log;
use App\Models\Plan;
use App\Models\User;
use Mailgun\Mailgun;
use App\Models\Video;
use Illuminate\Http\Request;
use App\Models\EmailTemplate;

class AdminController extends Controller
{
    public function showadminlogin()
    {
    }
    public function fetchingdataofusers()
    {
        $users = User::with('mail_count')->where('id',2)->get();
        foreach ($users as $key => $user) {
            echo 'id :'.$user->id . '<br>';
            echo $user->mail_count->count();
        }

        die();
        // $user_info = User::with(['plan', 'videos_count', 'mail_count'])
        //     ->get();
        $user_info = User::with(['plan', 'videos_count'])
            ->where('role_id', config('constants.user'))
            ->withCount('videos')
            ->withTrashed()
            ->get();
        dd($user_info);
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
                    'store_email'=> $user->email,
                    'customers_count'=> $this->customersCount($user)
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
        $user = User::find(7);
        try {
            $customersCount = $user->api()->rest('GET', '/admin/api/2023-07/customers/count.json')['body'];
            if(isset($customersCount['count'])){
                return $customersCount['count'];
            }
            return false;
        } catch (Exception $e) {
            return $e->getMessage();
        }
        
    }

    /**
     * get count of customers
     */

     public function customersCount($user){
        try {
            $customersCount = $user->api()->rest('GET', '/admin/api/2023-07/customers/count.json')['body'];
            if (isset($customersCount['count'])) {
                return $customersCount['count'];
            }
            return false;
        } catch (Exception $e) {
            return $e->getMessage();
        }
     }
}
