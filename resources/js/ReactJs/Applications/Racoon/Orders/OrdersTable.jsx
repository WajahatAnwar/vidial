import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { Badge, Button, Card, ChoiceList, DatePicker, Grid, IndexFilters, IndexTable, Link, Modal, Pagination, Popover, Select, useIndexResourceState, useSetIndexFiltersMode } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import ShopifyOrderTable from '../../InConnect/Orders/ShopifyOrderTable';
import Swal from 'sweetalert2';

function OrdersTable({ }) {

    const queryString = window.location.href.split('?')[1];
    const params = new URLSearchParams(queryString);

    const type = params.get("type");
    const start = params.get("start");
    const end = params.get("end");
    const userId = params.get("user_id");
    const by = params.get("by");
    const order_status_type = params.get("order_status_type");

    const page = usePage().props;

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

    const [selected, setSelected] = useState(by ? 1 : 0);
    const [itemStrings, setItemStrings] = useState(by ? ['All', 'Specific'] : ['All']);
    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions: []
    }));

    const [order, setOrder] = useState({
        id: '',
        shopify_order: null
    });

    const sortOptions = [
        { label: 'Id', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);
    const [queryValue, setQueryValue] = useState("");
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [pagination, setPagination] = useState({
        path: route("rc_orders.list"),
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

    const orderClickHandle = async (e, id) => {
        let response = await fetch(route('rc_orders.show', id));
        let data = await response.json();
        if (data.success) {
            setOrder(data.data);
        }
    }

    const cancelOrder= async (order) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to cancel this order?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append('order_id', order.id);
                fetch(route("rc_orders.cancel"), {
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
                                router.get(route('rc_orders.index'));
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

    const processOrder = async (order) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to process this order?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, process it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append('order_id', order.id);
                fetch(route("rc_orders.process"), {
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
                                router.get(route('rc_orders.index'));
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


    useEffect(() => {

        let url = new URL(pagination.path);

        url.searchParams.set('page_count', pageCount);

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (selected == 0) {
            url.searchParams.delete('type');
            url.searchParams.delete('status');
            url.searchParams.delete('start');
            url.searchParams.delete('end');
            url.searchParams.delete('user_id');
        } else if (selected > 0) {
            url.searchParams.set('type', by);
            url.searchParams.set('start_date', formatDateToYMDString(start));
            url.searchParams.set('end_date', formatDateToYMDString(end));
            url.searchParams.set('status', type);
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

        if (filter.type != undefined && filter.type != '') {
            url.searchParams.set('type', filter.type)
        }

        if (filter.by != undefined && filter.by != '') {
            url.searchParams.set('by', filter.by)
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
                                order_name: <span className='order-table-code-cc-inco'><img src={`${window.appURL}/images/orders-cc-inco.png`} /><a onClick={(e) => { setActive(true); orderClickHandle(e, order.id) }}>{order.order_name}</a></span>,
                                email: order.email ? order.email : 'N/A',
                                order_created_at: convertISOToYMD(order.order_created_at),
                                customer_name: order.customer_name ? order.customer_name : 'N/A',
                                final_total: order.final_total,
                                status: order.on_hold ? (
                                    <>
                                        <Button size='slim' variant="primary" onClick={() => processOrder(order)} >
                                            Process
                                        </Button>
                                            &nbsp;
                                        <Button size='slim' tone="critical" onClick={() => cancelOrder(order)} >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Badge progress={ order.cancelled_at ? 'incomplete' : 'complete' } status={ order.cancelled_at ? 'critical' : 'success' }>
                                        { order.cancelled_at ? 'Cancelled' : 'Processed' }
                                    </Badge>
                                ),
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
        ({ id, order_name, email, order_created_at, customer_name, final_total, status }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <div className='custom_style more_styles'>
                        <Link
                            dataPrimaryLink
                        >
                            {order_name}
                        </Link>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {email}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {order_created_at}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {customer_name}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    ${final_total}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {status}
                </IndexTable.Cell>
            </IndexTable.Row >
        ),
    );
    const [active, setActive] = useState(false);

    const [activeTwo, setActiveTwo] = useState(false);

    const [tab, setTab] = useState('shopify_order');

    const handleTabChange = (event, value) => {
        setTab(value);
    };

    return (
        <div>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                    <div style={{ display: "flex", justifyContent: 'space-between' }}>
                        <div style={{ display: "flex" }}>
                            <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Orders </div>
                        </div>
                        <div className='orders-cc-in-printsave' style={{ display: "flex" }}>
                            <div className='flex justify-between'>
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
                                <div className='addnewvendors text-black' style={{ marginLeft: "10px", marginRight: "10px" }}>
                                    <Button variant="primary" onClick={() => {
                                        setFilter(false);
                                        setSelectedDates({
                                            start: new Date(),
                                            end: new Date(),
                                        });
                                        setReload(!reload);
                                    }}>Reset</Button>
                                </div>
                            </div>
                            <Select
                                labelInline
                                label="Rows:"
                                options={pageOptions}
                                value={pageCount}
                                onChange={handlePageCount}
                            />
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
                            headings={[
                                { title: 'Order' },
                                { title: 'Email' },
                                { title: 'Created At' },
                                { title: 'Customer Name' },
                                { title: 'Total' },
                                { title: 'Action' },
                            ]}
                            hasMoreItems
                            selectable={false}
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
                                        <ShopifyOrderTable items={order?.shopify_order?.line_items ?? []} current_subtotal_price={order?.shopify_order?.current_subtotal_price} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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
