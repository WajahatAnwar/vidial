
import { Grid, TextField, Card, Modal, Button, Checkbox, Text } from '@shopify/polaris';
import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import '@/ReactJs/Applications/Filter/Assets/css/style.css';
import Select, { components } from 'react-select';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setAddOptionModal, setOptionsReload, setToastActive, setToastMessage, setUpdateOptionId, setUpdateOptionSetId } from '@/ReactJs/reducers/ClubColorSlice';
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';
import { AgGridReactUi } from 'ag-grid-react/lib/reactUi/agGridReactUi';
import { Close } from '@mui/icons-material';

const AddEditFilter = () => {

    function orderBySortNumberAscending(objArray) {
        const objectsWithSortNumber = objArray.filter(item => item.sort_number !== null);
        const objectsWithNullSortNumber = objArray.filter(item => item.sort_number === null);
        const sortedObjects = objectsWithSortNumber.sort((a, b) => a.sort_number - b.sort_number);
        const finalArray = sortedObjects.concat(objectsWithNullSortNumber);
        return finalArray;
    }

    function areLabelsUnique(array) {
        let uniqueLabels = new Set();
        for (const obj of array) {
            const label = obj.label;
            if (uniqueLabels.has(label)) {
                return false;
            }
            uniqueLabels.add(label);
        }
        return true;
    }


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

    const dispatch = useDispatch();

    const optionsReload = useSelector((state) => state.clubColor.optionsReload);
    const updateOptionId = useSelector((state) => state.clubColor.updateOptionId);
    const addOptionModal = useSelector((state) => state.clubColor.addOptionModal);
    const imagesTableRows = useSelector((state) => state.clubColor.imagesTableRows);
    const imagesTableStaticRows = useSelector((state) => state.clubColor.imagesTableStaticRows);
    const updateOptionSetId = useSelector((state) => state.clubColor.updateOptionSetId);


    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const handleChange = useCallback(() => {

        setFlag(false);

        if (addOptionModal) {
            dispatch(setAddOptionModal(false));
            dispatch(setUpdateOptionId(false));
        }
        else {
            dispatch(setAddOptionModal(true));;
        }

    }, [addOptionModal]);

    const [optionTypes, setOptionTypes] = useState([]);
    const [optionSets, setOptionSets] = useState([]);
    const [optionName, setOptionName] = useState("");
    const [optionNameTwo, setOptionNameTwo] = useState("");
    const [selectedOptionType, setSelectedOptionType] = useState(false);
    const [selectedOptionSets, setSelectedOptionSets] = useState([]);
    const [prefix, setPrefix] = useState("");

    //FILTERS DATA
    const [defaultStates, setDefaultStates] = useState([]);
    const [selectedDefaultState, setSelectedDefaultState] = useState({ value: 2, label: "Collapsed" });
    const [multiSelect, setMultiSelect] = useState(false);
    const [families, setFamilies] = useState([]);
    const [selectedFamilies, setSelectedFamilies] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [filterDataFiltered, setFilterDataFiltered] = useState([]);
    const [sortTypes, setSortTypes] = useState([]);
    const [selectedSortType, setSelectedSortType] = useState(false);
    const [showSwatch, setShowSwatch] = useState(false);
    const [labels, setLabels] = useState([]);
    const [rowData, setRowData] = useState();
    const [gridApi, setGridApi] = useState(null);

    const [startEdit, setStartEdit] = useState(false);

    const columnDefs = [
        { field: 'Sort', width: 150, rowDrag: true, sortable: false, menuTabs: [] },
        { field: 'option', width: 350, sortable: false, menuTabs: [] },
    ]

    const onGridReady = useCallback((params) => {
        setGridApi(params.api);
    }, [selectedSortType]);

    useEffect(() => {

        setFlag(false);

        if (updateOptionId) {
            fetch(`/filter/get_filter_editing_data?filter_id=${updateOptionId}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);

                    setOptionName(data.data.name);
                    setPrefix(data.data.prefix);
                    setOptionNameTwo(data.data.frontend_name);
                    setSelectedOptionType({
                        value: data.data.filter_type.id,
                        label: data.data.filter_type.name
                    });

                    setMultiSelect(data.data.multi_select ? true : false);
                    setShowSwatch(data.data.show_swatches ? true : false);

                    let temp_two = [];
                    data.data.filter_sets.forEach(element => { temp_two.push({ value: element.id, label: element.name }) });
                    setSelectedOptionSets(temp_two);

                    setSelectedDefaultState({ value: data.data.default_state.id, label: data.data.default_state.name });
                    setSelectedSortType({ value: data.data.sort_type.id, label: data.data.sort_type.name });

                    const result = orderBySortNumberAscending(data.data.labels);

                    setStartEdit(true);

                    let labelsTemp = [];
                    result.map((value, index) => {
                        let temp = [];
                        value.values.forEach(element => {
                            temp.push({ value: element.filter_data.id, label: element.filter_data.name });
                        });
                        labelsTemp.push({ label: value.label, labelValues: temp });
                    });
                    setLabels(labelsTemp);

                    const resultTwo = orderBySortNumberAscending(data.data.families);
                    let temp = [];
                    resultTwo.map((value, index) => {
                        temp.push({ value: value.family.id, label: value.family.name });
                    });

                    setSelectedFamilies(temp);

                    setTimeout(() => {
                        setStartEdit(false);
                    }, 2000);
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            setOptionName("");
            setOptionNameTwo("");
            setSelectedOptionType(false);
            setPrefix("");
            setSelectedOptionSets([]);

            //FILTERS DATA
            setSelectedDefaultState({ value: 2, label: "Collapsed" });
            setMultiSelect(false);
            setSelectedFamilies([]);
            setSelectedSortType({ value: 1, label: "Alphabetical" });
            setShowSwatch(false);
            setLabels([]);
            setRowData();
            setGridApi(null);
        }

    }, [updateOptionId, optionsReload]);

    useEffect(() => {

        fetch('/filter/get_add_filter_data')
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
                data.data.data3.forEach(element => {
                    temp.push({ value: element.id, label: element.name });
                });
                setOptionSets(temp);
                temp = [];
                data.data.data4.forEach(element => {
                    temp.push({ value: element.id, label: element.name });
                });
                setDefaultStates(temp);
                setFilterData(data.data.data2);
                temp = [];
                data.data.data5.forEach(element => {
                    temp.push({ value: element.id, label: element.name });
                });
                setSortTypes(temp);
                temp = [];
                data.data.data6.forEach(element => {
                    temp.push({ value: element.id, label: element.name });
                });
                setFamilies(temp);
            })
            .catch((error) => {
                console.error(error);
            });

    }, [optionsReload]);

    useEffect(() => {

        let refinedData = [];

        if (selectedOptionType.value == 1)
            refinedData = filterData.filter(value => value.type == "product_tag");
        else if (selectedOptionType.value == 2)
            refinedData = filterData.filter(value => value.type == "product_type");
        else if (selectedOptionType.value == 4)
            refinedData = filterData.filter(value => value.type == "product_size");

        setFilterDataFiltered(refinedData.map((value, index) => {
            return { value: value.id, label: value.name };
        }));

        if (!updateOptionId) {
            setLabels([]);
            setRowData([]);
            setSelectedSortType({ value: 1, label: "Alphabetical" });
        }

    }, [selectedOptionType, filterData]);

    useEffect(() => {
        if (selectedSortType.value == 3) {
            if (selectedOptionType.value != 3) {
                let temp = [];
                labels.forEach((element, index) => { temp.push({ id: element.label, option: element.label }) });
                setRowData(temp);
            } else {
                let temp = [];
                selectedFamilies.forEach((element, index) => { temp.push({ id: element.value, option: element.label }) });
                setRowData(temp);
            }
        }
    }, [selectedSortType]);

    useEffect(() => {
        setFlag(false);
        if (!startEdit)
            setSelectedSortType({ value: 1, label: "Alphabetical" });

    }, [labels, selectedFamilies]);

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

        const formData = new FormData();

        formData.append('update_filter_id', updateOptionId);
        formData.append('filter_name', optionName);
        formData.append('filter_name_front', optionNameTwo);
        formData.append('filter_type', JSON.stringify(selectedOptionType));
        formData.append('default_state', JSON.stringify(selectedDefaultState));
        formData.append('multi_select', multiSelect);
        formData.append('selected_filter_sets', JSON.stringify(selectedOptionSets));
        formData.append('sort_type', JSON.stringify(selectedSortType));
        //TAGS, PRODUCT TYPE, SIZE LABELS & VALUES
        formData.append('labels', JSON.stringify(labels));
        //FILTER COLORS FAMILIES FIELDS
        formData.append('show_swatches', showSwatch);
        formData.append('filter_families', JSON.stringify(selectedFamilies));
        formData.append('prefix', prefix);

        if (selectedSortType.value == 3) {
            const rows = [];
            gridApi.forEachNodeAfterFilterAndSort((node) => rows.push(node.data));
            formData.append('sorted_data', JSON.stringify(rows));
        }

        fetch('/filter/add_filter', {
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
                    setPrefix("");
                    setSelectedOptionType(false);
                    setSelectedOptionSets([]);

                    //FILTERS DATA
                    setSelectedDefaultState({ value: 2, label: "Collapsed" });
                    setMultiSelect(false);
                    setSelectedFamilies([]);
                    setSelectedSortType({ value: 1, label: "Alphabetical" });
                    setShowSwatch(false);
                    setLabels([]);
                    setRowData();
                    setGridApi(null);
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
            open={addOptionModal}
            onClose={handleChange}
            title="Add Filter"
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
                                        <div><span style={{ marginBottom: "3px", color: "red" }}>*</span><label>Filter Name</label> </div>
                                        <TextField placeholder='Enter Filter Name' value={optionName} onChange={(e) => setOptionName(e)} type='text' />
                                    </div>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ width: "100%" }}>
                                    <div><span style={{ marginBottom: "3px", color: "red" }}>*</span><label>Filter Name (StoreFront)</label> </div>
                                    <TextField label="" placeholder='Enter Filter Set Name' value={optionNameTwo} onChange={(e) => setOptionNameTwo(e)} type='text' />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div><span style={{ marginBottom: "3px", color: "red" }}>*</span><label>Type</label> </div>

                                <div>
                                    <Select
                                        placeholder="Select Filter Type"
                                        onChange={(e) => setSelectedOptionType(e)}
                                        value={selectedOptionType}
                                        options={optionTypes}
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ marginBottom: "3px" }}>Default State</div>
                                <div>
                                    <Select
                                        placeholder="Select Default State"
                                        onChange={(e) => setSelectedDefaultState(e)}
                                        value={selectedDefaultState}
                                        options={defaultStates}
                                    />
                                </div>
                            </Grid.Cell>

                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{}}>
                                    <Checkbox
                                        label="Multiple Selection"
                                        checked={multiSelect}
                                        onChange={(e) => setMultiSelect(e)}
                                    />
                                </div>
                            </Grid.Cell>

                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ marginBottom: "3px" }}>Select Filter Set</div>
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
                                    placeholder="Select Filter Set"
                                    options={optionSets}
                                    onChange={(e) => setSelectedOptionSets(e)}
                                    value={selectedOptionSets}
                                />
                            </Grid.Cell>
                        </Grid>
                    </Grid.Cell >
                    <Grid.Cell columnSpan={{ xs: 7, sm: 7, md: 7, lg: 7, xl: 7 }}>
                        <div style={{ height: "378px" }}>
                            <div style={{ overflow: "auto", padding: "20px", border: "1px dashed #c2c2c2", background: "#fafafa", borderRadius: "5px", width: "100%", height: "100%" }} >
                                {
                                    selectedOptionType.value == 1 || selectedOptionType.value == 2 || selectedOptionType.value == 4 ?
                                        <div>
                                            {selectedOptionType.value == 1 ? <div>
                                                <div style={{ marginBottom: "10px" }}>
                                                    <div style={{ marginBottom: "3px" }}><span style={{ color: "red" }}>*</span><label>Prefix</label> </div>
                                                    <TextField placeholder='Enter Prefix' value={prefix} onChange={(e) => setPrefix(e)} type='text' />
                                                </div>
                                                <div style={{ marginTop: "10px" }}></div>
                                            </div> : null}
                                            <div style={{ marginBottom: "15px" }}><Text variant="body" as="h5">{selectedOptionType.value == 1 ? 'Tag' : selectedOptionType.value == 2 ? 'Type' : selectedOptionType.value == 4 ? 'Size' : null} Configrations:</Text></div>
                                            <div>
                                                <div style={{ marginTop: "15px", marginBottom: "15px" }}>
                                                    <div>
                                                        <Button onClick={() => {
                                                            let temp = [...labels];
                                                            temp.push({ label: "", labelValues: [] });
                                                            setLabels(temp);
                                                            setSelectedSortType({ value: 1, label: "Alphabetical" })
                                                        }}>Add Merged Value +</Button>
                                                        {labels.map((value, index) => (
                                                            <div key={index} style={{ margin: '15px 0px', position: 'relative' }}>
                                                                <Card>
                                                                    <div>
                                                                        <div><span style={{ marginBottom: "3px", color: "red" }}>*</span><label>Label</label> </div>
                                                                        <TextField
                                                                            label=""
                                                                            value={value.label}
                                                                            onChange={(e) => {
                                                                                let temp = [...labels];
                                                                                temp[index] = { ...temp[index], label: e };
                                                                                setLabels(temp);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div><span style={{ marginTop: '10px', marginBottom: "3px", color: "red" }}>*</span><label>Values</label> </div>
                                                                    <div>
                                                                        <Select
                                                                            components={{ Option: InputOption }}
                                                                            menuPortalTarget={document.body}
                                                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                                            isSearchable
                                                                            placeholder="Select Label Values"
                                                                            value={value.labelValues}
                                                                            onChange={(e) => {
                                                                                let temp = [...labels];
                                                                                temp[index] = { ...temp[index], labelValues: e };
                                                                                setLabels(temp);
                                                                            }}
                                                                            options={filterDataFiltered}
                                                                            isMulti
                                                                            closeMenuOnSelect={false}
                                                                        />
                                                                    </div>
                                                                    <div style={{ position: 'absolute', top: '5px', right: '5px' }}>
                                                                        <div onClick={() => {
                                                                            let temp = [...labels];
                                                                            temp.splice(index, 1);
                                                                            setLabels(temp);
                                                                            setSelectedSortType({ value: 1, label: "Alphabetical" })
                                                                        }} style={{ border: '1px solid #f2f2f2', cursor: 'pointer' }}>
                                                                            <Close />
                                                                        </div>
                                                                    </div>
                                                                </Card>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: "10px", marginBottom: '5px' }}>Sort Order</div>
                                                <div>
                                                    <Select
                                                        menuPortalTarget={document.body}
                                                        styles={{
                                                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                        }}
                                                        value={selectedSortType}
                                                        onChange={(e) => {
                                                            setFlag(false);
                                                            if (e.value == 3) {
                                                                if (areLabelsUnique(labels))
                                                                    setSelectedSortType(e);
                                                                else {
                                                                    setFlag("error");
                                                                    setFlagMessage("Labels must be unique");
                                                                }
                                                            } else {
                                                                setSelectedSortType(e);

                                                            }
                                                        }}
                                                        options={sortTypes}
                                                    />
                                                    {selectedSortType.value == 3 ?
                                                        <div>
                                                            <div style={{ height: '350px', width: '100%', marginTop: '15px' }} className="ag-theme-alpine">
                                                                <AgGridReactUi
                                                                    rowData={rowData}
                                                                    columnDefs={columnDefs}
                                                                    defaultColDef={{
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
                                                        : null
                                                    }
                                                </div>
                                            </div>
                                        </div> : selectedOptionType.value == 3 ?
                                            <div>
                                                <div style={{ marginTop: "10px" }}></div>
                                                <div style={{ marginBottom: "15px" }}><Text variant="headingMd" as="h5">Color Configrations:</Text></div>
                                                <div>
                                                    <div style={{ marginTop: "10px", marginBottom: "15px" }}>
                                                        <Checkbox
                                                            label="Show Swatch"
                                                            checked={showSwatch}
                                                            onChange={(e) => setShowSwatch(e)}
                                                        />
                                                    </div>
                                                    <div><span style={{ marginTop: '15px', marginBottom: "5px", color: "red" }}>*</span><label>Color Families</label> </div>
                                                    <div>
                                                        <Select
                                                            components={{
                                                                Option: InputOption
                                                            }}
                                                            menuPortalTarget={document.body}
                                                            styles={{
                                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                            }}
                                                            isMulti
                                                            isSearchable  // Enable auto-fill
                                                            placeholder="Select Color Families"
                                                            options={families}
                                                            value={selectedFamilies}
                                                            closeMenuOnSelect={false}
                                                            hideSelectedOptions={false}
                                                            onChange={(e) => setSelectedFamilies(e)}
                                                        />
                                                    </div>
                                                    <div style={{ marginTop: "10px", marginBottom: '5px' }}>Sort Order</div>
                                                    <div>
                                                        <Select
                                                            menuPortalTarget={document.body}
                                                            styles={{
                                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                            }}
                                                            value={selectedSortType}
                                                            onChange={(e) => setSelectedSortType(e)}
                                                            options={sortTypes}
                                                        />
                                                        {selectedSortType.value == 3 ?
                                                            <div>
                                                                <div style={{ height: '350px', width: '100%', marginTop: '15px' }} className="ag-theme-alpine">
                                                                    <AgGridReactUi
                                                                        rowData={rowData}
                                                                        columnDefs={columnDefs}
                                                                        defaultColDef={{
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
                                                            : null
                                                        }
                                                    </div>
                                                </div>
                                            </div> : null
                                }
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Modal.Section>
        </Modal >

    );
}

export default AddEditFilter;
