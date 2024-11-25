import { TextField, Button, ResourceList, ResourceItem, Pagination, Spinner, Thumbnail, Badge } from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setOptionsReload } from '@/ReactJs/reducers/ClubColorSlice';
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';

function ModalTableTwo() {

    const optionsReload = useSelector((state) => state.clubColor.optionsReload);
    const updateOptionSetId = useSelector((state) => state.clubColor.updateOptionSetId);

    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const dispatch = useDispatch();

    let timeout = null;
    const [selectedItems, setSelectedItems] = useState([]);
    const [queryValue, setQueryValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentCursor, setCurrentCursor] = useState(null);
    const [tableRows, setTableRows] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("options.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    useEffect(() => {

        let url = new URL(pagination.path);

        if (updateOptionSetId) {
            url.searchParams.set('option_set_id_two', updateOptionSetId);
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

    const promotedBulkActions = [
        {
            content: 'Assign to Current Set',
            onAction: () => addOptionHandler(),
        },
    ];

    function renderItem(item) {
        const { id, option_name, required, option_type_name } = item;
        return (
            <ResourceItem
                id={id}
            >
                <div style={{ display: "flex", justifyContent: '' }}>
                    <div style={{ width: "4%" }}>

                    </div>
                    <div style={{ width: "26%" }}>
                        {option_name}
                    </div>
                    <div style={{ width: "23%" }}>
                        {
                            required ? <div style={{ marginLeft: "5px", display: "inline" }}><Badge tone='success'>True</Badge></div> :
                                <div style={{ marginLeft: "5px", display: "inline" }}><Badge tone='critical'>False</Badge></div>
                        }
                    </div>
                    <div style={{ width: "25%" }}>
                        {option_type_name}
                    </div>
                    <div style={{ width: "15%" }}>
                        <Button size='slim' onClick={() => addSingleOptionHandler(id)}> Add </Button>
                    </div>
                </div>
            </ResourceItem >
        );
    }

    const addOptionHandler = () => {

        const formData = new FormData();
        formData.append('option_set_id', updateOptionSetId);
        formData.append('options_ids', JSON.stringify(selectedItems));
        furtherFunctionHandler(formData);
    }

    const addSingleOptionHandler = (id) => {
        const formData = new FormData();
        formData.append('option_set_id', updateOptionSetId);
        formData.append('options_ids', JSON.stringify([id]));
        furtherFunctionHandler(formData);
    }

    const furtherFunctionHandler = (formData) => {

        fetch('/virtual_options/assign_option_specific', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                if (data.success == true) {
                    dispatch(setOptionsReload(!optionsReload));
                    setSelectedItems([]);
                    setFlag("success");
                    setFlagMessage(data.message);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    return (
        <div>
            <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} m={"10px"} mB={"10px"} mT={"0px"} />
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
                    <div style={{ width: "10%" }}>
                        <h3 className='Polaris-TextStyle--variationStrong'>Select</h3>
                    </div>
                    <div style={{ width: "25%" }}>
                        <h3 className='Polaris-TextStyle--variationStrong'>Option Name</h3>
                    </div>
                    <div style={{ width: "20%" }}>
                        <h3 className='Polaris-TextStyle--variationStrong'>Required</h3>
                    </div>
                    <div style={{ width: "25%" }}>
                        <h3 className='Polaris-TextStyle--variationStrong'>Option Type</h3>
                    </div>
                    <div style={{ width: "20%" }}>
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
        </div>
    );
}

export default ModalTableTwo;
