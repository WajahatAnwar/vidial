<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Orders;
use App\Models\Setting;
use App\Mail\orderReviewMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Mail\orderReviewReminderMail;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Mailgun\Mailgun;

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
        foreach ($order_list as $Orders_send_mail) {



           $settings=Setting::where('user_id',$Orders_send_mail->user_id)->first();
           $current_user = User::find($Orders_send_mail->user_id);
           // check merchant plan has email to send
            if ($Orders_send_mail->marchent->remaining_email > 0) {
                //check if setting Activated
                if ($Orders_send_mail->email_status == 1) {

                    //if already replied ignore
                    if ($Orders_send_mail->replied != 0) {
                        // reminder mail check
                        $email_parts = explode('@', $Orders_send_mail->email);
                        $name = $email_parts[0];
                        App::setLocale($settings->locale);
                        $details = [
                            'id' => $Orders_send_mail->id,
                            'order_id' =>Crypt::encryptString($Orders_send_mail->id),
                            'name' => $name,
                            'user_id'=>$settings->user_id,
                            'instruction_title'=>$settings->instruction_title,
                            'instructions'=>$settings->instructions,
                            'store'=>$settings->user->name,
                            'locale'=>$settings->locale,
                            'video'=>$settings->video,
                            'store_credit'=>$settings->store_credit,
                            'page_color'=>$settings->page_color,
                            'discount_amount' => $settings->store_credit,
                            'store_name' => $current_user->email,
                            'url' => env('APP_URL')."/landingPage"."/". $settings->locale ."?store=".$settings->user->name
                        ];

                        if ($Orders_send_mail->email_send == 1 && $Orders_send_mail->replied == 0 && $Orders_send_mail->remaining_mail > 0) {

                            if (Carbon::now()->format('d-m-y') == Carbon::parse($Orders_send_mail->reminder_mail)->format('d-m-y')) {

                             $mgClient = Mailgun::create(
                                    env('MAILGUN_SECRET'), // Mailgun API Key
                                    env('MAILGUN_ENDPOINT')
                               );
                               $domain = env('MAILGUN_DOMAIN');

                               $params = array(
                                'from' => env('MAIL_USERNAME'),
                                'to' => $Orders_send_mail->email,
                                'subject' => "Get Free Discount Credit's Reminder",
                                'template' => 'reminder-email',
                                'v:name' => $details['name'],
                                'v:store' => $details['store'],
                                'v:store_name' => $details['store_name'],
                                'v:amount'=>$details['discount_amount'],
                                'v:url' => $details['url'],
                               );

                            $mgClient->messages()->send($domain, $params);
                            $log_details = [
                                'type' => "EMAIL",
                                'send_to' => $Orders_send_mail->email,
                                'user_id' =>$settings->user->id,
                                ];
                            update_log_file($log_details);
                                // \Mail::to($Orders_send_mail->email)->send(new orderReviewReminderMail($details));

                                Orders::where('id', $Orders_send_mail->id)->update([
                                    'remaining_mail' => $Orders_send_mail->remaining_mail - 1
                                ]);
                                //update from merchant  that email sent
                                $Orders_send_mail->marchent()->update([
                                    'remaining_email' =>  $Orders_send_mail->marchent->remaining_email - 1,
                                ]);
                            }
                        }
                        //first mail after order check

                        // dd(Carbon::now()->format('d-m-y') <= Carbon::parse($Orders_send_mail->email_send_at)->format('d-m-y'));
                        if (Carbon::now()->format('d-m-y') >= Carbon::parse($Orders_send_mail->email_send_at)->format('d-m-y')  && $Orders_send_mail->remaining_mail > 0 && $Orders_send_mail->email_send == 0) {


                            $mgClient = Mailgun::create(
                                env('MAILGUN_SECRET'), // Mailgun API Key
                                env('MAILGUN_ENDPOINT')
                           );
                           $domain = env('MAILGUN_DOMAIN');

                           $params = array(
                            'from' => env('MAIL_USERNAME'),
                            'to' => $Orders_send_mail->email,
                            'subject' => "Get Free Discount Credit's",
                            'template' => 'mail_post_purchase',
                            'v:name' => $details['name'],
                            'v:store' => $details['store'],
                            'v:store_name' => $details['store_name'],
                            'v:amount'=>$details['discount_amount'],
                            'v:url' => $details['url'],
                           );

                        $mgClient->messages()->send($domain, $params);

                        $log_details = [
                            'type' => "EMAIL",
                            'send_to' => $Orders_send_mail->email,
                            'user_id' =>$settings->user->id,
                            ];
                        update_log_file($log_details);

                            Orders::where('id', $Orders_send_mail->id)->update([
                                'email_send' => 1,
                                'remaining_mail' => $Orders_send_mail->remaining_mail - 1,
                            ]);
                            //update from merchant  that email sent
                            $Orders_send_mail->marchent()->update([
                                'remaining_email' =>  $Orders_send_mail->marchent->remaining_email - 1,
                            ]);

                        }
                    }
                }
            }
        }
    }
}
