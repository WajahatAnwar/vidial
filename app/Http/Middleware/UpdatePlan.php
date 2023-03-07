<?php

namespace App\Http\Middleware;

use App\Models\Plan;
use App\Models\User;
use App\Models\Video;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UpdatePlan
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $email_count  =  Plan::where('id',auth()->user()->plan_id)->first();

        $current_user_approved_video_count = Video::where("user_id", auth()->user()->id)->where(config('constants.video_approved'))->count();

        $remaining_video_count = $email_count->ugc_video_count - $current_user_approved_video_count;
        $remaining_email_count = $email_count->ugc_email_count - auth()->user()->remaining_email;

        $update_plane = User::find(auth()->user()->id);
        $update_plane->update([
            'ugc_email_count'   =>    $email_count->ugc_email_count,
            'ugc_video_count'   =>    $email_count->ugc_video_count,
            'remaining_email'   =>    $remaining_email_count,
            'remaining_videos'  =>    $remaining_video_count
        ]);
        return $next($request);
    }
}
