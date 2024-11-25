import {
    Button,
    Card,
    Icon,
    IndexTable,
    Modal,
    Text,
    Tooltip,
    useIndexResourceState
} from '@shopify/polaris';
import { ClipboardIcon, ViewIcon, XIcon } from '@shopify/polaris-icons';
import { useState, useCallback, } from 'react';
import toast from 'react-hot-toast';

function GatewayActivityRequest({ orderRequest }) {

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

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(orderRequest ? orderRequest.pomw_session.pomw_client_request : []);

    const rowMarkup = orderRequest && orderRequest.pomw_session.pomw_client_request.map((value, index) => (
        <IndexTable.Row id={value.id} key={value.id} position={index}>
            <IndexTable.Cell>
                <div onClick={() => setSelectedRequest(value)} style={{ cursor: "pointer" }}><Icon source={ViewIcon} tone="base"></Icon></div>
            </IndexTable.Cell>
            <IndexTable.Cell>{value.type} </IndexTable.Cell>
            <IndexTable.Cell>
                <span className='' style={{ cursor: "pointer" }}>
                    {value.uri}
                </span>
            </IndexTable.Cell>
            <IndexTable.Cell>{convertISOToYMD(value.created_at)}</IndexTable.Cell>
        </IndexTable.Row>
    ));
    const handleCopy = (data) => {
        navigator.clipboard.writeText(data).then(() => {
            toast.success('Copied!');
        });
    };

    return (
        <div style={{ marginTop: "15px" }}>
            {!selectedRequest ? (

                <Card>
                    <IndexTable
                        resourceName={resourceName}
                        itemCount={(orderRequest ? orderRequest.pomw_session.pomw_client_request : []).length}
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
                            <span>{orderRequest.pomw_session.uuid} ({orderRequest.pomw_session.id}) </span>
                        </div>
                        <div className='Data-sub-main'>
                            <p>Session Key:</p>
                            <span>{orderRequest.pomw_session.session_key}</span>
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
                        <div className='Data-sub-main'>
                            <p >Data Headers: </p>
                            <span className='data-body-span me-2'>{selectedRequest.data_headers}</span>
                            <div className='cursor-pointer' onClick={() => handleCopy(selectedRequest.data_headers)}>
                                <Icon source={ClipboardIcon}
                                    tone='base' />
                            </div>
                        </div>
                        <div className='Data-sub-main Data-sub-mainTwo'>
                            <p >Data Body:</p>
                            <span className='data-body-span me-2'>{selectedRequest.request_data}</span>
                            <div className='cursor-pointer' onClick={() => handleCopy(selectedRequest.request_data)}>
                                <Icon source={ClipboardIcon}
                                    tone='base' />
                            </div>
                        </div>
                        {selectedRequest.decoded_request_data && <div className='Data-sub-main'>
                            <p >Decoded Data Body:</p>
                            <span className='data-body-span me-2'>{selectedRequest.decoded_request_data}</span>
                            <div className='cursor-pointer' onClick={() => handleCopy(selectedRequest.decoded_request_data)}>
                                <Icon source={ClipboardIcon}
                                    tone='base' />
                            </div>
                        </div>}
                        <div className='Data-sub-main'>
                            <p>Response Body:</p>
                            <span className='data-body-span me-2'>{selectedRequest.response_body}</span>
                            <div className='cursor-pointer' onClick={() => handleCopy(selectedRequest.response_body)}>
                                <Icon source={ClipboardIcon}
                                    tone='base' />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}

GatewayActivityRequest.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default GatewayActivityRequest;
