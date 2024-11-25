import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';
import { BlockStack, Button, Card, Grid, Modal, Page, Spinner, Tabs, Text, TextField } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useState } from 'react';
import AccountAddress from './SettingsAccountAddressesTable';
import GatewayClient from './SettingsGatewayClientsTable';
import Catalogs from './SettingsProcurementCatalogsTable';
import "./settings.css";
import Swal from 'sweetalert2';

function Settings() {

    const [accountAddress, setAccountAddress] = useState({
        deliver_to: '',
        ident: '',
        label: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        iso_country_code: '',
    });

    const handleFormChange = useCallback((object) => {
        setAccountAddress(object);
    }, []);

    const [loading, setLoading] = useState(false);

    const [activeCreateCompanyAddress, setActiveCreateCompanyAddress] = useState(false);

    const handleChangeCreateCompanyAddress = useCallback(() => {
        setActiveCreateCompanyAddress(!activeCreateCompanyAddress), [activeCreateCompanyAddress]
        setAccountAddress({
            deliver_to: '',
            ident: '',
            label: '',
            line1: '',
            line2: '',
            city: '',
            state: '',
            postal_code: '',
            iso_country_code: '',
        });
    });

    const [selected, setSelected] = useState(0);

    const handleTabChange = useCallback((selectedTabIndex) => {
        console.log(selectedTabIndex);
        setSelected(selectedTabIndex);
    }, []);

    const tabs = [
        {
            id: 'Catalogs',
            content: 'Catalogs',
            panelID: 'catalogs',
        },
        {
            id: 'GatewayClients',
            content: 'Gateway Clients',
            panelID: 'gatewayClients',
        },
        {
            id: 'AccountAddresses',
            content: 'Account Addresses',
            panelID: 'accountAddresses',
        },
    ];

    const [errors, setErrors] = useState(false)
    const [refresh, setRefresh] = useState(false)

    async function createAccountAddress() {

        setLoading(true);
        setErrors(null)
        const payload = accountAddress;
        const response = await fetch(route('punchout.account_address.create'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        setLoading(false);
        if (result.success) {
            setRefresh(true)
            handleChangeCreateCompanyAddress();
            Swal.fire({
                icon: 'success',
                title: 'Created!',
                text: 'Account Address Created!',
            });
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

    }

    return (
        <div>
            <Page fullWidth>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}>
                        Settings
                        </div>
                        {/* <small style={{ display: 'block', fontWeight: '200' }}>Increased in the last 1 month</small> */}
                </div>

                <div className='Gateway-Activity-boxes-wrapper-PO'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                            <div className='gateway-activity-tabs-wrapper'>
                                <div className='gateway-activity-tabs-inner-wrapper'>
                                    <span className='gateway-activity-tabs-inner'>
                                        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
                                    </span>
                                    {
                                        selected === 2 ?
                                            <Button hidden={true} size='large' onClick={handleChangeCreateCompanyAddress}>+ Create</Button>
                                            :
                                            null
                                    }
                                </div>
                                <div className='tables-wrapper-PO'>
                                    <Card>
                                        {selected === 0 ?
                                            <div>
                                                <div className='tables-wrapper-PO-heading'>
                                                    <Text variant="headingLg" as="h5">
                                                        Catalogs
                                                    </Text>
                                                </div>
                                                <div>
                                                    <Catalogs />
                                                </div>
                                            </div>
                                            : selected === 1 ?
                                                <div>
                                                    <div className='tables-wrapper-PO-heading'>
                                                        <Text variant="headingLg" as="h5">
                                                            Gateway Clients
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <GatewayClient />
                                                    </div>
                                                </div>
                                                : selected === 2 ?
                                                    <div>
                                                        <div className='tables-wrapper-PO-heading'>
                                                            <Text variant="headingLg" as="h5">
                                                                Account Addresses
                                                            </Text>
                                                        </div>
                                                        <div>
                                                            <AccountAddress refresh={refresh} />
                                                        </div>
                                                    </div>
                                                    :
                                                    null
                                        }
                                    </Card>
                                </div>
                            </div>
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>

            {/* Account Address start */}

            <div>
                <Modal
                    open={activeCreateCompanyAddress}
                    onClose={handleChangeCreateCompanyAddress}
                    title="Create Account Address"
                    size='Large'
                >
                    <Modal.Section>
                        <div className='modal-wrapper-PO'>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <BlockStack gap="500">
                                        <div className='cstm-aesterik'>
                                            <TextField
                                                label="Deliver To"
                                                value={accountAddress.deliver_to}
                                                onChange={(e) => handleFormChange({
                                                    ...accountAddress,
                                                    deliver_to: e
                                                })}
                                                autoComplete="off"
                                                error={errors ? errors.deliver_to ? errors.deliver_to[0] : false : false}
                                            />
                                        </div>
                                        <div className='cstm-aesterik'>
                                            <TextField
                                                label="label"
                                                value={accountAddress.label}
                                                onChange={(e) => handleFormChange({
                                                    ...accountAddress,
                                                    label: e
                                                })}
                                                autoComplete="off"
                                                error={errors ? errors.label ? errors.label[0] : false : false}
                                            />
                                        </div>
                                        <TextField
                                            label="Line 2"
                                            value={accountAddress.line2}
                                            onChange={(e) => handleFormChange({
                                                ...accountAddress,
                                                line2: e
                                            })}
                                            autoComplete="off"
                                        />
                                        <div className='cstm-aesterik'>
                                            <TextField
                                                label="State"
                                                value={accountAddress.state}
                                                onChange={(e) => handleFormChange({
                                                    ...accountAddress,
                                                    state: e
                                                })}
                                                autoComplete="off"
                                                error={errors? errors.state? errors.state[0] : false : false}
                                            />
                                        </div>
                                        <div className='cstm-aesterik'>
                                            <TextField
                                                label="ISO Country Code"
                                                value={accountAddress.iso_country_code}
                                                onChange={(e) => handleFormChange({
                                                    ...accountAddress,
                                                    iso_country_code: e
                                                })}
                                                autoComplete="off"
                                                error={errors? errors.iso_country_code? errors.iso_country_code[0] : false : false}
                                            />
                                        </div>
                                    </BlockStack>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <BlockStack gap="500">
                                        <div className='cstm-aesterik'>
                                            <TextField
                                                label="Ident"
                                                value={accountAddress.ident}
                                                onChange={(e) => handleFormChange({
                                                    ...accountAddress,
                                                    ident: e
                                                })}
                                                autoComplete="off"
                                                error={errors? errors.ident? errors.ident[0] : false : false}
                                            />
                                        </div>
                                        <div className='cstm-aesterik'>
                                            <TextField
                                                label="Line 1"
                                                value={accountAddress.line1}
                                                onChange={(e) => handleFormChange({
                                                    ...accountAddress,
                                                    line1: e
                                                })}
                                                autoComplete="off"
                                                error={errors? errors.line1? errors.line1[0] : false : false}
                                            />
                                        </div>
                                        <div className='cstm-aesterik'>
                                            <TextField
                                                label="City"
                                                value={accountAddress.city}
                                                onChange={(e) => handleFormChange({
                                                    ...accountAddress,
                                                    city: e
                                                })}
                                                autoComplete="off"
                                                error={errors? errors.city? errors.city[0] : false : false}
                                            />
                                        </div>
                                        <div className='cstm-aesterik'>
                                            <TextField
                                                label="Zip"
                                                value={accountAddress.postal_code}
                                                onChange={(e) => handleFormChange({
                                                    ...accountAddress,
                                                    postal_code: e
                                                })}
                                                autoComplete="off"
                                                error={errors? errors.postal_code? errors.postal_code[0] : false : false}
                                            />
                                        </div>
                                    </BlockStack>
                                </Grid.Cell>
                            </Grid>
                            <div className='modal-wrapper-PO-btn mt-10' >
                                <Button onClick={createAccountAddress} disabled={loading ? true : false}>{!loading ? 'Create Account Address' : <Spinner size='small' />}</Button>
                            </div>
                        </div>
                    </Modal.Section>
                </Modal>
            </div>

            {/* Account Address ends */}



        </div>
    );
}

Settings.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Settings;
