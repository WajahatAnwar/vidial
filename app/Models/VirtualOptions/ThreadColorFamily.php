<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ThreadColorFamily extends Pivot
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public $table = 'thread_color_families';

    protected $fillable = [
        'input_field_thread_id', 'family_id'
    ];
}
