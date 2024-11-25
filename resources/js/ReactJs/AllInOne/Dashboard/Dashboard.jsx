import AppLayout from '@/ReactJs/AllInOne/AppLayout';
import '@/ReactJs/AllInOne/Assets/css/style.css';
import { usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    Frame,
    Grid, Icon,
    IndexFilters,
    IndexTable,
    Page,
    Pagination,
    Select,
    TextField,
    Toast,
    Tooltip,
    useIndexResourceState,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { ExternalIcon } from '@shopify/polaris-icons';
import React, { useCallback, useEffect, useState } from 'react';

import ToggleSmall from '@/ReactJs/Components/ToggleSmall';

const Dashboard = () => {

    const page = usePage().props;
    // console.log(page);

    function replaceStr(str) {
        return str.replace(/ /g, '_');
    }

    const [projects, setProjects] = useState([]);

    const [toastMessage, setToastMessage] = useState("");
    const [active, setActive] = useState(false);

    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const toastMarkup = active ? (
        <Toast content={toastMessage} onDismiss={toggleActive} />
    ) : null;

    let timeout = null;

    const resourceName = {
        singular: 'store',
        plural: 'stores',
    };

    const [tableRows, setTableRows] = useState([]);

    const [firstLoad, setFirstLoad] = useState(false);

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
    const [itemStrings, setItemStrings] = useState([
        'All',
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
        { label: 'Store', value: 'store asc', directionLabel: 'Ascending' },
        { label: 'Store', value: 'store desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id asc']);

    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [taggedWith, setTaggedWith] = useState('');
    const [queryValue, setQueryValue] = useState('');

    const [pagination, setPagination] = useState({
        path: route("all_in_one_dash"),
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
                    const my_rows = [];

                    result.data.data.forEach((store, index) => {

                        var myObject = {};
                        myObject['id'] = store.id;
                        myObject['name'] = store.store_name ? store.store_name : store.name;
                        myObject['order_sync'] = store.order_sync ? store.order_sync : 'N/A';
                        myObject['product_sync'] = store.product_sync ? store.product_sync : 'N/A';
                        myObject['collection_sync'] = store.collection_sync ? store.collection_sync : 'N/A';
                        // myObject['show_inventory'] = store.show_inventory;

                        store.applications.forEach((application, index2) => {
                            if (application.route)
                                myObject[replaceStr(application.name)] = { application_id: application.id, status: application.pivot.status };
                        });

                        my_rows.push(myObject);

                    });
                    // console.log(my_rows);
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
                let availableProjects = result.data2.filter(value => value.route);
                availableProjects

                setProjects(availableProjects.map(obj => {
                    return { ...obj, alignment: 'center' };
                }));

                setFirstLoad(true);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });

    }, [reload])

    const changeStatusHandler = (status, store_id, application_id = null) => {
        // console.log(status, store_id, app_name);
        fetch("/all_in_one/change_status", {
            method: "POST",
            headers: { "content-Type": "application/json" },
            body: JSON.stringify({ status: status, user_id: store_id, application_id: application_id }),
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                if (data.success == true) {
                    setReload(!reload);
                    setToastMessage("Application Status Updated");
                    setActive(true);
                } else if (data.status == false) {
                }
            });
    }

    useEffect(() => {
        if (firstLoad)
            setReload(!reload);
    }, [sortSelected]);

    const majorProductSyncHandler = (storeId, intacctSync = false) => {

        fetch("/all_in_one/sync_store_products", {
            method: "POST",
            headers: { "content-Type": "application/json" },
            body: JSON.stringify({ user_id: storeId, intacctSync: intacctSync }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success == true) {
                    setToastMessage("Store Products Sync is in Progress");
                    setActive(true);
                } else if (data.status == false) {

                }
            });

    }

    const majorOrderSyncHandler = (storeId) => {

        fetch("/all_in_one/sync_store_orders", {
            method: "POST",
            headers: { "content-Type": "application/json" },
            body: JSON.stringify({ user_id: storeId }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success == true) {
                    setToastMessage("Store Orders Sync is in Progress");
                    setActive(true);
                } else if (data.status == false) {

                }
            });

    }

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

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleTaggedWithRemove = useCallback(() => { setTaggedWith(''); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleTaggedWithRemove();
        handleQueryValueRemove();
    }, [
        handleQueryValueRemove,
        handleTaggedWithRemove,

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

    const rowMarkup = tableRows.map((value, index) => {

        // console.log(value, index);

        let obj = value;
        const final_array = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                // console.log(`Property: ${key}, Value: ${value}`);
                final_array.push({ property: key, value: value })
            }
        }

        // console.log(final_array);

        return (
            <IndexTable.Row
                id={value.id}
                key={value.id}
                selected={selectedResources.includes(value.id)}
                position={index}
            >

                {final_array.map((value2, index2) => {
                    // || value2.property == "show_inventory"
                    if (value2.property == "id" || value2.property == "name" || value2.property == "order_sync" || value2.property == "product_sync" || value2.property == "collection_sync") {
                        if (index2 == 0) {
                            return (
                                <IndexTable.Cell key={index2}>
                                    {value2.property == "id" ? value.id : value.name}
                                </IndexTable.Cell>
                            );
                        }
                        if (index2 == 1) {
                            return (
                                <React.Fragment key={index2}>
                                    <IndexTable.Cell>
                                        {value2.property == "id" ? value.id : value.name}
                                    </IndexTable.Cell>
                                    <IndexTable.Cell>
                                        <div style={{ marginTop: "2px" }}>
                                            <Tooltip preferredPosition='below' content={<div dangerouslySetInnerHTML={{ __html: `<div>Last Synced: <br> ${value.order_sync}</div>` }} />}>
                                                <Button size="slim" outline onClick={() => majorOrderSyncHandler(value.id)}>SYNC</Button>
                                            </Tooltip>
                                        </div>
                                    </IndexTable.Cell>
                                    <IndexTable.Cell>
                                        <div style={{ marginTop: "2px" }}>
                                            <Tooltip preferredPosition='below' content={<div dangerouslySetInnerHTML={{ __html: `<div>Last Synced: <br> ${value.product_sync}</div>` }} />}>
                                                <Button size="slim" outline onClick={() => majorProductSyncHandler(value.id, true)}>SYNC</Button>
                                            </Tooltip>
                                        </div>
                                    </IndexTable.Cell>
                                    <IndexTable.Cell>
                                        <div style={{ marginTop: "2px" }}>
                                            <Tooltip preferredPosition='below' content={<div dangerouslySetInnerHTML={{ __html: `<div>Last Synced: <br> ${value.collection_sync}</div>` }} />}>
                                                <Button size="slim" outline onClick={() => majorProductSyncHandler(value.id)}>SYNC</Button>
                                            </Tooltip>
                                        </div>
                                    </IndexTable.Cell>
                                    {/* <IndexTable.Cell key={index2} className='custom_column_styles'>
                                        <div style={{ marginTop: "2px" }}>
                                            <ToggleSmall onClick={(e) => changeStatusHandler(e.target.checked, value.id)} toggled={value.show_inventory} />
                                        </div>
                                    </IndexTable.Cell> */}
                                </React.Fragment>
                            );
                        }
                    } else {
                        return (
                            <IndexTable.Cell key={index2} className='custom_column_styles'>
                                <div style={{ marginTop: "2px" }}>
                                    <ToggleSmall onClick={(e) => changeStatusHandler(e.target.checked, value.id, value2.value.application_id)} toggled={value2.value.status} />
                                </div>
                            </IndexTable.Cell>
                        );
                    }
                })}
            </IndexTable.Row>
        );
    });

    return (
        <div style={{ background: `url('${window.appURL}/images/background4.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <div style={{ display: "none" }}>
                <Frame>
                    {toastMarkup}
                </Frame>
            </div>
            <Page>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}>CC CLOUD</div>
                </div>
                <Grid>
                    {projects.map((value, index) => {
                        return (
                            <Grid.Cell key={index} columnSpan={{ xs: 6, sm: 4, md: 3, lg: 3, xl: 3 }}>
                                <Card>
                                    <div style={{ margin: "-5px" }}>
                                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                            <img src={value.image_link} style={{ width: "40px", height: "40px" }}></img>
                                            <div style={{ marginTop: "5px" }}>
                                                <button type='button' className='button_main' onClick={() => {
                                                    if (value.route)
                                                        window.open(value.route, "_blank");
                                                }}>
                                                    <span style={{ display: "flex", padding: "3px 4px 0px 7px" }}>
                                                        <span className='buttonText'>Browse</span>
                                                        <span className="button-icon">
                                                            <Icon source={ExternalIcon} />
                                                        </span>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: "10px", marginBottom: "-8px" }}>{value.name}</div>
                                    </div>
                                </Card>
                            </Grid.Cell>
                        )
                    })}
                    {page.auth.user.role_id != 3 ?
                        <>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ display: "flex", justifyContent: 'flex-end' }}>
                                    <Select
                                        labelInline
                                        label="Rows:"
                                        options={pageOptions}
                                        value={pageCount}
                                        onChange={handlePageCount}
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
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
                                    {/* , { title: "Show Inventory" } */}
                                    <IndexTable
                                        resourceName={resourceName}
                                        itemCount={tableRows.length}
                                        selectedItemsCount={
                                            allResourcesSelected ? 'All' : selectedResources.length
                                        }
                                        onSelectionChange={handleSelectionChange}
                                        headings={[{ title: "Id" }, { title: "Store" }, { title: "Order Sync" }, { title: "Product Sync" }, { title: "Collections Sync" }].concat(projects)}
                                        hasMoreItems
                                        selectable={false}
                                    >
                                        {rowMarkup}
                                    </IndexTable>
                                </Card>
                                <hr></hr>
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
                        </> : null
                    }
                </Grid>
            </Page>
        </div >
    );

    function disambiguateLabel(key, value) {
        switch (key) {
            case 'taggedWith':
                return `Tagged with ${value}`;
            case "filterbyshop":
                return `Filtered by Shop: ${value.map((val) => val).join(", ")}`;
            case "filterbycollection":
                return `Filtered by Collection: ${value.map((val) => val).join(", ")}`;
            case "filterbyvendor":
                return `Filtered by Vendor: ${value.map((val) => val).join(", ")}`;
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

Dashboard.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Dashboard;

