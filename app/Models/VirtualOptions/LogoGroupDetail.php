<?php

namespace App\Models\VirtualOptions;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogoGroupDetail extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    public function option()
    {
        return $this->belongsTo(Option::class, 'option_id', 'id');
    }

    public function logo()
    {
        return $this->belongsTo(Logo::class, 'logo_id', 'id');
    }
}
