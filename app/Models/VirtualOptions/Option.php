<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Option extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function option_sets()
    {
        return $this->belongsToMany(OptionSet::class, 'option_assigned_sets', 'option_id', 'option_set_id')->using(OptionAssignedSet::class)->withTimestamps();
    }

    public function option_type()
    {
        return $this->belongsTo(OptionType::class, 'option_type_id', 'id');
    }

    public function note_detail()
    {
        return $this->hasOne(AdminNoteDetail::class, 'option_id', 'id');
    }

    public function drop_detail()
    {
        return $this->hasMany(DropdownDetail::class, 'option_id', 'id');
    }

    public function file_detail()
    {
        return $this->hasOne(FileUploadDetail::class, 'option_id', 'id');
    }

    public function input_detail()
    {
        return $this->hasMany(InputFieldDetail::class, 'option_id', 'id');
    }

    public function logo_detail()
    {
        return $this->hasMany(LogoGroupDetail::class, 'option_id', 'id');
    }

    public function text_detail()
    {
        return $this->hasOne(TextareaDetail::class, 'option_id', 'id');
    }

    public function conditions()
    {
        return $this->hasMany(Condition::class, 'option_id', 'id');
    }
}
