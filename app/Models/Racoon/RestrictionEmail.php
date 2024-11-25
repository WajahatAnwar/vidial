<?php

namespace App\Models\Racoon;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RestrictionEmail extends Model
{
    use HasFactory;

    protected $connection = 'racoon_conn';

    protected $fillable = [
        'email',
        'restriction_id'
    ];

    public function restriction()
    {
        return $this->belongsTo(Restriction::class);
    }
}
