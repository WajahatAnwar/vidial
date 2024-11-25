<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Relations\Pivot;

class DecoratorShopifySize extends Pivot
{
    protected $table = 'decorator_shopify_size';

    protected $connection = 'in_connect_conn';
    
    protected $fillable = [
        'decorator_size_id',
        'shopify_size_id'
    ];

    public function decoratorSize()
    {
        return $this->belongsTo(DecoratorSize::class);
    }

    public function shopifySize()
    {
        return $this->belongsTo(ShopifySize::class);
    }
}
