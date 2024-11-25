<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientTypes extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';

    public function gateway_client(){
        return $this->hasMany(PomwGatewayClient::class, 'type_id', 'id');
    }

}
