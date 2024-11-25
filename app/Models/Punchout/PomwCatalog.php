<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwCatalog extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    protected $fillable = [
        'account_id',
        'type_id',
        'network_id',
        'name',
        'domain',
        'uuid',
        'shared_secret',
        'punchout_url',
        'order_transfer_url',
        'profile_url',
        'production_punchout_url',
        'production_order_transfer_url',
        'production_profile_url',
        'uri',
        'to_domain',
        'to_identity',
        'from_domain',
        'from_identity',
        'opens_in_new_window',
    ];
    protected $appends = [
        'network_name',
        'type_name'
    ];

    public function catalogNetwork(){
        return $this->belongsTo(PomwProcurementNetwork::class, 'network_id', 'id');
    }

    public function catalogType(){
        return $this->belongsTo(PomwCatalogType::class, 'type_id', 'id');
    }
    public function getNetworkNameAttribute()
    {
        return $this->catalogNetwork?->name;
    }
    public function getTypeNameAttribute()
    {
        return $this->catalogType?->name;
    }

    public function procurement_orders()
    {
        return $this->hasMany(PomwProcurementOrder::class, 'catalog_id', 'id');
    }
}
