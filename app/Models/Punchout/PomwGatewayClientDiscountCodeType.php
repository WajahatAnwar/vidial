<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientDiscountCodeType extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';
    public function discountCodes(){
        return $this->hasMany(PomwGatewayClientDiscountCode::class, 'type_id', 'id');
    }
}
