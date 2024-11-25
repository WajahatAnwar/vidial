import { router, usePage } from "@inertiajs/react";
import { Button, LegacyTabs, Tabs } from '@shopify/polaris';
import React, { useState, useCallback, useEffect } from "react";
import "@/ReactJs/Applications/PurchaseOrder/Assets/css/style.css";
import Logo from '@/ReactJs/Applications/PurchaseOrder/Assets/images/club_color_logo.png';

function CustomBar(props) {
    const page = usePage().props;

    useEffect(() => {

        if (location.pathname == "/purchase_order/dashboard") {
            setSelected(0);
        } else if (location.pathname == "/purchase_order/stores") {
            setSelected(1);
        } else if (location.pathname == "/purchase_order/orders") {
            setSelected(2);
        } else if (location.pathname == "/purchase_order/rules" || location.pathname == "/purchase_order/new_rule" || location.pathname.includes("/purchase_order/edit_rule")) {
            setSelected(3);
        } else if (location.pathname == "/purchase_order/emails" || location.pathname.includes("/purchase_order/edit_email") || location.pathname == "/purchase_order/new_email") {
            setSelected(4);
        } else if (location.pathname == "/purchase_order/settings") {
            setSelected(5);
        } else if (location.pathname == "/purchase_order/shipping") {
            setSelected(6);
        }

    }, [location.pathname]);

    const [selected, setSelected] = useState(0);

    const { query } = page.ziggy;

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);

        if (selectedTabIndex == 0) {
            router.get(route('index_purchase_order', query))
        } else if (selectedTabIndex == 1) {
            router.get(route('stores_purchase_order', query))
        } else if (selectedTabIndex == 2) {
            router.get(route('orders_purchase_order', query))
        } else if (selectedTabIndex == 3) {
            router.get(route('rules_purchase_order', query))
        } else if (selectedTabIndex == 4) {
            router.get(route('emails_purchase_order', query))
        } else if (selectedTabIndex == 5) {
            router.get(route('settings_purchase_order', query))
        } else if (selectedTabIndex == 6) {
            router.get(route('shipping_purchase_order', query))
        }
    }, []);

    const tabs = [
        {
            id: "Dashboard",
            content: "Dashboard",
        },
        {
            id: "Stores",
            content: "Stores",
        },
        {
            id: "Orders",
            content: "Orders"
        },
        {
            id: "Rules",
            content: "Rules"
        },
        {
            id: "Emails",
            content: "Emails"
        },
        {
            id: "Settings",
            content: "Settings"
        },
        {
            id: "Shipping",
            content: "Shipping"
        },
    ];

    const logOutHandler = () => {

        fetch('/logout', { method: 'POST' })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                if (data.success == true) {
                    router.get(route('login', query));
                }
            })
    }

    return (
        <>
            <div className="navTabs">
                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                </Tabs>
                <div style={{ marginTop: "-35px", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", marginLeft: "10px", cursor: "pointer" }} onClick={() => router.get(route('index'))}>
                        <img src={Logo} width="72px"></img>
                        <p style={{ margin: "10px 0px 9px 10px", color: "#FFFFFF", fontSize: "16px", fontWeight: "600" }}>Club Colors</p>
                    </div>
                    <button type="button" onClick={logOutHandler} className="logout_btn" style={{ color: "#3C2218" }}>Log Out</button>
                </div>
            </div >
        </>
    );
}

export default CustomBar;
