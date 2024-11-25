<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientDiscountCodeUsageType extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';
    public function discountCodes(){
        return $this->hasMany(PomwGatewayClientDiscountCode::class, 'usage_type_id', 'id');
    }
}
