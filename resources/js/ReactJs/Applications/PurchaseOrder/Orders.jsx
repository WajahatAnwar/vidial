import AppLayout from '@/ReactJs/Applications/PurchaseOrder/AppLayout';
import { router, usePage } from '@inertiajs/react';
import {
    Badge,
    Card,
    ChoiceList,
    Grid, Icon,
    IndexFilters,
    IndexTable,
    Link,
    Page,
    Pagination,
    Select as ShopifySelect,
    useIndexResourceState,
    useSetIndexFiltersMode,
} from '@shopify/polaris';
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
function Orders() {

    const page = usePage().props;
    const { query } = page.ziggy;

    const [shopOptions, setShopOptions] = useState([]);
    const [searchShop, setSearchShop] = useState("");

    let timeout = null;

    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };

    const [tableRows, setTableRows] = useState([]);

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];
    const [pageCount, setPageCount] = useState("10");
    const handlePageCount = useCallback((value) => { setPageCount(value); setReload(!reload); }, [tableRows]);

    const [selected, setSelected] = useState(0);
    const [itemStrings, setItemStrings] = useState([
        'All',
        'Approved',
        'Draft',
    ]);

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions: []
    }));

    const sortOptions = [
        { label: 'Id', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
        { label: 'Name', value: 'name asc', directionLabel: 'Ascending' },
        { label: 'Name', value: 'name desc', directionLabel: 'Descending' },
        { label: 'Email', value: 'email asc', directionLabel: 'Ascending' },
        { label: 'Email', value: 'email desc', directionLabel: 'Descending' },
        { label: 'Phone', value: 'phone asc', directionLabel: 'Ascending' },
        { label: 'Phone', value: 'phone desc', directionLabel: 'Descending' },
        { label: 'Purchase Order Id', value: 'purchase_order asc', directionLabel: 'Ascending' },
        { label: 'Purchase Order Id', value: 'purchase_order desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id asc']);

    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [queryValue, setQueryValue] = useState('');

    const [pagination, setPagination] = useState({
        path: route("po_orders_list"),
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

    useEffect(() => {

        let url = new URL(pagination.path);

        if (pageCount) {
            url.searchParams.set('page_count', pageCount);
        }

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        if (sortSelected != "") {
            url.searchParams.set('q5', sortSelected[0]);
        } else {
            url.searchParams.delete('q5');
        }

        if (searchShop.length != 0) {
            url.searchParams.set('q3', JSON.stringify(searchShop));
        } else {
            url.searchParams.delete('q3');
        }

        if (selected == 0) {
            url.searchParams.delete('status')
        }
        else if (selected == 1) {
            url.searchParams.set('status', 1)
        }
        else if (selected == 2) {
            url.searchParams.set('status', 0)
        }

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    // console.log(result);
                    const my_rows = [];

                    result.data.data.forEach((value, productIndex) => {
                        my_rows.push(
                            {
                                id: value.id,
                                order_id: value.shopify_order_id,
                                po_id: value.purchase_order_id,
                                price: value.total_price,
                                status: value.purchase_status,
                                name: value.name ? value.name : 'N/A',
                                email: value.email,
                                phone: value.phone,
                                store: value.order_user ? value.order_user.store_name : 'N/A',
                            });
                    });

                    setTableRows(my_rows);

                    let temp = [];
                    result.data2.forEach((element, index) => {
                        temp.push({
                            value: element.id,
                            label: element.store_name ? element.store_name : element.name
                        });
                    });
                    setShopOptions(temp);

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
    }, [selected]);

    useEffect(() => {
        setReload(!reload);
    }, [sortSelected]);

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

    const handleSearchShopChange = useCallback(
        (value) => {
            setSearchShop(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchShopRemove = useCallback(() => { setSearchShop([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchShopRemove();
    }, [
        handleSearchShopRemove,
        handleQueryValueRemove
    ]);

    const promotedBulkActions = [
        {
            content: 'Approve Orders',
            onAction: () => {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, approve!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        approveOrders();
                    }
                })
            },
        },
    ];

    const filters = [
        {
            key: "filterbyshop",
            label: "Filter by Shop",
            filter: (
                <ChoiceList
                    title="Shop"
                    titleHidden
                    choices={shopOptions}
                    selected={searchShop || []}
                    onChange={handleSearchShopChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
    ];

    const appliedFilters = [];

    if (!isEmpty(searchShop)) {
        const key = "filterbyshop";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchShop),
            onRemove: handleSearchShopRemove,
        });
    }

    const rowMarkup = tableRows.map(
        ({ id, order_id, po_id, price, status, name, email, phone, store }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    {id}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>
                        <Link
                            dataPrimaryLink
                        >
                            {order_id}
                        </Link>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {po_id}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {price}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {status ? <Badge tone='success'>Approved</Badge> : <Badge>Draft</Badge>}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {name}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {email}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {phone}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {store}
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    function approveOrders() {

        const formData = new FormData();
        formData.append('orders_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));

        fetch("/purchase_order/approve_selected", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    handleSelectionChange('all', false);
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        'Selected orders are now approved.',
                        'success'
                    );
                } else {
                    handleSelectionChange('all', false);
                    Swal.fire(
                        'Error!',
                        data.message,
                        'error'
                    );
                }
            });
    }

    return (
        <div style={{ background: `url('${window.appURL}/images/background6.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('index_purchase_order', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Orders List</div>
                                </div>
                            </div>
                            <ShopifySelect
                                labelInline
                                label="Rows:"
                                options={pageOptions}
                                value={pageCount}
                                onChange={handlePageCount}
                            />
                        </div>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <Card>
                            <IndexFilters
                                sortOptions={sortOptions}
                                sortSelected={sortSelected}
                                queryValue={queryValue}
                                queryPlaceholder="Searching in all"
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
                                    { title: 'Id' },
                                    { title: 'Order #' },
                                    { title: 'Purchase Order #' },
                                    { title: 'Order Price' },
                                    { title: 'Status' },
                                    { title: 'Name' },
                                    { title: 'Email' },
                                    { title: 'Phone' },
                                    { title: 'Store' },
                                ]}
                                promotedBulkActions={promotedBulkActions}
                                hasMoreItems
                            >
                                {rowMarkup}
                            </IndexTable>
                        </Card>
                        <hr></hr>
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
            </Page>
        </div>
    );

    function disambiguateLabel(key, value) {
        switch (key) {
            case "filterbyshop":
                return `Filtered by Shop: ${value.map((val) => val).join(", ")}`;
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

Orders.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Orders;

