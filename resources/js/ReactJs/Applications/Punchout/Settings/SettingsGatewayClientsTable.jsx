import {
    Card,
    IndexFilters,
    IndexTable,
    Pagination,
    Select,
    Text,
    useBreakpoints,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

function SettingsGatewayClientsTable() {

    const sortOptions = [
        { label: 'Id', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);

    const headings = [
        { title: 'Id' },
        { title: 'Name' },
        { title: 'Domain' },
        { title: 'Type' },
    ]

    const [gatewayClients, setGatewayClients] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("punchout.gateway.client.get"),
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
    }, [gatewayClients]);

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
        if (reload) {
            let url = new URL(pagination.path);
            url.searchParams.set('page_count', pageCount);
            if (currentCursor) {
                url.searchParams.set('cursor', currentCursor);
            }
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
            fetch(url).then((response) => response.json()).then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((value, index) => {
                        my_rows.push(
                            {
                                id: value.id,
                                name: value.name,
                                domain: value.domain,
                                type: value.type_name
                            }
                        );
                    });
                    setGatewayClients(my_rows);
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
        singular: 'Gateway Client',
        plural: 'Gateway Clients ',
    };

    const rowMarkup = gatewayClients.map(
        (
            { id, name, domain, type },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {id}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{name}</IndexTable.Cell>
                <IndexTable.Cell>{domain}</IndexTable.Cell>
                <IndexTable.Cell>{type}</IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'right', marginBottom: '15px' }}>
                <Select
                    labelInline
                    label="Rows:"
                    options={pageOptions}
                    value={pageCount}
                    onChange={handlePageCount}
                />
            </div>
            <Card>
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
                    itemCount={gatewayClients.length}
                    headings={headings}
                    selectable={false}
                >
                    {rowMarkup}
                </IndexTable>
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

SettingsGatewayClientsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default SettingsGatewayClientsTable;
