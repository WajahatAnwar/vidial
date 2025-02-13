<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Customer;
use Illuminate\Support\Facades\Log as LaravelLog;
use Illuminate\Support\Facades\Http;
class SendMantleEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public $tries = 2;
    public $timeout = 9999999;
    public $user = null;
    public $details = null;
    public $event_name = null;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($user, $event_name, $details)
    {
        $this->onQueue('mantle_events');
        $this->user = $user;
        $this->details = $details;
        $this->event_name = $event_name;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // logger()->info('Mantle Event Job Triggered. . . ');
        $customer = Customer::where('email', $this->details['customer_email'])->first();
        // LaravelLog::info(json_encode($customer));
        if ($customer) {
            $cid = (string) $customer->customer_id;
            $token = (string) $this->user->mantle_token;
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-Mantle-Customer-Api-Token' => $token,
                'X-Mantle-App-Id' => env('MANTLE_AP_ID'),
            ])->post('https://appapi.heymantle.com/v1/usage_events', [
                        'customerId' => $cid,
                        'eventId' => rand(1, 1000),
                        'eventName' => env('APP_ENV') == 'staging' ? 'ST_' . $this->event_name : $this->event_name,
                    ]);
        }
        return;
    }
}
