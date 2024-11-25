import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { Button, ButtonGroup, Checkbox, Divider, Grid, Icon, Modal, Page, Text } from '@shopify/polaris';
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { useCallback, useState } from 'react';
import Select from 'react-select';
import RulesTable from './RulesTable';

import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import Leftmenu from '@/ReactJs/Applications/InConnect/Connections/LeftMenu/LeftMenu';
import Swal from 'sweetalert2';

function Rules({ productTypes }) {

    const [shopifyOrder, setShopifyOrder] = useState(false);
    const [intacctOrder, setIntacctOrder] = useState(false);
    const [productType, setProductType] = useState(false);

    const [editingId, setEditingId] = useState(false);

    // Modal popup
    const [active, setActive] = useState(false);
    const [reload, setReload] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);
    const activator = <span onClick={handleChange} style={{ display: 'none' }}>Open</span>;

    const saveVendor = async () => {
        let response = await fetch(editingId ? route('ic_rules.update') : route('ic_rules.store'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                editingId: editingId,
                shopifyOrder: shopifyOrder,
                intacctOrder: intacctOrder,
                productType: productType.value,
            }),
        });
        let data = await response.json();
        if (data.success) {
            Swal.fire({
                title: 'Success!',
                icon: 'success',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            });
            setReload(!reload);
            setActive(false);
            setShopifyOrder(false);
            setIntacctOrder(false);
            setProductType(false);
            setEditingId(false);
        } else {
            Swal.fire({
                position: "top-end",
                text: data.message,
                icon: "info",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    const reloadHandler = () => {
        setReload(!reload);
    }

    const editHandler = (rule) => {
        setActive(true);
        setEditingId(rule.id);
        setShopifyOrder(rule.shopifyOrder ? true : false);
        setIntacctOrder(rule.intacctOrder ? true : false);
        setProductType({
            value: rule.product_type.id,
            label: rule.product_type.name
        });
    }

    const product_types = productTypes.map((item) => {
        return {
            value: item.id,
            label: item.name
        }
    });

    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div className='cc-inconnect-body-wraper'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('ic_index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}>Rules</div>
                                </div>
                                <div className='addnewvendors'><Button onClick={handleChange} style={{ cursor: 'pointer' }}>Add New Rule</Button></div>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 3, xl: 3 }}>
                            <Text variant='headingLg' as='h5'>
                                <Leftmenu />
                            </Text>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 9, xl: 9 }}>
                            <RulesTable reload={reload} setReload={reloadHandler} productTypes={productTypes} editHandler={editHandler} />
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>


            <Modal
                activator={activator}
                open={active}
                onClose={handleChange}
                title={editingId ? 'Edit Rule' : 'Add Rule'}
            >
                <Modal.Section>
                    <div className='cc-in-vendors-wrapper'>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <label className='cust-staric' style={{ marginBottom: '4px', display: 'block' }}>
                                    Product Type
                                </label>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    onChange={(input) => setProductType(input)}
                                    value={productType}
                                    options={product_types}
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", margin: "0px 0px" }}>
                                    <div style={{ fontSize: "16px" }}>Cancel the order on Shopify</div>
                                    <Checkbox
                                        label=""
                                        checked={shopifyOrder}
                                        onChange={(e) => setShopifyOrder(e)}
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", margin: "0px 0px" }}>
                                    <div style={{ fontSize: "16px" }}>Cancel order sync on Intacct</div>
                                    <Checkbox
                                        label=""
                                        checked={intacctOrder}
                                        onChange={(e) => setIntacctOrder(e)}
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                        <div style={{ marginTop: "12px" }}>
                            <Divider />
                            <div className='vendors-cc-in-formbtns' style={{ marginTop: "20px" }}>
                                <ButtonGroup>
                                    <Button onClick={handleChange}>Cancel</Button>
                                    <Button variant="primary" onClick={saveVendor}>Save</Button>
                                </ButtonGroup>
                            </div>
                        </div>
                    </div>

                </Modal.Section>
            </Modal>
        </div>
    );
}

Rules.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Rules;
