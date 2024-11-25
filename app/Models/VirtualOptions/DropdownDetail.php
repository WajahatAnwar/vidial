<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DropdownDetail extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function option()
    {
        return $this->belongsTo(Option::class, 'option_id', 'id');
    }

    public function families()
    {
        return $this->belongsToMany(Family::class, 'dropdown_families', 'dropdown_detail_id', 'family_id')->using(DropdownFamily::class)->withTimestamps();
    }
}
