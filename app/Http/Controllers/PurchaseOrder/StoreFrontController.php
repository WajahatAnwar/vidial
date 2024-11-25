<?php

namespace App\Http\Controllers\PurchaseOrder;

use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Jobs\PurchaseOrder\ApproveOrderJob;
use App\Jobs\PurchaseOrder\DraftOrderJob;
use App\Models\AllInOne\Product;
use App\Models\AllInOne\User;
use App\Models\PurchaseOrder\POCSVRecord;
use App\Models\PurchaseOrder\POLocationShipping;
use App\Models\PurchaseOrder\POOrder;
use App\Models\PurchaseOrder\POPriceShipping;
use App\Models\PurchaseOrder\POSetting;
use App\Models\PurchaseOrder\POUSAStates;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StoreFrontController extends Controller
{
    public function create_order(Request $request)
    {
        // JUST TO CHECK WETHER IT IS WORKING ON NOT
        // $data['data'] = "TEST";
        // $str['status'] = true;
        // $str['message'] = "NEW ORDER PLACED";
        // $str['data'] = $data['data'];
        // return $str;
        // Log::info(json_encode($request->all()));

        $validator = Validator::make($request->all(), [
            'shop' => 'required|string',
            'purchase_order_id' => 'required',
            'customer_email' => 'required|email',
            // 'discount_amount'=> 'required|numeric',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'phone' => 'required|numeric',
            'postal_code' => 'required|numeric',
            'address' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
            'first_name_two' => 'required|string',
            'last_name_two' => 'required|string',
            'phone_two' => 'required|numeric',
            'postal_code_two' => 'required|numeric',
            'address_two' => 'required|string',
            'city_two' => 'required|string',
            'country_two' => 'required|string',
            'real_city' => 'required|string',
            'real_city_two' => 'required|string',
        ], [
            'real_city.required' => "City field is required",
            'real_city.string' => "City field must be string",
            'real_city_two.required' => "City two field is required",
            'real_city_two.string' => "City two must be string",

            'city.required' => "State field is required",
            'city.string' => "State field must be string",
            'city_two.required' => "State two field is required",
            'city_two.string' => "State two field must be string",
        ]);
        if ($validator->fails()) {
            $str['status'] = false;
            $error = $validator->errors()->toArray();
            foreach ($error as $x => $x_value) {
                $err[] = $x_value[0];
            }
            $str['message'] = $err['0'];
            return $str;
        } else {
            $user = User::where('name', $request->shop)->first();

            $note_attributes_array = array();

            $note_attributes_array[] = [
                "name" => 'Purchase Order ID',
                "value" => $request->purchase_order_id,
            ];

            // if ($user->show_discount_field == 1 && !isset($request->discount_amount)) {
            //     $str['status'] = false;
            //     $str['message'] = "Discount Field is required";
            //     return $str;
            // }

            if (isset($request->discount_amount)) {
                $note_attributes_array[] = [
                    "name" => 'Discount Code',
                    "value" => $request->discount_amount,
                ];
            }

            $cart_items = json_decode($request->cart_items);

            // return json_decode($request->cart_items);

            // return $cart_items->items;

            $products_array = array();
            foreach ($cart_items->items as $key => $value) {

                $product_properties = array();

                if ($value->properties != null) {
                    foreach ($value->properties as $key2 => $value2) {
                        // Log::info($key2);
                        // Log::info($value2);
                        $product_properties[] = [
                            "name" => $key2,
                            "value" => $value2,
                        ];
                    }
                }

                array_push($products_array, [
                    "variant_id" => $value->variant_id,
                    "quantity" => $value->quantity,
                    "properties" => $product_properties
                ]);
            }
            // return $products_array;

            // return $note_attributes_array;
            // return $user;

            if ($user->direct_approve == 1) {
                $response = $user->api()->rest('post', '/admin/api/2023-04/orders.json', [
                    "order" => [
                        "line_items" => $products_array,
                        "note_attributes" => $note_attributes_array,
                        "customer" => [
                            "first_name" => $request->first_name,
                            "last_name" => $request->last_name,
                            "email" => $request->customer_email,
                        ],
                        "billing_address" => [
                            "first_name" => $request->first_name_two,
                            "last_name" => $request->last_name_two,
                            "address1" => $request->address_two,
                            "phone" => $request->phone_two,
                            "province" => $request->city_two,
                            "city" => $request->real_city_two,
                            "country" => $request->country_two,
                            "zip" => $request->postal_code_two,
                        ],
                        "shipping_address" => [
                            "first_name" => $request->first_name,
                            "last_name" => $request->last_name,
                            "address1" => $request->address,
                            "phone" => $request->phone,
                            "province" => $request->city,
                            "city" => $request->real_city,
                            "country" => $request->country,
                            "zip" => $request->postal_code,
                        ],
                        "email" => $request->customer_email,
                        // "financial_status" => "pending",
                    ]
                ]);

                // Log::info(json_encode($response));

                // $this->shipping($response['body']['order'], $request);
                shipping($response['body']['order'], $request);

                $new_po_order = new POOrder;
                $new_po_order->user_id = $user->id;
                $new_po_order->name = $request->first_name_two . " " . $request->last_name_two;
                $new_po_order->shopify_order_id = $response['body']['order']['id'];
                $new_po_order->shopify_customer_id = $request->customer_id;
                $new_po_order->order_no = $response['body']['order']['order_number'];
                $new_po_order->billing_address = $request->address_two;
                $new_po_order->shipping_address = $request->address;
                $new_po_order->email = $request->customer_email;
                $new_po_order->phone = $request->phone;
                $new_po_order->country = $request->country;
                $new_po_order->purchase_order_id = $request->purchase_order_id;
                $new_po_order->total_price = $response['body']['order']['total_price'];
                $new_po_order->purchase_status = true;
                $new_po_order->order_request = json_encode($request->all());
                $new_po_order->save();

                ApproveOrderJob::dispatchSync($new_po_order);

                $str['status'] = true;
                $str['message'] = "NEW ORDER PLACED";
                $str['data'] = $response['body']['order'];
                return $str;
            } else {
                $response = $user->api()->rest('post', '/admin/api/2023-04/draft_orders.json', [
                    "draft_order" => [
                        "line_items" => $products_array,
                        "note_attributes" => $note_attributes_array,
                        "customer" => [
                            "first_name" => $request->first_name,
                            "last_name" => $request->last_name,
                            "email" => $request->customer_email,
                        ],
                        "billing_address" => [
                            "first_name" => $request->first_name_two,
                            "last_name" => $request->last_name_two,
                            "address1" => $request->address_two,
                            "phone" => $request->phone_two,
                            "province" => $request->city_two,
                            "city" => $request->real_city_two,
                            "country" => $request->country_two,
                            "zip" => $request->postal_code_two,
                        ],
                        "shipping_address" => [
                            "first_name" => $request->first_name,
                            "last_name" => $request->last_name,
                            "address1" => $request->address,
                            "phone" => $request->phone,
                            "province" => $request->city,
                            "city" => $request->real_city,
                            "country" => $request->country,
                            "zip" => $request->postal_code,
                        ],
                        "email" => $request->customer_email,
                        // "financial_status" => "pending",
                    ]
                ]);

                // Log::info(json_encode($response));

                $new_po_order = new POOrder;
                $new_po_order->user_id = $user->id;
                $new_po_order->name = $request->first_name_two . " " . $request->last_name_two;
                $new_po_order->shopify_order_id = $response['body']['draft_order']['id'];
                $new_po_order->shopify_customer_id = $request->customer_id;
                $new_po_order->order_no = $response['body']['draft_order']['name'];
                $new_po_order->billing_address = $request->address_two;
                $new_po_order->shipping_address = $request->address;
                $new_po_order->email = $request->customer_email;
                $new_po_order->phone = $request->phone;
                $new_po_order->country = $request->country;
                $new_po_order->total_price = $response['body']['draft_order']['total_price'];
                $new_po_order->purchase_order_id = $request->purchase_order_id;
                $new_po_order->order_request = json_encode($request->all());
                $new_po_order->save();

                DraftOrderJob::dispatchSync($new_po_order);

                $str['status'] = true;
                $str['message'] = "NEW DRAFT ORDER PLACED";
                $str['data'] = $response['body']['draft_order'];
                return $str;
            }
        }
    }

    public function get_store_rule(Request $request)
    {
        $shop = User::where('name', $request->shop)->first();

        $store_rule = DB::connection('purchase_order_conn')->table('p_o_store_rules')
            ->where('user_id', '=', $shop->id)
            ->join('p_o_rules', 'p_o_rules.id', '=', 'p_o_store_rules.rule_id')
            ->join(DB::connection('all_in_one_conn')->getDatabaseName() . '.users', 'users.id', '=', 'p_o_store_rules.user_id')
            ->select('p_o_rules.*', 'users.icons_color')
            ->first();

        $button_settings = POSetting::where('user_id', $shop->id)->first();

        if (empty($button_settings)) {
            $buttonData = [
                'button_text' => "Place Order",
                'icon_string' => "fa-solid fa-cart-shopping",
                'button_placement' => "left",
                'font_color' => '{"red":0,"green":0,"blue":0,"alpha":1}',
                'background_color' => '{"red":255,"green":255,"blue":255,"alpha":1}',
                'po_field_placeholder' => "Enter Po Id",
                'discount_field_placeholder' => "Enter Discount Code",
            ];

            $button_settings = POSetting::updateOrCreate(['user_id' => $shop->id], $buttonData);
        }

        $records = POCSVRecord::get();

        $all_states = POUSAStates::get();

        $str['status'] = true;
        $str['message'] = "Store rule shown and button settings shown";
        $str['data'] = $store_rule;
        $str['data2'] = $button_settings;
        $str['data3'] = $records;
        $str['data4'] = $all_states;
        $str['data5'] = $shop->show_discount_field;
        return $str;
    }

    public function get_user_orders(Request $request)
    {
        $orders = POOrder::where('shopify_customer_id', $request->customer_id)->orderBy('id', 'desc')->get();

        $str['status'] = true;
        $str['message'] = "User PO Orders Shown";
        $str['data'] = $orders;
        return $str;
    }
}
