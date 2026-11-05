<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

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
     * HeyMantle usage events are paused. Queued jobs must not call the API.
     *
     * @return void
     */
    public function handle() {}
}
