import AppLayout from '@/ReactJs/Applications/PurchaseOrder/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { Button, Card, DataTable, Grid, Icon, IndexFilters, IndexTable, Link, Modal, Page, Pagination, RadioButton, Select as ShopifySelect, TextField, useIndexResourceState, useSetIndexFiltersMode } from '@shopify/polaris';
import { ArrowLeftIcon, XIcon, EditIcon } from '@shopify/polaris-icons';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';

function Shipping() {

    const page = usePage().props;
    const { query } = page.ziggy;

    const [active, setActive] = useState(false);
    const [currentModal, setCurrentModal] = useState(false);

    const [poShippingRules, setPoShippingRules] = useState([]);

    const [reload, setReload] = useState(false);

    const [priceShippingMin, setPriceShippingMin] = useState(0);
    const [priceShippingMax, setPriceShippingMax] = useState(0);
    const [priceShippingAmount, setPriceShippingAmount] = useState(0.00);
    const [priceShippingList, setPriceShippingList] = useState([]);
    const [priceShippingEdit, setPriceShippingEdit] = useState(false);

    const [locationShippingLocation, setLocationShippingLocation] = useState("");
    const [locationShippingType, setLocationShippingType] = useState("state");
    const [locationShippingAmount, setLocationShippingAmount] = useState(0.00);
    const [locationShippingList, setLocationShippingList] = useState([]);
    const [locationShippingEdit, setLocationShippingEdit] = useState(false);

    const [ruleShippingName, setRuleShippingName] = useState("");
    const [ruleVariableValue, setRuleVariableValue] = useState("");
    const [ruleShippingAmount, setRuleShippingAmount] = useState(0.00);
    const [ruleShippingEdit, setRuleShippingEdit] = useState(false);
    const [ruleShippingList, setRuleShippingList] = useState([]);

    const [selectedRule, setSelectedRule] = useState({ value: 1, label: "Specific shipping for given location" });

    useEffect(() => {

        fetch("/purchase_order/get_shipping_data")
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setPriceShippingList(data.data.price_shippings);
                setLocationShippingList(data.data.location_shippings);
                setRuleShippingList(data.data.rule_shippings);

                let temp = [];
                data.data.po_rule_types.forEach(element => {
                    temp.push({ value: element.id, label: element.name });
                });
                setPoShippingRules(temp);

                let temp2 = [];
                data.data.rule_shippings.forEach(element => {
                    temp2.push({ value: element.id, label: element.name });
                });
                setRuleOptions(temp2);
            })

    }, [reload]);













    const [ruleOptions, setRuleOptions] = useState([]);
    const [selectedRuleTwo, setSelectedRuleTwo] = useState(false);

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
                    const my_rows = [];

                    result.data.data.forEach((value, productIndex) => {
                        my_rows.push(
                            {
                                id: value.id,
                                title: value.store_name ? value.store_name : value.name,
                                rule_name: value.rule_rel ? value.rule_rel.name : 'N/A'
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
                setCurrentModal('apply_rule');
            },
        },
        {
            content: 'Remove Rule',
            onAction: () => {
                removeRuleHandler();
            },
        },
    ];

    const rowMarkup = tableRows.map(
        ({ id, title, rule_name }, index) => (
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
                    {rule_name}
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    function applyRuleHandler() {

        let errors = false;

        if (!selectedRuleTwo) {
            errors = true;
            Swal.fire(
                'Error!',
                'Kindly select the rule first.',
                'error'
            );
        }

        if (!errors) {

            const formData = new FormData();
            formData.append('rule', JSON.stringify(selectedRuleTwo));
            formData.append('users_ids', JSON.stringify(selectedResources));
            formData.append('all_check', allResourcesSelected);
            formData.append('search_query', JSON.stringify(myUrl.search));

            fetch(
                "/purchase_order/apply_rule_two",
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
            "/purchase_order/delete_rule_two",
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















    async function upload(formData, url) {
        try {
            const response = await fetch(url, {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                Swal.fire(
                    'Success!',
                    result.message,
                    'success'
                )
                setReload(!reload);
                setActive(false);
                setCurrentModal(false);
            } else {
                Swal.fire(
                    'Error!',
                    result.message,
                    'error'
                )
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const priceBasedShippingHandler = async () => {

        const formData = new FormData();

        formData.append("min", priceShippingMin);
        formData.append("max", priceShippingMax);
        formData.append("shipping_price", priceShippingAmount);
        formData.append("edit_id", priceShippingEdit);

        await upload(formData, "/purchase_order/add_edit_price_shipping");
    }

    const deletePriceShipping = async (id) => {

        const formData = new FormData();

        formData.append("price_shipping_id", id);

        await upload(formData, "/purchase_order/delete_price_shipping");
    }

    const locationBasedShippingHandler = async () => {

        const formData = new FormData();

        formData.append("location_type", locationShippingType);
        formData.append("location_name", locationShippingLocation);
        formData.append("shipping_price", locationShippingAmount);
        formData.append("edit_id", locationShippingEdit);

        await upload(formData, "/purchase_order/add_edit_location_shipping");
    }

    const deleteLocationShipping = async (id) => {

        const formData = new FormData();

        formData.append("location_shipping_id", id);

        await upload(formData, "/purchase_order/delete_location_shipping");
    }

    const ruleBasedShippingHandler = async () => {

        const formData = new FormData();

        formData.append("name", ruleShippingName);
        formData.append("p_o_rule_type_id", selectedRule.value);
        formData.append("first_value", ruleVariableValue);
        formData.append("shipping_price", ruleShippingAmount);
        formData.append("edit_id", ruleShippingEdit);

        await upload(formData, "/purchase_order/add_edit_rule_shipping");
    }

    const deleteRuleShipping = async (id) => {

        const formData = new FormData();

        formData.append("rule_shipping_id", id);

        await upload(formData, "/purchase_order/delete_rule_shipping");
    }

    return (
        <div style={{ background: `url('${window.appURL}/images/background6.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Modal
                open={active}
                onClose={() => setActive(false)}
                title={currentModal == 'price_based' ? 'Price Based Shipping' : currentModal == 'location_based' ? 'Location Based Shipping' : currentModal == 'rules_manage' ? 'Rules' : currentModal == 'apply_rule' ? 'Apply Rule' : null}
                primaryAction={{
                    content: `Save`,
                    onAction: () => {
                        currentModal == 'price_based' ? priceBasedShippingHandler() :
                            currentModal == 'location_based' ? locationBasedShippingHandler() :
                                currentModal == 'rules_manage' ? ruleBasedShippingHandler() :
                                    currentModal == 'apply_rule' ? applyRuleHandler() : null

                    },
                }}
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: () => {
                            setActive(false)
                        },
                    },
                ]}
            >
                <Modal.Section>
                    {currentModal == 'price_based' ?
                        <div>
                            <TextField
                                label="Order Total (Min)"
                                value={priceShippingMin}
                                onChange={(e) => setPriceShippingMin(e)}
                                autoComplete="off"
                                type="number"
                                placeholder='Enter Order Sub Total Minimum Amount'
                            />
                            <div style={{ marginTop: "10px" }}></div>
                            <TextField
                                label="Order Total (Max)"
                                value={priceShippingMax}
                                onChange={(e) => setPriceShippingMax(e)}
                                autoComplete="off"
                                type="number"
                                placeholder='Enter Order Sub Total Maximum Amount'
                            />
                            <div style={{ marginTop: "10px" }}></div>
                            <TextField
                                label="Shipping Amount"
                                value={priceShippingAmount}
                                onChange={(e) => setPriceShippingAmount(e)}
                                autoComplete="off"
                                type="number"
                                placeholder='Enter Shipping Amount'
                            />
                        </div> : null
                    }
                    {currentModal == 'location_based' ?
                        <div>
                            <div style={{ marginBottom: "10px" }}>
                                <div > Select </div>
                                <RadioButton
                                    label="State"
                                    // helpText="Customers will only be able to check out as guests."
                                    id="state"
                                    name="state"
                                    checked={locationShippingType == "state" ? "state" : false}
                                    onChange={() => setLocationShippingType("state")}

                                />
                                <span style={{ marginRight: "20px" }}></span>
                                <RadioButton
                                    label="Country"
                                    // helpText="Customers will be able to check out with a customer account or as a guest."
                                    id="country"
                                    name="country"
                                    checked={locationShippingType == "country" ? "country" : false}
                                    onChange={() => setLocationShippingType("country")}
                                />
                            </div>
                            <TextField
                                label="State/Country Name"
                                value={locationShippingLocation}
                                onChange={(e) => setLocationShippingLocation(e)}
                                autoComplete="off"
                                type="text"
                                placeholder='Enter State/Country Name'
                            />
                            <div style={{ marginTop: "10px" }}></div>
                            <TextField
                                label="Shipping Amount"
                                value={locationShippingAmount}
                                onChange={(e) => setLocationShippingAmount(e)}
                                autoComplete="off"
                                type="number"
                                placeholder='Enter Shipping Amount'
                            />
                        </div> : null
                    }
                    {currentModal == 'rules_manage' ?
                        <div>
                            <TextField
                                label="Rule Name"
                                value={ruleShippingName}
                                onChange={(e) => setRuleShippingName(e)}
                                autoComplete="off"
                                type="text"
                                placeholder='Enter Rule Name'
                            />
                            <div style={{ marginTop: "10px" }}></div>
                            <div>
                                <div style={{ marginBottom: "5px" }}>Rule Type</div>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: base => ({ ...base, zIndex: 9999 })
                                    }}
                                    placeholder="Select Rule Type"
                                    value={selectedRule}
                                    options={poShippingRules}
                                    onChange={(e) => {
                                        setSelectedRule(e);
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: "10px" }}></div>
                            <div>
                                <p style={{ background: '#cdcdcd', padding: '3px 8px', borderRadius: '3px', fontStyle: "italic" }}>
                                    <span style={{ fontWeight: 'bold' }}>Rule Info: </span>
                                    {selectedRule && selectedRule.value == 1 ?
                                        "Standard Shipping for everything except specific shipping for given state/country." :
                                        selectedRule && selectedRule.value == 2 ?
                                            "Standard Shipping for everything except specific shipping for products having given tag." :
                                            selectedRule && selectedRule.value == 3 ?
                                                "Shipping for everything is free except Standard shipping for given state/country." :
                                                selectedRule && selectedRule.value == 4 ?
                                                    "Standard Shipping for everything except no shipping to given state/country." : null
                                    }
                                </p>
                            </div>
                            {
                                selectedRule && selectedRule.value == 1 ?
                                    <div>
                                        <div style={{ marginTop: "10px" }}></div>
                                        <TextField
                                            label="State/Country Name"
                                            value={ruleVariableValue}
                                            onChange={(e) => setRuleVariableValue(e)}
                                            autoComplete="off"
                                            type="text"
                                            placeholder='Enter State/Country Name'
                                        />
                                        <div style={{ marginTop: "10px" }}></div>
                                        <TextField
                                            label="Shipping Amount"
                                            value={ruleShippingAmount}
                                            onChange={(e) => setRuleShippingAmount(e)}
                                            autoComplete="off"
                                            type="number"
                                            placeholder='Enter Shipping Amount'
                                        />
                                    </div> :
                                    selectedRule && selectedRule.value == 2 ?
                                        <div>
                                            <div style={{ marginTop: "10px" }}></div>
                                            <TextField
                                                label="Tag Name"
                                                value={ruleVariableValue}
                                                onChange={(e) => setRuleVariableValue(e)}
                                                autoComplete="off"
                                                type="text"
                                                placeholder='Enter Tag Name'
                                            />
                                            <div style={{ marginTop: "10px" }}></div>
                                            <TextField
                                                label="Shipping Amount"
                                                value={ruleShippingAmount}
                                                onChange={e => setRuleShippingAmount(e)}
                                                autoComplete="off"
                                                type="number"
                                                placeholder='Enter Shipping Amount'
                                            />
                                        </div>
                                        :
                                        selectedRule && selectedRule.value == 3 ?
                                            <div>
                                                <div style={{ marginTop: "10px" }}></div>
                                                <TextField
                                                    label="State/Country Name"
                                                    value={ruleVariableValue}
                                                    onChange={(e) => setRuleVariableValue(e)}
                                                    autoComplete="off"
                                                    type="text"
                                                    placeholder='Enter State/Country Name'
                                                />
                                            </div> :
                                            selectedRule && selectedRule.value == 4 ?
                                                <div>
                                                    <div style={{ marginTop: "10px" }}></div>
                                                    <TextField
                                                        label="State/Country Name"
                                                        value={ruleVariableValue}
                                                        onChange={(e) => setRuleVariableValue(e)}
                                                        autoComplete="off"
                                                        type="text"
                                                        placeholder='Enter State/Country Name'
                                                    />
                                                </div> : null
                            }

                        </div> : null
                    }
                    {currentModal == "apply_rule" ?
                        <div>
                            <Select
                                menuPortalTarget={document.body}
                                styles={{
                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                }}
                                placeholder="Select Rule"
                                options={ruleOptions}
                                value={selectedRuleTwo}
                                onChange={(e) => setSelectedRuleTwo(e)}
                            />
                        </div> : null
                    }
                </Modal.Section>
            </Modal>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('reports', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Shipping</div>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <Card>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                        <p style={{ fontSize: "16px", fontWeight: "600" }}>Price Based Shipping (Lowest Priority)</p>
                                        <Button size='slim' variant="primary" onClick={() => {
                                            setCurrentModal('price_based');
                                            setActive(true);
                                            setPriceShippingEdit(false);
                                            setPriceShippingAmount(0.00);
                                            setPriceShippingMin(0);
                                            setPriceShippingMax(0);
                                        }}>Add</Button>
                                    </div>
                                    <div style={{ marginTop: "20px", border: "1px solid #d8d8d8", borderRadius: "5px" }}>
                                        <DataTable
                                            columnContentTypes={[
                                                'text',
                                                'text',
                                                'text',
                                                'text'
                                            ]}
                                            headings={[
                                                'Total (Min)',
                                                'Total (Max)',
                                                'Shipping Price',
                                                'Action',
                                            ]}
                                            rows={priceShippingList.map((value, index) => {
                                                return [`$${value.min}`, `$${value.max}`, `$${value.shipping_price}`,
                                                <div style={{ cursor: "pointer", display: "flex" }}>
                                                    <span style={{ marginRight: "15px" }} onClick={() => {
                                                        setActive(true);
                                                        setCurrentModal("price_based");
                                                        setPriceShippingMin(value.min);
                                                        setPriceShippingMax(value.max);
                                                        setPriceShippingAmount(value.shipping_price);
                                                        setPriceShippingEdit(value.id);
                                                    }}>
                                                        <Icon source={EditIcon} color='success' />
                                                    </span>
                                                    <span onClick={() => {
                                                        Swal.fire({
                                                            title: 'Are you sure?',
                                                            text: "You won't be able to revert this!",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#28c748',
                                                            cancelButtonColor: '#d33',
                                                            confirmButtonText: 'Yes, delete it!'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                deletePriceShipping(value.id);
                                                            }
                                                        })
                                                    }}>
                                                        <Icon source={XIcon} color='critical' />
                                                    </span>
                                                </div>]
                                            })}
                                            hasZebraStripingOnData
                                            increasedTableDensity
                                        />
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                        <p style={{ fontSize: "16px", fontWeight: "600" }}>Location Based Shipping (Medium Priority)</p>
                                        <Button size='slim' variant="primary" onClick={() => {
                                            setCurrentModal('location_based');
                                            setActive(true);
                                            setLocationShippingEdit(false);
                                            setLocationShippingType("state");
                                            setLocationShippingAmount(0.00);
                                            setLocationShippingLocation("");
                                        }}>Add</Button>
                                    </div>
                                    <div style={{ marginTop: "20px", border: "1px solid #d8d8d8", borderRadius: "5px" }}>
                                        <DataTable
                                            columnContentTypes={[
                                                'text',
                                                'text',
                                                'text'
                                            ]}
                                            headings={[
                                                'State or Country',
                                                'Shipping Price',
                                                'Action',
                                            ]}
                                            rows={locationShippingList.map((value, index) => {
                                                return [value.location_name, `$${value.shipping_price}`,
                                                <div style={{ cursor: "pointer", display: "flex" }}>
                                                    <span style={{ marginRight: "15px" }} onClick={() => {
                                                        setActive(true);
                                                        setCurrentModal("location_based");
                                                        setLocationShippingType(value.location_type);
                                                        setLocationShippingLocation(value.location_name);
                                                        setLocationShippingAmount(value.shipping_price);
                                                        setLocationShippingEdit(value.id);
                                                    }}>
                                                        <Icon source={EditIcon} color='success' />
                                                    </span>
                                                    <span onClick={() => {
                                                        Swal.fire({
                                                            title: 'Are you sure?',
                                                            text: "You won't be able to revert this!",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#28c748',
                                                            cancelButtonColor: '#d33',
                                                            confirmButtonText: 'Yes, delete it!'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                deleteLocationShipping(value.id);
                                                            }
                                                        })
                                                    }}>
                                                        <Icon source={XIcon} color='critical' />
                                                    </span>
                                                </div>]
                                            })}
                                            hasZebraStripingOnData
                                            increasedTableDensity
                                        />
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 7, sm: 7, md: 7, lg: 7, xl: 7 }}>
                                    <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                        <p style={{ fontSize: "16px", fontWeight: "600" }}>Rules List</p>
                                        <Button size='slim' variant="primary" onClick={() => {
                                            setCurrentModal('rules_manage');
                                            setActive(true);
                                            setRuleShippingEdit(false);
                                            setRuleVariableValue("");
                                            setRuleShippingAmount(0.00);
                                            setSelectedRule({ value: 1, label: "Specific shipping for given location" });
                                            setRuleShippingName("");
                                        }}>Add</Button>
                                    </div>
                                    <div style={{ marginTop: "16px", border: "1px solid #d8d8d8", borderRadius: "5px" }}>
                                        <DataTable
                                            columnContentTypes={[
                                                'text',
                                                'text',
                                                'text'
                                            ]}
                                            headings={[
                                                'Rule',
                                                'Rule Type ID',
                                                'Action',
                                            ]}
                                            rows={ruleShippingList.map((value, index) => {
                                                return [value.name, value.p_o_rule_type_id,
                                                <div style={{ cursor: "pointer", display: "flex" }}>
                                                    <span style={{ marginRight: "15px" }} onClick={() => {
                                                        setActive(true);
                                                        setCurrentModal("rules_manage");
                                                        setRuleVariableValue(value.first_value);
                                                        setRuleShippingAmount(value.shipping_price);
                                                        setRuleShippingEdit(value.id);
                                                        setSelectedRule({ value: value.rule_rel.id, label: value.rule_rel.name })
                                                        setRuleShippingName(value.name);
                                                    }}>
                                                        <Icon source={EditIcon} color='success' />
                                                    </span>
                                                    <span onClick={() => {
                                                        Swal.fire({
                                                            title: 'Are you sure?',
                                                            text: "You won't be able to revert this!",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#28c748',
                                                            cancelButtonColor: '#d33',
                                                            confirmButtonText: 'Yes, delete it!'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                deleteRuleShipping(value.id);
                                                            }
                                                        })
                                                    }}>
                                                        <Icon source={XIcon} color='critical' />
                                                    </span>
                                                </div>]
                                            })}
                                            hasZebraStripingOnData
                                            increasedTableDensity
                                        />
                                    </div>
                                </Grid.Cell>




















                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                    <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                        <p style={{ marginTop: "8px", fontSize: "16px", fontWeight: "600" }}>Store Based Shipping (Highest Priority)</p>
                                        <ShopifySelect
                                            labelInline
                                            label="Rows:"
                                            options={pageOptions}
                                            value={pageCount}
                                            onChange={handlePageCount}
                                        />
                                    </div>
                                    <div style={{ marginTop: "10px" }}>
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
                                                { title: 'Rule' }
                                            ]}
                                            promotedBulkActions={promotedBulkActions}
                                            hasMoreItems
                                        >
                                            {rowMarkup}
                                        </IndexTable>
                                    </div>
                                    <hr></hr>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px' }}>
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
                        </Card>
                    </Grid.Cell>
                </Grid>
            </Page >
        </div >
    );
}

Shipping.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Shipping;
