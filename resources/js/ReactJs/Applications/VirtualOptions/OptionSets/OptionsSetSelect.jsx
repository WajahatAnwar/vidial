import { Button, Card, Modal, Tabs, TextField } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useState } from 'react';
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';

import Select, { components } from 'react-select';
import { useCallback } from 'react';
import ModalTable from "./ModalTable";
import { useSelector, useDispatch } from 'react-redux';
import { setOptionsReload, setToastActive, setToastMessage, setUpdateOptionSetId } from '@/ReactJs/reducers/ClubColorSlice';
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';
import ModalTableTwo from './ModalTableTwo';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const OptionsSetSelect = () => {

    const optionsReload = useSelector((state) => state.clubColor.optionsReload);
    const updateOptionSetId = useSelector((state) => state.clubColor.updateOptionSetId);
    const dispatch = useDispatch();

    const [selectedOption, setSelectedOption] = useState(false);

    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const [optionSetOptions, setOptionSetOptions] = useState([]);
    const [newOptionSet, setNewOptionSet] = useState("");
    const [updateOptionSetName, setUpdateOptionSetName] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(false);

    const [loadingSort, setLoadingSort] = useState(false);

    const handleChange = useCallback(() => {
        setFlag(false);
        setActive(!active);
        setNewOptionSet("");
    }, [active]);

    const [active2, setActive2] = useState(false);
    const handleChange2 = useCallback(() => {
        setFlag(false);
        setActive2(!active2);
    }, [active2]);

    const [active3, setActive3] = useState(false);
    const handleChange3 = useCallback(() => {
        setFlag(false);
        setActive3(!active3);
    }, [active3]);

    const [selected, setSelected] = useState(0);

    const tabs = [
        {
            id: 'Current Options',
            content: 'Current Options',
        },
        {
            id: 'Add New Options',
            content: 'Add New Options',
        }
    ];

    useEffect(() => {
        setSelected(0);
    }, [updateOptionSetId]);

    useEffect(() => {

        fetch('/virtual_options/options_sets_list')
            .then((response) => response.json())
            .then((data) => {
                let temp = [];
                data.data.forEach(element => {
                    temp.push({
                        value: element.name, label:
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ color: "black" }}>
                                    {element.name}
                                </div>
                                <div style={{ display: "flex" }}>
                                    <div id="two_select" onClick={() => {
                                        dispatch(setUpdateOptionSetId(element.id));
                                        setActive3(true);
                                    }} style={{ cursor: "pointer", textDecoration: "underline", marginRight: "10px" }}>
                                        Sort
                                    </div>
                                    <div id="one" onClick={() => editOptionSetHandler(element.id)} style={{ cursor: "pointer", textDecoration: "underline" }}>
                                        Edit
                                    </div>
                                </div>
                            </div>
                    });
                });
                setOptionSetOptions(temp);
            })
            .catch((error) => {
                console.error(error);
            });

    }, [optionsReload]);

    const Menu = (props) => {
        return (
            <>
                <components.Menu {...props}>
                    <div>
                        <div>{props.children}</div>
                        <div style={{ borderTop: "1px solid #dedede" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 10px 10px 0px" }}>
                                <Button size="slim" onClick={() => { setOpen(false); setActive(true); }}>Add +</Button>
                            </div>
                        </div>

                    </div>
                </components.Menu>
            </>
        );
    };

    const addOptionSetHandler = () => {

        const formData = new FormData();

        formData.append('name', newOptionSet);

        fetch('/virtual_options/add_option_set', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {

                if (data.success == true) {
                    setActive(false);
                    setNewOptionSet("");
                    setFlag(false);
                    dispatch(setOptionsReload(!optionsReload));
                    dispatch(setToastActive(true));
                    dispatch(setToastMessage(data.message));
                } else {
                    setFlag("error");
                    setFlagMessage(data.message);
                }

            })
            .catch((error) => {
                console.error(error);
            });
    }

    const editOptionSetHandler = (id) => {
        setActive2(true);
        dispatch(setUpdateOptionSetId(id));

        const formData = new FormData();

        formData.append('editing_id', id);

        fetch('/virtual_options/get_option_set_editing_data', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                if (data.success == true) {
                    setUpdateOptionSetName(data.data.name);
                }
            })
    }

    const updateOptionSetNameHandler = () => {

        const formData = new FormData();

        formData.append('editing_id', updateOptionSetId);
        formData.append('name', updateOptionSetName);

        fetch('/virtual_options/update_option_set_name', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    setActive2(false);
                    setUpdateOptionSetName("");
                    setFlag(false)
                    dispatch(setOptionsReload(!optionsReload));
                    dispatch(setUpdateOptionSetId(false));
                    dispatch(setToastActive(true));
                    dispatch(setToastMessage(data.message));
                } else {
                    setFlag("error");
                    setFlagMessage(data.message);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const deleteOptionSetHandler = () => {
        const formData = new FormData();

        formData.append('editing_id', updateOptionSetId);

        fetch('/virtual_options/delete_option_set', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    setActive2(false);
                    setUpdateOptionSetName("");
                    setFlag(false);
                    dispatch(setOptionsReload(!optionsReload));
                    dispatch(setUpdateOptionSetId(false));
                    dispatch(setToastActive(true));
                    dispatch(setToastMessage(data.message));
                    setSelectedOption(false);
                } else {
                    setFlag("error");
                    setFlagMessage(data.message);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const [rowData, setRowData] = useState();
    const [gridApi, setGridApi] = React.useState(null);

    const columnDefs = [
        { field: 'Sort', rowDrag: true, sortable: false, menuTabs: [] },
        { field: 'option', width: 275, sortable: false, menuTabs: [] },
        { field: 'type', sortable: false, menuTabs: [] },
    ]

    const onGridReady = useCallback((params) => {
        setGridApi(params.api);

        const formData = new FormData();

        formData.append('option_set_id', updateOptionSetId);

        fetch('/virtual_options/options_list_sort', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((result) => {
                const my_rows = [];
                let dontAdd = false;
                result.data.forEach((element, index) => {
                    if (element.extra == "Color" || element.extra == "Size") {
                        dontAdd = true;
                        my_rows.push(
                            {
                                id: element.id,
                                option: element.extra,
                                type: element.extra,
                            });
                    } else {
                        my_rows.push(
                            {
                                id: element.id,
                                option: element.option_sort?.option_name,
                                type: element.option_sort?.option_type.name,
                            });
                    }
                });

                if (!dontAdd) {
                    my_rows.push({
                        id: 2656726567,
                        option: "Color",
                        type: "Color",
                    })

                    my_rows.push({
                        id: 7493749300,
                        option: "Size",
                        type: "Size",
                    })
                }

                setRowData(my_rows);
            })

    }, [updateOptionSetId]);

    const saveSortHandler = () => {
        setLoadingSort(true);
        const rows = [];
        gridApi.forEachNodeAfterFilterAndSort((node) => rows.push(node.data));
        console.log(rows);

        const formData = new FormData();

        formData.append('option_set_id', updateOptionSetId);
        formData.append('rows', JSON.stringify(rows));

        fetch('/virtual_options/manage_new_sort', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((result) => {
                setFlag("success");
                setFlagMessage(result.message);
                dispatch(setUpdateOptionSetId(false));
                setLoadingSort(false);
            })
    }

    return (
        <div>
            <Modal
                open={active}
                small
                onClose={handleChange}
                title="Enter Option Set Name"
                primaryAction={{
                    content: 'Add',
                    onAction: addOptionSetHandler,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleChange,
                    },
                ]}
            >
                <Modal.Section>
                    <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} mB={"10px"} />
                    <TextField label="Option Set Name" value={newOptionSet} onChange={(e) => setNewOptionSet(e)} type='text' />
                </Modal.Section>
            </Modal>
            <Modal
                open={active2}
                onClose={handleChange2}
                title="Option Set Details"
                secondaryActions={[
                    {
                        destructive: true,
                        content: 'Delete',
                        onAction: deleteOptionSetHandler,
                    },
                ]}
                primaryAction={{
                    content: 'Save',
                    onAction: updateOptionSetNameHandler,
                }}
            >
                <div style={{ margin: "10px 10px 0px 10px" }}>
                    <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} mB={10} />
                    <TextField
                        type="text"
                        label="Option Set Name"
                        value={updateOptionSetName}
                        onChange={(e) => setUpdateOptionSetName(e)}
                    />
                </div>
                <div style={{ paddingTop: "10px", paddingBottom: "0px" }}>
                    <hr></hr>
                </div>

                <Tabs tabs={tabs} selected={selected} onSelect={(e) => setSelected(e)}>
                </Tabs>
                {selected == 0 ?
                    <div style={{ marginTop: "10px" }}>
                        <ModalTable />
                    </div> : selected == 1 ?
                        <div style={{ marginTop: "10px" }}>
                            <ModalTableTwo />
                        </div> :
                        null
                }

            </Modal>
            <Modal
                open={active3}
                onClose={handleChange3}
                title="Change Sort"
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: handleChange3,
                    },
                ]}
                primaryAction={{
                    content: 'Save',
                    onAction: !loadingSort ? saveSortHandler : null,
                }}
            >
                {flag &&
                    <div style={{ margin: "10px 10px 10px 10px" }}>
                        <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} />
                    </div>
                }

                <div style={{ height: '350px', width: '100%' }}>
                    <div style={{ height: '350px', width: '100%' }} className="ag-theme-alpine">
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={{
                                width: 170,
                                sortable: true,
                                filter: true,
                            }}
                            rowDragManaged={true}
                            rowDragMultiRow={true}
                            rowSelection={'multiple'}
                            animateRows={true}
                            onGridReady={onGridReady}
                            sortable={false}
                        />
                    </div>
                </div>
            </Modal>
            <Select
                components={{ Menu }}
                menuPortalTarget={document.body}
                styles={{
                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                    option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? "rgba(189,197,209,.3)" : "white",
                        color: state.isSelected ? "rgb(71 112 220)" : "rgb(71 112 220)",
                    }),
                    singleValue: (provided, state) => ({
                        ...provided,
                        color: state.isSelected ? "white" : "white",
                    }),

                }}
                placeholder="Select Option Set"
                options={optionSetOptions}
                menuIsOpen={open}
                onMenuOpen={() => setOpen(true)}
                onMenuClose={() => setOpen(false)}
                value={selectedOption}
                onChange={(e) => setSelectedOption(e)}
            />
        </div>
    );
}

export default OptionsSetSelect;
