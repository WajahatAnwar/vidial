<?php

namespace App\Http\Controllers\OrderSplitter;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use LaravelShipStation\Models\Order as LaravelOrder;
use LaravelShipStation\Models\AdvancedOptions;
use LaravelShipStation\Models\Address;
use LaravelShipStation\Models\OrderItem;
use LaravelShipStation\Models\Weight;
use App\Models\OrderSplitter\OakHallOrder;
use App\Models\OrderSplitter\OakHallOrderLineItem;

class TestController extends Controller
{
    public function testOkHall()
    {
        $startDate = '01-01-2020';
        $endDate = '01-01-2025';
        $pageNumber = 1;
        $token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkFwaU9ha0hhbGwiLCJyb2xlIjoiY2xpZW50Iiwidk5hbSI6Ilh6aXhXK2hwYndoUjdpR1RFeFRtVFE9PSIsIm5iZiI6MTcyNzM3OTI2NSwiZXhwIjoxODIxOTg3MjY1LCJpYXQiOjE3MjczNzkyNjV9.bfBGoQ4tI_U88WcZVnPX2ZJgbLf_zwp7acs-JR8RDhk";
        $response = Http::withToken($token)
            ->get('https://bbcloud-oakhall-api.azurewebsites.net/api/salesorders', [
                'startDate' => $startDate,
                'endDate' => $endDate,
                'pageNumber' => $pageNumber,
            ]);

        if ($response->successful()) {
            $orders = $response->json();
            return $orders;
            // Process your orders here
        } else {
            // Handle errors
            $error = $response->body();
            return $error;
        }

        $payload = [
            "id" => "string",
            "externalOrderId" => "string",
            "userId" => "string",
            "customer" => [
                "name" => "string",
                "address" => [
                    "street" => "string",
                    "streetDetails" => "string",
                    "zipCode" => "string",
                    "city" => "string",
                    "state" => "string",
                    "countryCode" => "string"
                ],
                "contact" => [
                    "name" => "string",
                    "phoneNo" => "string",
                    "email" => "string"
                ],
                "customerId" => "string"
            ],
            "shippingAddress" => [
                "name" => "string",
                "address" => [
                    "street" => "string",
                    "streetDetails" => "string",
                    "zipCode" => "string",
                    "city" => "string",
                    "state" => "string",
                    "countryCode" => "string"
                ],
                "contact" => [
                    "name" => "string",
                    "phoneNo" => "string",
                    "email" => "string"
                ]
            ],
            "lines" => [
                [
                    "lineNumber" => "string",
                    "description" => "string",
                    "productId" => "string",
                    "quantity" => 0,
                    "bookStoreCost" => 0,
                    "vendorItemNo" => "string",
                    "returnAddressLabelEnvelop" => [
                        "name" => "string",
                        "address" => [
                            "street" => "string",
                            "streetDetails" => "string",
                            "zipCode" => "string",
                            "city" => "string",
                            "state" => "string",
                            "countryCode" => "string"
                        ],
                        "contact" => [
                            "name" => "string",
                            "phoneNo" => "string",
                            "email" => "string"
                        ]
                    ]
                ]
            ]
        ];

        return $this->orderProcessed($payload);
    }

    public function orderProcessed($payload)
    {
        $payload = json_decode(json_encode($payload));
        $line_items = collect($payload->lines);
        foreach ($line_items as $key => $line_item) {
            if (isset($vendor)) {

                $order = new LaravelOrder();

                if (isset($payload->shippingAddress)) {
                    $payload_shipping_address = $payload->shippingAddress;
                }

                if (isset($payload->shippingAddress)) {
                    $payload_billing_lines = $payload->shippingAddress;
                }
                $weight = new Weight();
                $weight->units = 'grams';
                $weight->value = '0';
                $orderItem = new OrderItem();
                $orderItem->lineItemKey = $line_item->lineNumber;
                $orderItem->sku = null;
                $orderItem->name = null;
                $orderItem->quantity = $line_item->quantity;
                $orderItem->unitPrice  = '0';
                $orderItem->weight  = null;
                $orderItem->imageUrl  = null;
                $orderItem->options = null;
                $order->items[] = $orderItem;


                $bill_to_address = null;
                if (isset($payload->billing_address)) {
                    $bill_to_address = new Address();
                    $bill_to_address->name = $payload_billing_lines->name;
                    $bill_to_address->street1 = $payload_billing_lines->address->street;
                    $bill_to_address->street2 = $payload_billing_lines->streetDetails;
                    $bill_to_address->city = $payload_billing_lines->city;
                    $bill_to_address->state = $payload_billing_lines->state;
                    $bill_to_address->postalCode = $payload_billing_lines->zipCode;
                    $bill_to_address->country = $payload_billing_lines->zipCode;
                    $bill_to_address->phone = $payload_billing_lines->countryCode;
                }

                $ship_to_address = null;
                if (isset($payload->shipping_address)) {
                    $ship_to_address = new Address();
                    $ship_to_address->name =  $payload_billing_lines->name;
                    $ship_to_address->street1 =  $payload_billing_lines->address->street;
                    $ship_to_address->street2 = $payload_billing_lines->streetDetails;
                    $ship_to_address->city = $payload_billing_lines->city;
                    $ship_to_address->state =  $payload_billing_lines->state;
                    $ship_to_address->postalCode = $payload_billing_lines->zipCode;
                    $ship_to_address->country =  $payload_billing_lines->zipCode;
                    $ship_to_address->phone = $payload_billing_lines->countryCode;
                }

                $advanced_options = new AdvancedOptions();
                $advanced_options->storeId = null;
                $advanced_options->warehouseId = 0;
                $order->orderNumber = $payload->contact->name;
                $order->customerEmail = $payload->contact->email;
                $order->orderDate = now();
                $order->amountPaid = 0;
                $order->taxAmount = 0;
                $order->shippingAmount = 0;
                $order->orderStatus = 'awaiting_shipment';
                $order->billTo = $bill_to_address;
                $order->shipTo = $ship_to_address;
                $order->advancedOptions = $advanced_options;

                if (count($payload->shipping_lines) > 0) {
                    $order->requestedShippingService = $payload->shipping_lines[0]->title;
                }

                $orders_arr = array($order);
                $keys_pub = $vendor->vendor_private_key;
                $keys_sec = $vendor->vendor_secret_key;
                $auth_key = base64_encode($keys_pub . ":" . $keys_sec);
                $response_api = Http::connectTimeout(90)->timeout(90)->withHeaders([
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Basic ' . $auth_key
                ])->post('https://ssapi.shipstation.com/orders/createorders', $orders_arr);
                $json_api = $response_api->json();

                // logger()->info(json_encode($json_api));
            }
        }
    }

    public function testShipStation()
    {


        $order = new LaravelOrder();

        $payload_billing_lines =  [
            "shippingAddress" => [
                "name" => "1",
                "address" => [
                    "street" => "2",
                    "streetDetails" => "3",
                    "zipCode" => "4",
                    "city" => "5",
                    "state" => "6",
                    "countryCode" => "7"
                ],
                "contact" => [
                    "name" => "8",
                    "phoneNo" => "9",
                    "email" => "1"
                ]
            ]
        ];
        $payload_billing_lines = json_decode(json_encode($payload_billing_lines));
        $weight = new Weight();
        $weight->units = 'grams';
        $weight->value = 1;
        $orderItem = new OrderItem();
        $orderItem->lineItemKey = '122';
        $orderItem->sku = '122';
        $orderItem->name = 'test';
        $orderItem->quantity = "1";
        $orderItem->unitPrice  = '1';
        $orderItem->weight  = $weight;
        $orderItem->imageUrl  = null;
        // $orderItem->options = null;
        $order->items[] = $orderItem;


        $bill_to_address = null;

        $bill_to_address = new Address();
        $bill_to_address->name = $payload_billing_lines->shippingAddress->name;
        $bill_to_address->street1 = $payload_billing_lines->shippingAddress->address->street;
        $bill_to_address->street2 = $payload_billing_lines->shippingAddress->address->streetDetails;
        $bill_to_address->city = $payload_billing_lines->shippingAddress->address->city;
        $bill_to_address->state = $payload_billing_lines->shippingAddress->address->state;
        $bill_to_address->postalCode = $payload_billing_lines->shippingAddress->address->zipCode;
        $bill_to_address->country = $payload_billing_lines->shippingAddress->address->countryCode;


        $ship_to_address = null;

        $ship_to_address = new Address();
        $ship_to_address->name = $payload_billing_lines->shippingAddress->name;
        $ship_to_address->street1 = $payload_billing_lines->shippingAddress->address->street;
        $ship_to_address->street2 = $payload_billing_lines->shippingAddress->address->streetDetails;
        $ship_to_address->city = $payload_billing_lines->shippingAddress->address->city;
        $ship_to_address->state = $payload_billing_lines->shippingAddress->address->state;
        $ship_to_address->postalCode = $payload_billing_lines->shippingAddress->address->zipCode;
        $ship_to_address->country = $payload_billing_lines->shippingAddress->address->zipCode;
        $ship_to_address->phone = $payload_billing_lines->shippingAddress->address->countryCode;


        $advanced_options = new AdvancedOptions();
        $advanced_options->storeId = '488621';
        $advanced_options->warehouseId = 0;
        $order->orderNumber = '122';
        $order->customerEmail = 'test@gmail.com';
        $order->orderDate = now();
        // $order->amountPaid = 0;
        // $order->taxAmount = 0;
        // $order->shippingAmount = 0;
        $order->orderStatus = 'awaiting_shipment';
        $order->billTo = $bill_to_address;
        $order->shipTo = $ship_to_address;
        $order->advancedOptions = $advanced_options;
        $order->requestedShippingService = '122';
        $orders_arr = array($order);
        $keys_pub = '4438d72f7b234281bc438739504d0810';
        $keys_sec = '38ddd028a91849aca9afe4a7598d853d';
        $auth_key = base64_encode($keys_pub . ":" . $keys_sec);
        $response_api = Http::connectTimeout(90)->timeout(90)->withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Basic ' . $auth_key
        ])->post('https://ssapi.shipstation.com/orders/createorders', $orders_arr);
        $json_api = $response_api->json();

        // logger()->info(json_encode($json_api));
       
    }

    public function oakHallOrders()
    {
        $startDate = '01-01-2020';
        $endDate = '01-01-2025';
        $pageNumber = 1;
        $token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkFwaU9ha0hhbGwiLCJyb2xlIjoiY2xpZW50Iiwidk5hbSI6Ilh6aXhXK2hwYndoUjdpR1RFeFRtVFE9PSIsIm5iZiI6MTcyNzM3OTI2NSwiZXhwIjoxODIxOTg3MjY1LCJpYXQiOjE3MjczNzkyNjV9.bfBGoQ4tI_U88WcZVnPX2ZJgbLf_zwp7acs-JR8RDhk";
        $response = Http::withToken($token)
            ->get('https://bbcloud-oakhall-api.azurewebsites.net/api/salesorders', [
                'startDate' => $startDate,
                'endDate' => $endDate,
                'pageNumber' => $pageNumber,
            ]);

        if ($response->successful()) {
            $responseData = $response->json();

            if ($responseData['result']['totalRecords'] > 0) {
                $orders = $responseData['result']['body'];

                foreach ($orders as $orderData) {
                    $order = OakHallOrder::create([
                        'external_order_id' => $orderData['externalOrderId'],
                        'user_id' => $orderData['userId'],
                        'customer_name' => $orderData['customer']['name'],
                        'customer_street' => $orderData['customer']['address']['street'],
                        'customer_street_details' => $orderData['customer']['address']['streetDetails'],
                        'customer_zip_code' => $orderData['customer']['address']['zipCode'],
                        'customer_city' => $orderData['customer']['address']['city'],
                        'customer_state' => $orderData['customer']['address']['state'],
                        'customer_country_code' => $orderData['customer']['address']['countryCode'],
                        'customer_contact_name' => $orderData['customer']['contact']['name'],
                        'customer_contact_phone' => $orderData['customer']['contact']['phoneNo'],
                        'customer_contact_email' => $orderData['customer']['contact']['email'],
                        'shipping_name' => $orderData['shippingAddress']['name'],
                        'shipping_street' => $orderData['shippingAddress']['address']['street'],
                        'shipping_street_details' => $orderData['shippingAddress']['address']['streetDetails'],
                        'shipping_zip_code' => $orderData['shippingAddress']['address']['zipCode'],
                        'shipping_city' => $orderData['shippingAddress']['address']['city'],
                        'shipping_state' => $orderData['shippingAddress']['address']['state'],
                        'shipping_country_code' => $orderData['shippingAddress']['address']['countryCode'],
                        'shipping_contact_name' => $orderData['shippingAddress']['contact']['name'],
                        'shipping_contact_phone' => $orderData['shippingAddress']['contact']['phoneNo'],
                        'shipping_contact_email' => $orderData['shippingAddress']['contact']['email'],
                        'order_status' => 'not_sent_to_shipstation'
                    ]);

                    foreach ($orderData['lines'] as $lineItemData) {
                        OakHallOrderLineItem::create([
                            'oak_hall_order_id' => $order->id,
                            'line_number' => $lineItemData['lineNumber'],
                            'description' => $lineItemData['description'],
                            'product_id' => $lineItemData['productId'],
                            'quantity' => $lineItemData['quantity'],
                            'book_store_cost' => $lineItemData['bookStoreCost'],
                            'vendor_item_no' => $lineItemData['vendorItemNo'],
                        ]);
                    }
                }
            } else {
                // logger('No orders found in the given date range.');
                return 'No orders found in the given date range.';
            }
        } else {
            return $response->body();
        }
    }

    public function sentToShipStation()
    {
        $orders = OakHallOrder::with('lineItems')->get(); // Assuming you have a relationship defined

        foreach ($orders as $oakHallOrder) {
            $order = new LaravelOrder();

            // Prepare the billing and shipping address
            $addressPayload = [
                "name" => $oakHallOrder->customer_name,
                "address" => [
                    "street" => $oakHallOrder->customer_address_street,
                    "streetDetails" => $oakHallOrder->customer_address_street_details,
                    "zipCode" => $oakHallOrder->customer_address_zipCode,
                    "city" => $oakHallOrder->customer_address_city,
                    "state" => $oakHallOrder->customer_address_state,
                    "countryCode" => $oakHallOrder->customer_address_countryCode
                ],
                "contact" => [
                    "name" => $oakHallOrder->customer_contact_name,
                    "phoneNo" => $oakHallOrder->customer_contact_phoneNo,
                    "email" => $oakHallOrder->customer_contact_email
                ]
            ];

            $addressPayload = json_decode(json_encode($addressPayload));

            // Weight and items
            $weight = new Weight();
            $weight->units = 'grams';
            $weight->value = 1;

            foreach ($oakHallOrder->lineItems as $lineItem) {
                $orderItem = new OrderItem();
                $orderItem->lineItemKey = $lineItem->id;
                $orderItem->sku = $lineItem->product_id;
                $orderItem->name = $lineItem->description;
                $orderItem->quantity = $lineItem->quantity;
                $orderItem->unitPrice  = $lineItem->book_store_cost;
                $orderItem->weight  = $weight;
                $order->items[] = $orderItem;
            }

            // Use the same address for billing and shipping
            $ship_to_address = new Address();
            $ship_to_address->name = $addressPayload->name;
            $ship_to_address->street1 = $addressPayload->address->street;
            $ship_to_address->street2 = $addressPayload->address->streetDetails;
            $ship_to_address->city = $addressPayload->address->city;
            $ship_to_address->state = $addressPayload->address->state;
            $ship_to_address->postalCode = $addressPayload->address->zipCode;
            $ship_to_address->country = $addressPayload->address->countryCode;

            $bill_to_address = clone $ship_to_address; // Billing is the same as shipping

            $advanced_options = new AdvancedOptions();
            $advanced_options->storeId = '488621';
            $advanced_options->warehouseId = 0;

            $order->orderNumber = $oakHallOrder->id;
            $order->customerEmail = $oakHallOrder->customer_contact_email;
            $order->orderDate = now();
            $order->amountPaid = 0;
            $order->taxAmount = 0;
            $order->shippingAmount = $oakHallOrder->shipping_amount;
            $order->orderStatus = 'awaiting_shipment';
            $order->billTo = $bill_to_address;
            $order->shipTo = $ship_to_address;
            $order->advancedOptions = $advanced_options;
            $order->requestedShippingService = 'standard';

            $orders_arr[] = $order;

            $keys_pub = '4438d72f7b234281bc438739504d0810';
            $keys_sec = '38ddd028a91849aca9afe4a7598d853d';
            $auth_key = base64_encode($keys_pub . ":" . $keys_sec);

            $response_api = Http::connectTimeout(90)->timeout(90)->withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Basic ' . $auth_key
            ])->post('https://ssapi.shipstation.com/orders/createorders', $orders_arr);

            $json_api = $response_api->json();

            // Log the response
            // logger()->info(json_encode($json_api));

            if (!$json_api['hasErrors']) {
                $oakHallOrder->order_status = 'shipped';
                $oakHallOrder->save();
            }else {
                $oakHallOrder->comment = $json_api->Message;
                $oakHallOrder->save();
            }

            dd($json_api); 
        }

       
    }
}
