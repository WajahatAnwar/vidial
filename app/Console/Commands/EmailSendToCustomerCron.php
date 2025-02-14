<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\User;
use Mailgun\Mailgun;
use App\Models\Orders;
use App\Models\Setting;
use App\Mail\orderReviewMail;
use App\Jobs\EmailTemplateJob;
use App\Jobs\SendMantleEventJob;
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
        // Old Query 
        // $order_list = Orders::with('marchent')->whereHas('marchent', function ($query) {

        //     $query->whereHas('settings', function ($subQuery) {
        //         $subQuery->where('email_status', '=', 'true');
        //     });
        // })
        //     ->where('remaining_mail', '>', 0)
        //     ->where('replied', '=', 0)
        //     ->where('email_service', '=', 'mailgun')
        //     ->lazy();
        $order_list = Orders::with('marchent')
            ->whereHas('marchent', function ($query) {
                $query->whereHas('settings', function ($subQuery) {
                    $subQuery->where('email_status', 'true');
                })
                    ->where('remaining_email', '>', 0);
            })
            ->where('remaining_mail', '>', 0)
            ->where('replied', 0)
            ->where('email_service', 'mailgun')
            ->where(function ($query) {
                $query->whereRaw("STR_TO_DATE(email_send_at, '%Y-%m-%d %H:%i:%s') <= NOW()")
                    ->orWhereRaw("STR_TO_DATE(reminder_mail, '%Y-%m-%d %H:%i:%s') <= NOW()");
            })
            ->lazy();

        $count = Orders::with('marchent')

            ->whereHas('marchent', function ($query) {
                $query->whereHas('settings', function ($subQuery) {
                    $subQuery->where('email_status', 'true');
                })
                    ->where('remaining_email', '>', 0);
            })
            ->where('remaining_mail', '>', 0)
            ->where('replied', 0)
            ->where('email_service', 'mailgun')
            ->where(function ($query) {
                $query->whereRaw("STR_TO_DATE(email_send_at, '%Y-%m-%d %H:%i:%s') <= NOW()")
                    ->orWhereRaw("STR_TO_DATE(reminder_mail, '%Y-%m-%d %H:%i:%s') <= NOW()");
            })
            ->count();

        Log::info(json_encode($count));
        foreach ($order_list as $order) {

            $settings = Setting::where('user_id', $order->user_id)->first();
            $current_user = $order->marchent;
            if ($order->marchent != null) {
                if ($order->marchent->remaining_email > 0) {
                    $email_parts = explode('@', $order->email);
                    $name = $email_parts[0];
                    App::setLocale($settings->locale);

                    $details = [
                        'id' => $order->id,
                        'order_id' => Crypt::encryptString($order->id),
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
                        'url' => env('APP_URL') . '/s/' . ($current_user->store_handle ? $current_user->store_handle : str_replace(' ', '_', $current_user->store_name)) . '?order_id=' . Crypt::encryptString($order->id)

                    ];
                    if ($order->email_status == 1) {
                        // Log::info(json_encode($order));
                        // Log::info("This is from Reminder mail");
                        if ($order->replied == 0) {
                            $date1 = Carbon::parse(Carbon::now());
                            $date2 = Carbon::parse($order->reminder_mail);
                            if ($order->email_send == 1 && $order->replied == 0 && $order->remaining_mail > 0 && $date2->isPast()) {
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
                                    'from' => "GoodAuthentic < " . env('MAIL_USERNAME') . " >",
                                    'to' => $order->email,
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
                                $temlateDetails['user_id'] = $order->user_id;
                                $temlateDetails['type'] = 'Reminder';
                                $temlateDetails['view'] = 'emails.reminder';
                                $temlateDetails['mail'] = $order->email;
                                $temlateDetails['storename'] = $details['shopify_store_name'];
                                $temlateDetails['url'] = $details['url'];
                                $temlateDetails['amount'] = $settings->store_credit;
                                $temlateDetails['name'] = $order->customer_name;
                                $temlateDetails['discount_code'] = '';
                                $temlateDetails['reason_decline'] = '';
                                // Log::info('sending reminder email at: ' . $order->email);

                                dispatch(new EmailTemplateJob($temlateDetails));
                                $log_details = [
                                    'type' => "EMAIL",
                                    'send_to' => $order->email,
                                    'user_id' => $settings->user->id,
                                    'order_id' => $order->order_id,
                                    'email_type' => config('constants.reminder_mail'),
                                    'customer_name' => $order->customer_name,
                                    'customer_email' => $order->email
                                ];
                                update_log_file($log_details);
                                SendMantleEventJob::dispatch($settings->user, config('constants.reminder_mail'), $log_details);

                                // \Mail::to($order->email)->send(new orderReviewReminderMail($details));

                                Orders::where('id', $order->id)->update([
                                    'remaining_mail' => $order->remaining_mail - 1,
                                    'reminder_mail' => Carbon::parse($order->reminder_mail)->addWeeks($settings->email_sent_to_customer)
                                ]);
                                //update from merchant  that email sent
                                $order->marchent()->update([
                                    'remaining_email' => $order->marchent->remaining_email - 1,
                                ]);

                            }
                        } else {

                            // Log::info("Order Email Replied is True means 1");
                            // Log::info(json_encode($order, JSON_PRETTY_PRINT));
                        }
                    } else {
                        // Log::info(json_encode($order));
                        // Log::info("This is from Post Purchase mail");

                        $date1 = Carbon::parse($order->email_send_at);
                        $date2 = Carbon::parse(Carbon::now());
                        if ($date1->isPast() && $order->remaining_mail > 0 && $order->email_send == 0) {

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
                                'from' => "GoodAuthentic < " . env('MAIL_USERNAME') . " >",
                                'to' => $order->email,
                                'subject' => $subject,
                                'template' => $settings->locale == 'en' ? 'mail_post_purchase' : "mail_post_purchase_" . $settings->locale,
                                'v:name' => $details['name'],
                                'v:store' => $details['store'],
                                'v:storename' => $details['store_name'],
                                'v:amount' => getCurrencySymbol($details['store_currency']) . $details['discount_amount'],
                                'v:url' => $details['url'],
                            );
                            $temlateDetails['user_id'] = $order->user_id;
                            $temlateDetails['type'] = 'Post_Purchase';
                            $temlateDetails['view'] = 'emails.post_purchase';
                            $temlateDetails['mail'] = $order->email;
                            $temlateDetails['name'] = $order->customer_name;
                            $temlateDetails['storename'] = $details['store_name'];
                            $temlateDetails['url'] = $details['url'];
                            $temlateDetails['amount'] = $settings->store_credit ?? 15;
                            $temlateDetails['discount_code'] = '';
                            $temlateDetails['reason_decline'] = '';
                            Log::info('sending post email at: ' . $order->email);
                            dispatch(new EmailTemplateJob($temlateDetails));
                            $log_details = [
                                'type' => "EMAIL",
                                'send_to' => $order->email,
                                'user_id' => $settings->user->id,
                                'order_id' => $order->order_id,
                                'email_type' => config('constants.post_purchase'),
                                'customer_name' => $order->customer_name,
                                'customer_email' => $order->email
                            ];
                            update_log_file($log_details);
                            SendMantleEventJob::dispatch($settings->user, config('constants.post_purchase'), $log_details);

                            Orders::where('id', $order->id)->update([
                                'email_send' => 1,
                                'email_status' => 1,
                                'remaining_mail' => $order->remaining_mail - 1,
                            ]);
                            $order->marchent()->update([
                                'remaining_email' => $order->marchent->remaining_email - 1,
                            ]);
                        } else {
                            // Log::info('Required Date Time: ' . $date2);
                            // Log::info('Current Date Time: ' . $date1);
                        }
                    }
                } else {
                    // Log::info("Email Limit Reached for Below User");
                    // Log::info(json_encode($order->user_id, JSON_PRETTY_PRINT));
                }
            } else {
                // Log::info("User Not found in Email Send Customer Cron Job");
            }
        }

        Log::info("Email Send to Customer Cron Job Called Completed");


        return true;
    }
}
