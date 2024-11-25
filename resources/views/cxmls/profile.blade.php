<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cXML.org/schemas/cXML/1.2.048/cXML.dtd">
<cXML payloadID="{{ $payload_id }}" timestamp="{{ $payload_timestamp }}" version="1.0" xml:lang="en">
    <Response>
        <Status code="200" text="OK" />
        <ProfileResponse effectiveDate="2019-03-12T18:39:10-08:00">
            <Transaction requestName="PunchOutSetupRequest">
                <URL>{{ $client->getPunchoutStartUrl() }}</URL>
            </Transaction>
            <Transaction requestName="OrderRequest">
                <URL>{{ $client->getOrderRequestUrl() }}</URL>
            </Transaction>
            @if (!empty($client->invoice_receiver_url))
                <Transaction requestName="InvoiceDetailRequest">
                    <URL>{{ $client->invoice_receiver_url }}</URL>
                </Transaction>
            @endif
        </ProfileResponse>
    </Response>
</cXML>
