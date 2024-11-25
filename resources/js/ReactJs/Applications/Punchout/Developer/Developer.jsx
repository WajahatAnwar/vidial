import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';
import { Button, Card, Grid, Label, Modal, Page, RangeSlider, Select, Tabs, Text, TextField } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useEffect, useState } from 'react';
import GatewayClientsTable from '../Components/GatewayClientsTable';
import { Spinner } from '@shopify/polaris';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { resetGatewayClient, setGatewayClient } from '@/ReactJs/reducers/Punchout/DeveloperSlice';
import ClientCredentials from './ClientCredentials';
import ToggleSmall from '@/ReactJs/Components/ToggleSmall';

function Developer() {

    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => {
        setActive(!active), [active]
        dispatch(setGatewayClient({
            uuid: '',
            name: '',
            toDomain: '',
            fromDomain: '',
            fromIdentity: '',
            toIdentity: '',
            selectedNetwork: '',
            invoice_receiver_url: ''
        }));
    });
    const handleEditChange = useCallback(() => setActive(!active), [active]);

    const [selected, setSelected] = useState(0);
    const handleTabChange = useCallback((selectedTabIndex) => { setSelected(selectedTabIndex); }, []);


    // const [credentialsvalue, setCredentialsValue] = useState('');

    // const handleCredentialsChange = useCallback(
    //     (credentialsvalue) => setCredentialsValue(credentialsvalue),
    //     [],
    // );
    const [credentialsValue, setCredentialsValue] = useState('');

    const handleCredentialsChange = useCallback(
        (e) => setCredentialsValue(e.target.value),
        []
    );

    const gatewayClient = useSelector(state => state.punchoutDeveloper.gatewayClient);
    const dispatch = useDispatch();

    const handleFormChange = useCallback((object) => {
        dispatch(setGatewayClient(object));
    }, []);

    const tabs = [
        {
            id: 'Gateway-Clients',
            content: 'Gateway Clients ',
            panelID: 'Gateway-Clients',
        },
        {
            id: 'CXML-Post-Test',
            content: 'CXML Post Test',
            panelID: 'CXML-Post-Test',
        },
    ];

    const [networksList, setNetworksList] = useState([]);
    const [namesList, setNamesList] = useState([]);

    const [loading, setLoading] = useState(false);

    const [reloadTable, setReloadTable] = useState(false);
    const [errors, setErrors] = useState(false);
    const [valueData, setValueData] = useState();
    const handleChangeData = (newValueData) => {
        setValueData(newValueData)
        setErrors({
            ...errors,
            'data': false
        })
    };

    const [selectedClient, setSelectedClient] = useState();
    const [selectedEndpoint, setSelectedEndpoint] = useState([])
    const handleSelectChangeClient = (valueClient) => {
        setSelectedClient(valueClient)
        setErrors({
            ...errors,
            'client': false
        })
    };
    const handleEndPointChange = (value) => {
        setSelectedEndpoint(value)
        setErrors({
            ...errors,
            'endpoint': false
        })
    };

    const [clients, setClients] = useState([])
    const [endPoints, setEndPoints] = useState([
        { label: 'Punchout Setup', value: 'punchoutsetup' },
        { label: 'Order Request', value: 'orderrequest' },
        { label: 'Invoice Receiver', value: 'invoicereceiver' },
    ])

    useEffect(() => {
        fetch(route('punchout.networks.list'))
            .then(response => response.json())
            .then(result => {
                setNetworksList(result.data[0].map((network, index) => {
                    index == 0 && handleFormChange({ ...gatewayClient, selectedNetwork: `${network.id}` });
                    return {
                        label: network.name,
                        value: `${network.id}`
                    }
                }));
                setNamesList(result.data[1])
                setClients(result.data[2].map((client, index) => {
                    return {
                        label: client.name,
                        value: `${client.id}`
                    }
                }))
            });
    }, []);

    const [enableDiscountCode, setEnableDiscountCode] = useState(false)

    const handleToggle = (e) => {
        setEnableDiscountCode(e.target.checked)
        handleFormChange({
            ...gatewayClient,
            discount_code: e.target.checked
        })
    }

    async function createGatewayClient() {

        setLoading(true);
        const payload = gatewayClient;

        const response = await fetch(route('punchout.create_client.list'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        // console.log(result);
        setLoading(false);
        if (result.success) {
            setActive(false);
            dispatch(resetGatewayClient());
            setReloadTable(!reloadTable);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: result.message,
            });
        }
    }

    const [resultData, setResultData] = useState(null)

    async function handleCXMLPost() {


        setLoading(true);
        setErrors(false);
        setResultData(null)
        const payload = {
            client: selectedClient,
            endPoint: selectedEndpoint,
            data: valueData,
        };

        const response = await fetch(route('punchout.cxml_post.create'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        setLoading(false);
        console.log(result);
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Success...',
                text: 'CXML Posted.',
            });
            setResultData(result.data)
        } else {
            if (response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permission.",
                })
            }
            else {

                setErrors(result.errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    };

    return (
        <div>
            <Page fullWidth>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> Developer
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
                                    {selected === 0 && (
                                        <Button size='large' onClick={handleChange}>+ Create</Button>
                                    )}
                                </div>
                                <div className='tables-wrapper-PO'>



                                    <Card>


                                        {/* <div className='client-Credentials-main'>
                                            <p>eku.ccbrands.com Shopify Client Credentials</p>

                                            <div className='client-Credentials-main-textfield'>
                                                <span>Password</span>
                                                <TextField value={credentialsvalue} onChange={handleCredentialsChange} autoComplete="off" />

                                                <input type="text" value={credentialsValue} onChange={handleCredentialsChange} autoComplete="off" />
                                            </div>


                                            <div className="multi-color-btn client-Credentials-main-button modal-pop-up-multi-btn">

                                                <button>Authenticate</button>

                                            </div>


                                        </div> */}


                                        {selected === 0 ? <div>
                                            <div className='tables-wrapper-PO-heading'>
                                                <Text variant="headingLg" as="h5">
                                                    Gateway Clients

                                                </Text>
                                            </div>
                                            <div>
                                                <GatewayClientsTable reloadTable={reloadTable} active={active} handleEditChange={handleEditChange} />
                                            </div>
                                        </div>
                                            : selected === 1 ?
                                                <div>
                                                    <div className='tables-wrapper-PO-heading'>
                                                        <Text variant="headingLg" as="h5">
                                                            CXML Post Test
                                                        </Text>
                                                    </div>
                                                    <div className="Cataloginformation-simulator">
                                                        <Grid>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                <Select
                                                                    label="Client"
                                                                    options={clients}
                                                                    onChange={handleSelectChangeClient}
                                                                    value={selectedClient}
                                                                    placeholder='Select a client'
                                                                    requiredIndicator
                                                                    error={errors ? errors.client ? errors.client[0] : false : false}
                                                                />

                                                            </Grid.Cell>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                <Select
                                                                    label="Endpoint"
                                                                    options={endPoints}
                                                                    onChange={handleEndPointChange}
                                                                    value={selectedEndpoint}
                                                                    placeholder='Select Endpoint'
                                                                    requiredIndicator
                                                                    error={errors ? errors.endPoint ? errors.endPoint[0] : false : false}
                                                                />
                                                            </Grid.Cell>
                                                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                                <TextField
                                                                    label="Data"
                                                                    value={valueData}
                                                                    onChange={handleChangeData}
                                                                    multiline={4}
                                                                    autoComplete="off"
                                                                    placeholder='Enter cXML'
                                                                    requiredIndicator
                                                                    error={errors ? errors.data ? errors.data[0] : false : false}
                                                                />
                                                            </Grid.Cell>
                                                            {
                                                                resultData &&
                                                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                                    <TextField
                                                                        label="Result"
                                                                        value={resultData}
                                                                        multiline={4}
                                                                        autoComplete="off"
                                                                        disabled
                                                                    />
                                                                </Grid.Cell>
                                                            }
                                                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                                <div className='multi-color-btn text-right'><Button onClick={handleCXMLPost} disabled={loading}>{loading ? <Spinner size='small'></Spinner> : 'Send'}</Button></div>
                                                            </Grid.Cell>
                                                        </Grid>
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
            <Modal
                open={active}
                onClose={handleChange}
                title="Create Gateway Client"
            >
                <Modal.Section>
                    <div className='modal-wrapper-PO'>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                <Select
                                    placeholder="Select"
                                    label="Name"
                                    options={namesList}
                                    onChange={(e) => handleFormChange({
                                        ...gatewayClient,
                                        name: e
                                    })}
                                    value={gatewayClient.name}
                                />
                                <div style={{ marginBottom: "10px" }}></div>
                                {/* <TextField
                                    label="Name"
                                    value={gatewayClient.name}
                                    onChange={(e) => handleFormChange({
                                        ...gatewayClient,
                                        name: e
                                    })}
                                    autoComplete="off"
                                /> */}
                                <div style={{ marginBottom: "10px" }}></div>
                                <TextField
                                    label="From Domain"
                                    value={gatewayClient.fromDomain}
                                    onChange={(e) => handleFormChange({
                                        ...gatewayClient,
                                        fromDomain: e
                                    })}
                                    autoComplete="off"
                                />
                                <div style={{ marginBottom: "10px" }}></div>
                                <TextField
                                    label="To Domain"
                                    value={gatewayClient.toDomain}
                                    onChange={(e) => handleFormChange({
                                        ...gatewayClient,
                                        toDomain: e
                                    })}
                                    autoComplete="off"
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <Select
                                    placeholder="Select"
                                    label="Network"
                                    options={networksList}
                                    onChange={(e) => handleFormChange({
                                        ...gatewayClient,
                                        selectedNetwork: e
                                    })}
                                    value={gatewayClient.selectedNetwork}
                                />
                                <div style={{ marginBottom: "10px" }}></div>

                                <TextField
                                    label="From Identity"
                                    value={gatewayClient.fromIdentity}
                                    onChange={(e) => handleFormChange({
                                        ...gatewayClient,
                                        fromIdentity: e
                                    })}
                                    autoComplete="off"
                                />
                                <div style={{ marginBottom: "10px" }}></div>
                                <TextField
                                    label="To Identity"
                                    value={gatewayClient.toIdentity}
                                    onChange={(e) => handleFormChange({
                                        ...gatewayClient,
                                        toIdentity: e
                                    })}
                                    autoComplete="off"
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 9, sm: 9, md: 9, lg: 9, xl: 9 }}>
                                <TextField
                                    label="Invoice Receiver Url"
                                    value={gatewayClient.invoice_receiver_url}
                                    onChange={(e) => handleFormChange({
                                        ...gatewayClient,
                                        invoice_receiver_url: e
                                    })}
                                    autoComplete="off"
                                />
                                <div style={{ marginBottom: "10px" }}></div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                <Label>Discount Code</Label>
                                <div className='mt-2'>
                                    <ToggleSmall toggled={enableDiscountCode} onClick={handleToggle} />
                                </div>
                                <div style={{ marginBottom: "10px" }}></div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <TextField
                                    label="Credentials Password"
                                    value={gatewayClient.credentials_password}
                                    onChange={(e) => handleFormChange({
                                        ...gatewayClient,
                                        credentials_password: e
                                    })}
                                    autoComplete="off"
                                />
                            </Grid.Cell>
                        </Grid>
                        <div className='modal-wrapper-PO-btn mt-10'>
                            <Button size='large' onClick={createGatewayClient} disabled={loading ? true : false}>{!loading ? 'Create Gateway Client' : <Spinner size='small' />}</Button>
                        </div>
                    </div>
                </Modal.Section>
            </Modal>
        </div>
    );
}

Developer.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Developer;
