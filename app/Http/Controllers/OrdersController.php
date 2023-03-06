<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Plan;
use App\Mail\testMail;
use App\Models\Orders;
use App\Models\Setting;
use App\Jobs\OrdersGetJob;
use Illuminate\Http\Request;
use GuzzleHttp\Promise\Create;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class OrdersController extends Controller
{
    public function fetch_orders(Request $request)
    {
       $shop = Auth::user();
       $shop_settings =  $shop->settings;
         $orders = $shop->api()->rest('GET', '/admin/orders.json');
         foreach ($orders['body']['orders'] as $order_item) {
              Orders::create([
                'user_id' =>  $shop->id,
                'order_id' => $order_item['id'] ,
                'email' =>  $order_item['email'] ?? $order_item['contact_email'] ,
                'contect_email' =>  $order_item['contact_email'] ,
                'phone_no' => $order_item['phone'],
                'confirmed' =>  "" ,
                'order_created_at' => $order_item['created_at'] ,
                'remaining_mail' => $shop_settings->page_link,
                'email_send_at' => Carbon::parse($order_item['created_at'])->addDays($shop->settings->page_display_to_customers) ,
                'reminder_mail' => Carbon::parse($order_item['created_at'])->addWeek($shop->settings->email_sent_to_customer),
                'email_status' => $shop_settings->email_status ,
              ]);
         }
        return 'orders fatched';
    }

    public function sendtest_email()
    {

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
            Mail::to("hamza@swishtag.com")->send(new testMail($details));
        // }

        return response()->json([
            'success' => true,
            'message' => " Test Email Send Successfully To Customers",
        ]);
        // return

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
       $all_plans = Plan::all();
       return response()->json([
        'success' => true,
        'message' => 'Fetch Pending Videos Successfully',
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
