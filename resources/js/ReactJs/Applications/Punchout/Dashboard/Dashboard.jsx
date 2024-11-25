import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';
import Arrowupgreen from '@/ReactJs/Applications/Punchout/Assets/images/arrow-up-green.svg';
import Arrowdownred from '@/ReactJs/Applications/Punchout/Assets/images/arrow-down-red.svg';
import NewSessionsPO from '@/ReactJs/Applications/Punchout/Assets/images/newSessionsPO.svg';
import newcustomerPO from '@/ReactJs/Applications/Punchout/Assets/images/newcustomerPONew.svg';
import OrdersPO from '@/ReactJs/Applications/Punchout/Assets/images/orders-PO.svg';
import Icon1 from '@/ReactJs/Applications/Punchout/Assets/images/revenue-dashboard.svg';


import { Button, Card, DatePicker, Grid, Page, Popover, Select, Text } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useEffect, useState } from 'react';
import AnalyticsChart from '../Components/AnalyticsDashboard';
import DashbpoardTable from '../Components/TableDashboard';
import { now } from 'lodash';

function Dashboard(props) {

    
    const [reload, setReload] = useState(false);
    const [filterChanged, setFilterChanged] = useState(false);

    const [ordersCount, setOrdersCount] = useState({
        count: 0,
        percentage: 0
    });
    const [confirmOrder, setConfirmOrder] = useState({
        count: 0,
        percentage: 0
    });
    const [customerCount, setCustomerCount] = useState({
        count: 0,
        percentage: 0
    });
    const [sessionCount, setSessionCount] = useState({
        count: 0,
        percentage: 0
    });

    const [options, setOptions] = useState([
        {
            label: 'Chose Client',
            value: '0'
        }
    ]);

    const [{ month, year }, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    // new Date("2010-02-18")
    const [datePickerPopoverActive, setDatePickerPopoverActive] = useState(false);
    const setDatePickerTogglePopoverActive = useCallback(
        () => setDatePickerPopoverActive((datePickerPopoverActive) => !datePickerPopoverActive),
        [],
    );

    const [selectedDates, setSelectedDates] = useState({ start: new Date(new Date().setDate(new Date().getDate() - 6)), end: new Date() });
    const handleMonthChange = useCallback((month, year) => setDate({ month, year }), [],);

    var date = new Date(selectedDates['start']);
    var enddate = new Date(selectedDates['end']);

    const monthArr = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const myStartDate = date.getDate() + " " + monthArr[date.getMonth()] + " " + date.getFullYear();
    const myEndDate = enddate.getDate() + " " + monthArr[enddate.getMonth()] + " " + enddate.getFullYear();

    // console.log(myStartDate);
    // console.log(myEndDate);

    const dateRange = `${myStartDate} - ${myEndDate}`;

    const activator = (
        <div className='selectDate'>
            <Button fullWidth onClick={setDatePickerTogglePopoverActive} disclosure>
                {
                    dateRange
                }
            </Button>
        </div>
    );

    const [analytics, setAnalytics] = useState({
        categories: [],
        totalAmounts: [],
    })

    useEffect(() => {
        var date = new Date(selectedDates['start']),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        const startDate = [date.getFullYear(), mnth, day].join("-");
        var enddate = new Date(selectedDates['end']),
            endMnth = ("0" + (enddate.getMonth() + 1)).slice(-2),
            endDay = ("0" + enddate.getDate()).slice(-2);
        const endDate = [enddate.getFullYear(), endMnth, endDay].join("-");
        // const formData = new FormData();
        // formData.append("filter", filter);
        // formData.append("start_date", startDate);
        // formData.append("end_date", endDate);

        const params = new URLSearchParams({
            startDate: startDate,
            endDate: endDate,
            ...(selected && { clientId: selected })
        });

        // Construct the URL with query parameters
        const url = `${route('punchout.dashboard.stats')}?${params.toString()}`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                console.log(data.data.orders);
                if (data.success === true) {
                    setSessionCount(data.data.sessions);
                    setOrdersCount(data.data.orders);
                    setConfirmOrder(data.data.confirm_orders);
                    setCustomerCount(data.data.customers);
                    setAnalytics(data.data.analytics);
                    const newOptions = data.data.clients.map((client) => ({
                        label: client.name,
                        value: client.id
                    }));
                    setOptions(newOptions);
                } else if (data.success === false) {
                }
            });

    }, [reload]);



    const [selected, setSelected] = useState();

    const handleSelectChange = (value) => {
        setFilterChanged(true)
        setSelected(parseInt(value))
        setReload(!reload)
    }
    const handleDateChange = (value) => {
        setSelectedDates(value)
        setFilterChanged(true)
    }
    const handleClear = () => {
        setSelectedDates({ start: new Date(new Date().setDate(new Date().getDate() - 6)), end: new Date() })
        setFilterChanged(false)
        setSelected()
        setReload(!reload)
    }
    console.log(selectedDates)


    return (
        <div>
            <Page fullWidth>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> Dashboard
                    </div>
                    {/* <small style={{ display: 'block', fontWeight: '200' }}>Increased in the last 1 month</small> */}

                </div>
                <div className='dashboard-calender-tabs-PO' style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "15px" }}>
                    {/* <div><Button onClick={() => {
                        setFilter("all");
                        setReload(!reload);
                    }}>All</Button></div> */}
                    <Select
                        options={options}
                        onChange={handleSelectChange}
                        value={selected}
                        placeholder='Select Client'
                    />
                    {/* <div style={{ marginLeft: "10px" }}><Button onClick={() => {
                        setFilter("today");
                        setReload(!reload);
                    }}>Today</Button></div>

                    <div style={{ marginLeft: "10px" }}><Button onClick={() => {
                        setFilter("yesterday");
                        setReload(!reload);
                    }}>Yesterday</Button></div> */}

                    <div style={{ marginLeft: "10px" }}>
                        <div className='datePickerPopover'>
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
                                        onChange={handleDateChange}
                                        onMonthChange={handleMonthChange}
                                        selected={selectedDates}
                                        allowRange
                                        disableDatesAfter={new Date()}
                                    />
                                    <div style={{ paddingTop: "20px", borderTop: "1px solid #e1e3e5", marginTop: "16px", marginBottom: "0px" }}>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <div style={{ marginRight: "10px" }}>
                                            <Button onClick={() => {
                                                setSelectedDates({ start: new Date(new Date().setDate(new Date().getDate() - 6)), end: new Date() });
                                                setDatePickerPopoverActive(false);
                                                setReload(!reload);
                                            }}> Cancel</Button>
                                        </div>
                                        <Button variant="primary" onClick={() => {
                                            setDatePickerPopoverActive(false);
                                            setReload(!reload);
                                        }}> Apply </Button>
                                    </div>
                                </div>
                            </Popover>
                        </div>
                    </div>
                    {
                        filterChanged ?
                            <div style={{ marginLeft: "10px" }}>
                                <Button onClick={handleClear}>
                                    Clear Filter
                                </Button>
                            </div>
                            :
                            null
                    }
                </div>
                <div className='dashboard-boxes-wrapper-PO'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                            <Card>
                                <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                    <p style={{ marginTop: "4px", fontWeight: "600" }}>Revenue </p>
                                    <img src={Icon1} style={{ width: "40px", height: "40px" }}></img>
                                </div>
                                <div className='dashboard-PO-card-wrapper'>
                                    <Text variant="heading2xl" as="h2">{parseFloat(confirmOrder.count).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text> <div className='dashboard-PO-card-txt'><span>{confirmOrder.percentage > 0 && '+'}{parseFloat(confirmOrder.percentage).toFixed(2)}%</span>  <img src={confirmOrder.percentage >= 0 ? Arrowupgreen : Arrowdownred} /></div>
                                </div>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                            <Card>
                                <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                    <p style={{ marginTop: "4px", fontWeight: "600" }}>Orders</p>
                                    <img src={OrdersPO} style={{ width: "40px", height: "40px" }}></img>
                                </div>
                                <div className='dashboard-PO-card-wrapper'>
                                    <Text variant="heading2xl" as="h2">{ordersCount.count}</Text> <div className='dashboard-PO-card-txt'><span>{ordersCount.percentage > 0 && '+'}{parseFloat(ordersCount.percentage).toFixed(2)}%</span>  <img src={ordersCount.percentage >= 0 ? Arrowupgreen : Arrowdownred} /></div>
                                </div>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                            <Card>
                                <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                    <p style={{ marginTop: "4px", fontWeight: "600" }}>New Customer</p>
                                    <img src={newcustomerPO} style={{ width: "40px", height: "40px" }}></img>
                                </div>
                                <div className='dashboard-PO-card-wrapper'>
                                    <Text variant="heading2xl" as="h2">{customerCount.count}</Text> <div className='dashboard-PO-card-txt'><span>{customerCount.percentage > 0 && '+'}{parseFloat(customerCount.percentage).toFixed(2)}%</span>  <img src={customerCount.percentage >= 0 ? Arrowupgreen : Arrowdownred} /></div>
                                </div>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                            <Card>
                                <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                    <p style={{ marginTop: "4px", fontWeight: "600" }}>New Sessions</p>
                                    <img src={NewSessionsPO} style={{ width: "40px", height: "40px" }}></img>
                                </div>
                                <div className='dashboard-PO-card-wrapper'>
                                    <Text variant="heading2xl" as="h2">{sessionCount.count}</Text> <div className='dashboard-PO-card-txt'><span>{sessionCount.percentage > 0 && '+'}{parseFloat(sessionCount.percentage).toFixed(2)}%</span>  <img src={sessionCount.percentage >= 0 ? Arrowupgreen : Arrowdownred} /></div>
                                </div>
                            </Card>
                        </Grid.Cell>

                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                            <Card>
                                <AnalyticsChart analytics={analytics} />
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                            <Card>
                                <Text variant="headingLg" as="h5">
                                    Orders
                                </Text>
                                <div className='mt-5'>
                                    <DashbpoardTable client={selected} dates={selectedDates} />
                                </div>
                            </Card>
                        </Grid.Cell>
                    </Grid>

                </div>
            </Page>
        </div>
    );
}

Dashboard.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Dashboard;
