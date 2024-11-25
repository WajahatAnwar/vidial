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

function SettingsAccountAddressesTable({refresh}) {



    const sortOptions = [
        { label: 'Id', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id asc']);

    const headings = [
        { title: 'Id' },
        { title: 'Label' },
        { title: 'Line1' },
        { title: 'City' },
        { title: 'State' },
        { title: 'Action' },
    ]

    const [accountAddresses, setAccountAddresses] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("punchout.account.address.get"),
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
    }, [accountAddresses]);

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
                                label: value.label,
                                line1: value.line1,
                                city: value.city,
                                state: value.state,
                            }
                        );
                    });
                    setAccountAddresses(my_rows);
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
    useEffect(() => {
        console.log(refresh)
        if (refresh) {
            setReload(!reload);
        }
    }, [refresh]);

    const resourceName = {
        singular: 'Account Address',
        plural: 'Account Addresses',
    };

    const rowMarkup = accountAddresses.map(
        (
            { id, label, city, state, line1 },
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
                <IndexTable.Cell>{label}</IndexTable.Cell>
                <IndexTable.Cell>{line1}</IndexTable.Cell>
                <IndexTable.Cell>{city}</IndexTable.Cell>
                <IndexTable.Cell>{state}</IndexTable.Cell>
                <IndexTable.Cell>Action</IndexTable.Cell>
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
                    itemCount={accountAddresses.length}
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

SettingsAccountAddressesTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default SettingsAccountAddressesTable;
