<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use App\Models\Plan;
use App\Models\User;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Charge;

class UpdatePlan extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:plan';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $email_count  =  Plan::where('id',12)->first();
        $charge = Charge::where('user_id',12)
        ->where('status','=','ACTIVE')
        ->first();

        $current_user_approved_video_count = Video::where("user_id", 12)
        ->where('status', config('constants.video_approved'))
        ->where('created_at', '>=',Carbon::parse($charge->billing_on))
        // ->where('created_at', '<=', Carbon::now())
        ->count();
        // dd(Carbon::now());
        // dd(Carbon::parse($charge->billing_on)->date());
        dd($current_user_approved_video_count);

        $current_user_approved_email_count=Log::where("user_id", 12)
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

        return Command::SUCCESS;
    }
}
