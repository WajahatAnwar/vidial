<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cXML.org/schemas/cXML/1.2.020/cXML.dtd">
<cXML xml:lang="en-US" payloadID="{{ $payload_id }}" timestamp="{{ $payload_timestamp }}">
    <Response>
        <Status code="200" text="Ok">{{ $order->internal_id }}</Status>
    </Response>
</cXML>
