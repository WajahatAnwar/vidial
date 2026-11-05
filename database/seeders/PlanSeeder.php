<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Upserts the Shopify manual-plan catalog: Free, Standard, Premium, Enterprise.
 *
 * Do not run this on Cloudways until Sanwal confirms a staging host.
 * Existing rows keep their price and ugc_* counts. A missing name is inserted
 * from config/shopify-billing.php, which copies the current database catalog.
 * This seeder does not rename Advanced and does not delete legacy rows.
 */
class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        foreach (config('shopify-billing.plans', []) as $name => $plan) {
            $existing = DB::table('plans')->where('name', $name)->orderByDesc('id')->first();

            if ($existing) {
                $this->normalizeBillingColumns($existing);

                continue;
            }

            DB::table('plans')->insert([
                'type' => 'RECURRING',
                'name' => $name,
                'price' => $plan['price'],
                'interval' => 'EVERY_30_DAYS',
                'capped_amount' => $plan['capped_amount'],
                'terms' => 'Terms',
                'trial_days' => 0,
                'test' => config('shopify-billing.test_charges') ? 1 : 0,
                'on_install' => 0,
                'description' => $plan['description'],
                'ugc_video_count' => $plan['ugc_video_count'],
                'ugc_email_count' => $plan['ugc_email_count'],
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function normalizeBillingColumns(object $existing): void
    {
        $updates = [];

        if (strtoupper((string) $existing->type) !== 'RECURRING') {
            $updates['type'] = 'RECURRING';
        }

        if ($existing->interval !== null && ! in_array($existing->interval, ['EVERY_30_DAYS', 'ANNUAL'], true)) {
            $updates['interval'] = 'EVERY_30_DAYS';
        }

        if ((float) $existing->capped_amount > 0 && ($existing->terms === null || $existing->terms === '')) {
            $updates['terms'] = 'Terms';
        }

        if ($updates === []) {
            return;
        }

        $updates['updated_at'] = now();
        DB::table('plans')->where('id', $existing->id)->update($updates);
    }
}
