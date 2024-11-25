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
use Inertia\Inertia;

class OakHallController extends Controller
{
    public function orderListing()
    {
        return Inertia::render('Applications/OrderSplitter/OakHall');
    }
    public function oakHallOrders()
    {
        // $orders = OakHallOrder::with('orderLineItems')->get();
       $data = [
    "id" => "ORD67890",
    "externalOrderId" => env("ORDER_ID"),
    "userId" => "USER456",
    "customer" => [
        "name" => "Jane Smith",
        "address" => [
            "street" => "456 Elm St",
            "streetDetails" => "Unit 12A",
            "zipCode" => "10001",
            "city" => "New York",
            "state" => "NY",
            "countryCode" => "US"
        ],
        "contact" => [
            "name" => "Jane Smith",
            "phoneNo" => "123456-7890",
            "email" => "jane@example.com"
        ],
        "customerId" => "CUST456"
    ],
    "shippingAddress" => [
        "name" => "Jane Smith",
        "address" => [
            "street" => "456 Elm St",
            "streetDetails" => "Unit 12A",
            "zipCode" => "10001",
            "city" => "New York",
            "state" => "NY",
            "countryCode" => "US"
        ],
        "contact" => [
            "name" => "Jane Smith",
            "phoneNo" => "123456-7890",
            "email" => "jane@example.com"
        ]
    ],
    "lines" => [
        [
            "lineNumber" => "001",
            "description" => "Diploma Cover",
            "productId" => "PROD003",
            "quantity" => 2,
            "bookStoreCost" => 50.99,
            "vendorItemNo" => "VEND003",
            "returnAddressLabelEnvelop" => [
                "name" => "Return Department",
                "address" => [
                    "street" => "789 Return Ave",
                    "streetDetails" => "Floor 3",
                    "zipCode" => "60601",
                    "city" => "Chicago",
                    "state" => "IL",
                    "countryCode" => "US"
                ],
                "contact" => [
                    "name" => "Return Dept",
                    "phoneNo" => "555-8765",
                    "email" => "returns2@example.com"
                ]
            ]
        ],
        [
            "lineNumber" => "002",
            "description" => "Graduation Tassel",
            "productId" => "PROD004",
            "quantity" => 3,
            "bookStoreCost" => 10.99,
            "vendorItemNo" => "VEND004",
            "returnAddressLabelEnvelop" => [
                "name" => "Return Department",
                "address" => [
                    "street" => "789 Return Ave",
                    "streetDetails" => "Floor 3",
                    "zipCode" => "60601",
                    "city" => "Chicago",
                    "state" => "IL",
                    "countryCode" => "US"
                ],
                "contact" => [
                    "name" => "Return Dept",
                    "phoneNo" => "555-8765",
                    "email" => "returns2@example.com"
                ]
            ]
        ]
    ]
];
        // Convert array to Laravel Collection
        $payload = json_decode(json_encode($data), false);
        $this->sentToShipStation($payload);

        // $startDate = '01-01-2020';
        // $endDate = '01-01-2025';
        // $pageNumber = 1;
        // $token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkFwaU9ha0hhbGwiLCJyb2xlIjoiY2xpZW50Iiwidk5hbSI6Ilh6aXhXK2hwYndoUjdpR1RFeFRtVFE9PSIsIm5iZiI6MTcyNzM3OTI2NSwiZXhwIjoxODIxOTg3MjY1LCJpYXQiOjE3MjczNzkyNjV9.bfBGoQ4tI_U88WcZVnPX2ZJgbLf_zwp7acs-JR8RDhk";
        // $response = Http::withToken($token)
        //     ->get('https://bbcloud-oakhall-api.azurewebsites.net/api/salesorders', [
        //         'startDate' => $startDate,
        //         'endDate' => $endDate,
        //         'pageNumber' => $pageNumber,
        //     ]);

        // if ($response->successful()) {
        //     $responseData = $response->json();

        //     if ($responseData['result']['totalRecords'] > 0) {
        //         $orders = $responseData['result']['body'];
        //         foreach ($orders as $key => $order) {
        //             $this->sentToShipStation($order);
        //         }
        //     } else {
        //         logger('No orders found in the given date range.');
        //         return 'No orders found in the given date range.';
        //     }
        // } else {
        //     return $response->body();
        // }
    }

    public function sentToShipStation($paylod)
    {

        $order = new LaravelOrder();
        $payload_billing_lines =  [
            "shippingAddress" => [
                "name" => "1",
                "address" => [
                    "street" => $paylod->shippingAddress->address->street,
                    "streetDetails" => $paylod->shippingAddress->address->streetDetails,
                    "zipCode" => $paylod->shippingAddress->address->zipCode,
                    "city" => $paylod->shippingAddress->address->city,
                    "state" => $paylod->shippingAddress->address->state,
                    "countryCode" => $paylod->shippingAddress->address->countryCode
                ],
                "contact" => [
                    "name" => $paylod->customer->name,
                    "phoneNo" => $paylod->customer->contact->phoneNo,
                    "email" => $paylod->customer->contact->email
                ]
            ]
        ];
        $payload_billing_lines = json_decode(json_encode($payload_billing_lines));
        $weight = new Weight();
        $weight->units = 'grams';
        $weight->value = 1;
        $line_item_details = [];
        $all_items = [];

        foreach ($paylod->lines as $line_items) {
            // Collect line item details
            $line_item_details = [
                'line_number' => $line_items->lineNumber,
                'description' => $line_items->description,
                'product_id' => $line_items->productId,
                'quantity' => $line_items->quantity,
                'book_store_cost' => $line_items->bookStoreCost,
                'vendor_item_no' => $line_items->vendorItemNo
            ];
            array_push($all_items, $line_item_details);
            $orderItem = new OrderItem();
            $orderItem->lineItemKey = $line_items->lineNumber;
            $orderItem->sku = $line_items->productId ?? null;
            $orderItem->name = $line_items->description;
            $orderItem->quantity = $line_items->quantity;
            $orderItem->unitPrice = $line_items->bookStoreCost ?? null;
            $orderItem->weight = $weight;
            $orderItem->imageUrl = null;

            // Add the item to the order's items
            $order->items[] = $orderItem;
        }
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
        $ship_to_address->country = $payload_billing_lines->shippingAddress->address->countryCode;
        $ship_to_address->phone = $payload_billing_lines->shippingAddress->contact->phoneNo;


        $advanced_options = new AdvancedOptions();
        $advanced_options->storeId = '488621';
        $advanced_options->warehouseId = 0;
        $order->orderNumber = $paylod->externalOrderId;
        $order->customerEmail = $paylod->customer->contact->email;
        $order->orderDate = now();
        $order->amountPaid = 0;
        $order->taxAmount = 0;
        $order->shippingAmount = 0;
        $order->orderStatus = 'awaiting_shipment';
        $order->billTo = $bill_to_address;
        $order->shipTo = $ship_to_address;
        $order->advancedOptions = $advanced_options;
        // $order->requestedShippingService = '122';
        $orders_arr = array($order);
        $keys_pub = '4438d72f7b234281bc438739504d0810';
        $keys_sec = '38ddd028a91849aca9afe4a7598d853d';
        $auth_key = base64_encode($keys_pub . ":" . $keys_sec);
        $shipstation_response = Http::connectTimeout(90)->timeout(90)->withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Basic ' . $auth_key
        ])->post('https://ssapi.shipstation.com/orders/createorders', $orders_arr);
        $json_response = $shipstation_response->json();

        // logger()->info(json_encode($json_response));
        $orderData = [
            'customer_name' => $paylod->customer->name,
            'customer_email' => $paylod->customer->contact->email,
            'customer_phone_no' => $paylod->customer->contact->phoneNo,
            'street' => $paylod->customer->address->street,
            'street_details' => $paylod->customer->address->streetDetails,
            'zip_code' => $paylod->customer->address->zipCode,
            'city' => $paylod->customer->address->city,
            'state' => $paylod->customer->address->state,
            'country_code' => $paylod->customer->address->countryCode,
        ];

        if (!$json_response['hasErrors']) {
            // $data = json_decode($json_response, true);
            $orderId = $json_response['results'][0]['orderId'];
            $orderData['order_status'] = 'sent_to_shipstation';
            $orderData['shipstation_order_id'] = $orderId;

        } else {
            $orderData['order_status'] = 'not_sent_to_shipstation';
            $orderData['comment'] = isset($json_response->Message) ? $json_response->Message : 'Error in order creation';
        }

        $this->saveOrder($orderData, $all_items,$paylod);

        // logger()->info('Order sent to ShipStation successfully');
        // dd('Order sent to ShipStation successfully');
    }

    public function saveOrder($orderData, $all_items, $paylod)
    {
        $orderCreate = OakHallOrder::updateOrCreate([
            'external_order_id' => $paylod->externalOrderId,
        ], $orderData);

        foreach ($all_items as $item) {
            OakHallOrderLineItem::updateOrCreate([
                'oak_hall_order_id' => $orderCreate->id,
            ], [
                'line_number' => $item['line_number'],
                'description' => $item['description'],
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'book_store_cost' => $item['book_store_cost'],
                'vendor_item_no' => $item['vendor_item_no'],
            ]);
        }
    }


    public function fetchOrders(Request $request)
    {
        $orders = OakHallOrder::with('orderLineItems')
            ->when($request->q, function ($q) use ($request) {
                $q->where(function ($query) use ($request) {
                    $query->where('external_order_id', 'like', '%' . $request->q . '%')
                        ->orWhere('customer_name', 'like', '%' . $request->q . '%')
                        ->orWhere('customer_email', 'like', '%' . $request->q . '%');
                });
            })->when($request->get('sort'), function ($q) use ($request) {
                $q->when($request->get('sort') == "id asc", function ($q) {
                    $q->orderBy("id", "asc");
                });
                $q->when($request->get('sort') == "id desc", function ($q) {
                    $q->orderBy("id", "desc");
                });
            })
            ->cursorPaginate($request->page_count ?? 10);
        $data['orders'] = $orders;
        return response()->json([
            'status' => true,
            'data' => $data,
            'message' => 'Orders fetched successfully'
        ]);
    }

    public function fetchOrdersDetail()
    {
        $order = OakHallOrder::with('orderLineItems')->find(request()->id);
        $data['order'] = $order;
        return response()->json([
            'status' => true,
            'data' => $data,
            'message' => 'Order details successfully'
        ]);
    }

   public function shipmentResponse(Request $request){
        // Log::info("OS 1 " . json_encode($request->all()));
        // Log::info("OS 2 " . "ORDER SPLITTER CC-TWO FULFILL");
        $parseUrl = parse_url($request->resource_url);
       
        // Log::info("OS 4 " . $storeId[0]);
        $keys_pub = '4438d72f7b234281bc438739504d0810';
        $keys_sec = '38ddd028a91849aca9afe4a7598d853d';
        $auth_key = base64_encode($keys_pub . ":" . $keys_sec);
        $url = $request->resource_url;
        $headers = [
            'Content-Type: application/json',
            "Authorization: Basic " . $auth_key,
        ];
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            // logger()->info(json_encode('cURL Error: ' . curl_error($ch)));
        }
        curl_close($ch);
        if ($response !== false) {
            // logger()->info(json_encode('res : '.$response));
             $response = json_decode($response, true);
             $shippmentData = $response['shipments'];
             $orderId = $shippmentData[0]['orderId'];
             $oakHallOrder = OakHallOrder::where('shipstation_order_id',$orderId)->first();
            //  logger('order id here :');
            //  logger()->info(json_encode($orderId));
             if($oakHallOrder){
                $oakHallOrder->shipment_status = 'shipped';
                $oakHallOrder->save();
             }

        } else {
            // logger()->info('Request failed.');
            return 'Request failed.';
        }
    }

}
