import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Grid, Page, Text, Tabs, Button } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import PunchoutSessionsTable from '../GatewayActivity/PunchoutSessionsTable';
import OrderRequestsTable from '../GatewayActivity/OrderRequestsTable';
import OrderInvoicesTable from '../GatewayActivity/OrderInvoicesTable';
import GatewayClientsTable from '../Components/GatewayClientsTable';

import { Frame, Modal, TextField, BlockStack, Select } from '@shopify/polaris';
import PunchoutSimulatorTable from './PunchoutSimulatorTable';
import ProcurementOrdersSimulatorTable from './ProcurementOrdersSimulatorTable';
import { router } from '@inertiajs/react';

function Simulator({ street_addresses }) {


    //

    const [activePreparePunchout, setActivePreparePunchout] = useState(false);

    const handleChangePreparePunchout = useCallback(() => setActivePreparePunchout(!activePreparePunchout), [activePreparePunchout]);

    const activatorPreparePunchout = [];


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
    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);
    const activator = [];

    //
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        if(route().current() == 'punchout.simulator.catalogs') {
            setSelected(0);
        } else if(route().current() == 'punchout.simulator.orders') {
            setSelected(1);
        }
    }, [location.pathname])

    const handleTabChange = useCallback((selectedTabIndex) => {
        console.log(selectedTabIndex);
        if(selectedTabIndex == 0) {
            router.replace(route('punchout.simulator.catalogs'));
        } else if(selectedTabIndex == 1) {
            router.replace(route('punchout.simulator.orders'));
        }
        setSelected(selectedTabIndex);
    }, []);

    const tabs = [
        {
            id: 'Punchout',
            content: 'Punchout',
            panelID: 'Dashboard-content-1',
        },
        {
            id: 'Orders',
            content: 'Orders',
            panelID: 'Profile-customers-content-1',
        },
    ];

    //

    const [valueName, setValueName] = useState('Jaded Pixel');
    const handleChangeName = useCallback(
        (newValueName) => setValueName(newValueName),
        [],
    );
    //
    const [valueSharedSecret, setValueSharedSecret] = useState('Jaded Pixel');
    const handleChangeSharedSecret = useCallback(
        (newValueSharedSecret) => setValueSharedSecret(newValueSharedSecret),
        [],
    );
    //
    const [valueStagingProfileUrl, setValueStagingProfileUrl] = useState('Jaded Pixel');
    const handleChangeStagingProfileUrl = useCallback(
        (newValueStagingProfileUrl) => setValueStagingProfileUrl(newValueStagingProfileUrl),
        [],
    );
    //
    const [valueProductionProfileUrl, setValueProductionProfileUrl] = useState('Jaded Pixel');
    const handleChangeProductionProfileUrl = useCallback(
        (newValueProductionProfileUrl) => setValueProductionProfileUrl(newValueProductionProfileUrl),
        [],
    );
    //







    //
    const [valueNetwork, setValueNetwork] = useState('Jaded Pixel');
    const handleChangeNetwork = useCallback(
        (newValueNetwork) => setValueNetwork(newValueNetwork),
        [],
    );
    //
    //
    const [valueStagingPunchoutUrl, setValueStagingPunchoutUrl] = useState('Jaded Pixel');
    const handleChangeStagingPunchoutUrl = useCallback(
        (newValueStagingPunchoutUrl) => setValueStagingPunchoutUrl(newValueStagingPunchoutUrl),
        [],
    );
    //

    //
    const [valueFromIdentity, setValueFromIdentity] = useState('Jaded Pixel');
    const handleChangeFromIdentity = useCallback(
        (newValueFromIdentity) => setValueFromIdentity(newValueFromIdentity),
        [],
    );
    //
    //
    const [valueCataloginformation, setValueCataloginformation] = useState('Jaded Pixel');
    const handleChangeCataloginformation = useCallback(
        (newValueCataloginformation) => setValueCataloginformation(newValueCataloginformation),
        [],
    );
    //

    //
    const [valueCurrent, setValueCurrent] = useState('Jaded Pixel');
    const handleChangeCurrent = useCallback(
        (newValueFromCurrent) => setValueCurrent(newValueCurrent),
        [],
    );
    //

    //
    const [valueProductionPunchoutUrl, setValueProductionPunchoutUrl] = useState('Jaded Pixel');
    const handleChangeProductionPunchoutUrl = useCallback(
        (newValueProductionPunchoutUrl) => setValueProductionPunchoutUrl(newValueProductionPunchoutUrl),
        [],
    );
    //

    //
    const [valueToIdentity, setValueToIdentity] = useState('Jaded Pixel');
    const handleChangeToIdentity = useCallback(
        (newValueToIdentity) => setValueToIdentity(newValueToIdentity),
        [],
    );
    //
    //
    const [valueFromDomain, setValueFromDomain] = useState('Jaded Pixel');
    const handleChangeFromDomain = useCallback(
        (newValueFromDomain) => setValueFromDomain(newValueFromDomain),
        [],
    );
    //



    //
    const [valueStagingOrderTransferUrl, setValueStagingOrderTransferUrl] = useState('Jaded Pixel');
    const handleChangeStagingOrderTransferUrl = useCallback(
        (newValueStagingOrderTransferUrl) => setValueStagingOrderTransferUrl(newValueStagingOrderTransferUrl),
        [],
    );
    //



    //
    const [valueProductionOrderTransferUrl, setValueProductionOrderTransferUrl] = useState('Jaded Pixel');
    const handleChangeProductionOrderTransferUrl = useCallback(
        (newValueProductionOrderTransferUrl) => setValueProductionOrderTransferUrl(newValueProductionOrderTransferUrl),
        [],
    );
    //





    //
    const [valueData, setValueData] = useState('Jaded Pixel');
    const handleChangeData = useCallback(
        (newValueData) => setValueData(newValueData),
        [],
    );
    //


    //
    // const [value, setValue] = useState('Jaded Pixel');
    // const handleChange = useCallback(
    //     (newValue) => setValue(newValue),
    //     [],
    // );
    //
    const [selectedParser, setSelectedParser] = useState('today');

    const handleSelectChangeParser = useCallback(
        (valueParser) => setSelectedParser(valueParser),
        [],
    );

    const optionsParser = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 days', value: 'lastWeek' },
    ];
    //
    const [selectedClient, setSelectedClient] = useState('today');

    const handleSelectChangeClient = useCallback(
        (valueClient) => setSelectedClient(valueClient),
        [],
    );

    const optionsClient = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 days', value: 'lastWeek' },
    ];
    //

    //
    const [selectedEndpoint, setSelectedEndpoint] = useState('today');

    const handleSelectChangeEndpoint = useCallback(
        (valueEndpoint) => setSelectedEndpoint(valueEndpoint),
        [],
    );

    const optionsEndpoint = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 days', value: 'lastWeek' },
    ];
    //

    //


    //
    const [selectedType, setSelectedType] = useState('SciQuest');

    const handleSelectChangeType = useCallback(
        (valueType) => setSelectedType(valueType),
        [],
    );

    const optionsType = [
        { label: 'SciQuest', value: 'SciQuest' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 days', value: 'lastWeek' },
    ];
    //
    //
    const [selectedClubColorsEStatePkwy, setSelectedClubColorsEStatePkwy] = useState('SciQuest');

    const handleSelectChangeClubColorsEStatePkwy = useCallback(
        (valueClubColorsEStatePkwy) => setSelectedClubColorsEStatePkwy(valueClubColorsEStatePkwy),
        [],
    );

    const optionsClubColorsEStatePkwy = [
        { label: 'SciQuest', value: 'SciQuest' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Last 7 days', value: 'lastWeek' },
    ];
    //



    return (
        <div>
            <Page fullWidth>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> Simulator
                         {/* <small style={{ display: 'block', fontWeight: '200' }}>Increased in the last 1 month</small> */}
                         </div>
                </div>

                <div className='Gateway-Activity-boxes-wrapper-PO'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>

                            <div className='gateway-activity-tabs-wrapper'>
                                <div className='gateway-activity-tabs-inner-wrapper'>
                                    <span className='gateway-activity-tabs-inner'>
                                        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
                                    </span>
                                    {/* <Button size='large' onClick={handleChange}>+ Create </Button> */}

                                </div>
                                <div className='tables-wrapper-PO'>
                                    <Card>

                                        {selected === 0 ? <div>
                                            <div className='tables-wrapper-PO-heading'>
                                                <Text variant="headingLg" as="h5">
                                                    Punchout Simulator
                                                </Text>
                                            </div>
                                            <div>
                                                <PunchoutSimulatorTable street_addresses={street_addresses} />
                                            </div>
                                        </div>
                                            : selected === 1 ?
                                                <div>
                                                    <div className='tables-wrapper-PO-heading'>
                                                        <Text variant="headingLg" as="h5">
                                                            Procurement Orders
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <ProcurementOrdersSimulatorTable />
                                                    </div>
                                                </div>



                                                // : selected === 3 ? <div>data 4</div>
                                                : null}
                                    </Card>
                                </div>
                            </div>

                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>


            {/* Modal Start */}
            <div >

                <Modal
                    activator={activator}
                    open={active}
                    onClose={handleChange}
                    title="Create Catalog"
                    size='Large'


                >
                    <Modal.Section>
                        <div className='modal-wrapper-PO'>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                    <SpacingBackground>
                                        <BlockStack gap="500">
                                            <TextField
                                                label="Name"
                                                value={valueName}
                                                onChange={handleChangeName}
                                                autoComplete="off"
                                            />


                                            {/* <Select
                                                    label="Parser"
                                                    options={optionsParser}
                                                    onChange={handleSelectChangeParser}
                                                    value={selectedParser}
                                                /> */}



                                            <TextField
                                                label="Shared Secret"
                                                value={valueSharedSecret}
                                                onChange={handleChangeSharedSecret}
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Staging Profile Url"
                                                value={valueStagingProfileUrl}
                                                onChange={handleChangeStagingProfileUrl}
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Production Profile Url"
                                                value={valueProductionProfileUrl}
                                                onChange={handleChangeProductionProfileUrl}
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Staging Punchout Url "
                                                value={valueStagingPunchoutUrl}
                                                onChange={handleChangeStagingPunchoutUrl}
                                                autoComplete="off"
                                            />





                                        </BlockStack>
                                    </SpacingBackground>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                    <SpacingBackground>
                                        <BlockStack gap="500">


                                            <TextField
                                                label="Network"
                                                value={valueNetwork}
                                                onChange={handleChangeNetwork}
                                                autoComplete="off"
                                            />



                                            <TextField
                                                label="Staging Punchout Url"
                                                value={valueStagingPunchoutUrl}
                                                onChange={handleChangeStagingPunchoutUrl}
                                                autoComplete="off"
                                            />

                                            <TextField
                                                label="Production Punchout Url"
                                                value={valueProductionPunchoutUrl}
                                                onChange={handleChangeProductionPunchoutUrl}
                                                autoComplete="off"
                                            />

                                            <TextField
                                                label="From Domain"
                                                value={valueFromDomain}
                                                onChange={handleChangeFromDomain}
                                                autoComplete="off"
                                            />

                                            <TextField
                                                label="To Identity"
                                                value={valueToIdentity}
                                                onChange={handleChangeToIdentity}
                                                autoComplete="off"
                                            />

                                        </BlockStack>
                                    </SpacingBackground>


                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                                    <SpacingBackground>
                                        <BlockStack gap="500">
                                            <Select
                                                label="Type"
                                                options={optionsType}
                                                onChange={handleSelectChangeType}
                                                value={selectedType}
                                            />

                                            <TextField
                                                label="Staging Order Transfer Url"
                                                value={valueStagingOrderTransferUrl}
                                                onChange={handleChangeStagingOrderTransferUrl}
                                                autoComplete="off"
                                            />



                                            <TextField
                                                label="Production Order Transfer Url"
                                                value={valueProductionOrderTransferUrl}
                                                onChange={handleChangeProductionOrderTransferUrl}
                                                autoComplete="off"
                                            />

                                            <TextField
                                                label="From Identity"
                                                value={valueFromIdentity}
                                                onChange={handleChangeFromIdentity}
                                                autoComplete="off"
                                            />




                                        </BlockStack>
                                    </SpacingBackground>
                                </Grid.Cell>

                            </Grid>
                            <div className='modal-wrapper-PO-btn mt-5'>

                                <Button size='large'>Create Catalog</Button>
                            </div>
                        </div>
                    </Modal.Section>
                </Modal>

            </div>
            {/* Modal Ends */}

            {/* Second Modal start */}

            <div >

                <Modal
                    activator={activatorPreparePunchout}
                    open={activePreparePunchout}
                    onClose={handleChangePreparePunchout}

                >
                    <Modal.Section>
                        <Text variant="headingXl" as="h4">
                            Prepare Punchout
                        </Text>

                        <Text variant="bodyLg" as="p">
                            Prepare Punchout for fairfieldccbrands.com Shopify Client Gateway Client
                        </Text>

                        <div className='mt-5 StartPunchout-modal'>
                            <div className='StartPunchout-modal-select'>
                                <Select
                                    label="Club Colors - 420 E State Pkwy"
                                    options={optionsClubColorsEStatePkwy}
                                    onChange={handleSelectChangeClubColorsEStatePkwy}
                                    value={selectedClubColorsEStatePkwy}
                                />
                            </div>
                            <div className='multi-color-btn'>
                                <Button>Start Punchout</Button>
                            </div>

                        </div>
                        <div className='mt-5'>

                            <Card>
                                <div className='text-center'>

                                <Text variant="headingXl" as="h4">
                                    Catalog information
                                </Text>

                                </div>
                                <div className='StartPunchout-modal-card mt-3'>
                                   <div className='mr-3' style={{width:'90px'}}> <Text>Name</Text></div>
                                   <div className='StartPunchout-modal-card-inner'>
                                    <TextField
                                        value={valueCataloginformation}
                                        onChange={handleChangeCataloginformation}
                                        autoComplete="off"
                                    />
                                    </div>
                                </div>
                                <div className='StartPunchout-modal-card mt-3'>
                                   <div className='mr-3' style={{width:'90px'}}> <Text>Current</Text></div>
                                   <div className='StartPunchout-modal-card-inner'>
                                    <TextField
                                        value={valueCurrent}
                                        onChange={handleChangeCurrent}
                                        autoComplete="off"
                                    />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Modal.Section>
                </Modal>

            </div>
            {/* Second Modal ends */}


        </div>
    );
}

Simulator.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Simulator;
