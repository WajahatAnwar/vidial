<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Orders extends Model
{
    use HasFactory;

    protected $fillable = [
            'user_id',
            'order_id',
            'email',
            'contect_email',
            'phone_no',
            'confirmed',
            'order_created_at',
            'email_send_at',
            'email_send',
            'remaining_mail',
            'replied',
            'reminder_mail',
            'customer_name',
            'email_service'
    ];
    public function marchent()
    {
        return $this->belongsTo(User::class,'user_id');
    }
    // public function settings(){
    //     return $this->hasOneThrough(Setting::class, User::class);
    // }
}
