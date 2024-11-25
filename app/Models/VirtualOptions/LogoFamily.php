<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class LogoFamily extends Pivot
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public $table = 'logo_families';

    protected $fillable = [
        'logo_id', 'family_id'
    ];
}
