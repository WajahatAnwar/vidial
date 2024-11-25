import AppLayout from '@/ReactJs/Applications/OrderSplitter/AppLayout';
import "@/ReactJs/Applications/OrderSplitter/Assets/css/style.css";
import { router, usePage } from '@inertiajs/react';
import {
    Badge, Button,
    Card,
    Grid, Icon,
    IndexFilters,
    IndexTable,
    Link,
    Page,
    Pagination,
    Select,
    TextField,
    useIndexResourceState,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Vendors() {

    const page = usePage().props;
    const { query } = page.ziggy;

    let timeout = null;

    const resourceName = {
        singular: 'vendor',
        plural: 'vendors',
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
    const handlePageCount = useCallback((value) => { setPageCount(value); setReload(!reload); setCurrentCursor(false) }, [tableRows]);

    const [myUrl, setMyUrl] = useState("");
    const [selected, setSelected] = useState(0);
    const [itemStrings, setItemStrings] = useState([
        'All'
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
        { label: 'Name', value: 'name asc', directionLabel: 'Ascending' },
        { label: 'Name', value: 'name desc', directionLabel: 'Descending' },
        { label: 'Store Id', value: 'store asc', directionLabel: 'Ascending' },
        { label: 'Store Id', value: 'store desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id asc']);

    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [taggedWith, setTaggedWith] = useState('');
    const [queryValue, setQueryValue] = useState('');

    const [pagination, setPagination] = useState({
        path: route("vendors_list.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
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
                // console.log(result);
                if (result.success == true) {

                    let my_rows = [];
                    result.data.data.forEach((vendor) => {

                        my_rows.push(
                            {
                                id: vendor.id,
                                name: vendor.vendor_name,
                                tags: <div style={{ display: "flex" }}>{vendor.tags_rel.map((value, index) => (<div key={index} style={{ marginLeft: `${index == 0 ? '0px' : '5px'}` }}><Badge tone='info'>{value.name}</Badge></div>))}</div>,
                                store_id: vendor.vendor_store_id,
                                shopify_vendor: <div style={{ display: "flex" }}>{vendor.vendors.map((value, index) => (<div key={index} style={{ marginLeft: `${index == 0 ? '0px' : '5px'}` }}><Badge tone='info'>{value.shopify_vendor.name}</Badge></div>))}</div>,
                                type: vendor.type ? vendor.type : "tags",
                            });
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

    const promotedBulkActions = [
        {
            content: 'Delete',
            onAction: () => {
                // console.log(selectedResources);
                // console.log(allResourcesSelected);

                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        deleteVendorHandler();
                    }
                })
            },
        },
    ];

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

    const rowMarkup = tableRows.map(

        ({ id, name, tags, store_id, shopify_vendor, type }, index) => (

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
                    <div className='custom_style'>
                        <Link
                            dataPrimaryLink
                        >
                            {name}
                        </Link>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {type}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {type == "tags" ? tags : "N/A"}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {type == "shopify_vendor" ? shopify_vendor : "N/A"}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {store_id}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Button onClick={() => router.get(route('edit_vendor', id))} size='slim' outline>Edit</Button>
                </IndexTable.Cell>
            </IndexTable.Row>

        ),
    );

    function handleCsvUpload(e) {
        setCustomLoader(true);

        const formData = new FormData();
        formData.append('uploaded_csv', e.target.files[0]);

        fetch(`/order_splitter/import_vendors`, {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                } else if (data.success === false) {
                }
            });
    }

    function deleteVendorHandler() {

        const formData = new FormData();

        formData.append('vendor_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));

        fetch('/order_splitter/delete_vendor', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    setReload(!reload);
                    handleSelectionChange('all', false);

                    Swal.fire(
                        'Deleted!',
                        'Vendor has been deleted.',
                        'success'
                    );
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <div style={{ background: `url('${window.appURL}/images/background5.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('index_order_splitter', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Vendors List</div>
                                </div>
                            </div>
                            <div style={{ display: "flex" }}>
                                {/* <div style={{ marginRight: "10px" }}><Button>Upload CSV</Button></div> */}
                                <div style={{ marginRight: "10px" }}><Button onClick={() => router.get(route('add_vendor', query))}>Create New Vendor +</Button></div>
                                <Select
                                    labelInline
                                    label="Rows:"
                                    options={pageOptions}
                                    value={pageCount}
                                    onChange={handlePageCount}
                                />
                            </div>

                        </div>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
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
                                    { title: 'Name' },
                                    { title: 'Type' },
                                    { title: 'Tags' },
                                    { title: 'Vendor' },
                                    { title: 'Store Id' },
                                    { title: 'Action' }
                                ]}
                                promotedBulkActions={promotedBulkActions}
                                hasMoreItems
                                selectable={true}
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

Vendors.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Vendors;

