import AppLayout from '@/ReactJs/Applications/OrderSplitter/AppLayout';
import "@/ReactJs/Applications/OrderSplitter/Assets/css/style.css";
import { router, usePage } from '@inertiajs/react';
import { Button, Card, ChoiceList, Grid, Icon, Page, Tag, TextField } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';

function AddVendor() {

    const page = usePage().props;
    const { query } = page.ziggy;

    const [selectedTags, setSelectedTags] = useState([]);
    const [vendorName, setVendorName] = useState("");

    const [privateKey, setPrivateKey] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [storeId, setStoreId] = useState("");
    const [warehouseId, setWarehouseId] = useState("");
    const [newTag, setNewTag] = useState("");

    const [selectedType, setSelectedType] = useState("tags");
    const [shopifyVendorsList, setShopifyVendorsList] = useState([]);
    const [selectedShopifyVendor, setSelectedShopifyVendor] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(false);

    useEffect(() => {
        fetch("/order_splitter/get_shopify_vendors")
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    setShopifyVendorsList(data.data.map((item) => {
                        return { value: item.id, label: item.name }
                    }));

                    setUsers(data.data2.map((item) => {
                        return { value: item.id, label: item.store_name ? item.store_name : item.name }
                    }));
                } else if (data.success === false) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: data.message,
                    })
                }
            });
    }, []);

    function addNewVednorHandler() {

        const formData = new FormData();

        formData.append('vendor_name', vendorName);
        formData.append('vendor_private_key', privateKey);
        formData.append('vendor_secret_key', secretKey);
        formData.append('vendor_store_id', storeId);
        formData.append('vendor_warehouse_id', warehouseId);
        formData.append('tags', JSON.stringify(selectedTags));
        formData.append('type', selectedType);
        formData.append('shopify_vendors', JSON.stringify(selectedShopifyVendor));
        formData.append('user', JSON.stringify(selectedUser));

        fetch(
            "/order_splitter/add_new_vendor",
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
                    router.get(route('vendors_order_splitter', query));
                } else if (data.success === false) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: data.message,
                    })
                }
            });
    }

    const removeTag = useCallback(
        (tag) => () => {
            setSelectedTags((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag),
            );
        },
        [],
    );

    const tagMarkup = selectedTags.map((option, index) => (
        <span key={index} style={{ marginLeft: "5px" }}>
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

    return (
        <div style={{ background: `url('${window.appURL}/images/background5.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => router.get(route('vendors_order_splitter', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}>Add Vendor </div>
                            </div>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <div style={{ width: '100%' }}>
                                    <TextField
                                        label='Vendor Name'
                                        value={vendorName}
                                        onChange={(e) => setVendorName(e)}
                                        autoComplete="off"
                                        placeholder='Enter Name'
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: "20px" }}></div>
                            <div>
                                <TextField
                                    label="Secret Key"
                                    value={secretKey}
                                    onChange={(e) => setSecretKey(e)}
                                    autoComplete="off"
                                    placeholder='Enter Secret Key'
                                />
                            </div>
                            <div style={{ display: "flex", justifyContent: 'space-between', marginTop: '20px' }}>
                                <div style={{ width: '100%' }}>
                                    <TextField
                                        label='Private Key'
                                        value={privateKey}
                                        onChange={(e) => setPrivateKey(e)}
                                        autoComplete="off"
                                        placeholder='Enter Private Key'
                                    />
                                </div>
                            </div>
                        </Card>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                        <Card>
                            <div style={{ marginTop: "10px" }}>
                                Select Type
                                <ChoiceList
                                    choices={[
                                        { label: 'Tags', value: 'tags' },
                                        { label: 'Shopify Vendor', value: 'shopify_vendor' },
                                    ]}
                                    selected={selectedType}
                                    onChange={(e) => setSelectedType(e)}
                                />
                            </div>
                            {selectedType == "tags" ?
                                <div style={{ marginTop: "10px" }}>
                                    <div style={{ width: "100%", marginRight: "15px" }} onKeyPress={(e) => { if (e.key === "Enter") { addTagHandler(); } }}>
                                        <TextField
                                            label="Tags"
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
                                </div> : selectedType == "shopify_vendor" ? <div style={{ marginTop: "10px" }}>
                                    <div style={{ marginBottom: "5px" }}>Shopify Vendors</div>
                                    <div className='personalization-input'>
                                        <Select
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                            options={shopifyVendorsList}
                                            value={selectedShopifyVendor}
                                            onChange={(e) => setSelectedShopifyVendor(e)}
                                            isMulti
                                            closeMenuOnSelect
                                        />
                                    </div>
                                </div> : null
                            }

                            {selectedType == "shopify_vendor" ?
                                <div style={{ marginTop: "20px" }}>
                                    <div style={{ marginBottom: "5px" }}>Shop</div>
                                    <div className='personalization-input'>
                                        <Select
                                            menuPortalTarget={document.body}
                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                            options={users}
                                            value={selectedUser}
                                            onChange={(e) => setSelectedUser(e)}
                                            placeholder="Select Shop here..."
                                        />
                                    </div>
                                </div>
                                : null
                            }
                            <div style={{ marginTop: "20px" }}></div>
                            <div>
                                <TextField
                                    label="Store Id"
                                    value={storeId}
                                    onChange={(e) => setStoreId(e)}
                                    autoComplete="off"
                                    placeholder='Enter Store Id'
                                />
                            </div>
                            <div style={{ marginTop: "20px" }}></div>
                            <div>
                                <TextField
                                    label="Warehouse Id"
                                    value={warehouseId}
                                    onChange={(e) => setWarehouseId(e)}
                                    autoComplete="off"
                                    placeholder='Enter Warehouse Id'
                                />
                            </div>
                        </Card>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                        <div style={{ paddingTop: "20px", borderTop: "1px solid #e1e3e5", marginBottom: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <div style={{ display: "flex" }}>
                                    <Button onClick={() => router.get(route('vendors_order_splitter', query))} >Discard</Button>
                                    <div style={{ marginLeft: "10px" }}>
                                        <Button variant="primary" onClick={addNewVednorHandler}>Save</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}
AddVendor.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default AddVendor;
