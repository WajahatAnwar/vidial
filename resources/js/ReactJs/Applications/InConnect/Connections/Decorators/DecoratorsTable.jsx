import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { router, usePage } from '@inertiajs/react';
import { Card, IndexFilters, IndexTable, Pagination, useIndexResourceState, useSetIndexFiltersMode } from '@shopify/polaris';
import { EditIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import './Steps/style.css';

function DecoratorsTable() {

    const page = usePage().props;
    const { query } = page.ziggy;

    let timeout = null;

    const resourceName = {
        singular: 'decorator',
        plural: 'decorators',
    };

    const [tableRows, setTableRows] = useState([]);

    const [selected, setSelected] = useState(0);
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

    const [sortSelected, setSortSelected] = useState(['id asc']);
    const [queryValue, setQueryValue] = useState("");
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [pagination, setPagination] = useState({
        path: route("ic_decorators.list"),
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

        url.searchParams.set('page_count', 10);

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
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
                    const my_rows = result.data.data.map((item) => {
                        return {
                            id: item.id,
                            name: item.name ?? '-',
                            created_at: item.created_at ?? '-',
                            address: item.address ? item.address.address_line_1 + " " + item.address.city + " " + item.address.state + " " + item.address.zip_code : '-',
                            edit: <EditIcon style={{ width: "18px", cursor: "pointer" }} onClick={() => router.get(route('ic_decorators.edit', item.id))} />,
                            po_prefix: item.po_prefix ?? '-',
                        }
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
    }, [selected]);

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
        handleQueryValueRemove,
    ]);

    const filters = [];

    const appliedFilters = [];

    const rowMarkup = tableRows.map(
        ({ id, created_at, name, address, edit, po_prefix }, index) => (
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
                    {name}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>
                        {address}
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>
                        {po_prefix}
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {edit}
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <div>

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
                        { title: 'Date Connected' },
                        { title: 'Decorator Name' },
                        { title: 'Address' },
                        { title: 'PO Prefix' },
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
        </div>
    );
}

DecoratorsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default DecoratorsTable;
