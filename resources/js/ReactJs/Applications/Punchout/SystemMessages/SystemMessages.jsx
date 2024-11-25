import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';

import React, { useState, useCallback } from 'react';
import { Card, Grid, Page, Text, Tabs, Button, Icon, DropZone, LegacyStack, Thumbnail } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import PunchoutSessionsTable from '../GatewayActivity/PunchoutSessionsTable';
import OrderRequestsTable from '../GatewayActivity/OrderRequestsTable';
import OrderInvoicesTable from '../GatewayActivity/OrderInvoicesTable';
import GatewayClientsTable from '../Components/GatewayClientsTable';

import { Frame, Modal, TextField, BlockStack, Select } from '@shopify/polaris';

import { NoteIcon } from '@shopify/polaris-icons';
import SystemMessagesTable from './SystemMessagesTable';



function SystemMessages(props) {




    //
    // const [value, setValue] = useState('Jaded Pixel');
    // const handleChange = useCallback(
    //     (newValue) => setValue(newValue),
    //     [],
    // );
    //





    return (
        <div>
            <Page fullWidth>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> Settings
                        {/* <small style={{ display: 'block', fontWeight: '200' }}>Increased in the last 1 month</small> */}
                    </div>
                </div>

                <div className='Gateway-Activity-boxes-wrapper-PO'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>

                            <div className='gateway-activity-tabs-wrapper'>
                                <div className='gateway-activity-tabs-inner-wrapper'>



                                </div>
                                <div className='tables-wrapper-PO'>
                                    <Card>

                                        <SystemMessagesTable />
                                    </Card>
                                </div>
                            </div>

                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>









        </div>
    );
}

SystemMessages.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default SystemMessages;
