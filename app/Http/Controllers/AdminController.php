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
    public function fetchingdataofusers(Request $request)
    {
        $user_info = User::with(['plan'])
        ->withCount(['videos_count', 'emailsSent','customers'])
            ->where('role_id', config('constants.user'))
            ->when($request->s !='',function($query){
                $query->where('name','like','%'.request()->s.'%')
                ->orWhere('store_name','like','%'.request()->s.'%');
            })
            ->withCount('videos')
            ->withTrashed()->get();
            return response()->json([
            'success' => true,
            'message' => 'Users List',
            'user_details' => $user_info,
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
