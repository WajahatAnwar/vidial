<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\EmailTemplate;
class EmailTemplateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $details = [];
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
        $user_template = EmailTemplate::with('user')->where('user_id', $this->details['user_id'])
            ->where('type', '=', $this->details['type'])
            ->first();
        if ($user_template) {
            $body['body'] = $user_template['body'];
            $body['body'] = str_replace('{{name}}', $this->details['name'], $user_template['body']);
            $body['body'] = str_replace('{{amount}}', $this->details['amount'], $body['body']);
            $body['body'] = str_replace('{{storename}}', $this->details['storename'], $body['body']);
            $body['body'] = str_replace('{{discount_code}}', $this->details['discount_code'], $body['body']);
            $body['btn_text'] =  $user_template['btn_text'];
            $body['btn_color'] =  $user_template['btn_color'];
            $body['url'] =  $this->details['url'];
            sendMail($this->details['mail'], $user_template['subject'], $this->details['view'], ['body' => $body]);
            //dd('sent');
        }
    }
}
