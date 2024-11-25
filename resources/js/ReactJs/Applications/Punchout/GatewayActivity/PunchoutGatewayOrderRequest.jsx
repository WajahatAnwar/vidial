import {
    Card,
    Icon,
    IndexTable,
    Text,
    useIndexResourceState
} from '@shopify/polaris';
import { ViewIcon, XIcon } from '@shopify/polaris-icons';
import { useState } from 'react';

function PunchoutGatewayOrderRequest({ orderRequests }) {

    const [selectedRequest, setSelectedRequest] = useState(false);

    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(orderRequests.pomw_client_request);

    const rowMarkup = orderRequests.pomw_client_request.map((value, index) => (
        <IndexTable.Row
            id={value.id}
            key={value.id}
            selected={selectedResources.includes(value.id)}
            position={index}
        >
            <IndexTable.Cell>
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {value.type}
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <span className=''  style={{ cursor: "pointer" }}>
                    {value.uri}
                </span>
            </IndexTable.Cell>
            <IndexTable.Cell>{value.created_at}</IndexTable.Cell>
            <IndexTable.Cell>
                <div onClick={() => setSelectedRequest(value)} style={{ cursor: "pointer" }}><Icon source={ViewIcon} tone="base"></Icon></div>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    console.log(orderRequests);

    return (
        <div>
            {!selectedRequest ? (
                <Card>
                    <IndexTable
                        resourceName={resourceName}
                        itemCount={orderRequests?.pomw_client_request.length}
                        selectedItemsCount={
                            allResourcesSelected ? 'All' : selectedResources.length
                        }
                        onSelectionChange={handleSelectionChange}
                        headings={[
                            { title: 'Type' },
                            { title: 'Uri' },
                            { title: 'Date' },
                            { title: 'View ' },
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
                            <p>ID:X</p>
                            <span>{selectedRequest.uuid} ({selectedRequest.id}) </span>
                        </div>
                        <div className='Data-sub-main'>
                            <p >Session: </p>
                            <span>{orderRequests.uuid} ({orderRequests.id}) </span>
                        </div>
                        <div className='Data-sub-main'>
                            <p>Session Key:</p>
                            <span>{orderRequests.session_key}</span>
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
                            <span className='data-body-span'>{selectedRequest.payload_ident}</span>
                        </div>
                        <div className='Data-sub-main '>
                            <p >Data Headers:</p>
                            <span className='data-body-span'>{selectedRequest.data_headers}</span>
                        </div>
                        <div className='Data-sub-main '>
                            <p >Data Body: </p>

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
}

export default PunchoutGatewayOrderRequest;
