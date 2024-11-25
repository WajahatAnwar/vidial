<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class InconnectLog extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

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
        return $query->where('loggable_type', 'App\Models\InConnect\\' . $type);
    }

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->table = DB::connection('in_connect_conn')->getDatabaseName() . '.inconnect_logs';
    }

    public function user()
    {
        return $this->belongsTo('App\Models\AllInOne\User');
    }
}
