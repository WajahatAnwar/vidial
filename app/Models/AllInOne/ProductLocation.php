<?php

namespace App\Models\AllInOne;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductLocation extends Model
{
    use HasFactory;

    protected $connection = 'all_in_one_conn';

    protected $fillable = [
        'product_handle', 'external_location_id'
    ];

    public function location_conn()
    {
        return $this->belongsTo(ExternalLocation::class, 'external_location_id', 'id');
    }
}
