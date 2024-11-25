import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import {
    Card,
    ChoiceList,
    Grid,
    IndexFilters,
    IndexTable,
    Link,
    Modal,
    Pagination,
    Select as ShopifySelect,
    Text,
    useIndexResourceState, useSetIndexFiltersMode
} from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import PunchoutProfileTableModal from './PunchoutProfileTableModal';

function OrderRequestsTable({ }) {

    const [selected, setSelected] = useState(0);

    const [activePreparePunchout, setActivePreparePunchout] = useState(false);
    const handleChangePreparePunchout = useCallback(() => {
        setActivePreparePunchout(!activePreparePunchout)
        setReload(!reload);
    }, [activePreparePunchout]);

    const [selectedOrderRequest, setSelectedOrderRequest] = useState(false);

    function convertISOToYMD(isoDateString) {
        var date = new Date(Date.parse(isoDateString));

        var year = date.getUTCFullYear();
        var month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
        var day = String(date.getUTCDate()).padStart(2, '0');

        var hours = String(date.getUTCHours()).padStart(2, '0');
        var minutes = String(date.getUTCMinutes()).padStart(2, '0');
        var seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    let timeout = null;

    const resourceName = {
        singular: 'Order Request',
        plural: 'Order Requests',
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
        path: route("punchout.orderRequests.list"),
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

        let url = new URL(pagination.path);

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

                    setShops(result.data2.map((item, index) => {
                        return {
                            value: item.id,
                            label: item.store_name ? item.store_name : item.name
                        }
                    }));

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
        {
            key: "filterbyclient",
            label: "Filter by Client",
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
        }
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

    const rowMarkup = tableRows.map((value, index) => (
        <IndexTable.Row
            id={value.id}
            key={value.id}
            selected={selectedResources.includes(value.id)}
            position={index}
        >
            <IndexTable.Cell>
                <Text variant="bodyMd" as="span">
                    {value.id}
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <span className='cstm-green'>
                <Link
                    dataPrimaryLink
                >
                    {value.external_id ? <span className='cstm-green' style={{ cursor: "pointer",textDecoration:"none" }} onClick={() => {
                        setSelectedOrderRequest(value);
                        handleChangePreparePunchout();
                    }}>
                        {value.external_id}
                    </span> : 'N/A'}
                </Link></span>
            </IndexTable.Cell>
            <IndexTable.Cell>{value.magento_order_id ? value.magento_order_id : 'N/A'} </IndexTable.Cell>
            <IndexTable.Cell>{value.pomw_customer.name}</IndexTable.Cell>
            <IndexTable.Cell>{value?.pomw_client?.name}</IndexTable.Cell>
            <IndexTable.Cell>{value.is_delivered ? 'Delivered' : 'Undelivered'}</IndexTable.Cell>
            <IndexTable.Cell><p style={{color:"#FF7777"}}>${parseInt(value.total).toFixed(2)}</p></IndexTable.Cell>
            <IndexTable.Cell>{convertISOToYMD(value.created_at)}</IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <div>
            <Modal
                open={activePreparePunchout}
                onClose={handleChangePreparePunchout}
                size='Large'
            >
                <Modal.Section>
                    <div className='mt-5'>
                        <PunchoutProfileTableModal orderPayload={selectedOrderRequest} handleChangePreparePunchout={handleChangePreparePunchout} />
                    </div>
                </Modal.Section>
            </Modal>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                    <div className='orders-cc-in-printsave' style={{ display: "flex", justifyContent: 'flex-end' }}>
                        <ShopifySelect
                            labelInline
                            label="Rows:"
                            options={pageOptions}
                            value={pageCount}
                            onChange={handlePageCount}
                        />
                    </div>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                    <Card>
                        <IndexFilters
                            sortOptions={sortOptions}
                            sortSelected={sortSelected}
                            queryValue={queryValue}
                            queryPlaceholder="Store ID, PO ID, UUID, ID, etc..."
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
                                { title: 'DBID' },
                                { title: 'Po Num' },
                                { title: 'Store Order ID ' },
                                { title: 'Customer' },
                                { title: 'Client' },
                                { title: 'Status' },
                                { title: 'Total' },
                                { title: 'Date / Time' },
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

OrderRequestsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default OrderRequestsTable;
