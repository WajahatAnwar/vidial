import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { router } from '@inertiajs/react';
import {
    Badge,
    Button,
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
    Tabs,
    useIndexResourceState, useSetIndexFiltersMode
} from '@shopify/polaris';
import { ArrowLeftIcon, ChevronLeftIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Timeline from './Timeline';

function BatchList({ }) {

    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);
    const [selectedPO, setSelectedPO] = useState(false);

    let params = new URLSearchParams(window.location.search);

    const [selected, setSelected] = useState(0);

    let timeout = null;

    const resourceName = {
        singular: 'Batch List',
        plural: 'Batches List',
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
        path: route("ic_batch.list", { id: params.get('id') }),
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

    const cardTabs = [
        {
            id: 'General',
            content: 'General',
            accessibilityLabel: 'General',
            panelID: 'General',
        },
        {
            id: 'Steps',
            content: 'Steps',
            panelID: 'Steps',
        },
        {
            id: 'Logs',
            content: 'Logs',
            panelID: 'Logs',
        },
    ];

    const [selectedTab, setSelectedTab] = useState(0);
    const handleTabChange = useCallback((selectedTabIndex) => setSelectedTab(selectedTabIndex), []);

    useEffect(() => {
        console.log(pagination.path);
        let url = new URL(route("ic_batch.list", { id: params.get('id') }));


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

                    // setShops(result.data2.map((item, index) => {
                    //     return {
                    //         value: item.id,
                    //         label: item.store_name ? item.store_name : item.name
                    //     }
                    // }));

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

    // if (!isEmpty(searchShops)) {
    //     const key = "filterbyshop";
    //     appliedFilters.push({
    //         key,
    //         label: disambiguateLabel(key, searchShops),
    //         onRemove: handleSearchShopsRemove,
    //     });
    // }
    const exportBatch = (id) => {
        fetch(route('ic_batch.export', { id: id }))
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/goosely/batch/download';
                }
            })
            .catch(error => {
                console.error('Error exporting batch:', error);
            });
    };

    const forcePushBatchHandler = (id) => {
        async function createPost(id) {
            try {
                const response = await fetch(route('ic_batch.force'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ batch_id: id }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result.success) {
                    Swal.fire('Success', result.message, 'success');
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        createPost(id)
    }

    const rowMarkup = tableRows.map((value, index) => (
        <IndexTable.Row
            id={value.id}
            key={value.id}
            selected={selectedResources.includes(value.id)}
            position={index}
        >

            <IndexTable.Cell>  {/*  THIS ONE COLUMN IS NECESSARY TO USE AT LEAST ONCE */}
                <div className='custom_style'>
                    <Link dataPrimaryLink>
                        {value.batch_setting.batch_name}
                    </Link>
                </div>
            </IndexTable.Cell>
            <IndexTable.Cell>
                ${value.batch_setting.batch_threshold}
            </IndexTable.Cell>
            <IndexTable.Cell>
                ${value.batch_orders_sum_price ? value.batch_orders_sum_price : 0}
            </IndexTable.Cell>
            <IndexTable.Cell>
                {value.batch_setting.batch_day}
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Badge progress={value.batch_status == "fulfilled" ? 'complete' : 'incomplete'} tone={value.batch_status == "fulfilled" ? 'success' : 'attention'}>
                    {value.batch_status}
                </Badge>
            </IndexTable.Cell>
            {/* <IndexTable.Cell>
                {value.po_number ? <div style={{ fontWeight: "600" }}>{value.po_number}</div> : 'N/A'}
            </IndexTable.Cell> */}
            <IndexTable.Cell>
                <Button disabled={value.batch_status == "fulfilled" ? false : true} onClick={() => {
                    setActive(true);
                    setSelectedPO(value);
                }}>Details</Button>
                <span style={{ marginLeft: "10px" }}></span>
                <Button onClick={() => router.get(route('ic_orders.list.batches', { id: value.id }))}>View Orders</Button>
                <span style={{ marginLeft: "10px" }}></span>
                <Button variant='primary' disabled={value.batch_status == "fulfilled" ? true : false} onClick={() => forcePushBatchHandler(value.id)}>Force Push</Button>
                <span style={{ marginLeft: "10px" }}></span>
                <Button onClick={() => exportBatch(value.id)}>Download</Button>
            </IndexTable.Cell>
        </IndexTable.Row >
    ));

    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Modal
                    size=''
                    open={active}
                    onClose={handleChange}
                    title="Master PO Details"
                    secondaryActions={[
                        {
                            content: 'Close',
                            onAction: handleChange,
                        },
                    ]}
                >
                    <div style={{ display: "flex", justifyContent: 'space-between', alignItems: "center" }}>
                        <div>
                            <Tabs tabs={cardTabs} selected={selectedTab} onSelect={handleTabChange}>
                            </Tabs>
                        </div>
                        {/* <div style={{ marginRight: "15px" }}>
                            <Button size='slim' variant='primary'>Restart Process</Button>
                        </div> */}
                    </div>
                    <div style={{ border: "1px solid #bfbfbf", margin: "15px", marginTop: "5px", padding: "15px", borderRadius: "10px", background: "#fafafa", minHeight: "230px" }}>
                        {selectedTab == 0 && <div>
                            <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "15px", }}>
                                <div style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
                                    Master PO #:
                                </div>
                                <div style={{ fontSize: "14px" }}>
                                    {selectedPO.purchase_order_no ? selectedPO.purchase_order_no : 'N/A'}
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "15px" }}>
                                <div style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
                                    Transaction ID:
                                </div>
                                <div style={{ fontSize: "14px" }}>
                                    {selectedPO.po_number ? selectedPO.po_number : 'N/A'}
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "15px" }}>
                                <div style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
                                    Intacct PO #:
                                </div>
                                <div style={{ fontSize: "14px" }}>
                                    {selectedPO.intacct_po_number ? selectedPO.intacct_po_number : 'N/A'}
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "15px" }}>
                                <div style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
                                    Vendor Invoice #:
                                </div>
                                <div style={{ fontSize: "14px" }}>
                                    {selectedPO.invoice_number ? selectedPO.invoice_number : 'N/A'}
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "15px" }}>
                                <div style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
                                    Intacct Invoice #:
                                </div>
                                <div style={{ fontSize: "14px" }}>
                                    {selectedPO.intacct_invoice_number ? selectedPO.intacct_invoice_number : 'N/A'}
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <div style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
                                    Tracking Numbers:
                                </div>
                                <div style={{ fontSize: "14px" }}>
                                    {selectedPO.tracking_number ? selectedPO.tracking_number : 'N/A'}
                                </div>
                            </div>
                        </div>}
                        {selectedTab == 1 && <div style={{ paddingBottom: "40px" }}>
                            <Timeline items={selectedPO.updates.map((value, index) => {
                                return {
                                    tone: value.completed_at ? "success" : 'critical',
                                    timelineEvent: value.name,
                                    timestamp: new Date(value.created_at)
                                }
                            })} />
                        </div>}
                        {selectedTab == 2 && <div style={{ paddingBottom: "40px" }}>
                            <Timeline items={selectedPO.logs.map((value, index) => {
                                return {
                                    tone: value.type == "info" ? 'base' : value.type == "error" ? 'critical' : value.type == "success" ? 'success' : 'base',
                                    timelineEvent: value.description,
                                    timestamp: new Date(value.created_at)
                                }
                            })} />
                        </div>}
                    </div>
                </Modal>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => router.get(route('ic_batch.index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Batch Lists </div>
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
                                queryPlaceholder="Search by batch name"
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
                                    { title: 'Batch Name' },
                                    { title: 'Batch Threshold (Cost)' },
                                    { title: 'Current Total (Cost)' },
                                    { title: 'Batch Day' },
                                    { title: 'Batch Status' },
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
            </Page>
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

BatchList.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default BatchList;
