<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HeyMentalPlanCreatedController extends Controller
{
    private function verifySignature($secret, $data, $expectedSignature)
    {
        $calculatedSignature = hash_hmac('sha256', $data, $secret);

        return hash_equals($calculatedSignature, $expectedSignature);
    }
    public function planCreated(Request $request)
    {
        // Log incoming request for debugging
        Log::info('Webhook received', [
            'headers' => $request->headers->all(),
            'body' => $request->getContent(),
        ]);

        $secret = env('REACT_APP_MANTLE_APP_API_KEY');
        $timestamp = $request->header('X-Timestamp');
        $expectedSignature = $request->header('X-Mantle-Hmac-SHA256');
        $body = $request->getContent(); // Raw body of the webhook

        // Log received headers and raw body
        Log::debug('Webhook details', [
            'X-Timestamp' => $timestamp,
            'X-Mantle-Hmac-SHA256' => $expectedSignature,
            'Raw Body' => $body,
        ]);

        // Prepare the data for signature verification
        $data = $timestamp . "." . $body;

        // Verify the signature
        if (!$this->verifySignature($secret, $data, $expectedSignature)) {
            Log::error('Invalid webhook signature', [
                'calculated_signature' => hash_hmac('sha256', $data, $secret),
                'expected_signature' => $expectedSignature,
            ]);

            return response()->json(['error' => 'Invalid signature'], 401);
        }

        // Log successful verification
        // Log::info('Webhook signature verified successfully');

        // Process the webhook payload
        $payload = json_decode($body, true);

        // Log the payload for debugging
        // Log::info('Webhook payload processed', [
        //     'payload' => $payload,
        // ]);


        if (!empty($payload['customFields']['on_install']) && $payload['customFields']['on_install'] == 1) {
            Plan::where('on_install', 1)->update(['on_install' => 0]);
        }


        Plan::create([
            'uuid' => $payload['id'],
            'name' => $payload['name'] ?? null,
            'price' => $payload['amount'] ?? null,
            'interval' => $payload['interval'] ?? null,
            'description' => $payload['description'] ?? null,
            'terms' => "Terms " ?? null,
            'trial_days' => $payload['trialDays'] ?? null,
            'description_1' => $payload['customFields']['feature_1'] ?? null,
            'description_2' => $payload['customFields']['feature_2'] ?? null,
            'description_3' => $payload['customFields']['feature_3'] ?? null,
            'description_4' => $payload['customFields']['feature_4'] ?? null,
            'description_5' => $payload['customFields']['feature_5'] ?? null,
            'klaviyo_access' => $payload['customFields']['klaviyo_access'] ?? 0,
            'status' => $payload['public'] ?? 0,

            'created_at' => $payload['createdAt'] ?? null,
            'updated_at' => $payload['updatedAt'] ?? null,
            'ugc_video_count' => $payload['customFields']['ugc_video_count'] ?? 0,
            'ugc_email_count' => $payload['customFields']['ugc_email_count'] ?? 0,
            'type' => $payload['customFields']['type'] ?? 0,
            'capped_amount' => $payload['customFields']['capped_amount'] ?? 0.01,
            'on_install' => $payload['customFields']['on_install'] ?? 0,
            // 'test' => $payload['customFields']['test'] ?? 0,
        ]);
        return response()->json(['message' => 'Webhook received and data stored'], 200);

    }
    public function planUpdated(Request $request)
    {
        // Log::info('Webhook update received');
        // Log::info(json_encode($request->getContent(), JSON_PRETTY_PRINT));
        // Log::info(json_encode($request->headers->all(), JSON_PRETTY_PRINT));

        $secret = env('REACT_APP_MANTLE_APP_API_KEY');
        $timestamp = $request->header('X-Timestamp');
        $expectedSignature = $request->header('X-Mantle-Hmac-SHA256');
        $body = $request->getContent();
        $data = $timestamp . "." . $body;
        if (!$this->verifySignature($secret, $data, $expectedSignature)) {
            Log::info("We Found an invalid signature");
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $payload = json_decode($body, true);

        // Log::info($payload);

        if (!empty($payload['customFields']['on_install']) && $payload['customFields']['on_install'] == 1) {
            Plan::where('on_install', 1)->update(['on_install' => 0]);
        }

        Plan::updateOrCreate(
            ['uuid' => $payload['id']],
            [
                'name' => $payload['name'] ?? null,
                'price' => $payload['amount'] ?? null,
                'interval' => $payload['interval'] ?? null,
                'trial_days' => $payload['trialDays'] ?? null,
                'created_at' => $payload['createdAt'] ?? null,
                'updated_at' => $payload['updatedAt'] ?? null,
                'ugc_video_count' => $payload['customFields']['ugc_video_count'] ?? 0,
                'ugc_email_count' => $payload['customFields']['ugc_email_count'] ?? 0,
                'description' => $payload['description'] ?? null,
                'description_1' => $payload['customFields']['feature_1'] ?? null,
                'description_2' => $payload['customFields']['feature_2'] ?? null,
                'description_3' => $payload['customFields']['feature_3'] ?? null,
                'description_4' => $payload['customFields']['feature_4'] ?? null,
                'description_5' => $payload['customFields']['feature_5'] ?? null,
                'klaviyo_access' => $payload['customFields']['klaviyo_access'] ?? 0,
                'status' => $payload['public'] ?? 0,
                'type' => $payload['customFields']['type'] ?? 0,
                'capped_amount' => $payload['customFields']['capped_amount'] ?? 0.01,
                'on_install' => $payload['customFields']['on_install'] ?? 0,
                // 'test' => $payload['customFields']['test'] ?? 0,
                'terms' => "Terms " ?? null,

            ]
        );
        return response()->json(['message' => 'Webhook received and plan updated/created'], 200);
    }

}
