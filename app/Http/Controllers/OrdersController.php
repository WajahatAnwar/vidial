<?php

namespace App\Http\Controllers;

use Log;
use Carbon\Carbon;
use App\Models\Plan;
use Mailgun\Mailgun;
use App\Mail\testMail;
use App\Models\Orders;
use App\Models\Setting;
use App\Jobs\OrdersGetJob;
use Illuminate\Http\Request;
use App\Jobs\EmailTemplateJob;
use GuzzleHttp\Promise\Create;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Crypt;

class OrdersController extends Controller
{
    public function fetch_orders(Request $request)
    {
       $shop = Auth::user();
       $shop_settings =  $shop->settings;
         $orders = $shop->api()->rest('GET', '/admin/orders.json');
         // Log::info($shop->settings->page_link);
         foreach ($orders['body']['orders'] as $order_item) {
              Orders::create([
                'user_id' =>  $shop->id,
                'order_id' => $order_item['id'] ,
                'email' =>  $order_item['email'] ?? $order_item['contact_email'] ,
                'contect_email' =>  $order_item['contact_email'] ,
                'phone_no' => $order_item['phone'],
                'confirmed' =>  "" ,
                'order_created_at' => $order_item['created_at'] ,
                'remaining_mail' => $shop_settings->page_display_to_customers,
                'email_send_at' => Carbon::parse($order_item['created_at'])->addDays($shop->settings->page_link) ,
                'reminder_mail' => Carbon::parse($order_item['created_at'])->addWeek($shop->settings->email_sent_to_customer),
                'email_status' => $shop_settings->email_status ,
              ]);
         }
        return 'orders fatched';
    }

    public function sendtest_email()
    {
        $temlateDetails['user_id'] = auth()->user()->id;
        $temlateDetails['type'] = 'Post_Purchase';
        $temlateDetails['view'] = 'emails.post_purchase';
        $temlateDetails['mail'] = auth()->user()->email;
        $temlateDetails['name'] = 'Merchant';
        $temlateDetails['storename'] =auth()->user()->store_name;
        // $temlateDetails['url'] = env('APP_URL') . "/".(auth()->user()->store_handle ? auth()->user()->store_handle : auth()->user()->store_name) ."?order_id=" . Crypt::encryptString('1234');
        $temlateDetails['url'] = env('APP_URL') . "/s/" . (auth()->user()->store_handle ? auth()->user()->store_handle : auth()->user()->store_name);
        $temlateDetails['amount'] = auth()->user()->settings->store_credit;
        $temlateDetails['discount_code'] = '';
        $temlateDetails['reason_decline'] = '';
      
        dispatch(new EmailTemplateJob($temlateDetails));

        //upadting log files
        $log_details = [
            'type' => "EMAIL",
            'send_to' => auth()->user()->email,
            'user_id' => auth()->user()->id,
        ];
        update_log_file($log_details);

        // }

        return response()->json([
            'success' => true,
            'message' => " Test Email Send Successfully To Customers",
        ]);



        /** Previous settings 
        $settings=Setting::where('user_id',Auth::user()->id)->first();
        App::setLocale($settings->locale);
        $details = [
            'user_id'=>$settings->user_id,
            'instruction_title'=>$settings->instruction_title,
            'instructions'=>$settings->instructions,
            'store'=>auth()->user()->name,
            'locale'=>$settings->locale,
            'video'=>$settings->video,
            'store_credit'=>$settings->store_credit,
            'page_color'=>$settings->page_color,
            'body' => 'This is the test email for customers'
        ];


        // $user=User::find(Auth::user()->id);
        //  $view=view('mailtemplate.ordereviewreminder',compact('settings','user'));
        //  dd($view->render());
        // $get_customers = Orders::pluck('email');
        // foreach ($get_customers as $value) {
            //auth()->user()->email
            $mgClient = Mailgun::create(
                env('MAILGUN_SECRET'), // Mailgun API Key
                env('MAILGUN_ENDPOINT')
           );
           $domain = env('MAILGUN_DOMAIN');
           $subject = "Test Email from Vidial";
           if($settings->locale == "en"){
            $subject = "Test Email from Vidial";
           }else if($settings->locale == "fr"){
            $subject = "Test Email de Vidial";
           }else if($settings->locale == "de"){
            $subject = "Test Email von Vidial";
           }else if($settings->locale == "es"){
            $subject = "Test Email de Vidial";
           }else if($settings->locale == "it"){
            $subject = "Test Email da Vidial";
           }else if($settings->locale == "pt"){
            $subject = " Test Email da Vidial";
           }

           $params = array(
            'from' => "Vidial < ".env('MAIL_USERNAME')." >",
            'to' => auth()->user()->email,
            'subject' => $subject,
            'template' => auth()->user()->settings->locale=='en' ? "test_mail_for_merchant" : "test_mail_for_merchant_".auth()->user()->settings->locale,
            'v:url' => env('APP_URL')."/landingPage"."/". $settings->locale ."?store=".$settings->user->name,
            'v:amount'=>getCurrencySymbol(auth()->user()->store_currency).$settings->store_credit,
            'v:storename'=>$settings->user->store_name
        );

        $mgClient->messages()->send($domain, $params);

        //upadting log files
        $log_details = [
            'type' => "EMAIL",
            'send_to' => auth()->user()->email,
            'user_id' =>auth()->user()->id,
         ];
        update_log_file($log_details);

        // }

        return response()->json([
            'success' => true,
            'message' => " Test Email Send Successfully To Customers",
        ]);
        // return
         */
    }

    public function review_updated($id)
    {
        Orders::where('id', $id)->update([
            'replied' => 1
        ]);

        return 'Review Send Sucessfully';
    }

    public function get_plans()
    {
       $all_plans = Plan::whereNotIn('name', ['100 Video Plan', 'Unlimited Video Plan'])->get();
       return response()->json([
        'success' => true,
        'message' => 'Fetch Plans Successfully',
        'data'=>$all_plans,
        'users' =>  Auth::user()
    ]);

    }

    public function set_plans(Request $request,$id)
    {
        dd($id);
    }

    public function test(){
      dd(OrdersGetJob::class);
    }

}
