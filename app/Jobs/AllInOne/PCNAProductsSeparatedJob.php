<?php

namespace App\Jobs\AllInOne;

use App\Models\AllInOne\ExternalCharge;
use App\Models\AllInOne\ExternalChargePrice;
use App\Models\AllInOne\ExternalDecoration;
use App\Models\AllInOne\ExternalLocation;
use App\Models\AllInOne\ProductLocation;
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

class PCNAProductsSeparatedJob implements ShouldQueue
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
    public function __construct($handle)
    {
        $this->data = $handle;
    }

    /**
     * Execute the job.
     *
     * @return void
     */

    private function generateFeed($handle, $second_check, $username, $password, $client)
    {
        // Log::info($handle);
        // Log::info($second_check);

        $getConfigurationAndPricing = array(
            'wsVersion' => '1.0.0',
            'id' => $username,
            'password' => $password,
            'productId' => $handle,
            'fobId' => $second_check,
            'localizationCountry' => 'US',
            'localizationLanguage' => 'en',
            'currency' => 'USD',
            'priceType' => 'List',
            'configurationType' => 'Decorated',
        );

        // Log::info("######### START #########");

        $response = $client->getConfigurationAndPricing($getConfigurationAndPricing);

        // Log::info(json_encode($response));

        if (isset($response->Configuration->LocationArray->Location)) {

            foreach ($response->Configuration->LocationArray->Location as $key => $location) {

                if (is_object($location)) {

                    if (!isset($location->Decoration)) {

                        // Log::info("NEW LOCATION NEW NEW");

                        $new_location = ExternalLocation::updateOrCreate(
                            ['location_id' => $location->locationId],
                            [
                                'location_name' => $location->locationName,
                                'location_rank' => $location->locationRank,
                            ]
                        );

                        $new_product_location = ProductLocation::updateOrCreate(
                            [
                                'product_handle' => $handle,
                                'external_location_id' => $new_location->id,
                            ]
                        );

                        if (is_array($location->DecorationArray->Decoration)) {
                            foreach ($location->DecorationArray->Decoration as $key => $decoration) {
                                $new_decoration = ExternalDecoration::updateOrCreate(
                                    [
                                        'external_location_id' =>  $new_location->id,
                                        'decoration_id' => $decoration->decorationId
                                    ],
                                    [
                                        'decoration_name' => $decoration->decorationName,
                                        'decoration_default' => $decoration->defaultDecoration,
                                    ],
                                );

                                foreach ($decoration->ChargeArray->Charge as $key => $charge) {
                                    $new_charge = ExternalCharge::updateOrCreate(
                                        [
                                            'external_decoration_id' => $new_decoration->id,
                                            'charge_id' => $charge->chargeId
                                        ],
                                        [
                                            'charge_name' => $charge->chargeName
                                        ],
                                    );

                                    if (is_array($charge->ChargePriceArray->ChargePrice)) {
                                        foreach ($charge->ChargePriceArray->ChargePrice as $key => $charge_price) {
                                            ExternalChargePrice::updateOrCreate(
                                                [
                                                    'external_charge_id' => $new_charge->id,
                                                    'charge_price' => $charge_price->price,
                                                ]
                                            );
                                        }
                                    } elseif (is_object($charge->ChargePriceArray->ChargePrice)) {
                                        ExternalChargePrice::updateOrCreate(
                                            [
                                                'external_charge_id' => $new_charge->id,
                                                'charge_price' => $charge->ChargePriceArray->ChargePrice->price,
                                            ]
                                        );
                                    }
                                }
                            }
                        } elseif (is_object($location->DecorationArray->Decoration)) {

                            $new_decoration = ExternalDecoration::updateOrCreate(
                                [
                                    'external_location_id' =>  $new_location->id,
                                    'decoration_id' => $location->DecorationArray->Decoration->decorationId
                                ],
                                [
                                    'decoration_name' => $location->DecorationArray->Decoration->decorationName,
                                    'decoration_default' => $location->DecorationArray->Decoration->defaultDecoration,
                                ],
                            );

                            foreach ($location->DecorationArray->Decoration->ChargeArray->Charge as $key => $charge) {
                                $new_charge = ExternalCharge::updateOrCreate(
                                    [
                                        'external_decoration_id' => $new_decoration->id,
                                        'charge_id' => $charge->chargeId
                                    ],
                                    [
                                        'charge_name' => $charge->chargeName
                                    ],
                                );

                                if (is_array(@$charge->ChargePriceArray->ChargePrice)) {
                                    foreach ($charge->ChargePriceArray->ChargePrice as $key => $charge_price) {
                                        ExternalChargePrice::updateOrCreate(
                                            [
                                                'external_charge_id' => $new_charge->id,
                                                'charge_price' => $charge_price->price,
                                            ]
                                        );
                                    }
                                } elseif (is_object(@$charge->ChargePriceArray->ChargePrice)) {
                                    ExternalChargePrice::updateOrCreate(
                                        [
                                            'external_charge_id' => $new_charge->id,
                                            'charge_price' => $charge->ChargePriceArray->ChargePrice->price,
                                        ]
                                    );
                                }
                            }
                        }
                    } else {

                        // Log::info("OLD LOCATION");
                        // Log::info(json_encode($location));

                        $new_location = ExternalLocation::updateOrCreate(
                            ['location_id' => 247178],
                            [
                                'location_name' => 'Default Location',
                                'location_rank' => 1
                            ]
                        );

                        $new_product_location = ProductLocation::updateOrCreate(
                            [
                                'product_handle' => $handle,
                                'external_location_id' => $new_location->id,
                            ]
                        );

                        if (is_array($location->Decoration)) {

                            foreach ($location->Decoration as $key => $decoration) {

                                $new_decoration = ExternalDecoration::updateOrCreate(
                                    [
                                        'external_location_id' =>  $new_location->id,
                                        'decoration_id' => $decoration->decorationId
                                    ],
                                    [
                                        'decoration_name' => $decoration->decorationName,
                                        'decoration_default' => $decoration->defaultDecoration,
                                    ],
                                );

                                foreach ($decoration->ChargeArray->Charge as $key => $charge) {

                                    $new_charge = ExternalCharge::updateOrCreate(
                                        [
                                            'external_decoration_id' => $new_decoration->id,
                                            'charge_id' => $charge->chargeId
                                        ],
                                        [
                                            'charge_name' => $charge->chargeName
                                        ],
                                    );

                                    if (is_array($charge->ChargePriceArray->ChargePrice)) {

                                        foreach ($charge->ChargePriceArray->ChargePrice as $key => $charge_price) {

                                            ExternalChargePrice::updateOrCreate(
                                                [
                                                    'external_charge_id' => $new_charge->id,
                                                    'charge_price' => $charge_price->price,
                                                ]
                                            );
                                        }
                                    } elseif (is_object($charge->ChargePriceArray->ChargePrice)) {

                                        ExternalChargePrice::updateOrCreate(
                                            [
                                                'external_charge_id' => $new_charge->id,
                                                'charge_price' => $charge->ChargePriceArray->ChargePrice->price,
                                            ]
                                        );
                                    }
                                }
                            }
                        } elseif (is_object($location->Decoration)) {

                            $new_decoration = ExternalDecoration::updateOrCreate(
                                [
                                    'external_location_id' =>  $new_location->id,
                                    'decoration_id' => $location->Decoration->decorationId
                                ],
                                [
                                    'decoration_name' => $location->Decoration->decorationName,
                                    'decoration_default' => $location->Decoration->defaultDecoration,
                                ],
                            );

                            foreach ($location->Decoration->ChargeArray->Charge as $key => $charge) {

                                $new_charge = ExternalCharge::updateOrCreate(
                                    [
                                        'external_decoration_id' => $new_decoration->id,
                                        'charge_id' => $charge->chargeId
                                    ],
                                    [
                                        'charge_name' => $charge->chargeName
                                    ],
                                );

                                if (is_array(@$charge->ChargePriceArray->ChargePrice)) {

                                    foreach ($charge->ChargePriceArray->ChargePrice as $key => $charge_price) {

                                        ExternalChargePrice::updateOrCreate(
                                            [
                                                'external_charge_id' => $new_charge->id,
                                                'charge_price' => $charge_price->price,
                                            ]
                                        );
                                    }
                                } elseif (is_object(@$charge->ChargePriceArray->ChargePrice)) {

                                    ExternalChargePrice::updateOrCreate(
                                        [
                                            'external_charge_id' => $new_charge->id,
                                            'charge_price' => $charge->ChargePriceArray->ChargePrice->price,
                                        ]
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public function handle()
    {
        $handle = $this->data;

        $username = 'CUSTOMINK';
        $password = 'nstMG0]c+DP$-*rD4IreR2rlE#0XCp/g3e74$gz1h#Xz9%L%TxLjgI1uPDX4K:u';

        $apiUrl = 'https://pspriceconfig100.pcna.online/psPriceConfig.svc?wsdl';
    
        try {
            // Create SoapClient with options to handle errors and log
            $client = new SoapClient($apiUrl, [
                'trace' => 1,
                'cache_wsdl' => WSDL_CACHE_NONE, // Disable caching in case WSDL changes
                'stream_context' => stream_context_create([
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                    ]
                ])
            ]);
    
            $authHeader = new SoapHeader(
                'http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/SharedObjects/',
                'Credentials',
                ['Username' => $username, 'Password' => $password],
                false
            );
    
            $client->__setSoapHeaders([$authHeader]);
    
            // Prepare parameters for the API call
            $getFobPoints = [
                'wsVersion' => '1.0.0',
                'id' => $username,
                'password' => $password,
                'productId' => $handle,
                'localizationCountry' => 'US',
                'localizationLanguage' => 'en',
            ];

            // Make the SOAP request
            $response_up = $client->getFobPoints($getFobPoints);

            // Handle the response
            if (is_array($response_up->FobPointArray->FobPoint)) {
                foreach ($response_up->FobPointArray->FobPoint as $fob) {
                    $second_check = $fob->fobId;
                    $this->generateFeed($handle, $second_check, $username, $password, $client);
                }
            } else {
                $second_check = $response_up->FobPointArray->FobPoint->fobId;
                $this->generateFeed($handle, $second_check, $username, $password, $client);
            }


            return "LONG RUNNING DEBOSS COMPLETED PROCESS";
        } catch (SoapFault $e) {
            // Log the error details
            Log::error("SOAP Error: " . $e->getMessage());
        } catch (Exception $e) {
            // Catch any other generic exceptions
            Log::error("General Error: " . $e->getMessage());
        }
    }
}
