<?php

namespace App\Models\AllInOne;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    use HasFactory;

    protected $connection = 'all_in_one_conn';

    protected $fillable = [
        'user_id', 'local_order_id', 'refund_id', 'order_id', 'refund_note', 'refund_amount'
    ];
}
