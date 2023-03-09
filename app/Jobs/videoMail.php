<?php

namespace App\Jobs;

use App\Mail\sendCoupen;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Mailgun\Mailgun;

class videoMail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $details;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($details)
    {
        $this->details = $details;
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
        'from' => env('MAIL_USERNAME'),
        'to' => $this->details['mail'],
        'subject' => 'Video Approved',
        'template' => $this->details['locale']=='en' ? 'videoapproved' : "videoapproved_".$this->details['locale'],
        'v:name' => 'RichyRoundhouse',
        'v:storename_team' => $this->details['store_name'],
        'v:discount_code'=>$this->details['coupen_code'],
    );


    $mgClient->messages()->send($domain, $params);

        // Mail::to($this->details['mail'])->send(new sendCoupen($this->details));
    }
}
