import { Page, Grid, Card, Text, Button, Popover, DatePicker } from '@shopify/polaris';
import { useEffect, useState, useCallback } from 'react';
import React from 'react';
import Icon1 from '@/ReactJs/Applications/PurchaseOrder/Assets/images/icon1.png';
import Icon2 from '@/ReactJs/Applications/PurchaseOrder/Assets/images/icon2.png';
import Icon3 from '@/ReactJs/Applications/PurchaseOrder/Assets/images/icon3.png';
import Icon4 from '@/ReactJs/Applications/PurchaseOrder/Assets/images/icon4.png';
import Icon5 from '@/ReactJs/Applications/PurchaseOrder/Assets/images/icon5.png';
import Icon6 from '@/ReactJs/Applications/PurchaseOrder/Assets/images/icon6.png';

import AppLayout from '@/ReactJs/Applications/PurchaseOrder/AppLayout';
import "@shopify/polaris/build/esm/styles.css";

import Select, { components } from 'react-select';

function Dashboard(props) {

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

    const [ordersNumber, setOrdersNumber] = useState(false);
    const [ordersAmount, setOrdersAmount] = useState(false);
    const [approvedOrdersNumber, setApprovedOrdersNumber] = useState(false);
    const [approvedOrdersAmount, setApprovedOrdersAmount] = useState(false);
    const [pendingOrdersNumber, setPendingOrdersNumber] = useState(false);
    const [pendingOrdersAmount, setPendingOrdersAmount] = useState(false);
    const [storeOptions, setStoreOptions] = useState([]);

    const [selectedStore, setSelectedStore] = useState([]);
    const [reload, setReload] = useState(false);

    useEffect(() => {

        let arr_final = [];
        selectedStore.forEach(element => {
            arr_final.push(element.value);
        });


        fetch(`/purchase_order/get_dashboard_data?selected_store=${arr_final}`)
            .then((response) => response.json())
            .then((result) => {
                // console.log(result);
                setOrdersNumber(result.data[0]);
                setOrdersAmount(result.data[1]);
                setApprovedOrdersNumber(result.data[2]);
                setApprovedOrdersAmount(result.data[3]);
                setPendingOrdersNumber(result.data[4]);
                setPendingOrdersAmount(result.data[5]);
                let temp = [];
                result.data2.map((entry) => (temp.push({ label: `${entry.name}`, value: `${entry.id}` })));
                setStoreOptions(temp);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [reload]);

    return (
        <div style={{ background: `url('${window.appURL}/images/background6.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> Dashboard</div>
                </div>
                <div style={{ display: "flex", marginBottom: "15px" }}>
                    <div style={{ display: "flex" }}>
                        <Select
                            components={{
                                Option: InputOption
                            }}
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    width: "300px"
                                })
                            }}
                            isMulti
                            placeholder="Select Any Store..."
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            options={storeOptions}
                            onChange={(e) => {
                                console.log(e);
                                setSelectedStore(e);
                                setReload(!reload);
                            }}
                            value={selectedStore}
                        />
                    </div>
                </div>
                <div style={{ marginTop: "30px" }}></div>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Orders</p>
                                <img src={Icon1} style={{ width: "40px", height: "40px" }}></img>
                            </div>
                            <div style={{ marginTop: "-10px" }}>
                                <Text variant="heading2xl" as="h2">{ordersNumber}</Text>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Approved Orders</p>
                                <img src={Icon3} style={{ width: "40px", height: "40px" }}></img>
                            </div>
                            <div style={{ marginTop: "-10px" }}>
                                <Text variant="heading2xl" as="h2">{approvedOrdersNumber}</Text>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Pending Orders</p>
                                <img src={Icon2} style={{ width: "40px", height: "40px" }}></img>
                            </div>
                            <div style={{ marginTop: "-10px" }}>
                                <Text variant="heading2xl" as="h2">{pendingOrdersNumber}</Text>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Orders Amount</p>
                                <img src={Icon4} style={{ width: "40px", height: "40px" }}></img>
                            </div>
                            <div style={{ marginTop: "-10px" }}>
                                <Text variant="heading2xl" as="h2">${ordersAmount && ordersAmount.toFixed(2)}</Text>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Approved Orders Amount</p>
                                <img src={Icon5} style={{ width: "40px", height: "40px" }}></img>
                            </div>
                            <div style={{ marginTop: "-10px" }}>
                                <Text variant="heading2xl" as="h2">${approvedOrdersAmount && approvedOrdersAmount.toFixed(2)}</Text>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <p style={{ marginTop: "4px", fontWeight: "600" }}>Pending Orders Amount</p>
                                <img src={Icon6} style={{ width: "40px", height: "40px" }}></img>
                            </div>
                            <div style={{ marginTop: "-10px" }}>
                                <Text variant="heading2xl" as="h2">${pendingOrdersAmount && pendingOrdersAmount.toFixed(2)}</Text>
                            </div>
                        </Card>
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}

Dashboard.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Dashboard;
