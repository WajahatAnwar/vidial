<?php

namespace App\Models\Cropica;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AllInOne\User;
use App\Models\AllInOne\Product;

class CropicaJobFailedProduct extends Model
{
    use HasFactory;

    protected $connection = 'cropica_conn';

    protected $fillable = [
        'user_id',
        'cropica_job_id',
        'product_id',
        'product_title',
    ];

    public function user($value)
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function cropica_job()
    {
        return $this->belongsTo(CropicaJob::class, 'cropica_job_id', 'id');
    }
}
