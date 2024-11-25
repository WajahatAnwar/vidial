import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';

import React, { useState, useCallback } from 'react';
import { Card, Grid, Page, Text, Tabs, DatePicker, Button } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import PunchoutSessionsTable from '../GatewayActivity/PunchoutSessionsTable';
import OrderRequestsTable from '../GatewayActivity/OrderRequestsTable';
import OrderInvoicesTable from '../GatewayActivity/OrderInvoicesTable';
import DatePickerGlobal from '../Components/DatePickerGlobal';

function Reports(props) {

    return (
        <div>
            <Page fullWidth>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> Gateway Activity </div>
                </div>

                <div className='Gateway-Activity-boxes-wrapper-PO'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                            <Card>
                                <div className='text-center mt-5'>
                                <Text variant="headingXl" as="h5">
                                Punchout Sessions Report
                                </Text>
                                </div>
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                                      <div className='DatePickerGlobalwrapper'>
                                      <div className='DatePickerGlobalwrapper-inner'>
                                        <Text>Month</Text>
                                           <DatePickerGlobal />
                                      </div>
                                        <div className='multi-color-btn'><Button>View</Button></div>
                                      </div>
                                    </Grid.Cell>

                                </Grid>
                            </Card>

                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                        <Card>
                                <div className='text-center mt-5'>
                                <Text variant="headingXl" as="h5">
                                Layered Overview Report
                                </Text>
                                </div>
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                                      <div className='DatePickerGlobalwrapper'>
                                      <div className='DatePickerGlobalwrapper-inner'>
                                        <Text>Month</Text>
                                           <DatePickerGlobal />
                                      </div>
                                        <div className='multi-color-btn'><Button>View</Button></div>
                                      </div>
                                    </Grid.Cell>

                                </Grid>
                            </Card>
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>
        </div>
    );
}

Reports.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Reports;
