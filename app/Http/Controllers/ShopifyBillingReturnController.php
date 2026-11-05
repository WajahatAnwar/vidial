<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Osiset\ShopifyApp\Actions\ActivatePlan;
use Osiset\ShopifyApp\Objects\Values\ChargeReference;
use Osiset\ShopifyApp\Objects\Values\PlanId;

/**
 * Shopify charge return. Sends the merchant to /plans with the query
 * params the Plans screen already reads.
 *
 * Accepted: charge_status=accepted&status=accepted&charge_id=
 * Declined: error=declined&charge_status=declined&status=declined
 */
class ShopifyBillingReturnController extends Controller
{
    public function __invoke(Request $request, ActivatePlan $activatePlan, ?int $plan = null): RedirectResponse
    {
        $shop = $request->user();
        $chargeId = filter_var($request->query('charge_id'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $query = [
            'shop' => $this->shopDomain($shop),
            'host' => urldecode((string) $request->query('host', '')),
        ];

        if ($chargeId === false || ! $plan || ! $shop) {
            return $this->toPlans($query, [
                'error' => 'declined',
                'charge_status' => 'declined',
                'status' => 'declined',
            ]);
        }

        try {
            $activatePlan(
                $shop->getId(),
                PlanId::fromNative($plan),
                ChargeReference::fromNative($chargeId),
                $query['host']
            );
        } catch (\Throwable $e) {
            Log::warning('Shopify manual plan return failed', [
                'plan_id' => $plan,
                'charge_id' => $chargeId,
                'message' => $e->getMessage(),
            ]);

            $declined = str_contains(strtolower($e->getMessage()), 'declin')
                || str_contains(strtolower($e->getMessage()), 'not been approved');

            return $this->toPlans($query, [
                'error' => $declined ? 'declined' : 'charge_failed',
                'charge_status' => $declined ? 'declined' : 'failed',
                'status' => $declined ? 'declined' : 'failed',
                'charge_id' => $chargeId,
                'message' => $declined ? 'The charge was declined.' : 'The charge could not be activated.',
            ]);
        }

        return $this->toPlans($query, [
            'charge_status' => 'accepted',
            'status' => 'accepted',
            'charge_id' => $chargeId,
        ]);
    }

    private function toPlans(array $query, array $extra): RedirectResponse
    {
        return redirect()->route('plans', array_merge($query, $extra));
    }

    private function shopDomain(mixed $shop): ?string
    {
        if (! is_object($shop) || ! method_exists($shop, 'getDomain')) {
            return null;
        }

        $domain = $shop->getDomain();

        return is_object($domain) && method_exists($domain, 'toNative')
            ? $domain->toNative()
            : null;
    }
}
