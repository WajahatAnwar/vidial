import { setAddOptionModal, setOptionsReload, setOptionTableAllResourcesSelected, setOptionTableAssignOptionSetModal, setOptionTableSearchQuery, setOptionTableSelectedResources, setUpdateOptionId } from '@/ReactJs/reducers/ClubColorSlice';
import { IndexTable, Card, Select as ShopifySelect, Filters, useIndexResourceState, Pagination, ChoiceList, Spinner, Badge, Modal, Link } from '@shopify/polaris';
import { Button } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';

import OptionSetModalTable from './OptionSetModalTable';

const OptionsTable = ({ defaultEntries, indexPath }) => {

    const optionsReload = useSelector((state) => state.clubColor.optionsReload);
    const optionTableAssignOptionSetModal = useSelector((state) => state.clubColor.optionTableAssignOptionSetModal);
    const optionTableSearchQuery = useSelector((state) => state.clubColor.optionTableSearchQuery);
    const dispatch = useDispatch();

    const resourceName = {
        singular: 'option',
        plural: 'options',
    };

    let timeout = null;
    const [loading, setLoading] = useState(false);
    const [queryValue, setQueryValue] = useState("");
    const [optionSetFilter, setOptionSetFilter] = useState([]);
    const [pageCount, setPageCount] = useState(defaultEntries);
    const [curentCursor, setCurrentCursor] = useState(null);
    const [optionSetOptions, setOptionSetOptions] = useState(null);

    const [tableRows, setTableRows] = useState([]);

    // console.log(indexPath);

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

        if (optionSetFilter.length != 0) {
            url.searchParams.set('q2', JSON.stringify(optionSetFilter));
        } else {
            url.searchParams.delete('q2');
        }
        dispatch(setOptionTableSearchQuery(url));
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
                                option_name: element.option_name,
                                required: element.required,
                                option_type_id: element.option_type_id,
                                option_type_name: element.option_type.name,
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


        fetch('/virtual_options/options_sets_list')
            .then((response) => response.json())
            .then((data) => {

                let temp = [];
                data.data.forEach(element => {
                    temp.push({
                        value: element.id,
                        label: element.name
                    });
                });

                setOptionSetOptions(temp);
            });

    }, [optionsReload])

    const handleFiltersQueryChange = useCallback(
        (value) => {
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                dispatch(setOptionsReload(!optionsReload));
            }, 500);
        },
        [tableRows]
    );

    const handleOptionSetFilterChange = useCallback(
        (value) => {
            setOptionSetFilter(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                dispatch(setOptionsReload(!optionsReload));
            }, 500);
        },
        [tableRows]
    );

    const handlePageCount = useCallback((value) => { setPageCount(value); console.log(value); setCurrentCursor(null); dispatch(setOptionsReload(!optionsReload)); }, [tableRows]);

    const handleOptionSetFilterRemove = useCallback(() => { setOptionSetFilter([]); setCurrentCursor(null); dispatch(setOptionsReload(!optionsReload)); }, [tableRows]);
    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); dispatch(setOptionsReload(!optionsReload)); }, [tableRows]);

    const handleClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleOptionSetFilterRemove();
    }, [handleQueryValueRemove, handleOptionSetFilterRemove]);

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);

    useEffect(() => {

        if (optionTableAssignOptionSetModal == false) {
            handleSelectionChange('all', false);
        }

    }, [optionTableAssignOptionSetModal]);

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const promotedBulkActions = [
        {
            content: 'Choose Option Set',
            onAction: () => {
                dispatch(setOptionTableAssignOptionSetModal(true));
                dispatch(setOptionTableAllResourcesSelected(allResourcesSelected));
                dispatch(setOptionTableSelectedResources(selectedResources))
            },
        }, {
            content: 'Delete Selected',
            onAction: () => {
                deleteSelectedOptionsHandler();
            },
        },

    ];

    const filters = [
        {
            key: "filterbyoptionset",
            label: "Filter by Option Set",
            filter: (
                <ChoiceList
                    title="Option Set Type"
                    titleHidden
                    choices={optionSetOptions}
                    selected={optionSetFilter || []}
                    onChange={handleOptionSetFilterChange}
                    allowMultiple
                />
            ),
            // shortcut: false,
        },
    ];

    const appliedFilters = [];

    if (!isEmpty(optionSetFilter)) {
        const key = "filterbyoptionset";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, optionSetFilter),
            onRemove: handleOptionSetFilterRemove,
        });
    }

    const rowMarkup = tableRows.map(
        ({ id, option_name, required, option_type_id, option_type_name }, index) => (
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
                    <div className='custom_style more_styles'>
                        <Link
                            dataPrimaryLink
                        >
                            {option_name}
                        </Link>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {
                        required ? <div key={index} style={{ marginLeft: "5px", display: "inline" }}><Badge tone='success'>True</Badge></div> :
                            <div key={index} style={{ marginLeft: "5px", display: "inline" }}><Badge tone='critical'>False</Badge></div>
                    }
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {option_type_name}
                </IndexTable.Cell>
                <IndexTable.Cell><Button size='slim' onClick={() => { dispatch(setUpdateOptionId(id)); dispatch(setAddOptionModal(true)) }} outline>Edit</Button></IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const deleteSelectedOptionsHandler = () => {
        const formData = new FormData();

        formData.append('option_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(optionTableSearchQuery.search));

        fetch('/virtual_options/delete_selected_options', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                if (data.success == true) {
                    handleSelectionChange('all', false);
                    dispatch(setOptionsReload(!optionsReload));
                }
            })
    }

    return (
        <div>
            <OptionSetModalTable />
            <Card>
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "" }}>
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
                        queryPlaceholder="Search Options..."
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
                        promotedBulkActions={promotedBulkActions}
                        headings={[
                            { title: 'Id' },
                            { title: 'Option Name' },
                            { title: 'Required' },
                            { title: 'Option Type' },
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
                        dispatch(setOptionsReload(!optionsReload));
                    }} onPrevious={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.prev_page_url
                        })
                        setCurrentCursor(pagination.prev_cursor);
                        dispatch(setOptionsReload(!optionsReload));
                    }} />
                </div>
            </Card>
        </div>
    );

    function disambiguateLabel(key, value) {
        switch (key) {
            case "filterbyoptionset":
                return `Filtered by option set: ${value.map((val) => val).join(", ")}`;
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

export default OptionsTable;
