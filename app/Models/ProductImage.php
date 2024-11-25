<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;



    protected $fillable = [
        'user_id', 'product_id', 'image_id', 'image_src',
    ];
}
