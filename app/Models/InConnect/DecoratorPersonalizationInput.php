<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DecoratorPersonalizationInput extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';
    
    protected $fillable = [
        'decorator_id',
        'decorator_data_id',
    ];

    protected $appends = [
        'input',
    ];

    public function decorator()
    {
        return $this->belongsTo(Decorator::class);
    }

    public function decoratorData()
    {
        return $this->belongsTo(DecoratorData::class);
    }

    public function getInputAttribute()
    {
        return $this->decoratorData;
    }
}
