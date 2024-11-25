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
                    <Money currency="USD">{{ $grand_total }}</Money>
                </Total>
                @if (isset($selected_rate))
                    <Shipping>
                        <Money currency="USD">{{ $selected_rate['price']['amount'] }}</Money>
                        <Description xml:lang="en-US">{{ $selected_rate['title'] }}</Description>
                    </Shipping>
                @else
                    <Shipping>
                        <Money currency="USD">0.00</Money>
                        <Description xml:lang="en-US">Shipping</Description>
                    </Shipping>
                @endif
                <Tax>
                    <Money currency="USD">0.00</Money>
                    <Money currency="USD">{{ $calculation->getTaxTotal() }}</Money>
                    <Description xml:lang="en-US">Tax</Description>
                </Tax>
            </PunchOutOrderMessageHeader>
            @foreach ($cart_items as $item)
                <ItemIn quantity="{{ $item['quantity'] }}">
                    <ItemID>
                        <SupplierPartID>{{ $item['sku'] }}</SupplierPartID>
                        <SupplierPartAuxiliaryID>{{ $item['variant_id'] }}</SupplierPartAuxiliaryID>
                    </ItemID>
                    <ItemDetail>
                        <UnitPrice>
                            <Money currency="USD">
                                @if (isset($discount_code) && $discount_code->isPercentage())
                                    {{ $item['price'] / 100 - $discount_code->getDiscountForTotal($item['price'] / 100) }}
                                @else
                                    {{ $item['price'] / 100 }}
                                @endif
                            </Money>
                        </UnitPrice>
                        <Description xml:lang="en-US">
                            @php
                                $description = $item['title'];
                                foreach ($item['properties'] as $key => $property) {
                                    $description .= ' - ' . $property;
                                }
                                $description .= ' - ' . $item['variant_title'];
                            @endphp
                            <![CDATA[{{ $description }}]]>
                        </Description>
                        <UnitOfMeasure>EA</UnitOfMeasure>
                        <Classification domain="UNSPSC">
                            @if ($client->override_item_classification === 1)
                                {{ $client->override_item_classification_code }}
                            @else
                                80141605
                            @endif
                        </Classification>
                        <ManufacturerName />
                        <LeadTime>0</LeadTime>
                    </ItemDetail>
                </ItemIn>
            @endforeach
        </PunchOutOrderMessage>
    </Message>
</cXML>
