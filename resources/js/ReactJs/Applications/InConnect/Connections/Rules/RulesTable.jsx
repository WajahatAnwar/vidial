import {
    Badge,
    Card,
    Icon,
    IndexFilters,
    IndexTable,
    Pagination,
    useIndexResourceState,
    useSetIndexFiltersMode
} from '@shopify/polaris';

import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { DeleteIcon, EditIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function RulesTable({ reload, setReload, productTypes, editHandler }) {

    let timeout = null;

    const resourceName = {
        singular: 'rule',
        plural: 'rules',
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
        path: route("ic_rules.list"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);

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

        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    const my_rows = result.data.data.map((item) => {
                        return {
                            item: item
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
        setReload();
    }, [sortSelected]);

    const handleFiltersQueryChange = useCallback(
        (value) => {
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload();
            }, 500);
        },
        [tableRows]
    );

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [
        handleQueryValueRemove,
    ]);

    const filters = [];

    const appliedFilters = [];

    const rowMarkup = tableRows.map(
        ({ id, item }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <div className='custom_style'>
                        {item.id}
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {item.product_type.name}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {item.shopifyOrder ? <Badge tone='success'>True</Badge> : <Badge tone='critical'>False</Badge>}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {item.intacctOrder ? <Badge tone='success'>True</Badge> : <Badge tone='critical'>False</Badge>}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div style={{ display: "flex" }} onClick={() => { }}>
                        <div onClick={() => { editHandler(item) }}><Icon source={EditIcon} tone="base" /></div>
                        <div style={{ marginLeft: "10px" }}></div>
                        <div onClick={() => deleteRule(item.id)}><Icon source={DeleteIcon} tone="base" /></div>
                    </div>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const deleteRule = async (id) => {
        let response = await fetch(route('ic_rules.destroy'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deletingId: id }),
        });
        let data = await response.json();
        if (data.success) {
            Swal.fire({
                title: 'Success!',
                icon: 'success',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

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
                    canCreateNewView={false}
                    filters={filters}
                    appliedFilters={appliedFilters}
                    onClearAll={handleFiltersClearAll}
                    mode={mode}
                    setMode={setMode}
                    loading={loading}
                    selected={selected}
                    onSelect={setSelected}
                />
                <IndexTable
                    resourceName={resourceName}
                    itemCount={tableRows.length}
                    selectedItemsCount={
                        allResourcesSelected ? 'All' : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                        { title: 'ID' },
                        { title: 'Product Type' },
                        { title: 'Cancel Shopify Process' },
                        { title: 'Cancel Intacct Process' },
                        { title: 'Actions' },
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
                    setReload();
                }} onPrevious={() => {
                    setPagination({
                        ...pagination,
                        path: pagination.prev_page_url
                    })
                    setCurrentCursor(pagination.prev_cursor);
                    setReload();
                }} />
            </div>
        </div>
    );
}

RulesTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default RulesTable;
