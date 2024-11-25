import {
    Button,
    ButtonGroup,
    Card,
    Divider,
    Grid, Icon,
    IndexFilters,
    IndexTable,
    Modal,
    Pagination,
    Tag,
    Text,
    TextField,
    useIndexResourceState,
    useSetIndexFiltersMode
} from '@shopify/polaris';

import Select from 'react-select';
import IconButton from '@mui/material/IconButton';
import LaunchIcon from '@mui/icons-material/Launch';
import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { EditIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Toggle from '@/ReactJs/Components/ToggleSmall';

function VendorsTable({ reload, setReload, shopifyVendors, intactVendors, intactLocations, intactDepartments }) {

    let timeout = null;

    const resourceName = {
        singular: 'vendor',
        plural: 'vendors',
    };

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

    const [tableRows, setTableRows] = useState([]);

    const [selected, setSelected] = useState(0);
    const tabs = ['All'].map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions: []
    }));

    const sortOptions = [
        { label: 'Id', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id asc']);
    const [queryValue, setQueryValue] = useState("");
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [pagination, setPagination] = useState({
        path: route("ic_vendors.list"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);


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
        shipping_method: '',
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
        shipment_endpoint:''
    });

    const handleChange = useCallback(
        (object) => {
            setForm(object)
        },
        []
    );

    const [selectedVendor, setSelectedVendor] = useState({});

    const updateVendor = async () => {
        let response = await fetch(route('ic_vendors.update', selectedVendor.id), {
            method: 'PATCH',
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
            setReload();
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

    useEffect(() => {

        let url = new URL(pagination.path);

        url.searchParams.set('page_count', 10);

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    const my_rows = result.data.data.map((item) => {
                        return {
                            id: item.id,
                            name: item.name ?? '-',
                            created_at: item.created_at ?? '-',
                            address: item.address ? item.address.address_line_1 + " " + item.address.city + " " + item.address.state + " " + item.address.zip_code : '-',
                            // so_prefix: item.so_prefix ?? '-',
                            shopify_vendors: item.shopify_vendors ? item.shopify_vendors.map((tag) => (
                                <span style={{ margin: '5px' }}>
                                    <Tag>{tag.name} </Tag>
                                </span>
                            )) : '',
                            intact_vendor: item.intact_vendor ? item.intact_vendor.name : '-',
                            edit: <div onClick={() => {
                                handleChangeVendor(item);
                            }} style={{ cursor: 'pointer' }}><Icon source={EditIcon} tone="base" /></div>,
                            po_prefix: item.po_prefix ?? '-',
                        }
                    });

                    setTableRows(my_rows);
                    setPagination({
                        path: result.data.path,
                        next_cursor: result.data.next_cursor,
                        next_page_url: result.data.next_page_url,
                        prev_cursor: result.data.prev_cursor,
                        prev_page_url: result.data.prev_page_url,
                    });
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });

    }, [reload])

    useEffect(() => {
        setReload();
    }, [sortSelected]);

    const handleFiltersQueryChange = useCallback(
        (value) => {
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload();
            }, 500);
        },
        [tableRows]
    );

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [
        handleQueryValueRemove,
    ]);

    const filters = [];

    const appliedFilters = [];

    const rowMarkup = tableRows.map(
        ({ id, created_at, name, address, /* so_prefix, */ shopify_vendors, intact_vendor, edit, po_prefix }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >

                <IndexTable.Cell>
                    {created_at}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {name}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>
                        {address}
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>
                        {po_prefix}
                    </div>
                </IndexTable.Cell>
                {/* <IndexTable.Cell>
                    {so_prefix}
                </IndexTable.Cell> */}

                <IndexTable.Cell>
                    {shopify_vendors}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {intact_vendor}
                </IndexTable.Cell>

                <IndexTable.Cell>
                    {edit}
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    // Modal popup
    const [active, setActive] = useState(false);

    const handleChangeVendor = (vendor) => {
        setSelectedVendor(vendor);
        setForm({
            name: vendor.name,
            allow_processing: vendor.allow_processing,
            shopify_vendors: vendor.shopify_vendors ? vendor.shopify_vendors.map((item) => {
                return {
                    value: item.id,
                    label: item.name
                }
            }) : [],
            intact_vendor: vendor.intact_vendor ? {
                value: vendor.intact_vendor.id,
                label: vendor.intact_vendor.name
            } : {
                value: '',
                label: ''
            },
            intact_location: vendor.intact_location ? {
                value: vendor.intact_location.id,
                label: vendor.intact_location.name
            } : {
                value: '',
                label: ''
            },
            intact_department: vendor.intact_department ? {
                value: vendor.intact_department.id,
                label: vendor.intact_department.name
            } : {
                value: '',
                label: ''
            },
            address: {
                address_line_1: vendor.address ? vendor.address.address_line_1 : '',
                address_line_2: vendor.address ? vendor.address.address_line_2 : '',
                city: vendor.address ? vendor.address.city : '',
                state: vendor.address ? vendor.address.state : '',
                zip_code: vendor.address ? vendor.address.zip_code : '',
            },
            shipping_method: vendor.shipping_method,
            po_prefix: vendor.po_prefix,
            username: vendor.username,
            password: vendor.password,
            product_data_endpoint: vendor.product_data_endpoint,
            purchase_order_endpoint: vendor.purchase_order_endpoint,
            pricing_and_configuration_endpoint: vendor.pricing_and_configuration_endpoint,
            invoice_endpoint: vendor.invoice_endpoint,
            shipment_endpoint: vendor.shipment_endpoint
        });
        setActive((active) => !active);
    }

    const activator = <span onClick={handleChangeVendor} style={{ display: 'none' }}>Open</span>;

    // Modal popup

    return (
        <div>

            <Card>
                <IndexFilters
                    sortOptions={sortOptions}
                    sortSelected={sortSelected}
                    queryValue={queryValue}
                    queryPlaceholder="Searching in all"
                    onQueryChange={handleFiltersQueryChange}
                    onQueryClear={handleQueryValueRemove}
                    onSort={setSortSelected}
                    cancelAction={{
                        onAction: onHandleCancel,
                        disabled: false,
                        loading: false,
                    }}
                    tabs={tabs}
                    canCreateNewView={false}
                    filters={filters}
                    appliedFilters={appliedFilters}
                    onClearAll={handleFiltersClearAll}
                    mode={mode}
                    setMode={setMode}
                    loading={loading}
                    selected={selected}
                    onSelect={setSelected}
                />
                <IndexTable
                    resourceName={resourceName}
                    itemCount={tableRows.length}
                    selectedItemsCount={
                        allResourcesSelected ? 'All' : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                        { title: 'Date Connected' },
                        { title: 'Vendor Name' },
                        { title: 'Address' },
                        { title: 'PO Prefix' },
                        // { title: 'SO Prefix' },
                        { title: 'Shopify Vendor' },
                        { title: 'Intact Vendor' },
                        { title: 'Action' }
                    ]}
                    hasMoreItems
                    selectable={false}
                >
                    {rowMarkup}
                </IndexTable>
            </Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px', paddingBottom: '22px' }}>
                <Pagination hasNext={pagination.next_cursor ? true : false} hasPrevious={pagination.prev_cursor ? true : false} onNext={() => {
                    setPagination({
                        ...pagination,
                        path: pagination.next_page_url
                    })
                    setCurrentCursor(pagination.next_cursor);
                    setReload();
                }} onPrevious={() => {
                    setPagination({
                        ...pagination,
                        path: pagination.prev_page_url
                    })
                    setCurrentCursor(pagination.prev_cursor);
                    setReload();
                }} />


            </div>

            <Modal
                size="large"
                activator={activator}
                open={active}
                onClose={handleChangeVendor}
                title="Edit Details"
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
                                    closeMenuOnSelect={false}
                                    isMulti
                                    onChange={(input) => {
                                        handleChange({
                                            ...form,
                                            shopify_vendors: input
                                        })
                                    }}
                                    value={form.shopify_vendors}
                                    options={shopify_vendors}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <div style={{ marginBottom: "5px" }}><Text variant='headingSm' as='h6'><span className="cust-staric">Shipping Method</span></Text></div>
                                <Select
                                    // closeMenuOnSelect={false}
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
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                                <label className='cust-staric' style={{ marginBottom: '4px', display: 'block' }}>
                                    Intacct Location
                                </label>
                                <Select
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
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                                <label className='cust-staric' style={{ marginBottom: '4px', display: 'block' }}>
                                    Intacct Department
                                </label>
                                <Select
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
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
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
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div className='cust-staric2'>
                                    <TextField
                                        label="Shipment Endpoint"
                                        value={form.shipment_endpoint}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            shipment_endpoint: input
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
                                    <Button variant="primary" onClick={updateVendor}>Save</Button>
                                </ButtonGroup>
                            </div>
                        </div>
                    </div>
                </Modal.Section>
            </Modal>
        </div>
    );
}

VendorsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default VendorsTable;
