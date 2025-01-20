<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;


class SaveMentalTokenJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    protected $c_user;

    public function __construct($c_user)
    {
        Log::info($c_user);
        $this->c_user = $c_user;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $mantleApiUrl = env('REACT_APP_MANTLE_API_URL');
        $mantleAppId = env('REACT_APP_MANTLE_APP_ID');
        $mantleApiKey = env('REACT_APP_MANTLE_APP_API_KEY');
        $user = $this->c_user;
        $shopifyAdminApiUrl = 'https://'.$user->name.'/admin/api/2023-04/shop.json';
        $accessToken = $user->password;

        try {
            // Step 1: Get the shop details
            $shopResponse = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'X-Shopify-Access-Token' => $accessToken,
            ])->get($shopifyAdminApiUrl);

            if (!$shopResponse->successful()) {
                Log::error('Failed to fetch shop details', [
                    'status' => $shopResponse->status(),
                    'body' => $shopResponse->body(),
                ]);
                return;
            }

            // Parse the shop response
            $shopDetails = $shopResponse->json();
            $platformId = $shopDetails['shop']['id'] ?? null;
            $myshopifyDomain = $shopDetails['shop']['myshopify_domain'] ?? null;

            if (!$platformId || !$myshopifyDomain) {
                Log::error('Invalid shop details retrieved from Shopify');
                return;
            }

            // Step 2: Identify the shop with Mantle API
            $mantleResponse = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'X-Mantle-App-Id' => $mantleAppId,
                'X-Mantle-App-Api-Key' => $mantleApiKey,
            ])->post($mantleApiUrl, [
                'platform' => 'shopify',
                'platformId' => $platformId,
                'myshopifyDomain' => $myshopifyDomain,
                'accessToken' => $accessToken,
            ]);

            if ($mantleResponse->successful()) {
                $mantleResult = $mantleResponse->json();

                // Update the user's customer API token
                User::where('name', $user->name)->update(['customer_api_token' => $mantleResult['apiToken']]);
                Log::info('Shop identified and updated successfully', ['data' => $mantleResult]);
            } else {
                Log::error('Failed to identify shop with Mantle API', [
                    'status' => $mantleResponse->status(),
                    'body' => $mantleResponse->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error processing shop identification', ['message' => $e->getMessage()]);
        }
    }
}
