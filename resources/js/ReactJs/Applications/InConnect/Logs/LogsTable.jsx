import {
    Badge,
    Card,
    Grid, Icon,
    IndexFilters,
    IndexTable,
    Pagination,
    Select,
    Tag,
    useIndexResourceState,
    useSetIndexFiltersMode
} from '@shopify/polaris';

// import { colourOptions } from 'data';

import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
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
    const [itemStrings, setItemStrings] = useState([
        'All',
        'Account',
        'Order',
        'Vendor',
        'Decorator',
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
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);
    const [queryValue, setQueryValue] = useState("");
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [pagination, setPagination] = useState({
        path: route("ic_logs.list"),
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

    useEffect(() => {

        let url = new URL(pagination.path);

        url.searchParams.set('page_count', pageCount);

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (filter.trace == 'InconnectAccount') {
            setSelected(1)
        }

        if (filter.trace == 'InconnectOrder') {
            setSelected(2)
        }

        if (filter.trace == 'Vendor') {
            setSelected(3)
        }

        if (filter.trace == 'Decorator') {
            setSelected(4)
        }

        if (selected == 0) {
            url.searchParams.delete('trace')
            // if(filter.trace_id != '' || filter.trace_id != ''){
            //     router.get(route('ic_logs.index'))
            // }
        }
        else if (selected == 1) {
            url.searchParams.set('trace', 'InconnectAccount')
        }
        else if (selected == 2) {
            url.searchParams.set('trace', 'InconnectOrder')
        }
        else if (selected == 3) {
            url.searchParams.set('trace', 'Vendor')
        }
        else if (selected == 4) {
            url.searchParams.set('trace', 'Decorator')
        }

        if (sortSelected != "") {
            url.searchParams.set('sort', sortSelected[0])
        } else {
            url.searchParams.delete('sort');
        }

        if (filter.trace_id != undefined && filter.trace_id != '') {
            setQueryValue(filter.trace_id)
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        setMyUrl(url);
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
                                created_at: new Date(log.created_at).toLocaleString(),
                                store: log.user?.store_name ? log?.user?.store_name : log?.user?.name,
                                type: <div style={{ textTransform: 'capitalize' }} >{log.type == "error" ?
                                    <div className='badgeError'><Badge tone="critical"> {log.type} </Badge></div> : log.type == "info" ? <div className='infoBadgeCust'><Badge tone="info"> {log.type} </Badge ></div> : log.type == "success" ? <div className='sucessBadgeCust'><Badge tone="success" > {log.type} </Badge> </div> : ""
                                }</div>,
                                priority: <div className={log.priority ? 'badgeError' : 'badgeWarning'}><Badge> {log.priority ? 'High' : 'Low'} </Badge></div>,
                                loggable_type: <div style={{ textTransform: 'capitalize' }} >{log.loggable_type == "App\\Models\\InConnect\\InconnectAccount" ?
                                    <div className='tagsAccCust'><Tag > Account </Tag> </div> : log.loggable_type == "App\\Models\\InConnect\\InconnectOrder" ? <div className='tagsOrderCust'><Tag> Order </Tag ></div > : log.loggable_type == "App\\Models\\InConnect\\Vendor" ? <div className='tagsVendorCust'> <Tag tone="success" > Vendor </Tag> </div> : log.loggable_type == "App\\Models\\InConnect\\Decorator" ? <div className='tagsDecoratorCust'> <Tag tone="success" > Decorator </Tag> </div> : ""
                                }</div>,
                                loggable_id: log.loggable_id,
                                description: log.description
                            }
                        );
                    });
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

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [
        handleQueryValueRemove
    ]);

    const filters = [];

    const appliedFilters = [];

    const rowMarkup = tableRows.map(
        ({ id, created_at, store, type, priority, loggable_type, loggable_id, description }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    {created_at}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {store}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {type}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {priority}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {loggable_type}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {loggable_id}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {description}
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );
    const [active, setActive] = useState(false);

    const [firstRun, setFirstRun] = useState(true);
    useEffect(() => {

        if (!firstRun) {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            if (selected == 0 && urlParams.get('trace')) {
                router.get(route('ic_logs.index'))
            }
        }
        setFirstRun(false);

    }, [selected])

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
                                { title: 'Logged At' },
                                { title: 'Store' },
                                { title: 'Type' },
                                { title: 'Priority' },
                                { title: 'Trace' },
                                { title: 'Trace ID' },
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
}

LogsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default LogsTable;
