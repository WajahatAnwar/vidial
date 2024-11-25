<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InputFieldThread extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function thread_colors()
    {
        return $this->belongsToMany(Family::class, 'thread_color_families', 'input_field_thread_id', 'family_id')->using(ThreadColorFamily::class)->withTimestamps();;
    }
}
