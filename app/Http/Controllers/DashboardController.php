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
        $data['pendingVideos'] = $pendingVideos;
        $data['approvedVideos'] = $approvedVideos;
        $data['pendingVideosCount'] = $pendingVideosCount;
        $data['approvedVideosCount'] = $approvedVideosCount;
        $data['user'] = Auth::user();

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

}
