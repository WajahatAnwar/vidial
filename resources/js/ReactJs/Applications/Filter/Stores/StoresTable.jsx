import '@/ReactJs/Applications/Filter/Assets/css/style.css';
import { Badge, Card, Toast, Frame, ChoiceList, Filters, IndexTable, Modal, Pagination, Select as ShopifySelect, Tabs, useIndexResourceState, Link, rgbToHex, hsbToRgb, rgbToHsb, Button, TextField, ColorPicker } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

import MessagesBanner from '@/ReactJs/Components/MessagesBanner';
import { setApplicatorReload } from '@/ReactJs/reducers/ClubColorSlice';
import ToggleSmall from '@/ReactJs/Components/ToggleSmall';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import Swal from 'sweetalert2';

const StoresTable = ({ defaultEntries, indexPath }) => {

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
        singular: 'store',
        plural: 'stores',
    };

    let timeout = null;
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");
    const [queryValue, setQueryValue] = useState("");
    const [selectedTab, setSelected] = useState(0);
    const [selectedStoreId, setSelectedStoreId] = useState(false);
    const [inStockBg, setInStockBg] = useState(false);
    const [onSaleBg, setOnSaleBg] = useState(false);
    const [onSaleTc, setOnSaleTc] = useState(false);
    const [inStockTc, setInStockTc] = useState(false);
    const [activeTwo, setActiveTwo] = useState(false);

    const [searchOptionSet, setSearchOptionSet] = useState([]);

    const [pageCount, setPageCount] = useState(defaultEntries);
    const [currentCursor, setCurrentCursor] = useState(null);

    const [optionSetOptions, setOptionSetOptions] = useState([]);

    const [selectedOptionSet, setSelectedOptionSet] = useState(false);
    const [tableRows, setTableRows] = useState([]);

    const [pagination, setPagination] = useState({
        path: indexPath,
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    const changeStatusHandler = (status, store_id) => {
        // console.log(status, store_id, app_name);
        fetch("/filter/change_status", {
            method: "POST",
            headers: { "content-Type": "application/json" },
            body: JSON.stringify({ status: status, user_id: store_id }),
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                if (data.success == true) {
                    dispatch(setApplicatorReload(!applicatorReload));
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: data.message,
                    });
                }
            });
    }
    const StoreColorHandler = (id, in_stock_bg, on_sale_color, in_stock_text_color, on_sale_text_color) => {
        setSelectedStoreId(id);
        setInStockBg(JSON.parse(in_stock_bg));
        setOnSaleBg(JSON.parse(on_sale_color));
        setOnSaleTc(JSON.parse(on_sale_text_color));
        setInStockTc(JSON.parse(in_stock_text_color));
        setActiveTwo(true);
    }


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

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    const my_rows = [];

                    result.data.data.forEach((store, index) => {

                        let sort = sortOptions.find(value => value.value == store.collection_sort)

                        my_rows.push(
                            {
                                id: store.id,
                                filter_set: store.filter_set,
                                filter_set_name: store.filter_set ? store.filter_set.name : "Not Assigned",
                                shop: store.store_name ? store.store_name : store.name,
                                show_inventory: store.show_inventory,
                                in_stock_bg: store.in_stock_color,
                                on_sale_bg: store.on_sale_color,
                                on_sale_text_color: store.on_sale_text_color,
                                in_stock_text_color: store.in_stock_text_color,

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

        fetch(`/filter/applicator_filters`)
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

    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)); }, [tableRows]);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setCurrentCursor(null);
        dispatch(setApplicatorReload(!applicatorReload));
        setSelected(selectedTabIndex)
    }, [tableRows]);

    const handleSearchOptionSetRemove = useCallback(() => { setSearchOptionSet([]); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);
    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); dispatch(setApplicatorReload(!applicatorReload)) }, [tableRows]);

    const handleClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchOptionSetRemove();
    }, [
        handleQueryValueRemove,
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
        }
    ].filter(Boolean);

    const filters = [
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

    const rowMarkup = tableRows.map(
        ({ id, shop, filter_set, filter_set_name, show_inventory, in_stock_bg, on_sale_bg, in_stock_text_color, on_sale_text_color }, index) => (
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
                    {shop}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {
                        filter_set ? <div key={index} style={{ marginLeft: "5px", display: "inline" }}><Badge tone='success'>{filter_set_name}</Badge></div> :
                            <div key={index} style={{ marginLeft: "5px", display: "inline" }}><Badge tone='critical'>Unassigned</Badge></div>
                    }
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div style={{ marginTop: "2px" }}>
                        <ToggleSmall onClick={(e) => changeStatusHandler(e.target.checked, id)} toggled={show_inventory} />
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Button outline size='slim' onClick={() => StoreColorHandler(id, in_stock_bg, on_sale_bg, in_stock_text_color, on_sale_text_color)}>Color</Button>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const assignOptionSetHandler = () => {
        const formData = new FormData();
        formData.append('users_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));
        formData.append('filter_set', JSON.stringify(selectedOptionSet));
        // console.log(myUrl);
        fetch('/filter/assign_filter_set_store', {
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

        formData.append('store_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));

        fetch('/filter/remove_store_filter_set', {
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
    function changeColorHandler() {

        const formData = new FormData();
        formData.append('user_id', selectedStoreId);
        formData.append('in_stock_bg', JSON.stringify(inStockBg));
        formData.append('on_sale_bg', JSON.stringify(onSaleBg));
        formData.append('on_sale_text_color', JSON.stringify(onSaleTc));
        formData.append('in_stock_text_color', JSON.stringify(inStockTc));

        fetch(
            "/filter/update_colors",
            {
                method: "POST",
                body: formData,
            }
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    setActiveTwo(false);
                    dispatch(setApplicatorReload(!applicatorReload));
                    Swal.fire(
                        'Success!',
                        data.message,
                        'success'
                    );
                }
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
                onClose={() => setActiveTwo(false)}
                title="Color Scheme"
                primaryAction={{
                    content: 'Save',
                    onAction: changeColorHandler,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setActiveTwo(false),
                    },
                ]}
            >
                <Modal.Section>
                    {selectedStoreId &&
                        <div style={{ display: "flex", width: "100%" }}>
                            <div style={{ width: "50%", padding: "0px 15px" }}>
                                <div>
                                    <label className='py-1 block font-bold'>In Stock Background Color</label>
                                    <TextField
                                        value={rgbToHex(inStockBg)}
                                        type="text"
                                        onChange={(e) => {
                                            let rgb_temp = Convert.hex.rgb(e);
                                            setInStockBg({ red: rgb_temp[0], green: rgb_temp[1], blue: rgb_temp[2], alpha: 1 });
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: "20px" }}>
                                    <ColorPicker
                                        onChange={(e) => setInStockBg(hsbToRgb(e))}
                                        color={rgbToHsb(inStockBg)}
                                        fullWidth
                                    />
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <label className='py-1 block font-bold'>On Sale Background Color</label>
                                    <TextField
                                        value={rgbToHex(onSaleBg)}
                                        type="text"
                                        onChange={(e) => {
                                            let rgb_temp = Convert.hex.rgb(e);
                                            setOnSaleBg({ red: rgb_temp[0], green: rgb_temp[1], blue: rgb_temp[2], alpha: 1 });
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: "20px" }}>
                                    <ColorPicker
                                        onChange={(e) => setOnSaleBg(hsbToRgb(e))}
                                        color={rgbToHsb(onSaleBg)}
                                        fullWidth
                                    />
                                </div>
                            </div>
                            <div style={{ width: "50%", padding: "0px 15px" }}>
                                <div>
                                    <label className='py-1 block font-bold'>In Stock Text Color</label>
                                    <TextField
                                        value={rgbToHex(inStockTc)}
                                        type="text"
                                        onChange={(e) => {
                                            let rgb_temp = Convert.hex.rgb(e);
                                            setInStockTc({ red: rgb_temp[0], green: rgb_temp[1], blue: rgb_temp[2], alpha: 1 });
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: "20px" }}>
                                    <ColorPicker
                                        onChange={(e) => setInStockTc(hsbToRgb(e))}
                                        color={rgbToHsb(inStockTc)}
                                        fullWidth
                                    />
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <label className='py-1 block font-bold'>On Sale Text Color</label>
                                    <TextField
                                        value={rgbToHex(onSaleTc)}
                                        type="text"
                                        onChange={(e) => {
                                            let rgb_temp = Convert.hex.rgb(e);
                                            setOnSaleTc({ red: rgb_temp[0], green: rgb_temp[1], blue: rgb_temp[2], alpha: 1 });
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: "20px" }}>
                                    <ColorPicker
                                        onChange={(e) => setOnSaleTc(hsbToRgb(e))}
                                        color={rgbToHsb(onSaleTc)}
                                        fullWidth
                                    />
                                </div>
                            </div>
                        </div>
                    }
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
                            { title: 'Store Name' },
                            { title: 'Filter Set Name' },
                            { title: 'Show Inventory' },
                            { title: 'Action' }

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

        switch (key) {
            case "filterbyoptionset":
                return `Filtered by Filter Set: ${value.map((val) => val).join(", ")}`;
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

export default StoresTable;
