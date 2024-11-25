import React, { useEffect, useState } from 'react';
import { Page, Card, DataTable, TextField, Text } from '@shopify/polaris';


const OrderInvoiceHistory = ({history}) => {
    const [searchValue, setSearchValue] = useState('');

    // Sample data
    const sortedRows = Object.values(history).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const [rows, setRows] = useState(sortedRows.map(item => [item.created_at, item.data]));

    const filteredRows = rows.filter(([date, message]) =>
      date.includes(searchValue) || message.toLowerCase().includes(searchValue.toLowerCase())
    );

  return (
    <Page title="">
    <div className='flex justify-between my-4'>
      <div>
        <Text variant="headingLg" as="h5">History</Text>

      </div>
      {/* <div>
        <TextField
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search"
          autoComplete="off"
          clearButton
          onClearButtonClick={() => setSearchValue('')}
        />
      </div> */}
    </div>

      <div className='gravityactivityhistory-main' style={{ backgroundColor: '#f7f7f7' }}>
        <DataTable
          columnContentTypes={[
            'text',
            'text',
          ]}
          headings={[
            <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Date</span>,
            <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Message</span>,
          ]}
          rows={filteredRows.map(([date, message]) => [
            <span style={{ color: '#424242', textAlign: 'center', fontSize: '13.123px', fontWeight: 500 }}>{date}</span>,
            <span style={{ color: '#424242', textAlign: 'center', fontSize: '13.123px', fontWeight: 500 }}>{message}</span>,
          ])}
          footerContent={
            <div style={{ backgroundColor: '#f7f7f7', padding: '10px', textAlign: 'justify',fontSize:'11px' }}>
              {`Showing 1 to ${filteredRows.length} of ${rows.length} entries`}
            </div>
          }
        />
      </div>
  </Page>
  )
}

export default OrderInvoiceHistory
