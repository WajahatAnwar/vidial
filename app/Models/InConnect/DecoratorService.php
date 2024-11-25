<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DecoratorService extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'option_ids',
        'decorator_data_id',
        'service_id',
        'decorator_id'
    ];

    protected $appends = [
        'shopify_decoration',
    ];

    protected $casts = [
        'option_ids' => 'array',
    ];

    public function decorator()
    {
        return $this->belongsTo(Decorator::class);
    }

    public function decoratorData()
    {
        return $this->belongsTo(DecoratorData::class);
    }

    public function locations()
    {
        return $this->hasMany(DecoratorLocation::class);
    }

    public function getShopifyDecorationAttribute()
    {
        return $this->decoratorData;
    }
}
