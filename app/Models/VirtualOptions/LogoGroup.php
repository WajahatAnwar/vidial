<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogoGroup extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function logos()
    {
        return $this->belongsToMany(Logo::class, 'logo_assigned_groups', 'logo_group_id', 'logo_id')->using(LogoAssignedGroup::class)->withTimestamps();
    }
}
