<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class KlavioEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $api_key = null;
    public $email = null;
    public $order = null;
    public $eventName = null;
    public $video = null;
    public $video_id = null;
    public function __construct($api_key,$email,$order=null,$video=null,$video_id=null)
    {
        $this->api_key = $api_key;
        $this->order = $order;
        $this->email = $email;
        $this->video = $video;
        $this->video_id = $video_id;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        logger('KlavioEmailJob');
        $client = new \GuzzleHttp\Client();
        $this->eventName = $this->order ? 'Post Purchase '.$this->order['order_id'] : $this->video['type'].'_GoodAuthentic';
        logger($this->eventName);
        $data = [
            "data" => [
                "type" => "event",
                "attributes" => [
                    "properties" => [
                        "newKey" => "New Value"
                    ],
                    "metric" => [
                        "data" => [
                            "type" => "metric",
                            "attributes" => [
                                "name" => $this->eventName,
                            ]
                        ]
                    ],
                    "profile" => [
                        "data" => [
                            "type" => "profile",
                            "attributes" => [
                                "email" => $this->email,
                                "properties" => [
                                    "newKey" => "New Value"
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        // Convert the array to a JSON string
        $jsonBody = json_encode($data);

        $response = $client->request('POST', 'https://a.klaviyo.com/api/events/', [
            'body' => $jsonBody,
            'headers' => [
                'Authorization' => 'Klaviyo-API-Key ' . $this->api_key,
                'accept' => 'application/json',
                'content-type' => 'application/json',
                'revision' => '2023-10-15',
            ],
        ]);

        return $response->getBody()->getContents();
    }

}
