import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';


import { Button, DatePicker, Page, Popover } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useEffect, useState } from 'react';

function DatePickerGlobal(props) {

    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState("all");

    // const [ordersCount, setOrdersCount] = useState(0);
    // const [storesCount, setStoresCount] = useState(0);
    // const [vendorsCount, setVendorsCount] = useState(0);
    // const [productsCount, setProductsCount] = useState(0);

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
        <Popover
            labe
            active={datePickerPopoverActive}
            activator={activator}
            autofocusTarget="first-node"
            onClose={setDatePickerTogglePopoverActive}
        >
            <DatePicker
                month={month}
                year={year}
                onChange={setSelectedDates}
                onMonthChange={handleMonthChange}
                selected={selectedDates}
                allowRange 
            />
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
        </Popover>
    );
}

DatePickerGlobal.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default DatePickerGlobal;
