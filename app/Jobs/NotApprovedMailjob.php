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
        'from' => env('MAIL_USERNAME'),
        'to' => $this->detail['mail'],
        'subject' => 'Video Not Approved',
        'template' => 'videodeclined',
        'v:name' => $this->detail['name'],
        'v:storename' =>$this->detail['storename'] ,
        'v:storename_team' =>$this->detail['storeteam'] ,
        'v:reason_decline'=>$this->detail['rejectionReason'],
        'v:url' => $this->detail['url']
    );

    $mgClient->messages()->send($domain, $params);
    }
}
