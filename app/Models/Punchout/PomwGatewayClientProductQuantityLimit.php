<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientProductQuantityLimit extends Model 
{
    use HasFactory;
    protected $connection = 'punchout_conn';

    public $timestamps = false;

    protected $appends = [
        'client_name'
    ];

    public function gatewayClient()
    {
        return $this->belongsTo(PomwGatewayClient::class, 'client_id', 'id');
    }
    public function getClientNameAttribute()
    {
        return $this->gatewayClient->name;
    }
}
