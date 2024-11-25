<?php

namespace App\Models\Punchout;

use App\Models\AllInOne\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PomwProcurementOrder extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    protected $fillable = [
        'user_id',
        'account_id',
        'catalog_id',
        'session_id',
        'internal_id',
        'approval_id',
        'total',
        'shipping_total',
        'tax_total',
        'uuid',
        'delivered',
        'remote_ip',
        'shipping_method',
    ];

    protected $appends = [
        'is_approved',
        'is_rejected',
        'sub_total',
        'date',
    ];

    public function catalog()
    {
        return $this->belongsTo(PomwCatalog::class, 'catalog_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function session()
    {
        return $this->belongsTo(PomwPunchoutSession::class, 'session_id');
    }

    public function items()
    {
        return $this->hasMany(PomwProcurementOrderItem::class, 'order_id');
    }

    public function approval()
    {
        return $this->hasOne(PomwProcurementOrderApproval::class, 'order_id');
    }

    public function getDateAttribute()
    {
        return $this->created_at?->format('m-d-Y H:i');
    }

    public function getIsApprovedAttribute()
    {
        if (!$this->approval) {
            return false;
        }
        return $this->approval->is_approved;
    }

    public function getIsRejectedAttribute()
    {
        if (!$this->approval) {
            return false;
        }
        return !$this->approval->is_approved;
    }

    public function getSubTotalAttribute()
    {
        $sub_total = 0;
        foreach ($this->items as $item) {
            $sub_total += $item->total;
        }
        return $sub_total;
    }

    public function attemptDeliveryIfNeeded()
    {
        if (!$this->catalog->order_transfer_url)
            return;

        $transfer = $this->createTransfer();
        $transfer->attempt();
    }

    private function createTransfer()
    {
        $status = PomwProcurementOrderTransferStatus::whereUri('new')->first();

        $transfer = new PomwProcurementOrderTransfer();
        $transfer->uuid = Str::uuid();
        $transfer->status_id = $status->id;
        $transfer->order_id = $this->id;
        $transfer->save();

        return $transfer;
    }

    public function getCXMLTimestamp()
    {
        return $this->created_at->toRfc3339String();
    }
}
