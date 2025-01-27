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
    public function fetchingdataofusers(Request $request)
    {
        $user_info = User::with(['plan'])
            ->withCount(['videos_count', 'emailsSent', 'customers'])
            ->where('role_id', config('constants.user'))
            ->when($request->s != '', function ($query) {
                $query->where('name', 'like', '%' . request()->s . '%')
                    ->orWhere('store_name', 'like', '%' . request()->s . '%');
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

        ]);
    }

}
