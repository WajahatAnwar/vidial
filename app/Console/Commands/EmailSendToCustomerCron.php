<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\User;
use Mailgun\Mailgun;
use App\Models\Orders;
use App\Models\Setting;
use App\Mail\orderReviewMail;
use App\Jobs\EmailTemplateJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Mail\orderReviewReminderMail;
use Illuminate\Support\Facades\Crypt;

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
        // \Log::info("sending mail who placed orders");



        $order_list = Orders::all();
        foreach ($order_list as $Orders_send_mail) {
            $settings = Setting::where('user_id', $Orders_send_mail->user_id)->first();
            $current_user = User::find($Orders_send_mail->user_id);
            // check merchant plan has email to send
            //  //  \Log::info(json_encode($Orders_send_mail->marchent, JSON_PRETTY_PRINT));
            if ($Orders_send_mail->marchent != null) {
                if ($Orders_send_mail->marchent->remaining_email > 0) {
                    // \Log::info("true 1");
                    //check if setting Activated
                    $email_parts = explode('@', $Orders_send_mail->email);
                    $name = $email_parts[0];
                    App::setLocale($settings->locale);
                    $details = [
                        'id' => $Orders_send_mail->id,
                        'order_id' => Crypt::encryptString($Orders_send_mail->id),
                        'name' => $name,
                        'user_id' => $settings->user_id,
                        'instruction_title' => $settings->instruction_title,
                        'instructions' => $settings->instructions,
                        'store' => $settings->user->name,
                        'locale' => $settings->locale,
                        'video' => $settings->video,
                        'store_credit' => $settings->store_credit,
                        'page_color' => $settings->page_color,
                        'discount_amount' => $settings->store_credit,
                        'store_name' => $current_user->store_name,
                        'shopify_store_name' => $settings->user->store_name,
                        'store_currency' => $current_user->store_currency,
                        // 'url' => env('APP_URL') . "/landingPage" . "/" . $settings->locale
                        //     . "?store=" . $settings->user->name . "&order_id=" . Crypt::encryptString($Orders_send_mail->id)
                        'url'=> env('APP_URL').'/s/'. ($current_user->store_handle ? $current_user->store_handle : str_replace(' ', '_', $current_user->store_name)) . '?order_id=' . Crypt::encryptString($Orders_send_mail->id)
                        
                    ];
                    // Log::info(json_encode($details));
                    if ($Orders_send_mail->email_status == 1) {
                        
                        // \Log::info("if already replied ignore");
                       //  \Log::info("email status -- ". $Orders_send_mail->email);
                        //if already replied ignore
                        if ($Orders_send_mail->replied == 0) {
                          //  \Log::info("replied 0 " . $Orders_send_mail->email);
                            // reminder mail check
                            // \Log::info(Carbon::now()->diffInDays(Carbon::parse($Orders_send_mail->reminder_mail)));
                            if ($Orders_send_mail->email_send == 1 && $Orders_send_mail->replied == 0 && $Orders_send_mail->remaining_mail > 0) {
                                // \Log::info(Carbon::now()->format('Y-m-d h:i:s'));
                                // \Log::info($Orders_send_mail->reminder_mail);
                                $date1 = Carbon::parse(Carbon::now());
                                $date2 = Carbon::parse($Orders_send_mail->reminder_mail);
                                $diffInHours = $date1->diffInHours($date2);
                              //  \Log::info($diffInHours);
                              //  \Log::info($Orders_send_mail->order_id);

                                if ($diffInHours == 0) {
                                    //comment code email by ali
                                    /* $mgClient = Mailgun::create(
                                    env('MAILGUN_SECRET'), // Mailgun API Key
                                    env('MAILGUN_ENDPOINT')
                               );*/
                                    $domain = env('MAILGUN_DOMAIN');
                                    $subject_reminder = "Share your feedback and receive " . getCurrencySymbol($details['store_currency']) 
                                    . $details['discount_amount'] . " from " . $details['shopify_store_name'];
                                    if ($settings->locale == "en") {
                                        $subject_reminder = "Share your feedback and receive " 
                                        . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " from " . $details['shopify_store_name'];
                                    } else if ($settings->locale == "de") {
                                        $subject_reminder = "Teilen Sie Ihr Feedback und erhalten Sie " 
                                        . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " von " . $details['shopify_store_name'];
                                    } else if ($settings->locale == "es") {
                                        $subject_reminder = "Comparte tus comentarios y recibe " 
                                        . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " de " . $details['shopify_store_name'];
                                    } else if ($settings->locale == "fr") {
                                        $subject_reminder = "Donnez votre avis et recevez " 
                                        . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " de " . $details['shopify_store_name'];
                                    } else if ($settings->locale == "it") {
                                        $subject_reminder = "Condividi i tuoi commenti e ricevi " 
                                        . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " da " . $details['shopify_store_name'];
                                    } else if ($settings->locale == "pt") {
                                        $subject_reminder = "Compartilhe seus comentários e receba " 
                                        . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " de " . $details['shopify_store_name'];
                                    }
                                    $params = array(
                                        
                                        'from' => "Vidial < " . env('MAIL_USERNAME') . " >",
                                        'to' => $Orders_send_mail->email,
                                        'subject' => $subject_reminder,
                                        'template' => $settings->locale == 'en' ? 'reminder-email' : "reminder-email_" . $settings->locale,
                                        'v:name' => $details['name'],
                                        'v:store' => $details['shopify_store_name'],
                                        'v:storename' => $details['store_name'],
                                        'v:store_name' => $details['shopify_store_name'],
                                        'v:amount' => getCurrencySymbol($details['store_currency']) . $details['discount_amount'],
                                        'v:url' => $details['url'],

                                    );
                                    //comment code by ali
                                    // $mgClient->messages()->send($domain, $params);
                                    $temlateDetails['user_id'] = $Orders_send_mail->user_id;
                                    $temlateDetails['type'] = 'Reminder';
                                    $temlateDetails['view'] = 'emails.reminder';
                                    $temlateDetails['mail'] = $Orders_send_mail->email;
                                    $temlateDetails['storename'] = $details['shopify_store_name'];
                                    $temlateDetails['url'] = $details['url'];
                                    $temlateDetails['amount'] = $settings->store_credit;
                                    $temlateDetails['name'] = $Orders_send_mail->customer_name;
                                    $temlateDetails['discount_code'] = '';
                                    $temlateDetails['reason_decline'] = '';

                                    
                                    
                                    dispatch(new EmailTemplateJob($temlateDetails));
                                    $log_details = [
                                        'type' => "EMAIL",
                                        'send_to' => $Orders_send_mail->email,
                                        'user_id' => $settings->user->id,
                                        'order_id' => $Orders_send_mail->order_id
                                    ];
                                    update_log_file($log_details);
                                    // \Mail::to($Orders_send_mail->email)->send(new orderReviewReminderMail($details));

                                    Orders::where('id', $Orders_send_mail->id)->update([
                                        'remaining_mail' => $Orders_send_mail->remaining_mail - 1,
                                        'reminder_mail' => Carbon::parse($Orders_send_mail->reminder_mail)->addWeeks($settings->email_sent_to_customer)
                                    ]);
                                    //update from merchant  that email sent
                                    $Orders_send_mail->marchent()->update([
                                        'remaining_email' =>  $Orders_send_mail->marchent->remaining_email - 1,
                                    ]);
                                }
                            }
                        }
                    } else {
                        // \Log::info(var_dump(Carbon::now()->gte(Carbon::parse($Orders_send_mail->email_send_at))));

                        $date1 = Carbon::parse(Carbon::now());
                        $date2 = Carbon::parse($Orders_send_mail->email_send_at);
                        $diffInHours = $date1->diffInHours($date2);
                      //  \Log::info('difference in hours --'.$diffInHours);
                      //  \Log::info($Orders_send_mail->order_id);


                        if ($diffInHours == 0 && $Orders_send_mail->remaining_mail > 0 && $Orders_send_mail->email_send == 0) {
                            //comment email code by ali
                            /*$mgClient = Mailgun::create(
                            env('MAILGUN_SECRET'), // Mailgun API Key
                            env('MAILGUN_ENDPOINT')
                    );*/
                            $domain = env('MAILGUN_DOMAIN');

                            $subject = "Win a " . getCurrencySymbol($details['store_currency']) 
                            . $details['discount_amount'] . " gift card from " . $details['store'];
                            if ($settings->locale == "en") {
                                $subject = "Win a " . getCurrencySymbol($details['store_currency']) 
                                . $details['discount_amount'] . " gift card from " . $details['store'];
                            } else if ($settings->locale == "de") {
                                $subject = "Gewinnen Sie eine Geschenkkarte im Wert von " 
                                . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " für " . $details['store'];
                            } else if ($settings->locale == "es") {
                                $subject = "Gana una tarjeta de regalo de " 
                                . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " para " . $details['store'];
                            } else if ($settings->locale == "fr") {
                                $subject = "Gagnez une carte-cadeau de " 
                                . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " sur  " . $details['store'];
                            } else if ($settings->locale == "it") {
                                $subject = "Vinci una carta regalo da " 
                                . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " per " . $details['store'];
                            } else if ($settings->locale == "pt") {
                                $subject = "Ganhe um cartão-presente de " 
                                . getCurrencySymbol($details['store_currency']) . $details['discount_amount'] . " para " . $details['store'];
                            }
                            $params = array(
                                'from' => "Vidial < " . env('MAIL_USERNAME') . " >",
                                'to' => $Orders_send_mail->email,
                                'subject' => $subject,
                                'template' => $settings->locale == 'en' ? 'mail_post_purchase' : "mail_post_purchase_" . $settings->locale,
                                'v:name' => $details['name'],
                                'v:store' => $details['store'],
                                'v:storename' => $details['store_name'],
                                'v:amount' => getCurrencySymbol($details['store_currency']) . $details['discount_amount'],
                                'v:url' => $details['url'],
                            );

                          //  \Log::info(json_encode($params, JSON_PRETTY_PRINT));
                            //comment email code by ali
                            $temlateDetails['user_id'] = $Orders_send_mail->user_id;
                            $temlateDetails['type'] = 'Post_Purchase';
                            $temlateDetails['view'] = 'emails.post_purchase';
                            $temlateDetails['mail'] = $Orders_send_mail->email;
                            $temlateDetails['name'] = $Orders_send_mail->customer_name;
                            $temlateDetails['storename'] = $details['store_name'];
                            $temlateDetails['url'] = $details['url'];
                            $temlateDetails['amount'] = $settings->store_credit ?? 15;
                            $temlateDetails['discount_code'] = '';
                            $temlateDetails['reason_decline'] = '';
                          //  \Log::info('sending email');
                            dispatch(new EmailTemplateJob($temlateDetails));
                            //$mgClient->messages()->send($domain, $params);

                            $log_details = [
                                'type' => "EMAIL",
                                'send_to' => $Orders_send_mail->email,
                                'user_id' => $settings->user->id,
                                'order_id' => $Orders_send_mail->order_id
                            ];
                            update_log_file($log_details);

                            Orders::where('id', $Orders_send_mail->id)->update([
                                'email_send' => 1,
                                'email_status' => 1,
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
