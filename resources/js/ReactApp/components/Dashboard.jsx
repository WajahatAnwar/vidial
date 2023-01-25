import {Page, Grid, Card, Text, Button, Banner, ProgressBar, Icon, TextField, Popover, DatePicker} from '@shopify/polaris';
import {useEffect, useState,useCallback} from 'react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import vedio from '../components/imges/image_one.png';
import { ArrowRightMinor, CircleTickMajor } from '@shopify/polaris-icons';


// chart imports start
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';
  import { faker } from '@faker-js/faker';

  ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Filler,
      Legend
    );

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

function Dashboard() {

    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

    const [chartData, setChartData] = useState({
        labels,
        datasets: [
          {
            fill: true,
            label: 'Dataset 2',
            data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
            borderColor: 'rgba(79, 209, 197, 1)',
            backgroundColor: 'rgba(79, 209, 197, 0.54)',
          },
          {
              fill: true,
              label: 'Dataset 2',
              data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
              borderColor: 'rgba(79, 209, 197, 1)',
              backgroundColor: 'rgba(79, 209, 197, 0.54)',
          },

        ],
      });

    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState("all");

    const [viewsCount, setViewsCount] = useState(0);
    const [ordersCount, setOrdersCount] = useState(0);
    const [salesCount, setSalesCount] = useState(0);

    const [{month, year}, setDate] = useState({month: new Date().getMonth(), year: new Date().getFullYear()});
    // new Date("2010-02-18")
    const [datePickerPopoverActive, setDatePickerPopoverActive] = useState(false);
    const setDatePickerTogglePopoverActive = useCallback(
      () => setDatePickerPopoverActive((datePickerPopoverActive) => !datePickerPopoverActive),
      [],
    );

    const [selectedDates, setSelectedDates] = useState({ start: new Date(), end: new Date() });
    const handleMonthChange = useCallback((month, year) => setDate({month, year}), [],);

    var date = new Date(selectedDates['start']);
    var enddate = new Date(selectedDates['end']);

    const monthArr = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sep","Oct","Nov","Dec"];
    const myStartDate = date.getDate()+ " " +monthArr[date.getMonth()]+ " " +date.getFullYear();
    const myEndDate = enddate.getDate()+ " " +monthArr[enddate.getMonth()]+ " " +enddate.getFullYear();

    // console.log(myStartDate);
    // console.log(myEndDate);

    const dateRange= `${myStartDate} - ${myEndDate}`;

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




    const navigate = useNavigate();

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

        fetch( "/get_dashboard_data",{
            method: "POST",
            // headers: { "content-Type": "application/json" },
            body: formData,
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success === true) {
                setViewsCount(data.data.dashboard.views);
                setOrdersCount(data.data.dashboard.orders);
                setSalesCount(data.data.dashboard.sales);

                let labels = data.data.first_chart_one.labels;

                setChartData({
                    labels,
                    datasets: [
                        data.data.first_chart_one.dataset1,
                        data.data.first_chart_one.dataset2,
                        data.data.first_chart_one.dataset3,
                    ]
                })
            } else if(data.success === false) {
            }
        });

    },[reload]);

    return (
        <Page>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"15px"}}>
                <h1 className="Polaris-Header-Title" style={{}}>Dashboard</h1>
                <div style={{display:"flex"}}>
                    <div style={{marginRight:"10px"}}> <Button onClick={()=>navigate('/campaigns')}>View Campaigns</Button> </div>
                    <Button primary onClick={()=>navigate('/new-campaign')}>New Campaign +</Button>
                </div>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"flex-start",marginBottom:"15px"}}>
                <div><Button onClick={() => {
                    setFilter("all");
                    setReload(!reload);
                }}>All</Button></div>

                <div style={{marginLeft:"10px"}}><Button onClick={() => {
                    setFilter("today");
                    setReload(!reload);
                }}>Today</Button></div>

                <div style={{marginLeft:"10px"}}><Button onClick={() => {
                    setFilter("yesterday");
                    setReload(!reload);
                }}>Yesterday</Button></div>

                <div style={{marginLeft:"10px"}}>
                    <div className='datePickerPopover'>
                        <Popover
                            labe
                            active={datePickerPopoverActive}
                            activator={activator}
                            autofocusTarget="first-node"
                            onClose={setDatePickerTogglePopoverActive}
                        >
                            <div style={{padding:"20px"}}>
                                <div className='datepickerDropdownFields'>
                                    <TextField
                                        value={myStartDate}
                                        autoComplete="off"
                                    />
                                        <div className='iconDateDropdown'>
                                            <Icon
                                            source={ArrowRightMinor}
                                            color="base"
                                            />
                                        </div>
                                    <TextField
                                        value={myEndDate}
                                        autoComplete="off"
                                    />
                                </div>
                                <DatePicker
                                    month={month}
                                    year={year}
                                    onChange={setSelectedDates}
                                    onMonthChange={handleMonthChange}
                                    selected={selectedDates}
                                    allowRange
                                    multiMonth
                                />
                                <div style={{paddingTop:"20px",borderTop: "1px solid #e1e3e5",marginTop:"16px", marginBottom:"0px"}}>
                                </div>
                                <div style={{display:"flex",justifyContent:"flex-end"}}>
                                    <div style={{marginRight:"10px"}}>
                                        <Button onClick={() => {
                                            setSelectedDates({ start: new Date(), end: new Date() });
                                            setDatePickerPopoverActive(false);
                                            setFilter("all");
                                            setReload(!reload);
                                        }}> Cancel</Button>
                                    </div>
                                    <Button primary onClick={() => {
                                        setDatePickerPopoverActive(false);
                                        if(selectedDates.start.getDate() == new Date().getDate()) {
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
            <Grid>
                <Grid.Cell columnSpan={{xs: 4, sm: 4, md: 4, lg: 4, xl: 4}}>
                    <Card title="Views" sectioned>
                        <Text variant="heading3xl" as="h2">{viewsCount}</Text>
                    </Card>
                    <Card title="Orders" sectioned>
                        <Text variant="heading3xl" as="h2">{ordersCount}</Text>
                    </Card>
                    <Card title="Sales" sectioned>
                        <Text variant="heading3xl" as="h2">{salesCount}</Text>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 8, sm: 8, md: 8, lg: 8, xl: 8}}>
                    <Card sectioned>
                        <div style={{height:"365px"}}>
                            <Line height={740} width={1200} data={chartData} />
                        </div>
                    </Card>
                </Grid.Cell>
                {/* <Grid.Cell columnSpan={{xs: 8, sm: 3, md: 3, lg: 8, xl: 8}}>
                        <Banner
                            title="How to create campaign?"
                            status="info"
                            onDismiss={() => {}}
                            >
                            <p><strong>Step 1</strong> create campaign</p>
                            <p><strong>Step 2</strong> set application by type (product or collection or all stock)</p>
                            <p><strong>Step 3</strong> set mystery discount rule</p>
                    </Banner>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 4, sm: 3, md: 3, lg: 4, xl: 4}}>

                        <img style={{marginTop:"-8px"}} src={vedio}/>

                </Grid.Cell> */}
            </Grid>
        </Page>
    );
}
export default Dashboard;
