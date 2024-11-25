<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatchItem extends Model
{
    use HasFactory;
    protected $connection = 'in_connect_conn';
    protected $fillable = ['batch_id', 'inconnect_order_id', 'sku', 'quantity'];
    
    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }
    public function inconnectOrder()
    {
        return $this->belongsTo(InconnectOrder::class);
    }
}
