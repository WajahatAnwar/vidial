<?php

namespace Tests\Feature\Shopify;

use App\Http\Controllers\HeyMentalPlanCreatedController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\ShopifyBillingReturnController;
use App\Http\Controllers\ShopifyPlanSubscribeController;
use App\Models\User;
use Database\Seeders\PlanSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Mockery;
use Osiset\ShopifyApp\Actions\ActivatePlan;
use Osiset\ShopifyApp\Actions\GetPlanUrl;
use Osiset\ShopifyApp\Objects\Values\ChargeId;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Objects\Values\ShopId;
use Tests\TestCase;

class ShopifyManualBillingTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config([
            'shopify-app.namespace' => null,
            'shopify-app.billing_enabled' => false,
            'database.default' => 'billing_test',
            'database.connections.billing_test' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => ''],
        ]);
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('plan_id')->nullable();
            $table->boolean('shopify_freemium')->default(false);
            $table->integer('ugc_video_count')->nullable();
            $table->integer('ugc_email_count')->nullable();
            $table->integer('remaining_videos')->nullable();
            $table->integer('remaining_email')->nullable();
            $table->string('shopify_namespace')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('RECURRING');
            $table->decimal('price', 8, 2)->default(0);
            $table->string('interval')->nullable();
            $table->decimal('capped_amount', 8, 2)->nullable();
            $table->string('terms')->nullable();
            $table->integer('trial_days')->nullable();
            $table->boolean('test')->default(false);
            $table->boolean('on_install')->default(false);
            $table->string('description')->nullable();
            $table->boolean('status')->default(true);
            $table->integer('ugc_video_count')->default(0);
            $table->integer('ugc_email_count')->default(0);
            $table->timestamps();
        });
        DB::table('users')->insert(['id' => 1, 'plan_id' => null]);
        DB::table('plans')->insert([
            ['id' => 14, 'name' => 'Standard', 'type' => 'RECURRING', 'price' => 49, 'status' => 1, 'ugc_video_count' => 10, 'ugc_email_count' => 20],
            ['id' => 16, 'name' => 'Enterprise', 'type' => 'RECURRING', 'price' => 499, 'status' => 1, 'ugc_video_count' => 200, 'ugc_email_count' => 50],
            ['id' => 3, 'name' => 'Advanced', 'type' => 'RECURRING', 'price' => 299, 'status' => 1, 'ugc_video_count' => 1, 'ugc_email_count' => 1],
            ['id' => 9, 'name' => 'Standard', 'type' => 'Month', 'price' => 10, 'status' => 0, 'ugc_video_count' => 1, 'ugc_email_count' => 1],
        ]);
    }

    public function test_seeder_preserves_existing_quotas_and_inserts_missing_catalog_names(): void
    {
        DB::table('plans')->where('id', 14)->update([
            'type' => 'Month',
            'price' => 49,
            'ugc_video_count' => 10,
            'ugc_email_count' => 20,
            'capped_amount' => 0,
        ]);

        $this->seed(PlanSeeder::class);

        $standard = DB::table('plans')->where('id', 14)->first();
        $this->assertSame('RECURRING', $standard->type);
        $this->assertSame(49, (int) $standard->price);
        $this->assertSame(10, (int) $standard->ugc_video_count);
        $this->assertSame(20, (int) $standard->ugc_email_count);
        $this->assertSame('Advanced', DB::table('plans')->where('id', 3)->value('name'));
        $this->assertSame(
            ['Enterprise', 'Free', 'Premium', 'Standard'],
            DB::table('plans')->whereIn('name', ['Free', 'Standard', 'Premium', 'Enterprise'])->orderBy('name')->pluck('name')->unique()->values()->all()
        );
    }

    public function test_catalog_names_match_the_database(): void
    {
        $this->assertSame(
            ['Free', 'Standard', 'Premium', 'Enterprise'],
            array_keys(config('shopify-billing.plans'))
        );
        $this->assertArrayNotHasKey('Advanced', config('shopify-billing.plans'));
    }

    public function test_charge_route_matches_the_frontend_constant_path(): void
    {
        $this->assertSame(url('/api/billing/manual-plan-charge'), route('billing.manual-plan-charge'));
        $this->assertSame(url('/billing/process'), route('billing.process'));
    }

    public function test_billing_disabled_returns_the_frontend_error_shape_without_calling_shopify(): void
    {
        $this->mock(GetPlanUrl::class, function ($mock) {
            $mock->shouldNotReceive('__invoke');
        });
        Http::preventStrayRequests();
        Http::fake();

        $response = $this->subscribe(14);

        $response->assertStatus(409);
        $response->assertExactJson([
            'success' => false,
            'error' => 'billing_disabled',
            'message' => 'Shopify billing is disabled.',
        ]);
        Http::assertNothingSent();
    }

    public function test_enabled_billing_returns_https_confirmation_url(): void
    {
        config(['shopify-app.billing_enabled' => true]);
        $this->mock(GetPlanUrl::class, function ($mock) {
            $mock->shouldReceive('__invoke')->once()->andReturn('https://admin.shopify.com/store/demo/charges/1/confirm');
        });

        $response = $this->subscribe(16, 'host-token');

        $response->assertOk();
        $response->assertExactJson([
            'success' => true,
            'confirmation_url' => 'https://admin.shopify.com/store/demo/charges/1/confirm',
            'confirmationUrl' => 'https://admin.shopify.com/store/demo/charges/1/confirm',
        ]);
    }

    public function test_non_https_confirmation_url_is_rejected(): void
    {
        config(['shopify-app.billing_enabled' => true]);
        $this->mock(GetPlanUrl::class, function ($mock) {
            $mock->shouldReceive('__invoke')->once()->andReturn('http://admin.shopify.com/confirm');
        });

        $this->subscribe(16)->assertStatus(502)->assertJson([
            'success' => false,
            'error' => 'charge_create_failed',
        ]);
    }

    public function test_declined_charge_uses_the_frontend_error_code(): void
    {
        config(['shopify-app.billing_enabled' => true]);
        $this->mock(GetPlanUrl::class, function ($mock) {
            $mock->shouldReceive('__invoke')->once()->andThrow(new \RuntimeException('Charge was declined'));
        });

        $this->subscribe(16)->assertStatus(402)->assertExactJson([
            'success' => false,
            'error' => 'declined',
            'message' => 'The charge was declined.',
        ]);
    }

    public function test_freemium_flag_activates_a_free_plan_without_a_charge_url(): void
    {
        config(['shopify-app.billing_freemium_enabled' => true]);
        DB::table('plans')->insert([
            'id' => 13,
            'name' => 'Free',
            'type' => 'RECURRING',
            'price' => 0,
            'status' => 1,
            'ugc_video_count' => 1,
            'ugc_email_count' => 200,
        ]);
        $this->mock(GetPlanUrl::class, function ($mock) {
            $mock->shouldNotReceive('__invoke');
        });

        $shop = User::find(1);
        $request = Request::create('/api/billing/manual-plan-charge', 'POST', ['plan_id' => 13]);
        $request->setUserResolver(fn () => $shop);
        $response = \Illuminate\Testing\TestResponse::fromBaseResponse(
            app(ShopifyPlanSubscribeController::class)($request)
        );

        $response->assertOk()->assertJson([
            'success' => true,
            'freemium' => true,
        ]);
        $saved = DB::table('users')->where('id', 1)->first();
        $this->assertSame(13, (int) $saved->plan_id);
        $this->assertSame(1, (int) $saved->shopify_freemium);
        $this->assertSame(1, (int) $saved->ugc_video_count);
        $this->assertSame(200, (int) $saved->remaining_email);
    }

    public function test_advanced_is_not_a_subscribable_plan(): void
    {
        $this->mock(GetPlanUrl::class, function ($mock) {
            $mock->shouldNotReceive('__invoke');
        });

        $this->subscribe(3)->assertStatus(404)->assertJson([
            'success' => false,
            'error' => 'unknown_plan',
        ]);
    }

    public function test_inactive_or_non_recurring_plan_is_rejected(): void
    {
        $this->subscribe(9)->assertStatus(404)->assertJson(['error' => 'unknown_plan']);

        DB::table('plans')->where('id', 14)->update(['type' => 'Month']);
        $this->subscribe(14)->assertStatus(422)->assertJson(['error' => 'plan_not_recurring']);
    }

    public function test_get_plans_lists_active_database_names_and_subscribe_hook(): void
    {
        $this->actingAs(User::find(1));
        $payload = app(OrdersController::class)->getPlans()->getData(true);

        $this->assertTrue($payload['success']);
        $this->assertSame(['Standard', 'Enterprise'], array_column($payload['data'], 'name'));
        $this->assertSame('POST', $payload['billing']['subscribe']['method']);
        $this->assertSame('/api/billing/manual-plan-charge', $payload['billing']['subscribe']['path']);
        $this->assertFalse($payload['billing']['enabled']);
    }

    public function test_billing_return_redirects_to_plans_with_frontend_query_params(): void
    {
        $this->mock(ActivatePlan::class, function ($mock) {
            $mock->shouldReceive('__invoke')->once()->andReturn(ChargeId::fromNative(1));
        });

        $accepted = $this->billingReturn(['charge_id' => 99, 'host' => 'abc'], 16);
        $acceptedQuery = $this->query($accepted->headers->get('Location'));
        $this->assertStringContainsString('/plans', $accepted->headers->get('Location'));
        $this->assertSame('accepted', $acceptedQuery['charge_status']);
        $this->assertSame('accepted', $acceptedQuery['status']);
        $this->assertSame('99', (string) $acceptedQuery['charge_id']);
        $this->assertArrayNotHasKey('error', $acceptedQuery);

        $this->mock(ActivatePlan::class, function ($mock) {
            $mock->shouldReceive('__invoke')->once()->andThrow(new \RuntimeException('Charge has not been approved.'));
        });
        $declined = $this->billingReturn(['charge_id' => 99], 16);
        $declinedQuery = $this->query($declined->headers->get('Location'));
        $this->assertSame('declined', $declinedQuery['error']);
        $this->assertSame('declined', $declinedQuery['charge_status']);
        $this->assertSame('declined', $declinedQuery['status']);

        $missing = $this->billingReturn([], 16);
        $this->assertSame('declined', $this->query($missing->headers->get('Location'))['error']);
    }

    public function test_mantle_plan_webhooks_do_not_write_or_call_out(): void
    {
        Http::preventStrayRequests();
        Http::fake();
        $controller = new HeyMentalPlanCreatedController;
        $request = Request::create('/api/create_plan_sync', 'POST', [], [], [], [], '{"id":"mantle-plan"}');

        $created = $controller->planCreated($request);
        $updated = $controller->planUpdated($request);

        $this->assertSame(200, $created->status());
        $this->assertTrue($created->getData(true)['ignored']);
        $this->assertTrue($updated->getData(true)['ignored']);
        $this->assertSame(4, DB::table('plans')->count());
        Http::assertNothingSent();
        $this->assertStringNotContainsString('appapi.heymantle.com', file_get_contents(base_path('routes/web.php')));
        $this->assertStringNotContainsString('appapi.heymantle.com', file_get_contents(base_path('app/Jobs/SaveMentalTokenJob.php')));
        $this->assertStringNotContainsString('appapi.heymantle.com', file_get_contents(base_path('app/Jobs/SendMantleEventJob.php')));
        $this->assertStringNotContainsString('services.mantle', file_get_contents(base_path('app/Http/Controllers/HeyMentalPlanCreatedController.php')));
    }

    private function subscribe(int $planId, string $host = ''): \Illuminate\Testing\TestResponse
    {
        $shop = Mockery::mock(User::class)->makePartial();
        $shop->id = 1;
        $shop->shouldReceive('getId')->andReturn(ShopId::fromNative(1));
        $request = Request::create('/api/billing/manual-plan-charge', 'POST', [
            'plan_id' => $planId,
            'host' => $host,
        ]);
        $request->setUserResolver(fn () => $shop);

        $response = app(ShopifyPlanSubscribeController::class)($request);

        return \Illuminate\Testing\TestResponse::fromBaseResponse($response);
    }

    private function billingReturn(array $query, int $plan): \Illuminate\Http\RedirectResponse
    {
        $shop = Mockery::mock(User::class)->makePartial();
        $shop->id = 1;
        $shop->shouldReceive('getId')->andReturn(ShopId::fromNative(1));
        $shop->shouldReceive('getDomain')->andReturn(ShopDomain::fromNative('demo.myshopify.com'));
        $request = Request::create('/billing/process/'.$plan, 'GET', $query);
        $request->setUserResolver(fn () => $shop);

        return app(ShopifyBillingReturnController::class)($request, app(ActivatePlan::class), $plan);
    }

    private function query(?string $location): array
    {
        $params = [];
        parse_str((string) parse_url((string) $location, PHP_URL_QUERY), $params);

        return $params;
    }
}
