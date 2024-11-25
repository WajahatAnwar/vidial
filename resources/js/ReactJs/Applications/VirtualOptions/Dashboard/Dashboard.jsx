import Icon1 from '@/ReactJs/Applications/VirtualOptions/Assets/images/icon1.png';
import Icon2 from '@/ReactJs/Applications/VirtualOptions/Assets/images/icon2.png';
import Icon3 from '@/ReactJs/Applications/VirtualOptions/Assets/images/icon3.png';
import Icon4 from '@/ReactJs/Applications/VirtualOptions/Assets/images/icon4.png';
import { Button, Card, DatePicker, Grid, Page, Popover, Text } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

import AppLayout from '@/ReactJs/Applications/VirtualOptions/AppLayout';
import "@shopify/polaris/build/esm/styles.css";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top'
        },
        title: {
            display: true,
            text: '',
        },
    },
};

function Dashboard(props) {

    //
    // var dt = new Date();
    // dt.setDate(dt.getDate() - 1);

    const [chartData, setChartData] = useState(false);

    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState("all");

    const [viewsCount, setViewsCount] = useState(0);
    const [ordersCount, setOrdersCount] = useState(0);
    const [salesCount, setSalesCount] = useState(0);
    const [salesCountTwo, setSalesCountTwo] = useState(0);

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

        fetch("/virtual_options/get_dashboard_data", {
            method: "POST",
            // headers: { "content-Type": "application/json" },
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    setViewsCount(data.data.dashboard.stores);
                    setOrdersCount(data.data.dashboard.products);
                    setSalesCount(data.data.dashboard.virtual_options);
                    setSalesCountTwo(data.data.dashboard.options_Applied);

                    setChartData({
                        minorGridLineWidth: 5,
                        gridLineWidth: 50,
                        chart: {
                            type: "spline",
                            height: 515
                        },
                        title: {
                            text: ''
                        },
                        subtitle: {
                            text: ''
                        },
                        xAxis: {
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            title: {
                                text: "Progress by Months",
                            },
                            // min: 0
                        },
                        yAxis: {
                            title: {
                                text: "Counts",
                            },
                            // min: 0
                        },
                        tooltip: {
                            headerFormat: "{point.x:%b}<br>",
                            pointFormat: "<b>{series.name}</b>: {point.y}",
                        },

                        plotOptions: {
                            spline: {
                                lineWidth: 3,
                                marker: {
                                    enabled: true,
                                    radius: 2.5,
                                },

                            }
                        },

                        colors: ["#F89B29", "#A461D8", "#82C43C", "#21deff"],
                        series: [
                            {
                                name: data.data.first_chart_one.dataset1.label,
                                data: data.data.first_chart_one.dataset1.data
                            },
                            {
                                name: data.data.first_chart_one.dataset2.label,
                                data: data.data.first_chart_one.dataset2.data
                            },
                            {
                                name: data.data.first_chart_one.dataset3.label,
                                data: data.data.first_chart_one.dataset3.data
                            },
                            {
                                name: data.data.first_chart_one.dataset4.label,
                                data: data.data.first_chart_one.dataset4.data
                            },
                        ],
                    })
                } else if (data.success === false) {
                }
            });

    }, [reload]);

    return (
        <div style={{ background: `url('${window.appURL}/images/background2.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
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
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Stores</p>
                                <img src={Icon1} style={{ width: "30px", height: "30px" }}></img>
                            </div>
                            <Text variant="heading2xl" as="h2">{viewsCount}</Text>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Products</p>
                                <img src={Icon2} style={{ width: "30px", height: "30px" }}></img>
                            </div>
                            <Text variant="heading2xl" as="h2">{ordersCount}</Text>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Virtual Options</p>
                                <img src={Icon3} style={{ width: "30px", height: "30px" }}></img>
                            </div>
                            <Text variant="heading2xl" as="h2">{salesCount}</Text>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Options Applied</p>
                                <img src={Icon4} style={{ width: "30px", height: "30px" }}></img>
                            </div>
                            <Text variant="heading2xl" as="h2">{salesCountTwo}</Text>
                        </Card>
                    </Grid.Cell>
                </Grid>
                <div style={{ marginTop: "30px" }}></div>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <Card>
                            <div style={{ height: "500px", marginTop: "10px" }}>
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={chartData}
                                />
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
