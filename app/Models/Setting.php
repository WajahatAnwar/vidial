<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;
    protected $guarded = [];

    protected $casts = [
        'email_sent_to_customer' => 'integer',
        'page_link' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // public function getFavIconAttribute($value)
    // {
    //     if ($value) {
    //         return url('fav_icons/' . $value);
    //     }
    //     return $value;
    // }
}
