<?php

namespace App\Jobs;

use App\Mail\thanksyouMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Mailgun\Mailgun;

class ThanksMailjob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $details;
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
        'to' => "hamza@swishtag.com",
        'subject' => 'New Video on The Store',
        'template' => 'inform_merchant_new_ugc_uploaded',
        'v:storename' => $this->details['url'],
    );

    $mgClient->messages()->send($domain, $params);
        // Mail::to($this->details['mail'])->send(new thanksyouMail($this->details));
    }
}
