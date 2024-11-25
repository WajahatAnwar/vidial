<?php

namespace App\Models\Punchout;

use App\Models\Punchout\PomwGatewayClientCustomer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientCustomerPunchoutSession extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    protected $fillable = [
        'account_id',
        'customer_id',
        'client_id',
        'session_key',
        'type',
        'buyer_cookie',
        'operation',
        'post_url',
        'setup_url',
        'uuid',
        'request_cxml',
        'punched_in',
        'raw_request_data',
        'mode',
        'login_token',
        'login_token_signature',
        'uri',
        'header_to_identity',
        'header_to_domain',
        'header_from_identity',
        'header_from_domain',
        'header_sender_domain',
        'header_sender_identity',
        'header_sender_shared_secret',
        'header_sender_user_agent',
        'business_unit',
        'custom_shipper_account_number',
        'custom_shipper_name',
    ];

    public function pomw_street_address()
    {
        return $this->hasOne(PomwStreetAddress::class, 'customer_session_id');
    }

    public function pomw_client()
    {
        return $this->belongsTo(PomwGatewayClient::class, 'client_id', 'id');
    }

    public function pomw_client_customer()
    {
        return $this->belongsTo(PomwGatewayClientCustomer::class, 'customer_id', 'id');
    }

    public function pomw_client_request()
    {
        return $this->hasMany(PomwGatewayClientRequest::class, 'customer_session_id', 'id');
    }

    public function getHmac256Signature()
    {
        return hash_hmac('sha256', $this->session_key, $this->pomw_client->uri);
    }

    public function getPayloadId()
    {
        $s = time();
        $s .= "." . getmypid();
        $s .= "." . random_int(10000000, 99999999);
        return $s;
    }
}
