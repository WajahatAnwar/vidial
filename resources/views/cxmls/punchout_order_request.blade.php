<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.048/cXML.dtd">
<cXML xml:lang="en-US" payloadID="{{ $payload_id }}" timestamp="{{ $payload_timestamp }}">
    <Header>
        <From>
            <Credential domain="{{ $catalog->from_domain }}">
                <Identity>{{ $catalog->from_identity }}</Identity>
            </Credential>
        </From>
        <To>
            <Credential domain="{{ $catalog->to_identity }}">
                <Identity>{{ $catalog->to_identity }}</Identity>
            </Credential>
        </To>
        <Sender>
            <Credential domain="{{ $catalog->from_identity }}">
                <Identity>{{ $catalog->from_identity }}</Identity>
                <SharedSecret>{{ $catalog->shared_secret }}</SharedSecret>
            </Credential>
            <UserAgent>Quantum Procurement 1.0</UserAgent>
        </Sender>
    </Header>
    <Request>
        <OrderRequest>
            <OrderRequestHeader orderID="{{ $order->internal_id }}" orderDate="{{ $order->getCXMLTimestamp() }}"
                type="new">
                <Total>
                    <Money currency="USD">{{ $order->total }}</Money>
                </Total>
                <ShipTo>
                    <Address isoCountryCode="US" addressID="{{ $shipping_address->ident }}">
                        <Name xml:lang="en">{{ $shipping_address->label }}</Name>
                        <PostalAddress name="default">
                            <DeliverTo>{{ $shipping_address->deliver_to }}</DeliverTo>
                            <Street>{{ $shipping_address->line1 }}</Street>
                            <City>{{ $shipping_address->city }}</City>
                            <State>{{ $shipping_address->state }}</State>
                            <PostalCode>{{ $shipping_address->zip }}</PostalCode>
                            <Country isoCountryCode="{{ $shipping_address->country }}">
                                {{ $shipping_address->country }}
                            </Country>
                        </PostalAddress>
                        <Email name="default">{{ $user->email }}</Email>
                    </Address>
                </ShipTo>
                <BillTo>
                    <Address isoCountryCode="US" addressID="{{ $billing_address->ident }}">
                        <Name xml:lang="en">{{ $billing_address->label }}</Name>
                        <PostalAddress name="default">
                            <DeliverTo>{{ $billing_address->deliver_to }}</DeliverTo>
                            <Street>
                                <![CDATA[{{ $billing_address->line1 }}]]>
                            </Street>
                            <City>{{ $billing_address->city }}</City>
                            <State>{{ $billing_address->state }}</State>
                            <PostalCode>{{ $billing_address->zip }}</PostalCode>
                            <Country isoCountryCode="{{ $billing_address->country }}">{{ $billing_address->country }}
                            </Country>
                        </PostalAddress>
                        <Email name="default">{{ $user->email }}</Email>
                    </Address>
                </BillTo>
                <Tax>
                    <Money currency="USD">{{ $order->tax_total }}</Money>
                    <Description xml:lang="en-US">Cost of tax, including shipping tax</Description>
                </Tax>
                <Shipping>
                    <Money currency="USD">{{ $order->shipping_total }}</Money>
                    <Description xml:lang="en-US">
                        <![CDATA[{{ $order->shipping_method ? $order->shipping_method : 'Shipping' }}]]>
                    </Description>
                </Shipping>
                <Contact role="endUser">
                    <Name xml:lang="en">{{ $user->name }}</Name>
                    <Email name="default">{{ $user->email }}</Email>
                </Contact>
            </OrderRequestHeader>
            @foreach ($items as $key => $item)
                <ItemOut lineNumber="{{ $key + 1 }}" quantity="{{ $item->quantity }}">
                    <ItemID>
                        <SupplierPartID>{{ $item->supplier_part_id }}</SupplierPartID>
                        <SupplierPartAuxiliaryID>{{ $item->supplier_auxiliary_id }}</SupplierPartAuxiliaryID>
                    </ItemID>
                    <ItemDetail>
                        <UnitPrice>
                            <Money currency="USD">{{ $item->unit_price }}</Money>
                        </UnitPrice>
                        <Description xml:lang="en">
                            <![CDATA[{{ $item->description }}]]>
                        </Description>
                        <UnitOfMeasure>{{ $item->unit_of_measure }}</UnitOfMeasure>
                        <Classification domain="UNSPSC">{{ $item->classification }}</Classification>
                        <ManufacturerPartID>{{ $item->supplier_auxiliary_id }}</ManufacturerPartID>
                    </ItemDetail>
                </ItemOut>
            @endforeach
        </OrderRequest>
    </Request>
</cXML>
