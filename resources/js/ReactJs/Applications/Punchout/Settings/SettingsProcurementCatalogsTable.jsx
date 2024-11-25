import {
    BlockStack, Button,
    Card,
    Grid,
    IndexFilters,
    IndexTable,
    Modal,
    Pagination,
    Select,
    Text,
    TextField,
    useBreakpoints,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

function SettingsProcurementCatalogsTable() {

    const sortOptions = [
        { label: 'DBID', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'DBID', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);

    const SpacingBackground = ({ children }) => {
        return (
            <div
                style={{
                    height: 'auto',
                }}
            >
                {children}
            </div>
        );
    };

    const headings = [
        { title: 'DBID' },
        { title: 'Name' },
        { title: 'Network' },
        { title: 'Type' },
    ]

    const [catalogs, setCatalogs] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("punchout.catalogs.get"),
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
    }, [catalogs]);

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
                                dbid: value.id,
                                name: value.name,
                                network: value.network_name,
                                type: value.type_name
                            }
                        );
                    });
                    setCatalogs(my_rows);
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
        singular: 'Catalog',
        plural: 'Catalogs',
    };

    const rowMarkup = catalogs.map(
        (
            { id, dbid, name, network, type },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {dbid}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{name}</IndexTable.Cell>
                <IndexTable.Cell>{network}</IndexTable.Cell>
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
                    itemCount={catalogs.length}
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

            <div>
                <Modal
                    activator={false}
                    open={false}
                    onClose={false}
                    size='Large'
                >
                    <Modal.Section>
                        <Text variant="headingXl" as="h4">
                            Edit Catalog: fairfieldccbrands.com Shopify Client Gateway Client
                        </Text>
                        <div className='mt-5'>
                            <Grid>

                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <SpacingBackground>
                                        <BlockStack gap="500">

                                            <TextField
                                                label="Name"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Type"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Staging Punchout Url"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Staging Profile Url"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Production Order Transfer Url"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="From Domain"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="To Domain"
                                                autoComplete="off"
                                            />
                                        </BlockStack>
                                    </SpacingBackground>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <SpacingBackground>
                                        <BlockStack gap="500">


                                            <TextField
                                                label="Network"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Shared Secret"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Staging Order Transfer Url"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Production Punchout Url"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="Production Profile Url"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="From Identity"
                                                autoComplete="off"
                                            />
                                            <TextField
                                                label="To Identity"
                                                autoComplete="off"
                                            />
                                        </BlockStack>
                                    </SpacingBackground>
                                </Grid.Cell>


                            </Grid>
                        </div>
                        <div className='tools-modal-import-btn multi-color-btn mt-5' >
                            <Button>Save Catalog</Button>
                        </div>

                    </Modal.Section>
                </Modal>

            </div>
        </>
    );
}

SettingsProcurementCatalogsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default SettingsProcurementCatalogsTable;
