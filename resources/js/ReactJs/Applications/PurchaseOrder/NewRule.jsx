import AppLayout from '@/ReactJs/Applications/PurchaseOrder/AppLayout';
import "@/ReactJs/Applications/PurchaseOrder/Assets/css/style.css";
import { router, usePage } from '@inertiajs/react';
import { Button, Card, Checkbox, ChoiceList, Grid, Icon, Page, Tag, TextField } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import Select, { components } from 'react-select';
import Swal from 'sweetalert2';

const NewRule = () => {

    //
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

    const [storesList, setStoresList] = useState([]);
    const [selectedStoresList, setSelectedStoresList] = useState([]);

    useEffect(() => {
        fetch(`/purchase_order/stores_list`)
            .then((response) => response.json())
            .then((result) => {
                // console.log(result);
                let temp = [];
                result.data.map((entry) => (temp.push({ value: entry.id, label: entry.name })));
                setStoresList(temp);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const page = usePage().props;
    const { query } = page.ziggy;

    const [newTag, setNewTag] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);

    const [ruleName, setRuleName] = useState("");
    const [ruleType, setRuleType] = useState(['and']);

    const [checked, setChecked] = useState(true);
    const handleChange = useCallback((newChecked) => setChecked(newChecked), []);

    const removeTag = useCallback(
        (tag) => () => {
            setSelectedTags((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag),
            );
        },
        [],
    );

    const tagMarkup = selectedTags.map((option, index) => (
        <span key={index} style={{ marginLeft: `${index == 0 ? '0px' : '5px'}` }}>
            <Tag key={option} onRemove={removeTag(option)}>
                {option}
            </Tag>
        </span>
    ));

    const addTagHandler = () => {

        const check = newTag;
        let noErrors = true;

        if (check.trim() == "") {

            noErrors = false;
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Tag cannot be null.',
            })
        }

        if (selectedTags.includes(check)) {

            noErrors = false;
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Same Tag cannot be entered again.',
            })
        }

        if (noErrors == true) {
            let temp = [...selectedTags];
            temp.push(newTag);

            setNewTag("");
            setSelectedTags(temp);
        }
    }

    function addNewRuleHandler() {
        console.log(selectedTags);
        console.log(selectedStoresList);
        // console.log(ruleName);
        // console.log(ruleType);

        const formData = new FormData();

        formData.append('rule_name', ruleName);
        formData.append('rule_type', ruleType[0]);
        formData.append('rule_tags', JSON.stringify(selectedTags));
        formData.append('rule_stores', JSON.stringify(selectedStoresList));
        formData.append('tags_dependency', checked);

        fetch("/purchase_order/add_new_rule", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    router.get(route('rules_purchase_order', query));
                } else if (data.success === false) {
                    Swal.fire(
                        'Error!',
                        data.message,
                        'error'
                    )
                }
            });
    }

    return (
        <div style={{ background: `url('${window.appURL}/images/background6.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('rules_purchase_order', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> New Rule</div>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 7, sm: 7, md: 7, lg: 7, xl: 7 }}>
                        <Card>
                            <div>
                                <TextField
                                    value={ruleName}
                                    onChange={(e) => setRuleName(e)}
                                    label="Rule Name"
                                    type="text"
                                />
                            </div>
                            <div style={{ marginTop: "10px" }}>
                                <Checkbox
                                    label="Tags Dependency"
                                    checked={checked}
                                    onChange={handleChange}
                                />
                            </div>
                            {checked ?
                                <>
                                    <div style={{ marginTop: "5px" }}></div>
                                    <div>
                                        <div style={{ marginBottom: "5px", display: "flex", justifyContent: 'space-between' }}>
                                            <div style={{ width: "100%" }} onKeyPress={(e) => { if (e.key === "Enter") { addTagHandler(); } }}>
                                                <TextField
                                                    label="Tags"
                                                    value={newTag}
                                                    onChange={(e) => { setNewTag(e) }}
                                                    placeholder="Add tag here and press enter..."
                                                    type="text"
                                                    style={{ width: "400px" }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: "8px" }}>
                                            {selectedTags.length > 0 && <div style={{ border: "1px solid #9fa4ac", minHeight: "70px", padding: "5px", borderRadius: "4px" }}>{tagMarkup}</div>}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: "10px" }}>
                                        Select Rule Type
                                        <ChoiceList
                                            choices={[
                                                { label: 'AND', value: 'and' },
                                                { label: 'OR', value: 'or' },
                                            ]}
                                            selected={ruleType}
                                            onChange={(e) => setRuleType(e)}
                                        />
                                    </div>
                                </> : null
                            }
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 5, sm: 5, md: 5, lg: 5, xl: 5 }}>
                        <Card>
                            <div>
                                <div style={{ marginBottom: "5px" }}> Select Stores</div>
                                <Select
                                    components={{
                                        Option: InputOption
                                    }}
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                                    }}
                                    isMulti
                                    placeholder="Select Stores"
                                    options={storesList}
                                    value={selectedStoresList}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    onChange={(e) => setSelectedStoresList(e)}
                                />
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ marginTop: "6px", paddingTop: "20px", borderTop: "1px solid #e1e3e5", marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <div style={{ display: "flex" }}>
                                    <Button onClick={() => router.get(route('rules_purchase_order', query))}>Discard</Button>
                                    <div style={{ marginLeft: "10px" }}>
                                        <Button variant="primary" onClick={addNewRuleHandler}>Save</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Page>
        </div >
    );
}

NewRule.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default NewRule;

