<?php

namespace App\Http\Middleware;

use App\Models\Charge;
use App\Models\Log;
use App\Models\Plan;
use App\Models\User;
use App\Models\Video;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;

class UpdatePlan
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $charge = Charge::where('user_id', $user->id)
            ->where('status', '=', 'ACTIVE')
            ->orderBy('created_at', 'desc')
            ->first();

        // Quotas follow the active Shopify charge. A shop with no charge keeps
        // the limits it already has; Mantle is not consulted.
        if (! $charge) {
            return $next($request);
        }

        $email_count = $this->planForCharge($user, $charge);
        if (! $email_count) {
            return $next($request);
        }

        $activated_on = Carbon::parse($charge->created_at);
        $end_date = $activated_on->copy()->addDays(30);

        $current_user_approved_video_count = Video::where('user_id', $user->id)
            ->where('status', config('constants.video_approved'))
            ->whereBetween('created_at', [$activated_on, $end_date])

            ->count();

        $current_user_approved_email_count = Log::where('user_id', $user->id)
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

        $update_plane = User::find($user->id);

        $update_plane->update([
            'ugc_email_count' => $email_count->ugc_email_count,
            'ugc_video_count' => $email_count->ugc_video_count,
            'remaining_email' => $remaining_email_count,
            'remaining_videos' => $remaining_video_count,
        ]);

        return $next($request);
    }

    /**
     * Limits come from the active charge's plan, then the shop plan.
     */
    private function planForCharge(User $user, Charge $charge): ?Plan
    {
        if (! empty($charge->plan_id)) {
            $plan = Plan::find($charge->plan_id);
            if ($plan) {
                return $plan;
            }
        }

        return Plan::find($user->plan_id);
    }
}
