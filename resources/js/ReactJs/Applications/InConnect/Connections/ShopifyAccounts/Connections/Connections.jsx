import React, { useEffect } from 'react'
import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { Button, Page, Grid, Card, Divider, Banner, Text } from '@shopify/polaris';
import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
// import '@/ReactJs/Applications/InConnect/Connections/ShopifyAccounts/custom.css';
import { DefaultSettings } from './Further/DefaultSettings';
import { VendorSync } from './Further/VendorSync';
import { DecoratorSync } from './Further/DecoratorSync';
import { useDispatch, useSelector } from 'react-redux';
import { resetAccounts, setAddEditData, setDecoratorSync, setDefaultSettings, setVendorSync } from '@/ReactJs/reducers/InConnect/AccountsSlice';
import Swal from 'sweetalert2';

const Connections = () => {

    const page = usePage().props;
    const { query } = page.ziggy;
    // console.log(page);

    const dispatch = useDispatch();

    const reloadAccounts = useSelector(state => state.inConnectAccounts.reloadAccounts);
    const defaultSettings = useSelector(state => state.inConnectAccounts.defaultSettings);
    const vendorSync = useSelector(state => state.inConnectAccounts.vendorSync);
    const decoratorSync = useSelector(state => state.inConnectAccounts.decoratorSync);

    const [currentStep, setCurrentStep] = useState(1);
    const [step1Completed, setStep1Completed] = useState(false);
    const [step2Completed, setStep2Completed] = useState(false);
    const [step3Completed, setStep3Completed] = useState(false);
    // const [banner, setBanner] = useState(false);

    useEffect(() => {
        async function loadJson() {
            const response = await fetch(`/goosely/shopify-accounts/account-create?user_id=${defaultSettings.selectedUser.value ? defaultSettings.selectedUser.value : ''}&inconnect_account_id=${page.ziggy.query.id}`);
            const result = await response.json();
            console.log(result);
            if (result.success) {
                dispatch(setAddEditData(result.data));


                let temp = result.data.decorators.map((element, index) => {
                    return {
                        id: element.id,
                        name: element.name,
                        created_at: element.created_at,
                        temp_sync: false,
                        temp_due_date_days: "",
                        temp_location_to_logo: { value: false, label: 'No' },
                        shippingMapping: [
                            { selected_shipping: false, three_p_account_number: "", carrier_id: "", method_id: "" },
                        ],
                        temp_vip_customers: false,
                        temp_poly_bag: false,
                        no_data_product_type_status: false,
                        no_data_product_types: [],
                    }
                });

                if (page.ziggy.query.id) {

                    //SETTING DATA FOR EDIT
                    dispatch(setDefaultSettings({
                        selectedUser: { value: result.data2.shop.id, label: result.data2.shop.name, store_name: result.data2.shop.store_name ? result.data2.shop.store_name : result.data2.shop.name },
                        selectedShopType: { value: result.data2.store_type.id, label: result.data2.store_type.name },
                        selectedStatus: result.data2.status ? { value: true, label: "Open" } : { value: false, label: "Close" },
                        selectedIntactCustomer: { value: result.data2.intact_customer?.id, label: result.data2.intact_customer?.name },
                        selectedIntactPaymentTerms: { value: result.data2.intact_payment_term?.id, label: result.data2.intact_payment_term?.name },
                        selectedIntactTransactionStatus: { value: result.data2.intact_transaction_status?.id, label: result.data2.intact_transaction_status?.name },
                        selectedIntactDepartment: { value: result.data2.intact_department?.id, label: result.data2.intact_department?.department_id + ' - ' + result.data2.intact_department?.name },
                        selectedIntactClass: { value: result.data2.intact_class?.id, label: result.data2.intact_class?.class_id + ' - ' + result.data2.intact_class?.name },

                        order_status_open: result.data2.statuses.order_status_open,
                        order_status_closed: result.data2.statuses.order_status_closed,
                        order_status_cancelled: result.data2.statuses.order_status_cancelled,
                        financial_status_authorized: result.data2.statuses.financial_status_authorized,
                        financial_status_pending: result.data2.statuses.financial_status_pending,
                        financial_status_paid: result.data2.statuses.financial_status_paid,
                        financial_status_partially_paid: result.data2.statuses.financial_status_partially_paid,
                        financial_status_refunded: result.data2.statuses.financial_status_refunded,
                        financial_status_voided: result.data2.statuses.financial_status_voided,
                        financial_status_partially_refunded: result.data2.statuses.financial_status_partially_refunded,
                        financial_status_unpaid: result.data2.statuses.financial_status_unpaid,
                        fulfillment_status_shipped: result.data2.statuses.fulfillment_status_shipped,
                        fulfillment_status_partial: result.data2.statuses.fulfillment_status_partial,
                        fulfillment_status_fulfilled: result.data2.statuses.fulfillment_status_fulfilled,
                        fulfillment_status_unshipped: result.data2.statuses.fulfillment_status_unshipped,
                        fulfillment_status_unfulfilled: result.data2.statuses.fulfillment_status_unfulfilled,

                        fraud_status_low: result.data2.fraud_statuses.low,
                        fraud_status_medium: result.data2.fraud_statuses.medium,
                        fraud_status_high: result.data2.fraud_statuses.high,

                        fieldsMapping: result.data2.mapping.map((value, index) => {
                            return { selected_field: { value: value.shopify_order_field_id, label: value.mapping_forward.name }, intact_item: value.intact_field_name }
                        }),

                        taxExemptNumber: result.data2.tax_exempt_number,
                    }));

                    // console.log(result.data2.ignored_products.map((value, index) => {
                    //     return { value: value.id, label: value.product_origin ? value.product_origin.product_title : '' }
                    // }))

                    dispatch(setVendorSync({
                        temp_sync: result.data2.vendor_sync.temp_sync ?? true,
                        ignoredVendors: result.data2.ignored_vendors.map((value, index) => {
                            return { value: value.id, label: value.name }
                        }),
                        directVendors: result.data2.direct_vendors.map((value, index) => {
                            return { value: value.id, label: value.name }
                        }),
                        ignoredProducts: result.data2.ignored_products.map((value, index) => {
                            return { value: value.product_id, label: value.product_origin ? value.product_origin.product_title : '' }
                        }),
                        ignoredProductTypes: result.data2.ignored_product_types.map((value, index) => {
                            return { value: value.id, label: value.name }
                        }),
                        // shippingMethod: result.data2.shipping_method,
                    }));

                    let tempTwo = [...temp];
                    tempTwo.map((element, index) => {
                        let inside_decorator = result.data2.decorators.find(value => value.id == element.id);
                        if (inside_decorator) {
                            element.temp_sync = inside_decorator.pivot.sync;
                            element.temp_due_date_days = inside_decorator.pivot.due_date_days;
                            element.temp_location_to_logo = inside_decorator.pivot.location_to_logo ? { value: true, label: "Yes" } : { value: false, label: "No" };
                            element.shippingMapping = inside_decorator.pivot.shippings.map((value2, index2) => {
                                return { selected_shipping: { value: value2.shopify_shipping_field_id, label: value2.shipping_origin.title }, three_p_account_number: value2['3p_account_number'], carrier_id: value2['carrier_id'], method_id: value2['method_id'] }
                            });
                            element.temp_vip_customers = inside_decorator.pivot.vip_customers;
                            element.temp_poly_bag = inside_decorator.pivot.poly_bag;
                            element.no_data_product_type_status = inside_decorator.pivot.no_data_product_type_status;
                            element.no_data_product_types = inside_decorator.pivot.no_data_product_types.map((value2, index2) => {
                                return { value: value2.product_type.id, label: value2.product_type.name }
                            });
                        }
                        return element;
                    });
                    dispatch(setDecoratorSync(tempTwo));
                } else {
                    dispatch(setDecoratorSync(temp));
                }
            }
        }
        loadJson();
    }, [reloadAccounts]);

    const handleNextStep = () => {

        let noError = false;

        if (currentStep === 1) {
            if (!defaultSettings.selectedUser.value) {
                noError = "Please select a store.";
            } else if (!defaultSettings.selectedShopType.value) {
                noError = "Please select a store type.";
            }
            // else if (!defaultSettings.selectedStatus.value) {
            //     noError = "Please select a status.";
            // }
            else if (!defaultSettings.selectedIntactCustomer.value) {
                noError = "Please select a customer.";
            }

            if (!noError) {
                setStep1Completed(true);
                setCurrentStep(2);
            } else {
                Swal.fire({ title: 'Error!', text: noError, icon: 'error' });
            }
        } else if (currentStep === 2) {
            setStep2Completed(true);
            setCurrentStep(3);
        } else if (currentStep === 3) {

        }
    };

    // const handleBanner = () => {
    //     setBanner(false)
    // }

    const handlePreviousStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else if (currentStep === 3) {
            // setBanner(false);
            setCurrentStep(2);
        }
    };

    // console.log(currentStep);

    const saveNewAccoutHandler = () => {
        let data = {
            defaultSettings: defaultSettings,
            vendorSync: vendorSync,
            decoratorSync: decoratorSync,
        };

        async function postJSON(data) {
            try {
                const response = await fetch("/goosely/shopify-accounts/account-create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();
                console.log(result);
                if (result.success) {
                    dispatch(resetAccounts());
                    Swal.fire({
                        title: 'Success',
                        text: result.message,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        router.get(route('ic_shopifyaccounts'));
                    });
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: result.message,
                        icon: 'error',
                    });
                }
            } catch (error) {
                console.error();
            }
        }
        postJSON(data);
    }

    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div className='cc-inconnect-body-wraper'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>
                            <Text variant='headingLg' as='h5'>
                                <Card>
                                    {/* The following code creates a vertical menu with separate pages for each tab */}
                                    {/* <p className='c-i-menu-heading'>Connections</p> */}
                                    <ul className='leftmenu-ic-shopifyaccounts'>
                                        <li style={{ marginTop: "0px" }}><a onClick={() => router.get(route('ic_shopifyaccounts'))} className='cc-in-active'><div style={{ background: `url('${window.appURL}/images/shopify-accounts.svg')`, width: '20px', height: "20px", backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div> <span>Shopify Accounts</span></a></li>
                                        <li><a onClick={() => router.get(route('ic_vendors.index'))}><div style={{ background: `url('${window.appURL}/images/vendors-cc-in.svg')`, width: '20px', height: "20px", backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>Vendors</a></li>
                                        <li><a onClick={() => router.get(route('ic_decorators.index'))}><div style={{ background: `url('${window.appURL}/images/vendors-cc-in.svg')`, width: '20px', height: "20px", backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>Decorators</a></li>
                                        <li><a onClick={() => router.get(route('ic_goosely_rules'))}><div style={{ background: `url('${window.appURL}/images/vendors-cc-in.svg')`, width: '20px', height: "20px", backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>Rules</a></li>
                                        <li style={{ marginBottom: "0px" }}><a onClick={() => router.get(route('ic_goosely_jobs'))}><div style={{ background: `url('${window.appURL}/images/decorators-cc-in.svg')`, width: '20px', height: "20px", backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>Jobs</a></li>
                                        {/* <li style={{ marginBottom: "0px" }}><a onClick={() => router.get(route('ic_generalsettings'))}><div style={{ background: `url('${window.appURL}/images/general-settings-cc-in.svg')`, width: '20px', height: "20px", backgroundRepeat: 'no-repeat', float: 'left', marginRight: '5px', marginTop: '2px', display: 'block' }}></div>General Settings</a></li> */}
                                    </ul>
                                </Card>
                            </Text>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 9, lg: 9, xl: 9 }}>
                            <div className='cstm-card'>
                                <Card>
                                    <div className='flex justify-between pb-5'>
                                        <div style={{ marginTop: "6px", fontSize: "18px", fontWeight: "600" }}>{defaultSettings.selectedUser ? `Edit Account (${defaultSettings.selectedUser.store_name})` : 'Add Account'}</div>
                                        <Button onClick={saveNewAccoutHandler}>Save</Button>
                                    </div>
                                    <Divider />
                                    <div className='steps mt-5 mb-5'>
                                        <div className='flex justify-center' style={{ marginTop: "40px", marginBottom: "30px" }}>
                                            <div className="step-indicator">
                                                <div className='flex flex-col  '>
                                                    <button onClick={() => setCurrentStep(1)}>
                                                        <div className={`step-name default ${currentStep === 1 ? 'current' : ''}`}>Default Settings</div>
                                                        <div className={`step-circle ${step1Completed ? 'completed' : ''}`}>
                                                            {step1Completed ? (<div className="step-icon">✓</div>) : (1)}
                                                        </div>
                                                    </button>
                                                </div >
                                                <div className={`step-line ${step1Completed ? 'completed' : ''}`}></div>
                                                <div className='flex flex-col items-center'>
                                                    <button onClick={() => setCurrentStep(2)}>
                                                        <div className={`step-name vendor ${currentStep === 2 ? 'current' : ''}`}><span>Vendor Sync</span></div>

                                                        <div className={`step-circle ${step2Completed ? 'completed' : ''}`}>
                                                            {step2Completed ? (<div className="step-icon">✓</div>) : (2)}
                                                        </div>
                                                    </button>
                                                </div>
                                                <div className={`step-line ${step2Completed ? 'completed' : ''}`}></div>
                                                <div className='flex flex-col items-center'>
                                                    <button onClick={() => setCurrentStep(3)}>
                                                        <div className={`step-name deco ${currentStep === 3 ? 'current' : ''}`}><span>Decorator Sync</span></div>
                                                        <div className={`step-circle ${step3Completed ? 'completed' : ''}`}>
                                                            {step3Completed ? (<div className="step-icon">✓</div>) : (3)}
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="step-content">
                                            {currentStep === 1 && (<div> <DefaultSettings editId={page.ziggy.query.id ? page.ziggy.query.id : false} /> </div>)}
                                            {currentStep === 2 && (<div className='mt-8 '> <VendorSync /> </div>)}
                                            {currentStep === 3 && (<div className='mt-8'> <DecoratorSync /> </div>)}
                                        </div>
                                    </div>
                                    <div className='flex justify-end'>
                                        {currentStep !== 1 && (
                                            <div className='mx-2'> <Button onClick={handlePreviousStep}>Previous</Button></div>
                                        )}
                                        <Button variant="primary" onClick={() => {
                                            currentStep != 3 ? handleNextStep() : saveNewAccoutHandler()
                                        }}>{currentStep == 3 ? 'Save' : 'Next'}</Button>
                                    </div>
                                </Card>
                            </div>
                        </Grid.Cell>
                    </Grid>
                </div >
            </Page >
        </div >
    )
}

Connections.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Connections
