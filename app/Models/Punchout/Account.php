<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';
    public function clients(){
        return $this->hasMany(PomwGatewayClient::class);
    }
}
