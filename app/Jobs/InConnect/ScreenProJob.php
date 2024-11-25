<?php

namespace App\Jobs\InConnect;

use App\Models\InConnect\DecoratorLocation;
use App\Models\InConnect\DecoratorService;
use App\Models\InConnect\ShopifyVendorVendor;
use App\Traits\InConnect\ScreenProTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use App\Traits\GeneralTrait;

class ScreenProJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, ScreenProTrait, GeneralTrait;

    public $timeout = 600;
    public $tries = 2;

    private $user;
    private $data;
    private $inconnectOrder;
    private $order;
    private $gooselyRule;
    private $customScreenPro;
    private $onlyTest;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($user, $data, $inconnectOrder, $order, $gooselyRule, $customScreenPro = false, $onlyTest = false)
    {
        $this->onQueue('que_orders');

        $this->user = $user;
        $this->data = $data;
        $this->inconnectOrder = $inconnectOrder;
        $this->order = $order;
        $this->gooselyRule = $gooselyRule;
        $this->customScreenPro = $customScreenPro;
        $this->onlyTest = $onlyTest;
    }

    private function isObjectInArray($object, $array)
    {
        foreach ($array as $item) {
            if ($item == $object) {
                return true;
            }
        }
        return false;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->inconnectOrder->is_archived)
            return;

        $access_token = $this->getSPAccessToken();
        $user = $this->user;
        $shopifyOrder = $this->data;
        $order = $this->order;
        $gooselyRule = $this->gooselyRule;
        $customScreenPro = $this->customScreenPro;
        $onlyTest = $this->onlyTest;

        $refined_note_attributes = collect($shopifyOrder->note_attributes);
        $dont_send_attn = $refined_note_attributes->where('name', "PO ID")->first();

        $decorator = $user->inconnect_account->decorators()->first();
        $this->inconnectOrder->update([
            'decorator_id' => $decorator->id,
        ]);

        $update = $this->inconnectOrder->updates()->updateOrCreate([
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
        if ($this->inconnectOrder->is_vip) {
            $po_number = $decorator->po_prefix . removeHash($shopifyOrder->name) . ' - VIP';
        }

        $decorator_process = $user->inconnect_account->decorator_sync;

        $screenProProcess = $decorator->id == 4 ? true : false;

        $shippings = $user->inconnect_account->decorators->first()->pivot->shippings()->get()->each(function ($item) {
            $item->shipping_origin;
        })->toArray();

        $selected_shipping = false;
        if (count($shopifyOrder->shipping_lines) > 0) {
            foreach ($shippings as $shipping) {
                if ($shipping['shipping_origin']['title'] == $shopifyOrder->shipping_lines[0]->title) {
                    $selected_shipping = $shipping;
                }
            }
        } else {
            $this->inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'type' => 'info',
                'description' => 'No Shipping Lines for Order ' . $shopifyOrder->name . " for decorator."
            ]);
        }

        if ($selected_shipping) {
            $selected_shipping = $selected_shipping['3p_account_number'];
        }

        $vendors_allowed_processing = ShopifyVendorVendor::whereHas('vendor', function ($q) {
            $q->where('allow_processing', TRUE);
        })->get()->pluck('vendor.name')->toArray();

        $payload = [
            "ExtOrderID" => $po_number,
            "ExtSource" => "API",
            "ContactEmail" => $shopifyOrder->email,
            "ContactNameFirst" => $shopifyOrder->shipping_address->first_name,
            "ContactNameLast" => $shopifyOrder->shipping_address->last_name,
            "id_Customer" =>  1443, //$shopifyOrder->customer->id,
            "Customer" => [
                "CompanyName" => $shopifyOrder->shipping_address->company,
                "BillingCompany" => $shopifyOrder->shipping_address->company,
                "BillingAddress01" => $shopifyOrder->shipping_address->address1,
                "BillingCity" => $shopifyOrder->shipping_address->city,
                "BillingState" => $shopifyOrder->shipping_address->province_code,
                "BillingZip" => $shopifyOrder->shipping_address->zip,
                "BillingCountry" => $shopifyOrder->shipping_address->country_code,
            ],
            "CustomerPurchaseOrder" => $po_number,
            "Designs" => [
                [
                    "DesignName" => "Embroidery - Apparel",
                    "ExtDesignID" => "KCIWHT1",
                    "id_Design " => 0,
                    "Locations" => [
                        [
                            "Location" => "Left Chest",
                            "DesignCode" => "KCIWHT1"
                        ]
                    ],
                    "id_DesignType" => 2,
                    "id_Artist" => 3,
                ],
                [
                    "DesignName" => "",
                    "ExtDesignID" => "",
                    "id_Design " => "-",
                    "id_DesignType" => 8,
                    "id_Artist" => 3,
                ]
            ],
            "LinesOE" => [
                [
                    "Size" => "XS",
                    "Color" => "Black",
                    "PartNumber" => "K500",
                    "Description" => "Port Authority Silk Touch Polo",
                    "Qty" => 1,
                    "ExtDesignIDBlock" => "KCIWHT1",
                    "id_ProductClass" => 1
                ],
                [
                    "Size" => "",
                    "Color" => "Blue",
                    "PartNumber" => "PH2062",
                    "Description" => "3/4\" Full-color Polyester Lanyard",
                    "Qty" => 1,
                    "ExtDesignIDBlock" => "-",
                    "id_ProductClass" => 1
                ]
            ],
            "Notes" => [
                [
                    "Note" => $shopifyOrder->note ? $shopifyOrder->note : "",
                    "Type" => "Notes To Order"
                ]
            ],
            "ShippingAddresses" => [
                [
                    "ShipCompany" => $shopifyOrder->shipping_address->name,
                    "ShipMethod" => $selected_shipping ? $selected_shipping : "UPS Ground",
                    "ShipAddress01" => $shopifyOrder->shipping_address->address1,
                    "ShipAddress02" => $shopifyOrder->shipping_address->address2,
                    "ShipCity" => $shopifyOrder->shipping_address->city,
                    "ShipState" => $shopifyOrder->shipping_address->province_code,
                    "ShipZip" => $shopifyOrder->shipping_address->zip,
                    "ShipCountry" => $shopifyOrder->shipping_address->country_code,
                ]
            ]
        ];

        $LinesOE = [];
        $Designs = [];
        $sage_items = [];

        foreach ($order['original']['body']['data']['order']['lineItems']['edges'] as $key => $item) {

            if (!isset($item['node']['product'])) {
                $this->inconnectOrder->logs()->create([
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

            if (in_array($item['node']['product']['legacyResourceId'], $final_ignored_list)) {
                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Ignored Product ' . $item['node']['product']['title'] . ' for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                continue;
            }

            if (!in_array($item['node']['product']['vendor'], $vendors_allowed_processing)) {
                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Vendor ' . $item['node']['product']['vendor'] . ' is not allowed for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                continue;
            }

            if (in_array($item['node']['product']['productType'], $final_ignored_product_type_list)) {
                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Ignored Product ' . $item['node']['product']['productType'] . ' Type for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                continue;
            }


            if ($item['node']['variant']['sku'] == '2nd-Logo') {
                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Logo Charges skipped for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                continue;
            }

            $line_item = [];
            $design = [];

            $properties = collect($item['node']['customAttributes']);
            if ($customScreenPro) {
                $properties = json_decode(json_encode($shopifyOrder->line_items[$key]->properties), true);
                $properties = collect($properties);
            }
            // logger(json_encode($properties));

            $decoratorLogoLocations = $decorator->logoLocationPhrases()->get()->pluck('decoratorData')->flatten()->pluck('name')->toArray();
            $decoratorSecondLogoLocations = $decorator->secondLogoLocationPhrases()->get()->pluck('decoratorData')->flatten()->pluck('name')->toArray();
            $decoratorLogoPhrases = $decorator->logoPhrases()->get()->pluck('decoratorData')->flatten()->pluck('name')->toArray();
            $stitchCountPhrases = $decorator->logoPhrases()->get()->pluck('decoratorData')->flatten()->pluck('name')->toArray();
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

            $line_item['id_ProductClass'] = 1;
            $line_item['PartNumber'] = $item['node']['variant']['sku'];
            $line_item['Description'] = $item['node']['title'];
            $line_item['Qty'] = (int) $item['node']['quantity'];

            $size_from_order = false;
            foreach ($item['node']['variant']['selectedOptions'] as $option) {
                if ($option['name'] == 'Color') {
                    $line_item['Color'] = $option['value'];
                }
                if ($option['name'] == 'Size') {
                    $line_item['Size'] = $option['value'];
                    $size_from_order = true;
                }
            }

            $sage_item['item_id'] = $this->replaceSkuWithIntactItemId($item['node']['variant']['sku']);
            $sage_item['quantity'] = $item['node']['quantity'];
            $sage_item['price'] = 0;
            $sage_item['location_id'] = $decorator->intactLocation->location_id;
            $sage_item['department_id'] = $decorator->intactDepartment->department_id;
            $sage_item['class_id'] = $user->inconnect_account->intact_class->class_id;

            foreach ($stitchCountPhrases as $key => &$phrase) {
                $phrase = $phrase . " Stitch Count";
            }
            $stitch_count = $properties->whereIn('key', $stitchCountPhrases)->first();
            $sage_item['stitch_count'] = $stitch_count ? (int) $stitch_count['value'] : 0;
            $sage_items[] = $sage_item;

            if (!$decorator_process) {
                $LinesOE[] = $line_item;
                // THIS IS COMMENTED AS DISCUSSED IF NO DESIGN OR DUPLICATE DESIGN IS COMING THEN DONT ADD ITS DESIGN BLANK OR COPY OF EXISTING
                // $Designs[] = [
                //     "DesignName" => "",
                //     "ExtDesignID" => "",
                //     "id_Design " => "-",
                //     "id_DesignType" => 0,
                //     "id_Artist" => 3,
                // ];
                continue;
            }

            if (!$screenProProcess) {
                $LinesOE[] = $line_item;
                // $Designs[] = [
                //     "DesignName" => "",
                //     "ExtDesignID" => "",
                //     "id_Design " => "-",
                //     "id_DesignType" => 0,
                //     "id_Artist" => 3,
                // ];
                continue;
            }

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

            $custom_decoration_value = "";

            // logger("SERVICE: " . json_encode($service));
            // logger("ITEM: " . json_encode($item));
            // logger("VENDOR STOCK: " . json_encode($vendor_stock_status));
            // logger("NO DATA PRODUCT TYPE STATUS: " . json_encode($no_data_product_type_status));

            if ($service) {
                $custom_decoration_value = trim($service['value']);
                if (!$logoLocation && !in_array($custom_decoration_value, $customDecorations) && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                    !$update->completed_at && $update->update([
                        'failed_at' => now(),
                        'tries' => $update->tries + 1,
                        'retry' => 1
                    ]);

                    $this->inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'priority' => TRUE,
                        'description' => 'Logo Location, Custom Decoration, Direct Vendors, Missing for Order ' . $shopifyOrder->name . " for decorator. 1)"
                    ]);
                    return;
                }
            }

            // logger("1: " . json_encode($logoLocation));
            // logger("2: " . json_encode($service));
            // logger("3: " . json_encode($vendor_stock_status));
            // logger("4: " . json_encode($no_data_product_type_status));
            // logger("5: " . json_encode($personalization_location));
            // logger("6: " . json_encode($item));

            if (!$logoLocation && !$service && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1,
                    'retry' => 1
                ]);

                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'priority' => TRUE,
                    'description' => 'Logo Location, Custom Decoration, Direct Vendors, Missing for Order ' . $shopifyOrder->name . " for decorator. 2)"
                ]);
                return;
            }
            if (!$logoPreferences && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1,
                    'retry' => 1
                ]);

                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'priority' => TRUE,
                    'description' => 'Logo Location, Custom Decoration, Direct Vendors, Missing for Order ' . $shopifyOrder->name . " for decorator. 3)"
                ]);
                return;
            }
            if (!$service && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1,
                    'retry' => 1
                ]);

                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'priority' => TRUE,
                    'description' => 'Logo Location, Custom Decoration, Direct Vendors, Missing for Order ' . $shopifyOrder->name . " for decorator. 4)"
                ]);
                return;
            }

            // BELOW CODE IS COMPULSORY
            $decoratorService = DecoratorService::whereHas('decoratorData', function ($q) use ($service) {
                $q->where('name', trim(@$service['value']));
            })->where('decorator_id', $decorator->id)->first();

            $decoratorLocation = DecoratorLocation::where('decorator_service_id', $decoratorService?->id)->get();

            //FIRST LOGO PROCESS
            $location_id_final = '';
            foreach ($decoratorLocation as $key => $location) {
                if ($location->shopify_location->name == trim($logoLocation['value'] ?? ''))
                    $location_id_final = $location->location_id;
            }

            if ($location_id_final == '' && !in_array($custom_decoration_value, $customDecorations) && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                !$update->completed_at && $update->update([
                    'failed_at' => now(),
                    'tries' => $update->tries + 1,
                    'retry' => 1
                ]);

                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'priority' => TRUE,
                    'description' => 'Location is not available against decoration service for Order ' . $shopifyOrder->name . " for decorator."
                ]);
                return;
            }

            // MINIMUM REQUIRED AND DEFAULTS
            $temp_design = [
                "DesignName" => isset($service['value']) ? trim($service['value']) : "",
                'ExtDesignID' => !in_array($custom_decoration_value, $customDecorations) ? (isset($logoPreferences['value']) ? ($decorator->pivot->location_to_logo ? trim($logoPreferences['value'] . $location_id_final) : trim($logoPreferences['value'])) : "-") : "",
                'id_Design' => in_array($custom_decoration_value, $customDecorations) ? (isset($logoPreferences['value']) ? ($decorator->pivot->location_to_logo ? trim($logoPreferences['value'] . $location_id_final) : trim($logoPreferences['value'])) : "-") : "",
                "id_DesignType" => $decoratorService?->service_id ? (int) $decoratorService?->service_id : 8,
                "id_Artist" => 3,
            ];

            // OPTIMIZING LOCATION PROPERTIES
            if (isset($logoLocation['value'])) {
                $temp_design['Locations'] = [
                    [
                        "Location" => trim($logoLocation['value']),
                        "DesignCode" => isset($logoPreferences['value']) ? ($decorator->pivot->location_to_logo ? trim($logoPreferences['value'] . $location_id_final) : trim($logoPreferences['value'])) : "-",
                    ]
                ];
            }

            $line_item["ExtDesignIDBlock"] = isset($logoPreferences['value']) ? ($decorator->pivot->location_to_logo ? trim($logoPreferences['value'] . $location_id_final) : trim($logoPreferences['value'])) : "-";

            if ($vendor_stock_status || $no_data_product_type_status) {
                if (!$no_data_product_type_status && !$size_from_order)
                    $line_item['Size'] = "Other";

                $this->inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Vendor Stock Enabled for order ' . $shopifyOrder->name . " for decorator."
                ]);
            }

            if (isset($service['value']))
                $design[] = $temp_design;

            //SECOND LOGO PROCESS
            if ($secondLogoLocation && $secondLogoPreferences) {

                $location_id_final = '';
                foreach ($decoratorLocation as $key => $location) {
                    if ($location->shopify_location->name == trim($secondLogoLocation['value'] ?? ''))
                        $location_id_final = $location->location_id;
                }

                if ($location_id_final == '' && !in_array($custom_decoration_value, $customDecorations) && !$vendor_stock_status && !$no_data_product_type_status && !$personalization_location) {

                    !$update->completed_at && $update->update([
                        'failed_at' => now(),
                        'tries' => $update->tries + 1,
                        'retry' => 1
                    ]);

                    $this->inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'priority' => TRUE,
                        'description' => 'Location is not available against decoration service for Order ' . $shopifyOrder->name . " for decorator for 2nd logo."
                    ]);
                    return;
                }

                // MINIMUM REQUIRED AND DEFAULTS
                $temp_design = [
                    "DesignName" => isset($service['value']) ? trim($service['value']) : "",
                    'ExtDesignID' => !in_array($custom_decoration_value, $customDecorations) ? (isset($secondLogoPreferences['value']) ? ($decorator->pivot->location_to_logo ? trim($secondLogoPreferences['value'] . $location_id_final) : trim($secondLogoPreferences['value'])) : "-") : "",
                    'id_Design' => in_array($custom_decoration_value, $customDecorations) ? (isset($secondLogoPreferences['value']) ? ($decorator->pivot->location_to_logo ? trim($secondLogoPreferences['value'] . $location_id_final) : trim($secondLogoPreferences['value'])) : "-") : "",
                    "id_DesignType" => $decoratorService?->service_id ? (int) $decoratorService?->service_id : 8,
                    "id_Artist" => 3,
                ];

                // OPTIMIZING PROPERTIES
                if (isset($secondLogoLocation['value'])) {
                    $temp_design['Locations'] = [
                        [
                            "Location" => trim($secondLogoLocation['value']),
                            "DesignCode" => isset($secondLogoPreferences['value']) ? ($decorator->pivot->location_to_logo ? trim($secondLogoPreferences['value'] . $location_id_final) : trim($secondLogoPreferences['value'])) : "-",
                        ]
                    ];
                }

                $line_item["ExtDesignIDBlock"] = $line_item["ExtDesignIDBlock"] . ", " . (isset($secondLogoPreferences['value']) ? ($decorator->pivot->location_to_logo ? trim($secondLogoPreferences['value'] . $location_id_final) : trim($secondLogoPreferences['value'])) : "-");

                if ($vendor_stock_status || $no_data_product_type_status) {
                    if (!$no_data_product_type_status && !$size_from_order)
                        $line_item['Size'] = "Other";

                    $this->inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'type' => 'info',
                        'description' => 'Vendor Stock Enabled for order ' . $shopifyOrder->name . " for decorator."
                    ]);
                }

                if (isset($service['value']))
                    $design[] = $temp_design;
            }

            //POLY BAG CHECK
            if ($poly_bag) {
                // $line_item['decoratingLocations'][] = [
                //     'imageLocationID' => 13,
                //     'designName' => '',
                //     'itemOptions' => [],
                //     'itemServiceID' => 3,
                //     'personalization' => [],
                //     'specialInstructions' => "No Special Instructions"
                // ];
            }

            $LinesOE[] = $line_item;
            if (count($design) > 0 && !$this->isObjectInArray($design[0], $Designs))
                $Designs = array_merge($Designs, $design);
        }

        if (count($LinesOE) <= 0) {

            !$update->completed_at && $update->update([
                'completed_at' => now(),
                'failed_at' => null,
                'tries' => $update->tries + 1
            ]);

            $this->inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'No Line Items to Sync for Order ' . $shopifyOrder->name . " for decorator."
            ]);
            return;
        }

        $payload['LinesOE'] = $LinesOE;
        $payload['Designs'] = $Designs;

        if (!$this->inconnectOrder->decorator_sent && !$onlyTest) {

            if ($user->inconnect_account->decorator_sync && !(isset($gooselyRule['rule']['shopifyOrder']) && $gooselyRule['rule']['shopifyOrder'])) {

                // logger()->info(json_encode($payload, JSON_PRETTY_PRINT));

                if ($screenProProcess) {

                    $response = Http::withToken($access_token)->post('https://manageordersapi.com/onsite/order-push', $payload);
                    $data = $response->json();
                    // logger()->info($data);

                    if (strpos($data['result'], "has been uploaded") === false) {
                        $this->inconnectOrder->logs()->create([
                            'user_id' => $user->id,
                            'priority' => TRUE,
                            'description' => 'Error in Syncing Order ' . $shopifyOrder->name . " for decorator. Error: " . $data['result']
                        ]);

                        !$update->completed_at && $update->update([
                            'failed_at' => now(),
                            'tries' => $update->tries + 1,
                            'retry' => 1
                        ]);
                        return;
                    }

                    $this->inconnectOrder->update([
                        'decorator_sent' => true,
                        'decorator_order_id' => $po_number
                    ]);
                }

                $update->update([
                    'completed_at' => now(),
                    'failed_at' => null,
                    'tries' => $update->tries + 1
                ]);
            } else {
                if (!$user->inconnect_account->decorator_sync) {
                    $this->inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'priority' => TRUE,
                        'description' => 'Decorator Sync is off for Order ' . $shopifyOrder->name,
                    ]);
                } else {
                    // logger("RULE CODE: SCREEN PRO CANCELLED");
                }
            }
        }

        if ($onlyTest) {
            logger()->info(json_encode($payload, JSON_PRETTY_PRINT));
        }

        $payload = [
            'due_date' => $due_date,
            'vendor_id' => $decorator->intactVendor->vendor_id,
            'reference_no' => removeHash($shopifyOrder->name),
            'document_no' => $po_number,
            'line_items' => $sage_items
        ];

        if ($onlyTest) {
            logger()->info("MAIN FLOW: 3" . json_encode($payload, JSON_PRETTY_PRINT));
        }

        if ($user->inconnect_account->intact_sync) {
            if (!$this->inconnectOrder->decorator_intact_sent || $onlyTest) {
                $check_one = "";
                $check_two = "";
                if ($shopifyOrder->financial_status)
                    $check_one = $user->inconnect_account->statuses->where("financial_status_" . $shopifyOrder->financial_status, true)->first();
                if ($shopifyOrder->fulfillment_status)
                    $check_two = $user->inconnect_account->statuses->where("fulfillment_status_" . $shopifyOrder->fulfillment_status, true)->first();

                if ($check_one || $check_two) {

                    $log_created = $this->inconnectOrder->logs()->create([
                        'user_id' => $user->id,
                        'priority' => false,
                        'description' => 'The Order will be placed after 30 minutes from Order time for Order ' . $shopifyOrder->name
                    ]);

                    // IntacctOrderCreateJob::dispatch($payload, 'decorator', $this->inconnectOrder, null, $data[0]['orderID'], $log_created->id)->delay(now()->addMinutes(30));

                    if (!(isset($gooselyRule['rule']['intacctOrder']) && $gooselyRule['rule']['intacctOrder'])) {

                        if ($onlyTest)
                            IntacctOrderCreateJob::dispatch($payload, $decorator->name . '|decorator', $this->inconnectOrder, null, $po_number, $log_created->id, $onlyTest);
                        else if ($screenProProcess && (strpos(@$data['result'], "has been uploaded") !== false))
                            IntacctOrderCreateJob::dispatch($payload, $decorator->name . '|decorator', $this->inconnectOrder, null, $po_number, $log_created->id);
                    }
                }
            }
        } else {
            $this->inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'Intacct Sync (for Decorator) Disabled for Order ' . $shopifyOrder->name
            ]);
            // return;
        }
    }
}
