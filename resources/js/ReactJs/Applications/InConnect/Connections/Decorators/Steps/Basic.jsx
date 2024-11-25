import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import {
    Button,
    DatePicker,
    Grid,
    Popover,
    Tag,
    Text,
    TextField
} from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
// import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { setDecorator } from '@/ReactJs/reducers/InConnect/DecoratorSlice';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import Swal from 'sweetalert2';
import Toggle from '@/ReactJs/Components/ToggleSmall';

// import Table from "./DecoratorsTable";
function Basic({ intactVendors, intactLocations, intactDepartments, shopifyVendors }) {

    function getFormattedDate(dateString) {
        const date = new Date(dateString);
        const month = date.getMonth() + 1; // getMonth() returns 0-11, so we add 1
        const day = date.getDate();

        const formattedMonth = month < 10 ? '0' + month : month;
        const formattedDay = day < 10 ? '0' + day : day;

        return `${formattedMonth}-${formattedDay}`;
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero indexed
        const day = String(date.getDate()).padStart(2, '0');

        return `${month}-${day}-${year}`;
    }

    const dispatch = useDispatch();

    const decorator = useSelector(state => state.inConnectDecorator.decorator);

    const handleChange = (object) => {
        dispatch(setDecorator(object));
    }

    const intact_vendors = intactVendors.map((item) => {
        return {
            value: item.id,
            label: item.name
        }
    });

    const intact_locations = intactLocations.map((item) => {
        return {
            value: item.id,
            label: item.name
        }
    });

    const intact_departments = intactDepartments.map((item) => {
        return {
            value: item.id,
            label: item.name
        }
    });

    const shopify_vendors = shopifyVendors.map((item) => {
        return {
            value: item.id,
            label: item.name
        }
    });

    const removeTag = useCallback(
        (tag) => () => {
            handleChange({ ...decorator, excluded_dates: decorator.excluded_dates.filter((item) => item !== tag) })
        },
        [decorator],
    );

    const tagMarkup = decorator.excluded_dates.map((option, index) => (
        <span key={index} style={{ marginLeft: `${index == 0 ? '0px' : '5px'}` }}>
            <Tag key={option} onRemove={removeTag(option)}>
                {option}
            </Tag>
        </span>
    ));

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

    const activator = (
        <div className='selectDate'>
            <button type="button" onClick={setDatePickerTogglePopoverActive} style={{ padding: '3px 10px', background: '#fff', borderRadius: '4px', border: '1px solid #a2a2a2', boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.0915)' }}>
                {formatDate(selectedDates.start)}
            </button>
        </div>
    );

    const addTagHandler = () => {

        const check = getFormattedDate(formatDate(selectedDates.start));
        let noErrors = true;

        if (check.trim() == "") {

            noErrors = false;
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Date cannot be null.',
            })
        }

        if (decorator.excluded_dates.includes(check)) {

            noErrors = false;
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Same Date cannot be entered again.',
            })
        }

        if (noErrors == true) {
            let temp = [...decorator.excluded_dates];
            temp.push(check);

            handleChange({ ...decorator, excluded_dates: temp })
        }
    }

    useEffect(() => {
        setDatePickerPopoverActive(false);
    }, [selectedDates]);

    return (
        <div className='steps-div main-div'>
            {/* <div className='main-text mt-5'>
                <Text variant="headingLg" as="h6">
                    Decorators
                </Text>
            </div> */}
            <div className='mt-5'>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <Text variant="headingMd" as="h6">
                            <span className='cust-staric'>

                                Decorator Name
                            </span>
                        </Text>
                        <div className='mt-2'>
                            <TextField
                                onChange={(e) => handleChange({ ...decorator, name: e })}
                                value={decorator.name}
                                autoComplete="off"
                            />
                        </div>
                    </Grid.Cell>
                </Grid>
            </div>
            <div className='mt-5'>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                        <Text variant="headingMd" as="h6">
                            <span className='cust-staric'>
                                Intacct Vendor
                            </span>
                        </Text>
                        <div className='mt-2'>
                            <Select
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                className="basic-single"
                                classNamePrefix="select"
                                onChange={(e) => handleChange({ ...decorator, intact_vendor: e })}
                                value={decorator.intact_vendor}
                                options={intact_vendors}
                            />
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                        <Text variant="headingMd" as="h6">
                            <span className='cust-staric'>
                                Intacct Location
                            </span>
                        </Text>
                        <div className='mt-2'>
                            <Select
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                className="basic-single"
                                classNamePrefix="select"
                                onChange={(e) => handleChange({ ...decorator, intact_location: e })}
                                value={decorator.intact_location}
                                options={intact_locations}
                            />
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                        <Text variant="headingMd" as="h6">
                            <span className='cust-staric'>
                                Intacct Department
                            </span>
                        </Text>
                        <div className='mt-2'>
                            <Select
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                className="basic-single"
                                classNamePrefix="select"
                                onChange={(e) => handleChange({ ...decorator, intact_department: e })}
                                value={decorator.intact_department}
                                options={intact_departments}
                            />
                        </div>
                    </Grid.Cell>
                </Grid>
            </div>
            <div className='notes mt-5 mb-3 pt-2'>
                <Text variant="headingMd" as="h6">
                    Notes
                </Text>
                <div className='mt-2'>
                    <TextField
                        onChange={(e) => handleChange({ ...decorator, notes: e })}
                        value={decorator.notes}
                        multiline={5}
                        autoComplete="off"
                    />
                </div>
            </div>
            <div className='threads mt-5 pt-2 pb-5'>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div className="" >
                            <Text variant="headingMd" as="h6">
                                <span className='cust-staric'>


                                    PO Prefix
                                </span>
                            </Text>
                            <div className='mt-2'>
                                <TextField
                                    onChange={(e) => handleChange({ ...decorator, po_prefix: e })}
                                    value={decorator.po_prefix}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
            </div>
            <div className='thread pb-5'>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <Text variant="headingMd" as="h6">
                            <span className=''>
                                Exclusion Dates
                            </span>
                        </Text>
                        <div style={{ marginTop: "10px" }}>
                            <input type='checkbox' checked={decorator.sat_sun_exclude ? true : false} style={{ borderRadius: "3px", padding: "8px", marginRight: "10px" }} onChange={(e) => handleChange({ ...decorator, sat_sun_exclude: e.target.checked })}></input> Exclude All Saturday's and Sunday's
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div className='mt-2'>
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
                                        />
                                    </div>
                                </Popover>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <span className='ml-2 mt-2'><Button size='slim' onClick={addTagHandler} variant="primary">Add</Button></span>
                                <span style={{ marginLeft: "10px", marginTop: "11px" }}><div>Select Date and add below to exclude it</div></span>
                            </div>
                        </div>
                        <div className='mt-3'>
                            <div>
                                <div style={{ border: "1px solid #9fa4ac", minHeight: "70px", padding: "5px", borderRadius: "4px" }}>{tagMarkup}</div>
                            </div>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ width: "100%" }}>
                                <div className='mb-2'>
                                    <Text variant="headingMd" as="h6">
                                        <span className=''>
                                            Stock Vendors
                                        </span>
                                    </Text>
                                </div>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    options={shopify_vendors}
                                    onChange={(e) => {
                                        handleChange({ ...decorator, vendor_stocks: e })
                                    }}
                                    value={decorator.vendor_stocks}
                                    isMulti
                                    closeMenuOnSelect={false}
                                />
                            </div>
                            <div className='flex' style={{ marginLeft: "15px", marginTop: "40px" }}>
                                <Toggle toggled={decorator.vendor_stock_status ? true : false} onClick={(e) => {
                                    handleChange({ ...decorator, vendor_stock_status: e.target.checked })
                                }} />
                                <div className='mx-2' style={{ marginTop: "-1px" }}>
                                    <Text variant='headingSm' as='h6'>Status</Text>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
            </div>
        </div >
    );
}

Basic.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Basic;




