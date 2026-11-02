<?php

namespace App\Support;

use App\Models\User;

final class ShopifyAccessToken
{
    public static function forShop(User $shop): string
    {
        if (config('shopify-app.expiring_offline_tokens')) {
            $shop->apiHelper();
        }

        return $shop->getAccessToken()->toNative();
    }
}
