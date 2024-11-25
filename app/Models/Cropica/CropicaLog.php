<?php

namespace App\Models\Cropica;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CropicaLog extends Model
{
    use HasFactory;
    
    protected $connection = 'cropica_conn';

    protected $fillable = [
        'type',
        'user_id',
        'priority',
        'description'
    ];

    public function loggable()
    {
        return $this->morphTo();
    }

    public function scopeLoggableType($query, $type)
    {
        return $query->where('loggable_type', 'App\Models\Cropica\\' . $type);
    }

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->table = DB::connection('cropica_conn')->getDatabaseName() . '.cropica_logs';
    }
}
