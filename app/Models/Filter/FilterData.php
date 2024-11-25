<?php

namespace App\Models\Filter;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FilterData extends Model
{
    use HasFactory;

    protected $connection = 'filter_conn';

    protected $fillable = [
        'type',
        'name'
    ];
}
