<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'batch_setting_id', 
        'batch_status',
        'purchase_order_no',
        'po_number',
        'intacct_po_number',
        'invoice_number',
        'intacct_invoice_number',
        'intacct_payload',
        'tracking_number'
    ];

    public function batchOrders()
    {
        return $this->hasMany(BatchOrder::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function batchSetting()
    {
        return $this->belongsTo(BatchSetting::class);
    }

    public function logs()
    {
        return $this->morphMany(InconnectLog::class, 'loggable');
    }

    public function updates()
    {
        return $this->hasMany(InconnectOrderUpdate::class, 'batch_id', 'id');
    }
    
    public function batchItems()
    {
        return $this->hasMany(BatchItem::class);
    }
}
