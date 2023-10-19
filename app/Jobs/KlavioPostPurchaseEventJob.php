<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class KlavioPostPurchaseEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $shop =null;
    public $api_key = null;
    public function __construct($shop,$api_key)
    {
        $this->shop = $shop;
        $this->api_key = $api_key;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $client = new \GuzzleHttp\Client();

        $response = $client->request('POST', 'https://a.klaviyo.com/api/events/', [
            'body' => '{"data":{"type":"event","attributes":{"properties":{"newKey":"New Value"},"time":"2022-11-08T00:00:00","metric":{"data":{"type":"metric","attributes":{"name":"Post Purchase Vidial"}}},"profile":{"data":{"type":"profile","attributes":{"email":"ali.swishtag@gmail.com","location":{"address1":"89 E 42nd St","address2":"1st floor","city":"New York","country":"United States","region":"NY","zip":"10017","timezone":"America/New_York","ip":"127.0.0.1"},"properties":{"newKey":"New Value"}},"meta":{"patch_properties":{"append":{"newKey":"New Value"},"unappend":{"newKey":"New Value"},"unset":"skus"}}}}}}}',
            'headers' => [
                'Authorization' => 'Klaviyo-API-Key pk_f79264c1cd85dae3902cb4874f0e1132da',
                'accept' => 'application/json',
                'content-type' => 'application/json',
                'revision' => '2023-10-15',
            ],
        ]);

        return $response->getBody()->getContents();
    }
}
