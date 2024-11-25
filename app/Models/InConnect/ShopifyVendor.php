<?php

namespace App\Models\InConnect;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ShopifyVendor extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    // IT HELPS IDENTIFYING THE TABLE WITHIN RELATION WHEN CONNECTED TO OTHER DATABASE
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->table = DB::connection('in_connect_conn')->getDatabaseName() . '.shopify_vendors';
    }

    protected $fillable = [
        'name',
    ];
}
