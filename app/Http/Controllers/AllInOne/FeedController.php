<?php

namespace App\Http\Controllers\AllInOne;

use App\Http\Controllers\Controller;
use App\Jobs\AllInOne\PCNAProductsJob;
use App\Models\AllInOne\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AllInOne\ExternalCharge;
use App\Models\AllInOne\ExternalChargePrice;
use App\Models\AllInOne\ExternalDecoration;
use App\Models\AllInOne\ExternalLocation;
use App\Models\AllInOne\ProductLocation;
use SoapClient;
use SoapFault;
use SoapHeader;

class FeedController extends Controller
{
    public function save_feed_json(Request $request)
    {
        PCNAProductsJob::dispatch();
        // Log::info("PCNA JOB STARTED SUCCESSFULLY");
        return sendResponse(true, "PCNA JOB STARTED SUCCESSFULLY");
    }

    public function setup_feeds(Request $request)
    {
        $product = Product::where('product_id', $request->product_id)->first();

        if (empty($product))
            return sendResponse(false, "Product Not Found");

        $product_handle = ProductLocation::with([
            'location_conn.decoration_conn.charge_conn.charge_price_conn'
        ])->where('product_handle', $product->product_handle)->get();

        return sendResponse(true, "Feeds Setup Started.", $product_handle);
    }

    public function separate_run(Request $request)
    {
        $handle = $request->handle;

        $username = 'CUSTOMINK';
        $password = 'nstMG0]c+DP$-*rD4IreR2rlE#0XCp/g3e74$gz1h#Xz9%L%TxLjgI1uPDX4K:u';

        $apiUrl = 'https://pspriceconfig100.pcna.online/psPriceConfig.svc?wsdl';

        $client = new SoapClient($apiUrl, array('trace' => 1));

        $authHeader = new SoapHeader(
            'http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/SharedObjects/',
            'Credentials',
            array('Username' => $username, 'Password' => $password),
            false
        );

        $client->__setSoapHeaders(array($authHeader));

        function generateFeed($handle, $second_check, $username, $password, $client)
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
                        }
                    }
                }
            }
        }

        try {

            $getFobPoints = array(
                'wsVersion' => '1.0.0',
                'id' => $username,
                'password' => $password,
                'productId' => $handle,
                'localizationCountry' => 'US',
                'localizationLanguage' => 'en',
            );

            // Log::info("######### START #########");

            $response_up = $client->getFobPoints($getFobPoints);
            // Log::info(json_encode($response_up));

            if (is_array($response_up->FobPointArray->FobPoint)) {
                foreach ($response_up->FobPointArray->FobPoint as $key => $fob) {
                    $second_check = $fob->fobId;
                    generateFeed($handle, $second_check, $username, $password, $client);
                }
            } else {
                $second_check = $response_up->FobPointArray->FobPoint->fobId;
                generateFeed($handle, $second_check, $username, $password, $client);
            }


            return "LONG RUNNING DEBOSS COMPLETED PROCESS";
        } catch (SoapFault $e) {
            return "Error: " . $e->getMessage();
        }
    }
}
