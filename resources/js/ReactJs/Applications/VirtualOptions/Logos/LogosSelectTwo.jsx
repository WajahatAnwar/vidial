import { Modal, TextField } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useState } from 'react';
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';

import Select from 'react-select';
import { useCallback } from 'react';
import ModalTableTwo from "./ModalTableTwo";
import { useSelector, useDispatch } from 'react-redux';
import { setUpdateFamilyId } from '@/ReactJs/reducers/ClubColorSlice';

const LogosSelectTwo = () => {

    const logosReload = useSelector((state) => state.clubColor.logosReload);
    const dispatch = useDispatch();

    const [selectedOption, setSelectedOption] = useState(false);

    const [familiesOptions, setFamiliesOptions] = useState([]);
    const [updateFamilyName, setUpdateFamilyName] = useState("");
    const [open, setOpen] = useState(false);

    const [active2, setActive2] = useState(false);
    const handleChange2 = useCallback(() => {
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

    }, [logosReload]);

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

    return (
        <div>
            <Modal
                open={active2}
                onClose={handleChange2}
                title="Color Family Details"
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: handleChange2,
                    },
                ]}
            >
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
                <ModalTableTwo />
            </Modal>
            <Select
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

export default LogosSelectTwo;
