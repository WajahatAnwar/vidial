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

        // Log calculated signature for debugging
        Log::debug('Calculated signature', [
            'calculated_signature' => $calculatedSignature,
            'expected_signature' => $expectedSignature,
        ]);

        return hash_equals($calculatedSignature, $expectedSignature);
    }


    public function planCreated(Request $request)
    {
        // Log incoming request for debugging
        Log::info('Webhook received', [
            'headers' => $request->headers->all(),
            'body' => $request->getContent(),
        ]);

        // Replace these with your actual secret and headers
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
        Log::info('Webhook signature verified successfully');

        // Process the webhook payload
        $payload = json_decode($body, true);

        // Log the payload for debugging
        Log::info('Webhook payload processed', [
            'payload' => $payload,
        ]);


        if (!empty($payload['customFields']['on_install']) && $payload['customFields']['on_install'] == 1) {
            Plan::where('on_install', 1)->update(['on_install' => 0]);
        }


        Plan::create([
            'uuid' => $payload['id'],
            'name' => $payload['name'] ?? null,
            'price' => $payload['amount'] ?? null,
            'interval' => $payload['interval'] ?? null,
            'terms' => "Terms " ?? null,
            'trial_days' => $payload['trialDays'] ?? null,
            'created_at' => $payload['createdAt'] ?? null,
            'updated_at' => $payload['updatedAt'] ?? null,
            'ugc_video_count' => $payload['customFields']['ugc_video_count'] ?? 0,
            'ugc_email_count' => $payload['customFields']['ugc_email_count'] ?? 0,
            'description' => $payload['description'] ?? null,
            'type' => $payload['customFields']['type'] ?? 0,
            'capped_amount' => $payload['customFields']['capped_amount'] ?? 0.01,
            'on_install' => $payload['customFields']['on_install'] ?? 0,
            'test' => $payload['customFields']['test'] ?? 0,
        ]);
        
        // Return success response
        return response()->json(['message' => 'Webhook received and data stored'], 200);

    }



    public function planUpdated(Request $request)
{
    // Log incoming request for debugging
    // Log::info('Webhook received', [
    //     'headers' => $request->headers->all(),
    //     'body' => $request->getContent(),
    // ]);
    Log::info(json_encode($request->getContent(), JSON_PRETTY_PRINT ));

    // Replace these with your actual secret and headers
    $secret = env('REACT_APP_MANTLE_APP_API_KEY');
    $timestamp = $request->header('X-Timestamp');
    $expectedSignature = $request->header('X-Mantle-Hmac-SHA256');
    $body = $request->getContent(); // Raw body of the webhook

    // Prepare the data for signature verification
    $data = $timestamp . "." . $body;

    // Verify the signature
    if (!$this->verifySignature($secret, $data, $expectedSignature)) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    $payload = json_decode($body, true);

    // Handle the `on_install` flag
    if (!empty($payload['customFields']['on_install']) && $payload['customFields']['on_install'] == 1) {
        Plan::where('on_install', 1)->update(['on_install' => 0]);
    }

 
    $plan = Plan::updateOrCreate(
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
            'type' => $payload['customFields']['type'] ?? 0,
            'capped_amount' => $payload['customFields']['capped_amount'] ?? 0.01,
            'on_install' => $payload['customFields']['on_install'] ?? 0,
            'test' => $payload['customFields']['test'] ?? 0,
            'terms' => "Terms " ?? null,

        ]
    );

    // Log the action
    Log::info('Plan processed', ['plan' => $plan]);

    // Return success response
    return response()->json(['message' => 'Webhook received and plan updated/created'], 200);
}





}
