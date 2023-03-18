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
       $subject = "Message for your Video about ".$this->detail['storename'];
       if($this->detail['locale'] == "en"){
            $subject = "Message for your Video about ".$this->detail['storename'];
       }else if($this->detail['locale'] == "de"){
            $subject = "Nachricht für Ihr Video über ".$this->detail['storename'];
       }else if($this->detail['locale'] == "es"){
            $subject = "Mensaje para su video sobre ".$this->detail['storename'];
       }else if($this->detail['locale'] == "fr"){
            $subject = "Message pour votre vidéo à propos de ".$this->detail['storename'];
       }else if($this->detail['locale'] == "it"){
            $subject = "Messaggio per il tuo video su ".$this->detail['storename'];
       }else if($this->detail['locale'] == "pt"){
            $subject = "Mensagem para seu vídeo sobre ".$this->detail['storename'];
       }

       $params = array(
        'from' => "Vidial",
        'to' => $this->detail['mail'],
        'subject' => $subject,
        'template' => $this->detail['locale']=='en' ? 'videodeclined' : "videodeclined_".$this->detail['locale'] ,
        'v:name' => $this->detail['name'],
        'v:storename' =>$this->detail['storename'] ,
        'v:storename_team' =>$this->detail['storeteam'] ,
        'v:reason_decline'=>$this->detail['rejectionReason'],
        'v:url' => $this->detail['url']
    );

    $mgClient->messages()->send($domain, $params);
    }
}
