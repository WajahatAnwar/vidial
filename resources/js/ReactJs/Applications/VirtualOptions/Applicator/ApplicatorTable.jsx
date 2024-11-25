import { IndexTable, Card, Select as ShopifySelect, Filters, useIndexResourceState, Pagination, ChoiceList, Tabs, Spinner, Badge, Icon, Modal, Link, Text } from '@shopify/polaris';
import { Button } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useState, useCallback } from 'react';
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';

import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { setApplicatorReload } from '@/ReactJs/reducers/ClubColorSlice';
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';

const applicatorTable = ({ defaultEntries, indexPath }) => {

    const applicatorReload = useSelector((state) => state.clubColor.applicatorReload);
    const dispatch = useDispatch();

    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const resourceName = {
        singular: 'product',
        plural: 'products',
    };

    let timeout = null;
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");
    const [queryValue, setQueryValue] = useState("");
    const [selectedTab, setSelected] = useState(0);

    const [searchOptionSet, setSearchOptionSet] = useState([]);
    const [searchShop, setSearchShop] = useState("");
    const [searchCollection, setSearchCollection] = useState([]);
    const [searchVendor, setSearchVendor] = useState([]);

    const [pageCount, setPageCount] = useState(defaultEntries);
    const [currentCursor, setCurrentCursor] = useState(null);

    const [optionSetOptions, setOptionSetOptions] = useState([]);
    const [shopOptions, setShopOptions] = useState([]);
    const [shopCollections, setShopCollections] = useState([]);
    const [shopVendors, setShopVendors] = useState([]);

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

        if (searchCollection.length != 0) {
            url.searchParams.set('q4', JSON.stringify(searchCollection));
        } else {
            url.searchParams.delete('q4');
        }

        if (searchVendor.length != 0) {
            url.searchParams.set('q5', JSON.stringify(searchVendor));
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
                    const my_rows = [];

                    result.data.data.forEach((element, index) => {

                        my_rows.push(
                            {
                                id: element.id,
                                title: element.product_title,
                                vendor: element.product_vendor,
                                option_set: element.option_set_id,
                                option_set_name: element.option_set ? element.option_set.name : "Not Assigned",
                                shop: element.user.name,
                                product_handle: element.product_handle
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

        fetch(`/virtual_options/applicator_filters?user_id=${searchShop}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                let temp = [];
                data.data.option_sets.forEach(element => {
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


    const handleSearchCollectionChange = useCallback(
        (value) => {
            setSearchCollection(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                dispatch(setApplicatorReload(!applicatorReload));
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
    const handleSearchCollectionRemove = useCallback(() => { setSearchCollection([]); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);
    const handleSearchVendorRemove = useCallback(() => { setSearchVendor([]); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);
    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);

    const handleClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchOptionSetRemove();
        // handleSearchShopRemove();
        handleSearchCollectionRemove();
        handleSearchVendorRemove();
    }, [
        handleQueryValueRemove,
        // handleSearchShopRemove,
        handleSearchOptionSetRemove,
        handleSearchCollectionRemove,
        handleSearchVendorRemove
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
        {
            content: 'Choose Option Set',
            onAction: () => {
                setActive(true);
            },
        },
        {
            content: 'Remove Option Set',
            onAction: () => {
                removeOptionSet();
            },
        },
    ];

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
            label: "Filter by Option Set",
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

    const rowMarkup = tableRows.map(
        ({ id, title, vendor, option_set, option_set_name, shop, product_handle }, index) => (
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

                    <Link
                        dataPrimaryLink
                        onClick={() => window.open(`https://${shop}/products/${product_handle}`, '_blank')}
                    >
                        {title}
                    </Link>

                </IndexTable.Cell>
                <IndexTable.Cell>
                    {vendor}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {
                        option_set ? <div key={index} style={{ marginLeft: "5px", display: "inline" }}><Badge tone='success'>{option_set_name}</Badge></div> :
                            <div key={index} style={{ marginLeft: "5px", display: "inline" }}><Badge tone='critical'>Unassigned</Badge></div>
                    }
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {shop}
                </IndexTable.Cell>
                <IndexTable.Cell><Button size='slim' onClick={() => removeSingleOptionSet(id)} outline>Remove</Button></IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const assignOptionSetHandler = () => {

        const formData = new FormData();

        formData.append('products_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));
        formData.append('option_set', JSON.stringify(selectedOptionSet));

        // console.log(myUrl);

        fetch('/virtual_options/assign_option_set', {
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

    const removeOptionSet = () => {

        const formData = new FormData();

        formData.append('products_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));

        fetch('/virtual_options/remove_option_set', {
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

    const removeSingleOptionSet = (id) => {

        const formData = new FormData();

        formData.append('products_ids', JSON.stringify([id]));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));

        fetch('/virtual_options/remove_option_set', {
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
                title="Select Option Set"
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
                        placeholder="Select Option Set"
                        options={optionSetOptions}
                        value={selectedOptionSet}
                        onChange={(e) => setSelectedOptionSet(e)}
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
                            { title: 'Product' },
                            { title: 'Vendor' },
                            { title: 'Virtual Set Name' },
                            { title: 'Shop' },
                            { title: 'Action' },
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
                return `Filtered by Option Set: ${value.map((val) => val).join(", ")}`;
            case "filterbyshop":
                return `Filtered by Shop: ${shop_object.map((val) => val.label).join(", ")}`;
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

export default applicatorTable;
