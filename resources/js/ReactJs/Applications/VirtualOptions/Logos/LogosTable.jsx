import { IndexTable, Card, Select as ShopifySelect, Filters, useIndexResourceState, Pagination, ChoiceList, Spinner, Badge, Modal, Link, Thumbnail } from '@shopify/polaris';
import { Button } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useState, useCallback } from 'react';
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';

import ColorFamilyModalTable from './ColorFamilyModalTable';
import LogoGroupModalTable from './LogoGroupModalTable';
import { useDispatch, useSelector } from 'react-redux';
import {
    setAddLogoModal,
    setLogosReload,
    setLogoTableAllResourcesSelected,
    setLogoTableSelectedResources,
    setLogoTableAssignColorFamilyModal,
    setLogoTableAssignLogoGroupModal,
    setUpdateLogoId,
    setToastActive,
    setToastMessage,
    setLogoTableSearchQuery
} from '@/ReactJs/reducers/ClubColorSlice';


const LogosTable = ({ defaultEntries, indexPath }) => {

    const logosReload = useSelector((state) => state.clubColor.logosReload);
    const logoTableAssignColorFamilyModal = useSelector((state) => state.clubColor.logoTableAssignColorFamilyModal);
    const logoTableAssignLogoGroupModal = useSelector((state) => state.clubColor.logoTableAssignLogoGroupModal);
    const logoTableSearchQuery = useSelector((state) => state.clubColor.logoTableSearchQuery);
    const dispatch = useDispatch();

    const resourceName = {
        singular: 'logo',
        plural: 'logos',
    };

    let timeout = null;
    const [loading, setLoading] = useState(false);
    const [queryValue, setQueryValue] = useState("");
    const [familyFilter, setFamilyFilter] = useState([]);
    const [logoGroupFilter, setLogoGroupFilter] = useState([]);
    const [pageCount, setPageCount] = useState(defaultEntries);
    const [curentCursor, setCurrentCursor] = useState(null);
    const [tableRows, setTableRows] = useState([]);

    const [familyOptions, setFamilyOptions] = useState([]);
    const [logoGroupOptions, setLogoGroupOptions] = useState([]);

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

        if (curentCursor) {
            url.searchParams.set('cursor', curentCursor);
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        if (familyFilter.length != 0) {
            url.searchParams.set('q2', JSON.stringify(familyFilter));
        } else {
            url.searchParams.delete('q2');
        }

        if (logoGroupFilter.length != 0) {
            url.searchParams.set('q3', JSON.stringify(logoGroupFilter));
        } else {
            url.searchParams.delete('q3');
        }
        dispatch(setLogoTableSearchQuery(url));
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((element, index) => {
                        let tags = [];
                        if (element.tags != null) tags = element.tags.split(",");

                        my_rows.push(
                            {
                                id: element.id,
                                code_name: element.code_name,
                                color_hash: element.color_hash,
                                logo_image_link: element.logo_image_link,
                                tags: tags,
                                stitch_count: element.stitch_count ? element.stitch_count : 'N/A',
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

        fetch('/virtual_options/get_add_logo_data')
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                let temp = [];
                data.data.data1.forEach(element => {
                    temp.push({
                        value: element.id,
                        label: element.name
                    });
                });
                setLogoGroupOptions(temp);

                temp = [];
                data.data.data2.forEach(element => {
                    temp.push({
                        value: element.id,
                        label: element.name
                    });
                });
                setFamilyOptions(temp);
            });

    }, [logosReload])

    const handleFiltersQueryChange = useCallback(
        (value) => {
            setQueryValue(value);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                dispatch(setLogosReload(!logosReload));
            }, 500);
        },
        [tableRows]
    );

    const handleFamilyFilterChange = useCallback(
        (value) => {
            setFamilyFilter(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                dispatch(setLogosReload(!logosReload));
            }, 500);
        },
        [tableRows]
    );

    const handleLogoGroupFilterChange = useCallback(
        (value) => {
            setLogoGroupFilter(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                dispatch(setLogosReload(!logosReload));
            }, 500);
        },
        [tableRows]
    );


    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); dispatch(setLogosReload(!logosReload)); }, [tableRows]);

    const handleFamilyFilterRemove = useCallback(() => { setFamilyFilter([]); setCurrentCursor(null); dispatch(setLogosReload(!logosReload)) }, [tableRows]);
    const handleLogoGroupFilterRemove = useCallback(() => { setLogoGroupFilter([]); setCurrentCursor(null); dispatch(setLogosReload(!logosReload)) }, [tableRows]);
    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); dispatch(setLogosReload(!logosReload)) }, [tableRows]);

    const handleClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleFamilyFilterRemove();
        handleLogoGroupFilterRemove();
    }, [handleQueryValueRemove, handleLogoGroupFilterRemove, handleFamilyFilterRemove]);

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);

    useEffect(() => {

        if (logoTableAssignColorFamilyModal == false) {
            handleSelectionChange('all', false);
        }

    }, [logoTableAssignColorFamilyModal]);

    useEffect(() => {

        if (logoTableAssignLogoGroupModal == false) {
            handleSelectionChange('all', false);
        }

    }, [logoTableAssignLogoGroupModal]);

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const promotedBulkActions = [
        {
            content: 'Choose Color Family',
            onAction: () => {
                dispatch(setLogoTableAssignColorFamilyModal(true));
                dispatch(setLogoTableAllResourcesSelected(allResourcesSelected));
                dispatch(setLogoTableSelectedResources(selectedResources))
            },
        }, {
            content: 'Choose Logo Group',
            onAction: () => {
                dispatch(setLogoTableAssignLogoGroupModal(true));
                dispatch(setLogoTableAllResourcesSelected(allResourcesSelected));
                dispatch(setLogoTableSelectedResources(selectedResources))
            },
        },

    ];

    const deleteLogosHandler = () => {

        const formData = new FormData();

        formData.append('logo_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(logoTableSearchQuery.search));


        fetch('/virtual_options/delete_logos', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    dispatch(setLogosReload(!logosReload));
                    dispatch(setToastActive(true));
                    dispatch(setToastMessage(data.message));
                    handleSelectionChange('all', false);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const bulkActions = [
        {
            content: 'Delete Selected',
            onAction: deleteLogosHandler,
        },
    ];

    const filters = [
        {
            key: "filterbyfamily",
            label: "Filter by Family",
            filter: (
                <ChoiceList
                    title="Family Type"
                    titleHidden
                    choices={familyOptions}
                    selected={familyFilter || []}
                    onChange={handleFamilyFilterChange}
                    allowMultiple
                />
            ),
            // shortcut: false,
        },
        {
            key: "filterbygroup",
            label: "Filter by Logo Group",
            filter: (
                <ChoiceList
                    title="Logo Group Type"
                    titleHidden
                    choices={logoGroupOptions}
                    selected={logoGroupFilter || []}
                    onChange={handleLogoGroupFilterChange}
                    allowMultiple
                />
            ),
            // shortcut: false,
        },
    ];

    const appliedFilters = [];

    if (!isEmpty(familyFilter)) {
        const key = "filterbyfamily";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, familyFilter),
            onRemove: handleFamilyFilterRemove,
        });
    }

    if (!isEmpty(logoGroupFilter)) {
        const key = "filterbygroup";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, logoGroupFilter),
            onRemove: handleLogoGroupFilterRemove,
        });
    }

    const rowMarkup = tableRows.map(
        ({ id, code_name, color_hash, logo_image_link, tags, stitch_count }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <Thumbnail
                        source={`${window.appURL}/${logo_image_link}`}
                        alt="logo_image"
                    />
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>
                        <Link
                            dataPrimaryLink
                        >
                            {code_name}
                        </Link>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {color_hash}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {stitch_count}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {tags.length > 0 ? tags.map((value, index) => (
                        <div key={index} style={{ marginLeft: "5px", display: "inline" }}><Badge>{value}</Badge></div>
                    )) : 'N/A'}
                </IndexTable.Cell>
                <IndexTable.Cell><Button size='slim' onClick={() => { dispatch(setUpdateLogoId(id)); dispatch(setAddLogoModal(true)) }} outline>Edit</Button></IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <div>
            <ColorFamilyModalTable />
            <LogoGroupModalTable />
            <Card>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                    <IndexTable
                        resourceName={resourceName}
                        itemCount={tableRows.length}
                        selectedItemsCount={
                            allResourcesSelected ? 'All' : selectedResources.length
                        }
                        onSelectionChange={handleSelectionChange}
                        hasMoreItems
                        bulkActions={bulkActions}
                        promotedBulkActions={promotedBulkActions}
                        headings={[
                            { title: 'Logo' },
                            { title: 'Color Code' },
                            { title: 'Color Hash' },
                            { title: 'Stitch' },
                            { title: 'Tags' },
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
                        dispatch(setLogosReload(!logosReload));
                    }} onPrevious={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.prev_page_url
                        })
                        setCurrentCursor(pagination.prev_cursor);
                        dispatch(setLogosReload(!logosReload));
                    }} />
                </div>
            </Card>
        </div>
    );

    function disambiguateLabel(key, value) {
        switch (key) {
            case "filterbyfamily":
                return `Filtered by family: ${value.map((val) => val).join(", ")}`;
            case "filterbygroup":
                return `Filtered by logo group: ${value.map((val) => val).join(", ")}`;
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

export default LogosTable;
