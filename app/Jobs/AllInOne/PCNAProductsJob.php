<?php

namespace App\Jobs\AllInOne;

use App\Models\AllInOne\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use SoapClient;
use SoapFault;
use SoapHeader;

class PCNAProductsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $data;
    public $timeout = 9999999999999999;
    public $tries = 2;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {
        
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $username = 'CUSTOMINK';
        $password = 'nstMG0]c+DP$-*rD4IreR2rlE#0XCp/g3e74$gz1h#Xz9%L%TxLjgI1uPDX4K:u';

        $apiUrl = 'https://psproductdata200.pcna.online/psProductData.svc?wsdl';

        $client = new SoapClient($apiUrl, array('trace' => 1));

        $authHeader = new SoapHeader(
            'http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/SharedObjects/',
            'Credentials',
            array('Username' => $username, 'Password' => $password),
            false
        );

        $client->__setSoapHeaders(array($authHeader));

        $GetProductSellable = array(
            'wsVersion' => '2.0.0',
            'id' => $username,
            'password' => $password,
            'localizationCountry' => 'US',
            'localizationLanguage' => 'en',
            'isSellable' => true,
        );


        try {

            $finalized_second = [];
            $response = $client->GetProductSellable($GetProductSellable);

            // Log::info(json_encode($response));

            foreach ($response->ProductSellableArray->ProductSellable as $key => $product) {

                if (!in_array($product->productId, $finalized_second)) {
                    $finalized_second[] = $product->productId;
                }
            }

            // Log::info($finalized_second);

            $products = Product::whereIn('product_handle', $finalized_second)->groupBy('product_handle');
            $products = $products->pluck('product_handle');
            foreach ($products as $key => $handle) {
                PCNAProductsSeparatedJob::dispatch($handle);
            }

            //
        } catch (SoapFault $e) {
            return "Error: " . $e->getMessage();
        }
    }
}
