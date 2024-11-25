import { TextField, IndexTable, Card, Select as ShopifySelect, Filters, useIndexResourceState, Pagination, ChoiceList, Tabs, Spinner, Badge, Icon, Modal, TextContainer, Link } from '@shopify/polaris';
import { Button } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useState, useCallback } from 'react';
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';

import { XIcon } from '@shopify/polaris-icons';
import Select, { components } from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { setColorsReload } from '@/ReactJs/reducers/ClubColorSlice';
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';

const ColorsTable = ({ defaultEntries, indexPath }) => {
    //
    const InputOption = ({
        getStyles,
        Icon,
        isDisabled,
        isFocused,
        isSelected,
        children,
        innerProps,
        ...rest
    }) => {
        const [isActive, setIsActive] = useState(false);
        const onMouseDown = () => setIsActive(true);
        const onMouseUp = () => setIsActive(false);
        const onMouseLeave = () => setIsActive(false);

        // styles
        let bg = "transparent";
        if (isFocused) bg = "#eee";
        if (isActive) bg = "#B2D4FF";

        const style = {
            alignItems: "center",
            backgroundColor: bg,
            color: "inherit",
            display: "flex "
        };

        // prop assignment
        const props = {
            ...innerProps,
            onMouseDown,
            onMouseUp,
            onMouseLeave,
            style
        };

        return (
            <components.Option
                {...rest}
                isDisabled={isDisabled}
                isFocused={isFocused}
                isSelected={isSelected}
                getStyles={getStyles}
                innerProps={props}
            >
                <div style={{ paddingRight: "10px", marginTop: "-3px" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => { }} />
                </div>
                {children}
            </components.Option>
        );
    };

    const colorsReload = useSelector((state) => state.clubColor.colorsReload);
    const dispatch = useDispatch();

    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const resourceName = {
        singular: 'color',
        plural: 'colors',
    };

    let timeout = null;
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");
    const [queryValue, setQueryValue] = useState("");
    const [selectedTab, setSelected] = useState(0);
    const [searchFamily, setSearchFamily] = useState([]);
    const [searchShop, setSearchShop] = useState([]);
    const [pageCount, setPageCount] = useState(defaultEntries);
    const [currentCursor, setCurrentCursor] = useState(null);
    const [familiesOptions, setFamiliesOptions] = useState([]);
    const [shops, setShops] = useState([]);
    const [selectedFamily, setSelectedFamily] = useState([]);
    const [updateColorId, setUpdateColorId] = useState("");
    const [colorName, setColorName] = useState("");

    const [tableRows, setTableRows] = useState([]);

    const [pagination, setPagination] = useState({
        path: indexPath,
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });


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

        if (searchFamily.length != 0) {
            url.searchParams.set('q2', JSON.stringify(searchFamily));
        } else {
            url.searchParams.delete('q2');
        }

        if (searchShop.length != 0) {
            url.searchParams.set('q4', JSON.stringify(searchShop));
        } else {
            url.searchParams.delete('q4');
        }

        if (selectedTab == 0) {
            url.searchParams.delete('status')
        }
        else if (selectedTab == 1) {
            url.searchParams.set('status', 1)
        }
        else if (selectedTab == 2) {
            if (searchFamily.length != 0) {
                url.searchParams.delete('q2');
                url.searchParams.set('status', 2)
                url.searchParams.set('q3', JSON.stringify(searchFamily));
            } else {
                url.searchParams.set('status', 0)
                url.searchParams.delete('q2');
            }
        }
        else if (selectedTab == 3) {
            url.searchParams.set('status', 0)
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

                    result.data.data.forEach((element, index) => {

                        my_rows.push(
                            {
                                id: element.id,
                                color: element.color,
                                status: element.status,
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

        fetch('/virtual_options/color_families_list')
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                let temp = [];
                data.data.forEach(element => {
                    temp.push({
                        value: element.id,
                        label: element.name
                    });
                });
                setFamiliesOptions(temp);

                temp = [];
                data.data2.forEach(element => {
                    temp.push({
                        value: element.id,
                        label: element.store_name ? element.store_name : element.name
                    });
                });
                setShops(temp);

            });

    }, [colorsReload])

    const handleFiltersQueryChange = useCallback(
        (value) => {
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                dispatch(setColorsReload(!colorsReload));
            }, 500);
        },
        [tableRows]
    );

    const handleSearchFamilyChange = useCallback(
        (value) => {
            setSearchFamily(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                dispatch(setColorsReload(!colorsReload));
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
                dispatch(setColorsReload(!colorsReload));
            }, 500);
        },
        [tableRows]
    );

    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); dispatch(setColorsReload(!colorsReload)); }, [tableRows]);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setCurrentCursor(null);
        dispatch(setColorsReload(!colorsReload));
        setSelected(selectedTabIndex)
    }, [tableRows]);

    const handleSearchFamilyRemove = useCallback(() => { setSearchFamily([]); setCurrentCursor(null); dispatch(setColorsReload(!colorsReload)) }, [tableRows]);
    const handleSearchShopRemove = useCallback(() => { setSearchShop([]); setCurrentCursor(null); dispatch(setColorsReload(!colorsReload)) }, [tableRows]);
    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); dispatch(setColorsReload(!colorsReload)) }, [tableRows]);

    const handleClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchFamilyRemove();
        handleSearchShopRemove();
    }, [handleQueryValueRemove, handleSearchFamilyRemove, handleSearchShopRemove]);

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

    const [active2, setActive2] = useState(false);
    const handleChange2 = useCallback(() => { setActive2(!active2); setSelectedFamily([]) }, [active2]);

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
        },
        {
            id: 'General Unassigned',
            content: 'General Unassigned',
        }
    ];

    const promotedBulkActions = [
        {
            content: 'Choose Family',
            onAction: () => {
                setActive(true);
            },
        },
        {
            content: 'Remove Family',
            onAction: () => {
                removeFamilyHandler();
            },
        },
    ];

    const filters = [
        {
            key: "filterbyfamily",
            label: "Filter by Family",
            filter: (
                <ChoiceList
                    title="Campaign Type"
                    titleHidden
                    choices={familiesOptions}
                    selected={searchFamily || []}
                    onChange={handleSearchFamilyChange}
                    allowMultiple
                />
            ),
            // shortcut: true,
        },
        {
            key: "filterbyshop",
            label: "Filter by Shop",
            filter: (
                <ChoiceList
                    title="Shop Type"
                    titleHidden
                    choices={shops}
                    selected={searchShop || []}
                    onChange={handleSearchShopChange}
                    allowMultiple
                />
            ),
            // shortcut: true,
        }
    ];

    const appliedFilters = [];

    if (!isEmpty(searchFamily)) {
        const key = "filterbyfamily";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchFamily),
            onRemove: handleSearchFamilyRemove,
        });
    }

    if (!isEmpty(searchShop)) {
        const key = "filterbyshop";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchShop),
            onRemove: handleSearchShopRemove,
        });
    }

    const rowMarkup = tableRows.map(
        ({ id, color, status }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>{id}</IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>
                        <Link
                            dataPrimaryLink
                        >

                            {color}
                        </Link>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {
                        selectedTab == 2 ? <Badge value="all_store" tone='critical'>Unassigned</Badge>
                            : status ? <Badge tone='success'> Assigned </Badge>
                                : <Badge value="all_store" tone='critical'> <div style={{ display: "flex" }}> <span style={{ width: "11px", marginRight: "5px", marginBottom: "-3px", paddingTop: "4px", height: "21px" }}> <Icon source={XIcon} color="base" /> </span> Unassigned </div> </Badge>
                    }
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Button size='slim' onClick={() => getColorAndItsFamiliesHandler(id)} outline>Edit</Button>
                </IndexTable.Cell>

            </IndexTable.Row>
        ),
    );

    const assignColorFamilyHandler = () => {

        const formData = new FormData();

        formData.append('color_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));
        formData.append('families', JSON.stringify(selectedFamily));

        // console.log(myUrl);

        fetch('/virtual_options/assign_color_family', {
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
                    dispatch(setColorsReload(!colorsReload));
                    setSelectedFamily([]);
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

    const removeFamilyHandler = () => {

        const formData = new FormData();

        formData.append('color_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));

        fetch('/virtual_options/remove_color_family', {
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
                    dispatch(setColorsReload(!colorsReload));

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


    const getColorAndItsFamiliesHandler = (id) => {

        setUpdateColorId(id);
        setActive2(true);

        const formData = new FormData();
        formData.append('color_id', id);

        fetch('/virtual_options/get_color_and_its_families', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setColorName(data.data.color);
                let temp = [];
                data.data.families.forEach(element => {
                    temp.push({
                        value: element.id,
                        label: element.name
                    });
                });
                setSelectedFamily(temp);
            });
    }

    const colorFamiliesChangesHandler = () => {

        const formData = new FormData();

        formData.append('color_ids', JSON.stringify([updateColorId]));
        formData.append('families', JSON.stringify(selectedFamily));
        formData.append('sync_only', true);

        fetch('/virtual_options/assign_color_family', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                setActive2(false);

                if (data.success == true) {
                    setFlag("success");
                    setFlagMessage(data.message);
                    dispatch(setColorsReload(!colorsReload));
                    setSelectedFamily([]);
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
                title="Select Color Families"
                primaryAction={{
                    content: 'Assign',
                    onAction: assignColorFamilyHandler,
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
                        components={{
                            Option: InputOption
                        }}
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                        }}
                        isMulti
                        placeholder="Select Color Family"
                        options={familiesOptions}
                        value={selectedFamily}
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        onChange={(e) => setSelectedFamily(e)}
                    />
                </Modal.Section>
            </Modal>
            <Modal
                open={active2}
                onClose={handleChange2}
                title="Manage Color Families"
                primaryAction={{
                    content: 'Assign',
                    onAction: colorFamiliesChangesHandler,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleChange2,
                    },
                ]}
            >
                <Modal.Section>
                    <div style={{ marginBottom: "10px" }}>
                        <span style={{ fontWeight: "600" }}>Color Name:</span><span> {colorName} </span>
                    </div>

                    <Select
                        components={{
                            Option: InputOption
                        }}
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                        }}
                        isMulti
                        placeholder="Select Color Family"
                        options={familiesOptions}
                        value={selectedFamily}
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        onChange={(e) => setSelectedFamily(e)}
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
                            { title: 'Color' },
                            { title: 'Family' },
                            { title: 'Action' },
                            // { title: 'Float' },
                        ]}
                    >
                        {rowMarkup}
                    </IndexTable>
                </div>
                <hr></hr>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '18px' }}>
                    <Pagination hasNext={pagination.next_cursor ? true : false} hasPrevious={pagination.prev_cursor ? true : false} onNext={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.next_page_url
                        })
                        setCurrentCursor(pagination.next_cursor);
                        dispatch(setColorsReload(!colorsReload));
                    }} onPrevious={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.prev_page_url
                        })
                        setCurrentCursor(pagination.prev_cursor);
                        dispatch(setColorsReload(!colorsReload));
                    }} />
                </div>
            </Card>
        </div >
    );

    function disambiguateLabel(key, value) {
        switch (key) {
            case "filterbyfamily":
                return `Filtered by family: ${value.map((val) => val).join(", ")}`;
            case "filterbyshop":
                return `Filtered by shop: ${value.map((val) => val).join(", ")}`;
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

export default ColorsTable;
