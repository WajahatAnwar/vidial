<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientDiscountCodeUsage extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    public function code()
    {
        return $this->belongsTo(PomwGatewayClientDiscountCode::class, 'code_id');
    }

    public function getFormattedAppliedAmount()
    {
        if ($this->code->isGiftCard() || $this->code->isFixedValue())
        {
            return '$'.$this->applied_amount;
        }

        if ($this->code->isPercentage())
        {
            return $this->applied_amount.'%';
        }

        return $this->applied_amount;
    }
}
