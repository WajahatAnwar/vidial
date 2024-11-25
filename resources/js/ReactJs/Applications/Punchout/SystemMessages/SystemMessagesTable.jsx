import {
    IndexTable,
    Card,
    IndexFilters,
    useSetIndexFiltersMode,
    Text,
    Badge,
    useBreakpoints,
    Select,
    Pagination,
} from '@shopify/polaris';
import { useEffect } from 'react';
import { useState, useCallback } from 'react';
import ReactQuill from 'react-quill';

function SystemMessagesTable() {

    const sortOptions = [
        { label: 'Uri', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Uri', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);

    const headings = [
        { title: 'Uri' },
        { title: 'Name' },
        { title: 'Code' },
        { title: 'Assignments' }
    ]

    const [systemMessages, setSystemMessages] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("punchout.system-messages.get"),
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
    }, [systemMessages]);


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
            url = url.toString();
            fetch(url).then((response) => response.json()).then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((value, index) => {
                        my_rows.push(
                            {
                                id: value.id,
                                uri: value.id,
                                name: value.title,
                                code: value.body,
                                assigments: value.created_at
                            }
                        );
                    });
                    setSystemMessages(my_rows);
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
        singular: 'System Message',
        plural: 'System Messages',
    };

    const rowMarkup = systemMessages.map(
        (
            { id, uri, name, code, assigments },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {uri}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{name}</IndexTable.Cell>
                <IndexTable.Cell>
                    <ReactQuill
                        value={code}
                        readOnly={true}
                        theme="snow"
                        modules={{ toolbar: false }} // Disable toolbar for read-only mode
                    />
                </IndexTable.Cell>
                <IndexTable.Cell>{new Date(assigments).toLocaleDateString() + ' ' + new Date(assigments).toLocaleTimeString()}</IndexTable.Cell>
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
                        itemCount={systemMessages.length}
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

SystemMessagesTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default SystemMessagesTable;
