<?php

namespace App\Models\OrderSplitter;

use App\Models\AllInOne\User;
use App\Models\InConnect\ShopifyVendor;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class OSVendor extends Model
{
    use HasFactory;

    protected $connection = 'order_splitter_conn';

    public function tags_rel()
    {
        return $this->hasMany(OSVendorTag::class, 'o_s_vendor_id', 'id');
    }

    public function vendors()
    {
        return $this->hasMany(OSVendorVendor::class, 'o_s_vendor_id', 'id');
    }

    public function shop()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
