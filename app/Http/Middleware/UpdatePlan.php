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
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $email_count = Plan::find($user->plan_id);
        if (! $email_count) {
            return $next($request);
        }
        // $charge = Charge::where('user_id', auth()->user()->id)
        //     ->where('status', '=', 'ACTIVE')
        //     ->first();

        $charge = Charge::where('user_id', auth()->user()->id)
            ->where('status', '=', 'ACTIVE')
            ->orderBy('created_at', 'desc')
            ->first();

        // A shop can reach the app before its first active charge exists.
        // Keep existing quotas until there is a billing period to calculate.
        if (! $charge) {
            return $next($request);
        }

        $activated_on = Carbon::parse($charge->created_at);
        $end_date = $activated_on->copy()->addDays(30);

        $current_user_approved_video_count = Video::where("user_id", auth()->user()->id)
            ->where('status', config('constants.video_approved'))
            ->whereBetween('created_at', [$activated_on, $end_date])

            ->count();

        $current_user_approved_email_count = Log::where("user_id", auth()->user()->id)
            ->whereBetween('created_at', [$activated_on, $end_date])
            ->count();
        $remaining_video_count = $email_count->ugc_video_count - $current_user_approved_video_count;
        $remaining_email_count = $email_count->ugc_email_count - $current_user_approved_email_count;
        
        // $last_30_days = \Carbon\Carbon::today()->subDays(30);

        // $current_user_approved_video_count = Video::where("user_id", auth()->user()->id)
        //     ->where('status', config('constants.video_approved'))
        //     ->where('created_at', '>=', $last_30_days)
        //     ->count();

        // $current_user_approved_email_count = Log::where("user_id", auth()->user()->id)
        //     ->where('created_at', '>=', $last_30_days)
        //     ->count();

        // $remaining_video_count = $email_count->ugc_video_count - $current_user_approved_video_count;
        // $remaining_email_count = $email_count->ugc_email_count - $current_user_approved_email_count;


        $update_plane = User::find(auth()->user()->id);

        $update_plane->update([
            'ugc_email_count' => $email_count->ugc_email_count,
            'ugc_video_count' => $email_count->ugc_video_count,
            'remaining_email' => $remaining_email_count,
            'remaining_videos' => $remaining_video_count
        ]);
        return $next($request);
    }
}
