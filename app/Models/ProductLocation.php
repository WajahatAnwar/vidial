<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductLocation extends Model
{
    use HasFactory;



    protected $fillable = [
        'product_handle', 'external_location_id'
    ];

    public function location_conn()
    {
        return $this->belongsTo(ExternalLocation::class, 'external_location_id', 'id');
    }
}
