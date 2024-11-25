
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';
import Doc2 from "@/ReactJs/Applications/VirtualOptions/Assets/images/document2.png";
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';
import Toggle from '@/ReactJs/Components/Toggle';
import { setAddOptionModal, setImagesTableDataForUpdateLogos, setImagesTableRows, setImagesTableStaticRows, setOptionsReload, setSelectedLogoGroupId, setToastActive, setToastMessage, setUpdateOptionId } from '@/ReactJs/reducers/ClubColorSlice';
import { Button, Card, Grid, Icon, Modal, Tag, TextField } from '@shopify/polaris';
import { XIcon, HideIcon, PlusCircleIcon, CheckIcon, ViewIcon, XCircleIcon } from '@shopify/polaris-icons';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import React, { useCallback, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import Select, { components } from 'react-select';
import ImagesTable from './ImagesTable';

const AddEditOption = () => {

    const customStyles = {
        menuPortal: base => ({ ...base, zIndex: 9999 }),
        control: base => ({
            ...base,
            height: 36,
            minHeight: 36,
            border: "1px solid hsl(0, 0%, 62%)"
        })
    };

    const optionsReload = useSelector((state) => state.clubColor.optionsReload);
    const updateOptionId = useSelector((state) => state.clubColor.updateOptionId);
    const selectedLogoGroupId = useSelector((state) => state.clubColor.selectedLogoGroupId);
    const addOptionModal = useSelector((state) => state.clubColor.addOptionModal);
    const imagesTableRows = useSelector((state) => state.clubColor.imagesTableRows);
    const imagesTableStaticRows = useSelector((state) => state.clubColor.imagesTableStaticRows);
    const dispatch = useDispatch();

    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const handleChange = useCallback(() => {
        setFlag(false);
        dispatch(setAddOptionModal(!addOptionModal));
    }, [addOptionModal]);

    const [familiesList, setFamiliesList] = useState(false);
    const [dropdDownFamiliesData, setDropdDownFamiliesData] = useState([]);

    const [allOptionsList, setAllOptionsList] = useState([]);

    const [sortTags, setSortTags] = useState(false);

    const [rowData, setRowData] = useState();
    const [gridApi, setGridApi] = React.useState(null);

    const columnDefs = [
        { field: 'Sort', width: 100, rowDrag: true, sortable: false, menuTabs: [] },
        { field: 'Tag', width: 400, sortable: false, menuTabs: [] },
    ]

    const onGridReady = useCallback((params) => {
        setGridApi(params.api);
        const my_rows = [];
        selectedTags.forEach((element, index) => {
            my_rows.push({
                id: index,
                Tag: element,
            });
        });
        setRowData(my_rows);
    }, [sortTags]);

    useEffect(() => {

        setFlag(false);
        setSortTags(false);

        if (updateOptionId) {
            fetch(`/virtual_options/get_option_editing_data?option_id=${updateOptionId}`)
                .then((response) => response.json())
                .then((data) => {
                    // console.log(data);

                    setOptionName(data.data.option_name);
                    setOptionNameTwo(data.data.frontend_name);
                    setSelectedOptionType({
                        value: data.data.option_type.id,
                        label: data.data.option_type.name
                    });

                    if (data.data.conditions_status) {
                        setSelectedCondition({ label: "Yes", value: true });
                        // setConditionsList(JSON.parse(data.data.conditions_json));

                        // ####################################### CONDITIONS DATA ###############################################

                        let conditions_temp = [];
                        // console.log(data.data.conditions);
                        data.data.conditions.forEach(element => {

                            let selected_type = {
                                "label": element.option_back.option_type.name,
                                "value": element.option_back.option_type.id
                            };

                            let selected_option_outside = {
                                "value": element.option_back.id,
                                "label": element.option_back.option_name
                            };

                            let selected_gate = "";
                            if (element.condition_gate == "or")
                                selected_gate = { "label": "OR", "value": "or" }
                            else
                                selected_gate = { "label": "AND", "value": "and" }

                            let selection_type = "";
                            if (element.condition_type == "equals")
                                selection_type = { "label": "Equals", "value": "equals" }
                            else
                                selection_type = { "label": "Contain", "value": "contain" }

                            if (element.option_back.option_type.id == 1) {

                                let dropdown_options = element.option_back.drop_detail.map(item => ({
                                    value: item.id,
                                    label: item.value,
                                }));

                                let all_drops = allOptionsList.filter(value => value.option_type_id == 1);
                                all_drops = all_drops.map(item => ({
                                    value: item.id,
                                    label: item.option_name,
                                }));

                                let selected_option = element.option_back.drop_detail.find(value => value.value == element.value);

                                if (selected_option) {

                                    selected_option = { label: selected_option.value, value: selected_option.id }

                                    conditions_temp.push({
                                        "selectedType": selected_type,
                                        "typeOptions": all_drops,
                                        "selectedGate": selected_gate,
                                        "selectedCondition": selection_type,
                                        "selectedOption": selected_option_outside,
                                        "optionOptions": dropdown_options,
                                        "selectedOptionOption": selected_option,
                                        "textAreaValue": ""
                                    });
                                }
                            } else if (element.option_back.option_type.id == 9) {

                                let dropdown_options = element.option_back.drop_detail.map(item => ({
                                    value: item.id,
                                    label: item.value,
                                }));

                                let all_drops = allOptionsList.filter(value => value.option_type_id == 9);
                                all_drops = all_drops.map(item => ({
                                    value: item.id,
                                    label: item.option_name,
                                }));

                                let selected_option = element.option_back.drop_detail.find(value => value.value == element.value);

                                if (selected_option) {

                                    selected_option = { label: selected_option.value, value: selected_option.id }

                                    conditions_temp.push({
                                        "selectedType": selected_type,
                                        "typeOptions": all_drops,
                                        "selectedGate": selected_gate,
                                        "selectedCondition": selection_type,
                                        "selectedOption": selected_option_outside,
                                        "optionOptions": dropdown_options,
                                        "selectedOptionOption": selected_option,
                                        "textAreaValue": ""
                                    });
                                }
                            } else if (element.option_back.option_type.id == 2) {

                                let logo_options = element.option_back.logo_detail.map(item => ({
                                    value: item.logo.id,
                                    label: item.logo.code_name,
                                }));

                                let selected_option = element.option_back.logo_detail.find(value => value.logo_id == element.value);

                                if (selected_option) {

                                    selected_option = { label: selected_option.logo.code_name, value: selected_option.logo.id }

                                    let all_logos = allOptionsList.filter(value => value.option_type_id == 2);
                                    all_logos = all_logos.map(item => ({
                                        value: item.id,
                                        label: item.option_name,
                                    }));

                                    conditions_temp.push({
                                        "selectedType": selected_type,
                                        "typeOptions": all_logos,
                                        "selectedGate": selected_gate,
                                        "selectedCondition": selection_type,
                                        "selectedOption": selected_option_outside,
                                        "optionOptions": logo_options,
                                        "selectedOptionOption": selected_option,
                                        "textAreaValue": ""
                                    });
                                }

                            } else if (element.option_back.option_type.id == 3) {

                                let all_texts = allOptionsList.filter(value => value.option_type_id == 3);
                                all_texts = all_texts.map(item => ({
                                    value: item.id,
                                    label: item.option_name,
                                }));

                                conditions_temp.push({
                                    "selectedType": selected_type,
                                    "typeOptions": all_texts,
                                    "selectedGate": selected_gate,
                                    "selectedCondition": selection_type,
                                    "selectedOption": selected_option_outside,
                                    "optionOptions": [],
                                    "selectedOptionOption": false,
                                    "textAreaValue": element.value
                                });
                            }
                        });

                        // ####################################### CONDITIONS DATA ###############################################S

                        // console.log(conditions_temp);
                        setConditionsList(conditions_temp);

                    } else {
                        setSelectedCondition({ label: "No", value: false });
                        setConditionsList([
                            {
                                selectedType: false,
                                typeOptions: false,
                                selectedGate: { label: "OR", value: "or" },
                                selectedCondition: { label: "Equals", value: "equals" },
                                selectedOption: false,
                                optionOptions: false,
                                selectedOptionOption: false,
                                textAreaValue: "",
                            }
                        ]);
                    }

                    if (data.data.required)
                        setOptionRequired(true);
                    else
                        setOptionRequired(false);


                    let temp_two = [];
                    data.data.option_sets.forEach(element => { temp_two.push({ value: element.id, label: element.name }) });
                    setSelectedOptionSets(temp_two);

                    if (data.data.option_type_id == 1) {
                        let temp = [];
                        let temp9 = [];
                        let pre_select = false;
                        data.data.drop_detail.forEach(element => {
                            temp.push(element.value);
                            if (element.pre_select) {
                                pre_select = element.value;
                            }
                            let temp9Inside = [];
                            element.families.forEach(element2 => {
                                temp9Inside.push({ value: element2.id, label: element2.name });
                            });
                            temp9.push({ option_name: element.value, option_families: temp9Inside, upcharge: element.upcharge_amount });
                        });
                        setSelectedTags(temp);
                        setDropdDownFamiliesData(temp9);

                        if (pre_select) {
                            setPreSelectDropdown({ value: pre_select, label: pre_select });
                        }

                    } else if (data.data.option_type_id == 9) {
                        let temp = [];
                        let temp9 = [];
                        let pre_select = false;
                        data.data.drop_detail.forEach(element => {
                            temp.push(element.value);
                            if (element.pre_select) {
                                pre_select = element.value;
                            }
                            let temp9Inside = [];
                            element.families.forEach(element2 => {
                                temp9Inside.push({ value: element2.id, label: element2.name });
                            });
                            temp9.push({ option_name: element.value, option_families: temp9Inside, upcharge: element.upcharge_amount, file: false, edit_src: element.image_src, image_src: `${window.appURL}/${element.image_src}`, image_name: element.image_name, image_size: element.image_size });
                        });
                        // console.log(temp9);
                        setSelectedTags(temp);
                        setDropdDownFamiliesData(temp9);

                        if (pre_select) {
                            setPreSelectDropdown({ value: pre_select, label: pre_select });
                        }

                    } else if (data.data.option_type_id == 2) {
                        const logoGroup = logoGroupOptions.find(value => value.value == data.data.logo_detail[0].logo_group_id);
                        dispatch(setImagesTableDataForUpdateLogos(data.data.logo_detail));
                        dispatch(setSelectedLogoGroupId(logoGroup));
                    } else if (data.data.option_type_id == 3) {
                        setTextAreaRows(data.data.text_detail.rows_required);
                    } else if (data.data.option_type_id == 4) {
                        setUploadInstruction(data.data.file_detail.instructions);
                        setUploadSize(data.data.file_detail.upload_size);
                        setSelectedExtensions(JSON.parse(data.data.file_detail.extensions));
                    } else if (data.data.option_type_id == 5) {
                        setAdminNote(data.data.note_detail.value);
                        setAdminNoteSend(data.data.note_detail.status ? true : false);
                    } else if (data.data.option_type_id == 6) {
                        let temp = [];
                        data.data.input_detail.forEach(element => {
                            let tempInside0 = [];
                            element.threads.forEach(element3 => {
                                let tempInside1 = [];
                                element3.thread_colors.forEach(element4 => {
                                    tempInside1.push({ value: element4.id, label: element4.name });
                                });
                                tempInside0.push({ thread_name: element3.thread_name, thread_families: tempInside1 });
                            });
                            temp.push({ required: element.required, max: element.max_char, charge: element.upcharge_amount, font: JSON.parse(element.font_json), font_size: element.font_size, show_threads: false, threads: tempInside0 });
                        });
                        setInputFields(temp);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            setOptionName("");
            setOptionNameTwo("");
            setSelectedOptionType(false);
            setSelectedCondition({ label: "No", value: false });
            setOptionRequired(false);
            setSelectedTags([]);
            dispatch(setSelectedLogoGroupId(false));
            dispatch(setImagesTableRows([]));
            dispatch(setImagesTableStaticRows([]));
            setUploadInstruction("");
            setUploadSize("");
            setSelectedExtensions([]);
            setAdminNote("<p><br></p>");
            setAdminNoteSend(false);
            setInputFields([{ required: false, max: 20, charge: 0, font: { value: "script", label: "Script" }, font_size: 14, show_threads: false, threads: [{ thread_name: 0, thread_families: [] }] }]);
            setTextAreaRows("0");
            setConditionsList([{
                selectedType: false,
                typeOptions: false,
                selectedGate: { label: "OR", value: "or" },
                selectedCondition: { label: "Equals", value: "equals" },
                selectedOption: false,
                optionOptions: false,
                selectedOptionOption: false,
                textAreaValue: "",
            }]);
            setPreSelectDropdown({ value: false, label: "No Pre Select" });
            setDropdDownFamiliesData([]);
            setSelectedOptionSets([]);
        }

    }, [updateOptionId, optionsReload]);

    useEffect(() => {

        fetch('/virtual_options/get_add_option_data')
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                let temp = [];
                data.data.data1.forEach(element => {
                    // if (element.name != "Text Area")    //excluding text area
                    temp.push({ value: element.id, label: element.name });
                });
                setOptionTypes(temp);
                temp = [];
                data.data.data2.forEach(element => {
                    temp.push({ value: element.id, label: element.name });
                });
                setLogoGroupOptions(temp);
                temp = [];
                data.data.data3.forEach(element => {
                    temp.push({ value: element.id, label: element.name });
                });
                setOptionSets(temp);
                temp = [];
                data.data.data4.forEach(element => {
                    temp.push({ value: element.id, label: element.name });
                });
                setFamiliesList(temp);
                setAllOptionsList(data.data.data5);
            })
            .catch((error) => {
                console.error(error);
            });

    }, [optionsReload]);


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
                <div style={{ paddingRight: "10px", marginTop: "-2px" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => { }} />
                </div>
                {children}
            </components.Option>
        );
    };

    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
    ];

    const [optionName, setOptionName] = useState("");
    const [optionNameTwo, setOptionNameTwo] = useState("");
    const [optionRequired, setOptionRequired] = useState(false);
    const [optionTypes, setOptionTypes] = useState([]);
    const [selectedOptionType, setSelectedOptionType] = useState(false);

    const [optionSets, setOptionSets] = useState([]);
    const [selectedOptionSets, setSelectedOptionSets] = useState([]);

    const [logoGroupOptions, setLogoGroupOptions] = useState([]);

    const [preSelectDropdown, setPreSelectDropdown] = useState({ value: false, label: "No Pre Select" });
    const [newTag, setNewTag] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const removeTagInside = useCallback((tag) => () => {
        setSelectedTags((previousTags) => previousTags.filter((previousTag) => previousTag !== tag),);
        let temp = [...dropdDownFamiliesData];
        let indexNumber = temp.findIndex(obj => obj.option_name == tag);
        temp.splice(indexNumber, 1);
        setDropdDownFamiliesData(temp);
    }, [dropdDownFamiliesData]);

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

        if (selectedTags.includes(check.trim())) {

            noErrors = false;
            setFlag("error");
            setFlagMessage(`"${newTag}" Same Tag cannot be entered again.`);
            window.scrollTo(0, 0);
        }

        if (noErrors == true) {
            let temp = [...selectedTags];
            temp.push(check.trim());

            setNewTag("");
            setSelectedTags(temp);

            let temp2 = [...dropdDownFamiliesData];
            temp2.push({ option_name: check.trim(), option_families: [], upcharge: 0, file: false, edit_src: false, image_src: false, image_name: false, image_size: false });
            setDropdDownFamiliesData(temp2);

            setFlag(false);
        }
    }

    const extensions = [
        { value: 1, label: "jpeg" },
        { value: 2, label: "pdf" },
        { value: 3, label: "png" },
        { value: 4, label: "csv" },
        { value: 5, label: "gif" },
        { value: 6, label: "jpg" },
        { value: 6, label: "ai" },
        { value: 6, label: "eps" },
    ]

    const [uploadInstruction, setUploadInstruction] = useState("");
    const [uploadSize, setUploadSize] = useState("");
    const [selectedExtensions, setSelectedExtensions] = useState([]);
    const [adminNote, setAdminNote] = useState('<p><br></p>');
    const [adminNoteSend, setAdminNoteSend] = useState(false);

    const [inputFields, setInputFields] = useState([
        { required: false, max: 20, charge: 0, font: { value: "script", label: "Script" }, font_size: 14, show_threads: false, threads: [{ thread_name: 0, thread_families: [] }] },
    ]);

    const [textAreaRows, setTextAreaRows] = useState("0");

    const [selectedCondition, setSelectedCondition] = useState({ label: "No", value: false });

    const [conditionsList, setConditionsList] = useState([
        {
            selectedType: false,
            typeOptions: false,
            selectedGate: { label: "OR", value: "or" },
            selectedCondition: { label: "Equals", value: "equals" },
            selectedOption: false,
            optionOptions: false,
            selectedOptionOption: false,
            textAreaValue: "",
        },
    ]);

    const addOptionHandler = () => {

        //FINALIZING IMAGE TABLES DATA START
        let temp = [...imagesTableStaticRows];
        temp.forEach((element, index) => {
            let row = imagesTableRows.find(value => value.id == temp[index].id);
            if (row) {
                temp[index] = { ...temp[index], up_charge: row.up_charge };
                temp[index] = { ...temp[index], pre_select: row.pre_select }
            }
        });

        let pre_select_check = true;
        temp.forEach((element, index) => {
            if (temp[index].pre_select == true && pre_select_check == true) {
                temp[index] = { ...temp[index], pre_select: true };
                pre_select_check = false;
            } else {
                temp[index] = { ...temp[index], pre_select: false };
            }
        });
        // console.log(temp);
        const logoGroupOptions = temp;
        //FINALIZING IMAGE TABLES DATA END


        const formData = new FormData();

        formData.append('update_option_id', updateOptionId);
        formData.append('option_name', optionName);
        formData.append('option_name_front', optionNameTwo);
        formData.append('option_required', optionRequired);
        formData.append('option_type', JSON.stringify(selectedOptionType));
        formData.append('option_conditions', JSON.stringify(selectedCondition));

        formData.append('dropdown_options', JSON.stringify(selectedTags));
        formData.append('pre_select_dropdown', JSON.stringify(preSelectDropdown));
        formData.append('selected_logo_group', JSON.stringify(selectedLogoGroupId));
        formData.append('selected_option_sets', JSON.stringify(selectedOptionSets));
        formData.append('logo_group_options', JSON.stringify(logoGroupOptions));
        formData.append('upload_instructions', uploadInstruction);
        formData.append('upload_size', uploadSize);
        formData.append('selected_extensions', JSON.stringify(selectedExtensions));
        formData.append('admin_note', adminNote);
        formData.append('admin_note_send', adminNoteSend);
        formData.append('input_fields', JSON.stringify(inputFields));
        formData.append('rows_required', textAreaRows);
        formData.append('conditions_list', JSON.stringify(conditionsList));
        formData.append('drop_down_families', JSON.stringify(dropdDownFamiliesData));

        dropdDownFamiliesData.forEach((element, index) => {
            formData.append(`main_file${index}`, element.file);
        });

        fetch('/virtual_options/add_option', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                if (data.success == true) {
                    dispatch(setOptionsReload(!optionsReload));
                    dispatch(setAddOptionModal(false));
                    dispatch(setUpdateOptionId(false));
                    dispatch(setToastActive(true));
                    dispatch(setToastMessage(data.message));
                    setFlag(false);

                    setOptionName("");
                    setOptionNameTwo("");
                    setSelectedOptionType(false);
                    setSelectedCondition({ label: "No", value: false });
                    setOptionRequired(false);
                    setSelectedOptionSets([]);
                    setSelectedTags([]);
                    dispatch(setSelectedLogoGroupId(false));
                    dispatch(setImagesTableRows([]));
                    dispatch(setImagesTableStaticRows([]));
                    setUploadInstruction("");
                    setUploadSize("");
                    setSelectedExtensions([]);
                    setAdminNote("<p><br></p>");
                    setAdminNoteSend(false);
                    setInputFields([{ required: false, max: 20, charge: 0, font: { value: "script", label: "Script" }, font_size: 14, show_threads: false, threads: [{ thread_name: 0, thread_families: [] }] }]);
                    setTextAreaRows("0");
                    setPreSelectDropdown({ value: false, label: "No Pre Select" });
                    setDropdDownFamiliesData([]);
                } else {
                    setFlag("error");
                    setFlagMessage(data.message);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const addFalseValue = (selectedTags) => {
        let values = selectedTags.map(value => ({ value, label: value }));
        values = [{ value: false, label: 'No Pre Select' }, ...values];
        return values;
    }

    return (
        <Modal
            size="large"
            open={addOptionModal}
            onClose={handleChange}
            title="Add Option"
            primaryAction={{
                content: 'Save',
                onAction: addOptionHandler,
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
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 5, sm: 5, md: 5, lg: 5, xl: 5 }}>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ display: "flex" }}>
                                    <div style={{ width: "100%" }}>
                                        <TextField label="Option Name" placeholder='Enter option name' value={optionName} onChange={(e) => setOptionName(e)} type='text' />
                                    </div>
                                    <div style={{ marginLeft: "15px" }}>
                                        <div>Required</div>
                                        <div style={{ float: "", marginTop: "8px", marginLeft: "2px" }}>
                                            <Toggle onClick={(e) => setOptionRequired(e.target.checked)} toggled={optionRequired} />
                                        </div>
                                    </div>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ width: "100%" }}>
                                    <TextField label="Option Name (StoreFront)" placeholder='Enter option name (StoreFront)' value={optionNameTwo} onChange={(e) => setOptionNameTwo(e)} type='text' />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ marginBottom: "3px" }}>Select Option Type</div>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                    }}
                                    placeholder="Select Option Type"
                                    options={optionTypes}
                                    onChange={(e) => setSelectedOptionType(e)}
                                    value={selectedOptionType}

                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ marginBottom: "3px" }}>Select Option Set</div>
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
                                    placeholder="Select Option Set"
                                    options={optionSets}
                                    onChange={(e) => setSelectedOptionSets(e)}
                                    value={selectedOptionSets}
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <hr></hr>
                                <div style={{ marginTop: "10px" }}></div>
                                <div style={{ marginBottom: "3px" }}>Conditional</div>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                    }}
                                    placeholder="Select Conditions"
                                    options={[{ label: "Yes", value: true }, { label: "No", value: false }]}
                                    value={selectedCondition}
                                    onChange={(e) => setSelectedCondition(e)}
                                />
                            </Grid.Cell>
                        </Grid>
                    </Grid.Cell >
                    <Grid.Cell columnSpan={{ xs: 7, sm: 7, md: 7, lg: 7, xl: 7 }}>
                        <div style={{ height: "378px" }}>
                            <div style={{ overflow: "auto", padding: "20px", border: "1px dashed #c2c2c2", background: "#fafafa", borderRadius: "5px", width: "100%", height: "100%" }} >
                                {sortTags ?
                                    <div style={{ height: "100%", width: '100%' }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                            <p style={{ fontSize: "16px" }}>Sort Tags:</p>
                                            <div style={{ cursor: "pointer", display: "flex" }}>
                                                <div onClick={() => {
                                                    const rows = [];
                                                    gridApi.forEachNodeAfterFilterAndSort((node) => rows.push(node.data));
                                                    let temp = [];
                                                    rows.forEach((element, index) => {
                                                        temp.push(element.Tag)
                                                        temp[index] = element.Tag;
                                                    });
                                                    setSelectedTags(temp);
                                                    setSortTags(false);
                                                }}>
                                                    <Icon
                                                        source={CheckIcon}
                                                        tone="base"
                                                    />
                                                </div>
                                                <div onClick={() => setSortTags(false)}>
                                                    <Icon
                                                        source={XIcon}
                                                        tone="base"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ height: "90%", width: '100%' }} className="ag-theme-alpine">
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
                                    </div> : selectedOptionType.value == 1 ?
                                        <div>
                                            <div style={{ marginBottom: "15px", fontWeight: "500", fontSize: "16px" }}>Dropdown Configurations:</div>
                                            <div style={{ width: "100%", marginRight: "15px" }} onKeyPress={(e) => { if (e.key === "Enter") { addTagHandler(); } }}>
                                                <div style={{ display: "flex", marginBottom: "4px" }}>
                                                    <p>Add Dropdown Options</p>
                                                </div>
                                                <TextField
                                                    value={newTag}
                                                    onChange={(e) => { setNewTag(e) }}
                                                    placeholder="Add tag here and press enter..."
                                                    type="text"
                                                    style={{ width: "400px" }}
                                                    onKeyPress={(e) => console.log(e)}
                                                />
                                            </div>
                                            <div>
                                                <div>{tagMarkup}</div>
                                            </div>
                                            <div style={{ marginTop: "8px" }}>
                                                <div style={{ marginBottom: "4px" }}>Pre Select Option</div>
                                                <Select
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                    }}
                                                    placeholder="Select Pre Select Option"
                                                    options={selectedTags && addFalseValue(selectedTags)}
                                                    onChange={(e) => setPreSelectDropdown(e)}
                                                    value={preSelectDropdown}
                                                />
                                            </div>

                                            {selectedTags && selectedTags.length > 0 &&
                                                <div>
                                                    <div style={{ marginTop: "10px", marginBottom: "5px" }}>Dropdown Properties</div>
                                                    <div style={{ border: "1px dashed rgb(194, 194, 194)", borderRadius: "5px" }}>

                                                        {/* style={{ padding: "5px 5px 0px 5px" }} */}
                                                        {selectedTags.map((value5, index5) => {

                                                            let familiesInside = false;
                                                            familiesInside = dropdDownFamiliesData.find(obj => obj.option_name == value5);
                                                            // console.log(familiesInside);

                                                            return (
                                                                <div key={index5} style={{ margin: "15px", marginTop: `${index5 == 0 ? '15px' : '25px'}`, padding: "15px", paddingTop: "10px", border: "2px dashed rgb(194, 194, 194)", borderRadius: "5px" }}>
                                                                    <div style={{ textDecoration: "underline", marginBottom: "5px" }}>Properties For Option: <strong>{value5}</strong></div>
                                                                    <div>Families:</div>
                                                                    <Select
                                                                        menuPortalTarget={document.body}
                                                                        styles={{
                                                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                        }}
                                                                        placeholder="Select Families Here..."
                                                                        components={{
                                                                            Option: InputOption
                                                                        }}
                                                                        isMulti
                                                                        closeMenuOnSelect={false}
                                                                        hideSelectedOptions={false}
                                                                        options={familiesList}
                                                                        value={familiesInside.option_families}
                                                                        onChange={(e) => {
                                                                            let temp = [...dropdDownFamiliesData];
                                                                            let indexNumber = temp.findIndex(obj => obj.option_name == value5);
                                                                            // console.log(indexNumber);
                                                                            temp[indexNumber] = { ...temp[indexNumber], option_families: e };
                                                                            setDropdDownFamiliesData(temp);
                                                                        }}
                                                                    />
                                                                    <div style={{ marginTop: "5px" }}>Upcharge Amount:</div>
                                                                    <TextField type='number' value={familiesInside.upcharge} onChange={(e) => {
                                                                        let temp = [...dropdDownFamiliesData];
                                                                        let indexNumber = temp.findIndex(obj => obj.option_name == value5);
                                                                        // console.log(indexNumber);
                                                                        temp[indexNumber] = { ...temp[indexNumber], upcharge: e };
                                                                        setDropdDownFamiliesData(temp);
                                                                    }}
                                                                        placeholder='Enter Upcharge Amount Here...'
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            }

                                        </div> : selectedOptionType.value == 9 ?
                                            <div>
                                                <div style={{ marginBottom: "15px", fontWeight: "500", fontSize: "16px" }}>Image Grid Configurations:</div>
                                                <div style={{ width: "100%", marginRight: "15px" }} onKeyPress={(e) => { if (e.key === "Enter") { addTagHandler(); } }}>
                                                    <div style={{ display: "flex", marginBottom: "4px" }}>
                                                        <p>Add Dropdown Options</p>
                                                    </div>
                                                    <div style={{ display: "flex", marginBottom: "10px" }}>
                                                        <div style={{ width: "100%" }}>
                                                            <TextField
                                                                value={newTag}
                                                                onChange={(e) => { setNewTag(e) }}
                                                                placeholder="Add tag here and press enter..."
                                                                type="text"
                                                                style={{ width: "400px" }}
                                                                onKeyPress={(e) => console.log(e)}
                                                            />
                                                        </div>
                                                        <div style={{ marginLeft: "10px" }}><Button onClick={() => setSortTags(true)}>Sort</Button></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div>{tagMarkup}</div>
                                                </div>
                                                <div style={{ marginTop: "8px" }}>
                                                    <div style={{ marginBottom: "4px" }}>Pre Select Option</div>
                                                    <Select
                                                        menuPortalTarget={document.body}
                                                        styles={{
                                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                        }}
                                                        placeholder="Select Pre Select Option"
                                                        options={selectedTags && addFalseValue(selectedTags)}
                                                        onChange={(e) => setPreSelectDropdown(e)}
                                                        value={preSelectDropdown}
                                                    />
                                                </div>

                                                {selectedTags && selectedTags.length > 0 &&
                                                    <div>
                                                        <div style={{ marginTop: "10px", marginBottom: "5px" }}>Image Grid Properties</div>
                                                        <div style={{ border: "1px dashed rgb(194, 194, 194)", borderRadius: "5px" }}>

                                                            {/* style={{ padding: "5px 5px 0px 5px" }} */}
                                                            {selectedTags.map((value5, index5) => {

                                                                let familiesInside = false;
                                                                familiesInside = dropdDownFamiliesData.find(obj => obj.option_name == value5);
                                                                console.log(familiesInside);

                                                                return (
                                                                    <div key={index5} style={{ margin: "15px", marginTop: `${index5 == 0 ? '15px' : '25px'}`, padding: "15px", paddingTop: "10px", border: "2px dashed rgb(194, 194, 194)", borderRadius: "5px" }}>
                                                                        <div style={{ textDecoration: "underline", marginBottom: "5px" }}>Properties For Option: <strong>{value5}</strong></div>
                                                                        <div>Families:</div>
                                                                        <Select
                                                                            menuPortalTarget={document.body}
                                                                            styles={{
                                                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                            }}
                                                                            placeholder="Select Families Here..."
                                                                            components={{
                                                                                Option: InputOption
                                                                            }}
                                                                            isMulti
                                                                            closeMenuOnSelect={false}
                                                                            hideSelectedOptions={false}
                                                                            options={familiesList}
                                                                            value={familiesInside.option_families}
                                                                            onChange={(e) => {
                                                                                let temp = [...dropdDownFamiliesData];
                                                                                let indexNumber = temp.findIndex(obj => obj.option_name == value5);
                                                                                // console.log(indexNumber);
                                                                                temp[indexNumber] = { ...temp[indexNumber], option_families: e };
                                                                                setDropdDownFamiliesData(temp);
                                                                            }}
                                                                        />
                                                                        <div style={{ marginTop: "5px" }}>Upcharge Amount:</div>
                                                                        <TextField type='number' value={familiesInside.upcharge} onChange={(e) => {
                                                                            let temp = [...dropdDownFamiliesData];
                                                                            let indexNumber = temp.findIndex(obj => obj.option_name == value5);
                                                                            // console.log(indexNumber);
                                                                            temp[indexNumber] = { ...temp[indexNumber], upcharge: e };
                                                                            setDropdDownFamiliesData(temp);
                                                                        }}
                                                                            placeholder='Enter Upcharge Amount Here...'
                                                                        />
                                                                        <div style={{ marginTop: "5px" }}>Option Image: </div>
                                                                        <div style={{ border: "3px dashed #D4D4D4", background: "#FCFCFC", minHeight: "70px", marginTop: "3px", padding: "10px" }}>
                                                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                                <div style={{ display: "flex" }}>
                                                                                    <div> <img src={familiesInside.image_src ? familiesInside.image_src : Doc2} style={{ height: "40px" }}></img> </div>
                                                                                    <div style={{ marginLeft: "10px" }}>
                                                                                        {familiesInside.image_size && familiesInside.image_name ?
                                                                                            <div>
                                                                                                <p style={{ fontWeight: "500" }}>
                                                                                                    File {index5 + 1}: {familiesInside.image_name}
                                                                                                </p>
                                                                                                <p color="#8B8B8B">
                                                                                                    {(familiesInside.image_size / 1000000).toFixed(2)} MB
                                                                                                </p>
                                                                                            </div> : <div>
                                                                                                <div style={{ color: "#8B8B8B", fontWeight: "500" }}>
                                                                                                    <p onClick={() => document.getElementById(`hiddenmainfile${index5}`).click()} style={{ textDecoration: "underline", color: "#323232", fontWeight: "500", cursor: "pointer" }}>
                                                                                                        Click here
                                                                                                    </p>to upload your file.
                                                                                                </div>
                                                                                                <input type="file" style={{ display: "none" }} id={`hiddenmainfile${index5}`} onChange={(e) => {
                                                                                                    let temp = [...dropdDownFamiliesData];
                                                                                                    let indexNumber = temp.findIndex(obj => obj.option_name == value5);
                                                                                                    // console.log(e.target.files[0]);
                                                                                                    const reader = new FileReader();
                                                                                                    reader.onload = function (event) {
                                                                                                        temp[indexNumber] = { ...temp[indexNumber], file: e.target.files[0] };
                                                                                                        temp[indexNumber] = { ...temp[indexNumber], image_src: event.target.result };
                                                                                                        temp[indexNumber] = { ...temp[indexNumber], image_name: e.target.files[0].name };
                                                                                                        temp[indexNumber] = { ...temp[indexNumber], image_size: e.target.files[0].size };
                                                                                                        temp[indexNumber] = { ...temp[indexNumber], edit_src: false };
                                                                                                        setDropdDownFamiliesData(temp);
                                                                                                    };
                                                                                                    reader.readAsDataURL(e.target.files[0]);
                                                                                                }} />
                                                                                            </div>
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                                <div style={{ cursor: "pointer" }} onClick={() => {
                                                                                    let temp = [...dropdDownFamiliesData];
                                                                                    let indexNumber = temp.findIndex(obj => obj.option_name == value5);
                                                                                    // console.log(indexNumber);
                                                                                    temp[indexNumber] = { ...temp[indexNumber], file: false };
                                                                                    temp[indexNumber] = { ...temp[indexNumber], image_src: false };
                                                                                    temp[indexNumber] = { ...temp[indexNumber], image_name: false };
                                                                                    temp[indexNumber] = { ...temp[indexNumber], image_size: false };
                                                                                    temp[indexNumber] = { ...temp[indexNumber], edit_src: false };
                                                                                    setDropdDownFamiliesData(temp);
                                                                                }}>
                                                                                    <Icon
                                                                                        source={XIcon}
                                                                                        tone="base"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                }
                                            </div> : selectedOptionType.value == 2 ?
                                                <div>
                                                    <div style={{ marginBottom: "15px", fontWeight: "500", fontSize: "16px" }}>Logo Group Configurations:</div>
                                                    <div style={{ marginBottom: "4px" }}>Select Logo Group</div>
                                                    <Select
                                                        menuPortalTarget={document.body}
                                                        styles={{
                                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                        }}
                                                        placeholder="Select Logo Group"
                                                        options={logoGroupOptions}
                                                        onChange={(e) => dispatch(setSelectedLogoGroupId(e))}
                                                        value={selectedLogoGroupId}
                                                    />
                                                    {selectedLogoGroupId ?
                                                        <div style={{ marginTop: "15px" }}>
                                                            <div>
                                                                <div>Logo Settings</div>
                                                                <ImagesTable />
                                                            </div>
                                                        </div> : null
                                                    }
                                                </div> : selectedOptionType.value == 3 ?
                                                    <div>
                                                        <div style={{ marginBottom: "15px", fontWeight: "500", fontSize: "16px" }}>Text Area Configurations:</div>
                                                        <TextField type='number' value={textAreaRows} onChange={(e) => setTextAreaRows(e)} label="Rows Required:" placeholder='Enter Rows #' />
                                                    </div> : selectedOptionType.value == 4 ?
                                                        <div>
                                                            <div style={{ marginBottom: "15px", fontWeight: "500", fontSize: "16px" }}>File Upload Configurations:</div>
                                                            <TextField type='text' value={uploadInstruction} onChange={(e) => setUploadInstruction(e)} label="Upload Instructions" />
                                                            <div style={{ marginBottom: "10px" }}></div>
                                                            <TextField type='number' value={uploadSize} onChange={(e) => setUploadSize(e)} label="Upload Size" suffix="MB" />
                                                            <div style={{ marginBottom: "10px" }}></div>
                                                            <div style={{ marginBottom: "4px" }}>Select Extensions</div>
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
                                                                placeholder="Select File Extensions"
                                                                options={extensions}
                                                                onChange={(e) => setSelectedExtensions(e)}
                                                                value={selectedExtensions}
                                                            />
                                                        </div> : selectedOptionType.value == 5 ?
                                                            <div>
                                                                <div style={{ marginBottom: "15px", fontWeight: "500", fontSize: "16px" }}>Admin Note Configurations:</div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "10px" }}>
                                                                    <div style={{}}>Send To Cart:</div>
                                                                    <div style={{ marginTop: "-4px" }}>
                                                                        <Toggle
                                                                            toggled={adminNoteSend}
                                                                            onClick={(e) => {
                                                                                setAdminNoteSend(e.target.checked);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div style={{ marginBottom: "4px" }}>Admin Note</div>
                                                                <Card>
                                                                    <ReactQuill modules={{ toolbar: toolbarOptions }} theme="snow" value={adminNote} onChange={setAdminNote} />
                                                                </Card>
                                                            </div> : selectedOptionType.value == 6 ?
                                                                <div>

                                                                    <div style={{ marginBottom: "10px", fontWeight: "500", fontSize: "16px" }}>Input Field Configurations:</div>
                                                                    {/* <div style={{ marginBottom: "4px" }}>Input Fields:</div> */}

                                                                    <div style={{ display: "flex", marginBottom: "5px" }}>
                                                                        <div style={{ width: "16%", fontWeight: "600" }}>Max</div>
                                                                        <div style={{ width: "17%", fontWeight: "600" }}>Charge</div>
                                                                        <div style={{ width: "30%", fontWeight: "600" }}>Font</div>
                                                                        <div style={{ width: "16%", fontWeight: "600" }}>Size</div>
                                                                        <div style={{ width: "16%", fontWeight: "600" }}>Threads</div>
                                                                        <div style={{ width: "15%", fontWeight: "600" }}>Required</div>
                                                                        <div style={{ width: "15%", fontWeight: "600" }}></div>
                                                                    </div>
                                                                    {inputFields.map((value, index) => {
                                                                        return (
                                                                            <div key={index} style={{ display: "flex", marginBottom: "5px" }}>
                                                                                <div style={{ width: "15%", marginRight: "10px" }}>
                                                                                    <TextField type='text' value={value.max} onChange={(e) => {
                                                                                        let temp = [...inputFields];
                                                                                        temp[index] = { ...temp[index], max: e };
                                                                                        setInputFields(temp);
                                                                                    }} />
                                                                                </div>
                                                                                <div style={{ width: "15%", marginRight: "10px" }}>
                                                                                    <TextField type='text' value={value.charge} onChange={(e) => {
                                                                                        let temp = [...inputFields];
                                                                                        temp[index] = { ...temp[index], charge: e };
                                                                                        setInputFields(temp);
                                                                                    }} />
                                                                                </div>
                                                                                <div style={{ width: "30%", marginRight: "10px" }}>
                                                                                    <Select
                                                                                        menuPortalTarget={document.body}
                                                                                        styles={customStyles}
                                                                                        placeholder="Select Font"
                                                                                        options={[{ value: "script", label: "Script" }, { value: "block_2", label: "Block 2" }]}
                                                                                        value={value.font}
                                                                                        onChange={(e) => {
                                                                                            let temp = [...inputFields];
                                                                                            temp[index] = { ...temp[index], font: e };
                                                                                            setInputFields(temp);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <div style={{ width: "15%", marginRight: "10px" }}>
                                                                                    <TextField type='text' value={value.font_size} onChange={(e) => {
                                                                                        let temp = [...inputFields];
                                                                                        temp[index] = { ...temp[index], font_size: e };
                                                                                        setInputFields(temp);
                                                                                    }} />
                                                                                </div>
                                                                                <div style={{ width: "15%", marginRight: "10px" }}>
                                                                                    <Button
                                                                                        onClick={() => {
                                                                                            let temp = [...inputFields];
                                                                                            temp.forEach((element6, index6) => { temp[index6] = { ...temp[index6], show_threads: false } });
                                                                                            temp[index] = { ...temp[index], show_threads: !value.show_threads };
                                                                                            setInputFields(temp);
                                                                                        }}
                                                                                    >
                                                                                        {value.show_threads ?
                                                                                            <Icon source={HideIcon} color="base" /> :
                                                                                            <Icon source={ViewIcon} color="base" />
                                                                                        }
                                                                                    </Button>
                                                                                </div>
                                                                                <div style={{ width: "15%", marginTop: "4px" }}>
                                                                                    <Toggle toggled={value.required} onClick={(e) => {
                                                                                        let temp = [...inputFields];
                                                                                        temp[index] = { ...temp[index], required: e.target.checked };
                                                                                        setInputFields(temp);
                                                                                    }} />
                                                                                </div>
                                                                                <div style={{ width: "15%", marginLeft: "5px", marginTop: "7px", cursor: "pointer", display: "flex" }}>
                                                                                    <div onClick={() => {
                                                                                        let temp = [...inputFields];
                                                                                        temp.splice(index + 1, 0, { required: false, max: 20, charge: 0, font: { value: "script", label: "Script" }, font_size: 14, show_threads: false, threads: [{ thread_name: 0, thread_families: [] }] });
                                                                                        setInputFields(temp);
                                                                                    }}>
                                                                                        <Icon
                                                                                            source={PlusCircleIcon}
                                                                                            color="base"
                                                                                        />
                                                                                    </div>
                                                                                    {inputFields.length > 1 ?
                                                                                        <div onClick={() => {
                                                                                            let temp = [...inputFields];
                                                                                            temp.splice(index, 1);
                                                                                            setInputFields(temp);
                                                                                        }}>
                                                                                            <Icon
                                                                                                source={XCircleIcon}
                                                                                                color="base"
                                                                                            />
                                                                                        </div> : <div style={{ width: "20px" }}>
                                                                                        </div>
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}

                                                                    {inputFields.map((value, index) => {

                                                                        if (value.show_threads) {
                                                                            return (
                                                                                <div key={index}>
                                                                                    <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                                                                        <div style={{ marginTop: "15px", marginBottom: "10px", fontWeight: "500", fontSize: "16px" }}>Thread Colors for {`L${index + 1} `}:</div>
                                                                                        {inputFields[index].threads.length < 1 ?
                                                                                            <div style={{ marginTop: "15px" }} onClick={() => {
                                                                                                let temp = [...inputFields];
                                                                                                let temp2 = [...temp[index].threads];
                                                                                                temp2.push({ thread_name: 0, thread_families: [] });
                                                                                                temp[index] = { ...temp[index], threads: temp2 };
                                                                                                setInputFields(temp);
                                                                                            }}>
                                                                                                <Icon
                                                                                                    source={PlusCircleIcon}
                                                                                                    color="base"
                                                                                                />
                                                                                            </div> : null
                                                                                        }
                                                                                    </div>

                                                                                    {/* <div style={{ marginBottom: "4px" }}>Input Fields:</div> */}

                                                                                    <div style={{ display: "flex", marginBottom: "5px" }}>
                                                                                        <div style={{ width: "26%", fontWeight: "600" }}> Thread Color </div>
                                                                                        <div style={{ width: "70%", fontWeight: "600" }}> Color Families </div>
                                                                                    </div>
                                                                                    {value.threads.map((value2, index2) => {

                                                                                        return (
                                                                                            <div key={index2} style={{ display: "flex", marginBottom: "5px" }}>
                                                                                                <div style={{ width: "25%", marginRight: "10px" }}>
                                                                                                    <TextField type='number' value={value2.thread_name} onChange={(e) => {
                                                                                                        let temp = [...inputFields];
                                                                                                        let temp2 = [...temp[index].threads];
                                                                                                        temp2[index2] = { ...temp2[index2], thread_name: e };
                                                                                                        temp[index] = { ...temp[index], threads: temp2 };
                                                                                                        setInputFields(temp);
                                                                                                    }} />
                                                                                                </div>
                                                                                                <div style={{ width: "70%", marginRight: "10px" }}>
                                                                                                    <Select
                                                                                                        menuPortalTarget={document.body}
                                                                                                        styles={{
                                                                                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                                                        }}
                                                                                                        placeholder="Select Families Here..."
                                                                                                        components={{
                                                                                                            Option: InputOption
                                                                                                        }}
                                                                                                        isMulti
                                                                                                        closeMenuOnSelect={false}
                                                                                                        hideSelectedOptions={false}
                                                                                                        options={familiesList}
                                                                                                        value={value2.thread_families}
                                                                                                        onChange={(e) => {
                                                                                                            let temp = [...inputFields];
                                                                                                            let temp2 = [...temp[index].threads];
                                                                                                            temp2[index2] = { ...temp2[index2], thread_families: e };
                                                                                                            temp[index] = { ...temp[index], threads: temp2 };
                                                                                                            setInputFields(temp);
                                                                                                        }}
                                                                                                    />
                                                                                                </div>
                                                                                                <div style={{ marginLeft: "5px", marginTop: "7px", cursor: "pointer", display: "flex" }}>
                                                                                                    <div onClick={() => {
                                                                                                        let temp = [...inputFields];
                                                                                                        let temp2 = [...temp[index].threads];
                                                                                                        temp2.splice(index2 + 1, 0, { thread_name: 0, thread_families: [] });
                                                                                                        temp[index] = { ...temp[index], threads: temp2 };
                                                                                                        setInputFields(temp);
                                                                                                    }}>
                                                                                                        <Icon
                                                                                                            source={PlusCircleIcon}
                                                                                                            color="base"
                                                                                                        />
                                                                                                    </div>
                                                                                                    <div onClick={() => {
                                                                                                        let temp = [...inputFields];
                                                                                                        let temp2 = [...temp[index].threads];
                                                                                                        temp2.splice(index2, 1);
                                                                                                        temp[index] = { ...temp[index], threads: temp2 };
                                                                                                        setInputFields(temp);
                                                                                                    }}>
                                                                                                        <Icon
                                                                                                            source={XCircleIcon}
                                                                                                            color="base"
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            );
                                                                        }
                                                                    })}

                                                                </div> : null}
                            </div>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        {selectedCondition.value ?
                            conditionsList.map((value, index) => {
                                // console.log(value);
                                return (
                                    <div key={index} style={{ display: "flex", justifyContent: 'flex-start', marginTop: "10px" }}>
                                        <div style={{ width: "20%", marginRight: "5px" }}>
                                            <Select
                                                menuPortalTarget={document.body}
                                                styles={{
                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                }}
                                                placeholder="Type"
                                                options={[
                                                    { label: "Dropdown", value: 1 },
                                                    { label: "Logo Group", value: 2 },
                                                    { label: "Text Area", value: 3 },
                                                    { label: "Image Grid", value: 9 }
                                                ]}
                                                onChange={(e) => {

                                                    fetch(`/virtual_options/get_regarding_options?option_type_id=${e.value}`)
                                                        .then((response) => response.json())
                                                        .then((data) => {
                                                            console.log(data);
                                                            let options = [];
                                                            data.data.forEach(element => { options.push({ value: element.id, label: element.option_name }); });
                                                            let temp = [...conditionsList];
                                                            temp[index] = { ...temp[index], selectedType: e };
                                                            temp[index] = { ...temp[index], typeOptions: options };
                                                            temp[index] = { ...temp[index], selectedGate: { label: "OR", value: "or" } };
                                                            temp[index] = { ...temp[index], selectedCondition: { label: "Equals", value: "equals" } };
                                                            temp[index] = { ...temp[index], selectedOption: false };
                                                            temp[index] = { ...temp[index], optionOptions: false };
                                                            temp[index] = { ...temp[index], selectedOptionOption: false };
                                                            temp[index] = { ...temp[index], textAreaValue: "" };
                                                            setConditionsList(temp);


                                                        })
                                                }}
                                                value={value.selectedType}
                                                menuPlacement='top'
                                            />
                                        </div>
                                        <div style={{ width: "20%", marginRight: "5px" }}>
                                            <Select
                                                menuPortalTarget={document.body}
                                                styles={{
                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                }}
                                                placeholder="Option"
                                                options={value.typeOptions}
                                                onChange={(e) => {

                                                    fetch(`/virtual_options/get_regarding_option_data?option_type_id=${value.selectedType.value}&option_id=${e.value}`)
                                                        .then((response) => response.json())
                                                        .then((data) => {
                                                            console.log(data);
                                                            let options = [];
                                                            if (value.selectedType.value == 1 || value.selectedType.value == 9) {
                                                                data.data.dropdown.forEach(element => { options.push({ value: element.id, label: element.value }); });
                                                            } else if (value.selectedType.value == 2) {
                                                                data.data.logo_group.forEach(element => { options.push({ value: element.logo.id, label: element.logo.code_name }); });
                                                            } else if (value.selectedType.value == 3) {

                                                            }
                                                            let temp = [...conditionsList];
                                                            temp[index] = { ...temp[index], selectedOption: e };
                                                            temp[index] = { ...temp[index], optionOptions: options };
                                                            temp[index] = { ...temp[index], selectedGate: { label: "OR", value: "or" } };
                                                            temp[index] = { ...temp[index], selectedCondition: { label: "Equals", value: "equals" } };
                                                            temp[index] = { ...temp[index], selectedOptionOption: false };
                                                            temp[index] = { ...temp[index], textAreaValue: "" };
                                                            setConditionsList(temp);
                                                        })
                                                }}
                                                value={value.selectedOption}
                                                menuPlacement='top'
                                            />
                                        </div>
                                        <div style={{ width: "20%", marginRight: "5px" }}>
                                            <Select
                                                menuPortalTarget={document.body}
                                                styles={{
                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                }}
                                                placeholder="Condition"
                                                options={[{ label: "Equals", value: "equals" }, { label: "Contain", value: "contain" }]}
                                                onChange={(e) => {
                                                    // console.log(e)
                                                    let temp = [...conditionsList];
                                                    temp[index] = { ...temp[index], selectedCondition: e };
                                                    // console.log(temp);
                                                    setConditionsList(temp);
                                                }}
                                                value={value.selectedCondition}
                                                menuPlacement='top'
                                            />
                                        </div>
                                        <div style={{ width: "20%", marginRight: "5px" }}>
                                            {value.selectedType.value == 3 ?
                                                <div>
                                                    <TextField
                                                        type='text'
                                                        placeholder='Enter text'
                                                        onChange={(e) => {
                                                            let temp = [...conditionsList];
                                                            temp[index] = { ...temp[index], textAreaValue: e };
                                                            // console.log(temp);
                                                            setConditionsList(temp);
                                                        }}
                                                        value={value.textAreaValue}
                                                    />

                                                </div> :
                                                <Select
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                    }}
                                                    placeholder="Option Option"
                                                    options={value.optionOptions}
                                                    onChange={(e) => {
                                                        // console.log(e)
                                                        let temp = [...conditionsList];
                                                        temp[index] = { ...temp[index], selectedOptionOption: e };
                                                        // console.log(temp);
                                                        setConditionsList(temp);
                                                    }}
                                                    value={value.selectedOptionOption}
                                                    menuPlacement='top'
                                                />
                                            }
                                        </div>
                                        <div style={{ width: "20%", marginRight: "5px" }}>
                                            <Select
                                                menuPortalTarget={document.body}
                                                styles={{
                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                }}
                                                placeholder="Logic"
                                                options={[{ label: "AND", value: "and" }, { label: "OR", value: "or" }]}
                                                onChange={(e) => {
                                                    // console.log(e)
                                                    let temp = [...conditionsList];
                                                    temp[index] = { ...temp[index], selectedGate: e };
                                                    console.log(temp);
                                                    setConditionsList(temp);
                                                }}
                                                value={value.selectedGate}
                                                menuPlacement='top'
                                            />
                                        </div>
                                        <div style={{ marginLeft: "5px", marginTop: "9px", cursor: "pointer", display: "flex" }}>
                                            <div onClick={() => {
                                                let temp = [...conditionsList];
                                                temp.splice(index + 1, 0, {
                                                    selectedType: false,
                                                    typeOptions: false,
                                                    selectedGate: { label: "OR", value: "or" },
                                                    selectedCondition: { label: "Equals", value: "equals" },
                                                    selectedOption: false,
                                                    optionOptions: false,
                                                    selectedOptionOption: false,
                                                    textAreaValue: "",
                                                });
                                                setConditionsList(temp);
                                            }}>
                                                <Icon
                                                    source={PlusCircleIcon}
                                                    color="base"
                                                />
                                            </div>
                                            {conditionsList.length > 1 ?
                                                <div onClick={() => {
                                                    let temp = [...conditionsList];
                                                    temp.splice(index, 1);
                                                    setConditionsList(temp);
                                                }}>
                                                    <Icon
                                                        source={XCircleIcon}
                                                        color="base"
                                                    />
                                                </div> : <div style={{ width: "20px" }}>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                )
                            }) : null}
                    </Grid.Cell>
                </Grid>
            </Modal.Section>
        </Modal >

    );
}

export default AddEditOption;
