<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
class Log extends Model
{
    use HasFactory;
    protected $fillable = [
        'type',
        'send_to',
        'user_id',
        'customer_name',
        'customer_email',
        'email_type',
    ];
    protected $appends = ['formatted_date', 'formatted_time'];

      public function getFormattedDateAttribute()
    {
        return Carbon::parse($this->created_at)->format('F j, Y');
    }

    // You can also define an accessor for time if needed
    public function getFormattedTimeAttribute()
    {
        return Carbon::parse($this->created_at)->format('h:i A');
    }
}
