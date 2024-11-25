<?php

namespace App\Mail\PurchaseOrder;

use App\Models\AllInOne\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DraftOrderMail extends Mailable
{
    use Queueable, SerializesModels;
    public $value;
    public $order_data;
    public $shop_name;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($value, $order_data_old)
    {
        $this->value = $value;
        $this->order_data = $order_data_old;
        $user = User::find($order_data_old->user_id);
        $this->shop_name = $user->name;
    }

    /**
     * Get the attachments for the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject("[".$this->order_data->order_no."][".$this->shop_name."] ".$this->value->subject)->markdown('emails.PurchaseOrder.draft_mail');
    }
}
