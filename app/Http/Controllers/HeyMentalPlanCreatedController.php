<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Mantle plan webhooks are paused. Routes stay so old callers get a stable
 * no-op instead of a retry storm. Nothing is written and Mantle is not called.
 */
class HeyMentalPlanCreatedController extends Controller
{
    public function planCreated(Request $request): JsonResponse
    {
        return $this->ignored();
    }

    public function planUpdated(Request $request): JsonResponse
    {
        return $this->ignored();
    }

    private function ignored(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'ignored' => true,
            'message' => 'Mantle plan sync is disabled. Plans are Shopify manual plans.',
        ]);
    }
}
