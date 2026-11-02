<?php

namespace Tests\Feature\Shopify;

use App\Models\User;
use Gnikyt\BasicShopifyAPI\ResponseAccess;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schema;
use Mockery;
use Osiset\ShopifyApp\Contracts\ApiHelper;
use Osiset\ShopifyApp\Contracts\Commands\Shop;
use Osiset\ShopifyApp\Exceptions\OAuthTokenRefreshException;
use Osiset\ShopifyApp\Objects\Values\AccessToken;
use Osiset\ShopifyApp\Services\OfflineAccessTokenRefresher;
use Tests\TestCase;

class OfflineTokenRefreshTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config([
            'database.default' => 'offline_token_test',
            'database.connections.offline_token_test' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => ''],
            'cache.default' => 'array',
            'app.key' => 'base64:'.base64_encode(str_repeat('t', 32)),
            'shopify-app.expiring_offline_tokens' => true,
            'shopify-app.auto_migrate_legacy' => false,
            'shopify-app.namespace' => null,
        ]);
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('shopify_namespace')->nullable();
            $table->string('password');
            $table->timestamp('password_updated_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
        require_once base_path('vendor/kyon147/laravel-shopify/src/resources/database/migrations/2026_04_02_120000_add_expiring_offline_token_columns_to_shops_table.php');
        (new \AddExpiringOfflineTokenColumnsToShopsTable())->up();
    }

    private function shop(): User
    {
        $shop = new User();
        $shop->forceFill(['name' => 'token-test.myshopify.com', 'email' => 'test@example.com', 'password' => 'old-access']);
        $shop->save();
        app(Shop::class)->setAccessToken($shop->getId(), AccessToken::fromNative('old-access'), 'old-refresh', now()->subMinute(), now()->addDays(80));
        return $shop->fresh();
    }

    public function test_direct_http_token_read_refreshes_before_returning_credentials(): void
    {
        $shop = Mockery::mock(User::class)->makePartial();
        $shop->password = 'old-access';
        $shop->shouldReceive('apiHelper')->once()->andReturnUsing(function () use ($shop) {
            $shop->password = 'new-access';
            return Mockery::mock(ApiHelper::class);
        });
        $this->assertSame('new-access', \App\Support\ShopifyAccessToken::forShop($shop));
    }

    public function test_oauth_requests_use_expiring_exchange_and_refresh_grants(): void
    {
        config(['shopify-app.api_key' => 'test-key', 'shopify-app.api_secret' => 'test-secret']);
        $helper = new class extends \Osiset\ShopifyApp\Services\ApiHelper {
            public array $payload = [];

            protected function oauthAccessTokenPost(array $json): ResponseAccess
            {
                $this->payload = $json;
                return new ResponseAccess(['access_token' => 'test-access']);
            }
        };
        $helper->make(new \Gnikyt\BasicShopifyAPI\Session('token-test.myshopify.com', 'legacy-access'));
        $helper->getAccessData('test-code');
        $this->assertSame(1, $helper->payload['expiring']);
        $this->assertSame('test-code', $helper->payload['code']);
        $helper->exchangeNonExpiringOfflineTokenForExpiring('token-test.myshopify.com', 'legacy-access');
        $this->assertSame('urn:ietf:params:oauth:grant-type:token-exchange', $helper->payload['grant_type']);
        $this->assertSame('legacy-access', $helper->payload['subject_token']);
        $this->assertSame(1, $helper->payload['expiring']);
        $helper->refreshOfflineAccessToken('test-refresh');
        $this->assertSame('refresh_token', $helper->payload['grant_type']);
        $this->assertSame('test-refresh', $helper->payload['refresh_token']);
    }

    public function test_refresh_rotates_and_encrypts_tokens_without_exposing_them(): void
    {
        $shop = $this->shop();
        $helper = Mockery::mock(ApiHelper::class);
        $helper->shouldReceive('make')->once()->andReturnSelf();
        $helper->shouldReceive('refreshOfflineAccessToken')->once()->with('old-refresh')->andReturn(new ResponseAccess([
            'access_token' => 'new-access', 'refresh_token' => 'new-refresh',
            'expires_in' => 3600, 'refresh_token_expires_in' => 7776000,
        ]));
        (new OfflineAccessTokenRefresher($helper, app(Shop::class)))->refreshIfNeeded($shop);
        $this->assertSame('new-access', $shop->getAccessToken()->toNative());
        $this->assertSame('new-refresh', Crypt::decryptString($shop->shopify_offline_refresh_token));
        $this->assertNotSame('new-refresh', $shop->getRawOriginal('shopify_offline_refresh_token'));
        $this->assertTrue($shop->shopify_offline_access_token_expires_at->isFuture());
        $this->assertArrayNotHasKey('shopify_offline_refresh_token', $shop->toArray());
        // A second call uses the rotated, fresh token without another refresh.
        (new OfflineAccessTokenRefresher($helper, app(Shop::class)))->refreshIfNeeded($shop);
    }

    public function test_failed_refresh_preserves_existing_credentials(): void
    {
        $shop = $this->shop();
        $helper = Mockery::mock(ApiHelper::class);
        $helper->shouldReceive('make')->once()->andReturnSelf();
        $helper->shouldReceive('refreshOfflineAccessToken')->once()->andThrow(new OAuthTokenRefreshException('Refresh rejected'));
        try {
            (new OfflineAccessTokenRefresher($helper, app(Shop::class)))->refreshIfNeeded($shop);
            $this->fail('Expected the refresh failure to propagate.');
        } catch (OAuthTokenRefreshException $e) {
            $shop->refresh();
            $this->assertSame('old-access', $shop->getAccessToken()->toNative());
            $this->assertSame('old-refresh', Crypt::decryptString($shop->shopify_offline_refresh_token));
        }
    }

    public function test_legacy_token_is_not_converted_by_refresh(): void
    {
        $shop = $this->shop();
        app(Shop::class)->setAccessToken($shop->getId(), AccessToken::fromNative('legacy-access'));
        $shop->refresh();
        $helper = Mockery::mock(ApiHelper::class);
        $helper->shouldNotReceive('make');
        (new OfflineAccessTokenRefresher($helper, app(Shop::class)))->refreshIfNeeded($shop);
        $this->assertSame('legacy-access', $shop->getAccessToken()->toNative());
    }
}
