<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class DropdownFamily extends Pivot
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public $table = 'dropdown_families';

    protected $fillable = [
        'dropdown_detail_id', 'family_id'
    ];
}
