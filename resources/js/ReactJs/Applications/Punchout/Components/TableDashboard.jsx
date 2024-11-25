import {
    IndexTable,
    LegacyCard,
    Text,
    Badge,
    Card,
    useSetIndexFiltersMode,
    Select,
    IndexFilters,
    useBreakpoints,
    Pagination,
} from '@shopify/polaris';
import React, { useCallback, useEffect, useState } from 'react';

function DashbpoardTable({ client, dates }) {

    const sortOptions = [
        { label: 'Uri', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Uri', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);

    const headings = [
        { title: 'DBID' },
        { title: 'PO#' },
        { title: 'Store Order Id' },
        { title: 'Customer' },
        { title: 'Client' },
        { title: 'Status' },
        { title: 'Total' },
        { title: 'Date' },
    ]

    const [orders, setOrders] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("punchout.dashboard.orders.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    const [currentCursor, setCurrentCursor] = useState(null);

    const [reload, setReload] = useState(true);

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const [pageCount, setPageCount] = useState("10");

    const handlePageCount = useCallback((value) => {
        setPageCount(value);
        setCurrentCursor(null);
        setReload(true);
    }, [orders]);


    const [tableTabs, setTableTabs] = useState([
        // Add more tabs to the table if required
    ]);

    const tabs = tableTabs.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
    }));

    const { mode, setMode } = useSetIndexFiltersMode();

    const [queryValue, setQueryValue] = useState('');

    let timeout = null;

    const handleQueryChange = useCallback(
        (value) => {
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(true);
            }, 500);
        },
        []
    );

    const handleQueryClear = useCallback(
        () => {
            setQueryValue('')
            setCurrentCursor(null);
            setReload(true);
        },
        []
    );

    useEffect(() => {
        setReload(true)
    }, [client, dates])

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

    useEffect(() => {
        if (reload) {
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
            if (client) {
                url.searchParams.set('clientId', client);
            }
            if (dates) {
                var date = new Date(dates['start']),
                    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
                    day = ("0" + date.getDate()).slice(-2);
                const startDate = [date.getFullYear(), mnth, day].join("-");
                var enddate = new Date(dates['end']),
                    endMnth = ("0" + (enddate.getMonth() + 1)).slice(-2),
                    endDay = ("0" + enddate.getDate()).slice(-2);
                const endDate = [enddate.getFullYear(), endMnth, endDay].join("-");
                url.searchParams.set('startDate', startDate);
                url.searchParams.set('endDate', endDate);
            }
            url = url.toString();
            fetch(url).then((response) => response.json()).then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((value, index) => {
                        my_rows.push(
                            {
                                dbid: value.id,
                                po: value.external_id ? value.external_id : 'N/A',
                                store: value.magento_order_id ? value.magento_order_id : 'N/A',
                                name: value.pomw_customer.name,
                                client_name: value.pomw_client.name,
                                status: value.is_delivered ? 'Delivered' : 'Undelivered',
                                total: '$' + parseInt(value.total).toFixed(2),
                                date: convertISOToYMD(value.created_at),
                                url: value.shopify_url
                            }
                        );
                    });
                    setOrders(my_rows);
                    setPagination({
                        path: result.data.path,
                        next_cursor: result.data.next_cursor,
                        next_page_url: result.data.next_page_url,
                        prev_cursor: result.data.prev_cursor,
                        prev_page_url: result.data.prev_page_url,
                    });
                }
                setReload(false);
            }).catch((err) => {
                console.log(err);
                setReload(false);
            });
        }
    }, [reload])

    useEffect(() => {
        setReload(!reload);
    }, [sortSelected]);

    const resourceName = {
        singular: 'Order',
        plural: 'Orders',
    };

    const rowMarkup = orders.map(
        (
            { dbid,
                po,
                store,
                name,
                client_name,
                status,
                total,
                date, url },
            index,
        ) => (
            <IndexTable.Row
                id={dbid}
                key={dbid}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" as="span">
                        {dbid}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{po}</IndexTable.Cell>
                <IndexTable.Cell>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#328afc', textDecoration: 'underline' }}>
                        {store}
                    </a>
                </IndexTable.Cell>
                <IndexTable.Cell>{name}</IndexTable.Cell>
                <IndexTable.Cell>{client_name}</IndexTable.Cell>
                <IndexTable.Cell>{status}</IndexTable.Cell>
                <IndexTable.Cell><p style={{ color: "#FF7777" }}>{total}</p></IndexTable.Cell>
                <IndexTable.Cell>{date}</IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'right', marginBottom: '15px' }}>
                <Select
                    options={pageOptions}
                    value={pageCount}
                    onChange={handlePageCount}
                />
            </div>
            <Card>
                <div className='system-settings-tablwrapper'>
                    <IndexFilters
                        sortOptions={sortOptions}
                        sortSelected={sortSelected}
                        onSort={setSortSelected}
                        hideFilters={true}
                        queryValue={queryValue}
                        queryPlaceholder="Searching in all"
                        onQueryChange={handleQueryChange}
                        onQueryClear={handleQueryClear}
                        cancelAction={{
                            onAction: handleQueryClear,
                            disabled: false,
                            loading: false,
                        }}
                        tabs={tabs}
                        canCreateNewView={false}
                        mode={mode}
                        setMode={setMode}
                        loading={reload}
                    />
                    <IndexTable
                        condensed={useBreakpoints().smDown}
                        resourceName={resourceName}
                        itemCount={orders.length}
                        headings={headings}
                        selectable={false}
                    >
                        {rowMarkup}
                    </IndexTable>
                </div>
            </Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px', paddingBottom: '22px' }}>
                <Pagination
                    hasNext={pagination.next_cursor ? true : false}
                    hasPrevious={pagination.prev_cursor ? true : false}
                    onNext={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.next_page_url
                        })
                        setCurrentCursor(pagination.next_cursor);
                        setReload(!reload);
                    }}
                    onPrevious={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.prev_page_url
                        })
                        setCurrentCursor(pagination.prev_cursor);
                        setReload(!reload);
                    }}
                />
            </div>
        </>
    );
}

export default DashbpoardTable;
