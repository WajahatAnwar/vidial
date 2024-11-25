<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DecoratorSize extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    protected $fillable = [
        'name',
        'decorator_id',
    ];

    protected $with = [
        'shopifySizes',
    ];

    public function decorator()
    {
        return $this->belongsTo(Decorator::class);
    }

    public function decoratorShopifySizes()
    {
        return $this->hasMany(DecoratorShopifySize::class);
    }

    public function shopifySizes()
    {
        return $this->hasManyThrough(
            ShopifySize::class,
            DecoratorShopifySize::class,
            'decorator_size_id',
            'id',
            'id',
            'shopify_size_id'
        );
    }
}
