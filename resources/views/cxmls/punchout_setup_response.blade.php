<?xml version="1.0"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.048/cXML.dtd">
<cXML xml:lang="en-US" payloadID="{{ $payload_id }}" timestamp="{{ $payload_timestamp }}">
    <Response>
        <Status code="200" text="success"></Status>
        <PunchOutSetupResponse>
            <StartPage>
                <URL>{{ $url }}</URL>
            </StartPage>
        </PunchOutSetupResponse>
    </Response>
</cXML>
