<?php

namespace App\Models\InConnect;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InconnectOrder extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'user_id',
        'inconnect_account_id',
        'shopify_customer_id',
        'shopify_customer_name',
        'shopify_order_id',
        'shopify_order_no',
        'shopify_order_name',
        'vendor_id',
        'vendor_order_id',
        'vendor_intacct_order_id',
        'decorator_id',
        'decorator_order_id',
        'decorator_second_order_id',
        'decorator_intacct_order_id',
        'is_vip',
        'decorator_intact_sent',
        'vendor_intact_sent',
        'vendor_sent',
        'decorator_sent',
        'fulfillment_status',
        'intact_sales_order_id',
        'intact_sales_invoice_id',
        'fraud_status',
        'idex_tracking_company',
        'idex_tracking_number',
        'sales_order_check',
        'sales_invoice_check',
        'process',
        'second_so_id',
        'second_si_id',
        'manual_note',
        'manual_user_id',
        'manual_date',
        'idex_payload',
        'batch_status',
        'is_archived',
    ];

    protected $appends = [
        'status',
    ];

    // public static function boot()
    // {
    //     parent::boot();

    //     self::created(function ($model) {
    //         DB::transaction(function () use ($model) {
    //             foreach (InconnectOrderStatus::all() as $status) {
    //                 $model->updates()->create([
    //                     'inconnect_order_status_id' => $status->id,
    //                     'initiated_at' => $status->id == 1 ? now() : null,
    //                     'completed_at' => $status->id == 1 ? now() : null,
    //                     'tries' => $status->id == 1 ? 1 : 0,
    //                 ]);
    //             }
    //         });
    //     });
    // }

    public function user()
    {
        return $this->belongsTo('App\Models\AllInOne\User');
    }


    public function manual_user()
    {
        return $this->belongsTo('App\Models\AllInOne\User', 'manual_user_id', 'id');
    }

    public function inconnectAccount()
    {
        return $this->belongsTo('App\Models\InConnect\InconnectAccount');
    }

    public function vendor()
    {
        return $this->belongsTo('App\Models\InConnect\Vendor');
    }

    public function decorator()
    {
        return $this->belongsTo('App\Models\InConnect\Decorator');
    }

    public function updates()
    {
        return $this->hasMany(InconnectOrderUpdate::class,'inconnect_order_id', 'id');
    }

    public function emails()
    {
        return $this->hasMany(InconnectOrderEmail::class);
    }

    public function vendorPrices()
    {
        return $this->hasMany(InconnectOrderVendorPrice::class);
    }

    public function logs()
    {
        return $this->morphMany(InconnectLog::class, 'loggable');
    }

    public function vendorPurchaseOrders()
    {
        return $this->hasMany(VendorPurchaseOrder::class, 'inconnect_order_id');
    }

    public function batchedOrder()
    {
        return $this->hasOne(BatchOrder::class, 'inconnect_order_id');
    }

    public function createUpdate($status_id, $progress = '')
    {
        $update = $this->updates()->where('inconnect_order_status_id', $status_id)->latest()->first();

        if ($update) {
            switch ($progress) {
                case 'initiated':
                    $update->initiated_at = now();
                    $update->completed_at = null;
                    $update->failed_at = null;
                    $update->tries = $update->tries + 1;
                    $update->retry = 0;
                    break;
                case 'completed':
                    $update->completed_at = now();
                    $update->failed_at = null;
                    break;
                case 'failed':
                    $update->failed_at = now();
                    break;
                case 'retry':
                    $update->retry = 1;
                    break;
            }

            $update->save();

            InconnectOrderEmail::sendStatusUpdateEmail($this, $status_id, $progress);
        }
    }

    public function getStatusAttribute()
    {
        if ($this->updates()->whereNotNull('failed_at')->exists()) {
            return 'error';
        }

        if ($this->updates()->whereNotIn('name', ['Received on decorator', 'Shipped from decorator', 'Fulfilled'])->whereNull('completed_at')->count()) {
            return 'warning';
        }

        return 'success';

        // $updates = $this->updates()->whereBetween('inconnect_order_status_id', [2, 4])->get();
        // $totalUpdates = $updates->count();
        // $pendingUpdates = $updates->whereNull('completed_at')->count();
        // if ($totalUpdates == $pendingUpdates) {
        //     return 'error';
        // }

        // if ($pendingUpdates > 0) {
        //     return 'warning';
        // }

        // return 'success';
    }
    
}
