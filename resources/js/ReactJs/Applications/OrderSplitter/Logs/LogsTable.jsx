import {
    Badge,
    Card,
    ChoiceList,
    Grid, Icon,
    IndexFilters,
    IndexTable,
    Pagination,
    Select,
    useIndexResourceState,
    useSetIndexFiltersMode
} from '@shopify/polaris';

// import { colourOptions } from 'data';

import AppLayout from '@/ReactJs/Applications/OrderSplitter/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from 'react';

function LogsTable({ filter }) {

    const page = usePage().props;
    let timeout = null;

    const resourceName = {
        singular: 'log',
        plural: 'logs',
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

    const [selected, setSelected] = useState(0);

    const tabs = ['All', 'Success', 'Errors', 'Info'].map((item, index) => ({
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

    const [shops, setShops] = useState([]);
    const [searchShops, serSearchShops] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("ic_logs_os.list"),
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

    useEffect(() => {

        let url = new URL(pagination.path);

        url.searchParams.set('page_count', pageCount);

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (searchShops.length != 0) {
            url.searchParams.set('q2', JSON.stringify(searchShops));
        } else {
            url.searchParams.delete('q2');
        }

        if (selected == 0) url.searchParams.delete('type');
        else if (selected == 1) url.searchParams.set('type', "success");
        else if (selected == 2) url.searchParams.set('type', "error");
        else if (selected == 3) url.searchParams.set('type', "info");


        if (sortSelected != "") {
            url.searchParams.set('sort', sortSelected[0])
        } else {
            url.searchParams.delete('sort');
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((log, index) => {
                        my_rows.push(
                            {
                                id: log.id,
                                order_no: log.order ? `#${log.order.order_no}` : 'N/A',
                                store: log.user?.store_name ? log?.user?.store_name : log?.user?.name,
                                type: <div style={{ textTransform: 'capitalize' }} >{
                                    log.type == "error" ? <div className='badgeError'><Badge tone='critical'> {log.type} </Badge></div> :
                                        log.type == "info" ? <div className='infoBadgeCust'><Badge tone='info'> {log.type} </Badge ></div> :
                                            log.type == "success" ? <div className='sucessBadgeCust'><Badge tone='success' > {log.type} </Badge> </div> : ""
                                }</div>,
                                description: log.description
                            }
                        );
                    });
                    setTableRows(my_rows);

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
    }, [selected, sortSelected]);

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

    const rowMarkup = tableRows.map(
        ({ id, store, type, description, order_no }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    {store}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {order_no}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {type}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {description}
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );


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

    return (
        <div>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                    <div style={{ display: "flex", justifyContent: 'space-between' }}>
                        <div style={{ display: "flex" }}>
                            <div onClick={() => router.get(route('ic_index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                            <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Logs </div>
                        </div>
                        <div className='orders-cc-in-printsave' style={{ display: "flex" }}>
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
                                { title: 'Store' },
                                { title: 'Order' },
                                { title: 'Type' },
                                { title: 'Description' },
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
        </div>
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

LogsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default LogsTable;
