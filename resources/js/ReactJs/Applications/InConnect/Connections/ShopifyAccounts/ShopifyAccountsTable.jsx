import {
    Text, TextField, IndexTable, IndexFilters, useSetIndexFiltersMode, useIndexResourceState, ChoiceList, Badge, Pagination, Card, Link,
} from '@shopify/polaris';
import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { useState, useCallback, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import Toggle from '@/ReactJs/Components/ToggleSmall';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

function ShopifyAccountsTable() {

    const reloadAccountsTable = useSelector(state => state.inConnectAccounts.reloadAccountsTable);

    const convertDateFormat = (dateString) => new Date(dateString).toISOString().split('T')[0].split('-').reverse().join('-');

    const page = usePage().props;
    const { query } = page.ziggy;

    let timeout = null;

    const resourceName = {
        singular: 'InConnect Account',
        plural: 'InConnect Accounts',
    };

    const [tableRows, setTableRows] = useState([]);

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const [pageCount, setPageCount] = useState("10");
    const handlePageCount = useCallback((value) => { setPageCount(value); setReload(!reload); }, [tableRows]);

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
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' }
    ];

    const [sortSelected, setSortSelected] = useState(['id asc']);

    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [taggedWith, setTaggedWith] = useState('');
    const [queryValue, setQueryValue] = useState('');
    const [searchStatus, setSearchStatus] = useState([]);
    const [searchType, setSearchType] = useState([]);

    const [decorators, setDecorators] = useState([]);
    const [searchDecorators, setSearchDecorators] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("shopify_accounts.list"),
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
    
    const applicationStatus = (applications) => {
        return applications?.some((application) => {
            return application.name == 'Goosely' && application.pivot.status == 1;
        });
    };

    useEffect(() => {

        let url = new URL(pagination.path);

        if (pageCount) {
            url.searchParams.set('page_count', pageCount);
        }

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        if (searchStatus.length != 0) {
            url.searchParams.set('q6', JSON.stringify(searchStatus));
        } else {
            url.searchParams.delete('q6');
        }

        if (searchType.length != 0) {
            url.searchParams.set('q7', JSON.stringify(searchType));
        } else {
            url.searchParams.delete('q7');
        }


        if (searchDecorators.length != 0) {
            url.searchParams.set('q8', JSON.stringify(searchDecorators));
        } else {
            url.searchParams.delete('q8');
        }

        if (taggedWith != "") {
            url.searchParams.set('q4', taggedWith);
        } else {
            url.searchParams.delete('q4');
        }

        if (sortSelected != "") {
            url.searchParams.set('q5', sortSelected[0]);
        } else {
            url.searchParams.delete('q5');
        }

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    // console.log(result);

                    const my_rows = result.data.data.map((item, index) => {
                        const appStatus = applicationStatus(item.shop?.applications);
                        return {
                            id: item.id,
                            shop_name: <Link><a onClick={() => router.get(route('ic_default_stepper', { id: item.id }))} > {item.shop?.store_name ? item?.shop?.store_name : item?.shop?.name} </a> </Link >,
                            date_conn: convertDateFormat(item.created_at),
                            shop_status: <Badge tone={appStatus ? 'success' : 'critical'} >{appStatus ? "Enabled" : "Disabled"}</Badge>,
                            shop_type: item.store_type.name,
                            vendor_sync: <Toggle toggled={item.vendor_sync ? true : false} onClick={(e) => {
                                handleSync(item.id, 'vendor_sync', e.target.checked)
                            }} />,
                            decorator_sync: <Toggle toggled={item.decorator_sync ? true : false} onClick={(e) => {
                                handleSync(item.id, 'decorator_sync', e.target.checked)
                            }} />,
                            intact_sync: <Toggle toggled={item.intact_sync ? true : false} onClick={(e) => {
                                handleSync(item.id, 'intact_sync', e.target.checked)
                            }} />,
                            decorator: item.decorators.length > 0 ? item.decorators[0].name : "No Vendors",
                            // vendor: item.vendors[0].name,
                        }
                    });

                    setDecorators(result.data2.map((item, index) => {
                        return {
                            value: item.id,
                            label: item.name
                        }
                    }));

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

    }, [reload, reloadAccountsTable])

    useEffect(() => {
        setReload(!reload);
    }, [sortSelected]);

    const handleTaggedWithChange = useCallback(
        (value) => {
            setTaggedWith(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows],
    );

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

    const handleSearchStatusChange = useCallback(
        (value) => {
            setSearchStatus(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleSearchTypeChange = useCallback(
        (value) => {
            setSearchType(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleSearchDecoratorsChange = useCallback(
        (value) => {
            setSearchDecorators(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleTaggedWithRemove = useCallback(() => { setTaggedWith(''); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchStatusRemove = useCallback(() => { setSearchStatus([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchTypeRemove = useCallback(() => { setSearchType([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchDecoratorsRemove = useCallback(() => { setSearchDecorators([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleTaggedWithRemove();
        handleQueryValueRemove();
        handleSearchStatusRemove();
        handleSearchTypeRemove();
        handleSearchDecoratorsRemove();
    }, [
        handleQueryValueRemove,
        handleTaggedWithRemove,
        handleSearchStatusRemove,
        handleSearchTypeRemove,
        handleSearchDecoratorsRemove
    ]);

    const filters = [
        {
            key: 'taggedWith',
            label: 'Tagged with',
            filter: (
                <TextField
                    label="Tagged with"
                    value={taggedWith}
                    onChange={handleTaggedWithChange}
                    autoComplete="off"
                    labelHidden
                />
            ),
            shortcut: true,
        },
        {
            key: "filterbystatus",
            label: "Filter by Status",
            filter: (
                <ChoiceList
                    title="Status"
                    titleHidden
                    choices={[
                        { value: true, label: "Open" },
                        { value: false, label: "Close" },
                    ]
                    }
                    selected={searchStatus || []}
                    onChange={handleSearchStatusChange}
                // allowMultiple
                />
            ),
            // shortcut: true,
        },
        {
            key: "filterbytype",
            label: "Filter by Type",
            filter: (
                <ChoiceList
                    title="Type"
                    titleHidden
                    choices={[
                        { value: "PopShop", label: "PopShop" },
                        { value: "BrandShop", label: "BrandShop" },
                    ]
                    }
                    selected={searchType || []}
                    onChange={handleSearchTypeChange}
                // allowMultiple
                />
            ),
            // shortcut: true,
        },
        {
            key: "filterbydecorator",
            label: "Filter by Decorator",
            filter: (
                <ChoiceList
                    title="Decorator"
                    titleHidden
                    choices={decorators}
                    selected={searchDecorators || []}
                    onChange={handleSearchDecoratorsChange}
                    allowMultiple
                />
            ),
            // shortcut: true,
        },
    ];

    const appliedFilters = [];

    if (!isEmpty(taggedWith)) {
        const key = 'taggedWith';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, taggedWith),
            onRemove: handleTaggedWithRemove,
        });
    }

    if (!isEmpty(searchStatus)) {
        const key = "filterbystatus";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchStatus),
            onRemove: handleSearchStatusRemove,
        });
    }

    if (!isEmpty(searchType)) {
        const key = "filterbytype";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchType),
            onRemove: handleSearchTypeRemove,
        });
    }

    if (!isEmpty(searchDecorators)) {
        const key = "filterbydecorator";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchDecorators),
            onRemove: handleSearchDecoratorsRemove,
        });
    }


    const rowMarkup = tableRows.map(
        ({ id, date_conn, shop_name, shop_status, shop_type, vendor_sync, decorator_sync, intact_sync, decorator, vendor }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    {id}
                </IndexTable.Cell>

                <IndexTable.Cell>
                    {date_conn}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {shop_name}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>
                        {shop_status}
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {shop_type}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {decorator}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {/* {vendor} */} All Vendors
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="center">
                        {intact_sync}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="center">
                        {decorator_sync}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" alignment="center">
                        {vendor_sync}
                    </Text>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const handleSync = (id, type, value) => {

        let formData = new FormData();
        formData.append('inconnect_account_id', id);
        formData.append('type', type);
        formData.append('value', value);

        fetch('/goosely/shopify-accounts/change-statuses', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success == true) {
                    setReload(!reload);
                    Swal.fire({
                        icon: 'success',
                        position: "top-end",
                        text: data.message,
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

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
                        { title: 'Id' },
                        { title: 'Date Connected' },
                        { title: 'Name' },
                        { title: 'Status' },
                        { title: 'Type' },
                        { title: 'Decorator' },
                        { title: 'Vendor' },
                        { title: 'Intacct (OFF/ON)' },
                        { title: 'Decorators (OFF/ON)' },
                        { title: 'Vendors (OFF/ON)' }
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

    function disambiguateLabel(key, value) {
        switch (key) {
            case 'taggedWith':
                return `Tagged with ${value}`;
            case "filterbystatus":
                return `Filtered by Status: ${value.map((val) => val).join(", ")}`;
            case "filterbytype":
                return `Filtered by Type: ${value.map((val) => val).join(", ")}`;
            case "filterbydecorator":
                return `Filtered by Decorator: ${value.map((val) => val).join(", ")}`;
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

ShopifyAccountsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default ShopifyAccountsTable;


