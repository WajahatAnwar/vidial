<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\EmailTemplate;
use App\Models\User;
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
            $user = User::find($this->details['user_id']);
            $symbol = '';
            if($user){
              $symbol = getCurrencySymbol($user->store_currency);
            }
        if ($user_template) {
            $button='<a href='.$this->details['url'].' style="text-decoration: none"><button style="font-size: 18px;background:'. $user_template['btn_color']. ';color: #fff;border: none;border-radius: 4px;display: block;margin: 50px auto;padding: 12px 40px;cursor: pointer;">'. $user_template['btn_text'].'</button></a>';
            $body['body'] = $user_template['body'];
            $body['body'] = str_replace('{{name}}', $this->details['name'] ?? 'Customer', $body['body']);
            $body['body'] = str_replace('{{amount}}', $symbol.$this->details['amount'], $body['body']);
            $body['body'] = str_replace('{{storename}}', $this->details['storename'], $body['body']);
            $body['body'] = str_replace('{{discount_code}}', $this->details['discount_code'], $body['body']);
            $body['body'] = str_replace('{{button}}', $button, $body['body']);
            $body['body'] = str_replace('{{reason_decline}}', $this->details['reason_decline'], $body['body']);
           
            $body['btn_text'] =  $user_template['btn_text'];
            $body['btn_color'] =  $user_template['btn_color'];
            $body['url'] =  $this->details['url'];
            $body['logo'] = $user_template['logo'];
            $user_template['subject'] =str_replace('{{amount}}', $symbol.$this->details['amount'], $user_template['subject']);
            $user_template['subject'] = str_replace('{{storename}}',$this->details['storename'], $user_template['subject']);
            sendMail($this->details['mail'], $user_template['subject'], $this->details['view'], ['body' => $body], $user_template->from);
            //dd('sent');
        }
    }
}
