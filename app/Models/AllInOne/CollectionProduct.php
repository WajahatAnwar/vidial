<?php

namespace App\Models\AllInOne;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class CollectionProduct extends Pivot
{
    use HasFactory;

    protected $connection = 'all_in_one_conn';

    public $table = 'collection_products';

    protected $fillable = [
        'user_id', 'collection_id', 'product_id'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class, 'collection_id', 'collection_id');
    }
}
