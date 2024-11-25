import AppLayout from '@/ReactJs/Applications/PurchaseOrder/AppLayout';
import ToggleSmall from '@/ReactJs/Components/ToggleSmall';
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faCartShopping,
    faDollarSign,
    faRupeeSign,
    faSterlingSign
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { router, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    ColorPicker,
    Grid, Icon,
    IndexFilters,
    IndexTable,
    Link, Modal,
    Page,
    Pagination,
    Select as ShopifySelect,
    Tag,
    TextField,
    hsbToHex,
    hsbToRgb,
    rgbToHex, rgbToHsb,
    useIndexResourceState,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import Convert from 'color-convert';
import { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';

library.add(
    faCartShopping,
    faDollarSign,
    faSterlingSign,
    faRupeeSign
);

function Stores() {

    const page = usePage().props;
    const { query } = page.ziggy;

    const icons = [
        { label: 'Cart', value: 'fa-solid fa-cart-shopping' },
        { label: 'Dollar', value: 'fa-solid fa-dollar-sign' },
        { label: 'Pounds', value: 'fa-solid fa-sterling-sign' },
        { label: 'Rupee', value: 'fa-solid fa-rupee-sign' },
    ];

    const [reload, setReload] = useState(false);

    const [selectedIcon, setIconSelected] = useState('fa-solid fa-cart-shopping');
    const [buttonPlacement, setButtonPlacement] = useState('left');


    const [buttonText, setButtonText] = useState('Place Order');

    const [fontColor, setFontColor] = useState({
        hue: 136,
        brightness: 0,
        saturation: 0,
    });
    const [buttonColor, setButtonColor] = useState({
        hue: 136,
        brightness: 1,
        saturation: 0,
    });

    const [fontColorHex, setFontColorHex] = useState('#000000');
    const [buttonColorHex, setButtonColorHex] = useState('#ffffff');

    const [fontColorHide, setFontColorHide] = useState(false);
    const [buttonColorHide, setButtonColorHide] = useState(false);

    const [poFieldPlaceHolder, setPoFieldPlaceHolder] = useState("Enter Po Id");
    const [discountFieldPlaceholder, setDiscountFieldPlaceholder] = useState("Enter Discount Code");

    function updateSettingsHandler() {

        const formData = new FormData();

        formData.append('button_text', buttonText);
        formData.append('button_icon', selectedIcon);
        formData.append('button_placement', buttonPlacement);
        formData.append('font_color', JSON.stringify(hsbToRgb(fontColor)));
        formData.append('button_color', JSON.stringify(hsbToRgb(buttonColor)));
        formData.append('po_field_placeholder', poFieldPlaceHolder);
        formData.append('discount_field_placeholder', discountFieldPlaceholder);
        formData.append('user_id', selectedStoreId);

        fetch(
            `/purchase_order/set_button_settings`,
            {
                method: "POST",
                // headers: { "content-Type": "application/json" },
                body: formData,
            }
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        'Store Settings Updated',
                        'success'
                    )
                    setActiveFour(false);
                } else if (data.success === false) {

                }
            });
    }

    const [active, setActive] = useState(false);
    const [activeTwo, setActiveTwo] = useState(false);
    const [activeThree, setActiveThree] = useState(false);
    const [activeFour, setActiveFour] = useState(false);

    const [ruleOptions, setRuleOptions] = useState([]);
    const [selectedRule, setSelectedRule] = useState(false);

    const [newTag, setNewTag] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);

    const [selectedStoreId, setSelectedStoreId] = useState(false);
    const [selectedColor, setSelectedColor] = useState(false);

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

    function orderStatusHandler(status, id) {

        const formData = new FormData();
        formData.append('direct_approve', status);
        formData.append('user_id', id);

        fetch(
            `/purchase_order/change_order_status`,
            {
                method: "POST",
                body: formData,
            }
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        data.message,
                        'success'
                    );
                }
            });
    }

    function showDiscountHandler(status, id) {

        console.log(status);

        const formData = new FormData();
        formData.append('discount_visibility', status);
        formData.append('user_id', id);

        fetch(
            `/purchase_order/change_discount_field_status`,
            {
                method: "POST",
                body: formData,
            }
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        data.message,
                        'success'
                    );
                } else if (data.success === false) {

                }
            });
    }

    let timeout = null;

    const resourceName = {
        singular: 'store',
        plural: 'stores',
    };

    const [tableRows, setTableRows] = useState([]);

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];
    const [pageCount, setPageCount] = useState("10");
    const handlePageCount = useCallback((value) => { setPageCount(value); setReload(!reload); }, [tableRows]);

    const [selected, setSelected] = useState(0);
    const [itemStrings, setItemStrings] = useState([
        'All',
    ]);

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions: []
    }));

    const sortOptions = [
        { label: 'Id', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
        { label: 'Name', value: 'name asc', directionLabel: 'Ascending' },
        { label: 'Name', value: 'name desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id asc']);

    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [queryValue, setQueryValue] = useState('');

    const [pagination, setPagination] = useState({
        path: route("po_stores"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);

    useEffect(() => {

        let url = new URL(pagination.path);

        if (pageCount) {
            url.searchParams.set('page_count', pageCount);
        }

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        if (sortSelected != "") {
            url.searchParams.set('q5', sortSelected[0]);
        } else {
            url.searchParams.delete('q5');
        }

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    // console.log(result);
                    const my_rows = [];

                    result.data.data.forEach((value, productIndex) => {
                        my_rows.push(
                            {
                                id: value.id,
                                title: value.store_name ? value.store_name : value.name,
                                direct_approve: value.direct_approve,
                                discount_visibility: value.show_discount_field,
                                rule: value.store_rule ? value.store_rule.rule.rule_name : 'N/A',
                                color: value.icons_color,
                                mails: value.store_emails,
                                button_setting: value.button_setting,
                            });
                    });

                    setTableRows(my_rows);
                    setRuleOptions(result.data2.map(value => ({ value: value.id, label: value.rule_name })));

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
                console.log(err);
                setLoading(false);
            });

    }, [reload])

    useEffect(() => {
        setReload(!reload);
    }, [sortSelected]);

    const handleFiltersQueryChange = useCallback(
        (value) => {
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [
        handleQueryValueRemove,
    ]);

    const promotedBulkActions = [
        {
            content: 'Apply Rule',
            onAction: () => {
                setActive(true);
            },
        },
        {
            content: 'Remove Rule',
            onAction: () => {
                removeRuleHandler()
            },
        },
    ];

    const rowMarkup = tableRows.map(
        ({ id, title, discount_visibility, direct_approve, rule, mails, color, button_setting }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    {id}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>
                        <Link
                            dataPrimaryLink
                        >
                            {title}
                        </Link>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {rule}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <ToggleSmall toggled={direct_approve} onClick={(e) => orderStatusHandler(e.target.checked, id)} />
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <ToggleSmall toggled={discount_visibility} onClick={(e) => showDiscountHandler(e.target.checked, id)} />
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Button outline size='slim' onClick={() => StoreColorHandler(id, color)}>Color</Button>
                    <span style={{ marginLeft: "10px" }} />
                    <Button outline size='slim' onClick={() => StoreMailsHandler(id, mails)}>Email's</Button>
                    <span style={{ marginLeft: "10px" }} />
                    <Button outline size='slim' onClick={() => storeButtonHandler(button_setting)}>Button</Button>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );



    function applyRuleHandler() {

        let errors = false;

        if (!selectedRule) {
            errors = true;
            Swal.fire(
                'Error!',
                'Kindly select the rule first.',
                'error'
            );
        }

        if (!errors) {

            const formData = new FormData();
            formData.append('rule', JSON.stringify(selectedRule));
            formData.append('users_ids', JSON.stringify(selectedResources));
            formData.append('all_check', allResourcesSelected);
            formData.append('search_query', JSON.stringify(myUrl.search));

            fetch(
                "/purchase_order/apply_rule",
                {
                    method: "POST",
                    body: formData,
                }
            )
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    if (data.success === true) {
                        setActive(false);
                        handleSelectionChange('all', false);
                        setReload(!reload);
                        Swal.fire(
                            'Success!',
                            'Rule Applied Successfully To Stores.',
                            'success'
                        );
                    }
                });
        }
    }

    function removeRuleHandler() {

        const formData = new FormData();
        formData.append('users_ids', JSON.stringify(selectedResources));
        formData.append('all_check', allResourcesSelected);
        formData.append('search_query', JSON.stringify(myUrl.search));

        fetch(
            "/purchase_order/remove_rule",
            {
                method: "POST",
                body: formData,
            }
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    handleSelectionChange('all', false);
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        'Rule Deleted from selected stores.',
                        'success'
                    );
                }
            });
    }

    const StoreColorHandler = (id, color) => {
        console.log("color");
        console.log(color);
        setSelectedStoreId(id);
        setSelectedColor(JSON.parse(color));
        setActiveTwo(true);
    }

    const StoreMailsHandler = (id, mails) => {
        setSelectedStoreId(id);
        setSelectedTags(mails ? mails.split(",") : []);
        setActiveThree(true);
    }


    function changeColorHandler() {

        const formData = new FormData();
        formData.append('user_id', selectedStoreId);
        formData.append('color', JSON.stringify(selectedColor));

        fetch(
            "/purchase_order/update_colors",
            {
                method: "POST",
                body: formData,
            }
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    setActiveTwo(false);
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        data.message,
                        'success'
                    );
                } else if (data.success === false) {

                }
            });
    }

    const saveEmailsHandler = () => {

        const data = { user_id: selectedStoreId, emails: selectedTags };

        fetch("/purchase_order/set_store_email", {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setActiveThree(false);
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        data.message,
                        'success'
                    );
                } else {
                    Swal.fire(
                        'Error!',
                        data.message,
                        'error'
                    );
                }
            })
    }

    const storeButtonHandler = (button_setting) => {
        setActiveFour(true);
        setButtonText(button_setting.button_text);
        setIconSelected(button_setting.icon_string);
        setFontColor(rgbToHsb(JSON.parse(button_setting.font_color)));
        setButtonColor(rgbToHsb(JSON.parse(button_setting.background_color)));
        setFontColorHex(rgbToHex(JSON.parse(button_setting.font_color)));
        setButtonColorHex(rgbToHex(JSON.parse(button_setting.background_color)));
        setDiscountFieldPlaceholder(button_setting.discount_field_placeholder);
        setPoFieldPlaceHolder(button_setting.po_field_placeholder);
        setButtonPlacement(button_setting.button_placement);
        setSelectedStoreId(button_setting.user_id);
    }

    return (
        <div style={{ background: `url('${window.appURL}/images/background6.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Modal
                    open={active}
                    onClose={() => setActive(false)}
                    title="Select Rule"
                    primaryAction={{
                        content: 'Assign',
                        onAction: applyRuleHandler,
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: () => setActive(false),
                        },
                    ]}
                >
                    <Modal.Section>
                        <Select
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                            }}
                            placeholder="Select Rule"
                            options={ruleOptions}
                            value={selectedRule}
                            onChange={(e) => setSelectedRule(e)}
                        />
                    </Modal.Section>
                </Modal>
                <Modal
                    open={activeTwo}
                    onClose={() => setActiveTwo(false)}
                    title="Color Scheme"
                    primaryAction={{
                        content: 'Save',
                        onAction: changeColorHandler,
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: () => setActiveTwo(false),
                        },
                    ]}
                >
                    <Modal.Section>
                        {selectedStoreId && selectedColor &&
                            <>
                                <div>
                                    <TextField
                                        value={rgbToHex(selectedColor)}
                                        type="text"
                                        onChange={(e) => {
                                            let rgb_temp = Convert.hex.rgb(e);
                                            setSelectedColor({ red: rgb_temp[0], green: rgb_temp[1], blue: rgb_temp[2], alpha: 1 });
                                        }}
                                    />
                                </div>
                                <div style={{ marginTop: "20px" }}>
                                    <ColorPicker
                                        onChange={(e) => setSelectedColor(hsbToRgb(e))}
                                        color={rgbToHsb(selectedColor)}
                                        fullWidth
                                    />
                                </div>
                            </>
                        }

                    </Modal.Section>
                </Modal>
                <Modal
                    open={activeThree}
                    onClose={() => setActiveThree(false)}
                    title="Manage Mails"
                    primaryAction={{
                        content: 'Save',
                        onAction: saveEmailsHandler,
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: () => setActiveThree(false),
                        },
                    ]}
                >
                    <Modal.Section>
                        {selectedStoreId &&
                            <>
                                <div>
                                    <div style={{ marginBottom: "5px", display: "flex", justifyContent: 'space-between' }}>
                                        <div style={{ width: "100%" }} onKeyPress={(e) => { if (e.key === "Enter") { addTagHandler(); } }}>
                                            <TextField
                                                label="Emails"
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
                            </>
                        }
                    </Modal.Section>
                </Modal>
                <Modal
                    open={activeFour}
                    onClose={() => setActiveFour(false)}
                    title="Settings"
                    primaryAction={{
                        content: 'Save',
                        onAction: updateSettingsHandler,
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: () => setActiveFour(false),
                        },
                    ]}
                >
                    <Modal.Section>

                        <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Buttons Settings</p>


                        <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "30px", marginTop: "30px" }}>
                            <div className='fontBigger' style={{ fontWeight: "600", lineHeight: '2em' }}>Preview</div>
                            <button style={{ border: "none", fontSize: `18px`, fontFamily: `Verdana`, padding: "20px", paddingRight: "30px", paddingLeft: "30px", boxShadow: "0px 0px 6px -1px rgba(0,0,0,0.46)", borderRadius: "8px", backgroundColor: `${buttonColorHex}`, color: `${fontColorHex}` }}>
                                <FontAwesomeIcon icon={selectedIcon} /> {buttonText}
                            </button>
                        </div>
                        <div>
                            <TextField
                                value={buttonText}
                                onChange={(e) => setButtonText(e)}
                                label="Button Text"
                                type="text"
                            />
                        </div>
                        <div style={{ marginTop: "10px" }}></div>
                        <div>
                            <ShopifySelect
                                label="Title Icon"
                                options={icons}
                                onChange={(e) => setIconSelected(e)}
                                value={selectedIcon}
                            />
                        </div>
                        <div style={{ marginTop: "10px" }}></div>
                        <div>
                            <ShopifySelect
                                label="Button Placement"
                                options={[
                                    { label: 'Left', value: 'left' },
                                    { label: 'Right', value: 'right' },
                                ]}
                                onChange={(e) => setButtonPlacement(e)}
                                value={buttonPlacement}
                            />
                        </div>
                        <div style={{ marginTop: "10px" }}></div>
                        <TextField
                            value={fontColorHex}
                            label="Font Color"
                            type="text"
                            onBlur={() => setFontColorHide(!fontColorHide)}
                            onFocus={() => setFontColorHide(!fontColorHide)}
                        />
                        {fontColorHide &&
                            <div style={{ marginTop: "20px" }}>
                                <ColorPicker fullWidth onChange={(e) => {
                                    // console.log(e)
                                    setFontColorHex(hsbToHex(e));
                                    setFontColor(e);
                                }} color={fontColor} />
                            </div>
                        }
                        <div style={{ marginTop: "10px" }}></div>
                        <TextField
                            value={buttonColorHex}
                            label="backgruond Color"
                            type="text"
                            onBlur={() => setButtonColorHide(!buttonColorHide)}
                            onFocus={() => setButtonColorHide(!buttonColorHide)}
                        />
                        {buttonColorHide &&
                            <div style={{ marginTop: "20px" }}>
                                <ColorPicker fullWidth onChange={(e) => {
                                    setButtonColorHex(hsbToHex(e));
                                    setButtonColor(e);
                                }} color={buttonColor} />
                            </div>
                        }

                        <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px", marginTop: "20px" }}>Fields Name Settings</p>
                        <div>
                            <TextField
                                value={poFieldPlaceHolder}
                                onChange={(e) => setPoFieldPlaceHolder(e)}
                                label="Po Field Text"
                                type="text"
                            />
                        </div>
                        <div style={{ marginTop: "10px" }}></div>
                        <div>
                            <TextField
                                value={discountFieldPlaceholder}
                                onChange={(e) => setDiscountFieldPlaceholder(e)}
                                label="Discount Field Text"
                                type="text"
                            />
                        </div>
                    </Modal.Section>
                </Modal>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('index_purchase_order', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Stores List</div>
                                </div>
                            </div>
                            <ShopifySelect
                                labelInline
                                label="Rows:"
                                options={pageOptions}
                                value={pageCount}
                                onChange={handlePageCount}
                            />
                        </div>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <Card>
                            <IndexFilters
                                sortOptions={sortOptions}
                                sortSelected={sortSelected}
                                queryValue={queryValue}
                                queryPlaceholder="Searching in all"
                                onQueryChange={handleFiltersQueryChange}
                                onQueryClear={handleQueryValueRemove}
                                onSort={setSortSelected}
                                cancelAction={{
                                    onAction: onHandleCancel,
                                    disabled: false,
                                    loading: false,
                                }}
                                tabs={tabs}
                                selected={selected}
                                onSelect={setSelected}
                                canCreateNewView={false}
                                filters={[]}
                                onClearAll={handleFiltersClearAll}
                                mode={mode}
                                setMode={setMode}
                                loading={loading}
                            />
                            <IndexTable
                                resourceName={resourceName}
                                itemCount={tableRows.length}
                                selectedItemsCount={
                                    allResourcesSelected ? 'All' : selectedResources.length
                                }
                                onSelectionChange={handleSelectionChange}
                                headings={[
                                    { title: 'Id' },
                                    { title: 'Store' },
                                    { title: 'Rule' },
                                    { title: 'Direct Approve' },
                                    { title: 'Discount Visibility' },
                                    { title: 'Action' },
                                ]}
                                promotedBulkActions={promotedBulkActions}
                                hasMoreItems
                            >
                                {rowMarkup}
                            </IndexTable>
                        </Card>
                        <hr></hr>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px', paddingBottom: '22px' }}>
                            <Pagination hasNext={pagination.next_cursor ? true : false} hasPrevious={pagination.prev_cursor ? true : false} onNext={() => {
                                setPagination({
                                    ...pagination,
                                    path: pagination.next_page_url
                                })
                                setCurrentCursor(pagination.next_cursor);
                                setReload(!reload);
                            }} onPrevious={() => {
                                setPagination({
                                    ...pagination,
                                    path: pagination.prev_page_url
                                })
                                setCurrentCursor(pagination.prev_cursor);
                                setReload(!reload);
                            }} />
                        </div>
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}

Stores.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Stores;

