<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Support\Facades\Log;

class SyncAllCustomers implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public $data = null;
    public function __construct($data)
    {
        ini_set('max_execution_time', 1200);
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        syncCustomers($this->data);
        // Log::info(json_encode(User::find(2)));
    }
}
