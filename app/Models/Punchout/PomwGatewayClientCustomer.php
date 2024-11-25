<?php

namespace App\Models\Punchout;

use App\Models\Punchout\PomwGatewayClient;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientCustomer extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    protected $fillable = [
        'client_id',
        'account_id',
        'name',
        'firstname',
        'lastname',
        'username',
        'uniquename',
        'email',
        'phone',
        'uuid',
    ];

    public function pomw_client()
    {
        return $this->belongsTo(PomwGatewayClient::class, 'client_id', 'id');
    }
}
