import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';

import React, { useState, useCallback } from 'react';
import { Card, Grid, Page, Text, Tabs, Button, Icon } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import PunchoutSessionsTable from '../GatewayActivity/PunchoutSessionsTable';
import OrderRequestsTable from '../GatewayActivity/OrderRequestsTable';
import OrderInvoicesTable from '../GatewayActivity/OrderInvoicesTable';
import GatewayClientsTable from '../Components/GatewayClientsTable';

import { Frame, Modal, TextField, BlockStack, Select } from '@shopify/polaris';
import PunchoutSimulatorTable from '../Simulator/PunchoutSimulatorTable';
import ProcurementOrdersSimulatorTable from '../Simulator/ProcurementOrdersSimulatorTable';
import ToolsCustomQuotesTable from './ToolsCustomQuotesTable';
import ToolsDiscountCodesTable from './ToolsLineItemsTable';
import ToolsProductQtyLimitsTable from './ToolsProductQtyLimitsTable';
function ToolsVirtualTerminalTable() {

  //
  const SpacingBackground = ({ children }) => {
    return (
      <div
        style={{
          height: 'auto',
        }}
      >
        {children}
      </div>
    );
  };

  const Placeholder = ({ height = 'auto' }) => {
    return (
      <div
        style={{
          padding: '14px var(--p-space-200)',
          height: height,
        }}
      />
    );
  };
  //


  const [valueExpirationMonth, setValueExpirationMonth] = useState('Jaded Pixel');
  const handleChangeExpirationMonth = useCallback(
    (ValueExpirationMonth) => setValueExpirationMonth(ValueExpirationMonth),
    [],
  );





  const [valueInvoiceNumber, setValueInvoiceNumber] = useState('Jaded Pixel');
  const handleChangeInvoiceNumber = useCallback(
    (newValueInvoiceNumber) => setValueInvoiceNumber(newValueInvoiceNumber),
    [],
  );





  const [valueBillingCity, setValueBillingCity] = useState('Jaded Pixel');
  const handleChangeBillingCity = useCallback(
    (newValueBillingCity) => setValueBillingCity(newValueBillingCity),
    [],
  );





  const [valueBillingCountry, setValueBillingCountry] = useState('Jaded Pixel');
  const handleChangeBillingCountry = useCallback(
    (newValueBillingCountry) => setValueBillingCountry(newValueBillingCountry),
    [],
  );





  const [valueBillingName, setValueBillingName] = useState('Jaded Pixel');
  const handleChangeBillingName = useCallback(
    (newValueBillingName) => setValueBillingName(newValueBillingName),
    [],
  );






  const [valueShippingAddress2, setValueShippingAddress2] = useState('Jaded Pixel');
  const handleChangeShippingAddress2 = useCallback(
    (newValueShippingAddress2) => setValueShippingAddress2(newValueShippingAddress2),
    [],
  );






  const [valueShippingCity, setValueShippingCity] = useState('Jaded Pixel');
  const handleChangeShippingCity = useCallback(
    (newValueShippingCity) => setValueShippingCity(newValueShippingCity),
    [],
  );






  const [valueAmount, setValueAmount] = useState('Jaded Pixel');
  const handleChangeAmount = useCallback(
    (newValueAmount) => setValueAmount(newValueAmount),
    [],
  );






  const [valueExpirationYear, setValueExpirationYear] = useState('Jaded Pixel');
  const handleChangeExpirationYear = useCallback(
    (newValueExpirationYear) => setValueExpirationYear(newValueExpirationYear),
    [],
  );






  const [valueBillingAddress, setValueBillingAddress] = useState('Jaded Pixel');
  const handleChangeBillingAddress = useCallback(
    (newValueBillingAddress) => setValueBillingAddress(newValueBillingAddress),
    [],
  );






  const [valueBillingState, setValueBillingState] = useState('Jaded Pixel');
  const handleChangeBillingState = useCallback(
    (newValueBillingState) => setValueBillingState(newValueBillingState),
    [],
  );





  const [valueEmailAddress, setValueEmailAddress] = useState('Jaded Pixel');
  const handleChangeEmailAddress = useCallback(
    (newValueEmailAddress) => setValueEmailAddress(newValueEmailAddress),
    [],
  );





  const [valueDescription, setValueDescription] = useState('Jaded Pixel');
  const handleChangeDescription = useCallback(
    (newValueDescription) => setValueDescription(newValueDescription),
    [],
  );





  const [valueShippingCity2, setValueShippingCity2] = useState('Jaded Pixel');
  const handleChangeShippingCity2 = useCallback(
    (newValueShippingCity2) => setValueShippingCity2(newValueShippingCity2),
    [],
  );





  const [valueShippingState, setValueShippingState] = useState('Jaded Pixel');
  const handleChangeShippingState = useCallback(
    (newValueShippingState) => setValueShippingState(newValueShippingState),
    [],
  );





  const [valueCreditCardNumber, setValueCreditCardNumber] = useState('Jaded Pixel');
  const handleChangeCreditCardNumber = useCallback(
    (newValueCreditCardNumber) => setValueCreditCardNumber(newValueCreditCardNumber),
    [],
  );





  const [valueCSC, setValueCSC] = useState('Jaded Pixel');
  const handleChangeCSC = useCallback(
    (newValueCSC) => setValueCSC(newValueCSC),
    [],
  );





  const [valueBillingAddress2, setValueBillingAddress2] = useState('Jaded Pixel');
  const handleChangeBillingAddress2 = useCallback(
    (newValueBillingAddress2) => setValueBillingAddress2(newValueBillingAddress2),
    [],
  );






  const [valueBillingZip, setValueBillingZip] = useState('Jaded Pixel');
  const handleChangeBillingZip = useCallback(
    (newValueBillingZip) => setValueBillingZip(newValueBillingZip),
    [],
  );





  const [valuePhoneNumber, setValuePhoneNumber] = useState('Jaded Pixel');
  const handleChangePhoneNumber = useCallback(
    (newValuePhoneNumber) => setValuePhoneNumber(newValuePhoneNumber),
    [],
  );




  const [valueShippingAddress, setValueShippingAddress] = useState('Jaded Pixel');
  const handleChangeShippingAddress = useCallback(
    (newValueShippingAddress) => setValueShippingAddress(newValueShippingAddress),
    [],
  );




  const [valueShippingAddress3, setValueShippingAddress3] = useState('Jaded Pixel');
  const handleChangeShippingAddress3 = useCallback(
    (newValueShippingAddress3) => setValueShippingAddress3(newValueShippingAddress3),
    [],
  );





  const [valueShippingCountry, setValueShippingCountry] = useState('Jaded Pixel');
  const handleChangeShippingCountry = useCallback(
    (newValueShippingCountry) => setValueShippingCountry(newValueShippingCountry),
    [],
  );




  //
  // const [value, setValue] = useState('Jaded Pixel');
  // const handleChange = useCallback(
  //     (newValue) => setValue(newValue),
  //     [],
  // );
  //
  const [selectedTransactionType, setSelectedTransactionType] = useState('Sale');

  const handleTransactionType = useCallback(
    (valueTransactionType) => setTransactionType(valueTransactionType),
    [],
  );

  const optionsTransactionType = [
    { label: 'Sale', value: 'Sale' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: 'lastWeek' },
  ];
  //
  return (
    <div>

      <Grid>
        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
          <SpacingBackground>
            <BlockStack gap="500">
              <Select
                label="Transaction Type"
                options={optionsTransactionType}
                onChange={handleTransactionType}
                value={selectedTransactionType}
              />
              <TextField
                label="Expiration Month"
                value={valueExpirationMonth}
                onChange={handleChangeExpirationMonth}
                autoComplete="off"
              />
              <TextField
                label="Invoice Number"
                value={valueInvoiceNumber}
                onChange={handleChangeInvoiceNumber}
                autoComplete="off"
              />
              <TextField
                label="Billing City"
                value={valueBillingCity}
                onChange={handleChangeBillingCity}
                autoComplete="off"
              />
              <TextField
                label="Billing Country"
                value={valueBillingCountry}
                onChange={handleChangeBillingCountry}
                autoComplete="off"
              />
              <TextField
                label="Billing Name"
                value={valueBillingName}
                onChange={handleChangeBillingName}
                autoComplete="off"
              />
              <TextField
                label="Shipping Address 2"
                value={valueShippingAddress2}
                onChange={handleChangeShippingAddress2}
                autoComplete="off"
              />
              <TextField
                label="Shipping City"
                value={valueShippingCity}
                onChange={handleChangeShippingCity}
                autoComplete="off"
              />
            </BlockStack>

          </SpacingBackground>

        </Grid.Cell>

        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
          <SpacingBackground>
            <BlockStack gap="500">
              <TextField
                label="Amount"
                value={valueAmount}
                onChange={handleChangeAmount}
                autoComplete="off"
              />
              <TextField
                label="Expiration Year"
                value={valueExpirationYear}
                onChange={handleChangeExpirationYear}
                autoComplete="off"
              />
              <TextField
                label="Billing Address"
                value={valueBillingAddress}
                onChange={handleChangeBillingAddress}
                autoComplete="off"
              />
              <TextField
                label="Billing State"
                value={valueBillingState}
                onChange={handleChangeBillingState}
                autoComplete="off"
              />
              <TextField
                label="Email Address"
                value={valueEmailAddress}
                onChange={handleChangeEmailAddress}
                autoComplete="off"
              />
              <TextField
                label="Description"
                value={valueDescription}
                onChange={handleChangeDescription}
                autoComplete="off"
              />
              <TextField
                label="Shipping City"
                value={valueShippingCity2}
                onChange={handleChangeShippingCity2}
                autoComplete="off"
              />
              <TextField
                label="Shipping State"
                value={valueShippingState}
                onChange={handleChangeShippingState}
                autoComplete="off"
              />


            </BlockStack>
          </SpacingBackground>
        </Grid.Cell>

        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
          <SpacingBackground>
            <BlockStack gap="500">

              <TextField
                label="Credit Card Number"
                value={valueCreditCardNumber}
                onChange={handleChangeCreditCardNumber}
                autoComplete="off"
              />

              <TextField
                label="CSC"
                value={valueCSC}
                onChange={handleChangeCSC}
                autoComplete="off"
              />

              <TextField
                label="Billing Address 2"
                value={valueBillingAddress2}
                onChange={handleChangeBillingAddress2}
                autoComplete="off"
              />

              <TextField
                label="Billing Zip"
                value={valueBillingZip}
                onChange={handleChangeBillingZip}
                autoComplete="off"
              />

              <TextField
                label="Phone Number"
                value={valuePhoneNumber}
                onChange={handleChangePhoneNumber}
                autoComplete="off"
              />

              <TextField
                label="Shipping Address"
                value={valueShippingAddress}
                onChange={handleChangeShippingAddress}
                autoComplete="off"
              />

              <TextField
                label="Shipping Address 2"
                value={valueShippingAddress2}
                onChange={handleChangeShippingAddress2}
                autoComplete="off"
              />

              <TextField
                label="Shipping Country"
                value={valueShippingCountry}
                onChange={handleChangeShippingCountry}
                autoComplete="off"
              />

              <div className='modal-wrapper-PO-btn mt-5'>

                <Button size='large'>Process</Button>
              </div>
            </BlockStack>
          </SpacingBackground>
        </Grid.Cell>
      </Grid>
    </div>
  );


}

ToolsVirtualTerminalTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default ToolsVirtualTerminalTable;
