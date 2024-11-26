<?php

namespace App\Http\Controllers;

use App\Jobs\SyncAllCustomers;
use App\Models\User;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct()
    {
        ini_set('max_execution_time', 1200);
    }

    // Get Dashboard Content
    public function getDashboardContent(Request $request)
    {
        $currentUser = Auth::user()->id;
        // Pending Videos
        $pendingVideos = Video::where('user_id', $currentUser)
            ->where('status', config('constants.video_pending'))->orderBy('id', 'DESC')
            ->get()->take(4);
        // Approved Videos
        $approvedVideos = Video::where('user_id', $currentUser)
            ->where('status', config('constants.video_approved'))->orderBy('id', 'DESC')
            ->get()->take(4);
        $pendingVideosCount = Video::where('user_id', $currentUser)
            ->where('status', config('constants.video_pending'))
            ->count();

        $approvedVideosCount = Video::where('user_id', $currentUser)
            ->where('status', config('constants.video_approved'))
            ->count();

        $user = Auth::user();
        $user = User::find($user->id);
        $response = $user->api()->rest('GET', '/admin/api/2022-10/webhooks.json');

        $data['pendingVideos'] = $pendingVideos;
        $data['approvedVideos'] = $approvedVideos;
        $data['pendingVideosCount'] = $pendingVideosCount;
        $data['approvedVideosCount'] = $approvedVideosCount;
        $data['webhooks'] = $response;
        $data['user'] = Auth::user();

        //   $response = $data['user']->api()->rest('POST', '/admin/api/2022-07/webhooks.json', [
        //     'webhook' => [
        //         'topic' => 'orders/create',
        //         'format' => 'json',
        //         'address' => 'https://www.google.com'
        //     ]
        //   ]);

        return response()->json([
            'success' => true,
            'message' => 'Dashboard content retrieved successfully!',
            'data' => $data,

        ]);
    }
    // get Pending Videos Count
    public function getPendingVideoCount()
    {
        $currentUser = Auth::user()->id;
        $pendingVideosCount = Video::where('user_id', $currentUser)
            ->where('status', config('constants.video_pending'))->orderBy('id', 'DESC')
            ->count();
        $data['pendingVideosCount'] = $pendingVideosCount;
        return response()->json([
            'success' => true,
            'message' => 'Videos Count retrieved successfully',
            'data' => $data,
        ]);
    }

    /**
     * Update App
     */

    public function updateApp()
    {
        $user = Auth::user();
        $data['user'] = $user;
        return response()->json([
            'success' => true,
            'message' => 'user data',
            'data' => $data,
        ]);
    }

    public function syncCustomers()
    {
        dd('stop');
        $user = User::find(236);

        syncCustomers($user);
        dd('synced customer');
    }
    public function customerWebhook()
    {
        dd('stop');

        $users = User::where('role_id', 2)->withTrashed()->get();
        foreach ($users as $user) {
            if ($user->id != 236) {
                SyncAllCustomers::dispatch($user);
            }
            // $webhook = [
            //     'webhook' => [
            //         'address' => "https://phpstack-953879-3439374.cloudwaysapps.com/webhook/customers-create",
            //         'topic' => "customers/create",
            //         'format' => "json"
            //     ]
            // ];
            // $request = $user->api()->rest('POST', '/admin/api/2023-01/webhooks.json', $webhook);
        }

        // dd('job run customers');
        // dd($request);
    }
}
