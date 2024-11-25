import AppLayout from '@/ReactJs/Applications/Cropica/AppLayout';
import ResizeImg from '@/ReactJs/Applications/Cropica/Assets/images/ResizeOptionImg.svg';
import noImage from '@/ReactJs/Applications/Cropica/Assets/images/no-image.png';
import { router } from "@inertiajs/react";
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { TextField as ShopifyTextField } from '@shopify/polaris';
import {
    Button,
    ButtonGroup,
    Card,
    ChoiceList,
    Frame,
    IndexFilters,
    IndexTable,
    Modal,
    Page,
    Pagination,
    Select as ShopifySelect,
    Spinner,
    Text,
    Toast,
    useIndexResourceState, useSetIndexFiltersMode
} from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useEffect, useState } from 'react';
import './FetchProducts.css';

function FetchProducts(props) {

    const [error, setError] = useState(false);
    const [store, setStore] = useState('');
    const [vendors, setVendors] = useState([]);
    const stores = props.stores;
    const [taggedWith, setTaggedWith] = useState('');
    const handleFetchProduct = () => {
        if (store === '') {
            setError(true);
            return;
        }
    }

    const [toastActive, setToastActive] = useState(false);
    const toggleToastActive = useCallback(() => setToastActive((toastActive) => !toastActive), []);

    const [toastMessage, setToastMessage] = useState('');
    let toastMarkup = toastActive ? (
        <Toast content={toastMessage} onDismiss={toggleToastActive} />
    ) : null;

    const [selected, setSelected] = useState(0);
    const [active, setActive] = useState(false);
    const [tableRows, setTableRows] = useState([]);
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);
    const handleClose = useCallback(
        () => {
            setActive(false);
        },
        [active]
    );
    const popResizingModal = () => { setActive(true); };

    const storeSelectionHandle = () => (e) => {
        setStore(e.target.value);
        setReload(!reload);
    }
    const activator = [];

    let timeout = null;
    const resourceName = {
        singular: 'Store Product',
        plural: 'Store Products',
    };
    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];
    const [pageCount, setPageCount] = useState("10");

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
        path: route("cropica.fetch.products"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [searchVendors, setSearchVendors] = useState([]);
    // const [searchCollections, setSearchCollections] = useState([]);
    // const [collections, setCollections] = useState([]);

    const [currentCursor, setCurrentCursor] = useState(null);
    const [going, setGoing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);

    const handlePageCount = useCallback(
        (value) => {
            setPageCount(value);
            setCurrentCursor(null);
            setReload(!reload);
        }, [tableRows]);

    const handleChange = useCallback(() => {

        setActive(!active);
        if (selectedResources.length > 0) {
            let url = new URL(route('cropica.initiate.cropping'));
            if (store) {
                url.searchParams.set('store', store);
            }
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ selectedResources })
            }).then(response => response.json())
                .then(data => {
                    // console.log(data);
                    setToastActive(true);
                    setToastMessage("Cropping Initiated.");
                    router.get(route('cropica.history'));
                }).catch((error) => {
                    // console.log(error);
                    setToastActive(true);
                    setToastMessage("Cropping Failed.");
                });
        }
        else {
            setToastActive(true);
            setToastMessage("Please select at least one product to crop.");
        }
    }, [active]);
    const allStoreProducts = useCallback(() => {

        let url = new URL(route('cropica.initiate.cropping'));
        if (store) {
            url.searchParams.set('allProducts', 'allProducts');
        }
        if (store) {
            url.searchParams.set('store', store);
        }
        url = url.toString();
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then((result) => result.json())
            .then((result) => {
                setToastActive(true);
                setToastMessage("Cropping Initiated.");
                router.get(route('cropica.history'));
            }).catch((err) => {
                setToastActive(true);
                setToastMessage("Cropping Initiated.");
                router.get(route('cropica.history'));
            });
    });

    useEffect(() => {
        // console.log(vendors);
        let url = new URL(pagination.path);
        url.searchParams.set('page_count', pageCount);
        if (store) {
            url.searchParams.set('store', store);
        }
        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
            url.searchParams.set('going', going);
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

        if (searchVendors.length != 0) {
            url.searchParams.set('q2', JSON.stringify(searchVendors));
        } else {
            url.searchParams.delete('q2');
        }

        // if (searchCollections.length != 0) {
        //     url.searchParams.set('q3', JSON.stringify(searchCollections));
        // } else {
        //     url.searchParams.delete('q3');
        // }

        if (taggedWith != "") {
            url.searchParams.set('q4', taggedWith);
        } else {
            url.searchParams.delete('q4');
        }

        url = url.toString();
        setLoading(true);
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).then((result) => result.json()).then((result) => {
            // console.log("result");
            // console.log(result.data.data);

            if (result.success) {
                setTableRows(result.data.data.map((item, index) => {
                    return {
                        id: item.node.legacyResourceId,
                        data: item
                    }
                }));

                setVendors(result.filters.vendors.map((item, index) => {
                    return {
                        value: item.name,
                        label: item.name
                    }
                }));

                // setCollections(result.filters.collections.map((item, index) => {
                //     return {
                //         value: item.collection_title,
                //         label: item.collection_title
                //     }
                // }));

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
                setLoading(false);
            });
    }, [reload]);

    useEffect(() => {
        setReload(!reload);
    }, [sortSelected]);

    const handleTaggedWithChange = useCallback((value) => {
        console.log(value);
        setTaggedWith(value)
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            setCurrentCursor(null);
            setReload(!reload);
        }, 500);
    }, [tableRows]);

    const handleFiltersQueryChange = useCallback((value) => {
        setQueryValue(value)
        timeout = setTimeout(() => {
            setCurrentCursor(null);
            setReload(!reload);
        }, 500);
    }, [tableRows]);

    const changeDateFormat = (date) => {
        let d = new Date(date);
        let day = String(d.getDate()).padStart(2, '0');      // Add leading zero to day
        let month = String(d.getMonth() + 1).padStart(2, '0'); // Add leading zero to month
        let year = d.getFullYear();                         
        let formatted_date = `${year}-${month}-${day}`;
        return formatted_date;
    }


    const handleSearchVendorsChange = useCallback((value) => {
        setSearchVendors(value);
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            setCurrentCursor(null);
            setReload(!reload);
        }, 500);
    }, [tableRows]);

    // const handleSearchCollectionsChange = useCallback((value) => {
    //     setSearchCollections(value);
    //     clearTimeout(timeout)
    //     timeout = setTimeout(() => {
    //         setCurrentCursor(null);
    //         setReload(!reload);
    //     }, 500);
    // }, [tableRows]);

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchVendorsRemove = useCallback(() => { setSearchVendors([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    // const handleSearchCollectionsRemove = useCallback(() => { setSearchCollections([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleTaggedWithRemove = useCallback(() => { setTaggedWith(''); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchVendorsRemove();
        // handleSearchCollectionsRemove();
        handleTaggedWithRemove();
    }, [
        handleQueryValueRemove,
        handleSearchVendorsRemove,
        // handleSearchCollectionsRemove,
        handleTaggedWithRemove
    ]);

    const filters = [
        {
            key: "filterbyvenodr",
            label: "Filter by Vendor",
            filter: (
                <ChoiceList
                    title="Shop"
                    titleHidden
                    choices={vendors}
                    selected={searchVendors || []}
                    onChange={handleSearchVendorsChange}
                    allowMultiple
                />
            ),
        },
        // {
        //     key: "filterbycollection",
        //     label: "Filter by Collection",
        //     filter: (
        //         <ChoiceList
        //             title="Shop"
        //             titleHidden
        //             choices={collections}
        //             selected={searchCollections || []}
        //             onChange={handleSearchCollectionsChange}
        //             allowMultiple
        //         />
        //     ),
        // },
        {
            key: 'taggedWith',
            label: 'Tagged with',
            filter: (
                <ShopifyTextField
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
    if (!isEmpty(searchVendors)) {
        const key = "filterbyvenodr";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchVendors),
            onRemove: handleSearchVendorsRemove,
        });
    }
    // if (!isEmpty(searchCollections)) {
    //     const key = "filterbycollection";
    //     appliedFilters.push({
    //         key,
    //         label: disambiguateLabel(key, searchCollections),
    //         onRemove: handleSearchCollectionsRemove,
    //     });
    // }
    if (!isEmpty(taggedWith)) {
        const key = "taggedWith";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, taggedWith),
            onRemove: handleTaggedWithRemove,
        });
    }
    let rowMarkup;
    if (!(tableRows) || tableRows.length == 0) { rowMarkup = <IndexTable.Row><IndexTable.Cell><Text>No data found</Text></IndexTable.Cell></IndexTable.Row>; }
    else {
        rowMarkup = tableRows.map((value, index) => (
            <IndexTable.Row
                id={value.id}
                key={value.id}
                selected={selectedResources.includes(value.id)}
                position={index}
            >
                <IndexTable.Cell>
                    <div>
                        <img src={value.data.node.featuredImage ? value.data.node.featuredImage.url : ''} alt="altText" width="50" />
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div>
                        <div>{value.data.node.title}</div>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text>{value.data.node.vendor}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd">{value.data.node.featuredMedia ? (value.data.node.featuredMedia.preview.image.width + ' X ' + value.data.node.featuredMedia.preview.image.height) : '0x0'}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd">{value.data.node.mediaCount.count}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd">{(value.data.node.productCategory ? value.data.node.productCategory.productTaxonomyNode.fullName : 'N/A')}</Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text as="span" variant="bodyMd">{changeDateFormat(value.data.node.createdAt)}</Text>
                </IndexTable.Cell>
            </IndexTable.Row >
        ));
    }

    return (
        <div>
            {!store ?
                <Page fullWidth>
                    <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                        <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}>
                            <p className='text-2xl'>
                            Select Store
                            </p>
                        </div>
                    </div>
                    <div className='FetchProduct-wrapper mt-44 px-32 '>
                        <Card>
                            <div className='fetchproduct-heading mt-5'>
                                <Text variant='headingXl' as='h1' fontWeight='bold' >
                                    Select Store
                                </Text>
                                <Text variant='bodyXL' as='p'  >
                                    Select the store from which you want to fetch the products.
                                </Text>
                            </div>
                            <div className='flex justify-center mt-7 pb-5'>
                                <TextField sx={{
                                    width: '350px',
                                    '& .MuiSelect-select span::before': {
                                        content: "'Select store'",
                                    },
                                }}
                                    select
                                    value={store}
                                    onChange={storeSelectionHandle()}> {/* (e) => {setStore(e.target.value)} */}
                                    {stores.map(store => (
                                        <MenuItem key={store.id} value={store.id}>
                                            {store.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                            {error && <p className='text-red-500 flex justify-center mt-2 '>Please select a store</p>}
                            <div className='fetchingProducts-btn my-10 flex justify-center' style={{display:'none'}}>
                                <Button onClick={handleFetchProduct}>
                                    Fetch Products
                                </Button>
                            </div>
                        </Card>
                    </div>
                </Page> :
                <Page fullWidth>
                    <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                        <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> <p className='text-2xl'>Resize options</p> </div>
                    </div>
                    <div className='ResizeOptions-wrapper mt-44 '>
                        <Card>
                            <div className='ResizeOptions-heading mt-5 pb-4'>
                                <div className='p-4 w-[68%]'>
                                    <Text variant='heading2xl' as='h1' fontWeight='bold' >Product-Focused Cropping</Text>
                                    <Text variant='bodyXl' as='p'  >
                                        An app for Shopify stores that effortlessly crops images to showcase products with
                                        precision, enhancing your store's visuals for a polished, professional look.
                                    </Text>
                                </div>
                                <img className='w-32' src={ResizeImg} alt="Resize Img" />
                            </div>
                        </Card>
                    </div>
                    <div className='mt-4  '>
                        <Card>
                            <div className='resize-table-wrapper '>

                                <div className='resizeoptions-text-btn'>
                                    <Text variant='bodyXL' as='p' fontWeight='bold' >
                                    </Text>

                                    <ButtonGroup>
                                        <Button onClick={popResizingModal}> Resize Images </Button>
                                        <Button onClick={allStoreProducts}>Select All Store Products</Button>
                                    </ButtonGroup>
                                </div>

                                <div>
                                    <div className='orders-cc-in-printsave' style={{ display: "flex", justifyContent: 'flex-end' }}>
                                        <ShopifySelect
                                            labelInline
                                            label="Rows:"
                                            options={pageOptions}
                                            value={pageCount}
                                            onChange={handlePageCount}
                                        />
                                    </div>
                                </div>

                                {/* Resize Table Here */}
                                <div className='my-4'>

                                    {/* <ResizeOptionTable /> */}
                                    <Card>
                                        <IndexFilters
                                            sortOptions={sortOptions}
                                            sortSelected={sortSelected}
                                            queryValue={queryValue}
                                            queryPlaceholder="Search"
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
                                            itemCount={tableRows?.length > 0 ? tableRows.length : 0}
                                            selectedItemsCount={
                                                allResourcesSelected ? 'All' : selectedResources.length
                                            }
                                            onSelectionChange={handleSelectionChange}
                                            headings={[
                                                { title: '' },
                                                { title: 'Product' },
                                                { title: 'Vendor' },
                                                { title: 'Dimensions' },
                                                { title: 'Total Images' },
                                                { title: 'Category' },
                                                { title: 'Created at' },
                                            ]}
                                            hasMoreItems
                                            selectable={true}
                                            hasZebraStriping={true}
                                        >
                                            {((rowMarkup === null) || (rowMarkup === '') || (Array.isArray(rowMarkup) && rowMarkup.length === 0)) ? <Spinner accessibilityLabel="Spinner Example" size="large" /> : rowMarkup}
                                        </IndexTable>
                                    </Card>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px', paddingBottom: '22px' }}>
                                        <Pagination hasNext={pagination.next_cursor ? true : false} hasPrevious={pagination.prev_cursor ? true : false} onNext={() => {
                                            // setPagination({
                                            //     ...pagination,
                                            //     path: pagination.path
                                            // })
                                            setCurrentCursor(pagination.next_cursor);
                                            setGoing('next');
                                            setReload(!reload);
                                        }} onPrevious={() => {
                                            // setPagination({
                                            //     ...pagination,
                                            //     path: pagination.path
                                            // })
                                            setCurrentCursor(pagination.prev_cursor);
                                            setGoing('prev');
                                            setReload(!reload);
                                        }} />
                                    </div>
                                </div>
                            </div>

                            <div className='cstm-toast-wrapper' style={{ height: '0px' }}>
                                <Frame>
                                    {toastMarkup}
                                </Frame>
                            </div>
                        </Card>
                    </div>

                    {active && (

                        <div style={{ height: '500px' }}>
                            <Modal
                                activator={activator}
                                open={active}
                                onClose={handleClose}
                            >
                                <Modal.Section>
                                    <div className='text-center mt-10'>
                                        <p className='font-bold'>Are your Sure you want to resize and update images?</p>
                                    </div>
                                    <div className='confirmation-btns  flex mt-6 justify-center gap-3'>
                                        <Button onClick={handleClose}>No</Button>
                                        <Button onClick={handleChange}>Crop Images</Button>
                                    </div>
                                </Modal.Section>
                            </Modal>
                        </div>
                    )}

                </Page>
            }
        </div>
    );

    function disambiguateLabel(key, value) {

        switch (key) {
            case "filterbyvenodr":
                return `Filtered by Client: ${value.map((val) => vendors.find(value => value.value == val).label).join(", ")}`;
            // case "filterbycollection":
            //     return `Filtered by Collection: ${value.map((val) => collections.find(value => value.value == val).label).join(", ")}`;
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
FetchProducts.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default FetchProducts;
