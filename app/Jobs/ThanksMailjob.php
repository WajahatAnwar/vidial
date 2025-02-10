<?php

namespace App\Jobs;

use App\Mail\thanksyouMail;
// use App\Models\Log;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Mailgun\Mailgun;
use Illuminate\Support\Facades\Log;

class ThanksMailjob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $timeout = 9999999999999999;
    public $tries = 2;
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
        //    Log::info($this->details['url']);
        $params = array(
            'from' => env('MAIL_USERNAME'),
            'to' => $this->details['mail'],
            'subject' => 'New Video on The Store',
            // 'template' => $this->details['locale']=='en' ? 'inform_merchant_new_ugc_uploaded' : "inform_merchant_new_ugc_uploaded_".$this->details['locale'],
            'template' => 'inform_merchant_new_ugc_uploaded',
            // 'v:storename' => $this->details['url'],
            // 'v:url' => $this->details['url'],
            'h:X-Mailgun-Variables' => json_encode([
                'url' => $this->details['url'],
            ]),
            'o:tracking-clicks' => 'no',
        );
        // logger('params');
        // logger(json_encode($params));

        $mgClient->messages()->send($domain, $params);

        // Mail::to($this->details['mail'])->send(new thanksyouMail($this->details));
    }
}
