import { router, usePage } from "@inertiajs/react";
import { Button, LegacyTabs, Tabs } from '@shopify/polaris';
import React, { useState, useCallback, useEffect } from "react";
import "@/ReactJs/Applications/OrderSplitter/Assets/css/style.css";
import Logo from '@/ReactJs/Applications/OrderSplitter/Assets/images/club_color_logo.png';

function CustomBar(props) {
    const page = usePage().props;

    useEffect(() => {

        // console.log(location.pathname);

        if (location.pathname == "/order_splitter/dashboard") {
            setSelected(0);
        } else if (location.pathname == "/order_splitter/vendors" || location.pathname == "/order_splitter/add_vendor" || location.pathname == "/order_splitter/edit_vendor") {
            setSelected(1);
        } else if (location.pathname == "/order_splitter/stores" || location.pathname == "/order_splitter/orders" || location.pathname == "/order_splitter/splitted_orders") {
            setSelected(2);
        } else if (location.pathname == "/order_splitter/logs") {
            setSelected(3);
        } else if (location.pathname == "/order_splitter/oakHall") {
            setSelected(4);
        }


    }, [location.pathname]);

    const [selected, setSelected] = useState(0);

    const { query } = page.ziggy;

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);

        if (selectedTabIndex == 0) {
            router.get(route('index_order_splitter', query))
        }
        else if (selectedTabIndex == 1) {

            router.get(route('vendors_order_splitter', query))
        } else if (selectedTabIndex == 2) {

            router.get(route('stores_orders_splitter', query))
        } else if (selectedTabIndex == 3) {

            router.get(route('logs_order_splitter', query))
        }
        else if (selectedTabIndex == 4) {

            router.get(route('oak_hall_order_listing', query))
        }
    }, []);

    const tabs = [
        {
            id: "Dashboard",
            content: "Dashboard",
        },
        {
            id: "Vendors",
            content: "Vendors",
        },
        {
            id: "Stores",
            content: "Stores"
        },
        {
            id: "Logs",
            content: "Logs"
        },
        {
            id: "Oak Hall",
            content: "Oak Hall"
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
                    <button type="button" onClick={logOutHandler} className="logout_btn" style={{ color: "#111D4A" }}>Log Out</button>
                </div>
            </div >
        </>
    );
}

export default CustomBar;
