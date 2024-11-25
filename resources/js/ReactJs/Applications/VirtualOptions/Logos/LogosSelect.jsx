import { Button, Modal, TextField } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useState } from 'react';
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';

import Select, { components } from 'react-select';
import { useCallback } from 'react';
import ModalTableOne from "./ModalTableOne";
import { useSelector, useDispatch } from 'react-redux';
import { setLogosReload, setToastActive, setToastMessage, setUpdateLogoGroupId } from '@/ReactJs/reducers/ClubColorSlice';
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';

const LogosSelect = () => {

    const logosReload = useSelector((state) => state.clubColor.logosReload);
    const updateLogoGroupId = useSelector((state) => state.clubColor.updateLogoGroupId);
    const dispatch = useDispatch();

    const [selectedOption, setSelectedOption] = useState(false);

    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const [groupOptions, setGroupOptions] = useState([]);
    const [newGroup, setNewGroup] = useState("");
    const [updateLogoGroupName, setUpdateLogoGroupName] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(false);

    const handleChange = useCallback(() => {
        setFlag(false);
        setActive(!active);
        setNewGroup("");
    }, [active]);

    const [active2, setActive2] = useState(false);
    const handleChange2 = useCallback(() => {
        setFlag(false);
        setActive2(!active2);
    }, [active2]);

    useEffect(() => {

        fetch('/virtual_options/logo_groups_list')
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
                                <div id="one" onClick={() => editLogoGroupHandler(element.id)} style={{ cursor: "pointer", textDecoration: "underline" }}>
                                    Edit
                                </div>
                            </div>
                    });
                });
                setGroupOptions(temp);
            })
            .catch((error) => {
                console.error(error);
            });

    }, [logosReload]);

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

    const addGroupHandler = () => {

        const formData = new FormData();

        formData.append('name', newGroup);

        fetch('/virtual_options/add_logo_group', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    setActive(false);
                    setNewGroup("");
                    setFlag(false);
                    dispatch(setLogosReload(!logosReload));
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

    const editLogoGroupHandler = (id) => {
        setActive2(true);
        dispatch(setUpdateLogoGroupId(id));

        const formData = new FormData();

        formData.append('editing_id', id);

        fetch('/virtual_options/get_logo_group_editing_data', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                if (data.success == true) {
                    setUpdateLogoGroupName(data.data.name);
                }
            })
    }

    const updateLogoGroupNameHandler = () => {

        const formData = new FormData();

        formData.append('editing_id', updateLogoGroupId);
        formData.append('name', updateLogoGroupName);

        fetch('/virtual_options/update_logo_group_name', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    setActive2(false);
                    setUpdateLogoGroupName("");
                    setFlag(false)
                    dispatch(setLogosReload(!logosReload));
                    dispatch(setUpdateLogoGroupId(false));
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

    const deleteLogoGroupHandler = () => {
        const formData = new FormData();

        formData.append('editing_id', updateLogoGroupId);

        fetch('/virtual_options/delete_logo_group', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    setActive2(false);
                    setUpdateLogoGroupName("");
                    setFlag(false);
                    dispatch(setLogosReload(!logosReload));
                    dispatch(setUpdateLogoGroupId(false));
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

    return (
        <div>
            <Modal
                open={active}
                small
                onClose={handleChange}
                title="Enter Group Name"
                primaryAction={{
                    content: 'Add',
                    onAction: addGroupHandler,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleChange,
                    },
                ]}
            >
                <Modal.Section>
                    <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} />
                    <TextField label="Group Name" value={newGroup} onChange={(e) => setNewGroup(e)} type='text' />
                </Modal.Section>
            </Modal>
            <Modal
                open={active2}
                onClose={handleChange2}
                title="Logo Group Details"
                secondaryActions={[
                    {
                        destructive: true,
                        content: 'Delete',
                        onAction: deleteLogoGroupHandler,
                    },
                ]}
                primaryAction={{
                    content: 'Save',
                    onAction: updateLogoGroupNameHandler,
                }}
            >
                <div style={{ margin: "10px 10px 0px 10px" }}>
                    <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} mB={10} />
                    <TextField
                        type="text"
                        label="Logo Group Name"
                        value={updateLogoGroupName}
                        onChange={(e) => setUpdateLogoGroupName(e)}
                    />
                </div>
                <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                    <hr></hr>
                </div>

                <ModalTableOne />
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
                placeholder="Select Logo Group"
                options={groupOptions}
                menuIsOpen={open}
                onMenuOpen={() => setOpen(true)}
                onMenuClose={() => setOpen(false)}
                value={selectedOption}
                onChange={(e) => setSelectedOption(e)}
            />
        </div>
    );
}

export default LogosSelect;
