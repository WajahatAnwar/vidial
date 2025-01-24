<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncProductsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $data;
    public $timeout = 0;
    public $tries = 2;

    private $user;
    private $intacctSync;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($user, $intacctSync = false)
    {
        $this->user = $user;
        $this->intacctSync = $intacctSync;

        // if(!$this->intacctSync)
        $this->onQueue('que_collections');
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Log::info("SYNC PRODUCTS JOB RUNNING: " . $this->user->name);
        syncProductsV2($this->user, $this->intacctSync);
    }
}
