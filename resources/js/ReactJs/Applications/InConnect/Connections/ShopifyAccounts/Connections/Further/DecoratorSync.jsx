import '@/ReactJs/Applications/InConnect/Connections/ShopifyAccounts/custom.css';
import Toggle from '@/ReactJs/Components/ToggleSmall';
import { setDecoratorSync } from '@/ReactJs/reducers/InConnect/AccountsSlice';
import { Button, Card, DataTable, Grid, Icon, Modal, Page, Text, TextField, Select as ShopifySelect } from '@shopify/polaris';
import { EditIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import Swal from 'sweetalert2';
export const DecoratorSync = () => {

    function extractValuesAndLabels(arr, valueProp, labelProp) {
        let result = arr.map(item => ({
            value: item[valueProp],
            label: item[labelProp]
        }))
        return result;
    }

    const dispatch = useDispatch();

    const [active, setActive] = useState(false);
    const [editDecorator, setEditDecorator] = useState({
        id: "",
        name: "",
        created_at: "",
        temp_sync: false,
        temp_due_date_days: "",
        temp_location_to_logo: false,
        shippingMapping: [
            { selected_shipping: false, three_p_account_number: "", carrier_id: "", method_id: "" },
        ],
        temp_vip_customers: "",
        temp_poly_bag: "",
    });

    const addEditData = useSelector(state => state.inConnectAccounts.addEditData);
    // console.log(addEditData)
    const decoratorSync = useSelector(state => state.inConnectAccounts.decoratorSync);
    // console.log(decoratorSync)

    const rows = decoratorSync.map((value, index) => {
        return [
            value.name,
            value.created_at,
            <Toggle toggled={value.temp_sync} onClick={(e) => {
                const temp = decoratorSync.map((decorator, idx) => idx === index ? { ...decorator, temp_sync: !decorator.temp_sync } : { ...decorator, temp_sync: false });
                handleChange(temp);
            }} />,
            value.temp_due_date_days ? value.temp_due_date_days : '-',
            <div className='flex justify-center '>
                <div role="button" onClick={() => {
                    setEditDecorator(value);
                    setActive(true)
                }}>
                    <Icon source={EditIcon} tone="success" />
                </div>
            </div>,
        ]
    });

    const handleChange = (object) => {
        // console.log(object);
        dispatch(setDecoratorSync(object));
    }

    return (
        <Page>
            <Modal
                size="large"
                open={active}
                onClose={() => setActive(false)}
                title="Decorator Detail"
                primaryAction={{
                    content: 'Save',
                    onAction: () => {

                        let noError = false;

                        if (editDecorator.temp_due_date_days === "" || editDecorator.temp_due_date_days === 0) {
                            noError = "Due Date is required";
                        }
                        // else if (editDecorator.temp_location_to_logo == false) {
                        //     noError = "Add Location Number to Logo Code is required";
                        // }
                        else if (editDecorator.shippingMapping.length === 0) {
                            noError = "Shipping Mapping is required";
                        } else {
                            editDecorator.shippingMapping.map((item, index) => {
                                if (item.selected_shipping === false || item.three_p_account_number === "" || item.carrier_id === "" || item.method_id === "") {
                                    // noError = "Shipping Mapping all fields are required"
                                }
                            })
                        }

                        if (noError)
                            Swal.fire({ title: 'Error!', text: noError, icon: 'error' });
                        else {
                            let temp = [...decoratorSync];
                            temp[decoratorSync.findIndex(x => x.id === editDecorator.id)] = editDecorator;
                            if (editDecorator.temp_sync)
                                temp = temp.map((decorator, idx) => decorator.id === editDecorator.id ? { ...decorator, temp_sync: true } : { ...decorator, temp_sync: false });
                            handleChange(temp);
                            setActive(false);
                        }
                    },
                }}
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: () => setActive(false),
                    },
                ]}
            >
                <Modal.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                            <div className='cust-staric2'>
                                <TextField
                                    disabled
                                    label="Decorator"
                                    type="text"
                                    value={editDecorator.name}
                                    onChange={() => { }}
                                    autoComplete="off"
                                />

                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                            <div className='mt-7' style={{ display: "flex", justifyContent: 'flex-start' }}>
                                <div className='flex'>
                                    <Toggle toggled={editDecorator.temp_vip_customers} onClick={(e) => {
                                        const temp = { ...editDecorator, temp_vip_customers: e.target.checked };
                                        setEditDecorator(temp);
                                    }} />
                                    <div className='mx-2'>
                                        <Text variant='headingSm' as='h6'>Vip Customers</Text>
                                    </div>
                                </div>
                                <div className='flex' style={{ marginLeft: "60px" }}>
                                    <Toggle toggled={editDecorator.temp_poly_bag} onClick={(e) => {
                                        const temp = { ...editDecorator, temp_poly_bag: e.target.checked };
                                        setEditDecorator(temp);
                                    }} />
                                    <div className='mx-2'>
                                        <Text variant='headingSm' as='h6'>Poly Bag</Text>
                                    </div>
                                </div>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                            <div className='cust-staric2'>
                                <TextField
                                    label="Decorator Due Date (Days after sales date)"
                                    type="number"
                                    value={editDecorator.temp_due_date_days}
                                    onChange={(e) => {
                                        if (e > 0) {
                                            const temp = { ...editDecorator, temp_due_date_days: e };
                                            setEditDecorator(temp);
                                        }
                                    }}
                                    autoComplete="off"
                                />
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                            <div>
                                <div className='cust-staric' style={{ marginBottom: "3px" }}>Add Location Number to Logo Code</div>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    options={[
                                        { value: true, label: 'Yes' },
                                        { value: false, label: 'No' },
                                    ]}
                                    onChange={(e) => {
                                        const temp = { ...editDecorator, temp_location_to_logo: e };
                                        setEditDecorator(temp);
                                    }}
                                    value={editDecorator.temp_location_to_logo}
                                />
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <div style={{ width: "100%" }}>
                                    <div style={{ marginBottom: "5px" }}>Blank Product Types (No Decoration Data)</div>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        options={addEditData && extractValuesAndLabels(addEditData.product_types, 'id', 'name')}
                                        onChange={(e) => {
                                            const temp = { ...editDecorator, no_data_product_types: e };
                                            setEditDecorator(temp);
                                        }}
                                        value={editDecorator.no_data_product_types}
                                        isMulti
                                        closeMenuOnSelect={false}
                                    />
                                </div>
                                <div className='flex' style={{ marginLeft: "15px", marginTop: "34px" }}>
                                    <Toggle toggled={editDecorator.no_data_product_type_status} onClick={(e) => {
                                        const temp = { ...editDecorator, no_data_product_type_status: e.target.checked };
                                        setEditDecorator(temp);
                                    }} />
                                    <div className='mx-2'>
                                        <Text variant='headingSm' as='h6'>Status</Text>
                                    </div>
                                </div>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                            <div style={{ border: "2px dashed #b8b8b8", padding: "20px", borderRadius: "5px" }}>
                                {editDecorator.shippingMapping.map((item, index) => (
                                    <div key={index} style={{ marginBottom: "10px" }}>
                                        <Grid>
                                            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                                <div>
                                                    <div className='cust-staric' style={{ marginBottom: "5px" }}>Shopify Info</div>
                                                    <Select
                                                        menuPortalTarget={document.body}
                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                        options={addEditData && extractValuesAndLabels(addEditData.shippings, 'id', 'title')}
                                                        onChange={(e) => {
                                                            const temp = editDecorator.shippingMapping.map((field, idx) => idx === index ? { ...field, selected_shipping: e } : field);
                                                            setEditDecorator({ ...editDecorator, shippingMapping: temp });
                                                        }}
                                                        value={item.selected_shipping}
                                                    />
                                                </div>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2 }}>
                                                <div className='flex justify-center'>
                                                    <img className='mt-6 mx-5' src={`${window.appURL}/images/Flow.png`} />
                                                </div>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 5, sm: 5, md: 5, lg: 5, xl: 5 }}>
                                                <div style={{ display: "flex" }}>
                                                    <div className='cust-staric2' style={{ marginRight: "10px", width: editDecorator?.name.toLowerCase().includes("idex") ? "" : "100%" }}>
                                                        <TextField
                                                            label={editDecorator?.name.toLowerCase().includes("idex") ? "3P Account#" : "Shipping Method"}
                                                            value={item.three_p_account_number}
                                                            onChange={(e) => {
                                                                const temp = editDecorator.shippingMapping.map((field, idx) => idx === index ? { ...field, three_p_account_number: e } : field);
                                                                setEditDecorator({ ...editDecorator, shippingMapping: temp });
                                                            }}
                                                            placeholder='Enter Intacct Item'
                                                            autoComplete="off"
                                                        />
                                                    </div>
                                                    <Grid.Cell columnSpan={{ xs: 5, sm: 5, md: 5, lg: 5, xl: 5 }}>
                                                        {editDecorator?.name.toLowerCase().includes("idex") && (
                                                            <div>
                                                                {/* Start https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7697528035 */}
                                                                <div className='cust-staric' style={{ marginBottom: "5px" }}>Carrier ID</div>
                                                                <ShopifySelect
                                                                    options={[
                                                                        { value: "1", label: 'UPS' },
                                                                        { value: "2", label: 'FedX' },
                                                                        { value: "3", label: 'USPS' },
                                                                    ]}
                                                                    onChange={(e) => {
                                                                        const temp = editDecorator.shippingMapping.map((field, idx) =>
                                                                            idx === index ? { ...field, carrier_id: e } : field
                                                                        );
                                                                        console.log(temp);
                                                                        setEditDecorator({ ...editDecorator, shippingMapping: temp });
                                                                    }}
                                                                    value={item.carrier_id}
                                                                />
                                                                {/* End https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7697528035 */}
                                                            </div>
                                                        )}
                                                    </Grid.Cell>
                                                    <div style={{ 'margin': '0 10px' }} ></div>
                                                    <Grid.Cell columnSpan={{ xs: 5, sm: 5, md: 5, lg: 5, xl: 5 }}>
                                                        {editDecorator?.name.toLowerCase().includes("idex") &&
                                                            <div>
                                                                {/* Start https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7697528035 */}
                                                                <div className='cust-staric' style={{ marginBottom: "5px" }}>Method ID</div>
                                                                <ShopifySelect
                                                                    options={[
                                                                        { value: "1", label: 'Ground' },
                                                                        { value: "2", label: '2nd Day' },
                                                                        { value: "3", label: 'Next Day' },
                                                                    ]}
                                                                    onChange={(e) => {
                                                                        const temp = editDecorator.shippingMapping.map((field, idx) => idx === index ? { ...field, method_id: e } : field);
                                                                        setEditDecorator({ ...editDecorator, shippingMapping: temp });
                                                                    }}
                                                                    value={item.method_id}
                                                                />
                                                                {/* End https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7697528035 */}
                                                            </div>
                                                        }
                                                    </Grid.Cell>
                                                </div>
                                            </Grid.Cell>
                                            {editDecorator.shippingMapping.length > 1 &&
                                                <Grid.Cell columnSpan={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }}>
                                                    <div style={{ float: "right", marginTop: "23px" }}>
                                                        <Button tone="critical" onClick={() => {
                                                            const temp = editDecorator.shippingMapping.filter((field, idx) => idx !== index);
                                                            setEditDecorator({ ...editDecorator, shippingMapping: temp });
                                                        }}>Del</Button>
                                                    </div>
                                                </Grid.Cell>
                                            }
                                        </Grid>
                                    </div>
                                ))}
                                <div className='mt-4'>
                                    <Button variant='primary' onClick={() => {
                                        const temp = editDecorator.shippingMapping.slice();
                                        temp.push({ selected_shipping: false, three_p_account_number: "", carrier_id: "", method_id: "" });
                                        setEditDecorator({ ...editDecorator, shippingMapping: temp });
                                    }}><span>Add Ship Method</span></Button>
                                </div>
                            </div>
                        </Grid.Cell>
                    </Grid>

                </Modal.Section>
            </Modal>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                    <Card>
                        <div>
                            <DataTable
                                columnContentTypes={[
                                    'text',
                                    'text',
                                    'text',
                                    'text',
                                    'text',
                                ]}
                                headings={[
                                    'Decorator Name',
                                    'Date Created',
                                    'Enable Sync',
                                    'Due Date',
                                    'Action',
                                ]}
                                rows={rows}
                            />
                        </div>
                    </Card>
                </Grid.Cell>
            </Grid>
        </Page >
    );
}
