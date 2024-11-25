<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.048/InvoiceDetail.dtd">
<cXML xml:lang="en-US" payloadID="{{ $payload_id }}" timestamp="{{ $payload_timestamp }}">
    <Header>
        <From>
            <Credential
                domain="{{ !$client->shouldOverrideSessionCredentials() ? $session->header_to_domain : $client->from_domain }}">
                <Identity>
                    {{ !$client->shouldOverrideSessionCredentials() ? $client->getMasterAccountIdentity() : $client->from_identity }}
                </Identity>
            </Credential>
            @if (!empty($client->ariba_own_identity))
                <Credential domain="NetworkID">
                    <Identity{{ $client->ariba_own_identity }}}< /Identity>
                </Credential>
            @endif
        </From>
        <To>
            <Credential
                domain="{{ !$client->shouldOverrideSessionCredentials() ? $session->header_to_domain : $client->to_domain }}">
                <Identity>
                    {{ !$client->shouldOverrideSessionCredentials() ? (!empty($client->ariba_network_identity) ? $client->ariba_network_identity : $client->global_identity) : $client->to_identity }}
                </Identity>
            </Credential>
        </To>
        <Sender>
            <Credential
                domain="{{ !$client->shouldOverrideSessionCredentials() ? $session->header_to_domain : $client->from_domain }}">
                <Identity>
                    {{ !$client->shouldOverrideSessionCredentials() ? $client->getMasterAccountIdentity() : $client->from_identity }}
                </Identity>
                <SharedSecret>{{ $client->shared_secret }}</SharedSecret>
            </Credential>
            @if (!empty($client->ariba_own_identity))
                <Credential domain="NetworkID">
                    <Identity>{{ $client->ariba_own_identity }}</Identity>
                </Credential>
            @endif
            <UserAgent>Quantum Procurement 1.0</UserAgent>
        </Sender>
    </Header>
    <Request
        deploymentMode="{{ !empty($client->ariba_deployment_mode) ? $client->ariba_deployment_mode : 'production' }}">
        <InvoiceDetailRequest>
            <InvoiceDetailRequestHeader invoiceDate="{{ $invoice_timestamp }}"
                invoiceID="{{ $invoice->overriden_external_id }}" operation="new"
                @if ($client->pomw_client_network->isAriba()) invoiceOrigin="supplier" @endif
                purpose="{{ $invoice->isCreditMemo() && !empty($client->ariba_credit_memo_purpose) ? $client->ariba_credit_memo_purpose : $invoice->purpose }}">
                <InvoiceDetailHeaderIndicator />
                <InvoiceDetailLineIndicator isAccountingInLine="yes" />
                <InvoicePartner>
                    <Contact role="remitTo" addressID="CCCHASEMAIN1">
                        <Name xml:lang="en-US">Club Colors Buyer, LLC</Name>
                        <PostalAddress>
                            <Street>420 E State Parkway</Street>
                            <City>Chicago</City>
                            <State>IL</State>
                            <PostalCode>60173</PostalCode>
                            <Country isoCountryCode="US">United States</Country>
                        </PostalAddress>
                    </Contact>
                </InvoicePartner>
                @if ($client->id == '85')
                    @if (isset($shipping_address))
                        <InvoicePartner>
                            <Contact addressID={{ $shipping_address->ident }}}" role="billTo">
                                <Name xml:lang="en">{{ $shipping_address->label }}</Name>
                                <PostalAddress name="default">
                                    <DeliverTo>{{ $shipping_address->label }}</DeliverTo>
                                    <Street>
                                        {{ $shipping_address->line1 }}
                                        @if (!empty($shipping_address->line2))
                                            {{ $shipping_address->line2 }}
                                        @endif
                                    </Street>
                                    <City>
                                        {{ $shipping_address->city }}
                                    </City>
                                    <State>
                                        {{ $shipping_address->state }}
                                    </State>
                                    <PostalCode>
                                        {{ $shipping_address->zip }}
                                    </PostalCode>
                                    <Country isoCountryCode="{{ $shipping_address->country }}">
                                        {{ $shipping_address->country }}
                                    </Country>
                                </PostalAddress>
                                <Email name="default" preferredLang="en-US">
                                    {{ $shipping_address->email }}
                                </Email>
                            </Contact>
                        </InvoicePartner>
                    @endif
                    <InvoicePartner>
                        <Contact role="from">
                            <Name xml:lang="en-US">Club Colors Buyer, LLC</Name>
                            <PostalAddress>
                                <Street>420 E State Parkway</Street>
                                <City>Chicago</City>
                                <State>IL</State>
                                <PostalCode>60173</PostalCode>
                                <Country isoCountryCode="US">United States</Country>
                            </PostalAddress>
                        </Contact>
                    </InvoicePartner>
                    <InvoicePartner>
                        <Contact role="billFrom">
                            <Name xml:lang="en-US">Club Colors Buyer, LLC</Name>
                            <PostalAddress>
                                <Street>420 E State Parkway</Street>
                                <City>Chicago</City>
                                <State>IL</State>
                                <PostalCode>60173</PostalCode>
                                <Country isoCountryCode="US">United States</Country>
                            </PostalAddress>
                        </Contact>
                    </InvoicePartner>
                    @if (isset($billing_address))
                        <InvoicePartner>
                            <Contact addressID="{{ $billing_address->ident }}" role="soldTo">
                                <Name xml:lang="en">
                                    {{ $billing_address->label }}
                                </Name>
                                <PostalAddress name="default">
                                    <DeliverTo>
                                        {{ $billing_address->label }}
                                    </DeliverTo>
                                    <Street>
                                        {{ $billing_address->line1 }}
                                        @if (!empty($billing_address->line2))
                                            {{ $billing_address->line2 }}
                                        @endif
                                    </Street>
                                    <City>
                                        {{ $billing_address->city }}
                                    </City>
                                    <State>
                                        {{ $billing_address->state }}
                                    </State>
                                    <PostalCode>
                                        {{ $billing_address->zip }}
                                    </PostalCode>
                                    <Country isoCountryCode="{{ $billing_address->country }}">
                                        {{ $billing_address->country }}
                                    </Country>
                                </PostalAddress>
                                <Email name="default" preferredLang="en-US">
                                    {{ $billing_address->email }}
                                </Email>
                            </Contact>
                        </InvoicePartner>
                    @endif
                @endif

                @if (isset($first_invoice))
                    @if (!$client->pomw_client_network->isAriba())
                        <DocumentReference payloadID="{{ $first_invoice->overriden_external_id }}" />
                    @else
                        <InvoiceIDInfo invoiceID="{{ $first_invoice->overriden_external_id }}" />
                    @endif
                @endif


                @if ($client->pomw_client_network->isAriba())
                    <InvoiceDetailShipping>
                        <Contact role="shipFrom">
                            <Name xml:lang="en-US">Club Colors Buyer, LLC</Name>
                            <PostalAddress>
                                <Street>420 E State Parkway</Street>
                                <City>Chicago</City>
                                <State>IL</State>
                                <PostalCode>60173</PostalCode>
                                <Country isoCountryCode="US">United States</Country>
                            </PostalAddress>
                        </Contact>

                        @if (isset($shipping_address))
                            <Contact addressID="{{ $shipping_address->ident }}" role="shipTo">
                                <Name xml:lang="en">{{ $shipping_address->label }}</Name>
                                <PostalAddress name="default">
                                    <DeliverTo>{{ $shipping_address->label }}</DeliverTo>
                                    <Street>{{ $shipping_address->line1 }}@if (!empty($shipping_address->line2))
                                            {{ $shipping_address->line2 }}
                                        @endif
                                    </Street>
                                    <City>{{ $shipping_address->city }}</City>
                                    <State>{{ $shipping_address->state }}</State>
                                    <PostalCode>{{ $shipping_address->zip }}</PostalCode>
                                    <Country isoCountryCode="{{ $shipping_address->country }}">
                                        {{ $shipping_address->country }}
                                    </Country>
                                </PostalAddress>
                                <Email name="default" preferredLang="en-US">{{ $shipping_address->email }}</Email>
                            </Contact>
                        @endif
                    </InvoiceDetailShipping>
                @endif

                @if (!empty($client->payment_term_days))
                    <PaymentTerm payInNumberOfDays="{{ $client->payment_term_days }}" />
                @endif

                @if ($invoice->isCreditMemo())
                    @if (!empty($client->ariba_default_credit_memo_reason))
                        <Comments xml:lang="EN">
                            {{ $client->ariba_default_credit_memo_reason }}</Comments>
                    @endif
                @endif

                @if (isset($first_invoice))
                    <Extrinsic name="CustomFields">
                        <IdReference identifier="original_invoice_date" domain="CustomField">
                            <Description xml:lang="en">
                                {{ \Carbon\Carbon::parse($first_invoice->created_at)->setTimezone('UTC')->toDateTimeString() }}
                            </Description>
                        </IdReference>
                    </Extrinsic>
                    <Extrinsic name="CustomFields">
                        <IdReference identifier="original_invoice" domain="CustomField">
                            <Description xml:lang="en">{{ $first_invoice->overriden_external_id }}</Description>
                        </IdReference>
                    </Extrinsic>
                @endif

                @if ($client->id == '84')
                    <InvoiceDetailShipping></InvoiceDetailShipping>
                @endif

            </InvoiceDetailRequestHeader>
            <InvoiceDetailOrder>
                <InvoiceDetailOrderInfo>
                    <OrderReference orderID="{{ $order->external_id }}">
                        <DocumentReference
                            @if (!$client->pomw_client_network->isAriba()) payloadID="{{ $order->external_id }}" @endif />
                    </OrderReference>
                </InvoiceDetailOrderInfo>
                @if (!empty($items))
                    @foreach ($items as $item)
                        <InvoiceDetailItem invoiceLineNumber="{{ $item->line_number }}"
                            quantity="{{ $item->getQuantity() }}">
                            <UnitOfMeasure>{{ $item->unit_of_measure }}</UnitOfMeasure>
                            <UnitPrice>
                                <Money currency="USD">{{ $item->getUnitPrice() }}</Money>
                            </UnitPrice>
                            <InvoiceDetailItemReference lineNumber="{{ $item->line_number }}">
                                <ItemID>
                                    <SupplierPartID>{{ $item->part_id }}</SupplierPartID>
                                    <SupplierPartAuxiliaryID>{{ $item->aux_part_id }}</SupplierPartAuxiliaryID>
                                </ItemID>
                                <Description xml:lang="en-US">
                                    <![CDATA[{{ $item->description }}]]>
                                </Description>
                            </InvoiceDetailItemReference>
                            <SubtotalAmount>
                                <Money currency="USD">{{ $item->getQuantity() * $item->getUnitPrice() }}</Money>
                            </SubtotalAmount>
                            @if ($item->tax > 0 && !$client->pomw_client_network->isUnimarket())
                                <Tax>
                                    <Money currency="USD">{{ $item->tax }}</Money>
                                    <Description xml:lang="en-US">Cost of tax, including shipping tax</Description>
                                </Tax>
                            @endif
                        </InvoiceDetailItem>
                    @endforeach
                @else
                    @if ($invoice->isCreditMemo())
                        <InvoiceDetailItem invoiceLineNumber="1" quantity="1">
                            <UnitOfMeasure>UOM</UnitOfMeasure>
                            <UnitPrice>
                                <Money currency="USD">{{ $invoice->getTotal() }}</Money>
                            </UnitPrice>
                            <InvoiceDetailItemReference lineNumber="1">
                                <ItemID>
                                    <SupplierPartID>CreditMemo</SupplierPartID>
                                    <SupplierPartAuxiliaryID>CreditMemo</SupplierPartAuxiliaryID>
                                </ItemID>
                                <Description xml:lang="en-US">Credit Memo Refund for ${{ $invoice->getTotal() }}
                                </Description>
                            </InvoiceDetailItemReference>
                            <SubtotalAmount>
                                <Money currency="USD">{{ $invoice->getTotal() }}</Money>
                            </SubtotalAmount>
                            <Tax>
                                <Money currency="USD">{{ $invoice->getTax() }}</Money>
                                <Description xml:lang="en-US">Cost of tax, including shipping tax</Description>
                            </Tax>
                        </InvoiceDetailItem>
                    @endif
                @endif
            </InvoiceDetailOrder>
            <InvoiceDetailSummary>
                <SubtotalAmount>
                    <Money currency="USD">{{ $invoice->getSubtotal() }}</Money>
                </SubtotalAmount>
                <Tax>
                    <Money currency="USD">{{ $invoice->getTax() }}</Money>
                    <Description xml:lang="en-US">Tax</Description>
                    <TaxDetail purpose="tax"
                        category="{{ (!empty($client->ariba_default_tax_location) ? $client->ariba_default_tax_location : $invoice->hasTaxLocation()) ? $invoice->getTaxLocation() : 'Standard' }}"
                        percentageRate="{{ $invoice->getTaxPercentageRate() }}"
                        taxPointDate="{{ $invoice->getTaxCalculationDate() }}">
                        <TaxableAmount>
                            <Money currency="{{ $invoice->currency }}">{{ $invoice->getTaxableAmount() }}</Money>
                        </TaxableAmount>
                        <TaxAmount>
                            <Money currency="{{ $invoice->currency }}">{{ $invoice->getTax() }}</Money>
                        </TaxAmount>
                        @if ($invoice->hasTaxLocation())
                            <TaxLocation xml:lang="en">{{ $invoice->getTaxLocation() }}</TaxLocation>
                        @endif
                    </TaxDetail>
                </Tax>
                <ShippingAmount>
                    <Money currency="USD">{{ $invoice->getShipping() }}</Money>
                </ShippingAmount>
                <GrossAmount>
                    <Money currency="USD">{{ $invoice->getTotal() }}</Money>
                </GrossAmount>
                <NetAmount>
                    <Money currency="USD">{{ $invoice->getTotal() }}</Money>
                </NetAmount>
            </InvoiceDetailSummary>
        </InvoiceDetailRequest>
    </Request>
</cXML>
