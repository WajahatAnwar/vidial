<?php

namespace Tests\Feature\Shopify;

use App\Http\Middleware\UpdatePlan;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class UpdatePlanMiddlewareTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config([
            'shopify-app.namespace' => null,
            'database.default' => 'quota_test',
            'database.connections.quota_test' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => ''],
        ]);
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('plan_id')->nullable();
            $table->string('shopify_namespace')->nullable();
            foreach (['ugc_email_count', 'ugc_video_count', 'remaining_email', 'remaining_videos'] as $column) {
                $table->integer($column)->default(0);
            }
            $table->softDeletes();
            $table->timestamps();
        });
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->integer('ugc_video_count');
            $table->integer('ugc_email_count');
        });
        Schema::create('charges', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('plan_id')->nullable();
            $table->string('status');
            $table->timestamps();
        });
        foreach (['videos', 'logs'] as $name) {
            Schema::create($name, function (Blueprint $table) {
                $table->id();
                $table->unsignedInteger('user_id');
                $table->string('status')->nullable();
                $table->timestamps();
            });
        }
        DB::table('users')->insert(['id' => 1, 'plan_id' => 1, 'remaining_email' => 7, 'remaining_videos' => 3]);
        DB::table('plans')->insert(['id' => 1, 'ugc_video_count' => 10, 'ugc_email_count' => 20]);
    }

    private function runMiddleware(?User $user): void
    {
        if ($user) {
            $this->actingAs($user);
        }
        $request = Request::create('/');
        $request->setUserResolver(fn () => $user);
        $response = (new UpdatePlan)->handle($request, fn () => response('continued'));
        $this->assertSame('continued', $response->getContent());
    }

    public function test_guest_request_continues(): void
    {
        $this->runMiddleware(null);
    }

    public function test_missing_plan_preserves_existing_quotas(): void
    {
        DB::table('users')->where('id', 1)->update(['plan_id' => 999]);
        $this->runMiddleware(User::find(1));
        $this->assertSame(7, DB::table('users')->where('id', 1)->value('remaining_email'));
    }

    public function test_no_active_charge_preserves_existing_quotas(): void
    {
        DB::table('charges')->insert(['user_id' => 1, 'status' => 'CANCELLED', 'created_at' => now()]);
        $this->runMiddleware(User::find(1));
        $this->assertSame(7, DB::table('users')->where('id', 1)->value('remaining_email'));
        $this->assertSame(3, DB::table('users')->where('id', 1)->value('remaining_videos'));
    }

    public function test_active_charge_still_calculates_current_period_quotas(): void
    {
        DB::table('charges')->insert(['user_id' => 1, 'status' => 'ACTIVE', 'created_at' => now()->subDays(2)]);
        DB::table('videos')->insert([
            ['user_id' => 1, 'status' => config('constants.video_approved'), 'created_at' => now()],
            ['user_id' => 1, 'status' => config('constants.video_approved'), 'created_at' => now()->subDays(40)],
        ]);
        DB::table('logs')->insert(['user_id' => 1, 'created_at' => now()]);
        $this->runMiddleware(User::find(1));
        $user = DB::table('users')->where('id', 1)->first();
        $this->assertSame(9, $user->remaining_videos);
        $this->assertSame(19, $user->remaining_email);
    }

    public function test_active_charge_plan_overrides_the_shop_plan(): void
    {
        DB::table('plans')->insert(['id' => 2, 'ugc_video_count' => 100, 'ugc_email_count' => 40]);
        DB::table('charges')->insert([
            'user_id' => 1,
            'plan_id' => 2,
            'status' => 'ACTIVE',
            'created_at' => now()->subDays(2),
        ]);
        DB::table('videos')->insert([
            'user_id' => 1,
            'status' => config('constants.video_approved'),
            'created_at' => now(),
        ]);
        DB::table('logs')->insert(['user_id' => 1, 'created_at' => now()]);
        $this->runMiddleware(User::find(1));
        $user = DB::table('users')->where('id', 1)->first();
        $this->assertSame(99, $user->remaining_videos);
        $this->assertSame(39, $user->remaining_email);
        $this->assertSame(100, $user->ugc_video_count);
        $this->assertSame(40, $user->ugc_email_count);
    }
}
