import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Grid, Page, Text, Tabs } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import PunchoutSessionsTable from './PunchoutSessionsTable';
import OrderRequestsTable from './OrderRequestsTable';
import OrderInvoicesTable from './OrderInvoicesTable';

function GatewayActivity() {

    const [selected, setSelected] = useState(0);

    useEffect(() => {
        if (route().current() == 'punchout.gateway-activity.sessions') {
            setSelected(0);
        } else if (route().current() == 'punchout.gateway-activity.order-requests') {
            setSelected(1);
        } else if (route().current() == 'punchout.gateway-activity.order-invoices') {
            setSelected(2);
        }

    }, [location.pathname])

    const handleTabChange = useCallback((selectedTabIndex) => {
        console.log(selectedTabIndex);
        if (selectedTabIndex == 0) {
            history.pushState(null, '', route('punchout.gateway-activity.sessions'));
        } else if (selectedTabIndex == 1) {
            history.pushState(null, '', route('punchout.gateway-activity.order-requests'));
        } else if (selectedTabIndex == 2) {
            history.pushState(null, '', route('punchout.gateway-activity.order-invoices'));
        }
        setSelected(selectedTabIndex);
    }, []);

    const tabs = [
        {
            id: 'Sessions',
            content: 'Punchout Sessions',
            panelID: 'Sessions',
        },
        {
            id: 'Order-Requests',
            content: 'Order Requests',
            panelID: 'Order-Requests',
        },
        {
            id: 'Order-Invoices',
            content: 'Order Invoices',
            panelID: 'Order-Invoices',
        },
    ];

    return (
        <div>
            <Page fullWidth>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> Gateway Activity
                        </div>
                        {/* <small style={{ display: 'block', fontWeight: '200' }}>Increased in the last 1 month</small> */}
                </div>

                <div className='Gateway-Activity-boxes-wrapper-PO'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>

                            <div className='gateway-activity-tabs-wrapper'>
                                <span className='gateway-activity-tabs-inner'>
                                    <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
                                </span>
                                <div className='tables-wrapper-PO'>
                                    <Card>

                                        {selected === 0 ? <div>
                                            <div className='tables-wrapper-PO-heading'>
                                                <Text variant="headingLg" as="h5">
                                                Gateway Punchout Sessions
                                                </Text>
                                            </div>
                                            <div>
                                                <PunchoutSessionsTable />
                                            </div>
                                        </div>
                                            : selected === 1 ?
                                                <div>
                                                    <div className='tables-wrapper-PO-heading'>
                                                        <Text variant="headingLg" as="h5">
                                                            Order Requests
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <OrderRequestsTable />
                                                    </div>
                                                </div>


                                                : selected === 2 ? <div>
                                                    <div className='tables-wrapper-PO-heading'>
                                                        <Text variant="headingLg" as="h5">
                                                            Order Invoices
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <OrderInvoicesTable />
                                                    </div>
                                                </div>
                                                    : null}
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

GatewayActivity.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default GatewayActivity;
