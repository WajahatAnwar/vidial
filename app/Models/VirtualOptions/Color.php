<?php

namespace App\Models\VirtualOptions;

use App\Models\AllInOne\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Color extends Model
{
    use HasFactory;

    protected $connection = 'virtual_options_conn';

    protected $fillable = [
        'color', 'status', 'family_id'
    ];

    public function families()
    {
        return $this->belongsToMany(Family::class, 'color_families', 'color_id', 'family_id')->using(ColorFamily::class)->withTimestamps();
    }

    // REAL PIVOT TABLE
    // public function users()
    // {
    //     return $this->belongsToMany(User::class, DB::connection('virtual_options_conn')->getDatabaseName() . '.user_colors', 'color_id', 'user_id')->using(UserColor::class)->withTimestamps();
    // }

    public function colors_rel()
    {
        return $this->hasMany(UserColor::class, 'color_id', 'id');
    }
}
