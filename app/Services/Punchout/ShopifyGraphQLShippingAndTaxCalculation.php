<?php

namespace App\Services\Punchout;

use App\Models\Punchout\PomwGatewayClientCustomerPunchoutSession;
use App\Models\Punchout\PomwGatewayClientDiscountCode;

class ShopifyGraphQLShippingAndTaxCalculation
{
    /**
     * @var float
     */
    private $tax_total;

    /**
     * @var float
     */
    private $subtotal;

    /**
     * @var float
     */
    private $total;

    /**
     * @var float
     */
    private $shipping_total;
    /**
     * @var array
     */

    private $shop;
    private $client;
    private $shipping_rates;
    private $shipping_address;
    private $billing_address;
    private $customer;



    public function __construct(public PomwGatewayClientCustomerPunchoutSession $session, public $cart_items, public ?PomwGatewayClientDiscountCode $discount_code = null)
    {
        $this->client = $session->pomw_client;
        $this->shop = $this->client->user;
        $this->shipping_address = $session->pomw_street_address;
        $this->customer = $session->pomw_client_customer;
        $this->billing_address = $this->shipping_address;
        $this->tax_total = 0;
        $this->subtotal = $this->getItemsTotal();
        $this->total = $this->subtotal;
        $this->shipping_total = 0.00;
        $this->shipping_rates =  [];
        $this->discount_code = $discount_code;
    }

    private function getItemsTotal()
    {
        $total = 0;
        foreach ($this->cart_items as $item) {
            $total += $item['quantity'] * ($item['price'] / 100);
        }

        return $total;
    }

    public function setShippingAddress($address)
    {
        $this->shipping_address = $address;
    }

    public function setBillingAddress($address)
    {
        $this->billing_address = $address;
    }


    public function execute()
    {
        $result = $this->shop->api()->graph($this->getQuery(), $this->getVariables());
        $this->tax_total = isset($result['body']->data->draftOrderCalculate->calculatedDraftOrder->totalTax) ? $result['body']->data->draftOrderCalculate->calculatedDraftOrder->totalTax : 0.00;
        $this->subtotal = isset($result['body']->data->draftOrderCalculate->calculatedDraftOrder->subtotalPrice) ? $result['body']->data->draftOrderCalculate->calculatedDraftOrder->subtotalPrice : 0.00;
        $this->total = isset($result['body']->data->draftOrderCalculate->calculatedDraftOrder->totalPrice) ? $result['body']->data->draftOrderCalculate->calculatedDraftOrder->totalPrice : 0.00;
        $this->shipping_total = isset($result['body']->data->draftOrderCalculate->calculatedDraftOrder->totalShippingPrice) ? $result['body']->data->draftOrderCalculate->calculatedDraftOrder->totalShippingPrice : 0.00;
        $this->shipping_rates = isset($result['body']->data->draftOrderCalculate->calculatedDraftOrder->availableShippingRates->container) ? $result['body']->data->draftOrderCalculate->calculatedDraftOrder->availableShippingRates->container : [];
    }


    private function getQuery()
    {
        return 'mutation draftOrderCalculate($input: DraftOrderInput!) {
          draftOrderCalculate(input: $input) {
            calculatedDraftOrder {
              subtotalPrice
              totalPrice
              totalShippingPrice
              totalTax
              availableShippingRates {
                  handle
                  title
                  price {
                      amount
                  }
              }
            }
            userErrors {
              field
              message
            }
          }
        }';
    }


    private function getVariables()
    {
        $datum = [];

        $shipping_address_datum['country'] = $this->shipping_address->country;
        $shipping_address_datum['province'] = $this->shipping_address->state;
        $shipping_address_datum['address1'] = $this->shipping_address->line1;
        $shipping_address_datum['address2'] = $this->shipping_address->line2;
        $shipping_address_datum['city'] = $this->shipping_address->city;
        $shipping_address_datum['zip'] = $this->shipping_address->zip;
        $shipping_address_datum['firstName'] = $this->customer->firstname;
        $shipping_address_datum['lastName'] = $this->customer->lastname;

        $billing_address_datum['country'] = $this->billing_address->country;
        $billing_address_datum['province'] = $this->billing_address->state;
        $billing_address_datum['address1'] = $this->billing_address->line1;
        $billing_address_datum['address2'] = $this->billing_address->line2;
        $billing_address_datum['city'] = $this->billing_address->city;
        $billing_address_datum['zip'] = $this->billing_address->zip;
        $billing_address_datum['firstName'] = $this->customer->firstname;
        $billing_address_datum['lastName'] = $this->customer->lastname;

        $datum['email'] = $this->customer->email;
        $datum['shippingAddress'] = $shipping_address_datum;
        $datum['billingAddress'] = $billing_address_datum;

        $line_items = [];
        foreach ($this->cart_items as $item) {
            $line_item = new \stdClass();
            $line_item->quantity = $item['quantity'];
            $line_item->variantId = 'gid://shopify/ProductVariant/' . $item['variant_id'];
            $line_items[] = $line_item;
        }

        $datum['lineItems'] = $line_items;
        $wrapper = [];
        $wrapper['input'] = $datum;
        return $wrapper;
    }



    /**
     * @return float
     */
    public function getTaxTotal(): float
    {
        if ($this->client->tax_free === 1)
            return 0.00;

        return $this->tax_total;
    }

    /**
     * @return float
     */
    public function getSubtotal(): float
    {
        return $this->subtotal;
    }

    public function getUnmodifiedTotal()
    {
        return $this->total;
    }

    /**
     * @return float
     */
    public function getTotal(): float
    {
        $total = $this->total;

        if ($this->client->tax_free === 1)
            $total -= $this->tax_total;

        if ($this->discount_code) {
            $total -= $this->discount_code->getDiscountForTotal($total);

            if ($total < 0)
                $total = 0;
        }

        return $total;
    }

    /**
     * @return float
     */
    public function getShippingTotal(): float
    {
        return $this->shipping_total;
    }

    /**
     * @return array
     */
    public function getShippingRates(): array
    {
        return $this->shipping_rates;
    }

    public function getTaxPercentageRate()
    {
        if ($this->client->tax_free === 1)
            return 0.00;

        $tax_rate = ($this->getTaxTotal() / $this->getTotal());

        return round($tax_rate, 2);
    }
}
