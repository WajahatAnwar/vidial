import React from 'react'
import { Text, Grid, Card, Divider } from '@shopify/polaris';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useDispatch, useSelector } from 'react-redux';
import { setVendorSync } from '@/ReactJs/reducers/InConnect/AccountsSlice';
import Toggle from '@/ReactJs/Components/ToggleSmall';

export const VendorSync = () => {

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

    function extractValuesAndLabels(arr, valueProp, labelProp) {
        let result = arr.map(item => ({
            value: item[valueProp],
            label: item[labelProp]
        }))
        return result;
    }

    const dispatch = useDispatch();

    const animatedComponents = makeAnimated();

    const addEditData = useSelector(state => state.inConnectAccounts.addEditData);
    const vendorSync = useSelector(state => state.inConnectAccounts.vendorSync);

    const handleChange = (object) => {
        dispatch(setVendorSync(object));
    }

    return (
        <div className=''>
            <Card>
                {/* <div className='p-6'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                            <div className='connection-toggle'>
                            <div style={{ marginBottom: "5px" }}> <Text variant="headingMd" as="h6">Enable Sync</Text></div>
                            <Toggle toggled={vendorSync.temp_sync} onClick={(e) => handleChange({ ...vendorSync, temp_sync: e })} />
                            </div>
                        </Grid.Cell>
                    </Grid>
                </div>
                <Divider /> */}
                <div className='mb-4'>
                    <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px" }}>Integration Exclusions:</div>
                    <div className='p-5 pt-3' style={{ border: "1px dashed #999999", borderRadius: "8px" }}>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <div style={{ marginBottom: "5px" }}> <Text variant='headingSm' as='h6'><span className="cust-staric">Item Types:</span></Text></div>
                                <Select
                                    closeMenuOnSelect={false}
                                    components={animatedComponents}
                                    isMulti
                                    value={vendorSync.ignoredProductTypes}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    options={addEditData && extractValuesAndLabels(addEditData.product_types, 'id', 'name')}
                                    onChange={(e) => handleChange({ ...vendorSync, ignoredProductTypes: e })}
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <div style={{ marginBottom: "5px" }}><Text variant='headingSm' as='h6'><span className="cust-staric">Vendors:</span></Text></div>
                                <Select
                                    closeMenuOnSelect={false}
                                    components={animatedComponents}
                                    value={vendorSync.ignoredVendors}
                                    isMulti
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    options={addEditData && extractValuesAndLabels(addEditData.vendors, 'id', 'name')}
                                    onChange={(e) => handleChange({ ...vendorSync, ignoredVendors: e })}
                                />
                            </Grid.Cell>
                            {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                            <div style={{ marginBottom: "5px" }}><Text variant='headingSm' as='h6'><span className="cust-staric">Shipping Method</span></Text></div>
                            <Select
                                // closeMenuOnSelect={false}
                                components={animatedComponents}
                                value={{
                                    value: vendorSync.shippingMethod,
                                    label: vendorSync.shippingMethod ? vendorSync.shippingMethod.toString().replace(/-/g, ' ') : ''
                                }}
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                options={shippingOptions.map(item => ({ value: item, label: item.replace(/-/g, ' ') }))}
                                onChange={(e) => handleChange({ ...vendorSync, shippingMethod: e.value })}
                            />
                        </Grid.Cell> */}
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <div>
                                    <div style={{ marginBottom: "5px" }}> <Text variant='headingSm' as='h6'><span className="cust-staric">Items:</span></Text></div>
                                    <Select
                                        closeMenuOnSelect={false}
                                        components={animatedComponents}
                                        isMulti
                                        value={vendorSync.ignoredProducts}
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        options={addEditData && extractValuesAndLabels(addEditData.store_products, 'id', 'product_title')}
                                        onChange={(e) => handleChange({ ...vendorSync, ignoredProducts: e })}
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </div>
                </div>
                {/* <Divider /> */}
                <div className=''>

                    <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px" }}>Do Not Order from Vendor:</div>
                    <div className='p-5 pt-3' style={{ border: "1px dashed #999999", borderRadius: "8px" }}>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div>
                                    <div style={{ marginBottom: "5px" }}>   <Text variant='headingSm' as='h6'><span className="cust-staric">Vendors:</span></Text>  </div>
                                    <Select
                                        closeMenuOnSelect={false}
                                        components={animatedComponents}
                                        value={vendorSync.directVendors}
                                        isMulti
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        options={addEditData && extractValuesAndLabels(addEditData.vendors, 'id', 'name')}
                                        onChange={(e) => handleChange({ ...vendorSync, directVendors: e })}
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </div>
                </div>
            </Card >
        </div >
    )
}
