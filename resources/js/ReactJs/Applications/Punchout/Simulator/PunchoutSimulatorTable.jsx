import {
    TextField,
    IndexTable,
    LegacyCard,
    IndexFilters,
    useSetIndexFiltersMode,
    useIndexResourceState,
    Text,
    ChoiceList,
    RangeSlider,
    Badge,
    useBreakpoints,
    Card,
    Pagination,
    Select,
    Modal
} from '@shopify/polaris';
// import type {IndexFiltersProps, TabProps} from '@shopify/polaris';
import React, { useState, useCallback, useEffect } from 'react';
import OrdersSimulatorPrepareTableModal from './OrdersSimulatorPrepareTableModal';

function PunchoutSimulatorTable({ street_addresses }) {


    // Modal
    const [activePrepare, setActivePrepare] = useState(false);
    const [currentCatalog, setCurrentCatalog] = useState(null);
    const handleChangePrepare = useCallback((catalog) => {
        setActivePrepare(!activePrepare);
        setCurrentCatalog(catalog);
    }, [activePrepare, currentCatalog]);
    const activatorPrepare = [];

    // Modal

    const [name, setName] = useState('fairfieldccbrands.com Shopify Client Gateway Client');
    const [current, setCurrent] = useState('https://procurement.club 2050-4d59-a92d-4f2d7dacbd9a');

    const [shops, setShops] = useState([]);
    const [searchShops, serSearchShops] = useState([]);

    let timeout = null;


    const sleep = (ms) =>
        new Promise((resolve) => setTimeout(resolve, ms));
    const [itemStrings, setItemStrings] = useState([
        // 'All',
        // 'Unpaid',
        // 'Open',
        // 'Closed',
        // 'Local delivery',
        // 'Local pickup',
    ]);

    const [pagination, setPagination] = useState({
        path: route("punchout.simulator.catalogs.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");
    const [reload, setReload] = useState(false);
    const [tableRows, setTableRows] = useState([]);
    const deleteView = (index) => {
        const newItemStrings = [...itemStrings];
        newItemStrings.splice(index, 1);
        setItemStrings(newItemStrings);
        setSelected(0);
    };

    const duplicateView = async (name) => {
        setItemStrings([...itemStrings, name]);
        setSelected(itemStrings.length);
        await sleep(1);
        return true;
    };

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions:
            index === 0
                ? []
                : [
                    {
                        type: 'rename',
                        onAction: () => { },
                        onPrimaryAction: async (value) => {
                            const newItemsStrings = tabs.map((item, idx) => {
                                if (idx === index) {
                                    return value;
                                }
                                return item.content;
                            });
                            await sleep(1);
                            setItemStrings(newItemsStrings);
                            return true;
                        },
                    },
                    {
                        type: 'duplicate',
                        onPrimaryAction: async (value) => {
                            await sleep(1);
                            duplicateView(value);
                            return true;
                        },
                    },
                    {
                        type: 'edit',
                    },
                    {
                        type: 'delete',
                        onPrimaryAction: async () => {
                            await sleep(1);
                            deleteView(index);
                            return true;
                        },
                    },
                ],
    }));
    const [selected, setSelected] = useState(0);
    const onCreateNewView = async (value) => {
        await sleep(500);
        setItemStrings([...itemStrings, value]);
        setSelected(itemStrings.length);
        return true;
    };
    const sortOptions = [
        { label: 'DBID', value: 'pomw_catalogs.id asc', directionLabel: 'Ascending' },
        { label: 'DBID', value: 'pomw_catalogs.id desc', directionLabel: 'Descending' },
        { label: 'Name', value: 'client_name asc', directionLabel: 'Ascending' },
        { label: 'Name', value: 'client_name desc', directionLabel: 'Descending' },
        { label: 'Network Name', value: 'network_name asc', directionLabel: 'Ascending' },
        { label: 'Network Name', value: 'network_name desc', directionLabel: 'Descending' },
    ];
    const [sortSelected, setSortSelected] = useState(['pomw_catalogs.id desc']);
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const onHandleSave = async () => {
        await sleep(1);
        return true;
    };

    const primaryAction =
        selected === 0
            ? {
                type: 'save-as',
                onAction: onCreateNewView,
                disabled: false,
                loading: false,
            }
            : {
                type: 'save',
                onAction: onHandleSave,
                disabled: false,
                loading: false,
            };
    const [accountStatus, setAccountStatus] = useState(
        undefined,
    );
    const [moneySpent, setMoneySpent] = useState(
        undefined,
    );
    const [taggedWith, setTaggedWith] = useState('');
    const [queryValue, setQueryValue] = useState('');

    const handleAccountStatusChange = useCallback(
        (value) => setAccountStatus(value),
        [],
    );
    const handleMoneySpentChange = useCallback(
        (value) => setMoneySpent(value),
        [],
    );
    const handleTaggedWithChange = useCallback(
        (value) => setTaggedWith(value),
        [],
    );
    const handleFiltersQueryChange = useCallback(
        (value) => {
            console.log('ok');
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );
    const handleAccountStatusRemove = useCallback(
        () => setAccountStatus(undefined),
        [],
    );
    const handleMoneySpentRemove = useCallback(
        () => setMoneySpent(undefined),
        [],
    );
    const handleTaggedWithRemove = useCallback(() => setTaggedWith(''), []);
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = useCallback(() => {
        handleAccountStatusRemove();
        handleMoneySpentRemove();
        handleTaggedWithRemove();
        handleQueryValueRemove();
    }, [
        handleAccountStatusRemove,
        handleMoneySpentRemove,
        handleQueryValueRemove,
        handleTaggedWithRemove,
    ]);

    const filters = [
        // {
        //     key: 'accountStatus',
        //     label: 'Account status',
        //     filter: (
        //         <ChoiceList
        //             title="Account status"
        //             titleHidden
        //             choices={[
        //                 { label: 'Enabled', value: 'enabled' },
        //                 { label: 'Not invited', value: 'not invited' },
        //                 { label: 'Invited', value: 'invited' },
        //                 { label: 'Declined', value: 'declined' },
        //             ]}
        //             selected={accountStatus || []}
        //             onChange={handleAccountStatusChange}
        //             allowMultiple
        //         />
        //     ),
        //     shortcut: true,
        // },
        // {
        //     key: 'taggedWith',
        //     label: 'Tagged with',
        //     filter: (
        //         <TextField
        //             label="Tagged with"
        //             value={taggedWith}
        //             onChange={handleTaggedWithChange}
        //             autoComplete="off"
        //             labelHidden
        //         />
        //     ),
        //     shortcut: true,
        // },
        // {
        //     key: 'moneySpent',
        //     label: 'Money spent',
        //     filter: (
        //         <RangeSlider
        //             label="Money spent is between"
        //             labelHidden
        //             value={moneySpent || [0, 500]}
        //             prefix="$"
        //             output
        //             min={0}
        //             max={2000}
        //             step={1}
        //             onChange={handleMoneySpentChange}
        //         />
        //     ),
        // },
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
    if (moneySpent) {
        const key = 'moneySpent';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, moneySpent),
            onRemove: handleMoneySpentRemove,
        });
    }
    if (!isEmpty(taggedWith)) {
        const key = 'taggedWith';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, taggedWith),
            onRemove: handleTaggedWithRemove,
        });
    }

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const [pageCount, setPageCount] = useState("10");

    const resourceName = {
        singular: 'catalog',
        plural: 'catalogs',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(tableRows);

    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const rowMarkup = tableRows.map(
        (
            { id, dbid, PreparePunchout, Network, uuid, punchout_url },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd"  as="span">
                        {dbid}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell><span onClick={() => handleChangePrepare({ uuid, PreparePunchout, Network, punchout_url })} className='cstm-green'>{PreparePunchout}</span></IndexTable.Cell>
                <IndexTable.Cell>{Network}</IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

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

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((value, index) => {
                        my_rows.push(
                            {
                                id: value.id,
                                dbid: value.id,
                                PreparePunchout: value.client_name,
                                Network: value.network_name,
                                uuid: value.uuid,
                                punchout_url: value.punchout_url,
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
    }, [sortSelected]);

    return (
        <>
            <React.Fragment>
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
                        queryValue={queryValue}
                        queryPlaceholder="Searching all catalogs"
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
                        // promotedBulkActions={promotedBulkActions}
                        hasMoreItems
                        selectable={false}
                        headings={[
                            { title: 'DBID' },
                            { title: 'Prepare Punchout' },
                            { title: 'Network' },
                        ]}
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
            </React.Fragment>

            <div >

                <Modal
                    activator={activatorPrepare}
                    open={activePrepare}
                    onClose={handleChangePrepare}

                >
                    <Modal.Section>

                        <OrdersSimulatorPrepareTableModal street_addresses={street_addresses} catalog={currentCatalog} />

                    </Modal.Section>
                </Modal>
            </div>
        </>
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

PunchoutSimulatorTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default PunchoutSimulatorTable;
