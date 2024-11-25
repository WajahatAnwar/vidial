import { Button, Modal, TextField } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useState } from 'react';
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';

import Select, { components } from 'react-select';
import { useCallback } from 'react';
import ModalTable from "./ModalTable";
import { useSelector, useDispatch } from 'react-redux';
import { setUpdateFamilyId, setColorsReload, setToastMessage, setToastActive } from '@/ReactJs/reducers/ClubColorSlice';
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';

const ColorsSelect = () => {

    const colorsReload = useSelector((state) => state.clubColor.colorsReload);
    const updateFamilyId = useSelector((state) => state.clubColor.updateFamilyId);
    const dispatch = useDispatch();

    const [selectedOption, setSelectedOption] = useState(false);

    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const [familiesOptions, setFamiliesOptions] = useState([]);
    const [newFamilyName, setNewFamilyName] = useState("");
    const [updateFamilyName, setUpdateFamilyName] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => {
        setFlag(false);
        setActive(!active);
        setNewFamilyName("");
    }, [active]);

    const [active2, setActive2] = useState(false);
    const handleChange2 = useCallback(() => {
        setFlag(false);
        setActive2(!active2);
    }, [active2]);

    useEffect(() => {

        fetch('/virtual_options/color_families_list')
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
                                <div id="one" onClick={() => editColorFamilyHandler(element.id)} style={{ cursor: "pointer", textDecoration: "underline" }}>
                                    Edit
                                </div>
                            </div>
                    });
                });

                setFamiliesOptions(temp);
            })
            .catch((error) => {
                console.error(error);
            });

    }, [colorsReload]);

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

    const addFamilyHandler = () => {

        const formData = new FormData();

        formData.append('name', newFamilyName);

        fetch('/virtual_options/add_color_family', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    setActive(false);
                    setNewFamilyName("");
                    setFlag(false);
                    dispatch(setColorsReload(!colorsReload));
                    dispatch(setToastMessage(data.message));
                    dispatch(setToastActive(true));
                } else {
                    setFlag("error");
                    setFlagMessage(data.message);
                }
            })
            .catch((error) => {

                console.error(error);
            });
    }

    const editColorFamilyHandler = (id) => {
        setActive2(true);
        dispatch(setUpdateFamilyId(id));

        const formData = new FormData();

        formData.append('editing_id', id);

        fetch('/virtual_options/get_family_editing_data', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success == true) {
                    setUpdateFamilyName(data.data.data1.name);
                }
            })
    }

    const updateFamilyNameHandler = () => {

        const formData = new FormData();

        formData.append('editing_id', updateFamilyId);
        formData.append('name', updateFamilyName);

        fetch('/virtual_options/update_family_name', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);


                if (data.success == true) {
                    setActive2(false);
                    setUpdateFamilyName("");
                    setFlag(false)
                    dispatch(setColorsReload(!colorsReload));
                    dispatch(setUpdateFamilyId(false));
                    dispatch(setToastMessage(data.message));
                    dispatch(setToastActive(true));
                } else {
                    setFlag("error");
                    setFlagMessage(data.message);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const deleteFamilyHandler = () => {
        const formData = new FormData();

        formData.append('editing_id', updateFamilyId);

        fetch('/virtual_options/delete_family', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    setActive2(false);
                    setUpdateFamilyName("");
                    setFlag(false);
                    dispatch(setColorsReload(!colorsReload));
                    dispatch(setUpdateFamilyId(false));
                    dispatch(setToastMessage(data.message));
                    dispatch(setToastActive(true));
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

    return (
        <div>
            <Modal
                open={active}
                small
                onClose={handleChange}
                title="Enter Family Name"
                primaryAction={{
                    content: 'Add',
                    onAction: addFamilyHandler,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleChange,
                    },
                ]}
            >
                <Modal.Section>
                    <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} mB={"20px"} />
                    <TextField label="Family Name" value={newFamilyName} onChange={(e) => setNewFamilyName(e)} type='text' />
                </Modal.Section>
            </Modal>
            <Modal
                open={active2}
                onClose={handleChange2}
                title="Color Family Details"
                secondaryActions={[
                    {
                        destructive: true,
                        content: 'Delete',
                        onAction: deleteFamilyHandler,
                    },
                ]}
                primaryAction={{
                    content: 'Save',
                    onAction: updateFamilyNameHandler,
                }}
            >
                <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} m={"10px"} mT={"10px"} />
                <div style={{ margin: "10px 10px 0px 10px", width: "48%" }}>
                    <TextField
                        type="text"
                        label="Color Family Name"
                        value={updateFamilyName}
                        onChange={(e) => setUpdateFamilyName(e)}
                    />
                </div>
                <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                    <hr></hr>
                </div>
                <ModalTable />
            </Modal>
            <Select
                components={{ Menu }}
                menuPortalTarget={document.body}
                styles={{
                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                    // control: (baseStyles, state) => ({
                    //     ...baseStyles,
                    //     borderColor: state.isFocused ? 'grey' : 'red',
                    // }),
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
                placeholder="Select Color Family"
                options={familiesOptions}
                menuIsOpen={open}
                onMenuOpen={() => setOpen(true)}
                onMenuClose={() => setOpen(false)}
                value={selectedOption}
                onChange={(e) => setSelectedOption(e)}
            />
        </div>
    );
}

export default ColorsSelect;
