<?php

namespace App\Models\AllInOne;

use App\Models\Filter\FilterSet;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    use HasFactory;

    protected $connection = 'all_in_one_conn';

    protected $fillable = [
        'user_id', 'collection_id', 'collection_title', 'collection_handle', 'collection_image', 'collection_created_at', 'published_at'
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'collection_products', 'collection_id', 'product_id', 'collection_id', 'product_id')->using(CollectionProduct::class)->withTimestamps();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function filter_set()
    {
        return $this->belongsTo(FilterSet::class, 'filter_set_id', 'id');
    }
}
