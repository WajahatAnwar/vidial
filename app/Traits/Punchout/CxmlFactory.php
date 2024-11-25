<?php

namespace App\Traits\Punchout;

use DateTime;

trait CxmlFactory
{
    public function __construct() {}

    public function getPayloadId()
    {
        $s = time();
        $s .= "." . getmypid();
        $s .= "." . random_int(10000000, 99999999);

        $s .= '@' . parse_url(url(''), PHP_URL_HOST);

        return $s;
    }

    public function getTimestamp()
    {
        return date(DateTime::RFC3339, time());
    }

    public function getFromDomain()
    {
        return "NetworkId";
    }

    public function getFromIdentity()
    {
        return "";
    }

    public function getToDomain()
    {
        return "DUNS";
    }

    public function getToIdentity()
    {
        return "";
    }

    public function getSenderDomain()
    {
        return "NetworkId";
    }

    public function getSenderIdentity()
    {
        return "";
    }

    public function getPunchoutOrderReceiverUrl($session_uuid)
    {
        return route('punchout.simulator.punchin', $session_uuid);
    }

    public function getCXMLError($code = "406", $description = "Bad Request")
    {
        $payloadId = $this->getPayloadId();
        $timestamp = $this->getTimestamp();

        $html = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
                <!DOCTYPE cXML SYSTEM \"http://xml.cxml.org/schemas/cXML/1.2.020/cXML.dtd\">
                <cXML xml:lang=\"en-US\" timestamp=\"$timestamp\" payloadID=\"$payloadId\">
                  <Response>
                    <Status text=\"Not Acceptable\" code=\"$code\">$description</Status>
                  </Response>
                </cXML>";

        return $html;
    }
}
