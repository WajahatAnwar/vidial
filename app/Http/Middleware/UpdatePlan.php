<?php

namespace App\Http\Middleware;

use App\Models\Log;
use Closure;
use Carbon\Carbon;
use App\Models\Plan;
use App\Models\User;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Charge;

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
        $charge = Charge::where('user_id',auth()->user()->id)
        ->where('status','=','ACTIVE')
        ->first();




        $current_user_approved_video_count = Video::where("user_id", auth()->user()->id)->where('status', config('constants.video_approved'))
        ->where('created_at', '>=',$charge->billing_on)
        ->where('created_at', '<=',Carbon::now())
        ->count();
        $current_user_approved_email_count=Log::where("user_id", auth()->user()->id)
        ->where('created_at', '>=',$charge->billing_on)
        ->where('created_at', '<=',Carbon::now())
        ->count();

        //count Remaining
        $remaining_video_count = $email_count->ugc_video_count - $current_user_approved_video_count;
        $remaining_email_count = $email_count->ugc_email_count - $current_user_approved_email_count;

        $update_plane = User::find(auth()->user()->id);

        // if(auth()->user()->remaining_email == 0 || auth()->user()->remaining_videos == 0  ){
            $update_plane->update([
                'ugc_email_count'   =>    $email_count->ugc_email_count,
                'ugc_video_count'   =>    $email_count->ugc_video_count,
                'ugc_email_count'   =>    $email_count->ugc_email_count,
                'remaining_email'   =>    $remaining_email_count ,
                'remaining_videos'  =>    $remaining_video_count
            ]);
        // } else{
        //     $update_plane->update([
        //         'ugc_email_count'   =>    $email_count->ugc_email_count,
        //         'ugc_video_count'   =>    $email_count->ugc_video_count,
        //         'ugc_email_count'   =>    $email_count->ugc_email_count,
        //         'remaining_email'   =>    $remaining_email_count ,
        //         'remaining_videos'  =>    $remaining_video_count
        //     ]);
        // }
        return $next($request);
    }
}
