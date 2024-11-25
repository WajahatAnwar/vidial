<?php

namespace App\Models\Punchout;

use App\Models\AllInOne\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwPunchoutSession extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    protected $fillable = [
        'user_id',
        'catalog_id',
        'address_id',
        'token',
        'cancelled',
        'completed',
        'buyer_cookie',
        'uuid',
    ];

    public function catalog()
    {
        return $this->belongsTo(PomwCatalog::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(PomwProcurementStreetAddress::class, 'address_id');
    }
}
