import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { router } from '@inertiajs/react';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Button as MuiButton, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import {
    Badge,
    Button,
    Card,
    ChoiceList,
    DataTable,
    DatePicker,
    Grid, Icon, IndexFilters,
    IndexTable,
    Link,
    Modal, Pagination,
    Popover,
    Select as ShopifySelect,
    SkeletonBodyText,
    Tag,
    Text,
    TextField,
    useIndexResourceState, useSetIndexFiltersMode
} from '@shopify/polaris';
import { ArrowLeftIcon, PlusCircleIcon, ReplayIcon, XCircleIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import LogsTable from './LogsTable';
import ShopifyOrderTable from './ShopifyOrderTable';
import MultiStepForm from './StepsProgress';
import VendorOrderTable from './VendorOrderTable';

function OrdersTable({ }) {

    // ST-36
    function standardIntact(inputString) {
        return inputString
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const customStyles = {
        control: (provided) => ({
            ...provided,
            height: '36px', // Change this value to adjust the height
            minHeight: '36px', // Ensures the height is not less than this value
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    };

    const queryString = window.location.href.split('?')[1];
    const params = new URLSearchParams(queryString);

    const type = params.get("type");
    const vendorId = params.get("vendor_id");
    const decoratorId = params.get("decorator_id");
    const start = params.get("start");
    const end = params.get("end");
    const userId = params.get("user_id");
    const by = params.get("by");
    const order_status_type = params.get("order_status_type");
    const on_hold = params.get("on_hold");
    const unsynced_orders = params.get("unsynced_orders");

    function truncateString(str) {
        if (str.length <= 80) {
            return str;
        } else {
            return str.substring(0, 80) + "...";
        }
    }

    const [order, setOrder] = useState(false);

    const [fraud, setFraud] = useState(false);

    let timeout = null;

    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const [pageCount, setPageCount] = useState("10");

    const [tableRows, setTableRows] = useState([]);

    const [selected, setSelected] = useState(on_hold || by || unsynced_orders ? 1 : 0);
    const [itemStrings, setItemStrings] = useState(on_hold ? ['All', 'On Hold'] : by ? ['All', 'Specific'] : unsynced_orders ? ['All', standardIntact(unsynced_orders)] : ['All']);
    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions: []
    }));

    const promotedBulkActions = [
        {
            content: 'Restart Process',
            onAction: () => {
                restartOrders();
            },
        },
        {
            content: 'Export CSV',
            onAction: () => {
                ExportOrders();
            },
        },
        {
            content: 'Archive',
            onAction: () => {
                ArchiveOrders();
            },
        }
    ];

    const ExportOrders = () => {
        const shops = searchShops.length > 0 ? JSON.stringify(searchShops) : null;
        const formData = new FormData();
        formData.append('orders_ids', JSON.stringify(selectedResources));
        formData.append('search_query', JSON.stringify(myUrl.search));
        formData.append('store_ids', shops);
        formData.append('all_check', allResourcesSelected);
        fetch(route("ic_orders.export"), {
            method: 'POST',
            body: formData,
        }).then((response) => response.json())
            .then((data) => {
                if (data.success == true) {
                    window.location.href = '/goosely/orders/download';
                    handleSelectionChange('all', false)
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const ArchiveOrders = () => {

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                const shops = searchShops.length > 0 ? JSON.stringify(searchShops) : null;
                const formData = new FormData();
                formData.append('orders_ids', JSON.stringify(selectedResources));
                formData.append('search_query', JSON.stringify(myUrl.search));
                formData.append('store_ids', shops);
                formData.append('all_check', allResourcesSelected);
                fetch(route("ic_orders.archive"), {
                    method: 'POST',
                    body: formData,
                }).then((response) => response.json())
                    .then((data) => {
                        if (data.success == true) {
                            setReload(!reload);
                            handleSelectionChange('all', false);
                            Swal.fire({
                                title: 'Success',
                                text: data.message,
                                icon: 'success',
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        });
    }

    const restartOrders = () => {

        Swal.fire({
            title: "Are you sure?",
            text: "Selected orders will be Restarted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Restart!"
        }).then((result) => {
            if (result.isConfirmed) {
                const shops = searchShops.length > 0 ? JSON.stringify(searchShops) : null;
                const formData = new FormData();
                formData.append('orders_ids', JSON.stringify(selectedResources));
                formData.append('search_query', JSON.stringify(myUrl.search));
                formData.append('store_ids', shops);
                formData.append('all_check', allResourcesSelected);
                fetch(route("ic_orders.restart"), {
                    method: 'POST',
                    body: formData,
                }).then((response) => response.json())
                    .then((data) => {
                        if (data.success == true) {
                            setReload(!reload);
                            handleSelectionChange('all', false);
                            Swal.fire({
                                title: 'Success',
                                text: data.message,
                                icon: 'success',
                                showConfirmButton: false,
                                timer: 1500
                            });
                            setReload(!reload);
                            handleSelectionChange('all', false);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        });
    }

    const sortOptions = [
        { label: 'Id', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);
    const [queryValue, setQueryValue] = useState("");
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [pagination, setPagination] = useState({
        path: route("ic_orders.list"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");
    const [reload, setReload] = useState(false);
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);
    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const [shops, setShops] = useState([]);
    const [searchShops, serSearchShops] = useState([]);

    const [selectedStore, setSelectedStore] = useState(false);

    const [selectedOrderId, setSelectedOrderId] = useState(false);

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
    const [filter, setFilter] = useState(false);

    var date = new Date(selectedDates['start']);
    var enddate = new Date(selectedDates['end']);

    const monthArr = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const myStartDate = date.getDate() + " " + monthArr[date.getMonth()] + " " + date.getFullYear();
    const myEndDate = enddate.getDate() + " " + monthArr[enddate.getMonth()] + " " + enddate.getFullYear();
    const dateRange = `${myStartDate} - ${myEndDate}`;


    const activator = (
        <div className='selectDate'>
            <Button fullWidth onClick={setDatePickerTogglePopoverActive} disclosure>
                {filter == "dates" ? dateRange : "Select Date"}
            </Button>
        </div>
    );

    function formatDateToYMD(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        var day = String(date.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    function formatDateToYMDString(dateString) {
        var date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Invalid date string, returning null or throw an error as per requirement
            return null;
        }

        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        var day = String(date.getDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    function convertISOToYMD(isoDateString) {
        var date = new Date(Date.parse(isoDateString));

        var year = date.getUTCFullYear();
        var month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
        var day = String(date.getUTCDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    function convertIsoToCustomFormat(isoString) {
        const date = new Date(isoString);

        // Extract date components
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        // Construct the final string
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const [manualUser, setManualUser] = useState(false);
    const [manualLogs, setManualLogs] = useState(false);

    const orderClickHandle = async (e, id) => {
        setManualUser(false);
        setManualLogs(false);
        let response = await fetch(route('ic_orders.show', id));
        let data = await response.json();
        if (data.success) {
            let order = data.data;
            order.shopify_order.line_items.forEach((item, index) => {
                let batched_order = false;
                if (order.batched_order)
                    batched_order = order.batched_order.batch.batch_setting.vendor.name == item.vendor

                if (batched_order) {
                    item.batched = true;
                } else {
                    item.batched = false;
                }
            })
            setOrder(order);
            setFraud(data.data2);
            if (order.manual_user) {
                let manualLogs = order.updates?.filter(value => value.manual_complete == 1) || []
                let manualNote = { id: order.id, completed_at: order.manual_date, manual_log: order.manual_note }
                manualLogs.unshift(manualNote);
                manualLogs.unshift({ id: 23084902348, completed_at: order.manual_date, manual_log: order.manual_user.name + ' has manually completed below processes' });
                setManualUser(order.manual_user);
                setManualLogs(manualLogs);
            }
        }
    }

    const declineFraud = async (id) => {
        let response = await fetch(route('decline_fraud', id));
        let data = await response.json();
        console.log(data);
        if (data.success) {
            setActiveTwo(false);
            setFraud(false);
            setReload(!reload);
        }
    }

    const restartOrder = async () => {

        const formData = new FormData();
        formData.append('order_id', order.id);
        formData.append('type', "FRAUD");
        let response = await fetch(route("order_reinitiate"), {
            method: 'POST',
            body: formData,
        });
        let data = await response.json();
        console.log(data);
        if (data.success) {
            setActiveTwo(false);
            setFraud(false);
            setReload(!reload);
        }
    }

    useEffect(() => {

        let url = new URL(pagination.path);

        url.searchParams.set('page_count', pageCount);

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (selected == 0) {
            url.searchParams.delete('type');
            url.searchParams.delete('vendor_id');
            url.searchParams.delete('decorator_id');
            url.searchParams.delete('status');
            url.searchParams.delete('start');
            url.searchParams.delete('end');
            url.searchParams.delete('user_id');
        } else if (selected > 0) {
            if (on_hold) {
                url.searchParams.set('on_hold', true);
            } else if (unsynced_orders) {
                url.searchParams.set('unsynced_orders', unsynced_orders);
            } else {
                url.searchParams.set('type', by);
                url.searchParams.set(by == 'vendor' ? 'vendor_id' : 'decorator_id', by == 'vendor' ? vendorId : decoratorId);
                url.searchParams.set('status', type);
            }
            url.searchParams.set('start_date', formatDateToYMDString(start));
            url.searchParams.set('end_date', formatDateToYMDString(end));
            userId ? url.searchParams.set('user_id', userId) : null;
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        if (order_status_type != undefined) {
            url.searchParams.set('order_status_type', order_status_type)
        } else {
            url.searchParams.delete('order_status_type');
        }

        if (sortSelected != "") {
            url.searchParams.set('sort', sortSelected[0])
        } else {
            url.searchParams.delete('sort');
        }

        if (searchShops.length != 0) {
            url.searchParams.set('q2', JSON.stringify(searchShops));
        } else {
            url.searchParams.delete('q2');
        }

        if (filter == "dates" && selected == 0) {
            url.searchParams.set('filter', filter);
            url.searchParams.set('dates', JSON.stringify({ start: formatDateToYMD(selectedDates.start), end: formatDateToYMD(selectedDates.end) }));
        } else {
            url.searchParams.delete('filter');
            url.searchParams.delete('dates');
        }

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((order, index) => {
                        // console.log(order);
                        my_rows.push(
                            {
                                id: order.id,
                                date_connected: convertISOToYMD(order.created_at),
                                store: order.user?.store_name ? order?.user?.store_name : order?.user?.name,
                                customer: order.shopify_customer_name,
                                order: <span className='order-table-code-cc-inco'><img src={`${window.appURL}/images/orders-cc-inco.png`} /><a onClick={(e) => { setActive(true); orderClickHandle(e, order.id) }}>{order.shopify_order_name ? order.shopify_order_name : order.shopify_order_no}</a></span>,
                                status: order.status,
                                fulfillment_status: order.fulfillment_status == "fulfilled" ? (
                                    <Badge progress="complete" tone='success'>
                                        Fulfilled
                                    </Badge>
                                ) : (
                                    <Badge progress="incomplete" tone='attention'>
                                        Unfulfilled
                                    </Badge>
                                ),
                                vendor: order.vendor_purchase_orders.length > 0 ? <div className='orders-cc-inco-tags'> {order.vendor_purchase_orders.map((item, index) => (
                                    <span key={index}> <Tag>{item.vendor ? (item.vendor.name ?? '') : ''}</Tag> </span>
                                ))} </div> : order.vendor ? <div className='orders-cc-inco-tags'>  <Tag>{order?.vendor?.name ?? ''}</Tag></div> : '-',
                                vendor_po: order.vendor_purchase_orders.length > 0 ? order.vendor_purchase_orders.map((item, index2, array) => (
                                    (index2 === array.length - 1) ? item.purchase_order_no : item.purchase_order_no + ' || '
                                )) : order.vendor_order_id ? order.vendor_order_id : '-',
                                decorator: order.decorator ? <div className='orders-cc-inco-tags'>  <Tag>{order?.decorator?.name ?? ''}</Tag></div> : '-',
                                decorator_po: order.decorator_order_id ? order.decorator_order_id : '-',
                                intacct_vendor_po: order.vendor_purchase_orders.length > 0 ? order.vendor_purchase_orders.map((item, index2, array) => (
                                    item.intact_po_number?.replace(/Purchase Order-/g, '') ?
                                        (item.intact_po_number?.replace(/Purchase Order-/g, '') + (index2 !== array.length - 1 ? ' || ' : '')) : ''
                                )) : order.vendor_intacct_order_id ? order.vendor_intacct_order_id.replace(/Purchase Order-/g, '') : '-',
                                intacct_decorator_po: order.decorator_intacct_order_id ? order.decorator_intacct_order_id.replace(/Purchase Order-/g, '') : '-',
                                fraud_status: <>
                                    <Button size='slim' disabled={
                                        order.fraud_status == "NO_FRAUD" ? true : false
                                    } primary={
                                        order.fraud_status == "APPROVED" ? true : false
                                    } destructive={
                                        order.fraud_status == "FRAUD" || order.fraud_status == "DECLINED" ? true : false
                                    } outline={
                                        order.fraud_status == "DECLINED" ? true : false
                                    } onClick={(e) => {
                                        if (order.fraud_status == "FRAUD") {
                                            orderClickHandle(e, order.id)
                                            setActiveTwo(true);
                                        }
                                    }}>
                                        {order.fraud_status == "NO_FRAUD" ? (order.user.inconnect_account.fraud_statuses.low || order.user.inconnect_account.fraud_statuses.medium || order.user.inconnect_account.fraud_statuses.high ? 'Low Priority' : 'Not Enabled') : order.fraud_status == "FRAUD" ? <b>Fraud Alert</b> : order.fraud_status == "APPROVED" ? <b>Authorized</b> : order.fraud_status == "DECLINED" ? <b>{'\u00A0'}Dismissed{'\u00A0'}</b> : null}
                                    </Button>
                                    <span style={{ marginLeft: "10px" }} />
                                </>,
                                original_order: order,
                                batch_status: order.batch_status,
                                batch_name: order.batched_order?.batch.batch_setting.batch_name,
                            }
                        );
                    });

                    setShops(result.data2.map((item, index) => {
                        return {
                            value: item.id,
                            label: item.store_name ? item.store_name : item.name
                        }
                    }));

                    setTableRows(my_rows);
                    setPagination({
                        path: result.data.path,
                        next_cursor: result.data.next_cursor,
                        next_page_url: result.data.next_page_url,
                        prev_cursor: result.data.prev_cursor,
                        prev_page_url: result.data.prev_page_url,
                    });
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });

    }, [reload])

    useEffect(() => {
        setReload(!reload);
    }, [sortSelected]);

    useEffect(() => {
        if (selected == 0) {
            setItemStrings(['All']);
            setReload(!reload);
        }
    }, [selected]);

    const handleFiltersQueryChange = useCallback(
        (value) => {
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleSearchShopsChange = useCallback(
        (value) => {
            serSearchShops(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchShopsRemove = useCallback(() => { serSearchShops([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchShopsRemove();
    }, [
        handleQueryValueRemove,
        handleSearchShopsRemove
    ]);

    const filters = [
        {
            key: "filterbyshop",
            label: "Filter by Shop",
            filter: (
                <ChoiceList
                    title="Shop"
                    titleHidden
                    choices={shops}
                    selected={searchShops || []}
                    onChange={handleSearchShopsChange}
                    allowMultiple
                />
            ),
            // shortcut: true,
        }
    ];

    const appliedFilters = [];

    if (!isEmpty(searchShops)) {
        const key = "filterbyshop";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchShops),
            onRemove: handleSearchShopsRemove,
        });
    }

    const rowMarkup = tableRows.map(
        ({ id, date_connected, store, customer, order, status, fulfillment_status, vendor, vendor_po, decorator, decorator_po, intacct_vendor_po, intacct_decorator_po, fraud_status, original_order, batch_status, batch_name }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <div className='custom_style more_styles custom_width'>
                        <Link
                            dataPrimaryLink
                        >
                            {order}
                        </Link>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {
                        original_order.is_archived ?
                            <Badge progress="complete" tone=''>{"\u00A0"}Archived{"\u00A0"} </Badge> :
                            original_order.manual_user ?
                                <Badge progress="incomplete" tone='warning'>{"\u00A0"}Manual{"\u00A0"} </Badge> :
                                (status == "success" ?
                                    <Badge progress="complete" tone='success'>{"\u00A0"}Normal{"\u00A0"} </Badge> :
                                    <Button size='slim' variant='primary' onClick={() => {
                                        setSelectedOrderId(id);
                                        setActiveFive(true);
                                        setManualNote("");
                                    }}>Resolve</Button>)
                    }
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="center"  >
                        <Tooltip title="Click to view order logs">
                            <IconButton onClick={() => router.get(route('ic_logs.index', { trace: 'InconnectOrder', trace_id: id }))} style={{ padding: "0px" }}>
                                {status == 'error' && <CancelIcon color='error' fontSize='small' />}
                                {status == 'warning' && <ErrorIcon color='warning' fontSize='small' />}
                                {status == 'success' && <CheckCircleIcon color='success' fontSize='small' />}
                            </IconButton>
                        </Tooltip>
                    </Text>
                </IndexTable.Cell>
                {order_status_type &&
                    <IndexTable.Cell>
                        <Button size='slim' onClick={() => editOrderHandler(original_order)}>Resolve</Button>
                    </IndexTable.Cell>
                }
                <IndexTable.Cell>
                    {fraud_status}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {batch_name ?? 'N/A'}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {!batch_status ? 'N/A' : batch_status == "unfulfilled" ? <Badge progress="complete" tone='critical'>unfulfilled</Badge> : batch_status == "fulfilled" ? <Badge progress="complete" tone='success'>fulfilled</Badge> : null}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {store}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {customer}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {date_connected}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {fulfillment_status}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {vendor}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {vendor_po}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {intacct_vendor_po}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {decorator}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {decorator_po}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {intacct_decorator_po}
                </IndexTable.Cell>
            </IndexTable.Row >
        ),
    );

    const [active, setActive] = useState(false);

    const [activeTwo, setActiveTwo] = useState(false);

    const [activeThree, setActiveThree] = useState(false);
    const [activeThreeLoading, setActiveThreeLoading] = useState(false);

    const [activeFive, setActiveFive] = useState(false);
    const [activeFiveLoading, setActiveFiveLoading] = useState(false);
    const [manualNote, setManualNote] = useState("");

    const [activeFourLoading, setActiveFourLoading] = useState(false);
    const [activeFour, setActiveFour] = useState(false);
    const [shopifyOrder, setShopifyOrder] = useState(false);
    const [propertyNames, setPropertyNames] = useState([]);
    const [activeFourDoneLoading, setActiveFourDoneLoading] = useState(false);

    const restartOrderHandler = (order) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to restart the process!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, restart it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append('orders_ids', JSON.stringify([order.id]));
                formData.append('search_query', JSON.stringify(myUrl.search));
                formData.append('store_ids', shops);
                formData.append('all_check', false);
                fetch(route("ic_orders.restart"), {
                    method: 'POST',
                    body: formData,
                }).then((response) => response.json())
                    .then((data) => {
                        if (data.success) {
                            Swal.fire({
                                title: 'Success',
                                text: data.message,
                                icon: 'success',
                                showConfirmButton: false,
                                timer: 1500
                            }).then(() => {
                                setReload(!reload);
                                handleSelectionChange('all', false);
                            });
                        } else {
                            Swal.fire({ title: 'Error!', text: data.message, icon: 'error' });
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        })
    }


    const [tab, setTab] = useState('shopify_order');

    const handleTabChange = (event, value) => {
        setTab(value);
    };

    const placeShopifyOrderHandler = () => {
        // Check if selectedStore is valid
        if (!selectedStore || !selectedStore.value) {
            Swal.fire({
                title: "Error!",
                text: "Please select a valid store before proceeding.",
                icon: "error"
            });
            return; // Exit the function if selectedStore is invalid
        }

        setActiveThreeLoading(true);

        async function getData() {
            try {
                let response = await fetch(`${route('ic_sync_prev_orders')}?user_id=${selectedStore.value}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                let result = await response.json();

                if (result.success) {
                    Swal.fire({
                        title: "Success!",
                        text: result.message,
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    setActiveThree(false);
                    setActiveThreeLoading(false);
                    setSelectedStore(false);
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: result.message,
                        icon: "error"
                    });
                    setActiveThreeLoading(false);
                }
            } catch (error) {
                Swal.fire({
                    title: "Error!",
                    text: error.message || "Something went wrong. Please try again.",
                    icon: "error"
                });
                setActiveThreeLoading(false);
            }
        }

        getData();
    };

    let headingsGeneral = [
        { title: 'Order' },
        { title: 'Process' },
        { title: 'Status' },
        { title: 'Fraudulent' },
        { title: 'Batch Name' },
        { title: 'Batch Status' },
        { title: 'Store' },
        { title: 'Customer' },
        { title: 'Order Date' },
        { title: 'Fulfillment Status' },
        { title: 'Vendor' },
        { title: 'Vendor PO' },
        { title: 'Vendor Intacct PO' },
        { title: 'Decorator' },
        { title: 'Decorator PO' },
        { title: 'Decorator Intacct PO' }
    ];

    const editOrderHandler = async (original_order) => {
        setActiveFourLoading(true);
        setActiveFour(original_order);
        const formData = new FormData();
        formData.append('user_id', original_order.user_id);
        formData.append('order_id', original_order.shopify_order_id);
        let response = await fetch(route("getEditOrder"), {
            method: 'POST',
            body: formData,
        });
        let data = await response.json();
        console.log(data);
        setActiveFourLoading(false);
        if (data.success) {
            setPropertyNames(data.data2)
            setShopifyOrder(data.data);
        } else {
            setActiveFour(false);
            Swal.fire({
                title: "Error!",
                text: data.message,
                icon: "error",
                showConfirmButton: false,
                timer: 1500
            })
        }
    }

    const updateOrderHandler = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#25b84b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, update it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                setActiveFourDoneLoading(true);
                let response = await fetch(route("updateOrder"), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ order: shopifyOrder, user_id: activeFour.user_id, order_id: activeFour.shopify_order_id })
                });
                let data = await response.json();
                console.log(data);
                setActiveFourDoneLoading(false);
                if (data.success) {
                    setActiveFour(false);
                    setPropertyNames(false);
                    setShopifyOrder(false);
                    Swal.fire({
                        title: "Success!",
                        text: data.message,
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500
                    })
                } else {
                    Swal.fire({
                        title: "Error!",
                        text: data.message,
                        icon: "error",
                    })
                }
            }
        });
    }

    if (order_status_type) {
        headingsGeneral.splice(2, 0, { title: 'Resolve Order' });
    }

    const completeOrderManually = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#25b84b",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Complete Manually!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                setActiveFiveLoading(true);
                try {
                    let response = await fetch(route("completeOrderManually"), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ order_id: id, manual_note: manualNote })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                        Swal.fire("Error!", response.status, "error");
                    }

                    let data = await response.json();

                    console.log(data);
                    setActiveFive(false);
                    setActiveFiveLoading(false);
                    handleSelectionChange('all', false);
                    setReload(!reload);
                    Swal.fire({
                        title: 'Success',
                        text: data.message,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500
                    });
                } catch (error) {
                    console.error('Error:', error);
                    Swal.fire("Error!", error, "error");
                }

            }
        });
    }

    return (
        <div>
            <Modal
                open={activeTwo}
                onClose={() => {
                    setActiveTwo(false);
                    setFraud(false);
                }}
                title="Fraud Analysis"
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: () => {
                            setActiveTwo(false);
                            setFraud(false);
                        },
                    },
                ]}
            >
                <Modal.Section>
                    <div>
                        {fraud ? fraud.risk.assessments[0].facts.map((value, index) => (
                            <div key={index} style={{ marginBottom: "15px" }}><Badge status={value.sentiment == "NEGATIVE" ? 'critical' : value.sentiment == "NEUTRAL" ? '' : value.sentiment == "POSITIVE" ? 'success' : null}>{value.sentiment == "NEGATIVE" ? 'Danger' : value.sentiment == "NEUTRAL" ? 'Factual' : value.sentiment == "POSITIVE" ? 'Success' : null}</Badge><span style={{ marginLeft: "10px" }}>{truncateString(value.description)}</span></div>
                        )) : <SkeletonBodyText lines={16} />}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: "5px", marginTop: "20px" }}>
                        <Button size='slim' variant="primary" onClick={restartOrder}>Approve</Button><span style={{ marginLeft: "10px" }}></span>
                        <Button size='slim' tone="critical" outline onClick={() => declineFraud(fraud.legacyResourceId)}>Decline</Button>
                    </div>
                </Modal.Section>
            </Modal>
            <Modal
                size="small"
                open={activeFive}
                onClose={() => {
                    setActiveFive(false);
                    setFraud(false);
                }}
                title="Order Manual Completion"
                primaryAction={[
                    {
                        content: 'Mark as Completed',
                        onAction: () => {
                            completeOrderManually(selectedOrderId);
                        },
                        loading: activeFiveLoading
                    },
                ]}
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: () => {
                            setActiveFive(false);
                        },
                    },
                ]}
            >
                <Modal.Section>
                    <TextField
                        placeholder='Enter Completion Note'
                        type='text'
                        value={manualNote}
                        onChange={(e) => setManualNote(e)}
                        multiline={3}
                    />
                </Modal.Section>
            </Modal>
            <Modal
                size="large"
                open={activeFour}
                onClose={() => {
                    setActiveFour(false);
                }}
                title="Shopify Order"
                primaryAction={[
                    {
                        content: 'Place Idex Order',
                        onAction: () => {
                            updateOrderHandler();
                        },
                        loading: activeFourDoneLoading
                    },
                ]}
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: () => {
                            setActiveFour(false);
                        },
                    },
                ]}
            >
                <Modal.Section>
                    {activeFourLoading ? <SkeletonBodyText lines={16} /> :
                        (shopifyOrder &&
                            <div>
                                {/* {JSON.stringify(shopifyOrder.line_items)} */}
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                        <div style={{ fontWeight: "600", marginTop: "6px" }}> Order ID: <span style={{ fontWeight: "400" }}>{shopifyOrder.id}</span> </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                        <div style={{ fontWeight: "600", marginTop: "6px" }}> Order Date <span style={{ fontWeight: "400" }}>{shopifyOrder.created_at}</span> </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                        <div style={{ fontWeight: "600", marginTop: "6px" }}> Customer: <span style={{ fontWeight: "400" }}>{shopifyOrder.customer.first_name + " " + shopifyOrder.customer.last_name}</span> </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                        <div style={{ fontWeight: "600", marginTop: "6px" }}> Email: <span style={{ fontWeight: "400" }}>{shopifyOrder.contact_email}</span> </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                        <div style={{ fontWeight: "600", marginTop: "6px" }}> Financial Status: <span style={{ fontWeight: "400" }}>{shopifyOrder.financial_status}</span> </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                        <div style={{ fontWeight: "600", marginTop: "6px" }}> Fulfillment Status: <span style={{ fontWeight: "400" }}>{shopifyOrder.fulfillment_status ? shopifyOrder.fulfillment_status : 'N/A'}</span> </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                        <div style={{ fontWeight: "600", marginTop: "6px" }}> Line Items: </div>

                                        {shopifyOrder.line_items.map((item, index) =>
                                            <div key={index} style={{ marginBottom: "20px", marginTop: index == 0 ? "15px" : "0px" }}>
                                                <Card>
                                                    <Grid key={index}>
                                                        <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                                            <div style={{ fontWeight: "600", marginTop: "6px" }}> Name <span style={{ fontWeight: "400" }}>{item.name}</span> </div>
                                                        </Grid.Cell>
                                                        <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                                            <div style={{ fontWeight: "600", marginTop: "6px" }}> Line Item ID: <span style={{ fontWeight: "400" }}>{item.id}</span> </div>
                                                        </Grid.Cell>
                                                        <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                                            <div style={{ fontWeight: "600", marginTop: "6px" }}> Price: <span style={{ fontWeight: "400" }}>{item.price}</span> </div>
                                                        </Grid.Cell>
                                                        <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                                            <div style={{ fontWeight: "600", marginTop: "6px" }}> Quantity: <span style={{ fontWeight: "400" }}>{item.quantity}</span> </div>
                                                        </Grid.Cell>
                                                        <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                                            <div style={{ fontWeight: "600", marginTop: "6px" }}> SKU: <span style={{ fontWeight: "400" }}>{item.sku}</span> </div>
                                                        </Grid.Cell>
                                                        <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                                            <div style={{ fontWeight: "600", marginTop: "6px" }}> Weight: <span style={{ fontWeight: "400" }}>{item.grams} Grams</span> </div>
                                                        </Grid.Cell>
                                                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                                            <div style={{ fontWeight: "600", marginTop: "6px" }}> Properties: </div>
                                                            <div style={{ border: "2px dashed #b2b2b2", borderRadius: "3px", padding: "10px 20px 20px 20px", marginTop: "10px" }}>
                                                                {item.properties.map((prop, indexTwo) => (
                                                                    <div key={indexTwo} style={{ marginBottom: "10px" }}>
                                                                        <div style={{ fontWeight: "600", marginTop: "6px" }}> {prop.name} </div>
                                                                        <div style={{ marginTop: "6px" }}> {prop.value} </div>
                                                                    </div>
                                                                ))}
                                                                <div>
                                                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                        <div style={{ fontWeight: "600" }}>Custom Properties:</div>
                                                                        <div style={{ width: "20px", height: "20px", cursor: "pointer" }}>
                                                                            <PlusCircleIcon onClick={() => {
                                                                                let tempshopifyOrder = { ...shopifyOrder };
                                                                                if (typeof tempshopifyOrder.line_items[index].custom_properties === 'undefined') {
                                                                                    tempshopifyOrder.line_items[index].custom_properties = [];
                                                                                }
                                                                                tempshopifyOrder.line_items[index].custom_properties.push({ selected_property_name: false, selected_property_value: '' });
                                                                                setShopifyOrder({ ...tempshopifyOrder });
                                                                            }} />
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ border: "1px solid #b4b4b4", padding: "10px", borderRadius: "5px", marginTop: "10px" }}>
                                                                        <div style={{ display: "flex", fontWeight: "600" }}>
                                                                            <div style={{ width: "49%" }}>
                                                                                Property Name
                                                                            </div>
                                                                            <div style={{ width: "49%" }}>
                                                                                Property Value
                                                                            </div>
                                                                        </div>
                                                                        {typeof item.custom_properties !== 'undefined' && item.custom_properties.map((cusProp, indexThree) => (
                                                                            <div key={indexThree} style={{ display: "flex", width: "100%", marginTop: indexThree == 0 ? "5px" : "10px" }}>
                                                                                <div style={{ width: "100%", marginRight: "12px" }}>
                                                                                    <Select
                                                                                        menuPortalTarget={document.body}
                                                                                        styles={customStyles}
                                                                                        options={propertyNames}
                                                                                        value={cusProp.selected_property_name}
                                                                                        placeholder="Select Property Name"
                                                                                        onChange={(e) => {
                                                                                            let tempshopifyOrder = { ...shopifyOrder };
                                                                                            tempshopifyOrder.line_items[index].custom_properties[indexThree].selected_property_name = e;
                                                                                            setShopifyOrder({ ...tempshopifyOrder });
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <div style={{ width: "100%", marginRight: "10px" }}>
                                                                                    <TextField placeholder='Enter Property Value' type='text' value={cusProp.selected_property_value} onChange={(e) => {
                                                                                        let tempshopifyOrder = { ...shopifyOrder };
                                                                                        tempshopifyOrder.line_items[index].custom_properties[indexThree].selected_property_value = e;
                                                                                        setShopifyOrder({ ...tempshopifyOrder });
                                                                                    }} />
                                                                                </div>
                                                                                <div style={{ width: "45px", marginTop: "7px", cursor: "pointer" }}><XCircleIcon onClick={() => {
                                                                                    let tempshopifyOrder = { ...shopifyOrder };
                                                                                    tempshopifyOrder.line_items[index].custom_properties.splice(indexThree, 1);
                                                                                    setShopifyOrder({ ...tempshopifyOrder });
                                                                                }} /></div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Grid.Cell>
                                                    </Grid>
                                                </Card>
                                            </div>
                                        )}

                                    </Grid.Cell>
                                </Grid>

                            </div>
                        )
                    }
                </Modal.Section>
            </Modal>
            <Modal
                open={activeThree}
                onClose={() => {
                    setActiveThree(false);
                }}
                title="Sync Orders"
                primaryAction={[
                    {
                        content: 'Sync',
                        onAction: () => {
                            placeShopifyOrderHandler();
                        },
                        loading: activeThreeLoading
                    },
                ]}
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: () => {
                            setActiveThree(false);
                        },
                    },
                ]}
            >
                <Modal.Section>
                    <div>
                        <div style={{ fontSize: "15px", marginBottom: "3px" }}>Store</div>
                        <Select
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            value={selectedStore}
                            options={shops}
                            placeholder="Select Shopify Store"
                            onChange={(e) => setSelectedStore(e)}
                        />
                    </div>
                </Modal.Section>
            </Modal>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                    <div style={{ display: "flex", justifyContent: 'space-between' }}>
                        <div style={{ display: "flex" }}>
                            <div onClick={() => router.get(route('ic_index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                            <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Orders </div>
                        </div>
                        <div className='orders-cc-in-printsave' style={{ display: "flex" }}>
                            <div className='flex justify-between'>
                                <div style={{ marginRight: "10px" }}>
                                    <Button variant="primary" onClick={() => {
                                        setFilter(false);
                                        setSelectedDates({
                                            start: new Date(),
                                            end: new Date(),
                                        });
                                        setReload(!reload);
                                    }}>Reset</Button>
                                </div>
                                <div className="datePickerPopover" style={{ marginRight: "10px" }}>
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
                                                            setFilter(false);
                                                            setReload(!reload);
                                                        }}
                                                    >
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
                            <ShopifySelect
                                labelInline
                                label="Rows:"
                                options={pageOptions}
                                value={pageCount}
                                onChange={handlePageCount}
                            />
                            <div style={{ marginLeft: "10px" }}>
                                <MuiButton variant="contained" color='primary' style={{ textTransform: "capitalize", backgroundColor: "rgb(65, 95, 255)" }} onClick={() => setActiveThree(true)}>Sync Orders</MuiButton>
                            </div>
                        </div>
                    </div>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                    <Card>
                        <IndexFilters
                            sortOptions={sortOptions}
                            sortSelected={sortSelected}
                            queryValue={queryValue}
                            queryPlaceholder="Searching all orders"
                            onQueryChange={handleFiltersQueryChange}
                            onQueryClear={handleQueryValueRemove}
                            onSort={setSortSelected}
                            cancelAction={{
                                onAction: onHandleCancel,
                                disabled: false,
                                loading: false,
                            }}
                            tabs={tabs}
                            selected={selected}
                            onSelect={setSelected}
                            canCreateNewView={false}
                            filters={filters}
                            appliedFilters={appliedFilters}
                            onClearAll={handleFiltersClearAll}
                            mode={mode}
                            setMode={setMode}
                            loading={loading}
                        />
                        <IndexTable
                            resourceName={resourceName}
                            itemCount={tableRows.length}
                            selectedItemsCount={
                                allResourcesSelected ? 'All' : selectedResources.length
                            }
                            onSelectionChange={handleSelectionChange}
                            headings={headingsGeneral}
                            promotedBulkActions={promotedBulkActions}
                            hasMoreItems
                            selectable={true}
                        >
                            {rowMarkup}
                        </IndexTable>
                    </Card>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px', paddingBottom: '22px' }}>
                        <Pagination hasNext={pagination.next_cursor ? true : false} hasPrevious={pagination.prev_cursor ? true : false} onNext={() => {
                            setPagination({
                                ...pagination,
                                path: pagination.next_page_url
                            })
                            setCurrentCursor(pagination.next_cursor);
                            setReload(!reload);
                        }} onPrevious={() => {
                            setPagination({
                                ...pagination,
                                path: pagination.prev_page_url
                            })
                            setCurrentCursor(pagination.prev_cursor);
                            setReload(!reload);
                        }} />


                    </div>
                </Grid.Cell>
            </Grid>
            <Modal
                size="large"
                open={active}
                onClose={() => setActive(false)}
                title={'\u00A0'}
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: () => setActive(false),
                    },
                ]}
            >
                <Modal.Section>
                    {!order ?
                        <SkeletonBodyText lines={16} /> :
                        <div>
                            <table border="0" style={{ width: '100%', padding: '25px' }}>
                                <tbody>
                                    <tr>
                                        <td><div style={{ display: 'flex', alignItems: 'center' }}><img src={`${window.appURL}/images/logo.png`} style={{ width: '70px', float: 'left' }} /><span style={{ fontWeight: 'bold', marginLeft: '10px' }}>Goosely</span></div></td>
                                        <td style={{ float: 'right', verticalAlign: 'top' }}>
                                            <p style={{ textAlign: 'left' }}>Customer <b>{order?.shopify_order?.customer?.first_name} {order?.shopify_order?.customer?.last_name}</b></p>
                                            <p>Order Number <b>{order?.shopify_order?.name}</b></p>

                                        </td>
                                    </tr>
                                    <tr style={{ paddingTop: '50px' }}>
                                        <td style={{ minWidth: '400px', visibility: 'visible' }}>
                                            <p style={{ margin: '15px 0px' }}><b>Customer Mapping</b></p>
                                            <p style={{ margin: '15px 0px' }}>Status - <b>{order.inconnect_account?.intact_customer ? 'Mapped' : 'Not Mapped'}</b></p>
                                            <p style={{ margin: '15px 0px' }}><b>Mapped with</b> - {order.inconnect_account?.intact_customer?.customer_id ?? ''} {order.inconnect_account?.intact_customer?.name ?? ''}</p>

                                        </td>
                                        <td style={{ float: 'right', verticalAlign: 'top', minWidth: '300px' }}>
                                            <div >
                                                <p style={{ margin: '15px 0px 0px 0px' }}><b>Billing Address</b></p>
                                                <p>{order.shopify_order?.billing_address?.address1} {order.shopify_order?.billing_address?.address2 ?? ''} {order.shopify_order?.billing_address?.city} {order.shopify_order?.billing_address?.province} {order.shopify_order?.billing_address?.zip} {order.shopify_order?.billing_address?.country}</p>
                                                <p style={{ margin: '15px 0px 0px 0px' }}><b>Shipping Address</b></p>
                                                <p>{order.shopify_order?.shipping_address?.address1} {order.shopify_order?.shipping_address?.address2 ?? ''} {order.shopify_order?.shipping_address?.city} {order.shopify_order?.shipping_address?.province} {order.shopify_order?.shipping_address?.zip} {order.shopify_order?.shipping_address?.country}</p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2">
                                            <div className='orders-print-table-steps'>
                                                <MultiStepForm order={order} />
                                            </div>
                                        </td>
                                    </tr>
                                    {
                                        !(order.decorator_intact_sent && order.vendor_intact_sent && order.decorator_sent && order.vendor_sent) &&
                                        <tr>
                                            <td colSpan="2">
                                                <div style={{ display: "flex", justifyContent: "center", cursor: "pointer" }} onClick={() => restartOrderHandler(order)}>
                                                    <div style={{ background: "#dfdfdf", padding: "6px", borderRadius: "16px" }}> <Icon source={ReplayIcon} color='success' /> </div>
                                                    <span style={{ marginLeft: "10px", marginTop: "5px", color: "#5c5c5c", fontSize: "16px", fontWeight: "600" }}> Restart Process </span>
                                                </div>
                                            </td>
                                        </tr>
                                    }
                                    <tr>
                                        <td colSpan="2">
                                            <Box sx={{ width: '100%', marginBottom: '20px' }}>
                                                <Tabs
                                                    value={tab}
                                                    onChange={handleTabChange}
                                                >
                                                    <Tab value="shopify_order" label="Shopify Order" />
                                                    <Tab value="vendor_order" label="Vendor Order" />
                                                    <Tab value="logs" label="Order Logs" />
                                                    {manualUser && <Tab value="manual_completion" label="Manual Completion" />}
                                                </Tabs>
                                            </Box>
                                            {tab == 'shopify_order' && <ShopifyOrderTable items={order?.shopify_order?.line_items ?? []} current_subtotal_price={order?.shopify_order?.current_subtotal_price} />}
                                            {tab == 'vendor_order' && <VendorOrderTable items={order?.vendor_prices ?? []} order={order} />}
                                            {tab == 'logs' && <LogsTable items={order?.logs ?? []} />}
                                            {tab == 'manual_completion' && <div style={{ padding: "15px" }}>
                                                {manualLogs &&
                                                    <div style={{ marginBottom: "10px" }}>
                                                        <DataTable
                                                            columnContentTypes={[
                                                                'text',
                                                                'text',
                                                            ]}
                                                            headings={[
                                                                'Created At',
                                                                'Description'
                                                            ]}
                                                            rows={manualLogs.map((log, index) => ([
                                                                convertIsoToCustomFormat(log.completed_at),
                                                                log.manual_log
                                                            ]))}
                                                        />
                                                    </div>
                                                }
                                            </div>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    }
                </Modal.Section>
            </Modal>

        </div >
    );

    function disambiguateLabel(key, value) {

        switch (key) {
            case "filterbyshop":
                return `Filtered by Shop: ${value.map((val) => shops.find(value => value.value == val).label).join(", ")}`;
            default:
                return value;
        }
    }

    function isEmpty(value) {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === '' || value == null;
        }
    }
}

OrdersTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default OrdersTable;

