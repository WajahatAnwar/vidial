import { Page, Grid, Card, Text, Button, Popover, DatePicker } from '@shopify/polaris';
import { useEffect, useState, useCallback } from 'react';
import React from 'react';
import Icon1 from '@/ReactJs/Applications/OrderSplitter/Assets/images/icon1.png';
import Icon2 from '@/ReactJs/Applications/OrderSplitter/Assets/images/icon2.png';
import Icon3 from '@/ReactJs/Applications/OrderSplitter/Assets/images/icon3.png';
import Icon4 from '@/ReactJs/Applications/OrderSplitter/Assets/images/icon4.png';

import AppLayout from '@/ReactJs/Applications/OrderSplitter/AppLayout';
import "@shopify/polaris/build/esm/styles.css";

function Dashboard(props) {

    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState("all");

    const [ordersCount, setOrdersCount] = useState(0);
    const [storesCount, setStoresCount] = useState(0);
    const [vendorsCount, setVendorsCount] = useState(0);
    const [productsCount, setProductsCount] = useState(0);

    const [{ month, year }, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    // new Date("2010-02-18")
    const [datePickerPopoverActive, setDatePickerPopoverActive] = useState(false);
    const setDatePickerTogglePopoverActive = useCallback(
        () => setDatePickerPopoverActive((datePickerPopoverActive) => !datePickerPopoverActive),
        [],
    );

    const [selectedDates, setSelectedDates] = useState({ start: new Date(), end: new Date() });
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
                    selectedDates.start.getDate() == new Date().getDate() ?
                        "Select Date" :
                        dateRange
                }
            </Button>
        </div>
    );

    useEffect(() => {

        var date = new Date(selectedDates['start']),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        const startDate = [date.getFullYear(), mnth, day].join("-");
        var enddate = new Date(selectedDates['end']),
            endMnth = ("0" + (enddate.getMonth() + 1)).slice(-2),
            endDay = ("0" + enddate.getDate()).slice(-2);
        const endDate = [enddate.getFullYear(), endMnth, endDay].join("-");

        const formData = new FormData();
        formData.append("filter", filter);
        formData.append("start_date", startDate);
        formData.append("end_date", endDate);

        fetch("/order_splitter/get_dashboard_data", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    setProductsCount(data.data.dashboard.products);
                    setOrdersCount(data.data.dashboard.os_orders);
                    setStoresCount(data.data.dashboard.users);
                    setVendorsCount(data.data.dashboard.os_vendors);
                } else if (data.success === false) {
                }
            });

    }, [reload]);

    return (
        <div style={{ background: `url('${window.appURL}/images/background5.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> Dashboard</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", marginBottom: "15px" }}>
                    <div><Button onClick={() => {
                        setFilter("all");
                        setReload(!reload);
                    }}>All</Button></div>

                    <div style={{ marginLeft: "10px" }}><Button onClick={() => {
                        setFilter("today");
                        setReload(!reload);
                    }}>Today</Button></div>

                    <div style={{ marginLeft: "10px" }}><Button onClick={() => {
                        setFilter("yesterday");
                        setReload(!reload);
                    }}>Yesterday</Button></div>

                    <div style={{ marginLeft: "10px" }}>
                        <div className='datePickerPopover'>
                            <Popover
                                labe
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
                                    <div style={{ paddingTop: "20px", borderTop: "1px solid #e1e3e5", marginTop: "16px", marginBottom: "0px" }}>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <div style={{ marginRight: "10px" }}>
                                            <Button onClick={() => {
                                                setSelectedDates({ start: new Date(), end: new Date() });
                                                setDatePickerPopoverActive(false);
                                                setFilter("all");
                                                setReload(!reload);
                                            }}> Cancel</Button>
                                        </div>
                                        <Button variant="primary" onClick={() => {
                                            setDatePickerPopoverActive(false);
                                            if (selectedDates.start.getDate() == new Date().getDate()) {
                                                setFilter("today");
                                                setReload(!reload);
                                            } else {
                                                setFilter("dates");
                                                setReload(!reload);
                                            }

                                        }}> Apply </Button>
                                    </div>
                                </div>
                            </Popover>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: "30px" }}></div>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Orders</p>
                                <img src={Icon1} style={{ width: "40px", height: "40px" }}></img>
                            </div>
                            <div style={{ marginTop: "-10px" }}>
                                <Text variant="heading2xl" as="h2">{ordersCount}</Text>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Stores</p>
                                <img src={Icon2} style={{ width: "40px", height: "40px" }}></img>
                            </div>
                            <div style={{ marginTop: "-10px" }}>
                                <Text variant="heading2xl" as="h2">{storesCount}</Text>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Vendors</p>
                                <img src={Icon3} style={{ width: "40px", height: "40px" }}></img>
                            </div>
                            <div style={{ marginTop: "-10px" }}>
                                <Text variant="heading2xl" as="h2">{vendorsCount}</Text>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Products</p>
                                <img src={Icon4} style={{ width: "40px", height: "40px" }}></img>
                            </div>
                            <div style={{ marginTop: "-10px" }}>
                                <Text variant="heading2xl" as="h2">{productsCount}</Text>
                            </div>
                        </Card>
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}

Dashboard.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Dashboard;
