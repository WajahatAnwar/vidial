<?php

namespace App\Http\Controllers;

use Exception;
use Carbon\Carbon;
use App\Models\Log;
use App\Models\Plan;
use App\Models\User;
use Mailgun\Mailgun;
use App\Models\Video;
use App\Models\Setting;
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
            ->when($request->get('sorting') == "id desc", function ($q) {
                $q->orderBy("id", "desc");
            })
            ->when($request->get('sorting') == "id asc", function ($q) {
                $q->orderBy("id", "asc");
            })->when($request->get('sorting') == "created_at desc", function ($q) {
                $q->orderBy("created_at", "desc");
            })->when($request->get('sorting') == "created_at asc", function ($q) {
            $q->orderBy("created_at", "asc");
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

      public function getSettings(Request $request){
       
        if($request->filled('id')){
            $user = User::find($request->id);
            if(!$user){
               return redirect()->to('admin-dashboard');
            }
        }else {
            return redirect()->to('admin-dashboard');
        }
        $data= Setting::where('user_id',$user->id)->first();
       
        $store = User::where('id', $user->id)->with('emailCreds', 'googleDriveCreds','klavio')->first();
        //$store=User::find(Auth::user()->id)->with('emailCreds');
        $emailCreds = $store->emailCreds;
        if($data){
            $data['instructions'] = json_decode($data['instructions']);
        
        }
             $plan = Plan::
             where('id', $store->plan_id)
             ->first();
        $data['store']=$store->name;
        $data['email']=$store->email;
        $data['store_name']=$store->store_name;
        $data['btn_color']=$data->page_color;
        $data['storeHandle'] = $store->store_handle ? $store->store_handle : $store->store_name;
        $data['store_currency']= getCurrencySymbol($store->store_currency);
        $data['email_creds'] = $emailCreds;
        $data['gd_creds'] = $store->googleDriveCreds;
        $data['klavio'] = $store->klavio;
        $data['plan_id'] = $store->plan_id;
        $data['plan_name'] = $store->name;
        return response()->json([
            'success' => true,
            'message' => "Settings get Successfully",
            'data'=>$data
        ]);
    }
}
