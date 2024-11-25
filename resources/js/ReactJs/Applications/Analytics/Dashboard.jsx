import { Button, Card, DatePicker, Grid, Page, Popover, Spinner, Text } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

import Select, { components } from 'react-select';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import AppLayout from '@/ReactJs/Applications/Analytics/AppLayout';
import "@/ReactJs/Applications/Analytics/Assets/css/style.css";
import "@/ReactJs/Components/toggle.css";
import { router } from '@inertiajs/react';
import "@shopify/polaris/build/esm/styles.css";

function Dashboard(props) {

    function formatAmount(number) {
        const formattedNumber = number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        return formattedNumber;
    }

    function addCommasToNumber(number) {
        return number.toLocaleString('en-US');
    }

    const InputOption = ({
        getStyles,
        Icon,
        isDisabled,
        isFocused,
        isSelected,
        children,
        innerProps,
        ...rest
    }) => {
        const [isActive, setIsActive] = useState(false);
        const onMouseDown = () => setIsActive(true);
        const onMouseUp = () => setIsActive(false);
        const onMouseLeave = () => setIsActive(false);

        // styles
        let bg = "transparent";
        if (isFocused) bg = "#eee";
        if (isActive) bg = "#B2D4FF";

        const style = {
            alignItems: "center",
            backgroundColor: bg,
            color: "inherit",
            display: "flex "
        };

        // prop assignment
        const props = {
            ...innerProps,
            onMouseDown,
            onMouseUp,
            onMouseLeave,
            style
        };

        return (
            <components.Option
                {...rest}
                isDisabled={isDisabled}
                isFocused={isFocused}
                isSelected={isSelected}
                getStyles={getStyles}
                innerProps={props}
            >
                <div style={{ paddingRight: "10px", marginTop: "-3px" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => { }} />
                </div>
                {children}
            </components.Option>
        );
    };
    //
    var dt = new Date();
    dt.setDate(dt.getDate() - 1);

    const [isLoading, setIsLoading] = useState(false);

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

    const [storesOptions, setStoresOptions] = useState([]);
    const [selectedStore, setSelectedStore] = useState([]);
    const [filter, setFilter] = useState("all");
    const [reload, setReload] = useState(false);

    const [topStoresOptions, setTopStoresOptions] = useState(false);
    const [topProductOptions, setTopProductOptions] = useState(false);
    const [collectionOptions, setCollectionOptions] = useState(false);
    const [orderByMonths, setOrderByMonths] = useState(false);
    const [orderByMonthsProducts, setOrderByMonthsProducts] = useState(false);
    const [orderByMonthsCollections, setOrderByMonthsCollections] = useState(false);
    const [threeChartsCount, setThreeChartsCount] = useState(false);
    const [noOfRefundsList, setNoOfRefundsList] = useState(false);
    const [ordersDetail, setOrdersDetail] = useState(false);
    const [ordersDetailTwo, setOrdersDetailTwo] = useState(false);
    const [averageOrderValue, setAverageOrderValue] = useState(false);
    const [topCustomersGraph, setTopCustomersGraph] = useState(false);

    useEffect(() => {

        fetch("/analytics/fetch-dashboard-content-ii", { method: "GET" })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success) {
                    let temp = [];
                    data.data.stores.forEach(element => temp.push({ value: `${element.id}`, label: `${element.name}` }));
                    setStoresOptions(temp);
                }

            })
    }, [])

    //FILTERS
    useEffect(() => {
        setIsLoading(true);

        var date = new Date(selectedDates['start']),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        const startDate = [date.getFullYear(), mnth, day].join("-");
        var enddate = new Date(selectedDates['end']),
            endMnth = ("0" + (enddate.getMonth() + 1)).slice(-2),
            endDay = ("0" + enddate.getDate()).slice(-2);
        const endDate = [enddate.getFullYear(), endMnth, endDay].join("-");

        let arr_final = [];
        selectedStore.forEach(element => {
            arr_final.push(element.value);
        });

        const formData = new FormData();
        formData.append("filter", filter);
        formData.append("start_date", startDate);
        formData.append("end_date", endDate);
        formData.append("store", arr_final);

        fetch("/analytics/fetch-dashboard-content", {
            method: "POST",
            // headers: { "content-Type": "application/json" },
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success) {
                    let temp = [];
                    data.data.stores.forEach(element => { temp.push({ name: element.store_name, y: parseFloat(element.total_amount) }) });
                    setTopStoresOptions({
                        colors: [
                            '#f58e8e',  // Red
                            '#1FA2FF',  // Green
                            '#24FE41',  // Blue
                        ].map(function (color) {
                            return {
                                radialGradient: {
                                    cx: 0.5,
                                    cy: 0.3,
                                    r: 0.7
                                },
                                stops: [
                                    [0, color],
                                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                                ]
                            };
                        }),
                        chart: {
                            type: 'pie',
                            height: 285 // set the height here

                        },
                        title: {
                            text: '',
                            align: 'left'
                        },

                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: false
                                },
                                showInLegend: true
                            }
                        },

                        tooltip: {
                            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y:.2f}</b> Total Revenue <br/>'
                        },

                        series: [
                            {
                                name: 'Store',
                                colorByPoint: true,
                                data: temp
                            }
                        ],
                    });
                    temp = [];
                    let temp2 = [];
                    data.data.products.forEach(element => { temp.push(element.product_title) });
                    data.data.products.forEach(element => { temp2.push(parseFloat((Math.round(element.total_price * 100) / 100).toFixed(2))) });
                    setTopProductOptions({
                        colors: [
                            // Add more custom colors here
                            '#7aff90',  // Red
                            '#79F9FB',  // Green
                            '#FF9966',  // Blue
                            // Add more custom colors here
                        ].map(function (color) {
                            return {
                                radialGradient: {
                                    cx: 0.5,
                                    cy: 0.3,
                                    r: 0.7
                                },
                                stops: [
                                    [0, color],
                                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                                ]
                            };
                        }),
                        chart: {
                            type: 'bar',
                            height: 255
                        },
                        title: {
                            text: '',
                            align: 'left'
                        },
                        xAxis: {
                            categories: temp,
                            title: {
                                text: null
                            }
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: '',
                                align: 'high'
                            },
                            labels: {
                                overflow: 'justify'
                            }
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y:.2f}</b> Product Revenue <br/>'
                        },

                        plotOptions: {
                            bar: {
                                dataLabels: {
                                    enabled: true
                                }
                            }
                        },
                        credits: {
                            enabled: false
                        },
                        series: [{
                            name: 'Top Products',
                            data: temp2
                        }]
                    })
                    temp = [];
                    data.data.collections.forEach(element => { temp.push({ name: element.collection_title, y: parseFloat(element.total_quantity) }) });
                    setCollectionOptions({

                        colors: [
                            // Add more custom colors here
                            '#00F5A0',  // Red
                            '#79F9FB',  // Green
                            '#FF9966',  // Blue

                        ].map(function (color) {
                            return {
                                radialGradient: {
                                    cx: 0.5,
                                    cy: 0.3,
                                    r: 0.7
                                },
                                stops: [
                                    [0, color],
                                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                                ]
                            };
                        }),
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false,
                            type: 'pie',
                            height: 285
                        },
                        title: {
                            text: '',
                            align: 'left'
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y:.2f}</b> Collection Revenue <br/>'
                        },
                        accessibility: {
                            point: {
                                valueSuffix: '%'
                            }
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: false
                                },
                                showInLegend: true
                            }
                        },
                        series: [{
                            name: 'Collection',
                            colorByPoint: true,
                            data: temp
                        }]
                    });
                    setOrderByMonths({
                        colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
                            return {
                                radialGradient: {
                                    cx: 0.5,
                                    cy: 0.3,
                                    r: 0.7
                                },
                                stops: [
                                    [0, color],
                                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                                ]
                            };
                        }),
                        chart: {
                            type: 'area',
                            height: 257
                        },
                        accessibility: {
                            description: 'Image description: An area chart compares the nuclear stockpiles of the USA and the USSR/Russia between 1945 and 2017. The number of nuclear weapons is plotted on the Y-axis and the years on the X-axis. The chart is interactive, and the year-on-year stockpile levels can be traced for each country. The US has a stockpile of 6 nuclear weapons at the dawn of the nuclear age in 1945. This number has gradually increased to 369 by 1950 when the USSR enters the arms race with 6 weapons. At this point, the US starts to rapidly build its stockpile culminating in 32,040 warheads by 1966 compared to the USSR’s 7,089. From this peak in 1966, the US stockpile gradually decreases as the USSR’s stockpile expands. By 1978 the USSR has closed the nuclear gap at 25,393. The USSR stockpile continues to grow until it reaches a peak of 45,000 in 1986 compared to the US arsenal of 24,401. From 1986, the nuclear stockpiles of both countries start to fall. By 2000, the numbers have fallen to 10,577 and 21,000 for the US and Russia, respectively. The decreases continue until 2017 at which point the US holds 4,018 weapons compared to Russia’s 4,500.'
                        },
                        title: {
                            text: ''
                        },

                        xAxis: {
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            title: {
                                text: ''
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Average Order Value'
                            },
                            min: 0
                        },
                        tooltip: {
                            pointFormat: '<span style="color:{point.color}">{point.name}</span> <b>{point.y}</b> Orders <br/>'
                        },

                        series: [{

                            name: 'Orders By Months',
                            data: data.data.three_charts_data.dataset1
                        },]
                    });
                    setOrderByMonthsProducts({
                        colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
                            return {
                                radialGradient: {
                                    cx: 0.5,
                                    cy: 0.3,
                                    r: 0.7
                                },
                                stops: [
                                    [0, color],
                                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                                ]
                            };
                        }),
                        chart: {
                            type: 'line',
                            height: 220

                        },
                        title: {
                            text: '',
                            align: 'left'
                        },
                        xAxis: {
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            title: {
                                text: ''
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Products'
                            }
                        },

                        series: [{

                            name: 'Products By Months',
                            data: data.data.three_charts_data.dataset2
                        },]
                    })
                    setOrderByMonthsCollections({
                        colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
                            return {
                                radialGradient: {
                                    cx: 0.5,
                                    cy: 0.3,
                                    r: 0.7
                                },
                                stops: [
                                    [0, color],
                                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                                ]
                            };
                        }),
                        chart: {
                            type: 'line',
                            height: 220

                        },
                        title: {
                            text: '',
                            align: 'left'
                        },
                        xAxis: {
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            title: {
                                text: ''
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Collections'
                            }
                        },

                        series: [{

                            name: 'Collections By Months',
                            data: data.data.three_charts_data.dataset3
                        },]
                    });
                    setNoOfRefundsList({
                        colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
                            return {
                                radialGradient: {
                                    cx: 0.5,
                                    cy: 0.3,
                                    r: 0.7
                                },
                                stops: [
                                    [0, color],
                                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                                ]
                            };
                        }),
                        chart: {
                            type: 'line',
                            height: 220

                        },
                        title: {
                            text: '',
                            align: 'left'
                        },
                        xAxis: {
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            title: {
                                text: ''
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Refunds'
                            }
                        },

                        series: [{

                            name: 'Refunds By Months',
                            data: data.data.three_charts_data.dataset4.map(element => typeof element === "string" ? parseInt(element, 10) : element)
                        },]
                    })
                    setOrdersDetail({
                        colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
                            return {
                                radialGradient: {
                                    cx: 0.5,
                                    cy: 0.3,
                                    r: 0.7
                                },
                                stops: [
                                    [0, color],
                                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                                ]
                            };
                        }),
                        chart: {
                            type: 'spline',
                            height: 258 // set the height here

                        },
                        title: {
                            text: '',
                            align: 'left'
                        },

                        xAxis: {
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            title: {
                                text: ''
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Order Details'
                            },
                            min: 0
                        },
                        tooltip: {
                            headerFormat: '<b>{series.name}</b><br>',
                            pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
                        },

                        plotOptions: {
                            series: {
                                marker: {
                                    enabled: true,
                                    radius: 2.5
                                }
                            }
                        },

                        series: [
                            {
                                name: 'Unshipped',
                                data: data.data.three_charts_data.dataset5
                            }, {
                                name: 'Partial Shipped',
                                data: data.data.three_charts_data.dataset6
                            }, {
                                name: 'Shipped',
                                data: data.data.three_charts_data.dataset7
                            }
                        ]
                    })
                    setAverageOrderValue({
                        colors: [
                            // Add more custom colors here
                            '#fff385',  // Red
                            '#79F9FB',  // Green
                            '#FF9966',  // Blue
                            // Add more custom colors here
                        ].map(function (color) {
                            return {
                                radialGradient: {
                                    cx: 0.5,
                                    cy: 0.3,
                                    r: 0.7
                                },
                                stops: [
                                    [0, color],
                                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                                ]
                            };
                        }),
                        chart: {
                            type: 'area',
                            height: 250
                        },
                        accessibility: {
                            description: 'Image description: An area chart compares the nuclear stockpiles of the USA and the USSR/Russia between 1945 and 2017. The number of nuclear weapons is plotted on the Y-axis and the years on the X-axis. The chart is interactive, and the year-on-year stockpile levels can be traced for each country. The US has a stockpile of 6 nuclear weapons at the dawn of the nuclear age in 1945. This number has gradually increased to 369 by 1950 when the USSR enters the arms race with 6 weapons. At this point, the US starts to rapidly build its stockpile culminating in 32,040 warheads by 1966 compared to the USSR’s 7,089. From this peak in 1966, the US stockpile gradually decreases as the USSR’s stockpile expands. By 1978 the USSR has closed the nuclear gap at 25,393. The USSR stockpile continues to grow until it reaches a peak of 45,000 in 1986 compared to the US arsenal of 24,401. From 1986, the nuclear stockpiles of both countries start to fall. By 2000, the numbers have fallen to 10,577 and 21,000 for the US and Russia, respectively. The decreases continue until 2017 at which point the US holds 4,018 weapons compared to Russia’s 4,500.'
                        },
                        title: {
                            text: ''
                        },

                        xAxis: {
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            title: {
                                text: ''
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Average Order Value'
                            },
                            min: 0
                        },
                        tooltip: {
                            pointFormat: '<span style="color:{point.color}">{point.name}</span> <b>${point.y:.2f}</b> Average <br/>'
                        },
                        series: [{
                            name: 'Value By Month',
                            data: data.data.three_charts_data.dataset8
                        }]
                    })
                    setTopCustomersGraph({
                        colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
                            return {
                                radialGradient: {
                                    cx: 0.5,
                                    cy: 0.3,
                                    r: 0.7
                                },
                                stops: [
                                    [0, color],
                                    [1, Highcharts.color(color).brighten(-0.3).get('rgb')] // darken
                                ]
                            };
                        }),
                        chart: {
                            type: 'spline',
                            height: 258 // set the height here

                        },
                        title: {
                            text: '',
                            align: 'left'
                        },

                        xAxis: {
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            title: {
                                text: ''
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Customers'
                            },
                            min: 0
                        },
                        tooltip: {
                            headerFormat: '<b>{series.name}</b><br>',
                            pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
                        },

                        plotOptions: {
                            series: {
                                marker: {
                                    enabled: true,
                                    radius: 2.5
                                }
                            }
                        },

                        series: data.data.seventh_graph.length == 0 ? [
                            {
                                name: 'Customers',
                                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                            }
                        ] : data.data.seventh_graph
                    })
                    setThreeChartsCount({
                        first: data.data.three_charts_data.dataset1.map(element => typeof element === "string" ? parseInt(element, 10) : element).reduce((accumulator, currentValue) => accumulator + currentValue),
                        second: data.data.three_charts_data.dataset2.map(element => typeof element === "string" ? parseInt(element, 10) : element).reduce((accumulator, currentValue) => accumulator + currentValue),
                        third: data.data.three_charts_data.dataset3.map(element => typeof element === "string" ? parseInt(element, 10) : element).reduce((accumulator, currentValue) => accumulator + currentValue),
                        fourth: data.data.three_charts_data.dataset4.map(element => typeof element === "string" ? parseInt(element, 10) : element).reduce((accumulator, currentValue) => accumulator + currentValue),
                        fifth: data.data.three_charts_data.dataset9.map(element => typeof element === "string" ? parseInt(element, 10) : element).reduce((accumulator, currentValue) => accumulator + currentValue),
                    })

                    setOrdersDetailTwo({
                        colors: ['#b500af'],
                        chart: {
                            type: 'spline',
                            height: 258 // set the height here
                        },
                        title: {
                            text: '',
                            align: 'left'
                        },
                        xAxis: {
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            title: {
                                text: ''
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Total Revenue'
                            },
                            min: 0,
                            labels: {
                                formatter: function () {
                                    return '$' + Highcharts.numberFormat(this.value, 0, '.', ','); // Format labels with dollar sign and commas
                                }
                            }
                        },
                        tooltip: {
                            headerFormat: '<b>{series.name}</b><br>',
                            formatter: function () {
                                return '<span style="color:' + this.series.color + '">\u25CF</span> ' + this.series.name + ': <b>$' + Highcharts.numberFormat(this.y, 2, '.', ',') + '</b>';
                            }
                        },
                        plotOptions: {
                            series: {
                                marker: {
                                    enabled: true,
                                    radius: 2.5
                                }
                            }
                        },
                        series: [
                            {
                                name: 'Total Sales',
                                data: data.data.three_charts_data.dataset9.map(element => typeof element === "string" ? parseInt(element, 10) : element)
                            }
                        ]
                    })

                    console.log(data.data.three_charts_data.dataset9.map(element => typeof element === "string" ? parseInt(element, 10) : element))
                }
                setIsLoading(false);
            })
    }, [reload])

    return (
        <div style={{ background: `url('${window.appURL}/images/background.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ justifyContent: 'space-between', marginBottom: "30px", marginTop: "30px" }}>
                            <div style={{ display: "flex" }}>
                                <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> Dashboard</div>
                            </div>
                        </div>
                        <div style={{ display: "flex" }}>
                            <div>
                                <Select
                                    components={{
                                        Option: InputOption
                                    }}
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            width: "300px"
                                        })
                                    }}
                                    isMulti
                                    placeholder="Select Any Store..."
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    options={storesOptions}
                                    onChange={(e) => {
                                        setSelectedStore(e);
                                        setReload(!reload);
                                    }}
                                    value={selectedStore}
                                />

                            </div>

                            <div style={{ marginLeft: "10px" }}>
                                <div className="datePickerPopover">
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
                                            <div
                                                style={{
                                                    paddingTop: "20px",
                                                    borderTop: "1px solid #e1e3e5",
                                                    marginTop: "16px",
                                                    marginBottom: "0px",
                                                }}
                                            ></div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                }}
                                            >
                                                <div style={{ marginRight: "10px" }}>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedDates({
                                                                start: new Date(),
                                                                end: new Date(),
                                                            });
                                                            setDatePickerPopoverActive(
                                                                false
                                                            );
                                                            setFilter("all");
                                                            setReload(!reload);
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
                                                        setFilter("dates");
                                                        setReload(!reload);
                                                    }}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                        </div>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
                <div style={{ marginTop: "30px" }}></div>
                {
                    isLoading ? <Spinner accessibilityLabel="Spinner Dashboard" size="large" />
                        : <>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 5, sm: 5, md: 5, lg: 5, xl: 5 }}>
                                    <Card sectioned>
                                        <div style={{ display: "flex", justifyContent: "space-between", }}>
                                            <Text variant="headingLg" as="h5">
                                                No of Orders
                                            </Text>
                                            <Button plain onClick={() => router.get(route('orders'))}>View report</Button>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                                            <Text variant="headingXl" as="h4">
                                                {threeChartsCount && addCommasToNumber(threeChartsCount.first)}
                                            </Text>
                                        </div>
                                        {orderByMonths &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={orderByMonths}
                                            />
                                        }

                                    </Card>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 7, sm: 7, md: 7, lg: 7, xl: 7 }}>
                                    <Card sectioned>
                                        <div style={{ display: "flex", justifyContent: "space-between", }}>
                                            <Text variant="headingLg" as="h5">
                                                Total Revenue
                                            </Text>
                                            <Button plain onClick={() => router.get(route('orders'))}>View report</Button>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                                            <Text variant="headingXl" as="h4">
                                                {threeChartsCount && formatAmount(threeChartsCount.fifth)}
                                            </Text>
                                        </div>
                                        {ordersDetailTwo &&
                                            < HighchartsReact
                                                highcharts={Highcharts}
                                                options={ordersDetailTwo}
                                            />
                                        }
                                    </Card>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <Card sectioned>
                                        <div style={{ display: "flex", justifyContent: "space-between", }}>
                                            <Text variant="headingLg" as="h5">
                                                Top Collections
                                            </Text>
                                            <Button plain onClick={() => router.get(route('collections'))}>View report</Button>
                                        </div>

                                        {collectionOptions &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={collectionOptions}
                                            />
                                        }

                                    </Card>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <Card sectioned>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "" }}>
                                            <Text variant="headingLg" as="h5">
                                                Top Stores
                                            </Text>
                                        </div>

                                        {topStoresOptions &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={topStoresOptions}
                                            />
                                        }

                                    </Card>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <Card sectioned>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                                            <Text variant="headingLg" as="h5">
                                                Average Order Value
                                            </Text>
                                        </div>
                                        {averageOrderValue &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={averageOrderValue}
                                            />
                                        }

                                    </Card>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <Card sectioned>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                            <Text variant="headingLg" as="h5">
                                                Top Products
                                            </Text>
                                            <Button plain onClick={() => router.get(route('products'))}>View report</Button>
                                        </div>
                                        {topProductOptions &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={topProductOptions}
                                            />
                                        }

                                    </Card>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                    <Card sectioned>
                                        <Text variant="headingLg" as="h5">
                                            No of Products
                                        </Text>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                                            <Text variant="headingXl" as="h4">
                                                {threeChartsCount && threeChartsCount.second}
                                            </Text>
                                        </div>
                                        {orderByMonthsProducts &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={orderByMonthsProducts}
                                            />
                                        }

                                    </Card>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                    <Card sectioned>
                                        <Text variant="headingLg" as="h5">
                                            No of Collections
                                        </Text>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                                            <Text variant="headingXl" as="h4">
                                                {threeChartsCount && threeChartsCount.third}
                                            </Text>
                                        </div>

                                        {orderByMonthsCollections &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={orderByMonthsCollections}
                                            />
                                        }
                                    </Card>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                    <Card sectioned>
                                        <Text variant="headingLg" as="h5">
                                            No of Refunds
                                        </Text>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                                            <Text variant="headingXl" as="h4">
                                                {threeChartsCount && formatAmount(threeChartsCount.fourth)}
                                            </Text>
                                        </div>
                                        {noOfRefundsList &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={noOfRefundsList}
                                            />
                                        }

                                    </Card>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                    <Card sectioned>
                                        <Text variant="headingLg" as="h5">
                                            Order Details
                                        </Text>
                                        {ordersDetail &&
                                            < HighchartsReact
                                                highcharts={Highcharts}
                                                options={ordersDetail}
                                            />
                                        }
                                    </Card>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                    <Card sectioned>
                                        <Text variant="headingLg" as="h5">
                                            Top Customers
                                        </Text>
                                        {topCustomersGraph &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={topCustomersGraph}
                                            />
                                        }
                                    </Card>
                                </Grid.Cell>
                            </Grid>
                        </>

                }
            </Page>
        </div>
    );
}

Dashboard.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Dashboard;

