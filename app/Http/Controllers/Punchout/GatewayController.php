<?php

namespace App\Http\Controllers\Punchout;

use App\Models\Punchout\PomwGatewayClientOrder;
use DateTime;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Traits\Punchout\CxmlFactory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use App\Models\Punchout\PomwGatewayClient;
use App\Models\Punchout\PomwStreetAddress;
use App\Models\Punchout\PomwGatewayClientInvoice;
use App\Models\Punchout\PomwGatewayClientRequest;
use App\Models\Punchout\PomwGatewayClientCustomer;
use App\Models\Punchout\PomwGatewayClientOrderItem;
use App\Models\Punchout\ShopifyCartTransferAttempt;
use App\Models\Punchout\PomwGatewayClientInvoiceItem;
use App\Models\Punchout\PomwGatewayClientDiscountCode;
use App\Models\Punchout\PomwGatewayClientInvoiceStatus;
use App\Models\Punchout\PomwGatewayClientConfirmedOrder;
use App\Models\Punchout\PomwGatewayClientDiscountCodeUsage;
use App\Models\Punchout\PomwGatewayClientProductQuantityLimit;
use App\Models\Punchout\PomwGatewayClientCustomerPunchoutSession;
use App\Models\Punchout\PomwGatewayClientOrderItemCustomAttribute;
use App\Models\Punchout\PomwGatewayClientTierPriceDiscountProduct;
use App\Services\Punchout\ShopifyGraphQLShippingAndTaxCalculation;
use Carbon\Carbon;

class GatewayController extends Controller
{
    use CxmlFactory;

    public function punchout(Request $request, $id)
    {
        $cxml = $request->getContent();
        if (!$cxml) {
            $error = $this->getCXMLError(406, "Empty Request");
            return response($error, 200, [
                'Content-Type' => 'application/xml'
            ]);
        }
        $client = PomwGatewayClient::whereUuid($id)->first();
        if (!$client) {
            $error = $this->getCXMLError(406, "Invalid client! Unauthorized");
            return response($error, 200, [
                'Content-Type' => 'application/xml'
            ]);
        }
        $cxml = html_entity_decode($cxml);
        $cxml = stripslashes($cxml); // Remove any escaping backslashes
        $cxml = trim($cxml); // Trim whitespace
        $xml = simplexml_load_string($cxml);

        $xml_punchout_setup_request = $xml->Request->PunchOutSetupRequest;
        $xml_request = $xml->Request;
        $xml_header = $xml->Header;
        $shared_secret = $xml_header->Sender->Credential->SharedSecret;
        if ($shared_secret != $client->shared_secret) {
            $error = $this->getCXMLError(406, "Shared secret does not match with the client secret!");
            return response($error, 200, [
                'Content-Type' => 'application/xml'
            ]);
        }
        if (isset($xml_punchout_setup_request->Extrinsic)) {
            $email = $xml->xpath('//Request/PunchOutSetupRequest/Extrinsic[@name="UserEmail"]');
            if (!empty($email))
                $email = (string) $email[0];

            $user_fullname = $xml->xpath('//Request/PunchOutSetupRequest/Extrinsic[@name="UserPrintableName"]');
            if (!empty($user_fullname))
                $user_fullname = (string) $user_fullname[0];

            $user_firstname = $xml->xpath('//Request/PunchOutSetupRequest/Extrinsic[@name="FirstName"]');
            if (!empty($user_firstname))
                $user_firstname = (string) $user_firstname[0];

            $user_lastname = $xml->xpath('//Request/PunchOutSetupRequest/Extrinsic[@name="LastName"]');
            if (!empty($user_lastname))
                $user_lastname = (string) $user_lastname[0];

            $user_unique_name = $xml->xpath('//Request/PunchOutSetupRequest/Extrinsic[@name="UniqueName"]');
            if (!empty($user_unique_name))
                $user_unique_name = (string) $user_unique_name[0];


            $user_username = $xml->xpath('//Request/PunchOutSetupRequest/Extrinsic[@name="User"]');
            if (!empty($user_username))
                $user_username = (string) $user_username[0];

            $user_phonenumber = $xml->xpath('//Request/PunchOutSetupRequest/Extrinsic[@name="PhoneNumber"]');
            if (!empty($user_phonenumber)) {
                $user_phonenumber = (string) $user_phonenumber[0];
            } else {
                if (!empty($xml_punchout_setup_request->ShipTo->Phone->TelephoneNumber->Number)) {
                    $user_phonenumber = $xml_punchout_setup_request->ShipTo->Phone->TelephoneNumber->Number;
                }
            }

            $business_unit = $xml->xpath('//Request/PunchOutSetupRequest/Extrinsic[@name="BusinessUnit"]');
            if (!empty($business_unit))
                $business_unit = (string) $business_unit[0];
        } else {
            if (!isset($email))
                $email = $xml_punchout_setup_request->Contact->Email;

            if (!isset($user_fullname))
                $user_fullname = $xml_punchout_setup_request->Contact->Name;

            if (!isset($user_username))
                $user_username = $xml_punchout_setup_request->Contact->Email;

            if (!isset($user_unique_name))
                $user_unique_name = $xml_punchout_setup_request->Contact->Email;

            if (!isset($user_firstname))
                $user_firstname = Str::before($user_fullname, " ");

            if (!isset($user_lastname)) {
                $user_lastname = Str::afterLast($user_fullname, " ");
            }

            if (!isset($business_unit))
                $business_unit = "QUANTUM";
        }

        $customer = PomwGatewayClientCustomer::whereEmail($email)->whereClientId($client->id)->first();
        if (!$customer) {
            $customer = new PomwGatewayClientCustomer();
            $customer->uuid = Str::uuid();
            $customer->client_id = $client->id;
            $customer->account_id = $client->account_id;
            if (!empty($user_fullname)) {
                $customer->name = (string) $user_fullname;
            } else {
                $customer->name = (string) $email;
            }


            if (!empty($user_firstname)) {
                $customer->firstname = (string) $user_firstname;
            } else {
                $customer->firstname = (string) $user_unique_name;
            }

            if (!empty($user_lastname)) {
                $customer->lastname = (string) $user_lastname;
            } else {
                $customer->lastname = "";
            }

            if (isset($user_unique_name))
                $customer->uniquename = (string) $user_unique_name;

            if (isset($user_username))
                $customer->username = (string) $user_username;

            if (isset($email))
                $customer->email = (string) $email;

            if (isset($user_phonenumber) && is_string($user_phonenumber))
                $customer->phone = (string) $user_phonenumber;

            $customer->save();
        }
        $session_operation = $xml_punchout_setup_request->attributes()->operation;
        $session_mode = $xml_request->attributes()->deploymentMode;

        $session = new PomwGatewayClientCustomerPunchoutSession();
        $session->uuid = Str::uuid();
        $session->account_id = $client->account_id;
        $session->customer_id = $customer->id;
        $session->client_id = $client->id;
        $session->session_key = Str::random(16);
        $session->buyer_cookie = $xml_punchout_setup_request->BuyerCookie;
        $session->operation = $session_operation ?? 'create';
        $session->mode = $session_mode ?? 'production';
        $session->post_url = $xml_punchout_setup_request->BrowserFormPost->URL;
        $session->setup_url = $xml_punchout_setup_request->SupplierSetup->URL;
        $session->type = 'setuprequest';
        $session->request_cxml = $xml->asXML();
        $session->raw_request_data = $cxml;
        $session->uri = bin2hex(\random_bytes(16));
        $session->header_to_domain = $xml_header->To->Credential->attributes()->domain;
        $session->header_to_identity = $xml_header->To->Credential->Identity;
        $session->header_from_domain = $xml_header->From->Credential->attributes()->domain;
        $session->header_from_identity = $xml_header->From->Credential->Identity;
        $session->header_sender_domain = $xml_header->Sender->Credential->attributes()->domain;
        $session->header_sender_identity = $xml_header->Sender->Credential->Identity;
        $session->header_sender_shared_secret = $xml_header->Sender->Credential->SharedSecret;
        $session->header_sender_user_agent = $xml_header->Sender->UserAgent;
        $session->business_unit = empty($business_unit) ? 'QUANTUM' : $business_unit;
        $session->save();

        if (!empty($xml_punchout_setup_request->ShipTo)) {
            $address = new PomwStreetAddress();
            $address->uuid = Str::uuid();
            $address->deliver_to = $xml_punchout_setup_request->ShipTo->Address->PostalAddress->DeliverTo;
            $address->line1 = $xml_punchout_setup_request->ShipTo->Address->PostalAddress->Street;
            $address->city = $xml_punchout_setup_request->ShipTo->Address->PostalAddress->City;
            $address->state = $xml_punchout_setup_request->ShipTo->Address->PostalAddress->State;
            $address->zip = $xml_punchout_setup_request->ShipTo->Address->PostalAddress->PostalCode;
            $address->country = $xml_punchout_setup_request->ShipTo->Address->PostalAddress->Country->attributes()->isoCountryCode;
            $address->label = $xml_punchout_setup_request->ShipTo->Address->Name;
            $address->email = $xml_punchout_setup_request->ShipTo->Address->Email;
            $address->customer_session_id = $session->id;
            $address->ident = $xml_punchout_setup_request->ShipTo->Address->attributes()->addressID;
            $address->save();
        }
        $url = route('punchout.gateway.session.start', $session->uuid);
        // $url = url('punchout/gateway/' . $session->uuid . '/session/start');
        $payload_id = $this->getPayloadId();
        $payload_timestamp = date(DateTime::RFC3339, time());
        $response_cxml = view('cxmls.punchout_setup_response', compact('url', 'payload_id', 'payload_timestamp'))->render();
        $client_request = new PomwGatewayClientRequest();
        $client_request->uuid = Str::uuid();
        $client_request->client_id = $client->id;
        $client_request->customer_session_id = $session->id;
        $client_request->type = "PunchOutSetupRequest";
        $client_request->operation = "create";
        $client_request->request_data = $xml->asXML();
        $client_request->payload_ident = $payload_id;
        $client_request->data_headers = getHeadersAsString();
        $client_request->uri = $request->getPathInfo();
        $client_request->user_agent = $request->userAgent();
        $client_request->remote_host = $request->getClientIp();
        $client_request->response_body = $response_cxml;
        $client_request->save();
        return response($response_cxml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    public function startPunchoutSession(Request $request, $id)
    {
        $session = PomwGatewayClientCustomerPunchoutSession::whereUuid($id)->first();
        if (!$session) {
            $error = $this->getCXMLError(406, "Session not found!");
            return response($error, 200, [
                'Content-Type' => 'application/xml'
            ]);
        }
        $client = $session->pomw_client;

        $url = 'https://' . $client->domain . '?punchout_sess_id=' . $session->uuid . '&signature=' . $session->getHmac256Signature() . '&clear_cart=1';
        $client_request = new PomwGatewayClientRequest();
        $client_request->uuid = Str::uuid();
        $client_request->client_id = $client->id;
        $client_request->customer_session_id = $session->id;
        $client_request->type = "PunchOutSetupResponse";
        $client_request->operation = "create";
        $client_request->request_data = "";
        $client_request->payload_ident = $this->getPayloadId();
        $client_request->data_headers = getHeadersAsString();
        $client_request->uri = $request->getPathInfo();
        $client_request->user_agent = $request->userAgent();
        $client_request->remote_host = $request->getClientIp();
        $client_request->response_body = 'Redirecting to shopify...';
        $client_request->save();
        return redirect($url);
    }

    public function cartAttempt(Request $request)
    {
        $validator = validator($request->all(), [
            'token' => 'required',
            'connection' => 'required',
            'cart' => 'required',
        ]);
        if ($validator->fails()) {
            return responseJson(false, 'Validation Error', $validator->errors()->first(), null, 422,);
        }
        $session = PomwGatewayClientCustomerPunchoutSession::whereUuid($request->connection['session_id'])->first();
        if (!$session) {
            return responseJson(false, 'Session not found!', null, null, 404);
        }
        $client = $session->pomw_client;
        $cart_items = collect($request->cart['items']);
        $message = '';
        $can_checkout = true;
        $quotes = $cart_items->whereIn('product_type', ['Custom Quotes', 'External Quotes'])->first();
        $cart_items->each(function ($item) use ($client, &$can_checkout, &$verify_product_limit, &$message, $quotes) {
            $verify_product_limit = $this->verifyProductLimitToCheckout($client, $item['handle'], $item);
            if (!$verify_product_limit['status']) {
                $can_checkout = false;
                $message = $verify_product_limit['message'];
            }
            if($quotes && $item['product_type'] != 'Custom Quotes' && $item['product_type'] != 'External Quotes') {
                $can_checkout = false;
                $message = 'Custom Quotes can\'t be added to cart with other products!';
            }
        });
        if (!$can_checkout) {
            return responseJson(false, $message, null, null, 422);
        }
        $attempt = new ShopifyCartTransferAttempt();
        $attempt->uuid = Str::uuid();
        $attempt->session_id = $request->connection['session_id'];
        $attempt->cart_data = json_encode($request->all());
        $attempt->save();
        return responseJson(true, 'Cart Attempt saved successfully!', [
            'redirect_url' => route('punchout.checkout', $attempt->uuid),
        ]);
    }

    private function verifyProductLimitToCheckout($client, $handle, $item)
    {
        $limit = PomwGatewayClientProductQuantityLimit::whereClientId($client->id)->whereHandle($handle)->first();

        if ($limit) {
            if ($limit->min > 0 && $item['quantity'] < $limit->min) {
                return [
                    'status' => false,
                    'message' => $item['title'] . 'can\'t be less than ' . (int) $limit->min . ' quantity',
                ];
            }


            if ($limit->max > 0 && $item['quantity'] > $limit->max) {
                return [
                    'status' => false,
                    'message' => $item['title'] . 'can\'t be greater than ' . (int) $limit->max . ' quantity',
                ];
            }

            if ($limit->multiple > 0 && $item['quantity'] % $limit->multiple !== 0) {
                return [
                    'status' => false,
                    'message' => $item['title'] . ' must be purchased in multiples of ' . (int) $limit->multiple,
                ];
            }
        }
        return [
            'status' => true,
            'message' => 'Product limit verified successfully!',
        ];
    }

    private function processDiscountsForCheckoutItems($cart_items)
    {
        foreach ($cart_items as &$cart_item) {
            $product = PomwGatewayClientTierPriceDiscountProduct::whereSku($cart_item['sku'])->first();

            if ($product) {
                $discount = $product->discount;
                if ($discount) {
                    $cart_item['price'] = $discount->getDiscount($cart_item['price'], $cart_item['quantity']);
                }
            }
        }

        return $cart_items;
    }

    public function checkout(Request $request, $id)
    {
        $shopify_cart_transfer_attempt = ShopifyCartTransferAttempt::whereUuid($id)->whereHasTransferred(0)->first();
        if (!$shopify_cart_transfer_attempt) {
            return responseJson(false, 'Cart not found!', null, null, 404);
        }
        $session = PomwGatewayClientCustomerPunchoutSession::whereUuid($shopify_cart_transfer_attempt->session_id)->first();
        if (!$session) {
            return responseJson(false, 'Session not found!', null, null, 404);
        }
        $customer = $session->pomw_client_customer;
        $client = $session->pomw_client;

        $cart_data = json_decode($shopify_cart_transfer_attempt->cart_data, true);
        $cart_items = collect($cart_data['cart']['items']);
        $cart = $cart_data['cart'];
        $grand_total = $cart_data['cart']['total_price'];

        $cart_items = $this->processDiscountsForCheckoutItems($cart_items);
        $can_checkout = true;
        $message = null;
        $verify_product_limit = null;
        $quotes = $cart_items->whereIn('product_type', ['Custom Quotes', 'External Quotes'])->first();
        $cart_items->each(function ($item) use ($client, &$can_checkout, &$verify_product_limit, &$message, $quotes) {
            $verify_product_limit = $this->verifyProductLimitToCheckout($client, $item['handle'], $item);
            if (!$verify_product_limit['status']) {
                $can_checkout = false;
                $message = $verify_product_limit['message'];
            }
            if($quotes && $item['product_type'] != 'Custom Quotes' && $item['product_type'] != 'External Quotes') {
                $can_checkout = false;
                $message = 'Custom Quotes can\'t be added to cart with other products!';
            }
        });

        $discount_code = null;
        $discount_message = '';
        if ($request->method() == 'POST' && $request->input('discount_code')) {
            $discount_code = PomwGatewayClientDiscountCode::whereClientId($client->id)->whereLabel($request->input('discount_code'))->first();
            if (!$discount_code) {
                $discount_message = 'Invalid discount code! Please enter a valid one!';
                session()->forget('discount_code');
            }
        } else if (session()->has('discount_code')) {
            $discount_code = PomwGatewayClientDiscountCode::whereClientId($client->id)->whereLabel(session()->get('discount_code'))->first();
            if (!$discount_code) {
                session()->forget('discount_code');
            }
        }

        // calculate with / without discount code
        if ($discount_code && $discount_code->canBeRedeemByCustomer($customer->id, $discount_message)) {
            if (Carbon::parse($discount_code->expiry_date)->isPast()) {
                $discount_message = 'Discount code has expired!';
                session()->forget('discount_code');
                $discount_code = null;
            } else {
                session()->put('discount_code', $discount_code->label);
            }
            $calculation = new ShopifyGraphQLShippingAndTaxCalculation($session, $cart_items, $discount_code);
        } else {
            $discount_code = null;
            session()->forget('discount_code');
            $calculation = new ShopifyGraphQLShippingAndTaxCalculation($session, $cart_items);
        }

        if (!$client->shouldCalculateShippingAndTaxesOnIncomingOrder()) {
            $calculation->execute();
        }
        $rates = $calculation->getShippingRates();
        if ($request->method() == 'POST' && !$request->input('validate_discount_code')) {
            if (!$can_checkout) {
                return responseJson(false, $message, null, null, 422);
            }
            $selected_rate_handle = $request->input('shipping_rate');
            if ($selected_rate_handle) {
                $selected_rate_handle = $selected_rate_handle[0];
            }
            // $rates = $calculation->getShippingRates();
            $selected_rate = collect($rates)->firstWhere('handle', $selected_rate_handle);
            if ($discount_code) {
                $usage = new PomwGatewayClientDiscountCodeUsage();
                $usage->code_id = $discount_code->id;
                $usage->customer_id = $customer->id;
                $usage->session_id = $session->id;
                $usage->client_id = $client->id;
                $usage->applied_amount = $discount_code->value;
                $usage->save();

                session()->forget('discount_code');
                session()->put('discount_code_usage_id', $usage->id);
                if ($discount_code->type_id == 3) {
                    $current_balance = ($discount_code->current_balance - $calculation->getUnmodifiedTotal());
                    if ($current_balance < 0) {
                        $current_balance = 0;
                    }
                    $usage->applied_amount = $discount_code->current_balance - $current_balance;
                    $usage->save();
                    $discount_code->current_balance = $current_balance;
                    $discount_code->save();
                }
            }
            $grand_total = $calculation->getTotal();
            if ($selected_rate) {
                $grand_total += $selected_rate['price']['amount'];
            }
            $cart_items->each(function ($item) use ($session) {
                foreach ($item['properties'] as $key => $value) {
                    $custom_attribute = new PomwGatewayClientOrderItemCustomAttribute();
                    $custom_attribute->item_id = $item['variant_id'];
                    $custom_attribute->session_id = $session->id;
                    $custom_attribute->key = $key;
                    $custom_attribute->value = $value;
                    $custom_attribute->save();
                }
            });
            $payload_id = $this->getPayloadId();
            $payload_timestamp = date(DateTime::RFC3339, time());
            $cxml = view('cxmls.shopify_order_transfer', compact('payload_id', 'payload_timestamp', 'session', 'client', 'grand_total', 'cart_items', 'calculation', 'selected_rate', 'discount_code'))->render();

            $response = view('gateway.gateway', [
                'cxmlbase64' => base64_encode($cxml),
                'cxmlbase64_param' => $client->cxmlbase64_param_override ?? 'cxml-base64',
                'url' => route('punchout.gateway.punchin', $session->uuid),
                'continue' => true,
            ]);

            $client_request = new PomwGatewayClientRequest();
            $client_request->uuid = Str::uuid();
            $client_request->client_id = $client->id;
            $client_request->customer_session_id = $session->id;
            $client_request->type = "ShopifyAppCartTransferAttempt";
            $client_request->operation = "create";
            $client_request->request_data = $shopify_cart_transfer_attempt->cart_data;
            $client_request->decoded_request_data = $cxml;
            $client_request->payload_ident = $payload_id;
            $client_request->data_headers = getHeadersAsString();
            $client_request->uri = $request->getPathInfo();
            $client_request->user_agent = $request->userAgent();
            $client_request->remote_host = $request->getClientIp();
            $client_request->response_body = $response->render();
            $client_request->save();

            $shopify_cart_transfer_attempt->has_transferred = 1;
            $shopify_cart_transfer_attempt->save();
            return $response;
        }
        $return_url = 'https://' . $client->domain . '?punchout_sess_id=' . $session->uuid . '&clear_cart=0';
        return view('gateway.shopify_checkout_final', compact(
            'cart',
            'cart_items',
            'customer',
            'return_url',
            'can_checkout',
            'calculation',
            'discount_code',
            'rates',
            'client',
            'customer',
            'message',
            'discount_message',
        ));
    }

    public function punchin(Request $request, $id)
    {
        $session = PomwGatewayClientCustomerPunchoutSession::whereUuid($id)->first();
        if (!$session) {
            $error = $this->getCXMLError(406, 'Session not found!');
            return response($error, 200, [
                'Content-Type' => 'application/xml'
            ]);
        }
        $client = $session->pomw_client;
        $input_cxml = base64_decode($request->{$client->cxmlbase64_param_override ?? 'cxml-base64'});
        $xml = simplexml_load_string($input_cxml);

        $customer = $session->pomw_client_customer;
        $client = $session->pomw_client;
        $address = $session->pomw_street_address;

        $buyer_cookie = (string) $xml->Message->PunchOutOrderMessage->BuyerCookie;

        if (!$buyer_cookie || $session->buyer_cookie != $buyer_cookie) {
            $error = $this->getCXMLError(406, 'Wrong buyer cookie!');
            return response($error, 200, [
                'Content-Type' => 'application/xml'
            ]);
        }

        $total = $xml->Message->PunchOutOrderMessage->PunchOutOrderMessageHeader->Total->Money;
        $total_shipping = $xml->Message->PunchOutOrderMessage->PunchOutOrderMessageHeader->Shipping->Money;
        $total_tax = $xml->Message->PunchOutOrderMessage->PunchOutOrderMessageHeader->Tax->Money;
        $ship_method = $xml->Message->PunchOutOrderMessage->PunchOutOrderMessageHeader->Shipping->Description;
        $items = $xml->xpath('//Message/PunchOutOrderMessage/ItemIn');

        $order = new PomwGatewayClientOrder();
        $order->uuid = Str::uuid();
        $order->customer_id = $customer->id;
        $order->account_id = $customer->account_id;
        $order->client_id = $client->id;
        $order->session_id = $session->id;
        $order->status_id = 1;
        $order->total = $total;

        $order->shipping_total = $total_shipping;

        $order->shipping_method = $ship_method;
        $order->tax_total = $total_tax;
        $order->remote_ip = $request->getClientIp();
        $order->currency = "USD";
        $order->is_rejected = 0;
        $order->is_approved = 0;
        $order->internal_id = $client->next_internal_order_id;
        if (session()->has('discount_code_usage_id')) {
            $usage = PomwGatewayClientDiscountCodeUsage::find(session()->get('discount_code_usage_id'));
            if ($usage) {
                $order->discount_code = $usage->code->label;
                $order->discount_code_usage_id = $usage->id;
            }
            session()->forget('discount_code_usage_id');
        }
        $order->save();

        foreach ($items as $key => $item) {
            $order_item = new PomwGatewayClientOrderItem();
            $order_item->uuid = Str::uuid();
            $order_item->order_id = $order->id;
            $order_item->quantity = $item->attributes()->quantity;
            $order_item->supplier_part_id = $item->ItemID->SupplierPartID;
            $order_item->supplier_auxiliary_id = $item->ItemID->SupplierPartAuxiliaryID;
            $order_item->description = $item->ItemDetail->Description;
            $order_item->unit_of_measure = $item->ItemDetail->UnitOfMeasure;
            $order_item->unit_price = $item->ItemDetail->UnitPrice->Money;
            $order_item->classification = $item->ItemDetail->Classification;
            $order_item->manufacturer_name = $item->ItemDetail->ManufacturerName;
            $order_item->leadtime = $item->ItemDetail->LeadTime;
            $order_item->overriden_auxiliary_id = $session->uuid . '/' . ($key + 1);
            $order_item->save();

            // $order_item->generateBundleItemsFromCustomQuoteIfNeeded($session);

        }

        // $order->injectShippingAndTaxFromVirtualItemsIfNeeded();

        $session->punched_in = 1;
        $session->save();

        $payload_id = $this->getPayloadId();
        $payload_timestamp = date(DateTime::RFC3339, time());
        $items = $order->pomw_order_items;
        $cxml = view('cxmls.order_transfer', compact('payload_id', 'payload_timestamp', 'session', 'client', 'order', 'items'))->render();

        $response = view('gateway.gateway', [
            'cxmlbase64' => base64_encode($cxml),
            'cxmlbase64_param' => $client->cxmlbase64_param_override ?? 'cxml-base64',
            'url' => $session->post_url,
            'continue' => true,
        ]);

        $client_request = new PomwGatewayClientRequest();
        $client_request->uuid = Str::uuid();
        $client_request->client_id = $client->id;
        $client_request->customer_session_id = $session->id;
        $client_request->type = "PunchIn";
        $client_request->operation = "create";
        $client_request->request_data = $request->{$client->cxmlbase64_param_override ?? 'cxml-base64'};
        $client_request->decoded_request_data = $xml->asXML();
        $client_request->payload_ident = $payload_id;
        $client_request->data_headers = getHeadersAsString();
        $client_request->uri = $request->getPathInfo();
        $client_request->user_agent = $request->userAgent();
        $client_request->remote_host = $request->getClientIp();
        $client_request->response_body = $response->render();
        $client_request->save();
        return $response;
    }

    public function sessionsList(Request $request)
    {
        // ,'pomw_street_address','pomw_client_request'
        $orders = PomwGatewayClientCustomerPunchoutSession::whereHasIn('pomw_client')->with(['pomw_client', 'pomw_client_customer'])->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) {
                $q->orWhereHas('pomw_client', function ($q) {
                    $q->where('name', 'like', '%' . request()->get('q') . '%');
                })->orWhereHas('pomw_client_customer', function ($q) {
                    $q->where('email', 'like', '%' . request()->get('q') . '%');
                })->orWhere('session_key', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('operation', 'like', '%' . request()->get('q') . '%')
                    ->orWhere('created_at', 'like', '%' . request()->get('q') . '%');
            });
        })->when($request->get('sort'), function ($q) use ($request) {
            $q->orderBy(...explode(' ', $request->get('sort')));
        })->when($request->get('q2'), function ($q) use ($request) {
            $q->whereIn('client_id', json_decode($request->get('q2')));
        })->cursorPaginate($request->page_count);

        $gateway_clients = PomwGatewayClient::get();

        return responseJson(true, 'Sessions retrieved Successfully retrieved successfully!', $orders, $gateway_clients);
    }

    public function fetchSessionDetail(PomwGatewayClientCustomerPunchoutSession $session)
    {
        return $session->load(['pomw_client', 'pomw_client_customer', 'pomw_street_address', 'pomw_client_request']);
    }

    public function orderRequestLists(Request $request)
    {
        // ,'pomw_street_address','pomw_client_request'
        $orders = PomwGatewayClientOrder::whereHasIn(relation: 'pomw_client')->with(['pomw_client', 'pomw_customer', 'pomw_session'])->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) {
                $q->orWhereHas('pomw_client', function ($q) {
                    $q->where('name', 'like', '%' . request()->get('q') . '%');
                })->orWhereHas('pomw_customer', function ($q) {
                    $q->where('email', 'like', '%' . request()->get('q') . '%');
                })->orWhere('id', 'like', '%' . request()->get('q') . '%');
            });
        })->when($request->get('sort'), function ($q) use ($request) {
            $q->orderBy(...explode(' ', $request->get('sort')));
        })->when($request->get('q2'), function ($q) use ($request) {
            $q->whereIn('client_id', json_decode($request->get('q2')));
        })->cursorPaginate($request->page_count);

        $gateway_clients = PomwGatewayClient::orderBy('name', "asc")->get();

        return responseJson(true, 'Order requests retrieved Successfully retrieved successfully!', $orders, $gateway_clients);
    }

    public function orderRequestDetails(PomwGatewayClientOrder $order)
    {
        return $order->load(['pomw_client', 'pomw_customer', 'pomw_session.pomw_client_request', 'pomw_order_items', 'pomw_confirmed_order.shipping_address', 'pomw_confirmed_order.billing_address', 'pomw_confirmed_order.confirmed_order_items', 'journals']);
    }

    private function deliverIfNeeded($order, $xml)
    {
        if ($order->pomw_client->disable_delivery == 1) {
            $order->addJournalEntry('Delivery Disabled');
            return;
        }

        $order->sendToShopify(simplexml_load_string($xml));
    }

    public function orderRequest(Request $request, $id)
    {
        $client = PomwGatewayClient::whereUuid($id)->first();
        $cxml = $request->getContent();
        if (!$cxml) {
            $error = $this->getCXMLError(406, 'No content found!');
            return response($error, 200, [
                'Content-Type' => 'application/xml'
            ]);
        }
        $xml = simplexml_load_string($cxml);
        $items = $xml->xpath('//Request/OrderRequest/ItemOut');

        $overriden_line_number = 0;
        $order = null;
        $session = null;
        // locating the session in the request


        foreach ($items as $key => $item) {
            $overriden_aux_id = $item->ItemID->SupplierPartAuxiliaryID;
            if ($overriden_aux_id) {
                if (str_contains($overriden_aux_id, '/LineItem')) {
                    $dom = dom_import_simplexml($item);
                    $dom->parentNode->removeChild($dom);
                } else {
                    $order_item = PomwGatewayClientOrderItem::whereOverridenAuxiliaryId($overriden_aux_id)->first();
                    if ($order_item) {
                        $overriden_line_number++;
                        $order = $order_item->pomw_order;
                    }
                    if ($order) {
                        $session = $order->pomw_session;
                    }
                    if ($client->group_id) { // belongs to group check
                        if ($session->client_id != $client->id) {
                            $client = $session->client;
                        }
                    }
                    $correct_aux_id = $order_item->supplier_auxiliary_id;
                    $dot_position = strrpos($correct_aux_id, '.');
                    if ($dot_position !== false) {
                        $correct_aux_id = substr($correct_aux_id, 0, $dot_position);
                    }
                    $cart_order_index = $key;

                    // for shopify client
                    $itemDescription = $item->ItemDetail->Description;
                    $orderDescription = $order_item->description;
                    if (Str::length($itemDescription) == 40) {
                        if ($itemDescription !== $orderDescription && Str::startsWith($orderDescription, $itemDescription)) {
                            $item->ItemDetail->Description = $order_item->description;
                        }
                    }
                    if (isset($item->attributes()->lineNumber)) {
                        $item->attributes()->lineNumber = $overriden_line_number;
                    } else {
                        $item->addAttribute('lineNumber', $overriden_line_number); //cause uab
                    }

                    $item->ItemID->SupplierPartAuxiliaryID = $correct_aux_id;
                    $item->ItemDetail->ManufacturerPartID = $order_item->manufacturer_part_id;

                    if ($session) {
                        $xml_session_key_node = $item->ItemDetail->addChild('Extrinsic', $session->uuid);
                        $xml_session_key_node->addAttribute('name', 'session_key');
                    }

                    if (isset($cart_order_index)) {
                        $xml_cart_index_node = $item->ItemDetail->addChild('Extrinsic', $cart_order_index);
                        $xml_cart_index_node->addAttribute('name', 'cart_position');
                    }

                    $handle = $item->ItemID->SupplierPartID;
                    $client_id = $session->client_id;

                    $limit = PomwGatewayClientProductQuantityLimit::whereClientId($client_id)->whereHandle($handle)->first();

                    if ($limit) {
                        $item_qty = $item->attributes()->quantity;

                        if ($limit->min > 0 && $item_qty < $limit->min) {
                            $error = $this->getCXMLError(406, 'Minimum quantity required for ' . $order_item->description . ' is ' . $limit->min);
                            return response($error, 200, [
                                'Content-Type' => 'application/xml'
                            ]);
                        }

                        if ($limit->max > 0 && $item_qty > $limit->max) {
                            $error = $this->getCXMLError(406, 'Maximum quantity required for ' . $order_item->description . ' is ' . $limit->max);
                            return response($error, 200, [
                                'Content-Type' => 'application/xml'
                            ]);
                        }

                        if ($limit->multiple > 0 && $item_qty % $limit->multiple !== 0) {
                            $error = $this->getCXMLError(406, 'Quantity for ' . $order_item->description . ' must be in multiples of ' . $limit->multiple);
                            return response($error, 200, [
                                'Content-Type' => 'application/xml'
                            ]);
                        }
                    }
                }
            }
        }

        if (!$session) {
            $error = $this->getCXMLError(406, 'Session not found!');
            return response($error, 200, [
                'Content-Type' => 'application/xml'
            ]);
        }
        $order->addJournalEntry('Request received');

        if ($order->client_id != $client->id) {
            $order->addJournalEntry('Client receiver does not match order client');

            if ($order->pomw_client->global_identity == $client->global_identity) {
                $order->addJournalEntry('Global Customer Identity shared across clients, order accepted, client updated to order client.');
                $client = $order->pomw_client;
            } else {
                $error = $this->getCXMLError(406, 'Erroneous client address for order requests');
                return response($error, 200, [
                    'Content-Type' => 'application/xml'
                ]);
            }
        }

        $payload_id = $this->getPayloadId();
        $payload_timestamp = date(DateTime::RFC3339, time());

        $response = view('cxmls.order_request_response', compact('payload_id', 'payload_timestamp', 'order'))->render();

        $client_request = new PomwGatewayClientRequest();
        $client_request->uuid = Str::uuid();
        $client_request->client_id = $client->id;
        $client_request->customer_session_id = $session->id;
        $client_request->type = "IncomingOrderRequest";
        $client_request->operation = "create";
        $client_request->request_data = $cxml;
        $client_request->decoded_request_data = $xml->asXML();
        $client_request->payload_ident = $this->getPayloadId();
        $client_request->data_headers = getHeadersAsString();
        $client_request->uri = $request->getPathInfo();
        $client_request->user_agent = $request->userAgent();
        $client_request->remote_host = $request->getClientIp();
        $client_request->response_body = $response;
        $client_request->save();



        $order->is_rejected = 0;
        $order->is_approved = 1;
        $order->is_delivered = 0;

        if (isset($xml->Request->OrderRequest->OrderRequestHeader)) {
            $order->external_id = (string) $xml->Request->OrderRequest->OrderRequestHeader->attributes()->orderID;
        }
        $order->save();
        $order->addJournalEntry('Parsed Ok');
        $order->createConfirmedOrder(simplexml_load_string($cxml));


        if ($order->pomw_client->disable_delivery == 1) {
            $order->addJournalEntry('Delivery Disabled');
        } else {
            $this->deliverIfNeeded($order, $xml->asXML());
        }
        return response($response, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    public function orderInvoicesLists(Request $request)
    {
        // ,'pomw_street_address','pomw_client_request'
        $orders = PomwGatewayClientInvoice::whereHasIn('client')->with(['order', 'client', 'status', 'items'])->when($request->get('q'), function ($q) use ($request) {
            $q->where(function ($q) {
                $q->orWhereHas('client', function ($q) {
                    $q->where('name', 'like', '%' . request()->get('q') . '%');
                })->orWhere('id', 'like', '%' . request()->get('q') . '%');
            });
        })->when($request->get('sort'), function ($q) use ($request) {
            $q->orderBy(...explode(' ', $request->get('sort')));
        })->when($request->get('q2'), function ($q) use ($request) {
            $q->whereIn('client_id', json_decode($request->get('q2')));
        })->cursorPaginate($request->page_count);

        $gateway_clients = PomwGatewayClient::orderBy('name', "asc")->get();

        return responseJson(true, 'Order requests retrieved Successfully retrieved successfully!', $orders, $gateway_clients);
    }

    public function orderInvoiceDetails(PomwGatewayClientInvoice $invoice)
    {
        $invoice->load(['items', 'order']);
        $requests = $invoice->getRequests();
        $simulated_cxml = $invoice->getGeneratedCXML();
        $journal_entries = $invoice->getJournal()->getEntries();
        $data = [
            'invoice' => $invoice,
            'requests' => $requests,
            'journal_entries' => $journal_entries,
            'simulated_cxml' => $simulated_cxml,
            'statuses' => PomwGatewayClientInvoiceStatus::all()
        ];
        return responseJson(true, 'Invoice Data retrieved Successfully retrieved successfully!', $data,);
    }

    public function CreateInvoice(Request $request)
    {

        $order = PomwGatewayClientOrder::where('id', $request->id)->first();

        $confirmedOrder = PomwGatewayClientConfirmedOrder::where('order_id', $order->id)->first();
        $items = $confirmedOrder->confirmed_order_items;

        $status = PomwGatewayClientInvoiceStatus::where('uri', 'test')->first();

        $previousInvoicesCount = PomwGatewayClientInvoice::where('order_id', $confirmedOrder->order->id)->count();

        $invSuffix = $previousInvoicesCount > 0 ? '-' . ($previousInvoicesCount + 1) : '';

        $invoice = new PomwGatewayClientInvoice();
        $invoice->status_id = $status->id;
        $invoice->order_id = $confirmedOrder->order->id;
        $invoice->client_id = $confirmedOrder->order->client_id;
        $invoice->account_id = $confirmedOrder->order->account_id;
        $invoice->external_id = $confirmedOrder->order->internal_id;
        $invoice->overriden_external_id = $confirmedOrder->order->internal_id . $invSuffix . '-INV';
        $invoice->purpose = 'standard';
        $invoice->subtotal = $confirmedOrder->total - ($confirmedOrder->shipping_total + $confirmedOrder->tax_total);
        $invoice->total = $confirmedOrder->total;
        $invoice->tax = $request->tax;
        $invoice->tax_title = 'Tax';
        $invoice->discount = $confirmedOrder->order->discount_total;
        $invoice->discount_title = $confirmedOrder->order->discount_description;
        $invoice->shipping = $request->shipping;
        $invoice->shipping_title = $confirmedOrder->order->shipping_method;
        $invoice->currency = $confirmedOrder->order->currency;
        $invoice->save();

        $invoice->addSuccessToJournal(auth()->user()->full_name . ' created Invoice from Confirmed Order: ' . $confirmedOrder->order->getVisibleId());

        foreach ($items as $key => $orderItem) {
            $item = new PomwGatewayClientInvoiceItem();
            $item->invoice_id = $invoice->id;
            $item->line_number = $orderItem->line_number ?? $key + 1;
            $item->quantity = $request->items_quantity[$orderItem->id] ?? $orderItem->quantity;
            $item->unit_price = $request->items_price[$orderItem->id] ?? $orderItem->unit_price;
            $item->part_id = $orderItem->supplier_part_id;
            $item->aux_part_id = $orderItem->supplier_auxiliary_id;
            $item->description = $orderItem->description;
            $item->subtotal = $item->unit_price * $item->quantity;
            $item->discount = $orderItem->discounted_price ?? 0.00;
            $item->row_total = $item->unit_price * $item->quantity;
            $item->unit_of_measure = $orderItem->unit_of_measure;
            $item->comment = $orderItem->manufacturer_name;
            $item->overriden_auxiliary_id = $confirmedOrder->order->pomw_session->uuid . '/' . $invoice->uuid . '.' . ($key + 1);
            $item->save();
        }

        $invoice->recalculateTotalAndSubtotals();

        return responseJson(true, 'Invoice Created Successfully');
    }

    public function CreateInvoiceFromOriginalOrder(Request $request)
    {
        $order = PomwGatewayClientOrder::where('id', $request->id)->first();

        $items = $order->pomw_order_items;

        $status = PomwGatewayClientInvoiceStatus::where('uri', 'test')->first();

        $previousInvoicesCount = PomwGatewayClientInvoice::where('order_id', $order->order->id)->count();

        $invSuffix = $previousInvoicesCount > 0 ? '-' . ($previousInvoicesCount + 1) : '';

        $invoice = new PomwGatewayClientInvoice();
        $invoice->status_id = $status->id;
        $invoice->order_id = $order->id;
        $invoice->client_id = $order->client_id;
        $invoice->account_id = $order->account_id;
        $invoice->external_id = $order->internal_id;
        $invoice->overriden_external_id = $order->internal_id . $invSuffix . '-INV';
        $invoice->purpose = 'standard';
        $invoice->subtotal = $order->total - ($order->shipping_total + $order->tax_total);
        $invoice->total = $order->total;
        $invoice->tax = $request->tax;
        $invoice->tax_title = 'Tax';
        $invoice->discount = $order->discount_total;
        $invoice->discount_title = $order->discount_description;
        $invoice->shipping = $request->shipping;
        $invoice->shipping_title = $order->shipping_method;
        $invoice->currency = $order->currency;
        $invoice->save();

        $invoice->addSuccessToJournal(auth()->user()->full_name . ' created Invoice from Confirmed Order: ' . $order->order->getVisibleId());

        foreach ($items as $key => $orderItem) {
            $item = new PomwGatewayClientInvoiceItem();
            $item->invoice_id = $invoice->id;
            $item->line_number = $key + 1;
            $item->quantity = $request->items_quantity[$orderItem->id] ?? $orderItem->quantity;
            $item->unit_price = $request->items_price[$orderItem->id] ?? $orderItem->unit_price;
            $item->part_id = $orderItem->supplier_part_id;
            $item->aux_part_id = $orderItem->supplier_auxiliary_id;
            $item->description = $orderItem->description;
            $item->subtotal = $item->unit_price * $item->quantity;
            $item->discount = $orderItem->discounted_price ?? 0.00;
            $item->row_total = $item->unit_price * $item->quantity;
            $item->unit_of_measure = $orderItem->unit_of_measure;
            $item->comment = $orderItem->manufacturer_name;
            $item->overriden_auxiliary_id = $order->pomw_session->uuid . '/' . $invoice->uuid . '.' . ($key + 1);
            $item->save();
        }

        $invoice->recalculateTotalAndSubtotals();

        return responseJson(true, 'Invoice Created Successfully');
    }

    public function orderInvoicePush(PomwGatewayClientInvoice $invoice)
    {
        $invoice->addSuccessToJournal(auth()->user()->name . ' pushed invoice');
        // $response = $invoice->push();
        return responseJson(true, 'Invoice Pushed Successfully');
    }
    public function orderInvoiceUpdate(PomwGatewayClientInvoice $invoice, PomwGatewayClientInvoiceStatus $status)
    {
        $invoice->status_id = $status->id;
        $invoice->save();
        return responseJson(true, 'Invoice Updated Successfully');
    }
    public function recreateConfirmOrder(PomwGatewayClientOrder $order)
    {

        $confirmed_order = PomwGatewayClientConfirmedOrder::where('order_id', $order->id)->first();
        if (empty($confirmed_order)) {
            return responseJson(false, 'no confirm order found');
        }
        $confirmed_order->delete();
        $order->createConfirmedOrder(simplexml_load_string($order->getIncomingRequestData()));
        return responseJson(true, 'confirm order created successfully');
    }

    public function profile($id)
    {
        $client = PomwGatewayClient::whereUuid($id)->first();
        if (!$client) {
            $error = $this->getCXMLError(406, 'Client not found!');
            return response($error, 200, [
                'Content-Type' => 'application/xml'
            ]);
        }
        $payload_id = $this->getPayloadId();
        $payload_timestamp = date(DateTime::RFC3339, time());
        $cxml = view('cxmls.profile', compact('client', 'payload_id', 'payload_timestamp'))->render();
        return response($cxml, 200, [
            'Content-Type' => 'application/xml'
        ]);
    }

    public function credentials(Request $request, $id)
    {
        $gatewayClient = PomwGatewayClient::where('uuid', $id)->first();
        $loggedIn = false;
        if (Session::has('gateway_client_id') && Session::get('gateway_client_id') == $gatewayClient->id) {
            $loggedIn = true;
        }
        $data = [
            'gatewayClient' => $gatewayClient,
            'loggedIn' => $loggedIn,
        ];
        return inertia('Applications/Punchout/Developer/ClientCredentials', $data);
    }
    public function authenticateCredentials(Request $request, $id)
    {
        $gatewayClient = PomwGatewayClient::where('uuid', $id)->first();
        $validator = Validator::make($request->all(), [
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'errors', 'errors' => $validator->errors()], 422);
        }
        $password = $gatewayClient->credentials_password;
        if (Hash::check($request->password, $password)) {
            Session::put('gateway_client_id', $gatewayClient->id);
            return response()->json(['success' => true, 'message' => 'Logged in successfully'], 200);
        } else {
            return response()->json(['success' => false, 'message' => 'errors', 'errors' => ['password' => ['Password does not match']]], 422);
        }
    }
    public function createNote(Request $request, PomwGatewayClientOrder $order)
    {
        $order->note = $request->note;
        $order->save();
        return sendResponse(true, 'success');
    }
    public function createInvoiceNote(Request $request, PomwGatewayClientInvoice $invoice)
    {
        $invoice->note = $request->note;
        $invoice->save();
        return sendResponse(true, 'success');
    }
}
