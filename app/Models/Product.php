<?php

namespace App\Models\AllInOne;

use App\Models\AllInOne\OrderLineItem;
use App\Models\VirtualOptions\OptionSet;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $connection = 'all_in_one_conn';

    protected $fillable = [
        // 'user_id', 'product_id', 'product_handle', 'product_variant_id', 'product_title', 'description', 'product_tags', 'product_image', 'product_vendor', 'option_set_id', 'status', 'product_created_at', 'variants_json', 'product_tracked', 'total_inventory', 'published_at'
        'user_id', 'product_id', 'product_handle', 'product_variant_id', 'product_title', 'description', 'product_tags', 'product_image', 'product_vendor', 'product_type', 'option_set_id', 'status', 'product_created_at', 'product_tracked', 'total_inventory', 'published_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function option_set()
    {
        return $this->belongsTo(OptionSet::class, 'option_set_id', 'id');
    }

    public function collections()
    {
        return $this->belongsToMany(Collection::class, 'collection_products', 'product_id', 'collection_id', 'product_id', 'collection_id')->using(CollectionProduct::class)->withTimestamps();
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id', 'product_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'product_id');
    }

    public function line_items()
    {
        return $this->hasMany(OrderLineItem::class, 'product_id', 'product_id');
    }
}
