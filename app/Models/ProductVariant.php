<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'variant_id',
        'title',
        'price',
        'option1',
        'option2',
        'option3',
        'quantity',
        'inventory_tracked',
        'sku',
        'intacct_item_id',
        'image_url',
        'compare_at_price'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, "product_id", "product_id");
    }
}
