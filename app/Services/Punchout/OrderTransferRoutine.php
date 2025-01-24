<?php

namespace App\Services\Punchout;

use App\Models\Punchout\PomwGatewayClientDiscountCodeUsage;
use App\Models\Punchout\PomwGatewayClientOrderItemCustomAttribute;
use App\Models\Punchout\PomwGatewayClientRequest;
use App\Services\Punchout\IncomingOrderRequestCxmlParser;
use App\Services\Punchout\ShopifyGraphQLShippingAndTaxCalculation;
use Illuminate\Support\Str;

class OrderTransferRoutine
{
    private $client;
    private $session;
    private $deductable_inventory_items;
    public function __construct(public $order)
    {
        $this->client = $order->pomw_client;
        $this->session = $order->pomw_session;
        $this->deductable_inventory_items = [];
    }

    private function addDeductableItem($variant_id, $quantity)
    {
        $this->deductable_inventory_items[] = ['variant_id' => $variant_id, 'quantity' => $quantity];
    }

    public function doTransfer($xml)
    {
        $url = '/admin/api/' . config('shopify-app.api_version') . '/orders.json';
        $items = [];

        $parser = new IncomingOrderRequestCxmlParser($xml);

        $item_last_offset = [];

        foreach ($parser->getItems() as $item) {
            $properties = array();

            if(!isset($item_last_offset[(string) $item->ItemID->SupplierPartAuxiliaryID])) {
                $item_last_offset[(string) $item->ItemID->SupplierPartAuxiliaryID] = 0;
            }
            $last_offset = $item_last_offset[(string) $item->ItemID->SupplierPartAuxiliaryID];
            $custom_attributes = PomwGatewayClientOrderItemCustomAttribute::whereItemId((string) $item->ItemID->SupplierPartAuxiliaryID)->whereSessionId($this->session->id)->skip($last_offset)->take(200)->get();

            $properties = [];

            if (empty($custom_attributes)) {
                $properties = ['INFO' => (string)$item->ItemDetail->Description];
            } else {
                foreach ($custom_attributes as $key => $custom_attribute) {
                    if(!isset($properties[$custom_attribute->key])) {
                        $properties[$custom_attribute->key] = $custom_attribute->value;
                        $item_last_offset[(string) $item->ItemID->SupplierPartAuxiliaryID]++;
                    }
                }
            }

            $items[] = ['variant_id' => (string)$item->ItemID->SupplierPartAuxiliaryID, 'quantity' => (int)$item->attributes()->quantity, 'properties' => $properties, 'price' => (string)$item->ItemDetail->UnitPrice->Money];


            $this->addDeductableItem((string)$item->ItemID->SupplierPartAuxiliaryID, (int)$item->attributes()->quantity);
        }

        //

        $billing_address = $this->order->getBillingAddress();
        $billing_address_datum = array();

        $billing_address_datum['name'] = (string)$billing_address->attributes()->addressID;
        $billing_address_datum['company'] = (string)$billing_address->PostalAddress->DeliverTo;
        $billing_address_datum['country_code'] = (string)$billing_address->PostalAddress->Country->attributes()->isoCountryCode;

        $billing_address_datum['province'] = (string)$billing_address->PostalAddress->State;

        $billing_address_datum['address1'] = $parser->getBillToStreetAddress();
        $billing_address_datum['city'] = (string)$billing_address->PostalAddress->City;
        $billing_address_datum['first_name'] = $this->order->pomw_session->pomw_client_customer->firstname;
        $billing_address_datum['last_name'] = $this->order->pomw_session->pomw_client_customer->lastname;
        //$billing_address_datum['phone'] = (string)$billing_address->PostalAddress->City;
        $billing_address_datum['zip'] = (string)$billing_address->PostalAddress->PostalCode;

        //
        $shipping_address = $this->order->getShippingAddress();
        $shipping_address_datum = array();

        $shipping_address_datum['name'] = (string)$shipping_address->attributes()->addressID;
        $shipping_address_datum['company'] = (string)$shipping_address->PostalAddress->DeliverTo;
        $shipping_address_datum['country_code'] = (string)$shipping_address->PostalAddress->Country->attributes()->isoCountryCode;

        $shipping_address_datum['province'] = (string)$shipping_address->PostalAddress->State;

        $shipping_address_datum['address1'] = $parser->getShipToStreetAddress();
        $shipping_address_datum['city'] = (string)$shipping_address->PostalAddress->City;
        $shipping_address_datum['first_name'] = $this->order->pomw_session->pomw_client_customer->firstname;
        $shipping_address_datum['last_name'] = $this->order->pomw_session->pomw_client_customer->lastname;
        //$shipping_address_datum['phone'] = (string)$shipping_address->PostalAddress->Phone;
        $shipping_address_datum['zip'] = (string)$shipping_address->PostalAddress->PostalCode;

        //

        $customer_datum = [];
        $customer_datum['first_name'] = $this->order->pomw_customer->firstname;
        $customer_datum['last_name'] = $this->order->pomw_customer->lastname;
        $customer_datum['email'] = $this->order->pomw_customer->email;

        $order_data = [];
        $order_data['email'] = $this->order->pomw_customer->email;

        $incoming_phone_num = $parser->getShipToTelephone();

        if (!empty($incoming_phone_num)) {
            $order_data['phone'] = $incoming_phone_num;
        } elseif (!empty($this->order->pomw_customer->phone)) {
            $order_data['phone'] = $this->order->pomw_customer->phone;
        } else {
            $order_data['phone'] = '+13125551212';
        }

        $order_data['fulfillment_status'] = null;
        $order_data['financial_status'] = 'paid';
        $order_data['send_receipt'] = false;
        $order_data['send_fulfillment_receipt'] = false;
        $order_data['line_items'] = $items;
        $order_data['billing_address'] = $billing_address_datum;
        $order_data['shipping_address'] = $shipping_address_datum;
        $order_data['customer'] = $customer_datum;
        $order_data['currency'] = $this->order->currency;
        $order_data['inventory_behaviour'] = 'decrement_obeying_policy';

        $order_data['note_attributes'][] = ['name' => 'PO ID', 'value' => $this->order->external_id];

        if (!empty($this->order->discount_code_usage_id)) {
            $usage = PomwGatewayClientDiscountCodeUsage::find($this->order->discount_code_usage_id);

            if (!empty($usage)) {
                $usage_type = $usage->code->type->uri;

                if ($usage_type == 'gift_card') {
                    $usage_type = 'fixed_amount';
                    $order_data['note_attributes'][] = ['name' => 'Gift Card Code', 'value' => $this->order->discount_code];
                } else {
                    $order_data['note_attributes'][] = ['name' => 'Discount Code', 'value' => $this->order->discount_code];
                }

                $order_data['note_attributes'][] = ['name' => 'Amount Applied:', 'value' => $usage->getFormattedAppliedAmount()];

                //$order_data['discount_codes'][] = ['code' => $usage->code->label, 'amount' => $usage->applied_amount, 'type' => $usage_type];

                $this->order->addJournalEntry($usage->code->label . ' Discount Code was applied to order for: ' . $usage->getFormattedAppliedAmount());
            }
        }


        if (!empty($this->session->custom_shipper_account_number)) {
            array_push($order_data['note_attributes'], ['name' => 'Custom Shipping Provider', 'value' => $this->session->custom_shipper_name]);
            array_push($order_data['note_attributes'], ['name' => 'Custom Shipping Account Number', 'value' => $this->session->custom_shipper_account_number]);
        }

        if ($parser->hasHeaderComments()) {
            $comments = $parser->getHeaderComments();

            if (is_string($comments))
                $order_data['note'] = $comments;
        }

        if (!$this->client->shouldCalculateShippingAndTaxesOnIncomingOrder()) {

            if (!empty($parser->getShippingDescription())) {
                $shipping_line = [];
                $shipping_line['code'] = $parser->getShippingDescription();
                $shipping_line['title'] = $parser->getShippingDescription();
                $shipping_line['price'] = $parser->getShippingTotal();

                $order_data['shipping_lines'] = [(object)$shipping_line];
            }

            if ($this->client->shouldShippingBeLineItem()) {
                $shipping_line = [];
                $shipping_line['code'] = $this->order->shipping_method;
                $shipping_line['title'] = $this->order->shipping_method;
                $shipping_line['price'] = $this->order->shipping_total;

                $order_data['shipping_lines'] = [(object)$shipping_line];

                $this->order->addJournalEntry('Client requires shipping as lineitem, shipping cost restored from original order');
            }

            if ($parser->getTaxTotal() > 0) {
                if (@$order_data['shipping_address']['country_code'] == 'CA') {
                    // Canada
                } else {
                    $order_data['total_tax'] = $parser->getTaxTotal();

                    $tax_line = [];
                    $tax_line['title'] = 'Total Taxes';
                    $tax_line['price'] = $parser->getTaxTotal();
                    $tax_line['rate'] = $parser->getTaxPercentageRate();

                    $order_data['tax_lines'] = [(object)$tax_line];
                }
            }

            if ($this->client->shouldTaxBeLineItem()) {
                if (@$order_data['shipping_address']['country_code'] == 'CA') {
                    // Canada
                } else {
                    $order_data['total_tax'] = $this->order->tax_total;

                    $tax_line = [];
                    $tax_line['title'] = 'Total Taxes';
                    $tax_line['price'] = $this->order->tax_total;

                    $tax_rate = ($this->order->tax_total / $this->order->total);
                    $tax_line['rate'] = round($tax_rate, 2);

                    $order_data['tax_lines'] = [(object)$tax_line];

                    $this->order->addJournalEntry('Client requires tax as lineitem, tax cost restored from original order');
                }
            }
        } else {
            $calculation_items = [];

            foreach ($parser->getItems() as $item) {
                $calculation_items[] = (object) ['variant_id' => $item->ItemID->SupplierPartAuxiliaryID, 'quantity' => (int)$item->attributes()->quantity, 'price' => (float)$item->ItemDetail->UnitPrice->Money];
            }


            $calculation = new ShopifyGraphQLShippingAndTaxCalculation($this->session, $calculation_items);

            $confirmed_order = $this->order->getConfirmedOrder();
            if (!empty($confirmed_order)) {
                $shipping_address = $confirmed_order->shipping_address;
                if (!empty($shipping_address)) {
                    $calculation->setShippingAddress($shipping_address);
                    $this->order->addJournalEntry('Incoming order shipping address will be used for shipping and taxes calculation');
                }

                $billing_address = $confirmed_order->billing_address;
                if (!empty($billing_address)) {
                    $calculation->setBillingAddress($billing_address);
                    $this->order->addJournalEntry('Incoming order billing address will be used for shipping and taxes calculation');
                }
            }

            $calculation->execute();

            $should_recalculate_order_total = false;

            $rates = $calculation->getShippingRates();
            if (!empty($rates)) {
                $rate = $rates[0];

                $this->order->addJournalEntry('Shopify calculated shipping rate: "' . $rate['title'] . '" with amount: ' . $rate['price']['amount']);

                $shipping_line = [];
                $shipping_line['code'] = $rate['handle'];
                $shipping_line['title'] = $rate['title'];
                $shipping_line['price'] = $rate['price']['amount'];

                $order_data['shipping_lines'] = [(object)$shipping_line];

                $confirmed_order = $this->order->confirmed_order;
                if (!empty($confirmed_order)) {
                    $confirmed_order->shipping_total = $rate['price']['amount'];
                    $confirmed_order->save();

                    $should_recalculate_order_total = true;

                    $this->order->addJournalEntry('Confirmed order shipping total was updated to the amount calculated by Shopify');
                }
            }

            if ($calculation->getTaxTotal() > 0) {
                if (@$order_data['shipping_address']['country_code'] == 'CA') {
                    // Canada
                } else {
                    $tax_line = [];
                    $tax_line['title'] = 'Total Taxes';
                    $tax_line['price'] = $calculation->getTaxTotal();
                    $tax_line['rate'] = $calculation->getTaxPercentageRate();

                    $order_data['tax_lines'] = [(object)$tax_line];
                    $order_data['total_tax'] = $calculation->getTaxTotal();

                    $this->order->addJournalEntry('Shopify calculated taxes with an amount of: ' . $tax_line['price']);

                    $confirmed_order = $this->order->confirmed_order;
                    if (!empty($confirmed_order)) {
                        $confirmed_order->tax_total = $tax_line['price'];
                        $confirmed_order->save();

                        $should_recalculate_order_total = true;

                        $this->order->addJournalEntry('Confirmed order tax total was updated to the amount calculated by Shopify');
                    }
                }
            }

            if ($should_recalculate_order_total) {
                $confirmed_order = $this->order->confirmed_order;
                $confirmed_order->recalculateTotal();
            }
        }


        $data['order'] = $order_data;
        $request = request();
        $user = $this->client->user;
        $response = $user->api()->rest('POST', $url, $data);

        $client_request = new PomwGatewayClientRequest();
        $client_request->uuid = Str::uuid();
        $client_request->client_id = $this->client->id;
        $client_request->customer_session_id = $this->session->id;
        $client_request->type = "ShopifyOrderTransfer ";
        $client_request->operation = "create";
        $client_request->request_data = json_encode($data);
        $client_request->decoded_request_data = json_encode($data);
        $client_request->payload_ident = $this->session->getPayloadId();
        $client_request->data_headers = json_encode([
            'Content-Type' => 'application/json',
        ]);
        $client_request->uri = $request->getPathInfo();
        $client_request->user_agent = $request->userAgent();
        $client_request->remote_host = $request->getClientIp();
        $client_request->response_body = json_encode($response['body']);
        $client_request->save();

        if ($response['status'] == 201) {
            return [$response['body']['order']['name'] , $response['body']['order']['id']];
        }

        return null;
    }
}
