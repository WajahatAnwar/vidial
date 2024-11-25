<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InconnectOrderUpdate extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'inconnect_order_id',
        'initiated_at',
        'completed_at',
        'failed_at',
        'depends_on',
        'name',
        'type',
        'tries',
        'retry',
        'manual_complete',
        'manual_log'
    ];


    protected $casts = [
        'initiated_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    protected $appends = [
        'order',
        'is_pending'
    ];

    public function order()
    {
        return $this->belongsTo(InconnectOrder::class, 'inconnect_order_id');
    }

    public function getIsPendingAttribute()
    {
        return !$this->initiated_at && !$this->completed_at && !$this->failed_at;
    }

    public function getOrderAttribute()
    {
        switch ($this->type) {
            case 'received':
                return 0;
            case 'intacct_sales_order':
                return 1;
            case 'sent_to_vendor':
                return 2;
            case 'sent_to_intacct_for_vendor':
                return 3;
            case 'sent_to_decorator':
                return 4;
            case 'sent_to_intacct_for_decorator':
                return 5;
            case 'received_on_decorator':
                return 6;
            case 'shipped_from_decorator':
                return 7;
            case 'fulfilled':
                return 8;
            case 'intacct_sales_invoice':
                return 9;
            case 'intacct_vendor_invoice':
                return 10;
            default:
                return 999;
        }
    }
}
