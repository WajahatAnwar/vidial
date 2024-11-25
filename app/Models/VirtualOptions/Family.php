<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Family extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function colors()
    {
        return $this->belongsToMany(Color::class, 'color_families', 'family_id', 'color_id')->using(ColorFamily::class);
    }

    public function logos()
    {
        return $this->belongsToMany(Logo::class, 'logo_families', 'family_id', 'logo_id')->using(LogoFamily::class);
    }

    public function dropdowns()
    {
        return $this->belongsToMany(DropdownDetail::class, 'dropdown_families', 'family_id', 'dropdown_detail_id')->using(DropdownFamily::class)->withTimestamps();;
    }

    public function colors_thread()
    {
        return $this->belongsToMany(InputFieldThread::class, 'thread_color_families', 'family_id', 'input_field_thread_id')->using(ThreadColorFamily::class)->withTimestamps();;
    }
}
