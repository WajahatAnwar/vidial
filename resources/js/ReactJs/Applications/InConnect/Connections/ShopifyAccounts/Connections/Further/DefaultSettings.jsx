import React from 'react'
import { TextField, Text, Button, Grid, Card, Divider, Checkbox } from '@shopify/polaris';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { setDefaultSettings, setReloadAccounts } from '@/ReactJs/reducers/InConnect/AccountsSlice';

export const DefaultSettings = ({ editId }) => {

    function extractValuesAndLabels(arr, valueProp, labelProp) {
        let result = arr.map(item => ({
            value: item[valueProp],
            label: item[labelProp]
        }))
        return result;
    }

    const dispatch = useDispatch();

    const addEditData = useSelector(state => state.inConnectAccounts.addEditData);
    const defaultSettings = useSelector(state => state.inConnectAccounts.defaultSettings);
    const reloadAccounts = useSelector(state => state.inConnectAccounts.reloadAccounts);
    // console.log(addEditData);
    // console.log(defaultSettings);

    const handleChange = (object) => {
        dispatch(setDefaultSettings(object));
    }

    return (
        <div>
            <div className=''>
                <Card>
                    <div className='p-6'>
                        <Text variant='headingLg' as='h6'>Store Detail</Text>
                        <div className='justify-around mt-5'>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div>
                                        <div className='cust-staric' style={{ marginBottom: "5px" }}>Account Name</div>
                                        <Select
                                            isDisabled={editId ? true : false}
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            options={addEditData && extractValuesAndLabels(addEditData.users, 'id', 'name')}
                                            onChange={(e) => {
                                                handleChange({ ...defaultSettings, selectedUser: e });
                                                dispatch(setReloadAccounts(!reloadAccounts));
                                            }}
                                            value={defaultSettings.selectedUser}
                                        />
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div>
                                        <div className='cust-staric' style={{ marginBottom: "5px" }}>Shop Type</div>
                                        <Select
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            options={addEditData && extractValuesAndLabels(addEditData.shop_types, 'id', 'name')}
                                            onChange={(e) => handleChange({ ...defaultSettings, selectedShopType: e })}
                                            value={defaultSettings.selectedShopType}
                                        />
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div>
                                        <div className='cust-staric' style={{ marginBottom: "5px" }}>Status</div>
                                        <Select
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            options={[{ value: true, label: "Open" }, { value: false, label: "Close" }]}
                                            onChange={(e) => handleChange({ ...defaultSettings, selectedStatus: e })}
                                            value={defaultSettings.selectedStatus}
                                        />
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div>
                                        <div className='cust-staric' style={{ marginBottom: "5px" }}>Intacct Customer</div>
                                        <Select
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            options={addEditData && extractValuesAndLabels(addEditData.intact_customers, 'id', 'name')}
                                            onChange={(e) => handleChange({ ...defaultSettings, selectedIntactCustomer: e })}
                                            value={defaultSettings.selectedIntactCustomer}
                                        />
                                    </div>
                                </Grid.Cell>
                            </Grid>
                        </div>
                    </div>
                    <Divider />
                    <div className='p-6'>
                        <Text variant='headingLg' as='h6'>Send Orders from Shopify to Intacct</Text>
                        <div className='flex mt-4'>
                            <p className='cust-staric'>Order Status</p>
                            <div className='flex  ps-16'>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="Open"
                                        checked={defaultSettings.order_status_open}
                                        onChange={(e) => handleChange({ ...defaultSettings, order_status_open: e })}
                                        disabled
                                    />
                                </div>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="Close"
                                        checked={defaultSettings.order_status_closed}
                                        onChange={(e) => handleChange({ ...defaultSettings, order_status_closed: e })}
                                        disabled
                                    />
                                </div>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="Cancel"
                                        checked={defaultSettings.order_status_cancelled}
                                        onChange={(e) => handleChange({ ...defaultSettings, order_status_cancelled: e })}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div className='p-6'>
                        <Text variant='headingLg' as='h6'>Hold Orders with Fraudulent Status</Text>
                        <div className='flex mt-4'>
                            <p className='cust-staric'>Fraud Status</p>
                            <div className='flex  ps-16'>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="Low"
                                        checked={defaultSettings.fraud_status_low}
                                        onChange={(e) => handleChange({ ...defaultSettings, fraud_status_low: e })}
                                    />
                                </div>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="Medium"
                                        checked={defaultSettings.fraud_status_medium}
                                        onChange={(e) => handleChange({ ...defaultSettings, fraud_status_medium: e })}
                                    />
                                </div>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="High"
                                        checked={defaultSettings.fraud_status_high}
                                        onChange={(e) => handleChange({ ...defaultSettings, fraud_status_high: e })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div className='p-6'>
                        <div className='flex  mt-4'>
                            <p className='cust-staric'>Financial Status</p>
                            <div className='flex flex-wrap ps-20'>
                                <div className='mx-4' style={{ minWidth: "150px" }}>
                                    <Checkbox
                                        label="Authorized"
                                        checked={defaultSettings.financial_status_authorized}
                                        onChange={(e) => handleChange({ ...defaultSettings, financial_status_authorized: e })}
                                    />
                                </div>
                                <div className='mx-4' style={{ minWidth: "150px" }}>
                                    <Checkbox
                                        label="Pending"
                                        checked={defaultSettings.financial_status_pending}
                                        onChange={(e) => handleChange({ ...defaultSettings, financial_status_pending: e })}
                                    />
                                </div>
                                <div className='mx-4' style={{ minWidth: "150px" }}>
                                    <Checkbox
                                        label="Paid"
                                        checked={defaultSettings.financial_status_paid}
                                        onChange={(e) => handleChange({ ...defaultSettings, financial_status_paid: e })}
                                    />
                                </div>
                                <div className='mx-4' style={{ minWidth: "150px" }}>
                                    <Checkbox
                                        label="Partially Paid"
                                        checked={defaultSettings.financial_status_partially_paid}
                                        onChange={(e) => handleChange({ ...defaultSettings, financial_status_partially_paid: e })}
                                    />
                                </div>
                                <div className='mx-4' style={{ minWidth: "150px" }}>
                                    <Checkbox
                                        label="Refunded"
                                        checked={defaultSettings.financial_status_refunded}
                                        onChange={(e) => handleChange({ ...defaultSettings, financial_status_refunded: e })}
                                    />
                                </div>
                                <div className='mx-4' style={{ minWidth: "150px" }}>
                                    <Checkbox
                                        label="Voided"
                                        checked={defaultSettings.financial_status_voided}
                                        onChange={(e) => handleChange({ ...defaultSettings, financial_status_voided: e })}
                                    />
                                </div>
                                <div className='mx-4' style={{ minWidth: "150px" }}>
                                    <Checkbox
                                        label="Partially Refunded"
                                        checked={defaultSettings.financial_status_partially_refunded}
                                        onChange={(e) => handleChange({ ...defaultSettings, financial_status_partially_refunded: e })}
                                    />
                                </div>
                                <div className='mx-4' style={{ minWidth: "150px" }}>
                                    <Checkbox
                                        label="Unpaid"
                                        checked={defaultSettings.financial_status_unpaid}
                                        onChange={(e) => handleChange({ ...defaultSettings, financial_status_unpaid: e })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div className='p-6'>
                        <div className='flex mt-4'>
                            <p className='cust-staric'>Fulfillment Status</p>
                            <div className='flex' style={{ flexWrap: "wrap", paddingLeft: "38px" }}>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="Shipped"
                                        checked={defaultSettings.fulfillment_status_shipped}
                                        onChange={(e) => handleChange({ ...defaultSettings, fulfillment_status_shipped: e })}
                                    />
                                </div>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="Partial"
                                        checked={defaultSettings.fulfillment_status_partial}
                                        onChange={(e) => handleChange({ ...defaultSettings, fulfillment_status_partial: e })}
                                    />
                                </div>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="Unshipped"
                                        checked={defaultSettings.fulfillment_status_unshipped}
                                        onChange={(e) => handleChange({ ...defaultSettings, fulfillment_status_unshipped: e })}
                                    />
                                </div>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="Unfulfilled"
                                        checked={defaultSettings.fulfillment_status_unfulfilled}
                                        onChange={(e) => handleChange({ ...defaultSettings, fulfillment_status_unfulfilled: e })}
                                    />
                                </div>
                                <div className='mx-4'>
                                    <Checkbox
                                        label="Fulfilled"
                                        checked={defaultSettings.fulfillment_status_fulfilled}
                                        onChange={(e) => handleChange({ ...defaultSettings, fulfillment_status_fulfilled: e })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div className='p-6'>
                        <Text variant='headingMd' as='h6'>Default</Text>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <div>
                                    <div className='cust-staric' style={{ marginBottom: "5px" }}>Payment Terms</div>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        options={addEditData && extractValuesAndLabels(addEditData.intact_payment_terms, 'id', 'name')}
                                        onChange={(e) => handleChange({ ...defaultSettings, selectedIntactPaymentTerms: e })}
                                        value={defaultSettings.selectedIntactPaymentTerms}
                                        isDisabled={true}
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <div>
                                    <div className='cust-staric' style={{ marginBottom: "5px" }}>Transaction Status</div>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        options={addEditData && extractValuesAndLabels(addEditData.intact_transaction_statuses, 'id', 'name')}
                                        onChange={(e) => handleChange({ ...defaultSettings, selectedIntactTransactionStatus: e })}
                                        value={defaultSettings.selectedIntactTransactionStatus}
                                        isDisabled={true}
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <div>
                                    <div className='cust-staric' style={{ marginBottom: "5px" }}>Departments</div>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        options={addEditData && extractValuesAndLabels(addEditData.intact_departments, 'id', 'name')}
                                        onChange={(e) => handleChange({ ...defaultSettings, selectedIntactDepartment: e })}
                                        value={defaultSettings.selectedIntactDepartment}
                                    // isDisabled={true}
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <div>
                                    <div className='cust-staric' style={{ marginBottom: "5px" }}>Classes</div>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        options={addEditData && addEditData.intact_classes.map((value, index) => {
                                            return { value: value.id, label: `${value.class_id} - ${value.name}` };
                                        })}
                                        onChange={(e) => handleChange({ ...defaultSettings, selectedIntactClass: e })}
                                        value={defaultSettings.selectedIntactClass}
                                    // isDisabled={true}
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                        <div className='mt-5'>
                            <Text variant='headingMd' as='h6'>Mapping</Text>
                            <div className='mt-3'>
                                {defaultSettings?.fieldsMapping?.map((item, index) => (
                                    <div key={index} style={{ marginBottom: "10px" }}>
                                        <Grid>
                                            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                                <div>
                                                    <div className='cust-staric' style={{ marginBottom: "5px" }}>Shopify Field</div>
                                                    <Select
                                                        menuPortalTarget={document.body}
                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                        options={addEditData && extractValuesAndLabels(addEditData.shopify_fields, 'id', 'name')}
                                                        onChange={(e) => {
                                                            const temp = defaultSettings.fieldsMapping.map((field, idx) => idx === index ? { ...field, selected_field: e } : field);
                                                            handleChange({ ...defaultSettings, fieldsMapping: temp });
                                                        }}
                                                        value={item.selected_field}
                                                        isDisabled={true}
                                                    />
                                                </div>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2 }}>
                                                <div className='flex justify-center'>
                                                    <img className='mt-6 mx-5' src={`${window.appURL}/images/Flow.png`} />
                                                </div>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                                <div className='cust-staric2'>

                                                    <TextField
                                                        label="Intacct Item"
                                                        value={item.intact_item}
                                                        onChange={(e) => {
                                                            const temp = defaultSettings.fieldsMapping.map((field, idx) => idx === index ? { ...field, intact_item: e } : field);
                                                            handleChange({ ...defaultSettings, fieldsMapping: temp });
                                                        }}
                                                        placeholder='Enter Intacct Item'
                                                        autoComplete="off"
                                                        disabled
                                                    />
                                                </div>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2 }}>
                                                <div style={{ float: "right", marginTop: "23px" }}>
                                                    {defaultSettings.fieldsMapping.length > 1 &&
                                                        <Button disabled tone="critical" onClick={() => {
                                                            const temp = defaultSettings.fieldsMapping.filter((field, idx) => idx !== index);
                                                            handleChange({ ...defaultSettings, fieldsMapping: temp });
                                                        }}>Del</Button>
                                                    }
                                                </div>
                                            </Grid.Cell>
                                        </Grid>
                                    </div>
                                ))}
                                <div style={{ marginTop: "20px" }}>
                                    <Button variant="primary" disabled onClick={() => {
                                        const temp = defaultSettings.fieldsMapping.slice();
                                        temp.push({ selected_field: false, intact_item: "" });
                                        handleChange({ ...defaultSettings, fieldsMapping: temp });
                                    }}>Add</Button>
                                </div>
                            </div>
                        </div>
                        <div className='mt-5'>
                            <Text variant='headingMd' as='h6'>Tax Settings</Text>
                            <div className='mt-3'>
                                <div className=''>
                                    <TextField
                                        label="Tax Exempt Number"
                                        type="text"
                                        placeholder='Enter Tax Exempt Number'
                                        onChange={(e) => {
                                            handleChange({ ...defaultSettings, taxExemptNumber: e });
                                        }}
                                        value={defaultSettings.taxExemptNumber ? defaultSettings.taxExemptNumber : ''}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
