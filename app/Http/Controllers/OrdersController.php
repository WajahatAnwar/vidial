<?php

namespace App\Http\Controllers;

use App\Mail\testMail;
use App\Models\Orders;
use Carbon\Carbon;
use GuzzleHttp\Promise\Create;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class OrdersController extends Controller
{
    public function fetch_orders()
    {
       $shop = Auth::user();
       $shop_settings =  $shop->setting;
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
                'email_send_at' => Carbon::parse($order_item['created_at'])->addDays($shop->setting->page_display_to_customers) ,
                'reminder_mail' => Carbon::parse($order_item['created_at'])->addWeek($shop->setting->email_sent_to_customer)
              ]);
         }

        return 'orders fatched';
    }

    public function sendtest_email()
    {
        $details = [
            'title' => 'Mail From Vidal',
            'body' => 'This is the test email for customers'
        ];
        $get_customers = Orders::pluck('email');
        foreach ($get_customers as $value) {
            Mail::to($value)->send(new testMail($details));
        }

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

}
