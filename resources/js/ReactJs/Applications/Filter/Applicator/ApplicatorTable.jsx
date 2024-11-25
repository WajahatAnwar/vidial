import '@/ReactJs/Applications/Filter/Assets/css/style.css';
import { Badge, Card, ChoiceList, Filters, IndexTable, Link, Modal, Pagination, Select as ShopifySelect, Tabs, useIndexResourceState } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

import MessagesBanner from '@/ReactJs/Components/MessagesBanner';
import { setApplicatorReload } from '@/ReactJs/reducers/ClubColorSlice';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';

const applicatorTable = ({ defaultEntries, indexPath }) => {

    const sortOptions = [
        { value: 'id,asc', label: 'Relevance' },
        { value: 'product_title,asc', label: 'Title: A-Z' },
        { value: 'product_title,desc', label: 'Title: Z-A' },
        { value: 'product_created_at,desc', label: 'Date: New to Old' },
        { value: 'product_created_at,asc', label: 'Date: Old to New' },
        { value: 'price,ASC', label: 'Price: Low to High' },
        { value: 'price,DESC', label: 'Price: High to Low' },
    ]

    const applicatorReload = useSelector((state) => state.clubColor.applicatorReload);
    const dispatch = useDispatch();

    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const resourceName = {
        singular: 'collection',
        plural: 'collections',
    };

    let timeout = null;
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");
    const [queryValue, setQueryValue] = useState("");
    const [selectedTab, setSelected] = useState(0);

    const [searchOptionSet, setSearchOptionSet] = useState([]);
    const [searchShop, setSearchShop] = useState("");

    const [pageCount, setPageCount] = useState(defaultEntries);
    const [currentCursor, setCurrentCursor] = useState(null);

    const [optionSetOptions, setOptionSetOptions] = useState([]);
    const [shopOptions, setShopOptions] = useState([]);

    const [selectedOptionSet, setSelectedOptionSet] = useState(false);
    const [tableRows, setTableRows] = useState([]);

    const [pagination, setPagination] = useState({
        path: indexPath,
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    const [firstTimeCheck, setFirstTimeCheck] = useState(true);

    const [collectionSort, setCollectionSort] = useState('id,asc');

    const [activeTwo, setActiveTwo] = useState(false);
    const handleChangeTwo = useCallback(() => setActiveTwo(!activeTwo), [activeTwo]);

    useEffect(() => {

        let url = new URL(pagination.path);

        if (pageCount) {
            url.searchParams.set('page_count', pageCount);
        }

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (selectedTab == 0) {
            url.searchParams.delete('status')
        }
        else if (selectedTab == 1) {
            url.searchParams.set('status', 1)
        }
        else if (selectedTab == 2) {
            url.searchParams.set('status', 0)
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        if (searchOptionSet.length != 0) {
            url.searchParams.set('q2', JSON.stringify(searchOptionSet));
        } else {
            url.searchParams.delete('q2');
        }

        if (searchShop.length != 0) {
            url.searchParams.set('q3', JSON.stringify(searchShop));
        } else {
            url.searchParams.delete('q3');
        }

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    const my_rows = [];

                    result.data.data.forEach((element, index) => {

                        let sort = sortOptions.find(value => value.value == element.collection_sort)

                        my_rows.push(
                            {
                                id: element.id,
                                title: element.collection_title,
                                filter_set: element.filter_set_id,
                                filter_set_name: element.filter_set ? element.filter_set.name : "Not Assigned",
                                shop: element.user.name,
                                collection_handle: element.collection_handle,
                                sort: sort ? sort.label : 'N/A'
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

        fetch(`/filter/applicator_filters?user_id=${searchShop}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                let temp = [];
                data.data.filter_sets.forEach(element => {
                    temp.push({
                        value: element.id,
                        label: element.name
                    });
                });
                setOptionSetOptions(temp);

                temp = [];
                data.data.users.forEach((element, index) => {
                    if (index == 0 && firstTimeCheck == true) {
                        setSearchShop(element.id);
                        handleSearchShopChange([element.id]);
                        setFirstTimeCheck(false);
                    };
                    temp.push({
                        value: element.id,
                        label: element.store_name ? element.store_name : element.name
                    });
                });
                setShopOptions(temp);
            });

    }, [applicatorReload])

    const handleFiltersQueryChange = useCallback(
        (value) => {
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                dispatch(setApplicatorReload(!applicatorReload));
            }, 500);
        },
        [tableRows]
    );

    const handleSearchOptionSetChange = useCallback(
        (value) => {
            setSearchOptionSet(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                dispatch(setApplicatorReload(!applicatorReload));
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
                dispatch(setApplicatorReload(!applicatorReload));
            }, 500);
        },
        [tableRows]
    );

    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)); }, [tableRows]);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setCurrentCursor(null);
        dispatch(setApplicatorReload(!applicatorReload));
        setSelected(selectedTabIndex)
    }, [tableRows]);

    const handleSearchOptionSetRemove = useCallback(() => { setSearchOptionSet([]); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);
    // const handleSearchShopRemove = useCallback(() => { setSearchShop([]); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);
    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);

    const handleClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchOptionSetRemove();
        // handleSearchShopRemove();
    }, [
        handleQueryValueRemove,
        // handleSearchShopRemove,
        handleSearchOptionSetRemove,
    ]);

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);

    const tabs = [
        {
            id: 'All',
            content: 'All',
        },
        {
            id: 'Assigned',
            content: 'Assigned',
        },
        {
            id: 'Unassigned',
            content: 'Unassigned',
        }
    ];

    const promotedBulkActions = [
        (selectedTab == 0 || selectedTab == 2) && {
            content: 'Choose Filter Set',
            onAction: () => {
                setActive(true);
            },
        },
        (selectedTab == 0 || selectedTab == 1) && {
            content: 'Remove Filter Set',
            onAction: () => {
                removeOptionSet();
            },
        }, {
            content: 'Choose Collection Sort',
            onAction: () => {
                setActiveTwo(true);
            },
        }
    ].filter(Boolean);

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
                />
            ),
            shortcut: true,
        },
        {
            key: "filterbyoptionset",
            label: "Filter by Filter Set",
            filter: (
                <ChoiceList
                    title="Campaign Type"
                    titleHidden
                    choices={optionSetOptions}
                    selected={searchOptionSet || []}
                    onChange={handleSearchOptionSetChange}
                    allowMultiple
                />
            ),
            // shortcut: true,
        },
    ];

    const appliedFilters = [];

    if (!isEmpty(searchOptionSet)) {
        const key = "filterbyoptionset";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchOptionSet),
            onRemove: handleSearchOptionSetRemove,
        });
    }

    if (!isEmpty(searchShop)) {
        const key = "filterbyshop";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchShop),
            // onRemove: handleSearchShopRemove,
        });
    }

    const rowMarkup = tableRows.map(
        ({ id, title, vendor, filter_set, filter_set_name, shop, product_handle, sort }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <div className='custom_style'>
                        <Link
                            dataPrimaryLink
                        >
                            {id}
                        </Link>
                    </div>
                </IndexTable.Cell>

                <IndexTable.Cell>
                    {title}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {sort}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {
                        filter_set ? <div key={index} style={{ marginLeft: "5px", display: "inline" }}><Badge tone='success'>{filter_set_name}</Badge></div> :
                            <div key={index} style={{ marginLeft: "5px", display: "inline" }}><Badge tone='critical'>Unassigned</Badge></div>
                    }
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const assignOptionSetHandler = () => {
        const formData = new FormData();
        formData.append('collections_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));
        formData.append('filter_set', JSON.stringify(selectedOptionSet));
        // console.log(myUrl);
        fetch('/filter/assign_filter_set', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                setActive(false);

                if (data.success == true) {

                    setFlag("success");
                    setFlagMessage(data.message);
                    dispatch(setApplicatorReload(!applicatorReload));
                    setSelectedOptionSet(false);
                    handleSelectionChange('all', false);
                } else {
                    setFlag("error");
                    setFlagMessage(data.message);
                }
            })
            .catch((error) => {

                console.error(error);
            });
    }

    const assignCollectionSortHandler = () => {
        const formData = new FormData();
        formData.append('collections_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));
        formData.append('sort', collectionSort);
        // console.log(myUrl);
        fetch('/filter/assign_collection_sort', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                setActiveTwo(false);

                if (data.success == true) {

                    setFlag("success");
                    setFlagMessage(data.message);
                    dispatch(setApplicatorReload(!applicatorReload));
                    setSelectedOptionSet(false);
                    handleSelectionChange('all', false);
                } else {
                    setFlag("error");
                    setFlagMessage(data.message);
                }
            })
            .catch((error) => {

                console.error(error);
            });
    }

    const removeOptionSet = () => {

        const formData = new FormData();

        formData.append('collections_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));

        fetch('/filter/remove_filter_set', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                setActive(false);

                if (data.success == true) {
                    setFlag("success");
                    setFlagMessage(data.message);
                    dispatch(setApplicatorReload(!applicatorReload));

                    handleSelectionChange('all', false)
                } else {
                    setFlag("error");
                    setFlagMessage(data.message);
                }
            })
            .catch((error) => {

                console.error(error);
            });
    }

    return (
        <div>
            <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} mB={"20px"} />
            <Modal
                open={active}
                onClose={handleChange}
                title="Select Filter Set"
                primaryAction={{
                    content: 'Assign',
                    onAction: assignOptionSetHandler,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleChange,
                    },
                ]}
            >
                <Modal.Section>
                    <Select
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                        }}
                        placeholder="Select Filter Set"
                        options={optionSetOptions}
                        value={selectedOptionSet}
                        onChange={(e) => setSelectedOptionSet(e)}
                    />
                </Modal.Section>
            </Modal>
            <Modal
                open={activeTwo}
                onClose={handleChangeTwo}
                title="Select Collection Sort"
                primaryAction={{
                    content: 'Assign',
                    onAction: assignCollectionSortHandler,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleChangeTwo,
                    },
                ]}
            >
                <Modal.Section>
                    <ShopifySelect
                        labelInline
                        label="Products Sort:"
                        options={sortOptions}
                        value={collectionSort}
                        onChange={(e) => setCollectionSort(e)}
                    />
                </Modal.Section>
            </Modal>
            <Card>
                <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                </Tabs>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-50px" }}>
                    <ShopifySelect
                        labelInline
                        label="Rows:"
                        options={pageOptions}
                        value={pageCount}
                        onChange={handlePageCount}
                    />
                </div>
                <div style={{ borderTop: "1px solid #d8d8d8", marginTop: "10px" }}>
                    <Filters
                        queryValue={queryValue}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        onQueryChange={handleFiltersQueryChange}
                        onQueryClear={handleQueryValueRemove}
                        onClearAll={handleClearAll}
                        loading={loading}
                    />
                </div>
                <div>
                    <IndexTable key={1} children
                        resourceName={resourceName}
                        itemCount={tableRows.length}
                        selectedItemsCount={
                            allResourcesSelected ? 'All' : selectedResources.length
                        }
                        onSelectionChange={handleSelectionChange}
                        hasMoreItems

                        // bulkActions={bulkActions}
                        promotedBulkActions={promotedBulkActions}
                        headings={[
                            { title: 'Id' },
                            { title: 'Collection Name' },
                            { title: 'Collection Sort' },
                            { title: 'Filter Set Name' },
                        ]}
                    >
                        {rowMarkup}
                    </IndexTable>
                </div>
                <hr></hr>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '20px' }}>
                    <Pagination hasNext={pagination.next_cursor ? true : false} hasPrevious={pagination.prev_cursor ? true : false} onNext={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.next_page_url
                        })
                        setCurrentCursor(pagination.next_cursor);
                        dispatch(setApplicatorReload(!applicatorReload));
                    }} onPrevious={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.prev_page_url
                        })
                        setCurrentCursor(pagination.prev_cursor);
                        dispatch(setApplicatorReload(!applicatorReload));
                    }} />
                </div>
            </Card>
        </div >
    );

    function disambiguateLabel(key, value) {

        let shop_object = {};
        if (key == "filterbyshop") {
            shop_object = shopOptions.filter(ins => ins.value == value[0]);
        }

        switch (key) {
            case "filterbyoptionset":
                return `Filtered by Filter Set: ${value.map((val) => val).join(", ")}`;
            case "filterbyshop":
                return `Filtered by Shop: ${shop_object.map((val) => val.label).join(", ")}`;
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

export default applicatorTable;
