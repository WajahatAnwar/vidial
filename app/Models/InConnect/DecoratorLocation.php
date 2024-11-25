<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DecoratorLocation extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'location_id',
        'decorator_data_id',
        'decorator_id',
        'decorator_service_id'
    ];

    protected $appends = [
        'shopify_location',
    ];

    public function decorator()
    {
        return $this->belongsTo(Decorator::class);
    }

    public function service()
    {
        return $this->belongsTo(DecoratorService::class);
    }

    public function decoratorData()
    {
        return $this->belongsTo(DecoratorData::class);
    }

    public function getShopifyLocationAttribute()
    {
        return $this->decoratorData;
    }
}
