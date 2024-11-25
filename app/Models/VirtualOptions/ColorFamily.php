<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ColorFamily extends Pivot
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public $table = 'color_families';

    protected $fillable = [
        'color_id', 'family_id'
    ];
}
