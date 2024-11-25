
import { Grid, Icon, TextField, Tooltip, Tag, Text, Thumbnail, DropZone, Modal, Popover, hsbToHex, ColorPicker, rgbToHsb } from '@shopify/polaris';
import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { InfoIcon, NoteIcon } from '@shopify/polaris-icons';
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';

import Select, { components } from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import ColorWheel from '@/ReactJs/Applications/VirtualOptions/Assets/images/color_wheel.png';
import { setAddLogoModal, setLogosReload, setToastActive, setToastMessage, setUpdateLogoId } from '@/ReactJs/reducers/ClubColorSlice';
import Convert from 'color-convert';
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';

const AddLogo = () => {

    const logosReload = useSelector((state) => state.clubColor.logosReload);
    const updateLogoId = useSelector((state) => state.clubColor.updateLogoId);
    const addLogoModal = useSelector((state) => state.clubColor.addLogoModal);
    const dispatch = useDispatch();

    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const handleChange = useCallback(() => {
        setFlag(false);
        dispatch(setAddLogoModal(!addLogoModal));
    }, [addLogoModal]);

    useEffect(() => {
        setFile(false);
    }, [addLogoModal]);

    const [colorFamilies, setColorFamilies] = useState([]);
    const [logoGroupsOptions, setLogoGroupsOptions] = useState([]);
    const [selectedFamily, setSelectedFamily] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState([]);
    const [logoCode, setLogoCode] = useState("");
    const [currentImage, setCurrentImage] = useState(false);

    const [colorHex, setColorHex] = useState('#000000');
    const [color, setColor] = useState({
        hue: 0,
        brightness: 0,
        saturation: 0,
    });

    const [popoverActive, setPopoverActive] = useState(false);

    const togglePopoverActive = useCallback(
        () => setPopoverActive((popoverActive) => !popoverActive),
        [],
    );

    const activator = (
        <button style={{ marginRight: "10px" }} onClick={() => setPopoverActive(true)}>
            <img src={ColorWheel} style={{ marginTop: "3px" }}></img>
        </button>
    );


    useEffect(() => {

        setFlag(false);

        if (updateLogoId) {
            fetch(`/virtual_options/get_logo_editing_data?logo_id=${updateLogoId}`)
                .then((response) => response.json())
                .then((data) => {
                    // console.log(data);

                    setLogoCode(data.data.code_name);
                    setColorHex(data.data.color_hash);
                    let rgb_temp = Convert.hex.rgb(data.data.color_hash);
                    setColor(rgbToHsb({
                        red: rgb_temp[0],
                        green: rgb_temp[1],
                        blue: rgb_temp[2]
                    }));
                    let temp = [];
                    data.data.families.forEach(element => temp.push({ value: element.id, label: element.name }));
                    setSelectedFamily(temp);
                    temp = [];
                    data.data.groups.forEach(element => temp.push({ value: element.id, label: element.name }));
                    setSelectedGroup(temp);
                    if (data.data.tags != null)
                        setSelectedTags(data.data.tags.split(","));
                    else
                        setSelectedTags([]);

                    if (data.data.stitch_count != null)
                        setStitchCount(data.data.stitch_count);
                    else
                        setStitchCount("");

                    setCurrentImage(`${window.appURL}/${data.data.logo_image_link}`);
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            setCurrentImage(false);
            setSelectedFamily([]);
            setSelectedGroup([]);
            setSelectedTags([]);
            setStitchCount("");
            setColorHex("#000000");
            let rgb_temp = Convert.hex.rgb("#000000");
            setColor(rgbToHsb({
                red: rgb_temp[0],
                green: rgb_temp[1],
                blue: rgb_temp[2]
            }));
            setLogoCode("");
        }

    }, [updateLogoId, logosReload]);

    useEffect(() => {

        fetch('/virtual_options/get_add_logo_data')
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                let temp = [];
                data.data.data1.forEach(element => { temp.push({ value: element.id, label: element.name }) });
                setLogoGroupsOptions(temp);
                temp = [];
                data.data.data2.forEach(element => { temp.push({ value: element.id, label: element.name }) });
                setColorFamilies(temp);
            })
            .catch((error) => {
                console.error(error);
            });

    }, [logosReload]);

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

    const [stitchCount, setStitchCount] = useState("");
    const [newTag, setNewTag] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const removeTagInside = useCallback(
        (tag) => () => {
            setSelectedTags((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag),
            );
        }, [],
    );

    const tagMarkup = selectedTags.map((option, index) => (
        <span key={index} style={{ marginLeft: "5px" }}>
            <Tag key={option} onRemove={removeTagInside(option)}>
                {option}
            </Tag>
        </span>
    ));

    const addTagHandler = () => {

        const check = newTag;
        let noErrors = true;

        if (check.trim() == "") {

            noErrors = false;
            setFlag("error");
            setFlagMessage("Tag cannot be null.");
            window.scrollTo(0, 0);

        }

        if (selectedTags.includes(check)) {

            noErrors = false;
            setFlag("error");
            setFlagMessage(`"${newTag}" Same Tag cannot be entered again.`);
            window.scrollTo(0, 0);
        }

        if (noErrors == true) {
            let temp = [...selectedTags];
            temp.push(newTag);

            setNewTag("");
            setSelectedTags(temp);
            setFlag(false);
        }

    }

    const [file, setFile] = useState(false);
    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) =>
            setFile((file) => acceptedFiles[0]),
        [],
    );

    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    const fileUpload = !file && <DropZone.FileUpload />;
    const uploadedFile = file && (
        <div>
            <Thumbnail
                size="small"
                alt={file.name}
                source={
                    validImageTypes.includes(file.type)
                        ? window.URL.createObjectURL(file)
                        : NoteIcon
                }
            />
            <div>
                {file.name}{' '}
                <Text variant="bodySm" as="p">
                    {file.size} bytes
                </Text>
            </div>
        </div>
    );

    const addLogoHandler = () => {

        const formData = new FormData();

        formData.append('logo_code', logoCode);
        formData.append('selected_tags', selectedTags.toString());
        formData.append('selected_group', JSON.stringify(selectedGroup));
        formData.append('selected_family', JSON.stringify(selectedFamily));
        formData.append('stitch_count', stitchCount);
        formData.append('background_color', colorHex);
        if (file) formData.append('logo', file);
        formData.append('logo_id', updateLogoId);

        fetch('/virtual_options/add_logo', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);

                if (data.success == true) {
                    dispatch(setLogosReload(!logosReload));
                    dispatch(setAddLogoModal(false));
                    dispatch(setUpdateLogoId(false));
                    dispatch(setToastActive(true));
                    dispatch(setToastMessage(data.message));
                    setCurrentImage(false);
                    setFlag(false);
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
        <Modal
            size="large"
            open={addLogoModal}
            onClose={handleChange}
            title="Logo Details"
            primaryAction={{
                content: 'Save',
                onAction: addLogoHandler,
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
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                        <TextField label="Logo Code" placeholder='Enter logo code' value={logoCode} onChange={(e) => setLogoCode(e)} type='text' />
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                        <div style={{ display: "flex" }}>
                            <div style={{ width: "100%" }}>
                                <TextField label="Background Color" placeholder='Enter background color hash'
                                    value={colorHex}
                                    onChange={(e) => {
                                        let rgb_temp = Convert.hex.rgb(e);
                                        setColor(rgbToHsb({
                                            red: rgb_temp[0],
                                            green: rgb_temp[1],
                                            blue: rgb_temp[2]
                                        }));
                                        setColorHex(e);
                                    }} type='text' />
                            </div>
                            <div style={{ background: `${colorHex}`, height: "37px", width: "44px", marginTop: "23px", borderRadius: "4px", marginLeft: "10px", boxShadow: '2px 2px 6px -2px rgba(0,0,0,0.75)' }}></div>
                            <div style={{ marginTop: "29px", marginLeft: "10px" }}>
                                <Popover
                                    active={popoverActive}
                                    activator={activator}
                                    autofocusTarget="first-node"
                                    onClose={togglePopoverActive}
                                >
                                    <div style={{ padding: "20px" }}>
                                        <ColorPicker onChange={(e) => {
                                            // console.log(hsbToRgb(e));
                                            setColor(e)
                                            setColorHex(hsbToHex(e))
                                        }} color={color} />
                                    </div>
                                </Popover>
                            </div>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                        <div style={{ marginBottom: "3px" }}>Select Logo Groups</div>
                        <Select
                            components={{
                                Option: InputOption
                            }}
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                            }}
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            placeholder="Select Logo Group"
                            options={logoGroupsOptions}
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e)}
                        />
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                        <div style={{ marginBottom: "3px" }}>Select Color Families</div>
                        <Select
                            components={{
                                Option: InputOption
                            }}
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                            }}
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            placeholder="Select Color Family"
                            options={colorFamilies}
                            value={selectedFamily}
                            onChange={(e) => setSelectedFamily(e)}
                        />
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                        <div style={{ marginBottom: "3px" }}>Upload Logo Image</div>

                        <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                            {uploadedFile}
                            {fileUpload}
                        </DropZone>
                        {currentImage ?
                            <div style={{ marginTop: "10px" }}>
                                <div>Current Image</div>
                                <div style={{ marginTop: "3px" }}>
                                    <Thumbnail
                                        source={currentImage}
                                        alt="current_image"
                                    />
                                </div>
                            </div> : null}
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                        <div style={{ width: "100%", marginRight: "15px", marginBottom: "15px" }}>
                            <div style={{ display: "flex", marginBottom: "4px" }}>
                                <p>Stitch Count</p>
                            </div>
                            <TextField
                                value={stitchCount}
                                onChange={(e) => { setStitchCount(e) }}
                                placeholder="Enter Stitch Count"
                                type="number"
                                style={{ width: "400px" }}
                            />
                        </div>
                        <div>
                            <div style={{ width: "100%", marginRight: "15px" }} onKeyPress={(e) => { if (e.key === "Enter") { addTagHandler(); } }}>
                                <div style={{ display: "flex", marginBottom: "4px" }}>
                                    <p>Tags</p>
                                    <Tooltip content="This is info regarding this function.">
                                        <Text variant="bodyMd" fontWeight="bold" as="span">
                                            <div style={{ marginLeft: "10px" }}> <Icon source={InfoIcon} color="base" /> </div>
                                        </Text>
                                    </Tooltip>
                                </div>
                                <TextField
                                    // prefix={selectedDiscount == "fixed" ? '$' : ''}
                                    // suffix={selectedDiscount == "percentage" ? '%' : ''}
                                    value={newTag}
                                    onChange={(e) => { setNewTag(e) }}
                                    placeholder="Add tag here and press enter..."
                                    type="text"
                                    style={{ width: "400px" }}
                                />
                            </div>
                            <div style={{ marginTop: "8px" }}>
                                <div>{tagMarkup}</div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Modal.Section>
        </Modal>
    );
}

export default AddLogo;
