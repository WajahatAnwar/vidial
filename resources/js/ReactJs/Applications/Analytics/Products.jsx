import AppLayout from '@/ReactJs/Applications/Analytics/AppLayout';
import { router, usePage } from '@inertiajs/react';
import {
    Badge,
    Card,
    ChoiceList,
    Grid, Icon,
    IndexFilters,
    IndexTable,
    Page,
    Pagination,
    Select,
    TextField,
    useIndexResourceState,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from 'react';

function Products() {

    const page = usePage().props;
    const { query } = page.ziggy;

    /***** converting Collections into comma seprated ******/
    const arrayToCommaSeparated = (array) => {
        let response = [];
        array.map((element) => {
            response.push(element.collection_title);
        });
        return response.join(',');
    }

    let timeout = null;

    const resourceName = {
        singular: 'product',
        plural: 'products',
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
    const [itemStrings, setItemStrings] = useState([
        'All',
        'Active',
        'Draft'
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
        { label: 'Product Id', value: 'product asc', directionLabel: 'Ascending' },
        { label: 'Product Id', value: 'product desc', directionLabel: 'Descending' },
        { label: 'Variant Id', value: 'variant asc', directionLabel: 'Ascending' },
        { label: 'Variant Id', value: 'variant desc', directionLabel: 'Descending' },
        { label: 'Price', value: 'price asc', directionLabel: 'Ascending' },
        { label: 'Price', value: 'price desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id asc']);

    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [taggedWith, setTaggedWith] = useState('');
    const [queryValue, setQueryValue] = useState('');

    const [shopOptions, setShopOptions] = useState([]);
    const [shopCollections, setShopCollections] = useState([]);
    const [shopVendors, setShopVendors] = useState([]);

    const [searchShop, setSearchShop] = useState("");
    const [searchCollection, setSearchCollection] = useState([]);
    const [searchVendor, setSearchVendor] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("products.list"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");
    const [firstTimeCheck, setFirstTimeCheck] = useState(true);
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

        if (selected == 0) {
            url.searchParams.delete('status')
        }
        else if (selected == 1) {
            url.searchParams.set('status', 1)
        }
        else if (selected == 2) {
            url.searchParams.set('status', 0)
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        if (searchShop.length != 0) {
            url.searchParams.set('q3', JSON.stringify(searchShop));
        } else {
            url.searchParams.delete('q3');
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

        if (searchCollection.length != 0) {
            url.searchParams.set('q6', JSON.stringify(searchCollection));
        } else {
            url.searchParams.delete('q6');
        }

        if (searchVendor.length != 0) {
            url.searchParams.set('q7', JSON.stringify(searchVendor));
        } else {
            url.searchParams.delete('q7');
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

                    result.data.data.forEach((variant, productIndex) => {

                        my_rows.push(
                            {

                                id: variant.id,
                                product_id: variant.product_id,
                                variant_id: variant.variant_id,
                                title: variant.title,
                                store: variant.product.user.store_name ?? 'N/A',
                                collections: arrayToCommaSeparated(variant.product.collections)
                                    ? arrayToCommaSeparated(variant.product.collections)
                                    : 'N/A',
                                quantity: variant.quantity == "0" ? < Badge tone='critical' progress='incomplete' > {variant.quantity} in Stock</Badge> : < Badge tone='success' progress='complete' > {variant.quantity} in Stock</Badge>,
                                status: variant.product.status == "active" ? <Badge tone='success' progress='complete' >Active</Badge> : <Badge progress='incomplete' >Draft</Badge>,
                                price: variant.price,
                                vendor: variant.product.product_vendor


                            });

                    });
                    console.log(my_rows);
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

        fetch(`/analytics/fetch-all-filters?user_id=${searchShop}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                let temp = [];
                data.data.users.forEach((element, index) => {
                    if (index == 0 && firstTimeCheck == true) {
                        setFirstTimeCheck(false);
                    };
                    temp.push({
                        value: element.id,
                        label: element.name
                    });
                });
                setShopOptions(temp);

                temp = [];
                data.data.collections.forEach((element, index) => {
                    temp.push({
                        value: element.collection_id,
                        label: element.collection_title
                    });
                });
                setShopCollections(temp);

                temp = [];
                data.data.vendors.forEach((element, index) => {
                    temp.push({
                        value: element.product_vendor,
                        label: element.product_vendor
                    });
                });
                setShopVendors(temp);
            });

    }, [reload])

    useEffect(() => {
        setReload(!reload);
    }, [selected]);

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

    const handleSearchCollectionChange = useCallback(
        (value) => {
            setSearchCollection(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleSearchVendorChange = useCallback(
        (value) => {
            setSearchVendor(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleSearchShopChange = useCallback(
        (value) => {
            setSearchShop(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const promotedBulkActions = [
        {
            content: 'Export CSV',
            onAction: () => {
                ExportProducts()
            },
        },
    ];

    const handleSearchShopRemove = useCallback(() => { setSearchShop([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchCollectionRemove = useCallback(() => { setSearchCollection([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchVendorRemove = useCallback(() => { setSearchVendor([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleTaggedWithRemove = useCallback(() => { setTaggedWith(''); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleTaggedWithRemove();
        handleQueryValueRemove();
        handleSearchCollectionRemove();
        handleSearchVendorRemove();
        handleSearchShopRemove();
    }, [
        handleQueryValueRemove,
        handleTaggedWithRemove,
        handleSearchShopRemove,
        handleSearchVendorRemove,
        handleSearchCollectionRemove
    ]);

    const filters = [
        {
            key: "filterbyshop",
            label: "Filter by Shop",
            filter: (
                <ChoiceList
                    title="Shop"
                    titleHidden
                    choices={shopOptions}
                    selected={searchShop || []}
                    onChange={handleSearchShopChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: "filterbycollection",
            label: "Filter by Collection",
            filter: (
                <ChoiceList
                    title="Collection Type"
                    titleHidden
                    choices={shopCollections}
                    selected={searchCollection || []}
                    onChange={handleSearchCollectionChange}
                    allowMultiple
                />
            ),
            // shortcut: true,
        },
        {
            key: "filterbyvendor",
            label: "Filter by Vendor",
            filter: (
                <ChoiceList
                    title="Vendor Type"
                    titleHidden
                    choices={shopVendors}
                    selected={searchVendor || []}
                    onChange={handleSearchVendorChange}
                    allowMultiple
                />
            ),
            // shortcut: true,
        },
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

    if (!isEmpty(searchShop)) {
        const key = "filterbyshop";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchShop),
            onRemove: handleSearchShopRemove,
        });
    }

    if (!isEmpty(searchCollection)) {
        const key = "filterbycollection";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchCollection),
            onRemove: handleSearchCollectionRemove,
        });
    }

    if (!isEmpty(searchVendor)) {
        const key = "filterbyvendor";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchVendor),
            onRemove: handleSearchVendorRemove,
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

    const rowMarkup = tableRows.map(
        ({ id, variant_id, product_id, title, store, collections, quantity, status, price, vendor }, index) => (
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
                    {variant_id}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {product_id}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>

                        {title}

                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>

                        {vendor}

                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {store}
                </IndexTable.Cell>
                <IndexTable.Cell>

                    {collections}

                </IndexTable.Cell>
                <IndexTable.Cell>
                    {quantity}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {status}
                </IndexTable.Cell>

                <IndexTable.Cell>
                    {price}
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const ExportProducts = () => {

        const formData = new FormData();
        formData.append('products_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));

        fetch('/analytics/export-products-refine', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success == true) {
                    window.location.href = '/analytics/export-products?product_ids=' + data.data;
                    handleSelectionChange('all', false)
                }
            })
            .catch((error) => {

                console.error(error);
            });
    }

    return (
        <div style={{ background: `url('${window.appURL}/images/background.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('reports', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Products List</div>
                                </div>
                            </div>
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
                            <IndexTable
                                resourceName={resourceName}
                                itemCount={tableRows.length}
                                selectedItemsCount={
                                    allResourcesSelected ? 'All' : selectedResources.length
                                }
                                onSelectionChange={handleSelectionChange}
                                headings={[
                                    { title: 'Id' },
                                    { title: 'Product Id' },
                                    { title: 'Variant Id' },
                                    { title: 'Product' },
                                    { title: 'Vendor' },
                                    { title: 'Store' },
                                    { title: 'Collection' },
                                    { title: 'Inventory' },
                                    { title: 'Status' },
                                    { title: 'Price' }
                                ]}
                                promotedBulkActions={promotedBulkActions}
                                hasMoreItems
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
                </Grid>
            </Page>
        </div>
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

Products.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Products;

