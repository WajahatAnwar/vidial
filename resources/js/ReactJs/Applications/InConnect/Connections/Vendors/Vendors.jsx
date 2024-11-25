import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import Toggle from '@/ReactJs/Components/ToggleSmall';
import { usePage } from '@inertiajs/react';
import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from '@mui/material/IconButton';
import { Button, ButtonGroup, Divider, Grid, Icon, Modal, Page, Text, TextField } from '@shopify/polaris';
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { useCallback, useState } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import VendorsTable from './VendorsTable';

import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import Leftmenu from '@/ReactJs/Applications/InConnect/Connections/LeftMenu/LeftMenu';
import Swal from 'sweetalert2';

function Vendors({ shopifyVendors, intactVendors, intactLocations, intactDepartments }) {
    const page = usePage().props;
    const { query } = page.ziggy;

    const shippingOptions = [
        // SANMAR
        "UPS-Ground",
        "UPS-2ND DAY",
        "UPS-2ND DAY AM",
        "UPS-3RD DAY",
        "UPS-NEXTDAY",
        "UPS-NEXT DAY EA",
        "UPS-NEXT DAY SV",
        "UPS-SATURDAY",
        "USPS-APP",
        "USPS-PP",
        "PSST-PSST",
        "UPS-Surface",
        "UPS-Blue",
        "UPS-Orange 3day",

        // ALPHA BRODER
        // 'UPS-Blue',
        'UPS-Orange',
        'UPS-Red',
        'UPS-RED.8:30am',
        'UPS-Sat.Dlvry.',
        'UPS-Surface',
        'UPS EXP Saver',
        'UPS ExpEarlyAM',
        'UPS Express',
        'UPS Sat Dlvry',
        'UPS Standard GD',

        // S&S
        'UPS GROUND',
        'UPS NEXTDAY',
        'UPS NEXTDAYEARLYAM',
        'UPS NEXTDAYSAVER',
        'UPS 2DAY',
        'UPS 2DAYAM',
        'UPS 3DAY',
        'UPS SUREPOST',
        'UPS SATURDAY',
        'UPS SATURDAYEARLY',
        'FEDEX GROUND',
        'FEDEX 2DAY',
        'FEDEX NEXTDAY',
        'FEDEX NEXTDAYPRIORITY',
        // SCRUB AUTHORITY - NO SHIPPINGS
    ];

    const animatedComponents = makeAnimated();

    // Modal popup
    const [active, setActive] = useState(false);
    const [reload, setReload] = useState(false);
    const handleChangeVendor = useCallback(() => setActive(!active), [active]);
    const activator = <span onClick={handleChangeVendor} style={{ display: 'none' }}>Open</span>;

    // Modal popup

    const shopify_vendors = shopifyVendors.map((item) => {
        return {
            value: item.id,
            label: item.name
        }
    });

    const intact_vendors = intactVendors.map((item) => {
        return {
            value: item.id,
            label: item.name
        }
    });

    const intact_locations = intactLocations.map((item) => {
        return {
            value: item.id,
            label: item.name
        }
    });

    const intact_departments = intactDepartments.map((item) => {
        return {
            value: item.id,
            label: item.name
        }
    });

    const [form, setForm] = useState({
        name: '',
        allow_processing: true,
        shopify_vendors: [],
        intact_vendor: {
            value: '',
            label: ''
        },
        intact_location: {
            value: '',
            label: ''
        },
        intact_department: {
            value: '',
            label: ''
        },
        shipping_method: "",
        address: {
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            zip_code: '',
        },
        po_prefix: '',
        username: '',
        password: '',
        product_data_endpoint: '',
        purchase_order_endpoint: '',
        pricing_and_configuration_endpoint: '',
        invoice_endpoint: '',
    });

    const handleChange = useCallback(
        (object) => {
            setForm(object)
        },
        []
    );

    const saveVendor = async () => {
        let response = await fetch(route('ic_vendors.store'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
        });
        let data = await response.json();
        if (data.success) {
            Swal.fire({
                title: 'Success!',
                icon: 'success',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            });
            setReload(!reload);
            setActive(false);
        } else {
            Swal.fire({
                position: "top-end",
                text: data.message,
                icon: "info",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    const reloadHandler = () => {
        setReload(!reload);
    }

    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div className='cc-inconnect-body-wraper'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('ic_index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}>Vendors</div>
                                </div>
                                <div className='addnewvendors'><Button onClick={handleChangeVendor} style={{ cursor: 'pointer' }}>Add New Vendor</Button></div>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 3, xl: 3 }}>
                            <Text variant='headingLg' as='h5'>
                                <Leftmenu />
                            </Text>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 9, xl: 9 }}>
                            <VendorsTable reload={reload} setReload={reloadHandler} shopifyVendors={shopifyVendors} intactVendors={intactVendors} intactLocations={intactLocations} intactDepartments={intactDepartments} />
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>


            <Modal
                size="large"
                activator={activator}
                open={active}
                onClose={handleChangeVendor}
                title="Add Vendor"
            >
                <Modal.Section>
                    <div className='cc-in-vendors-wrapper'>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div className='connection-toggle mb-4'>
                                    <Text variant="headingMd" as="h6">Allow Processing</Text>
                                    <Toggle toggled={form.allow_processing} onClick={(e) => handleChange({ ...form, allow_processing: e })} />
                                </div>
                                <Divider />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <div className='cust-staric2'>

                                    <TextField
                                        label="Vendor Name"
                                        value={form.name}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            name: input
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <label className='cust-staric' style={{ marginBottom: '4px', display: 'block' }}>
                                    Shopify Vendor
                                </label>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    closeMenuOnSelect={false}
                                    components={animatedComponents}
                                    isMulti
                                    onChange={(input) => {
                                        handleChange({
                                            ...form,
                                            shopify_vendors: input
                                        })
                                    }}
                                    value={form.shopify_vendors}
                                    options={shopify_vendors}
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <div style={{ marginBottom: "5px" }}><Text variant='headingSm' as='h6'><span className="cust-staric">Shipping Method</span></Text></div>
                                <Select
                                    // closeMenuOnSelect={false}
                                    components={animatedComponents}
                                    value={{
                                        value: form.shipping_method,
                                        label: form.shipping_method ? form.shipping_method.toString().replace(/-/g, ' ') : ''
                                    }}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    options={shippingOptions.map(item => ({ value: item, label: item.replace(/-/g, ' ') }))}
                                    onChange={(e) => handleChange({ ...form, shipping_method: e.value })}
                                />
                            </Grid.Cell>
                        </Grid>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ margin: '15px 0px 0px 0px', display: 'block' }}>
                                    <Text variant="headingMd" as="h6">
                                        Intact Information
                                    </Text>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                                <label className='cust-staric' style={{ marginBottom: '4px', display: 'block' }}>
                                    Intacct Vendor
                                </label>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    className="basic-single"
                                    classNamePrefix="select"
                                    onChange={(input) => {
                                        handleChange({
                                            ...form,
                                            intact_vendor: input
                                        })
                                    }}
                                    value={form.intact_vendor}
                                    options={intact_vendors}
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                                <label className='cust-staric' style={{ marginBottom: '4px', display: 'block' }}>
                                    Intacct Location
                                </label>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    className="basic-single"
                                    classNamePrefix="select"
                                    onChange={(input) => {
                                        handleChange({
                                            ...form,
                                            intact_location: input
                                        })
                                    }}
                                    value={form.intact_location}
                                    options={intact_locations}
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                                <label className='cust-staric' style={{ marginBottom: '4px', display: 'block' }}>
                                    Intacct Department
                                </label>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    className="basic-single"
                                    classNamePrefix="select"
                                    onChange={(input) => {
                                        handleChange({
                                            ...form,
                                            intact_department: input
                                        })
                                    }}
                                    value={form.intact_department}
                                    options={intact_departments}
                                />
                            </Grid.Cell>
                        </Grid>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ margin: '15px 0px 0px 0px', display: 'block' }}>
                                    <Text variant="headingMd" as="h6">
                                        Address
                                    </Text>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <div className='cust-staric2'>

                                    <TextField
                                        label="Address Line 1"
                                        value={form.address.address_line_1}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            address: {
                                                ...form.address,
                                                address_line_1: input
                                            }
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <div className='cust-staric2'>

                                    <TextField
                                        label="City"
                                        value={form.address.city}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            address: {
                                                ...form.address,
                                                city: input
                                            }
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <div className='cust-staric2'>


                                    <TextField
                                        label="State"
                                        value={form.address.state}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            address: {
                                                ...form.address,
                                                state: input
                                            }
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <div className='cust-staric2'>

                                    <TextField
                                        label="Zip"
                                        value={form.address.zip_code}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            address: {
                                                ...form.address,
                                                zip_code: input
                                            }
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ margin: '15px 0px 0px 0px', display: 'block' }}>
                                    <Text variant="headingMd" as="h6">
                                        Prefixes
                                    </Text>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div className='cust-staric2'>

                                    <TextField
                                        label="PO Prefix"
                                        value={form.po_prefix}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            po_prefix: input
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ margin: '15px 0px 0px 0px', display: 'block' }}>
                                    <Text variant="headingMd" as="h6">
                                        Credentials
                                    </Text>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <div className='cust-staric2'>
                                    <TextField
                                        label="Username"
                                        value={form.username}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            username: input
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <div className='cust-staric2'>
                                    <TextField
                                        label="Password"
                                        type='password'
                                        value={form.password}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            password: input
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ margin: '15px 0px 0px 0px', display: 'block' }}>
                                    <Text variant="headingMd" as="h6">
                                        PromoStandards
                                        <IconButton onClick={() => window.open('https://tools.promostandards.org/standards/endpoints', '_blank')} style={{ padding: "0px 4px" }}>
                                            <LaunchIcon fontSize='small' color='primary' />
                                        </IconButton>
                                    </Text>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div className='cust-staric2'>
                                    <TextField
                                        label="Product Data Endpoint"
                                        value={form.product_data_endpoint}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            product_data_endpoint: input
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div className='cust-staric2'>
                                    <TextField
                                        label="Purchase Order Endpoint"
                                        value={form.purchase_order_endpoint}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            purchase_order_endpoint: input
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div className='cust-staric2'>
                                    <TextField
                                        label="Pricing and Configuration Endpoint"
                                        value={form.pricing_and_configuration_endpoint}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            pricing_and_configuration_endpoint: input
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div className='cust-staric2'>
                                    <TextField
                                        label="Invoice Endpoint"
                                        value={form.invoice_endpoint}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            invoice_endpoint: input
                                        })}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                        <div>
                            <Divider />
                            <div className='vendors-cc-in-formbtns'>
                                <ButtonGroup>
                                    <Button onClick={handleChangeVendor}>Cancel</Button>
                                    <Button variant="primary" onClick={saveVendor}>Save</Button>
                                </ButtonGroup>
                            </div>
                        </div>
                    </div>

                </Modal.Section>
            </Modal>
        </div>
    );


}

Vendors.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Vendors;
