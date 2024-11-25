import React, { useState, useCallback } from 'react';
import { Page, Card, DataTable, TextField, Text, Modal, Icon, useIndexResourceState, IndexTable, EmptyState } from '@shopify/polaris';
import { SearchIcon, ViewIcon, XIcon } from '@shopify/polaris-icons';

const OrderInvoiceRequests = ({ requests, invoiceData }) => {

    const [selectedRequest, setSelectedRequest] = useState(false);

    function convertISOToYMD(isoDateString) {
        var date = new Date(Date.parse(isoDateString));

        var year = date.getUTCFullYear();
        var month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
        var day = String(date.getUTCDate()).padStart(2, '0');

        var hours = String(date.getUTCHours()).padStart(2, '0');
        var minutes = String(date.getUTCMinutes()).padStart(2, '0');
        var seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const resourceName = {
        singular: 'Journal',
        plural: 'Journals',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(requests ? requests : []);

    const rowMarkup = requests && requests.map((value, index) => (
        <IndexTable.Row id={value.id} key={value.id} position={index}>
            <IndexTable.Cell>
                <div onClick={() => setSelectedRequest(value)} style={{ cursor: "pointer" }}><Icon source={ViewIcon} tone="base"></Icon></div>
            </IndexTable.Cell>
            <IndexTable.Cell>{value.type} </IndexTable.Cell>
            <IndexTable.Cell>
                <span className='cstm-green' style={{ cursor: "pointer" }}>
                    {value.uri}
                </span>
            </IndexTable.Cell>
            <IndexTable.Cell>{convertISOToYMD(value.created_at)}</IndexTable.Cell>
        </IndexTable.Row>
    ));
    const emptyState = (
        <EmptyState
            heading={<><Icon size="large" source={SearchIcon}></Icon><h1>No Journal Found</h1></>}
      >
        </EmptyState>
    );

    return (
        <div style={{ marginTop: "15px" }}>
            {!selectedRequest ? (

                <Card>
                    <IndexTable
                        resourceName={resourceName}
                        emptyState={emptyState}
                        itemCount={(requests ? requests : []).length}
                        selectedItemsCount={
                            allResourcesSelected ? 'All' : selectedResources.length
                        }
                        onSelectionChange={handleSelectionChange}
                        headings={[
                            { title: 'View' },
                            { title: 'Type' },
                            { title: 'Uri' },
                            { title: 'Date' },
                        ]}
                        selectable={false}
                    >
                        {rowMarkup}
                    </IndexTable>
                </Card>

            ) : (
                <div>
                    <p className='pl-6'>
                        <Text variant="headingLg" as="h5">{selectedRequest.type} Request</Text>
                    </p>
                    <div className='data-pop-sub-main mt-4'>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: "50px" }}>
                            <Text variant="headingLg" as="h6">General</Text>
                            <p className='cursor-pointer'><XIcon onClick={() => setSelectedRequest(false)} width={20} /></p>
                        </div>
                        <div className='Data-sub-main'>
                            <p>ID:</p>
                            <span>{selectedRequest.uuid} ({selectedRequest.id}) </span>
                        </div>
                        <div className='Data-sub-main'>
                            <p >Session:</p>
                            <span>{invoiceData.order.pomw_session.uuid} ({invoiceData.order.pomw_session.id}) </span>
                        </div>
                        <div className='Data-sub-main'>
                            <p>Session Key:</p>
                            <span>{invoiceData.order.pomw_session.session_key}</span>
                        </div>
                        <div className='Data-sub-main'>
                            <p >Date:</p>
                            <span>{selectedRequest.created_at}</span>
                        </div>
                        <div className='Data-sub-main'>
                            <p >URI:</p>
                            <span>{selectedRequest.uri}</span>
                        </div>
                        <div className='Data-sub-main'>
                            <p >User Agent:</p>
                            <span>{selectedRequest.user_agent}</span>
                        </div>
                        <div className='Data-sub-main'>
                            <p style={{ fontWeight: 'bold', margin: '0' }}>Remote Host:</p>
                            <span>{selectedRequest.remote_host}</span>
                        </div>
                        <div className='Data-sub-main'>
                            <p>Payload ID:</p>
                            <span>{selectedRequest.payload_ident}</span>
                        </div>
                        <div className='Data-sub-main '>
                            <p >Data Headers:</p>
                            <span className='data-body-span'>{selectedRequest.data_headers}</span>
                        </div>
                        <div className='Data-sub-main '>
                            <p className='data-body-span'>Data Body:</p>

                                <span className='data-body-span'>{selectedRequest.request_data}</span>

                        </div>
                        <div className='Data-sub-main'>
                            <p >Response Body:</p>

                                <span className='data-body-span'>{selectedRequest.response_body}</span>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderInvoiceRequests;
