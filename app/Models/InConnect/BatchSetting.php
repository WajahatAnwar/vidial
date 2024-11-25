<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatchSetting extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = ['batch_name', 'batch_threshold', 'batch_day', 'vendor_id'];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function batches()
    {
        return $this->hasMany(Batch::class,'batch_setting_id');
    }
}
