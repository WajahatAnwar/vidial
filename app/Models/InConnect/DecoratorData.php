<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DecoratorData extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'count'
    ];

    protected $connection = 'in_connect_conn';

    protected $appends = [
        'value',
        'label',
    ];

    public function getLabelAttribute()
    {
        return $this->name;
    }

    public function getValueAttribute()
    {
        return $this->id;
    }
}
