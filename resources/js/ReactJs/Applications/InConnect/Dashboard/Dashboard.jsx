
import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { router } from '@inertiajs/react';
import { Button, Card, DatePicker, Grid, Page, Popover, Text } from '@shopify/polaris';
import { HideIcon, ViewIcon } from '@shopify/polaris-icons';
import { useCallback, useState } from 'react';
import Select from 'react-select';
import './custom.css';

function Dashboard({ total_orders, failed_orders, success_orders, pending_integration, errors_before_integration, vip, standard, vendors, decorators, users, total_intacct_orders, failed_intacct_orders, success_intacct_orders, vip_intacct, standard_intacct, order_statuses, zero_dollar_orders, current_fraud_orders }) {

    const [selectedStore, setSelectedStore] = useState('');

    const [dashboardData, setDashboardData] = useState({ total_orders, failed_orders, success_orders, pending_integration, errors_before_integration, vip, standard, vendors, decorators, total_intacct_orders, failed_intacct_orders, success_intacct_orders, vip_intacct, standard_intacct, order_statuses, zero_dollar_orders, current_fraud_orders });

    const data = dashboardData.vendors.map((vendor) => {
        return { title: vendor.name, vendor_id: vendor.id, failed: `Failed - ${vendor.failed_orders}`, synced: `Synced - ${vendor.success_orders}`, total: `Total - ${vendor.total_orders}` }
    });
    const dataTwo = dashboardData.decorators.map((decorator) => {
        return { title: decorator.name, decorator_id: decorator.id, failed: `Failed - ${decorator.failed_orders}`, synced: `Synced - ${decorator.success_orders}`, total: `Total - ${decorator.total_orders}` }
    });
    const [showAdditionalFields, setShowAdditionalFields] = useState(Array(data.length).fill(false));
    const [showAdditionalFieldsTwo, setShowAdditionalFieldsTwo] = useState(Array(data.length).fill(false));
    const toggleAdditionalFields = (index) => {
        const updatedStates = [...showAdditionalFields];
        updatedStates[index] = !updatedStates[index];
        setShowAdditionalFields(updatedStates);
    };
    const toggleAdditionalFieldsTwo = (index) => {
        const updatedStatesTwo = [...showAdditionalFieldsTwo];
        updatedStatesTwo[index] = !updatedStatesTwo[index];
        setShowAdditionalFieldsTwo(updatedStatesTwo);
    };
    // Date Picker code here:
    const [{ month, year }, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    // new Date("2010-02-18")
    const [datePickerPopoverActive, setDatePickerPopoverActive] = useState(false);
    const setDatePickerTogglePopoverActive = useCallback(
        () => setDatePickerPopoverActive((datePickerPopoverActive) => !datePickerPopoverActive),
        [],
    );

    const [selectedDates, setSelectedDates] = useState({ start: new Date(), end: new Date() });
    const handleMonthChange = useCallback((month, year) => setDate({ month, year }), [],);
    const [reload, setReload] = useState(false);

    var date = new Date(selectedDates['start']);
    var enddate = new Date(selectedDates['end']);

    const monthArr = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const myStartDate = date.getDate() + " " + monthArr[date.getMonth()] + " " + date.getFullYear();
    const myEndDate = enddate.getDate() + " " + monthArr[enddate.getMonth()] + " " + enddate.getFullYear();
    const dateRange = `${myStartDate} - ${myEndDate}`;

    const activator = (
        <div className='selectDate'>
            <Button fullWidth onClick={setDatePickerTogglePopoverActive} disclosure>
                {
                    selectedDates.start.getDate() == new Date().getDate() ?
                        "Select Date" :
                        dateRange
                }
            </Button>
        </div>
    );

    const total = function () {
        return this.shopifyValue + this.qValue;
    }

    const cards = [
        {
            heading: 'Total Orders',
            shopifyValue: dashboardData.total_orders,
            qValue: dashboardData.total_intacct_orders,
            total
        },
        {
            heading: 'Failed Orders',
            shopifyValue: dashboardData.failed_orders,
            qValue: dashboardData.failed_intacct_orders,
            total
        },
        {
            heading: 'Synced Orders',
            shopifyValue: dashboardData.success_orders,
            qValue: dashboardData.success_intacct_orders,
            total
        },
        {
            heading: 'Pending Integration',
            shopifyValue: dashboardData.pending_integration,
            qValue: 0,
            total
        },
        {
            heading: 'Errors Before Integration',
            shopifyValue: dashboardData.errors_before_integration,
            qValue: 0,
            total
        },
        {
            heading: 'Orders On Hold',
            shopifyValue: dashboardData.current_fraud_orders,
            qValue: 0,
            total
        }
    ]

    function formatDateToYMD(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        var day = String(date.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    async function handleApply(reset = null, value = null) {
        console.log(selectedDates);
        let response = await fetch(route('ic_index', {
            start_date: reset ? (formatDateToYMD(new Date())) : formatDateToYMD(selectedDates.start),
            end_date: reset ? (formatDateToYMD(new Date())) : formatDateToYMD(selectedDates.end),
            reset: reset ? 1 : 0,
            selected_store: value
        }), {
            headers: {
                'Accept': 'application/json',
            }
        });
        let data = await response.json();
        if (data.success) {
            setDashboardData(data.data);
        }
    }

    const handleSelectStoreChange = (value) => {
        setSelectedStore(value);
        handleApply(null, value.value);
    }
    // Search Box 2 Start

    return (
        <div className='cc-inconnect-wrapper' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div className='mt-10'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 12, md: 12, lg: 12, xl: 12 }}>
                            <div className='flex justify-between'>
                                <div>
                                    {/* <div onClick={() => router.get(route('ic_shopifyaccounts'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div> */}
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Dashboard</div>
                                    {/* <div className='fontSmall' style={{ fontWeight: "400", marginTop: "6px", color: "white", fontSize: '12px' }}> Subtitle</div> */}
                                </div>
                                <div className='flex justify-between'>
                                    <div style={{ marginRight: 10, minWidth: 250 }}>
                                        <Select
                                            placeholder="Please select store..."
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                            options={users.map(value => ({
                                                value: value.id,
                                                label: value.store_name ? value.store_name : value.name,
                                            }))}
                                            value={selectedStore}
                                            onChange={handleSelectStoreChange}
                                        />
                                    </div>
                                    <div className="datePickerPopover">
                                        <Popover
                                            active={datePickerPopoverActive}
                                            activator={activator}
                                            autofocusTarget="first-node"
                                            onClose={setDatePickerTogglePopoverActive}
                                        >
                                            <div style={{ padding: "20px" }}>
                                                <DatePicker
                                                    month={month}
                                                    year={year}
                                                    onChange={setSelectedDates}
                                                    onMonthChange={handleMonthChange}
                                                    selected={selectedDates}
                                                    allowRange
                                                />
                                                <div
                                                    style={{
                                                        paddingTop: "20px 20px",
                                                        borderTop: "1px solid #e1e3e5",
                                                        marginTop: "16px",
                                                        marginBottom: "0px",
                                                    }}
                                                ></div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "flex-end",
                                                        marginTop: "20px"
                                                    }}
                                                >
                                                    <div style={{ marginRight: "10px", }}>
                                                        <Button
                                                            onClick={() => {
                                                                setSelectedDates({
                                                                    start: new Date(),
                                                                    end: new Date(),
                                                                });
                                                                setDatePickerPopoverActive(
                                                                    false
                                                                );
                                                                setReload(!reload);
                                                                handleApply(true);
                                                            }}
                                                        >
                                                            {" "}
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => {
                                                            setDatePickerPopoverActive(
                                                                false
                                                            );
                                                            setReload(!reload);
                                                            handleApply(null, selectedStore.value);
                                                        }}
                                                    >
                                                        Apply
                                                    </Button>
                                                </div>
                                            </div>
                                        </Popover>
                                    </div>
                                    <div style={{ marginLeft: 10 }}>
                                        <Button variant="primary" onClick={() => {
                                            setSelectedDates({
                                                start: new Date(),
                                                end: new Date(),
                                            });
                                            setSelectedStore('');
                                            handleApply(true);
                                        }}>Reset</Button>
                                    </div>
                                </div>
                            </div>
                        </Grid.Cell>
                    </Grid>
                    <div className='mt-8 flex  justify-between'>
                        {cards.map((card, index) => (
                            <div key={index} className='cstm-dash-card my-4'>
                                <Text variant='caption'>{card.heading}</Text>
                                <div className='flex items-center justify-between' title={index == 5 ? "Click here to see orders on hold!" : ""} style={{ marginTop: index == 4 ? "-18px" : "", cursor: index == 5 ? "pointer" : "" }} onClick={() => {
                                    if (index == 5) {
                                        router.get(route('ic_orders.index', { on_hold: true, start: selectedDates.start, end: selectedDates.end, user_id: selectedStore.value }))
                                    }
                                }}>
                                    <img className='' src={`${window.appURL}/images/orders-cc-inco.png`} />
                                    <div className='mt-7'>
                                        <Text variant='headingMd'>{card.shopifyValue}</Text>
                                    </div>
                                </div>
                                <div className='flex justify-between cstm-icon-dashboard'>
                                    <div className='cstm-circle'>
                                        <Text variant='headingSm'>Q</Text>
                                    </div>
                                    <Text variant='headingMd'>{card.qValue}</Text>
                                </div>
                                {/* <Divider borderColor="border-inverse" />
                                <div className='flex justify-end py-2'>
                                    <Text variant='headingMd'>{card.total()}</Text>
                                </div> */}
                            </div>
                        ))
                        }
                        <div className='cstm-second-card my-4'>
                            <div className='cstm-text'>
                                <Text variant='caption'>Unsynced orders placed more than 15 days ago</Text>
                            </div>
                            <div className='flex justify-between py-2'>
                                <div className='cstm-small-card mx-2 text-center' style={{ width: "45%" }}>
                                    <Text variant='caption'>Standard</Text>
                                    {/* ST-36 */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: "pointer" }} onClick={() => {
                                        router.get(route('ic_orders.index', { unsynced_orders: "standard", start: selectedDates.start, end: selectedDates.end, user_id: selectedStore.value }))
                                    }}>
                                        <img className='py-4' src={`${window.appURL}/images/orders-cc-inco.png`} />
                                        <Text variant='headingSm'>{dashboardData.standard}</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: "pointer" }} onClick={() => {
                                        router.get(route('ic_orders.index', { unsynced_orders: "standard_intact", start: selectedDates.start, end: selectedDates.end, user_id: selectedStore.value }))
                                    }}>
                                        <div className='cstm-circle mb-2'>
                                            <Text variant='headingSm'>Q</Text>
                                        </div>
                                        <Text variant='headingSm'>{dashboardData.standard_intacct}</Text>
                                    </div>
                                </div>
                                <div className='cstm-small-card mx-2 text-center' style={{ width: "45%" }}>
                                    <Text variant='caption'>VIP</Text>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: "pointer" }} onClick={() => {
                                        router.get(route('ic_orders.index', { unsynced_orders: "vip", start: selectedDates.start, end: selectedDates.end, user_id: selectedStore.value }))
                                    }}>
                                        <img className='py-4' src={`${window.appURL}/images/orders-cc-inco.png`} />
                                        <Text variant='headingSm'>{dashboardData.vip}</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: "pointer" }} onClick={() => {
                                        router.get(route('ic_orders.index', { unsynced_orders: "vip_intact", start: selectedDates.start, end: selectedDates.end, user_id: selectedStore.value }))
                                    }}>
                                        <div className='cstm-circle mb-2'>
                                            <Text variant='headingSm'>Q</Text>
                                        </div>
                                        <Text variant='headingSm'>{dashboardData.vip_intacct}</Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Order Statuses code */}
                    <div className='mt-8'>
                        <Card>
                            <div className='flex justify-between mb-2'>
                                <div>
                                    <Text as="h4" variant="headingXl">
                                        Failed Order Statuses
                                    </Text>
                                </div>
                            </div>
                            <Grid>
                                {dashboardData.order_statuses.map((item, index) => (
                                    <Grid.Cell key={index} columnSpan={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
                                        <div className='main-box-text mt-3'>
                                            <div className="box-text flex justify-between">
                                                <Text as='h6' variant='headingMd'>
                                                    <span style={{ textTransform: 'capitalize' }}>{item.UpdateName} </span>
                                                </Text>
                                            </div>
                                            <div className="box-textfield flex justify-between mt-3">
                                                <div onClick={() => router.get(route('ic_orders.index', { order_status_type: item.type }))} className='dashboard-box-field-total'> {item.OrdersCount}</div>
                                            </div>
                                        </div>
                                    </Grid.Cell>
                                ))}
                            </Grid>
                        </Card>
                    </div>
                    {/* Vendor's code */}
                    <div className='mt-5'>
                        <Card>
                            <div className='flex justify-between mb-2'>
                                <div>
                                    <Text as="h4" variant="headingXl">
                                        Vendor
                                    </Text>
                                </div>
                            </div>
                            <Grid>
                                {data.map((item, index) => (
                                    <Grid.Cell key={index} columnSpan={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                                        <div className='main-box-text mt-3'>
                                            <div className="box-text flex justify-between">
                                                <Text as='h6' variant='headingMd'>
                                                    {item.title}
                                                </Text>
                                                {showAdditionalFields[index] ? (
                                                    <HideIcon width={20} onClick={() => toggleAdditionalFields(index)} className='dashboard-eye-icon' />
                                                ) : (
                                                    <ViewIcon width={20} onClick={() => toggleAdditionalFields(index)} className='dashboard-eye-icon' />
                                                )}
                                            </div>
                                            <div className="box-textfield flex justify-between mt-3">
                                                <div onClick={() => router.get(route('ic_orders.index', { type: 'failed', by: 'vendor', vendor_id: item.vendor_id, start: selectedDates.start, end: selectedDates.end, user_id: selectedStore.value }))} className='dashboard-box-field' id={`failedTextInput${index}`}> {item.failed}</div>
                                                <div onClick={() => router.get(route('ic_orders.index', { type: 'success', by: 'vendor', vendor_id: item.vendor_id, start: selectedDates.start, end: selectedDates.end, user_id: selectedStore.value }))} className='dashboard-box-field' id={`syncedTextInput${index}`}> {item.synced}</div>
                                            </div>
                                            {showAdditionalFields[index] && (
                                                <div>
                                                    <div className="box-textfield flex justify-between mt-3">
                                                        <div className='dashboard-box-field-total' id={`syncedTextInput${index}`} > {item.total} </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Grid.Cell>
                                ))}
                            </Grid>
                        </Card>
                    </div>
                    {/* Decorator's code */}
                    <Grid container spacing={2}>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
                            <div className='mt-5'>
                                <Card>
                                    <div className='flex justify-between mb-2'>
                                        <div>
                                            <Text as="h4" variant="headingXl">
                                                Decorator
                                            </Text>
                                            {/* <Text as="h5" variant="bodyMd">
                                        Subtitle
                                    </Text> */}
                                        </div>

                                    </div>
                                    <Grid>
                                        {dataTwo.map((item, index) => (
                                            <Grid.Cell key={index} columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                                <div className='main-box-text mt-3'>
                                                    <div className="box-text flex justify-between">
                                                        <Text as='h6' variant='headingMd'>
                                                            {item.title}
                                                        </Text>
                                                        {/* <ViewIcon width={20} onClick={() => toggleAdditionalFieldsTwo(index)} className='dashboard-eye-icon' /> */}
                                                        {showAdditionalFieldsTwo[index] ? (
                                                            <HideIcon width={20} onClick={() => toggleAdditionalFieldsTwo(index)} className='dashboard-eye-icon' />
                                                        ) : (
                                                            <ViewIcon width={20} onClick={() => toggleAdditionalFieldsTwo(index)} className='dashboard-eye-icon' />
                                                        )}

                                                    </div>
                                                    <div className="box-textfield flex justify-between mt-3">
                                                        <div onClick={() => router.get(route('ic_orders.index', { type: 'failed', by: 'decorator', decorator_id: item.decorator_id, start: selectedDates.start, end: selectedDates.end, user_id: selectedStore.value }))} className='dashboard-box-field' id={`failedTextInput${index}`}> {item.failed}</div>
                                                        <div onClick={() => router.get(route('ic_orders.index', { type: 'success', by: 'decorator', decorator_id: item.decorator_id, start: selectedDates.start, end: selectedDates.end, user_id: selectedStore.value }))} className='dashboard-box-field' id={`syncedTextInput${index}`}> {item.synced}</div>
                                                    </div>

                                                    {showAdditionalFieldsTwo[index] && (
                                                        <div>

                                                            <div className="box-textfield flex justify-between mt-3">
                                                                <div className='dashboard-box-field-total' id={`syncedTextInput${index}`} > {item.total} </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Grid.Cell>
                                        ))}
                                    </Grid>
                                </Card>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                            {/* Zero Dollar Orders */}
                            <div className='mt-5 zero-dollar-order'>
                                <Card>
                                    <div className='flex justify-between mb-2'>
                                        <div>
                                            <Text as="h4" variant="headingXl">
                                                Zero Dollar Orders
                                            </Text>
                                        </div>

                                    </div>
                                    <Grid>
                                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                            <div className='main-box-text mt-3'>
                                                <div className="box-text flex justify-between">
                                                    <Text as='h6' variant='headingMd'>
                                                        Total Orders
                                                    </Text>
                                                </div>
                                                <div className="box-textfield flex justify-between mt-3">
                                                    <div className='dashboard-box-field-total' onClick={() => router.get(route('ic_orders.index', { by: 'zero', start: selectedDates.start, end: selectedDates.end, user_id: selectedStore.value }))}  > {zero_dollar_orders} </div>
                                                </div>
                                            </div>
                                        </Grid.Cell>
                                    </Grid>
                                </Card>
                            </div>
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>
        </div>
    );
}
Dashboard.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Dashboard;
