<?php

namespace Tests\Feature\Shopify;

use App\Jobs\SaveMentalTokenJob;
use App\Jobs\SendMantleEventJob;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MantleTokenJobTest extends TestCase
{
    public function test_mantle_identify_job_does_not_call_mantle_or_shopify(): void
    {
        Http::preventStrayRequests();
        Http::fake();
        $shop = new User;
        $shop->name = 'test.myshopify.com';
        $shop->password = 'offline-token';

        (new SaveMentalTokenJob($shop))->handle();

        Http::assertNothingSent();
    }

    public function test_mantle_usage_event_job_does_not_call_mantle(): void
    {
        Http::preventStrayRequests();
        Http::fake();
        $shop = new User;
        $shop->name = 'test.myshopify.com';
        $shop->mantle_token = 'customer-token';

        (new SendMantleEventJob($shop, 'video_approved', [
            'customer_email' => 'buyer@example.test',
        ]))->handle();

        Http::assertNothingSent();
    }
}
