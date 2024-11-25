<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientTierPriceDiscount extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    public function products()
    {
        return $this->hasMany(PomwGatewayClientTierPriceDiscountProduct::class, 'discount_id');
    }

    public function tiers()
    {
        return $this->hasMany(PomwGatewayClientTierPriceDiscountTier::class, 'discount_id');
    }

    public function getDiscount($total, $qty)
    {
        $tiers = $this->tiers;

        foreach ($tiers as $tier) {
            if ($qty >= $tier->from) {
                $current_tier = $tier->value;
            }
        }

        if (isset($current_tier)) {
            return number_format(round($total - $this->getDiscountForTotal($total, $current_tier), 2), 2);
        }

        return $total;
    }

    public function getDiscountForTotal($total, $tier_value)
    {
        if ($this->type_id == 2)
            return $this->value;

        if ($this->type_id == 1) {
            $discounted_amount = $total * ($tier_value / 100);
            $max_discount = $this->max_discount;

            if ($max_discount && $max_discount > 0 && $discounted_amount > $max_discount)
                return $max_discount;
            else
                return $discounted_amount;
        }
    }
}
