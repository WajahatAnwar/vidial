<?php

namespace App\Services\Punchout;

use App\Models\Punchout\PomwGatewayClientConfirmedOrder;
use App\Models\Punchout\PomwGatewayClientConfirmedOrderItem;
use App\Models\Punchout\PomwGatewayClientOrder;
use App\Models\Punchout\PomwStreetAddress;
use App\Services\Punchout\IncomingOrderRequestCxmlParser;
use Illuminate\Support\Str;

class PomwGatewayClientConfirmedOrderFactory
{

    /**
     * @var POMW_GatewayClientOrder
     */
    private $parent_order;

    /**
     * @var SimpleXMLElement
     */
    private $xml;


    /**
     * POMW_GatewayClientConfirmedOrderFactory constructor.
     * @param POMW_GatewayClientOrder $order
     */
    public function __construct(PomwGatewayClientOrder $order, $xml)
    {
        $this->parent_order = $order;

        $this->xml = $xml;
    }


    /**
     * @return POMW_GatewayClientConfirmedOrder|null
     */
    public function createConfirmedOrder()
    {
        if (!isset($this->xml))
            return null;

        $xml = $this->xml;

        $parser = new IncomingOrderRequestCxmlParser($xml);

        $order = new PomwGatewayClientConfirmedOrder();
        $order->uuid = Str::uuid();
        $order->order_id = $this->parent_order->id;

        $order->from_domain = $parser->getFromDomain();
        $order->from_identity = $parser->getFromIdentity();

        $order->to_domain = $parser->getToDomain();
        $order->to_identity = $parser->getToIdentity();

        $order->sender_domain = $parser->getSenderDomain();
        $order->sender_identity = $parser->getSenderIdentity();
        $order->sender_shared_secret = $parser->getSenderSharedSecret();
        $order->sender_user_agent = $parser->getSenderUserAgent();

        $order->deployment_mode = $parser->getDeploymentMode();

        $order->date = $parser->getOrderDate();
        $order->external_id = $parser->getExternalId();

        $order->type = $parser->getType();

        $order->total = $parser->getTotal();
        $order->tax_total = $parser->getTaxTotal();
        $order->shipping_total = $parser->getShippingTotal();
        $order->shipping_method = $parser->getShippingDescription();

        $order->currency = $parser->getCurrency();


        $bill_to_node = $parser->getBillTo();
        if ($bill_to_node)
            $order->shipping_address_id = $this->createAddress($bill_to_node, $this->parent_order->session_id)->id;

        $ship_to_node = $parser->getShipTo();
        if ($ship_to_node)
            $order->billing_address_id  = $this->createAddress($ship_to_node, $this->parent_order->session_id)->id;

        $order->xml = $xml->asXML();
        $order->save();

        $items = $parser->getItems();

        foreach ($items as $itemXml)
        {
            $item = new PomwGatewayClientConfirmedOrderItem();
            $item->uuid = Str::uuid();
            $item->order_id = $order->id;
            $item->description = $itemXml->ItemDetail->Description;
            $item->unit_of_measure = $itemXml->ItemDetail->UnitOfMeasure;
            $item->unit_price = $itemXml->ItemDetail->UnitPrice->Money;
            $item->classification = $itemXml->ItemDetail->Classification;
            $item->supplier_part_id = $itemXml->ItemID->SupplierPartID;
            $item->supplier_auxiliary_id = $itemXml->ItemID->SupplierPartAuxiliaryID;
            $item->manufacturer_name = $itemXml->ItemDetail->ManufacturerName;
            $item->manufacturer_part_id = $itemXml->ItemDetail->ManufacturerPartID;
            $item->quantity = $itemXml->attributes()->quantity;
            $item->line_number = $itemXml->attributes()->lineNumber;
            $item->save();
        }

        return $order;
    }


    /**
     * @param $addressXml
     * @param $session_id
     * @return POMW_StreetAddress
     */
    private function createAddress($addressXml, $session_id)
    {
        $address = new PomwStreetAddress();
        $address->customer_session_id = $session_id;

        if (isset($addressXml->PostalAddress->DeliverTo))
            $address->deliver_to = $addressXml->PostalAddress->DeliverTo;

        if (isset($addressXml->PostalAddress->Street))
            $address->line1 = simplexml_read_entire_element($addressXml->PostalAddress->Street);

        if (isset($addressXml->PostalAddress->City))
            $address->city = $addressXml->PostalAddress->City;

        if (isset($addressXml->PostalAddress->State))
            $address->state = $addressXml->PostalAddress->State;

        if (isset($addressXml->PostalAddress->PostalCode))
            $address->zip = $addressXml->PostalAddress->PostalCode;

        if (isset($addressXml->PostalAddress->Country))
            $address->country = $addressXml->PostalAddress->Country->attributes()->isoCountryCode;

        if (isset($addressXml->Name))
            $address->label = $addressXml->Name;

        if (isset($addressXml->Email))
            $address->email = $addressXml->Email;

        $address->ident = $addressXml->attributes()->addressID;

        $address->save();

        return $address;
    }

}
