import { Page, Grid, Card, Text, Button, Banner, ProgressBar, Icon, TextField, AppProvider, Popover, DatePicker } from '@shopify/polaris';
import { useEffect, useState, useCallback } from 'react';
import React from 'react';
import AppLayout from '@/ReactJs/Applications/SizeChart/AppLayout';
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
            display: false,
            text: '',
        },
    },
};

function Dashboard() {
    // const navigate = useNavigate();
    const [filter, setFilter] = useState(null);
    const [chartData, setChartData] = useState(false);
    const [data, setData] = useState({
        total_size_charts: 0,
        active_size_charts: 0,
        in_active_size_charts: 0,
        chart: [],
    });
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

    var url;

    useEffect(() => {
        async function getData(url) {
            let query = '';
            if (filter && filter == 'current_month') {
                var date = new Date(), y = date.getFullYear(), m = date.getMonth();
                var firstDay = new Date(y, m, 1);
                var lastDay = new Date(y, m + 1, 0);
                query = `?start=${firstDay.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).split('/').reverse().join('-')}&end=${lastDay.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).split('/').reverse().join('-')}`;
            } else if (filter && filter == 'past_month') {
                var date = new Date(), y = date.getFullYear(), m = date.getMonth() - 1;
                var firstDay = new Date(y, m, 1);
                var lastDay = new Date(y, m + 1, 0);
                query = `?start=${firstDay.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).split('/').reverse().join('-')}&end=${lastDay.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).split('/').reverse().join('-')}`;
            } else if (filter && filter == 'custom_dates') {
                var firstDay = selectedDates.start;
                var lastDay = selectedDates.end;
                query = `?start=${firstDay.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).split('/').reverse().join('-')}&end=${lastDay.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).split('/').reverse().join('-')}`;
            }
            url = route('dashboard.get') + query;
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        console.log(data);
                        setData({
                            total_size_charts: data.data.total_size_charts,
                            active_size_charts: data.data.active_size_charts,
                            in_active_size_charts: data.data.inactive_size_charts,
                            chart: data.data.chart
                        })
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

                            colors: ["#F89B29"],
                            series: [
                                {
                                    name: "Charts",
                                    data: data.data.chart
                                }
                            ],
                        });
                    }
                });
        }
        getData(url);
    }, [filter, selectedDates]);

    return (
        <div style={{ background: `url('${window.appURL}/images/background3.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ justifyContent: 'space-between', marginBottom: "30px", marginTop: "30px" }}>
                            <div style={{ display: "flex" }}>
                                <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> Dashboard</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                            <div><Button {...{ primary: !filter ? 'primary' : '' }} onClick={(e) => {
                                setFilter(null);
                            }}>All</Button></div>
                            <div style={{ marginLeft: "10px" }}><Button {...{ primary: filter == 'current_month' ? 'primary' : '' }} onClick={(e) => {
                                setFilter('current_month');
                            }}>Current Month</Button></div>
                            <div style={{ marginLeft: "10px" }}><Button {...{ primary: filter == 'past_month' ? 'primary' : '' }} onClick={(e) => {
                                setFilter('past_month');
                            }}>Past Month</Button></div>
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
                                                <Button primary onClick={() => {
                                                    setDatePickerPopoverActive(false);
                                                    setFilter('custom_dates');

                                                }}> Apply </Button>
                                            </div>
                                        </div>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
                <div style={{ marginTop: "30px" }}></div>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Total Size Charts</p>
                            <Text variant="heading3xl" as="h2">{data.total_size_charts}</Text>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Active Size Charts</p>
                            <Text variant="heading3xl" as="h2">{data.active_size_charts}</Text>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Inactive Size Charts</p>
                            <Text variant="heading3xl" as="h2">{data.in_active_size_charts}</Text>
                        </Card>
                    </Grid.Cell>
                </Grid>
                <div style={{ marginTop: "30px" }}></div>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <Card>
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={chartData}
                            />
                        </Card>
                    </Grid.Cell>
                </Grid>
            </Page>
        </div >
    );
}

Dashboard.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Dashboard;
