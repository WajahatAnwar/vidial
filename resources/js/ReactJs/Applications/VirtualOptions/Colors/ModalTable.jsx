import { TextField, Button, ResourceList, ResourceItem, Grid, Pagination, Spinner } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setColorsReload } from '@/ReactJs/reducers/ClubColorSlice';

function ModalTable() {

    const colorsReload = useSelector((state) => state.clubColor.colorsReload);
    const updateFamilyId = useSelector((state) => state.clubColor.updateFamilyId);

    const dispatch = useDispatch();


    let timeout = null;
    const [selectedItems, setSelectedItems] = useState([]);
    const [queryValue, setQueryValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentCursor, setCurrentCursor] = useState(null);
    const [tableRows, setTableRows] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("colors.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    useEffect(() => {

        let url = new URL(pagination.path);

        if (updateFamilyId) {
            url.searchParams.set('family_id', updateFamilyId);
        }

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
                                url: element.color,
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

    }, [colorsReload])

    const handleQueryValueChange = useCallback(
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

    const resourceName = {
        singular: 'color',
        plural: 'colors',
    };

    const promotedBulkActions = [
        {
            content: 'Remove Color',
            onAction: () => removeFamilyHandler(),
        },
    ];

    function renderItem(item) {
        const { id, url } = item;
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
                        {url}
                    </div>
                    <div style={{ width: "30%" }}>
                        <Button size='slim' onClick={() => removeSingleFamilyHandler(id)}> Remove </Button>
                    </div>
                </div>
            </ResourceItem >
        );
    }

    const removeFamilyHandler = () => {

        const formData = new FormData();
        formData.append('color_ids', JSON.stringify(selectedItems));
        formData.append('family_id', updateFamilyId);
        furtherFunctionHandler(formData);
    }

    const removeSingleFamilyHandler = (id) => {
        const formData = new FormData();
        formData.append('color_ids', JSON.stringify([id]));
        formData.append('family_id', updateFamilyId);
        furtherFunctionHandler(formData);
    }

    const furtherFunctionHandler = (formData) => {

        fetch('/virtual_options/remove_color_family', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    dispatch(setColorsReload(!colorsReload));
                    setSelectedItems([]);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <div>
            <div style={{ margin: "0px 10px 0px 10px" }}>
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
                        <h3 className='Polaris-TextStyle--variationStrong'>Color</h3>
                    </div>
                    <div style={{ width: "30%" }}>
                        <h3 className='Polaris-TextStyle--variationStrong'>Action</h3>
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
                promotedBulkActions={promotedBulkActions}
            />
            <hr></hr>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px', paddingBottom: '22px' }}>
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
        </div>
    );
}

export default ModalTable;
