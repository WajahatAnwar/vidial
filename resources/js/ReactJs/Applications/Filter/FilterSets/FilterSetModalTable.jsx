import { TextField, ResourceList, ResourceItem, Pagination, Spinner, Modal } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setOptionsReload, setOptionTableAllResourcesSelected, setOptionTableAssignOptionSetModal, setOptionTableSelectedResources, setToastActive, setToastMessage } from '@/ReactJs/reducers/ClubColorSlice';

function FilterSetModalTable() {

    const optionsReload = useSelector((state) => state.clubColor.optionsReload);
    const active = useSelector((state) => state.clubColor.optionTableAssignOptionSetModal);
    const selectedResources = useSelector((state) => state.clubColor.optionTableSelectedResources);
    const allResourcesSelected = useSelector((state) => state.clubColor.optionTableAllResourcesSelected);
    const optionTableSearchQuery = useSelector((state) => state.clubColor.optionTableSearchQuery);

    const dispatch = useDispatch();

    const handleChange = useCallback(() => dispatch(setOptionTableAssignOptionSetModal(!active)), [active]);

    let timeout = null;
    const [selectedItems, setSelectedItems] = useState([]);
    const [queryValue, setQueryValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentCursor, setCurrentCursor] = useState(null);
    const [tableRows, setTableRows] = useState([]);

    // console.log(route("filter_sets_table.get"));

    const [pagination, setPagination] = useState({
        path: route("filter_sets_table.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    useEffect(() => {

        let url = new URL(pagination.path);

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

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
                                name: element.name,
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
                setLoading(false);
            });

    }, [optionsReload])

    const handleQueryValueChange = useCallback(
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

    const resourceName = {
        singular: 'option',
        plural: 'options',
    };

    function renderItem(item) {
        const { id, name } = item;
        return (
            <ResourceItem
                id={id}
            >
                <div style={{ display: "flex", justifyContent: '' }}>
                    <div style={{ width: "10%" }}>

                    </div>
                    <div style={{ width: "15%" }}>
                        {id}
                    </div>
                    <div style={{ width: "44%" }}>
                        {name}
                    </div>
                </div>
            </ResourceItem >
        );
    }

    const assignOptionSetHandler = () => {

        const formData = new FormData();

        formData.append('filter_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('filter_set_ids', JSON.stringify(selectedItems));
        formData.append('search_query', JSON.stringify(optionTableSearchQuery.search));

        //NOT FUNCTIONAL
        fetch('/filter/assign_filter_filter_sets', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                if (data.success == true) {
                    dispatch(setOptionsReload(!optionsReload));
                    dispatch(setOptionTableAssignOptionSetModal(false));
                    dispatch(setOptionTableAllResourcesSelected(false));
                    dispatch(setOptionTableSelectedResources([]));
                    setSelectedItems([]);
                    dispatch(setToastActive(true));
                    dispatch(setToastMessage(data.message));
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <Modal
            open={active}
            onClose={handleChange}
            title="Select Filter Sets"
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
            <div style={{ margin: "10px 10px 0px 10px" }}>
                <TextField type="text" onChange={handleQueryValueChange} value={queryValue} placeholder="Filter Items" />
            </div>
            {loading ? <div style={{ boxShadow: "0 1px 4px -2px grey", display: "flex", backgroundColor: "#ebf9fc", padding: "3px", borderRadius: "3px", margin: "0px 10px 0px 10px" }}>
                <Spinner accessibilityLabel="Small spinner example" size="small" />
                <div style={{ fontSize: "12px", marginLeft: "10px" }}> loading results... </div>
            </div> : null}
            <div style={{ marginTop: "10px" }}></div>
            <div style={{ margin: "0px 0px 0px 0px", backgroundColor: "#fcfcfc", padding: "10px 10px 10px 20px", color: "#858585" }}>
                <div style={{ display: "flex", justifyContent: '' }}>
                    <div style={{ width: "15%" }}>
                        <h3 className='Polaris-TextStyle--variationStrong'>Select</h3>
                    </div>
                    <div style={{ width: "15%" }}>
                        <h3 className='Polaris-TextStyle--variationStrong'>ID</h3>
                    </div>
                    <div style={{ width: "40%" }}>
                        <h3 className='Polaris-TextStyle--variationStrong'>Filter Set</h3>
                    </div>
                </div>
            </div>
            <hr></hr>
            <ResourceList
                resourceName={resourceName}
                items={tableRows}
                renderItem={renderItem}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                selectable={true}
            />
            <hr></hr>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px', paddingBottom: '22px' }}>
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
        </Modal >
    );
}

export default FilterSetModalTable;
