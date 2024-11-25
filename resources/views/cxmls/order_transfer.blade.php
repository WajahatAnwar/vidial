<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd">
<cXML payloadID="{{ $payload_id }}" xml:lang="en-US" timestamp="{{ $payload_timestamp }}" version="1.2.0.14">
    <Header>
        <From>
            <Credential domain="{{ $session->header_from_domain }}">
                @if (!$session->header_from_identity)
                    <Identity />
                @else
                    <Identity>{{ $session->header_from_identity }}</Identity>
                @endif

            </Credential>
        </From>
        <To>
            <Credential domain="{{ $session->header_to_domain }}">
                @if (!$session->header_to_identity)
                    <Identity />
                @else
                    <Identity>{{ $session->header_to_identity }}</Identity>
                @endif
            </Credential>
        </To>
        <Sender>
            <Credential domain="{{ $session->header_sender_domain }}">
                @if (!$session->header_sender_identity)
                    <Identity />
                @else
                    <Identity>{{ $session->header_sender_identity }}</Identity>
                @endif
                <SharedSecret>{{ $session->header_sender_shared_secret }}</SharedSecret>
            </Credential>
            <UserAgent />
        </Sender>
    </Header>
    <Message deploymentMode="production">
        <PunchOutOrderMessage>
            <BuyerCookie>{{ $session->buyer_cookie }}</BuyerCookie>
            <PunchOutOrderMessageHeader operationAllowed="create" quoteStatus="final">
                <Total>
                    <Money currency="USD">{{ $order->total }}</Money>
                </Total>
                @if (!$client->shouldShippingBeLineItem())
                    <Shipping>
                        <Money currency="USD">
                            {{ $order->shipping_total ? $order->shipping_total : '0.00' }}
                        </Money>
                        <Description xml:lang="en-US">
                            <![CDATA[{{ $order->shipping_method ? $order->shipping_method : 'Shipping' }}]]>
                        </Description>
                    </Shipping>
                @else
                    <Shipping>
                        <Money currency="USD">0.00</Money>
                        <Description xml:lang="en-US">
                            <![CDATA[{{ $order->shipping_method ? $order->shipping_method : 'Shipping' }}]]>
                        </Description>
                    </Shipping>
                @endif
                @if (!$client->shouldTaxBeLineItem())
                    <Tax>
                        <Money currency="USD">{{ $order->tax_total ? $order->total_tax : '0.00' }}</Money>
                        <Description xml:lang="en-US">Tax</Description>
                    </Tax>
                @else
                    <Tax>
                        <Money currency="USD">0.00</Money>
                        <Description xml:lang="en-US">Tax</Description>
                    </Tax>
                @endif

            </PunchOutOrderMessageHeader>
            @foreach ($items as $item)
                <ItemIn quantity="{{ $item->quantity }}">
                    <ItemID>
                        <SupplierPartID>{{ $item->supplier_part_id }}</SupplierPartID>
                        <SupplierPartAuxiliaryID>{{ $item->overriden_auxiliary_id }}</SupplierPartAuxiliaryID>
                    </ItemID>
                    <ItemDetail>
                        @if ($client->shouldDiscountBeOnLineItem())
                            <UnitPrice>
                                <Money currency="USD">
                                    {{ $item->discounted_price ? $item->discounted_price : $item->unit_price }}
                                </Money>
                            </UnitPrice>
                        @else
                            <UnitPrice>
                                <Money currency="USD">{{ $item->unit_price }}</Money>
                            </UnitPrice>
                        @endif
                        <Description xml:lang="en-US">
                            <![CDATA[{{ $item->description }}]]>
                        </Description>
                        <UnitOfMeasure>{{ $item->unit_of_measure }}</UnitOfMeasure>
                        <Classification domain="UNSPSC">
                            {{ $item->supplier_part_id == 'setup_charge' ? '80141605' : ($client->shouldOverrideItemClassificationCode() ? $client->override_item_classification_code : $item->classification) }}
                        </Classification>
                        <ManufacturerName>{{ $item->manufacturer_name }}</ManufacturerName>
                        <LeadTime>{{ $item->leadtime }}</LeadTime>
                    </ItemDetail>
                </ItemIn>
            @endforeach
            @if ($client->shouldShippingBeLineItem() && $order->shipping_total > 0)
                <ItemIn quantity="1">
                    <ItemID>
                        <SupplierPartID>Shipping</SupplierPartID>
                        <SupplierPartAuxiliaryID>Shipping/LineItem</SupplierPartAuxiliaryID>
                    </ItemID>
                    <ItemDetail>
                        <UnitPrice>
                            <Money currency="USD">
                                {{ $order->shipping_total ? $order->shipping_total : '0.00' }}
                            </Money>
                        </UnitPrice>
                        <Description xml:lang="en-US">
                            <![CDATA[{{ $order->shipping_method ? $order->shipping_method : 'Shipping' }}]]>
                        </Description>
                        <UnitOfMeasure>EA</UnitOfMeasure>
                        <Classification domain="UNSPSC">
                            {{ $client->shouldOverrideItemClassificationCode() ? $client->override_item_classification_code : '80141605' }}
                        </Classification>
                        <ManufacturerName>
                            {{ $order->shipping_method ? $order->shipping_method : 'Shipping' }}
                        </ManufacturerName>
                        <LeadTime>0</LeadTime>
                    </ItemDetail>
                </ItemIn>
            @endif
            @if ($client->shouldTaxBeLineItem() && $order->tax_total > 0)
                <ItemIn quantity="1">
                    <ItemID>
                        <SupplierPartID>Tax</SupplierPartID>
                        <SupplierPartAuxiliaryID>Tax/LineItem</SupplierPartAuxiliaryID>
                    </ItemID>
                    <ItemDetail>
                        <UnitPrice>
                            <Money currency="USD">
                                {{ $order->tax_total ? $order->tax_total : '0.00' }}
                            </Money>
                        </UnitPrice>
                        <Description xml:lang="en-US">Total Taxes</Description>
                        <UnitOfMeasure>EA</UnitOfMeasure>
                        <Classification domain="UNSPSC">
                            {{ $client->shouldOverrideItemClassificationCode() ? $client->override_item_classification_code : '80141605' }}
                        </Classification>
                        <ManufacturerName>Total Taxes</ManufacturerName>
                        <LeadTime>0</LeadTime>
                    </ItemDetail>
                </ItemIn>
            @endif
            @if ($order->discount_description)
                <ItemIn quantity="1">
                    <ItemID>
                        <SupplierPartID>
                            <![CDATA[{{ $order->discount_description }}]]>{{ $order->calculated_discount_percentage ? 'Discount: ' . $order->calculated_discount_percentage . '%' : '' }}
                        </SupplierPartID>
                        <SupplierPartAuxiliaryID>Discount/LineItem</SupplierPartAuxiliaryID>
                    </ItemID>
                    <ItemDetail>
                        <UnitPrice>
                            <Money currency="USD">0</Money>
                        </UnitPrice>
                        <Description xml:lang="en-US">
                            <![CDATA[{{ $order->discount_description }}]]>{{ $order->calculated_discount_percentage ? '(' . $order->calculated_discount_percentage . '%)' : '' }}
                        </Description>
                        <UnitOfMeasure>EA</UnitOfMeasure>
                        <Classification domain="UNSPSC">80141605</Classification>
                        <ManufacturerName>
                            <![CDATA[{{ $order->discount_description }}]]>
                        </ManufacturerName>
                        <LeadTime>0</LeadTime>
                    </ItemDetail>
                </ItemIn>
            @endif
        </PunchOutOrderMessage>
    </Message>
</cXML>
