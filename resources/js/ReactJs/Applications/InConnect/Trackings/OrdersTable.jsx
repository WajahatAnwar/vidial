import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { router } from '@inertiajs/react';
import { Button as MuiButton } from '@mui/material';
import {
    Button,
    Card,
    ChoiceList,
    DatePicker,
    Grid, Icon, IndexFilters,
    IndexTable,
    Link,
    Pagination,
    Popover,
    Select as ShopifySelect,
    Tag,
    useIndexResourceState, useSetIndexFiltersMode
} from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';


function OrdersTable({ }) {

    // ST-36
    function standardIntact(inputString) {
        return inputString
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }



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



    const [order, setOrder] = useState({
        id: '',
        shopify_order: null
    });

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
            content: 'Export CSV',
            onAction: () => {
                ExportOrders();
            },
        }
    ];

    const ExportOrders = () => {
        const shops = searchShops.length > 0 ? JSON.stringify(searchShops) : null;
        const formData = new FormData();
        formData.append('orders_ids', JSON.stringify(selectedResources));
        formData.append('search_query', JSON.stringify(myUrl.search));
        formData.append('all_check', allResourcesSelected);
        formData.append('tracking', true);
        fetch(route("ic_orders.tracking_export"), {
            method: 'POST',
            body: formData,
        }).then((response) => response.json())
            .then((data) => {
                if (data.success == true) {
                    window.location.href = '/goosely/tracking-orders-download';
                    handleSelectionChange('all', false)
                }
            })
            .catch((error) => {
                console.error(error);
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
        path: route("ic_batch.tracking_orders"),
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
    const [decorators, setDecorators] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [searchShops, serSearchShops] = useState([]);
    const [searchDecorator, setSearchDecorator] = useState([]);
    const [searchVendors, setSearchVendors] = useState([]);

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

        if (searchDecorator.length != 0) {
            url.searchParams.set('decorators', JSON.stringify(searchDecorator));
        } else {
            url.searchParams.delete('decorators');
        }

        if (searchVendors.length != 0) {
            url.searchParams.set('vendors', JSON.stringify(searchVendors));
        } else {
            url.searchParams.delete('vendors');
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
                                store: order.user?.store_name ? order?.user?.store_name : order?.user?.name,
                                order: <span className='order-table-code-cc-inco'><img src={`${window.appURL}/images/orders-cc-inco.png`} />{order.inconnect_order.shopify_order_name}</span>,
                                vendor: order.vendor ? <Tag>{order?.vendor?.name ?? '-'}</Tag> : '-',
                                vendor_po: order.po_number ? order.po_number : '-',
                                decorator: order?.inconnect_order?.decorator ? <div className='orders-cc-inco-tags'>  <Tag>{order?.inconnect_order?.decorator.name}</Tag></div> : '-',
                                decorator_po: order.inconnect_order ? order.inconnect_order.decorator_order_id : '-',
                                po_number: order.po_number ?? '-',
                                invoice_number: order.invoice_number ?? '-',
                                tracking_number: order.tracking_number ?? '-',
                                ship_dates: order.ship_dates ?? '-',
                            }
                        );
                    });

                    setShops(result.data2.users.map((item, index) => {
                        return {
                            value: item.id,
                            label: item.store_name ? item.store_name : item.name
                        }
                    }));

                    setDecorators(result.data2.decorators.map((item, index) => {
                        return {
                            value: item.id,
                            label: item.name
                        }
                    }));

                    setVendors(result.data2.vendors.map((item, index) => {
                        return {
                            value: item.id,
                            label: item.name
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

    const handleSearchDecoratorChange = useCallback(
        (value) => {
            setSearchDecorator(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleSearchVendorsChange = useCallback(
        (value) => {
            setSearchVendors(value);
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
    const handleSearchDecoratorsRemove = useCallback(() => { setSearchDecorator([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchVendorsRemove = useCallback(() => { setSearchVendors([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);


    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchShopsRemove();
        handleSearchDecoratorsRemove();
        handleSearchVendorsRemove();
    }, [
        handleQueryValueRemove,
        handleSearchShopsRemove,
        handleSearchDecoratorsRemove,
        handleSearchVendorsRemove,
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
        },
        {
            key: "filterbydecorator",
            label: "Filter by Decorator",
            filter: (
                <ChoiceList
                    title="Decortaor"
                    titleHidden
                    choices={decorators}
                    selected={searchDecorator || []}
                    onChange={handleSearchDecoratorChange}
                    allowMultiple
                />
            ),
            // shortcut: true,
        },
        {
            key: "filterbyvendors",
            label: "Filter by Vendor",
            filter: (
                <ChoiceList
                    title="Vendor"
                    titleHidden
                    choices={vendors}
                    selected={searchVendors || []}
                    onChange={handleSearchVendorsChange}
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
    if (!isEmpty(searchDecorator)) {
        const key = "filterbydecorator";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchDecorator),
            onRemove: handleSearchDecoratorsRemove,
        });
    }

    if (!isEmpty(searchVendors)) {
        const key = "filterbyvendors";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchVendors),
            onRemove: handleSearchVendorsRemove,
        });
    }

    const rowMarkup = tableRows.map(
        ({ id, invoice_number, po_number, order, vendor, vendor_po, decorator, decorator_po, tracking_number, ship_dates }, index) => (
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
                    {decorator}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {decorator_po}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {vendor}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {vendor_po}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {po_number}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {invoice_number}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {tracking_number}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {ship_dates}
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




    const [tab, setTab] = useState('shopify_order');




    let headingsGeneral = [
        { title: 'Order Name' },
        { title: 'Decorator' },
        { title: 'Decorator PO #' },
        { title: 'Vendor' },
        { title: 'Vendor PO #' },
        { title: 'Transaction ID' },
        { title: 'Vendor Invoice #' },
        { title: 'Tracking #' },
        { title: 'Ship Dates' }
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
            setPropertyNames(data.data2.users)
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



    if (order_status_type) {
        headingsGeneral.splice(2, 0, { title: 'Resolve Order' });
    }


    console.log(manualLogs);
    return (
        <div>


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


        </div >
    );

    function disambiguateLabel(key, value) {

        switch (key) {
            case "filterbyshop":
                return `Filtered by Shop: ${value.map((val) => shops.find(value => value.value == val).label).join(", ")}`;
            case "filterbydecorator":
                return `Filtered by Decorator: ${value.map((val) => decorators.find(value => value.value == val).label).join(", ")}`;
            case "filterbyvendors":
                return `Filtered by Vendor: ${value.map((val) => vendors.find(value => value.value == val).label).join(", ")}`;
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

