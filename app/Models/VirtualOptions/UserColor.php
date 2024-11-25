<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;

// REAL PIVOT TABLE
// use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Model;

class UserColor extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    // REAL PIVOT TABLE
    // public $table = 'user_colors';

    protected $fillable = [
        'user_id', 'color_id'
    ];
}
