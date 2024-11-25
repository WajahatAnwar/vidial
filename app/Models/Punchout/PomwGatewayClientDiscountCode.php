<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientDiscountCode extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    protected $appends = [
        'type_name',
        'usage_type_name',
        'client_name',
        'current_balance_value',
    ];

    public function type()
    {
        return $this->belongsTo(PomwGatewayClientDiscountCodeType::class, 'type_id');
    }

    public function usage()
    {
        return $this->belongsTo(PomwGatewayClientDiscountCodeUsageType::class, 'usage_type_id');
    }

    public function getDiscountForTotal($total)
    {
        if ($this->getAttribute('type_id') == 3) {
            if ($this->getAttribute('current_balance') > 0)
                return $this->getAttribute('current_balance');

            return 0;
        }

        if ($this->getAttribute('type_id') == 2) // fixed value
            return $this->value;

        if ($this->getAttribute('type_id') == 1) // percentage
        {
            $discounted_amount = $total * ($this->value / 100);
            $max_discount = $this->max_discount;

            if ($max_discount && $max_discount > 0 && $discounted_amount > $max_discount) // max_discount > 0 for positive integer
                return $max_discount;
            else
                return $discounted_amount;
        }
    }

    public function canBeRedeemByCustomer($customer_id, &$discount_message)
    {
        $can_be_redeem = false;
        if ($this->usage->uri === 'unlimited' && !$this->isGiftCard()) {
            $can_be_redeem = true;
        }

        if ($this->usage->uri === 'onetime' && !$this->isGiftCard()) {
            $previous_usage = PomwGatewayClientDiscountCodeUsage::whereCodeId($this->getAttribute('id'))->first();

            if (!$previous_usage) {
                $can_be_redeem = true;
            }
            $discount_message = 'Discount code is already used!';
        }

        if ($this->usage->uri === 'onceperuser' && !$this->isGiftCard()) {
            $previous_usage = PomwGatewayClientDiscountCodeUsage::whereCodeId($this->getAttribute('id'))->whereCustomerId($customer_id)->first();

            if (!$previous_usage) {
                $can_be_redeem = true;
            }
            $discount_message = 'Discount code is already used!';
        }

        if (!$this->isGiftCard()) {
            if ($this->getAttribute('current_balance') > 0) {
                $can_be_redeem = true;
            }
        }
        return $can_be_redeem;
    }

    public function getTypeNameAttribute()
    {
        return $this->type->name;
    }
    public function getUsageTypeNameAttribute()
    {
        return $this->usage->name;
    }
    public function gatewayClient()
    {
        return $this->belongsTo(PomwGatewayClient::class, 'client_id', 'id');
    }
    public function getClientNameAttribute()
    {
        return $this->gatewayClient?->name;
    }
    public function isPercentage()
    {
        return $this->getAttribute('type_id') == 1;
    }

    public function isFixedValue()
    {
        return $this->getAttribute('type_id') == 2;
    }
    public function isGiftCard()
    {
        return $this->getAttribute('type_id') == 3;
    }
    public function getFormattedValue()
    {
        if ($this->isGiftCard()) {
            if ($this->getAttribute('current_balance') > 0) {
                return '$' . (int) $this->getAttribute('current_balance');
            }
            return 0;
        }
        if ($this->isFixedValue()) {
            return '$' . (int) $this->getAttribute('value');
        }
        if ($this->isPercentage()) {
            return (int) $this->getAttribute('value') . '%';
        }
    }
    public function getCurrentBalanceValueAttribute()
    {
        if ($this->isGiftCard()) {
            return (int) $this->getAttribute('current_balance') . '/' . (int) $this->getAttribute('initial_balance');
        }
        return $this->getFormattedValue();
    }
}
