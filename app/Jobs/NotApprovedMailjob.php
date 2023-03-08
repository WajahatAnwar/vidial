<?php

namespace App\Jobs;

use App\Mail\videoNotApprovedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Mailgun\Mailgun;

class NotApprovedMailjob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $detail;
    public function __construct($detail)
    {
        $this->detail = $detail;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $mgClient = Mailgun::create(
            env('MAILGUN_SECRET'), // Mailgun API Key
            env('MAILGUN_ENDPOINT')
       );
       $domain = env('MAILGUN_DOMAIN');

       $params = array(
        'from' => 'mailgunner@50calibre.com',
        'to' => 'hamza70fsd@gmail.com',
        'subject' => 'Roundhouse  KICK',
        'template' => 'videoapproved',
        'v:name' => 'RichyRoundhouse',
        'v:storename' => 'Bruski',
        'v:discount_code'=>"66757868"
    );

    $mgClient->messages()->send($domain, $params);
    }
}
