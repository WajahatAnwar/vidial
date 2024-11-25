import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { router, usePage } from '@inertiajs/react';
import {
    Badge,
    Card,
    Grid,
    Icon,
    IndexFilters,
    IndexTable,
    Link,
    Modal,
    Page,
    Pagination,
    Select as ShopifySelect,
    SkeletonBodyText,
    useIndexResourceState, useSetIndexFiltersMode
} from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import ShopifyOrderTable from '../Orders/ShopifyOrderTable';

function BatchOrders({ }) {
    let params = new URLSearchParams(window.location.search);

    const [selected, setSelected] = useState(0);

    const [active, setActive] = useState(false);
    const [currentVendor, setCurrentVendor] = useState(false);
    const [order, setOrder] = useState(false);

    let timeout = null;

    const resourceName = {
        singular: 'Order List',
        plural: 'Orders List',
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

    const tabs = ['All'].map((item, index) => ({
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
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);
    const [queryValue, setQueryValue] = useState("");
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [pagination, setPagination] = useState({
        path: route("ic_orders.listing", { id: params.get('id') }),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);
    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const [shops, setShops] = useState([]);
    const [searchShops, serSearchShops] = useState([]);

    useEffect(() => {

        let url = new URL(route("ic_orders.listing", { id: params.get('id') }));

        url.searchParams.set('page_count', pageCount);

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
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

        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    setTableRows(result.data.data);
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
        // {
        //     key: "filterbyclient",
        //     label: "Filter by Client",
        //     filter: (
        //         <ChoiceList
        //             title="Shop"
        //             titleHidden
        //             choices={shops}
        //             selected={searchShops || []}
        //             onChange={handleSearchShopsChange}
        //             allowMultiple
        //         />
        //     ),
        // }
    ];

    const appliedFilters = [];

    if (!isEmpty(searchShops)) {
        const key = "filterbyclient";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchShops),
            onRemove: handleSearchShopsRemove,
        });
    }

    const orderClickHandle = async (e, id) => {
        let response = await fetch(route('ic_orders.show', id));
        let data = await response.json();
        if (data.success) {
            setOrder(data.data);
        }
    }

    const refineVendorHandler = (order, vendor) => {
        order.shopify_order.line_items = order.shopify_order.line_items.filter(value => value.vendor == vendor);
        order.shopify_order.current_subtotal_price = order.shopify_order.line_items.reduce((total, item) => {
            return total + parseFloat(item.price) * item.quantity;
        }, 0);
        return order;
    }

    const rowMarkup = tableRows.map((value, index) => (
        <IndexTable.Row
            id={value.id}
            key={value.id}
            selected={selectedResources.includes(value.id)}
            position={index}
        >
            <IndexTable.Cell>
                {value.id}
            </IndexTable.Cell>
            <IndexTable.Cell>
                <div className='custom_style more_styles custom_width'>
                    <Link
                        dataPrimaryLink
                    >
                        <span className='order-table-code-cc-inco'>
                            <img src={`${window.appURL}/images/orders-cc-inco.png`} />
                            <a onClick={(e) => { setCurrentVendor(value.batch.batch_setting.vendor.name); setActive(true); orderClickHandle(e, value.inconnect_order.id) }}>{value.inconnect_order.shopify_order_name ? value.inconnect_order.shopify_order_name : value.inconnect_order.shopify_order_no}</a></span>
                    </Link>
                </div>
            </IndexTable.Cell>
            <IndexTable.Cell>
                {value.batch.batch_setting.vendor.name}
            </IndexTable.Cell>
            <IndexTable.Cell>
                {value.inconnect_order.shopify_order_id}
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Badge progress="complete" tone={value.inconnect_order.batch_status == "fulfilled" ? 'success' : 'attention'}>
                    {value.inconnect_order.batch_status}
                </Badge>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (

        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
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
                                            <ShopifyOrderTable items={currentVendor && (refineVendorHandler(order, currentVendor)?.shopify_order?.line_items ?? [])} current_subtotal_price={currentVendor && refineVendorHandler(order, currentVendor)?.shopify_order?.current_subtotal_price} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    }
                </Modal.Section>
            </Modal>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => window.history.back()} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Batch Orders </div>
                            </div>
                            <div>
                                <ShopifySelect
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
                                queryPlaceholder="search by order name"
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
                                    { title: 'Batch ID' },
                                    { title: 'Order No' },
                                    { title: 'Vendor' },
                                    { title: 'Shopify Order ID' },
                                    { title: 'Status' }
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
            </Page>
        </div >
    );

    function disambiguateLabel(key, value) {

        switch (key) {
            case "filterbyclient":
                return `Filtered by Client: ${value.map((val) => shops.find(value => value.value == val).label).join(", ")}`;
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

BatchOrders.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default BatchOrders;
