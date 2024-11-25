import { IndexTable, Card, Select as ShopifySelect, Filters, useIndexResourceState, Pagination, ChoiceList, Tabs, Spinner, Badge, Icon, Modal, Link, Text } from '@shopify/polaris';
import { Button } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useState, useCallback } from 'react';
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';

import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { setApplicatorReload } from '@/ReactJs/reducers/ClubColorSlice';
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';

import { usePage } from '@inertiajs/react';
import queryString from 'query-string';

//USING SAME REDUX VARIABLE THAT ARE USED FOR APPLICATOR
const EmbeddedTable = ({ defaultEntries, indexPath }) => {

    const page = usePage().props;
    const { query } = page.ziggy;

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
        path: route("products_two.get", query),
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
                        path: result.data.path + '?' + queryString.stringify(query),
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


        fetch(route('applicator_filters_two.get', query))
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

    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)); }, [tableRows]);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setCurrentCursor(null);
        dispatch(setApplicatorReload(!applicatorReload));
        setSelected(selectedTabIndex)
    }, [tableRows]);

    const handleSearchOptionSetRemove = useCallback(() => { setSearchOptionSet([]); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);
    const handleSearchCollectionRemove = useCallback(() => { setSearchCollection([]); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);
    const handleSearchVendorRemove = useCallback(() => { setSearchVendor([]); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);
    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);

    const handleClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchOptionSetRemove();
        handleSearchCollectionRemove();
        handleSearchVendorRemove();
    }, [
        handleQueryValueRemove,
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

    const filters = [
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
            </IndexTable.Row>
        ),
    );

    return (
        <div>
            <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} mB={"20px"} />
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

                        headings={[
                            { title: 'Id' },
                            { title: 'Product' },
                            { title: 'Vendor' },
                            { title: 'Virtual Set Name' },
                            { title: 'Shop' },
                        ]}
                        selectable={false}
                    >
                        {rowMarkup}
                    </IndexTable>
                </div>
                <hr></hr>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px', paddingBottom: '22px' }}>
                    <Pagination hasNext={pagination.next_cursor ? true : false} hasPrevious={pagination.prev_cursor ? true : false} onNext={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.next_page_url + '&' + queryString.stringify(query),
                        })
                        setCurrentCursor(pagination.next_cursor);
                        dispatch(setApplicatorReload(!applicatorReload));
                    }} onPrevious={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.prev_page_url + '&' + queryString.stringify(query),
                        })
                        setCurrentCursor(pagination.prev_cursor);
                        dispatch(setApplicatorReload(!applicatorReload));
                    }} />
                </div>
            </Card>
        </div >
    );

    function disambiguateLabel(key, value) {
        switch (key) {
            case "filterbyoptionset":
                return `Filtered by Option Set: ${value.map((val) => val).join(", ")}`;
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

export default EmbeddedTable;
