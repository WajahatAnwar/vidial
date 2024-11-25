<?php

namespace App\Models\Filter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DefaultState extends Model
{
    use HasFactory;

    protected $connection = 'filter_conn';

    protected $fillable = [
        'name',
    ];
}
