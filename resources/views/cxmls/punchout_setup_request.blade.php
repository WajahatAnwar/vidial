<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.048/cXML.dtd">
<cXML payloadID="{{ $factory->getPayloadId() }}" timestamp="{{ $factory->getTimestamp() }}" version="1.0" xml:lang="en">
    <Header>
        <From>
            <Credential domain="{{ $catalog->from_domain }}">
                <Identity>{{ $catalog->from_identity }}</Identity>
            </Credential>
        </From>
        <To>
            <Credential domain="{{ $catalog->to_domain }}">
                <Identity>{{ $catalog->to_identity }}</Identity>
            </Credential>
        </To>
        <Sender>
            <Credential domain="{{ $factory->getSenderDomain() }}">
                <Identity>{{ $catalog->from_identity }}</Identity>
                <SharedSecret>{{ $catalog->shared_secret }}</SharedSecret>
            </Credential>
            <UserAgent>Quantum Procurement</UserAgent>
        </Sender>
    </Header>
    <Request deploymentMode="production">
        <PunchOutSetupRequest operation="create">
            <BuyerCookie>{{ $session->buyer_cookie }}</BuyerCookie>
            <Extrinsic name="User">{{ $user->name }}</Extrinsic>
            <Extrinsic name="UniqueUsername">{{ $user->email }}</Extrinsic>
            <Extrinsic name="UniqueName">{{ $user->email }}</Extrinsic>
            <Extrinsic name="UserId">{{ $user->uuid }}</Extrinsic>
            <Extrinsic name="UserEmail">{{ $user->email }}</Extrinsic>
            <Extrinsic name="UserFullName">{{ $user->name }}</Extrinsic>
            <Extrinsic name="UserPrintableName">{{ $user->name }}</Extrinsic>
            <Extrinsic name="FirstName">{{ $user->first_name }}</Extrinsic>
            <Extrinsic name="LastName">{{ $user->last_name }}</Extrinsic>
            <Extrinsic name="PhoneNumber">{{ $user->phone }}</Extrinsic>
            <BrowserFormPost>
                <URL>{{ $factory->getPunchoutOrderReceiverUrl($session->uuid) }}</URL>
            </BrowserFormPost>
            <SupplierSetup>
                <URL>{{ $catalog->punchout_url }}</URL>
            </SupplierSetup>
            <ShipTo>
                <Address addressID="{{ $address->ident }}">
                    <Name xml:lang="en">{{ $address->label }}</Name>
                    <PostalAddress>
                        <DeliverTo>{{ $address->deliver_to }}</DeliverTo>
                        <Street>{{ $address->line1 }}</Street>
                        <City>{{ $address->city }}</City>
                        <State>{{ $address->state }}</State>
                        <PostalCode>{{ $address->zip }}</PostalCode>
                        <Country isoCountryCode="{{ $address->country }}">{{ $address->country }}</Country>
                    </PostalAddress>
                    <Email name="default">{{ $user->email }}</Email>
                </Address>
            </ShipTo>
        </PunchOutSetupRequest>
    </Request>
</cXML>
