<?php

namespace Tests\Feature\Shopify;

use App\Jobs\SaveMentalTokenJob;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Mockery;
use Osiset\ShopifyApp\Contracts\ApiHelper;
use Tests\TestCase;

class MantleTokenJobTest extends TestCase
{
    public function test_mantle_job_uses_config_and_refreshed_shopify_token(): void
    {
        config([
            'shopify-app.expiring_offline_tokens' => true,
            'services.mantle.api_url' => 'https://mantle.example.test/identify',
            'services.mantle.app_id' => 'test-app',
            'services.mantle.api_key' => 'test-key',
        ]);
        $shop = Mockery::mock(User::class)->makePartial();
        $shop->name = 'test.myshopify.com';
        $shop->password = 'old-access';
        $shop->shouldReceive('apiHelper')->once()->andReturnUsing(function () use ($shop) {
            $shop->password = 'refreshed-access';
            return Mockery::mock(ApiHelper::class);
        });
        Http::preventStrayRequests();
        Http::fake([
            'test.myshopify.com/*' => Http::response(['shop' => ['id' => 123, 'myshopify_domain' => $shop->name]]),
            'mantle.example.test/*' => Http::response(['error' => 'Test rejected'], 400),
        ]);

        (new SaveMentalTokenJob($shop))->handle();

        Http::assertSent(fn ($request) => $request->url() === 'https://mantle.example.test/identify'
            && $request->hasHeader('X-Mantle-App-Id', 'test-app')
            && $request['accessToken'] === 'refreshed-access');
        Http::assertSent(fn ($request) => str_contains($request->url(), 'test.myshopify.com')
            && $request->hasHeader('X-Shopify-Access-Token', 'refreshed-access'));
        Http::assertSentCount(2);
    }
}
