<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Logo extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function families()
    {
        return $this->belongsToMany(Family::class, 'logo_families', 'logo_id', 'family_id')->using(LogoFamily::class)->withTimestamps();
    }

    public function groups()
    {
        return $this->belongsToMany(LogoGroup::class, 'logo_assigned_groups', 'logo_id', 'logo_group_id')->using(LogoAssignedGroup::class)->withTimestamps();
    }
}

