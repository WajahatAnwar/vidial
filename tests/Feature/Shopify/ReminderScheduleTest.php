<?php

namespace Tests\Feature\Shopify;

use App\Models\Setting;
use Carbon\Carbon;
use Tests\TestCase;

class ReminderScheduleTest extends TestCase
{
    public function test_string_database_intervals_work_with_carbon_three(): void
    {
        $settings = new Setting(['page_link' => '3', 'email_sent_to_customer' => '2']);
        $created = Carbon::parse('2026-11-02 12:00:00');
        $this->assertSame('2026-11-05', $created->copy()->addDays($settings->page_link)->toDateString());
        $this->assertSame('2026-11-16', $created->copy()->addWeeks($settings->email_sent_to_customer)->toDateString());
    }
}
