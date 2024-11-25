<?php

namespace App\Traits\InConnect;

use App\Models\InConnect\Vendor;
use SoapClient;
use SoapHeader;
use SoapFault;
use Illuminate\Support\Facades\Log;
use App\Models\AllInOne\ProductVariant;

trait VendorTrait
{
    private $inconnectOrderLocal = null;
    private $vendor = null;
    private $batchLocal = null;

    private function replaceSkuWithIntactItemIdInside($sku)
    {
      $exist = ProductVariant::where('sku', $sku)->whereNotNull('intacct_item_id')->first();
      if($exist){
        return $exist->intacct_item_id;
      }
      return '';
    }

    private function callToVendorApi($method, $extraParams = [], $type = 'product')
    {
        if ($this->vendor) {

            $api_url = $this->vendor->product_data_endpoint;
            $namespace_url = 'http://www.promostandards.org/WSDL/ProductDataService/1.0.0/';

            $params = [
                'wsVersion' => '1.0.0',
                'id' => $this->vendor->username,
                'password' => $this->vendor->password,
                'localizationCountry' => 'US',
                'localizationLanguage' => 'en',
            ];

            $params = array_merge($params, $extraParams);

            if ($type == 'purchase_order') {
                $api_url = $this->vendor->purchase_order_endpoint;
                $namespace_url = 'http://www.promostandards.org/WSDL/PO/1.0.0/';
            }

            if ($type == 'fob' || $type == 'pricing') {
                $api_url = $this->vendor->pricing_and_configuration_endpoint;
                $namespace_url = 'http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/';
            }

            if ($type == 'invoice') {
                $api_url = $this->vendor->invoice_endpoint;
                $namespace_url = 'http://www.promostandards.org/WSDL/Invoice/1.0.0/';

                unset($params['localizationCountry']);
                unset($params['localizationLanguage']);
            }

            /*************** Start https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7692012332 *****************/
             if ($type == 'tracking') {
                $api_url = $this->vendor->shipment_endpoint;
                $namespace_url = 'http://www.promostandards.org/WSDL/OrderShipmentNotificationService/1.0.0/SharedObjects/';
            
                unset($params['localizationCountry']);
                unset($params['localizationLanguage']);
            }
            /*************** End https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7692012332 *****************/

            if ($type == 'inventory') {

                $api_url = 'https://promostandards.ssactivewear.com/inventory/v2/wsdl/inventoryservice.wsdl';
                $namespace_url = 'http://www.promostandards.org/WSDL/Inventory/2.0.0/';

                unset($params['localizationCountry']);
                unset($params['localizationLanguage']);

                $params['wsVersion'] = '2.0.0';
            }

            if($api_url){
                $client = new SoapClient($api_url, ['trace' => 1, 'soap_version' => SOAP_1_1]);
                if(!($this->vendor->name == 'SanMar Canada')){
                    $authHeader = new SoapHeader(
                        $namespace_url,
                        'Credentials',
                        ['Username' => $this->vendor->username, 'Password' => $this->vendor->password],
                        false
                    );

                    $client->__setSoapHeaders([$authHeader]);
                }

                // logger("PARAMS: " . json_encode($params));

                try {
                    $response = $client->$method($params);
                    // logger("RESPONSE: " . json_encode($response));
                    if (isset($response->ErrorMessage)) {
                        if ($response->ErrorMessage->code == 105) {
                            if($this->inconnectOrderLocal){
                                $this->inconnectOrderLocal->logs()->create([
                                    'user_id' => $this->inconnectOrderLocal->user_id,
                                    'priority' => TRUE,
                                    'description' => $response->ErrorMessage->description
                                ]);

                                if($update = $this->inconnectOrderLocal->updates()->where('name','Purchase Order for '. $this->vendor->name)->first()){
                                    $update->failed_at = now();
                                    $update->tries = $update->tries + 1;
                                    $update->retry = 1;
                                }
                            } else if($this->batchLocal) {
                                $this->batchLocal->logs()->create([
                                    'priority' => TRUE,
                                    'description' => $response->ErrorMessage->description
                                ]);
                            }
                        }
                    }
                    return $response;
                } catch (SoapFault $e) {
                    Log::info("Error: " . $e->getMessage());
                    if($this->inconnectOrderLocal){
                        $this->inconnectOrderLocal->logs()->create([
                            'user_id' => $this->inconnectOrderLocal->user_id,
                            'priority' => TRUE,
                            'description' => $e->getMessage()
                        ]);

                        if($update = $this->inconnectOrderLocal->updates()->where('name','Purchase Order for '. $this->vendor->name)->first()){
                            $update->failed_at = now();
                            $update->tries = $update->tries + 1;
                            $update->retry = 1;
                        }
                    } else if($this->batchLocal) {
                        $this->batchLocal->logs()->create([
                            'priority' => TRUE,
                            'description' => $e->getMessage()
                        ]);
                    }
                }
            }
        }
        return null;
    }

    public function getProductSellable()
    {
        if ($this->vendor) {
            $params['isSellable'] = true;
            if($this->vendor->name == 'SanMar Canada')
                $params['productId'] = 'ACTIVE';
            return $this->callToVendorApi('getProductSellable', $params);
        }

        return null;
    }

    public function getProduct($productId, $partId = null)
    {
        if ($this->vendor) {
            $extraParams = ['productId' => $productId];

            if ($partId) {
                $extraParams['partId'] = $partId;
            }

            return $this->callToVendorApi('getProduct', $extraParams);
        }
        return null;
    }

    public function getInvoices($referenceNumber, Vendor $vendor)
    {
        $this->vendor = $vendor;

        if ($this->vendor) {
            $extraParams = [
                'queryType' => 1,
                'referenceNumber' => $referenceNumber,
            ];

            return $this->callToVendorApi('getInvoices', $extraParams, 'invoice');
        }
        return null;
    }

    public function sendPO($purchaseOrderData, $inconnectOrder, Vendor $vendor)
    {
        $this->vendor = $vendor;

        if ($this->vendor) {
            $this->inconnectOrderLocal = $inconnectOrder;
            $extraParams = ['PO' => $purchaseOrderData];
            return $this->callToVendorApi('sendPO', $extraParams, 'purchase_order');
        }

        return null;
    }

    /************* get tracking number ****************/
    public function getOrderShipmentNotification($referenceNumber, Vendor $vendor)
    {
        $this->vendor = $vendor;

        if ($this->vendor) {
            // $this->inconnectOrderLocal = $inconnectOrder;
            $extraParams =[ 
                'queryType' => 1,
                'referenceNumber' => $referenceNumber
            ];
            return $this->callToVendorApi('getOrderShipmentNotification', $extraParams, 'tracking');
        }

        return null;
    }

    public function getFobPoints($productId)
    {
        if ($this->vendor) {
            $extraParams = ['productId' => $productId];
            return $this->callToVendorApi('getFobPoints', $extraParams, 'fob');
        }

        return null;
    }

    public function getProductPrice($productId, $partId, $fobState)
    {
        $leastPrice = 0;

        if ($this->vendor) {
            $fobId = null;
            $fobPoints = $this->getFobPoints($productId);
            // logger("CHECKING 4: " . json_encode([$fobPoints]));

            if (isset($fobPoints->FobPointArray->FobPoint)) {

                foreach ($fobPoints->FobPointArray->FobPoint as $fobPoint) {
                    if (isset($fobPoint->fobState)) {
                        if ($fobPoint->fobState == $fobState) {
                            $fobId = $fobPoint->fobId;
                            break;
                        }
                    }
                }

                if (!$fobId) {
                    if (is_array($fobPoints->FobPointArray->FobPoint))
                        $fobId = $fobPoints->FobPointArray->FobPoint[0]->fobId;
                    else
                        $fobId = $fobPoints->FobPointArray->FobPoint->fobId;
                }

                if ($fobId) {
                    $extraParams = [
                        'fobId' => $fobId,
                        'productId' => $productId,
                        'currency' => 'USD',
                        'configurationType' => 'Blank',
                    ];

                    $priceTypes = $this->vendor->name == 'Alpha' ? ['List', 'Customer'] : ['List', 'Net', 'Customer'];

                    foreach ($priceTypes as $priceType) {

                        $extraParams['priceType'] = $priceType;
                        $pricing = $this->callToVendorApi('getConfigurationAndPricing', $extraParams, 'pricing');
                        // logger("CHECKING 5: " . json_encode($pricing));

                        if (isset($pricing?->Configuration?->PartArray?->Part)) {
                            $price = 0;
                            
                            if(gettype($pricing->Configuration->PartArray->Part) == "array") {
                                foreach ($pricing->Configuration->PartArray->Part as $part) {
                                    if ($part->partId == $partId) {
                                        if(isset($part->PartPriceArray->PartPrice->discountCode) && $part->PartPriceArray->PartPrice->discountCode == "U") {
                                            $price = (string) (round((float) $part->PartPriceArray->PartPrice->price * 0.75, 2));
                                        } else {
                                            $price = $part->PartPriceArray->PartPrice->price;
                                        }
                                        break;
                                    }
                                }
                            } else {
                                if ($pricing->Configuration->PartArray->Part->partId == $partId) {
                                    $price = $pricing->Configuration->PartArray->Part->PartPriceArray->PartPrice->price;
                                }
                            }

                            if ($price) {
                                if ($leastPrice == 0) {
                                    $leastPrice = $price;
                                } else {
                                    if ($price < $leastPrice && $price != 0) {
                                        $leastPrice = $price;
                                    }
                                }

                                if($this->inconnectOrderLocal){
                                    $this->inconnectOrderLocal->vendorPrices()->updateOrCreate([
                                        'product_id' => $productId,
                                        'part_id' => $partId
                                    ], [
                                        'vendor_id' => $this->vendor->id,
                                        'fob_id' => $fobId,
                                        'fob_state' => $fobState,
                                        'price' => $leastPrice,
                                        'price_type' => $priceType,
                                    ]);
                                }

                            } else {
                                if($this->inconnectOrderLocal){
                                    $this->inconnectOrderLocal->logs()->create([
                                        'user_id' => $this->inconnectOrderLocal->user_id,
                                        'type' => 'info',
                                        'description' => $this->vendor->name . ': Price not found for productId: ' . $productId . ' partId: ' . $partId . ' fobState: ' . $fobState . ' priceType: ' . $priceType . ' fobId: ' . $fobId
                                    ]);
                                } else if($this->batchLocal) {
                                    $this->batchLocal->logs()->create([
                                        'type' => 'info',
                                        'description' => $this->vendor->name . ': Price not found for productId: ' . $productId . ' partId: ' . $partId . ' fobState: ' . $fobState . ' priceType: ' . $priceType . ' fobId: ' . $fobId
                                    ]);
                                }
                            }
                        } else {
                            if($this->inconnectOrderLocal){
                                $this->inconnectOrderLocal->logs()->create([
                                    'user_id' => $this->inconnectOrderLocal->user_id,
                                    'type' => 'info',
                                    'description' => $this->vendor->name . ': PartArray not found for productId: ' . $productId . ' partId: ' . $partId . ' fobState: ' . $fobState . ' priceType: ' . $priceType . ' fobId: ' . $fobId
                                ]);
                            } else if($this->batchLocal) {
                                $this->batchLocal->logs()->create([
                                    'type' => 'info',
                                    'description' => $this->vendor->name . ': PartArray not found for productId: ' . $productId . ' partId: ' . $partId . ' fobState: ' . $fobState . ' priceType: ' . $priceType . ' fobId: ' . $fobId
                                ]);
                            }
                        }
                    }
                } else {
                    if($this->inconnectOrderLocal){
                        $this->inconnectOrderLocal->logs()->create([
                            'user_id' => $this->inconnectOrderLocal->user_id,
                            'type' => 'info',
                            'description' => $this->vendor->name . ': FobId not found for productId: ' . $productId . ' partId: ' . $partId . ' fobState: ' . $fobState . ' fobId: ' . $fobId
                        ]);
                    } else if($this->batchLocal) {
                        $this->batchLocal->logs()->create([
                            'type' => 'info',
                            'description' => $this->vendor->name . ': FobId not found for productId: ' . $productId . ' partId: ' . $partId . ' fobState: ' . $fobState . ' fobId: ' . $fobId
                        ]);
                    }
                }
            } else {
                if($this->inconnectOrderLocal){
                    $this->inconnectOrderLocal->logs()->create([
                        'user_id' => $this->inconnectOrderLocal->user_id,
                        'type' => 'info',
                        'description' => $this->vendor->name . ': FobPoints not found for productId: ' . $productId . ' partId: ' . $partId . ' fobState: ' . $fobState . ' fobId: ' . $fobId
                    ]);
                } else if($this->batchLocal) {
                    $this->batchLocal->logs()->create([
                        'type' => 'info',
                        'description' => $this->vendor->name . ': FobPoints not found for productId: ' . $productId . ' partId: ' . $partId . ' fobState: ' . $fobState . ' fobId: ' . $fobId
                    ]); 
                }
            }
        }

        return $leastPrice;
    }

    public function getVendorPartId($sku, $color, $size, $inconnectOrder, $barcode, Vendor $vendor, $fob_state = null, $batch = false)
    {
        // logger("CHECKING 1: " . json_encode([$sku, $color, $size, $inconnectOrder, $barcode, $vendor, $fob_state]));
        $this->vendor = $vendor;

        if ($this->vendor) {
            $this->inconnectOrderLocal = $inconnectOrder;
            $this->batchLocal = $batch;
            $product = $this->getProduct($sku);
            // logger("cth: " . json_encode($product));

            if (isset($product->ErrorMessage)) {
                $alternativeSkus = [strtoupper($sku), strtolower($sku)];

                foreach ($alternativeSkus as $alternativeSku) {
                    $alternativeProduct = $this->getProduct($alternativeSku);

                    if (!isset($alternativeProduct->ErrorMessage)) {
                        $product = $alternativeProduct->Product;
                        break;
                    }
                }

                if (isset($product->ErrorMessage)) {
                    if($this->inconnectOrderLocal){
                        $inconnectOrder->logs()->create([
                            'user_id' => $inconnectOrder->user_id,
                            'priority' => TRUE,
                            'description' => 'Vendor product not found SKU: ' . $sku,
                        ]);
                    } else if($this->batchLocal) {
                        $this->batch->logs()->create([
                            'priority' => TRUE,
                            'description' => 'Vendor product not found SKU: ' . $sku,
                        ]);
                    }
                    return [
                        'partId' => null,
                        'price' => 0
                    ];
                }
            } else {
                $product = $product->Product;
            }

            // logger("cth2: " . json_encode($product));

            if ($product) {
                $partArray = $product->ProductPartArray->ProductPart;
                $partId = null;
                
                if(gettype($partArray) == "array") {
                    foreach ($partArray as $part) {
                        if ($part->partId == $barcode) {
                            $partId = $part->partId;
                            break;
                        }
                    }
                } else {
                    if ($partArray->partId == $barcode) {
                        $partId = $partArray->partId;
                    }
                }

                // logger("MY PART: " . json_encode($partId));

                if (!$partId) {
                    foreach ($partArray as $part) {
                        if ($color && $size) {
                            // logger("jango1: " . json_encode($part));
                            // logger("jango2: " . $color . " " . $size);
                            if ($part->ColorArray->Color->colorName == $color && $part->ApparelSize->labelSize == $size) {
                                $partId = $part->partId;
                                break;
                            }

                            //ADDITIONAL CHECK WHERE PROPERTY NAME IS CUSTOMSIZE
                            else if ($part->ColorArray->Color->colorName == $color && isset($part->ApparelSize->customSize) && $part->ApparelSize->customSize == $size) {
                                $partId = $part->partId;
                                break;
                            }
                        }
                    }
                }

                if (!$partId) {
                    if(gettype($partArray) == "array") {
                        foreach ($partArray as $part) {
                            if (isset($part->gtin) && $part->gtin == $barcode) {
                                $partId = $part->partId;
                                break;
                            }
                        }
                    } else {
                        if (isset($partArray->gtin) && $partArray->gtin == $barcode) {
                            $partId = $partArray->partId;
                        }
                    }
                }

                if ($partId) {
                    // logger("CHECKING 2: " . json_encode([$product->productId, $partId, $fob_state]));
                    $price = $this->getProductPrice($product->productId, $partId, $fob_state);
                    // logger("CHECKING 3: " . json_encode([$price]));

                    if($price == 0 && $this->vendor->name == 'S&S Activewear'){
                        if($inventoryState = $this->getStateFromInventory($product->productId, $partId)){
                            $price = $this->getProductPrice($product->productId, $partId, $inventoryState);
                        }
                    }

                    if($price == 0){
                        if($this->inconnectOrderLocal){
                            $inconnectOrder->vendorPrices()->updateOrCreate([
                                'product_id' => $product->productId,
                                'part_id' => $partId
                            ], [
                                'vendor_id' => $this->vendor->id,
                                'fob_id' => 'N/A',
                                'fob_state' => $fob_state,
                                'price' => $price,
                                'price_type' => 'N/A',
                            ]);
                        }
                    }

                    return [
                        'partId' => $partId,
                        'price' => $price
                    ];
                } else {
                    if($this->inconnectOrderLocal){
                        $inconnectOrder->logs()->create([
                            'user_id' => $inconnectOrder->user_id,
                            'priority' => TRUE,
                            'description' => 'Vendor partId not found SKU: ' . $sku . ' color: ' . $color . ' size: ' . $size,
                        ]);
                    } else if($this->batchLocal) {
                        $this->batchLocal->logs()->create([
                            'priority' => TRUE,
                            'description' => 'Vendor product not found SKU: ' . $sku,
                        ]);
                    }
                }
            } else {
                if($this->inconnectOrderLocal){
                    $inconnectOrder->logs()->create([
                        'user_id' => $inconnectOrder->user_id,
                        'priority' => TRUE,
                        'description' => 'Vendor product not found SKU: ' . $sku,
                    ]);
                } else if($this->batchLocal) {
                    $this->batch->logs()->create([
                        'priority' => TRUE,
                        'description' => 'Vendor product not found SKU: ' . $sku,
                    ]);
                }
            }
        }
        return [
            'partId' => null,
            'price' => 0
        ];
    }

    public function getStateFromInventory($productId, $partId){
        $extraParams = [
            'productId' => $productId,
        ];

        $response = $this->callToVendorApi('getInventoryLevels', $extraParams, 'inventory');

        if (isset($response->Inventory->PartInventoryArray->PartInventory)) {
            foreach ($response->Inventory->PartInventoryArray->PartInventory as $part) {
                if ($part->partId == $partId) {
                    foreach($part->InventoryLocationArray->InventoryLocation as $location){
                        if($location->inventoryLocationQuantity->Quantity->value > 0){
                            return $location->inventoryLocationId;
                        }
                    }
               }
            }
        }

        return null;
    }

    public function masterPoItemsAndIntacctItems($user, $data, $inconnectOrder, $order, $vendor)
    {
        // logger(json_encode([$user, $data, $inconnectOrder, $order, $vendor);

        $currencyCode = $order['body']['data']['order']['subtotalPriceSet']['presentmentMoney']['currencyCode'];
        $totalAmount = $order['body']['data']['order']['subtotalPriceSet']['presentmentMoney']['amount'];

        if ($inconnectOrder->is_archived) {
            $object['items'] = [];
            $object['intacct_items'] = [];
            $object['currency'] = $currencyCode;
            $object['total_amount'] = $totalAmount;
            return $object;
        }

        $shopifyOrder = $data;
        $order = $order;
        $vendor = $vendor;

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

        $line_items = [];
        $sage_items = [];
        $color = '';
        $size = '';

        $direct_check = $user->inconnect_account->direct_vendors()->where('vendor_id', $vendor->id)->first();

        if ($user->inconnect_account->decorators()->first()->vendor_stock_status) {
            $user->inconnect_account->decorators()->first()->vendor_stocks()->get()->each(function ($item_inside) use (&$direct_check, $vendor) {
                if ($item_inside->shopify_vendor->name == $vendor->name)
                    $direct_check = true;
            });
        }

        $vendor_process = $user->inconnect_account->vendor_sync;

        foreach ($order['body']['data']['order']['lineItems']['edges'] as $item) {

            if (in_array($item['node']['product']['legacyResourceId'], $final_ignored_list)) {
                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Product is in ignored list for Order ' . $shopifyOrder->name,
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

            if (!in_array($item['node']['product']['vendor'], $vendor->shopifyVendors()->pluck('name')->toArray())) {
                $inconnectOrder->logs()->create([
                    'user_id' => $user->id,
                    'type' => 'info',
                    'description' => 'Product vendor ' . $item['node']['product']['vendor'] . ' is not supported for Order ' . $shopifyOrder->name,
                ]);
                continue;
            }

            $line_item['lineNumber'] = $item['node']['variant']['sku'];
            $line_item['description'] = $item['node']['title'];
            $line_item['lineType'] = 'New';
            $line_item['allowPartialShipments'] = false;
            $line_item['ToleranceDetails'] = [
                "tolerance" => "AllowUnderrun",
            ];
            foreach ($item['node']['variant']['selectedOptions'] as $option) {
                if ($option['name'] == 'Color') {
                    $color = $option['value'];
                }
                if ($option['name'] == 'Size') {
                    $size = $option['value'];
                }
            }

            $sku = $item['node']['variant']['sku'];

            $barcode = $item['node']['variant']['barcode'];

            if (str_contains($sku, '-')) {
                $sku = explode('-', $sku);
                $sku = $sku[0];
            }

            if ($direct_check) {
                $line_item['lineItemTotal'] = 0;
                $partId = '';
            } else {
                if (!$shopifyOrder->shipping_address && $shopifyOrder->billing_address) {
                    $shopifyOrder->shipping_address = $shopifyOrder->billing_address;
                }
                $partData = $this->getVendorPartId($sku, $color, $size, $inconnectOrder, $barcode, $vendor, $shopifyOrder->shipping_address->province_code);
                $line_item['lineItemTotal'] = $partData['price'];
                $partId = $partData['partId'];
            }

            $line_item['PartArray'] = [
                "Part" => [
                    "partId" => $partId,
                    "customerSupplied" => false,
                    "Quantity" => [
                        'value' => $item['node']['quantity'],
                        'uom' => 'EA',
                    ],
                ],
            ];
            $line_item['productItemNumber'] = $item['node']['variant']['sku'];
            $line_item['quantity'] = $item['node']['quantity'];
            $line_items[] = $line_item;
            $sage_item['item_id'] = $this->replaceSkuWithIntactItemIdInside($item['node']['variant']['sku']);
            $sage_item['quantity'] = $item['node']['quantity'];
            $sage_item['price'] = $line_item['lineItemTotal'];
            $sage_item['location_id'] = $vendor->intactLocation->location_id;
            $sage_item['department_id'] = $vendor->intactDepartment->department_id;
            $sage_item['class_id'] = $user->inconnect_account->intact_class->class_id;
            $sage_items[] = $sage_item;
        }

        if (count($line_items) <= 0 && $vendor_process) {

            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => 'No Line Items to Sync for Order ' . $shopifyOrder->name . " for vendor.",
            ]);

            $object['items'] = [];
            $object['intacct_items'] = [];
            $object['currency'] = $currencyCode;
            $object['total_amount'] = $totalAmount;
            return $object;
        }

        $shipping_method = $vendor->shipping_method;

        if ($shipping_method) {
            $shipping_method = explode('-', $shipping_method);
        } else {
            $inconnectOrder->logs()->create([
                'user_id' => $user->id,
                'priority' => TRUE,
                'description' => "Shipping Method is not set for Order " . $shopifyOrder->name . " for vendor.",
            ]);

            $object['items'] = [];
            $object['intacct_items'] = [];
            $object['currency'] = $currencyCode;
            $object['total_amount'] = $totalAmount;
            return $object;
        }

        $object = [
            'items' => $line_items,
            'intacct_items' => $sage_items,
            'currency' => $currencyCode,
            'total_amount' => $totalAmount
        ];
        return $object;
    }
}
