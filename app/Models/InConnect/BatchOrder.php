<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatchOrder extends Model
{
    use HasFactory;

    protected $fillable = ['inconnect_order_id', 'batch_id', 'price'];

    protected $connection = 'in_connect_conn';

    public function inconnectOrder()
    {
        return $this->belongsTo(InconnectOrder::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }
}
