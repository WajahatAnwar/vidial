<?php

namespace App\Models\InConnect;

use App\Jobs\InConnect\OrderUpdateMailJob;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InconnectOrderEmail extends Model
{
    use HasFactory;
    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'email_data',
        'is_sent',
        'inconnect_order_id',
        'email_template_id'
    ];

    protected $casts = [
        'email_data' => 'object'
    ];

    public function order()
    {
        return $this->belongsTo(InconnectOrder::class, 'inconnect_order_id');
    }

    public static function sendStatusUpdateEmail($order, $status_id, $progress)
    {
        $emailTemplate = EmailTemplate::where([
            'inconnect_order_status_id' => $status_id,
            'send_at' => $progress,
            'is_active' => true,
        ])->first();

        if (!$emailTemplate) {
            return;
        }
       
        if(!$emailTemplate->pop_shop_status) {
            if($order->inconnect_account->store_type_id == 1) {
                return;
            }
        }
        
        if ($emailTemplate->ignore_users) {
            $users = json_decode($emailTemplate->ignore_users, true);
            $userIds = array_column($users, 'value');
     
            if (in_array($order->user_id, $userIds))
                return; 
        }

        $data = [
            'subject' => $emailTemplate->subject,
            'order_number' => $order->shopify_order_no,
            'order_name' => $order->shopify_order_name,
            'body' => $emailTemplate->body,
            'email' => '',
            'customer_name' => '',
            'shipping_address' => '',
            'line_items' => [],
            'fulfillments' => [],
        ];

        $orderEmail = new InconnectOrderEmail();
        $orderEmail->email_template_id = $emailTemplate->id;
        $orderEmail->inconnect_order_id = $order->id;
        $orderEmail->email_data = $data;
        $orderEmail->save();
        OrderUpdateMailJob::dispatch($orderEmail, $order)->delay(now()->addMinutes($emailTemplate->send_after));
    }
}
