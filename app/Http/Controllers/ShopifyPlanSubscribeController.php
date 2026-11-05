<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Osiset\ShopifyApp\Actions\GetPlanUrl;
use Osiset\ShopifyApp\Objects\Values\NullablePlanId;

/**
 * POST /api/billing/manual-plan-charge
 *
 * Frontend sets SHOPIFY_MANUAL_PLAN_CHARGE_URL to this path.
 * Body: { "plan_id": <id from get-plans> }
 *
 * Charge:    { "success": true, "confirmation_url": "https://...", "confirmationUrl": "https://..." }
 * Freemium:  { "success": true, "freemium": true }
 * Declined:  { "success": false, "error": "declined" }
 * Other:     { "success": false, "error": "<code>", "message": "<optional>" }
 *
 * Contract: docs/shopify-manual-billing.md
 */
class ShopifyPlanSubscribeController extends Controller
{
    public function __construct(private GetPlanUrl $getPlanUrl) {}

    public function __invoke(Request $request): JsonResponse
    {
        $shop = $request->user();
        if (! $shop) {
            return $this->failure('shop_required', 'Shop session is required.', 401);
        }

        $planId = $request->input('plan_id', $request->input('planId'));
        if ($planId === null || $planId === '') {
            return $this->failure('plan_required', 'plan_id is required.', 422);
        }

        $allowed = array_keys(config('shopify-billing.plans', []));
        $plan = Plan::query()
            ->where('id', $planId)
            ->where('status', 1)
            ->first();

        if (! $plan || ! in_array($plan->name, $allowed, true)) {
            return $this->failure('unknown_plan', 'Unknown plan.', 404);
        }

        if (strtoupper((string) $plan->type) !== 'RECURRING') {
            return $this->failure('plan_not_recurring', 'Plan is not a Shopify recurring manual plan.', 422);
        }

        if ((float) $plan->price <= 0 && config('shopify-app.billing_freemium_enabled') === true) {
            $this->assignFreemium($shop, $plan);

            return response()->json([
                'success' => true,
                'freemium' => true,
                'message' => $plan->name.' plan is active.',
            ]);
        }

        if (config('shopify-app.billing_enabled') !== true) {
            return $this->failure('billing_disabled', 'Shopify billing is disabled.', 409);
        }

        try {
            $getPlanUrl = $this->getPlanUrl;
            $confirmationUrl = $getPlanUrl(
                $shop->getId(),
                NullablePlanId::fromNative((int) $plan->id),
                $this->embeddedHost($request)
            );
        } catch (\Throwable $e) {
            Log::warning('Shopify manual plan charge failed', [
                'plan_id' => $plan->id,
                'message' => $e->getMessage(),
            ]);

            if ($this->isDeclined($e->getMessage())) {
                return $this->failure('declined', 'The charge was declined.', 402);
            }

            return $this->failure('charge_create_failed', 'Could not create the Shopify charge.', 502);
        }

        if (! is_string($confirmationUrl) || ! str_starts_with($confirmationUrl, 'https://')) {
            return $this->failure(
                'charge_create_failed',
                'Shopify charge confirmation URL was not returned.',
                502
            );
        }

        return response()->json([
            'success' => true,
            'confirmation_url' => $confirmationUrl,
            'confirmationUrl' => $confirmationUrl,
        ]);
    }

    private function assignFreemium(object $shop, Plan $plan): void
    {
        $shop->plan_id = $plan->id;
        $table = $shop->getTable();

        if (Schema::hasColumn($table, 'shopify_freemium')) {
            $shop->shopify_freemium = 1;
        }

        $copies = [
            'ugc_video_count' => $plan->ugc_video_count,
            'ugc_email_count' => $plan->ugc_email_count,
            'remaining_videos' => $plan->ugc_video_count,
            'remaining_email' => $plan->ugc_email_count,
        ];
        foreach ($copies as $column => $value) {
            if (Schema::hasColumn($table, $column)) {
                $shop->{$column} = $value;
            }
        }

        $shop->save();
    }

    private function embeddedHost(Request $request): string
    {
        $host = $request->input('host');
        if (is_string($host) && $host !== '') {
            return urldecode($host);
        }

        $referer = $request->headers->get('referer');
        if (! is_string($referer) || $referer === '') {
            return '';
        }

        $query = [];
        parse_str((string) parse_url($referer, PHP_URL_QUERY), $query);
        $refererHost = $query['host'] ?? '';

        return is_string($refererHost) ? urldecode($refererHost) : '';
    }

    private function isDeclined(string $message): bool
    {
        $message = strtolower($message);

        return str_contains($message, 'declin') || str_contains($message, 'not been approved');
    }

    private function failure(string $error, string $message, int $status): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $error,
            'message' => $message,
        ], $status);
    }
}
