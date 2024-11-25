<?php

namespace App\Http\Controllers\OrderSplitter;

use App\Http\Controllers\Controller;
use App\Models\AllInOne\User;
use App\Models\OrderSplitter\OSSplitOrder;
use App\Models\OrderSplitter\OSVendor;
use App\Models\OrderSplitter\OSVendorOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OrdersController extends Controller
{
    public function stores_list(Request $request)
    {
        $users = User::where('role_id', 2)->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('email', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('store_name', 'LIKE', '%' . $request->q . '%');
            });
        })->when($request->get('q4'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('name', 'LIKE', '%' . $request->q4 . '%');
                $q->orWhere('email', 'LIKE', '%' . $request->q4 . '%');
                $q->orWhere('store_name', 'LIKE', '%' . $request->q4 . '%');
            });
        })->when($request->get('q5'), function ($q) use ($request) {
            $q->when($request->get('q5') == "id asc", function ($q) {
                $q->orderBy("id", "asc");
            });
            $q->when($request->get('q5') == "id desc", function ($q) {
                $q->orderBy("id", "desc");
            });
            $q->when($request->get('q5') == "store_name asc", function ($q) {
                $q->orderBy("store_name", "asc");
            });
            $q->when($request->get('q5') == "store_name desc", function ($q) {
                $q->orderBy("store_name", "desc");
            });
            $q->when($request->get('q5') == "email asc", function ($q) {
                $q->orderBy("email", "asc");
            });
            $q->when($request->get('q5') == "email desc", function ($q) {
                $q->orderBy("email", "desc");
            });
        })->cursorPaginate($request->page_count);

        return responseJson(true, 'Stores retrieved successfully!', $users);
    }

    public function get_orders(Request $request, User $user)
    {
        $orders = OSSplitOrder::where('user_id', $request->user_id)->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('name', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('shopify_order_id', 'LIKE', '%' . $request->q . '%');
            });
        })->when($request->get('q4'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('name', 'LIKE', '%' . $request->q4 . '%');
                $q->orWhere('shopify_order_id', 'LIKE', '%' . $request->q4 . '%');
            });
        })->when($request->get('q5'), function ($q) use ($request) {
            $q->when($request->get('q5') == "id asc", function ($q) {
                $q->orderBy("id", "asc");
            });
            $q->when($request->get('q5') == "id desc", function ($q) {
                $q->orderBy("id", "desc");
            });
            $q->when($request->get('q5') == "order asc", function ($q) {
                $q->orderBy("shopify_order_id", "asc");
            });
            $q->when($request->get('q5') == "order desc", function ($q) {
                $q->orderBy("shopify_order_id", "desc");
            });
        })->cursorPaginate($request->page_count);

        return responseJson(true, 'Orders retrieved successfully!', $orders);
    }

    public function get_orders_vendors(Request $request)
    {
        $orders = OSVendorOrder::where('order_id', $request->order_id)->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('id', 'LIKE', '%' . $request->q . '%');
                $q->orWhere('order_id', 'LIKE', '%' . $request->q . '%');
            });
        })->when($request->get('q4'), function ($q) use ($request) {
            $q->where(function ($q) use ($request) {
                $q->orWhere('id', 'LIKE', '%' . $request->q4 . '%');
                $q->orWhere('order_id', 'LIKE', '%' . $request->q4 . '%');
            });
        })->when($request->get('q5'), function ($q) use ($request) {
            $q->when($request->get('q5') == "id asc", function ($q) {
                $q->orderBy("id", "asc");
            });
            $q->when($request->get('q5') == "id desc", function ($q) {
                $q->orderBy("id", "desc");
            });
            $q->when($request->get('q5') == "order asc", function ($q) {
                $q->orderBy("order_id", "asc");
            });
            $q->when($request->get('q5') == "order desc", function ($q) {
                $q->orderBy("order_id", "desc");
            });
        })->cursorPaginate($request->page_count);

        return responseJson(true, 'Vendor Orders retrieved successfully!', $orders);
    }

    public function fulfillOrder(Request $request)
    {
        // Log::info("OS 1 " . json_encode($request->all()));
        // Log::info("OS 2 " . "ORDER SPLITTER CC-TWO FULFILL");
        $parseUrl = parse_url($request->resource_url);
        // Log::info("OS 3 " . $request->resource_url);
        $storeIdget = explode("=", $parseUrl['query']);
        $storeId = (explode("&", $storeIdget[1]));
        // Log::info("OS 4 " . $storeId[0]);
        $getVendor = OSVendor::where("vendor_store_id", $storeId[0])->first();
        $keys_pub = $getVendor->vendor_private_key;
        $keys_sec = $getVendor->vendor_secret_key;
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
            return 'cURL Error: ' . curl_error($ch);
        }
        curl_close($ch);
        if ($response !== false) {
            $response = json_decode($response, true);
            // Log::info("OS 5 " . json_encode($response));
        } else {
            return 'Request failed.';
        }

        foreach ($response['shipments'] as $shippmentData) {
            $getShopifyOrderId = OSVendorOrder::where("shipstation_order_id", $shippmentData['orderId'])->first();
            // log::info("OS 6 " . json_encode($getShopifyOrderId));
            $shop = User::where('id', $getShopifyOrderId->user_id)->first();
            $fulfillmentAPiResponse = $shop->api()->rest('get', '/admin/api/2023-01/orders/' . $getShopifyOrderId->order_id . '/fulfillment_orders.json');
            // log::info("OS 7 " . json_encode($fulfillmentAPiResponse));
            // dump($fulfillmentAPiResponse);

            $url = "https://ssapi.shipstation.com/orders/" . $shippmentData['orderId'];
            $headers = [
                'Content-Type: application/json',
                "Authorization: Basic " . $auth_key,
            ];
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response_inside = curl_exec($ch);
            if (curl_errno($ch)) {
                return 'cURL Error: ' . curl_error($ch);
            }
            curl_close($ch);
            if ($response_inside !== false) {
                $response_inside = json_decode($response_inside, true);
                // Log::info("OS 8 " . json_encode($response_inside));
            } else {
                return 'Request failed.';
            }

            $shipstationlineItems = collect($response_inside['items']);

            foreach ($fulfillmentAPiResponse['body']['fulfillment_orders'] as $fulfillmentOrder) {
                $lineItemsArray = [];
                if ($fulfillmentOrder['status'] == 'open' || $fulfillmentOrder['status'] == 'in_progress') {
                    foreach ($fulfillmentOrder['line_items'] as $lineItem) {
                        $exist_in_ship_station = $shipstationlineItems->where('lineItemKey', $lineItem['line_item_id'])->first();
                        if ($exist_in_ship_station && $lineItem['fulfillable_quantity'] > 0) {
                            $lineItemsArray[] = [
                                "id" => $lineItem['id'],
                                "quantity" => $lineItem['fulfillable_quantity']
                            ];
                        }
                    }

                    $fulfillment = [
                        "line_items_by_fulfillment_order" => [
                            [
                                "fulfillment_order_id" => $fulfillmentOrder['id'],
                                "fulfillment_order_line_items" => $lineItemsArray
                            ]
                        ],
                        "notify_customer" => true,
                        "tracking_info" => [
                            'company' => $shippmentData['serviceCode'],
                            'number' => $shippmentData['trackingNumber'],
                        ]
                    ];
                    $fulfillmentResponse = $shop->api()->rest('post', '/admin/api/2023-01/fulfillments.json', ["fulfillment" => $fulfillment]);
                    // Log::info("OS 9 " . json_encode($fulfillmentResponse));
                }
            }
        }
    }

    public function place_order_manual(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'integer|required',
        ], []);

        if ($validator->fails())
            return simpleValidate($validator);

        $user = User::find($request->user_id);

        $existing_order = OSSplitOrder::where('user_id', $request->user_id)->where('shopify_order_id', $request->order_id)->first();

        // if ($existing_order && !$request->test)
        //     return sendResponse(false, 'Order already processed!');
        
        if(!$request->test) {
            if($existing_order) {
                $vendor_orders = OSVendorOrder::where('user_id', $request->user_id)->where('split_order_id', $existing_order->id)->get();
                foreach ($vendor_orders as $key => $order) {
                    $order->delete();
                }
                $existing_order->delete();
            }
        }
      
        $order = $user->api()->rest('GET', '/admin/api/2023-10/orders/' . $request->order_id . '.json');
        // Log::info(json_encode($order));

        if ($order['errors'] ?? false) {
            return sendResponse(false, $order['body']);
        }

        $payload = $order['body']['order'];
        // Log::info(json_encode($payload));

        // ORDER SPLITTER SECTION
        if($request->test)
            $order_splitter = orderSplitterJob($user, $payload, true); 
        else
            $order_splitter = orderSplitterJob($user, $payload);
        // ORDER SPLITTER SECTION

        if ($order_splitter['status'] === false) {
            return sendResponse(false, $order_splitter['message']);
        }

        return sendResponse(true, 'Order placed successfully!', $order_splitter);
    }
}
