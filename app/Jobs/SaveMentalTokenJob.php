<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

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
        $this->c_user = $c_user;
    }

    /**
     * HeyMantle identify is paused. Queued jobs must not call Mantle or Shopify.
     *
     * @return void
     */
    public function handle() {}
}
