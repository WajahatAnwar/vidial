<?php

namespace App\Services\Punchout;


/**
 * Class IncomingOrderRequestCxmlParser
 * @package CXMLParser
 */
class IncomingOrderRequestCxmlParser
{

    /**
     * IncomingOrderRequestCxmlParser constructor.
     * @param $xml
     */
    public function __construct(public $xml)
    {
        $this->xml = $xml;
    }

    /**
     * @return string
     */
    public function getFromDomain()
    {
        if (isset($this->xml->Header->From->Credential))
        {
            return (string) $this->xml->Header->From->Credential->attributes()->domain;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getFromIdentity()
    {
        if (isset($this->xml->Header->From->Identity))
        {
            return (string) $this->xml->Header->From->Identity;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getToDomain()
    {
        if (isset($this->xml->Header->To->Credential))
        {
            return (string) $this->xml->Header->To->Credential->attributes()->domain;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getToIdentity()
    {
        if (isset($this->xml->Header->To->Identity))
        {
            return (string) $this->xml->Header->To->Identity;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getSenderDomain()
    {
        if (isset($this->xml->Header->Sender->Credential))
        {
            return (string) $this->xml->Header->Sender->Credential->attributes()->domain;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getSenderIdentity()
    {
        if (isset($this->xml->Header->Sender->Credential->Identity))
        {
            return (string) $this->xml->Header->Sender->Credential->Identity;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getSenderSharedSecret()
    {
        if (isset($this->xml->Header->Sender->Credential->SharedSecret))
        {
            return (string) $this->xml->Header->Sender->Credential->SharedSecret;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getSenderUserAgent()
    {
        if (isset($this->xml->Header->Sender->Credential->UserAgent))
        {
            return (string) $this->xml->Header->Sender->Credential->UserAgent;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getDeploymentMode()
    {
        if (isset($this->xml->Request))
        {
            return (string)$this->xml->Request->attributes()->deploymentMode;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getOrderDate()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader))
        {
            return (string)$this->xml->Request->OrderRequest->OrderRequestHeader->attributes()->orderDate;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getExternalId()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader))
        {
            return (string)$this->xml->Request->OrderRequest->OrderRequestHeader->attributes()->orderID;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getType()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader))
        {
            return (string)$this->xml->Request->OrderRequest->OrderRequestHeader->attributes()->type;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getTotal()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->Total->Money))
        {
            return (string)$this->xml->Request->OrderRequest->OrderRequestHeader->Total->Money;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getTaxTotal()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->Tax->Money))
        {
            return (string)$this->xml->Request->OrderRequest->OrderRequestHeader->Tax->Money;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getShippingTotal()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->Shipping->Money))
        {
            return (string)$this->xml->Request->OrderRequest->OrderRequestHeader->Shipping->Money;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getShippingDescription()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->Shipping->Description))
        {
            return (string)$this->xml->Request->OrderRequest->OrderRequestHeader->Shipping->Description;
        }

        return "";
    }

    /**
     * @return string
     */
    public function getCurrency()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->Total->Money))
        {
            return (string)$this->xml->Request->OrderRequest->OrderRequestHeader->Total->Money->attributes()->currency;
        }

        return "";
    }

    /**
     * @return \SimpleXMLElement|null
     */
    public function getBillTo()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->BillTo->Address))
        {
            return $this->xml->Request->OrderRequest->OrderRequestHeader->BillTo->Address;
        }

        return null;
    }

    /**
     * @return \SimpleXMLElement|null
     */
    public function getShipTo()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address))
        {
            return $this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address;
        }

        return null;
    }

    public function getShipToTelephone()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address->Phone->TelephoneNumber->Number))
        {
            $number = '';

            if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address->Phone->TelephoneNumber->CountryCode))
                $number = (string)$this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address->Phone->TelephoneNumber->CountryCode;

            if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address->Phone->TelephoneNumber->AreaOrCityCode))
                $number .= $this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address->Phone->TelephoneNumber->AreaOrCityCode;

            if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address->Phone->TelephoneNumber->Number))
                $number .= $this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address->Phone->TelephoneNumber->Number;

            if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address->Phone->TelephoneNumber->Extension))
                $number .= $this->xml->Request->OrderRequest->OrderRequestHeader->ShipTo->Address->Phone->TelephoneNumber->Extension;

            return $number;
        }

        return null;
    }

    /**
     * @return array
     */
    public function getItems()
    {
        $items = array();

        foreach($this->xml->Request->OrderRequest->ItemOut as $item)
        {
            $items[] = $item;
        }

        return $items;
    }

    public function getHeaderComments()
    {
        if (isset($this->xml->Request->OrderRequest->OrderRequestHeader->Comments))
        {
            return $this->xml->Request->OrderRequest->OrderRequestHeader->Comments;
        }

        return null;
    }

    public function hasHeaderComments()
    {
        return $this->getHeaderComments() != null;
    }

    public function getTaxPercentageRate()
    {
        $tax_rate = (($this->getTaxTotal()/$this->getTotal()));

        return round($tax_rate, 2);
    }


    public function getShippingTotalFromInjectedLineItem()
    {
        $items = $this->getItems();

        foreach ($items as $item)
        {
            if ($item->ItemID->SupplierPartAuxiliaryID == 'Shipping/LineItem') {
                return (float)$item->ItemDetail->UnitPrice->Money;
            }
        }

        return 0;
    }

    public function getPayloadId()
    {
        return $this->xml->attributes()->payloadID;
    }

    public function getTimestamp()
    {
        return $this->xml->attributes()->timestamp;
    }

    public function getBillToStreetAddress()
    {
        $address = $this->getBillTo();

        if ($address)
            return self::readEntireStreet($address);

        return null;
    }

    public function getShipToStreetAddress()
    {
        $address = $this->getShipTo();

        if ($address)
            return self::readEntireStreet($address);

        return null;
    }

    private static function readEntireStreet($address)
    {
        if (isset($address->PostalAddress->Street))
        {
            return simplexml_read_entire_element($address->PostalAddress->Street);
        }

        return "";
    }



}
