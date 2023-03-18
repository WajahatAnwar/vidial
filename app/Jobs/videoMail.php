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
       $subject = "Here's your ".$this->details['store_currency'].$this->details['store_credit']." discount code for ".$this->details['store_name'];
       if($this->details['locale'] == "en"){
            $subject = "Here's your ".$this->details['store_currency'].$this->details['store_credit']." discount code for ".$this->details['store_name'];
       }else if($this->details['locale'] == "de"){
            $subject = "Hier ist Ihr ".$this->details['store_currency'].$this->details['store_credit']." Rabattcode für ".$this->details['store_name'];
       }else if($this->details['locale'] == "es"){
            $subject = "Aquí está su código de descuento de ".$this->details['store_currency'].$this->details['store_credit']." para ".$this->details['store_name'];
       }else if($this->details['locale'] == "fr"){
            $subject = "Voici votre Code de Réduction de ".$this->details['store_currency'].$this->details['store_credit']." pour ".$this->details['store_name'];
       }else if($this->details['locale'] == "it"){
            $subject = "Ecco il tuo codice sconto di ".$this->details['store_currency'].$this->details['store_credit']." per ".$this->details['store_name'];
       }else if($this->details['locale'] == "pt"){
            $subject = "Aqui está seu código de desconto de ".$this->details['store_currency'].$this->details['store_credit']." para ".$this->details['store_name'];
       }

       $params = array(
        'from' => [
            'address' => env('MAIL_FROM_ADDRESS', env('MAIL_USERNAME')),
            'name' => "Vidial",
        ],
        'to' => $this->details['mail'],
        'subject' => $subject,
        'template' => $this->details['locale']=='en' ? 'videoapproved' : "videoapproved_".$this->details['locale'],
        'v:name' => 'RichyRoundhouse',
        'v:storename' => $this->details['store_name'],
        'v:discount_code'=>$this->details['coupen_code'],
        'v:url'=>$this->details['url'],
        'v:amount'=>$this->details['store_currency'].$this->details['store_credit'],
    );


    $mgClient->messages()->send($domain, $params);

        // Mail::to($this->details['mail'])->send(new sendCoupen($this->details));
    }


}
