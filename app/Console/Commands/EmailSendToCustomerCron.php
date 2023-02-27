<?php

namespace App\Console\Commands;

use App\Mail\orderReviewMail;
use App\Mail\orderReviewReminderMail;
use App\Models\Orders;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Auth;

class EmailSendToCustomerCron extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emailtocustomer:cron';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'execute email according to setting';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        \Log::info("sending mail who placed orders");


        $order_list = Orders::all();
        foreach($order_list as $Orders_send_mail){
            //if already replied ignore
            if($Orders_send_mail->replied == 0){
                // reminder mail check
                $details = [
                    'title' => 'Review Reminder Mail From Vidal',
                    'body' => 'This is the Review Reminder email for customers',
                    'id' => $Orders_send_mail->id,
                ];

                if($Orders_send_mail->email_send == 1 && $Orders_send_mail->replied == 0 && $Orders_send_mail->remaining_mail > 0){

                    if(Carbon::now()->format('d-m-y') == Carbon::parse($Orders_send_mail->reminder_mail)->format('d-m-y')){
                            \Mail::to($Orders_send_mail->email)->send(new orderReviewReminderMail($details));
                            Orders::where('id',$Orders_send_mail->id)->update([
                            'remaining_mail' => $Orders_send_mail->remaining_mail - 1
                        ]);
                    }
                }
                //first mail after order check

                $details = [
                    'title' => 'Products Review Mail From Vidal',
                    'body' => 'This is the Review email for customers',
                    'id' => $Orders_send_mail->id,
                ];

                // dd(Carbon::now()->format('d-m-y') <= Carbon::parse($Orders_send_mail->email_send_at)->format('d-m-y'));
                if(Carbon::now()->format('d-m-y') == Carbon::parse($Orders_send_mail->email_send_at)->format('d-m-y')  && $Orders_send_mail->remaining_mail > 0 && $Orders_send_mail->email_send == 0){

                    \Mail::to($Orders_send_mail->email)->send(new orderReviewMail($details));
                    Orders::where('id',$Orders_send_mail->id)->update([
                        'email_send' => 1,
                        'remaining_mail' => $Orders_send_mail->remaining_mail - 1
                    ]);

                }

            }

        }
    }
}
