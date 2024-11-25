<?php

namespace App\Traits\InConnect;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\InConnect\DecoratorLocation;
use App\Models\InConnect\DecoratorService;
use App\Models\InConnect\ShopifyVendorVendor;
use App\Models\AllInOne\ProductVariant;

trait IdexTrait
{
    private function replaceSkuWithIntactItemIdIdex($sku)
    {
      $exist = ProductVariant::where('sku', $sku)->whereNotNull('intacct_item_id')->first();
      if($exist){
        return $exist->intacct_item_id;
      }
      return '';
    }

    public function getAccessToken()
    {
        $client_id = env('IDEX_CLIENT_ID');
        $client_secret = env('IDEX_CLIENT_SECRET');
        $password = env('IDEX_PASSWORD');
        $username = env('IDEX_USERNAME');
        $json = <<<JSON
        {
            "client_id": "$client_id",
            "client_secret": "$client_secret",
            "grant_type": "password",
            "password": "$password",
            "username": "$username"
        }
        JSON;
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post('https://portal.idexint.com/oauth/token', json_decode($json, true));
        $data = $response->json();
        return $data['access_token'];
    }

    public function idexLineItemsProcess($user, $shopifyOrder, $inconnectOrder, $order, $gooselyRule, $customIdex = false, $onlyTest = false, $idexFast = false, $idexToken = false){

        $access_token = !$idexToken ? $this->getAccessToken() : $idexToken;

        $refined_note_attributes = collect($shopifyOrder->note_attributes);
        $dont_send_attn = $refined_note_attributes->where('name', "PO ID")->first();

        $decorator = $user->inconnect_account->decorators()->first();
        $inconnectOrder->update([
            'decorator_id' => $decorator->id,
        ]);

        $update = $inconnectOrder->updates()->updateOrCreate([
            'name' => 'Purchase Order for ' . $decorator->name,
            'type' => 'sent_to_decorator'
        ], [
            'initiated_at' => now()
        ]);

        $ignored_products = $user->inconnect_account->ignored_products;
        $final_ignored_list = [];
        foreach ($ignored_products as $ignored_product) {
            array_push($final_ignored_list, $ignored_product->product_origin->product_id);
        }

        $ignored_product_types = $user->inconnect_account->ignored_product_types;
        $final_ignored_product_type_list = [];
        foreach ($ignored_product_types as $ignored_product_type) {
            array_push($final_ignored_product_type_list, $ignored_product_type->name);
        }

        $poly_bag = false;
        if ($decorator->pivot->poly_bag)
            $poly_bag = true;

        $vendor_stock_general = false;
        if ($decorator->vendor_stock_status)
            $vendor_stock_general = true;

        $no_data_product_type_status_general = false;
        if ($decorator->pivot->no_data_product_type_status)
            $no_data_product_type_status_general = true;

        $due_date = calculateDueDate($decorator->pivot->due_date_days, explode(",", $decorator->excluded_dates), $decorator->sat_sun_exclude);
        // logger($due_date);

        $po_number = $decorator->po_prefix . removeHash($shopifyOrder->name);
        if ($inconnectOrder->is_vip) {
            $po_number = $decorator->po_prefix . removeHash($shopifyOrder->name) . ' - VIP';
        }

        $decorator_process = $user->inconnect_account->decorator_sync;

        $idexProcess = $decorator->id == 2 ? true : false;

        $shippingAddress = $shopifyOrder->shipping_address;
        $defaultAddress = $shopifyOrder->customer->default_address;

        $payload = [
            'purchaseOrder' => $po_number,
            'dateDue' => $due_date,
            'jobName' => $decorator->po_prefix . $shopifyOrder->name,
            'design' => '1',
            'new' => '2',
            'ship' => '1',
            'priority' => '0',
            'splitShipment' => '0',
            'type' => '1',
            'customerID' => '46499100-dc6e-4617-baca-093fa787c15f',
            'shippingCarrierID' => '1',
            'shippingMethodID' => '1',
            'customNote' => $shopifyOrder->note,
            'shipAddressCompanyName' => $shippingAddress ? $shippingAddress->company : $defaultAddress->company,
            'shipAddressAttention' => $dont_send_attn ? '' : ($shippingAddress ? $shippingAddress->name : $defaultAddress->name),
            'shipAddressLine1' => $shippingAddress ? $shippingAddress->address1 : $defaultAddress->address1,
            'shipAddressLine2' => $shippingAddress ? $shippingAddress->address2 : $defaultAddress->address2,
            'shipAddressCity' => $shippingAddress ? $shippingAddress->city : $defaultAddress->city,
            'shipAddressState' => $shippingAddress ? $shippingAddress->province_code : $defaultAddress->province_code,
            'shipAddressPostalCode' => $shippingAddress ? $shippingAddress->zip : $defaultAddress->zip,
            'shipAddressCountry' => $shippingAddress ? $shippingAddress->country_code : $defaultAddress->country_code,
            'line_items' => [
                [
                    'color' => 'White',
                    'description' => 'T-Shirt',
                    'productItemNumber' => 'G5000',
                    'quantity' => '2',
                    'sizeLG' => '1',
                    'sizeMD' => '',
                    'sizeOSFA' => '',
                    'sizeOther' => '',
                    'sizeSM' => '',
                    'sizeXL' => '',
                    'sizeXS' => '',
                    'sizeXXL' => '',
                    'sizeXXXL' => '',
                    'size4XL' => '',
                    'size5XL' => '',
                    'shipAddressCompanyName' => '',
                    'shipAddressAttention' => '',
                    'shipAddressLine1' => '',
                    'shipAddressLine2' => '',
                    'shipAddressCity' => '',
                    'shipAddressState' => '',
                    'shipAddressPostalCode' => '',
                    'shipAddressCountry' => '',
                    'decoratingLocations' => [
                        [
                            'imageLocationID' => '1',
                            'designName' => 'x123456',
                            'itemOptions' => [],
                            'itemServiceID' => '2',
                            "personalization" => [],
                            'specialInstructions' => 'no special instructions'
                        ]
                    ]
                ]
            ]
        ];


        $shippings = $user->inconnect_account->decorators->first()->pivot->shippings()->get()->each(function ($item) {
            $item->shipping_origin;
        })->toArray();

        $selected_shiping_info = false;
        if (count($shopifyOrder->shipping_lines) > 0) {
            foreach ($shippings as $shipping) {
                if ($shipping['shipping_origin']['title'] == $shopifyOrder->shipping_lines[0]->title) {
                    $selected_shiping_info = $shipping;
                }
            }
        } else {
            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'type' => 'info',
                'description' => 'No Shipping Lines for Order ' . $shopifyOrder->name . " for decorator."
            ]);
        }

        if ($selected_shiping_info) {
            $payload['shippingAccountNumber'] = $selected_shiping_info['3p_account_number'];
            $payload['shippingCarrierID'] = $selected_shiping_info['carrier_id'];
            $payload['shippingMethodID'] = $selected_shiping_info['method_id'];
        } else {
            $payload['shippingAccountNumber'] = 'H7R603';
            $payload['shippingCarrierID'] = '1';
            $payload['shippingMethodID'] = '1';
        }

        $vendors_allowed_processing = ShopifyVendorVendor::whereHas('vendor', function ($q) {
            $q->where('allow_processing', TRUE);
        })->get()->pluck('vendor.name')->toArray();

        $line_items = [];
        $sage_items = [];

        foreach ($order['original']['body']['data']['order']['lineItems']['edges'] as $key => $item) {

            if (!isset($item['node']['product'])) {
                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Product does not exist anywhere for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                continue;
            }

            $vendor_stock_status = false;
            if ($vendor_stock_general) {
                $shippings = $decorator->vendor_stocks()->get()->each(function ($item_inside) use (&$vendor_stock_status, $item) {
                    if ($item_inside->shopify_vendor->name == $item['node']['product']['vendor'])
                        $vendor_stock_status = true;
                });
            }

            $no_data_product_type_status = false;
            if ($no_data_product_type_status_general) {
                $shippings = $decorator->pivot->no_data_product_types()->get()->each(function ($item_inside) use (&$no_data_product_type_status, $item) {
                    if ($item_inside->product_type->name == $item['node']['product']['productType'])
                        $no_data_product_type_status = true;
                });
            }

            $line_item = [];
            if (in_array($item['node']['product']['legacyResourceId'], $final_ignored_list)) {
                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Ignored Product ' . $item['node']['product']['title'] . ' for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                continue;
            }

            if (!in_array($item['node']['product']['vendor'], $vendors_allowed_processing)) {
                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Vendor ' . $item['node']['product']['vendor'] . ' is not allowed for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                continue;
            }

            if (in_array($item['node']['product']['productType'], $final_ignored_product_type_list)) {
                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Ignored Product ' . $item['node']['product']['productType'] . ' Type for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                continue;
            }

            // JUST PUT A CHECK ON $item['node']['variant'] IT VARIANT IS DELETED THEN DONT CONSIDER IT ANYTHING. IT WAS CREATING ISSUE DURING FULFILLMENT
            if ($item['node']['variant'] && $item['node']['variant']['sku'] == '2nd-Logo') {
                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Logo Charges skipped for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                continue;
            }

            $line_item['line_item_id'] = str_replace('gid://shopify/LineItem/', '', $item['node']['id']);
            $line_item['productItemNumber'] = $item['node']['variant']['sku'] ?? '';
            $line_item['description'] = $item['node']['title'];
            $line_item['quantity'] = (string) $item['node']['quantity'];

            $size_from_order = false;
            if($item['node']['variant']) {
                foreach ($item['node']['variant']['selectedOptions'] as $option) {
                    if ($option['name'] == 'Color') {
                        $line_item['color'] = $option['value'];
                    }
                    if ($option['name'] == 'Size') {
                        $sizes = $decorator->sizes()->get();
                        foreach ($sizes as $size) {
                            $shopify_size = $size->shopifySizes()->where('name', $option['value'])->first();
                            if ($shopify_size) {
                                // $line_item[$size->name] = (string) $item['node']['quantity'];
                                $line_item['size' . $size->name] = (string) $item['node']['quantity'];
                                $size_from_order = true;
                            }
                        }
                    }
                }
            }

            $line_item['shipAddressCompanyName'] = $shippingAddress ? $shippingAddress->company : $defaultAddress->company;
            $line_item['shipAddressAttention'] = $dont_send_attn ? '' : ($shippingAddress ? $shippingAddress->name : $defaultAddress->name);
            $line_item['shipAddressLine1'] = $shippingAddress ? $shippingAddress->address1 : $defaultAddress->address1;
            $line_item['shipAddressLine2'] = $shippingAddress ? $shippingAddress->address2 : $defaultAddress->address2;
            $line_item['shipAddressCity'] = $shippingAddress ? $shippingAddress->city : $defaultAddress->city;
            $line_item['shipAddressState'] = $shippingAddress ? $shippingAddress->province_code : $defaultAddress->province_code;
            $line_item['shipAddressPostalCode'] = $shippingAddress ? $shippingAddress->zip : $defaultAddress->zip;
            $line_item['shipAddressCountry'] = $shippingAddress ? $shippingAddress->country_code : $defaultAddress->country_code;

            $sage_item['item_id'] = $this->replaceSkuWithIntactItemIdIdex($item['node']['variant']['sku'] ?? '');
            $sage_item['quantity'] = $item['node']['quantity'];
            $sage_item['price'] = 0;
            $sage_item['location_id'] = $decorator->intactLocation->location_id;
            $sage_item['department_id'] = $decorator->intactDepartment->department_id;
            $sage_item['class_id'] = $user->inconnect_account->intact_class->class_id;
            $sage_items[] = $sage_item;

            if (!$decorator_process) {
                $line_items[] = $line_item;
                continue;
            }

            if (!$idexProcess) {
                $line_items[] = $line_item;
                continue;
            }

            $properties = collect($item['node']['customAttributes']);
            // logger(json_encode($properties));
            if ($customIdex) {
                $newProperties = json_decode(json_encode($shopifyOrder->line_items[$key]->properties), true);
                $newProperties = collect($newProperties);
                $properties = $properties->merge($newProperties);
            }
            // logger(json_encode($properties));

            $decoratorLogoLocations = $decorator->logoLocationPhrases()->get()->pluck('decoratorData')->flatten()->pluck('name')->toArray();
            $decoratorSecondLogoLocations = $decorator->secondLogoLocationPhrases()->get()->pluck('decoratorData')->flatten()->pluck('name')->toArray();
            $decoratorLogoPhrases = $decorator->logoPhrases()->get()->pluck('decoratorData')->flatten()->pluck('name')->toArray();
            $decoratorSecondLogoPhrases = $decorator->secondLogoPhrases()->get()->pluck('decoratorData')->flatten()->pluck('name')->toArray();
            $decoratorDecorations = $decorator->decorations()->get()->pluck('decoratorData')->flatten()->pluck('name')->toArray();
            $customDecorations = $decorator->customDecorations()->get()->pluck('name')->toArray();

            $logoLocation = $properties->whereIn('key', $decoratorLogoLocations)->first();
            $secondLogoLocation = $properties->whereIn('key', $decoratorSecondLogoLocations)->first();
            $logoPreferences = $properties->whereIn('key', $decoratorLogoPhrases)->first();
            $secondLogoPreferences = $properties->whereIn('key', $decoratorSecondLogoPhrases)->first();
            $service = $properties->whereIn('key', $decoratorDecorations)->first();

            //PERSONALIZATION LOGO CHECK
            $personalization_location = $properties->where('key', "Personalization Location")->first();

            $decoratorPersonalizations = $decorator->personalizationInputs()->get()->pluck('decoratorData')->flatten();

            $personalization_done = null;
            foreach ($decoratorPersonalizations as $personalization) {
                $personalization_done = $properties->where('key', $personalization->name . " 1")->first();
                if ($personalization_done) {
                    $personalization_done = $personalization;
                    break;
                }
            }

            $personalization_array = [];

            for ($i = 1; $i <= $personalization_done?->count ?? 0; $i++) {
                $personalizationValue = $properties->where('key', $personalization_done->name . " " . $i)->first();
                $personalizationFont = $properties->where('key', $personalization_done->name . " " . $i . " Font")->first();
                $personalizationFontSize = $properties->where('key', $personalization_done->name . " " . $i . " Font Size")->first();
                $personalizationColor = $properties->where('key', $personalization_done->name . " Line " . $i . " Threads")->first();
                $personalization_array['line' . $i . 'Font'] = trim($personalizationFont['value'] ?? '');
                $personalization_array['line' . $i . 'Size'] = trim($personalizationFontSize['value'] ?? '');
                $personalization_array['line' . $i . 'Value'] = trim($personalizationValue['value'] ?? '');
                $personalization_array['line' . $i . 'Color'] = trim($personalizationColor['value'] ?? '');
            }

            $screen_print = $properties->where('key', "Decoration")->first();
            $screen_print_value = "";

            if ($screen_print) {
                $screen_print_value = trim($screen_print['value']);
                if (!$logoLocation && !in_array($screen_print_value, $customDecorations) && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                    !$update->completed_at && $update->update([
                        'failed_at' => now(),
                        'tries' => $update->tries + 1,
                        'retry' => 1
                    ]);

                    $inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'priority' => TRUE,
                        'description' => 'Logo Location, Custom Decoration, Direct Vendors, Missing for Order ' . $shopifyOrder->name . " for decorator. 1)"
                    ]);

                    return [ "success" => false, "message" => "kill the job" ];
                }
            }

            if (!$logoLocation && !$screen_print && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1,
                    'retry' => 1
                ]);

                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'priority' => TRUE,
                    'description' => 'Logo Location, Custom Decoration, Direct Vendors, Missing for Order ' . $shopifyOrder->name . " for decorator. 2)"
                ]);

                return [ "success" => false, "message" => "kill the job" ];
            }

            // logger(json_encode($logoPreferences));
            // logger(json_encode($vendor_stock_status));
            // logger(json_encode($no_data_product_type_status));
            // logger(json_encode($personalization_location));

            if (!$logoPreferences && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1,
                    'retry' => 1
                ]);

                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'priority' => TRUE,
                    'description' => 'Logo Location, Custom Decoration, Direct Vendors, Missing for Order ' . $shopifyOrder->name . " for decorator. 3)"
                ]);

                return [ "success" => false, "message" => "kill the job" ];
            }
            if (!$service && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1,
                    'retry' => 1
                ]);

                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'priority' => TRUE,
                    'description' => 'Logo Location, Custom Decoration, Direct Vendors, Missing for Order ' . $shopifyOrder->name . " for decorator. 4)"
                ]);

                return [ "success" => false, "message" => "kill the job" ];
            }

            // BELOW CODE IS COMPULSORY #####
            $decoratorService = DecoratorService::whereHas('decoratorData', function ($q) use ($service) {
                $q->where('name', trim(@$service['value']));
            })->where('decorator_id', $decorator->id)->first();

            $decoratorLocation = DecoratorLocation::where('decorator_service_id', $decoratorService?->id)->get();

            $location_id_final = '';
            foreach ($decoratorLocation as $key => $location) {
                if ($location->shopify_location->name == trim($logoLocation['value'] ?? ''))
                    $location_id_final = $location->location_id;
            }

            if ($location_id_final == '' && !in_array($screen_print_value, $customDecorations) && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1,
                    'retry' => 1
                ]);

                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'priority' => TRUE,
                    'description' => 'Location is not available against decoration service for Order ' . $shopifyOrder->name . " for decorator."
                ]);

                return [ "success" => false, "message" => "kill the job" ];
            }

            $option_ids = collect(@$decoratorService->option_ids)->pluck('id')->toArray();
            // ABOVE CODE IS COMPULSORY #####

            if ($personalization_location) {

                $location = $decoratorService->locations()->whereHas('decoratorData', function ($q) use ($personalization_location) {
                    $q->where('name', trim($personalization_location['value']));
                })->first();

                if ($location) {
                    $line_item['decoratingLocations'][] = [
                        'imageLocationID' => (int)$location->location_id,
                        'designName' => isset($logoPreferences['value']) ? ($decorator->pivot->location_to_logo ? trim($logoPreferences['value'] . $location_id_final) : trim($logoPreferences['value'])) : 'personalization',
                        'itemOptions' => [],
                        'itemServiceID' => 9,
                        'personalization' => $personalization_array,
                        'specialInstructions' => $shopifyOrder->note
                    ];
                }
            }

            if (!$vendor_stock_status && !$no_data_product_type_status && $logoPreferences) {
                $line_item['decoratingLocations'][] = [
                    'imageLocationID' => in_array($screen_print_value, $customDecorations) ? 13 : (int) $location_id_final,
                    'designName' => $decorator->pivot->location_to_logo ? trim($logoPreferences['value'] . $location_id_final) : trim($logoPreferences['value']),
                    'itemOptions' => $option_ids,
                    'itemServiceID' => in_array($screen_print_value, $customDecorations) ? 6 : ((int) $decoratorService?->service_id ?? ''),
                    'personalization' => [],
                    'specialInstructions' => $shopifyOrder->note
                ];
            } else {

                if($no_data_product_type_status || !$size_from_order)
                    $line_item['sizeOther'] = (string) $item['node']['quantity'];

                $temp_line_item = [
                    'imageLocationID' => in_array($screen_print_value, $customDecorations) ? 13 : ($location_id_final != '' ? (int) $location_id_final : 13),
                    'itemOptions' => $option_ids,
                    'itemServiceID' => '12',
                    'personalization' => [],
                    'specialInstructions' => 'Other Hardgoods Fulfillment'
                ];

                if (isset($logoPreferences['value']))
                    $temp_line_item['designName'] = $decorator->pivot->location_to_logo ? trim($logoPreferences['value'] . $location_id_final) : trim($logoPreferences['value']);

                $line_item['decoratingLocations'][] = $temp_line_item;
                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Vendor Stock Enabled, No Data Product Enabled for order ' . $shopifyOrder->name . " for decorator."
                ]);
            }

            //SECOND LOGO CHECK
            if ($secondLogoLocation && $secondLogoPreferences) {

                $location_id_final = '';
                foreach ($decoratorLocation as $key => $location) {
                    if ($location->shopify_location->name == trim($secondLogoLocation['value'] ?? ''))
                        $location_id_final = $location->location_id;
                }

                if ($location_id_final == '' && $screen_print['value'] != 'Screen Print' && !$vendor_stock_status && !$no_data_product_type_status) {

                    !$update->completed_at && $update->update([
                        'failed_at' => now(),
                        'tries' => $update->tries + 1,
                        'retry' => 1
                    ]);

                    $inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'priority' => TRUE,
                        'description' => 'Location is not available against decoration service for Order ' . $shopifyOrder->name . " for decorator for 2nd logo."
                    ]);

                    return [ "success" => false, "message" => "kill the job" ];
                }

                if (!$vendor_stock_status && !$no_data_product_type_status) {
                    $line_item['decoratingLocations'][] = [
                        'imageLocationID' => in_array($screen_print_value, $customDecorations) ? 13 : (int) $location_id_final,
                        'designName' => $decorator->pivot->location_to_logo ? trim($secondLogoPreferences['value'] . $location_id_final) : trim($secondLogoPreferences['value']),
                        'itemOptions' => $option_ids,
                        'itemServiceID' => in_array($screen_print_value, $customDecorations) ? 6 : ((int) $decoratorService?->service_id ?? ''),
                        'personalization' => [],
                        'specialInstructions' => $shopifyOrder->note
                    ];
                } else {

                    if($no_data_product_type_status || !$size_from_order)
                        $line_item['sizeOther'] = (string) $item['node']['quantity'];

                    $temp_line_item = [
                        'imageLocationID' => in_array($screen_print_value, $customDecorations) ? 13 : ($location_id_final != '' ? (int) $location_id_final : 13),
                        'itemOptions' => $option_ids,
                        'itemServiceID' => '12',
                        'personalization' => [],
                        'specialInstructions' => 'Other Hardgoods Fulfillment'
                    ];

                    if (isset($secondLogoPreferences['value']))
                        $temp_line_item['designName'] = $decorator->pivot->location_to_logo ? trim($secondLogoPreferences['value'] . $location_id_final) : trim($secondLogoPreferences['value']);

                    $line_item['decoratingLocations'][] = $temp_line_item;
                    $inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'type' => 'info',
                        'description' => 'Vendor Stock Enabled for order ' . $shopifyOrder->name . " for decorator."
                    ]);
                }
            }

            //POLY BAG CHECK
            if ($poly_bag) {
                $line_item['decoratingLocations'][] = [
                    'imageLocationID' => 13,
                    'designName' => '',
                    'itemOptions' => [],
                    'itemServiceID' => 3,
                    'personalization' => [],
                    'specialInstructions' => "No Special Instructions"
                ];
            }

            $line_items[] = $line_item;
        }

        if (count($line_items) <= 0) {

            !$update->completed_at && $update->update([
                'completed_at' => now(),
                'failed_at' => null,
                'tries' => $update->tries + 1
            ]);

            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'No Line Items to Sync for Order ' . $shopifyOrder->name . " for decorator."
            ]);

            return [ "success" => false, "message" => "kill the job" ];
        }

        $payload['line_items'] = $line_items;

        $inconnectOrder->update([
            'idex_payload' => json_encode($payload),
        ]);

        return [
            "success" => true,
            "message" => "Idex processed Successfully",
            "payload" => $payload,
            "idex_process" => $idexProcess,
            "update" => $update,
            "decorator" => $decorator,
            "sage_items" => $sage_items
        ];
    }
}
