<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class LogoAssignedGroup extends Pivot
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public $table = 'logo_assigned_groups';

    protected $fillable = [
        'logo_id', 'logo_group_id'
    ];
}
