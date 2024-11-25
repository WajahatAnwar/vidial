import { router, usePage } from "@inertiajs/react";
import { Button, Card, Tabs } from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";
import "@/ReactJs/Applications/VirtualOptions/Assets/css/style.css";
import Logo from '@/ReactJs/Applications/VirtualOptions/Assets/images/club_color_logo.png';

function CustomBar(props) {
    const page = usePage().props;
    useEffect(() => {

        if (location.pathname == "/virtual_options/dashboard") {
            setSelected(0);
        } else if (location.pathname == "/virtual_options/colors") {
            setSelected(1);
        } else if (location.pathname == "/virtual_options/logos") {
            setSelected(2);
        } else if (location.pathname == "/virtual_options/option_sets") {
            setSelected(3);
        } else if (location.pathname == "/virtual_options/stores_list") {
            setSelected(4);
        }

    }, [location.pathname]);

    const [selected, setSelected] = useState(0);

    const { query } = page.ziggy;

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);

        if (selectedTabIndex == 0) {
            router.get(route('index_virtual_options', query))
        } else if (selectedTabIndex == 1) {
            router.get(route('colors', query))
        } else if (selectedTabIndex == 2) {
            router.get(route('logos', query))
        } else if (selectedTabIndex == 3) {
            router.get(route('option_sets', query))
        } else if (selectedTabIndex == 4) {
            router.get(route('stores', query))
        }

    }, []);

    const tabs = [
        {
            id: "Dashboard",
            content: "Dashboard",
        },
        {
            id: "Colors",
            content: "Colors",
        },
        {
            id: "Logos",
            content: "Logos",
        },
        {
            id: "Option Set",
            content: "Option Set",
        },
        {
            id: "Applicator",
            content: "Applicator",
        }
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
        <div className="navTabs">
            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}></Tabs>
            <div style={{ marginTop: "-35px", display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", marginLeft: "10px", cursor: "pointer" }} onClick={() => router.get(route('index'))}>
                    <img src={Logo} width="72px"></img>
                    <p style={{ margin: "10px 0px 9px 10px", color: "#FFFFFF", fontSize: "16px", fontWeight: "600" }}>Club Colors</p>
                </div>
                <button type="button" onClick={logOutHandler} className="logout_btn" style={{ color: "#9A30CA" }}>Log Out</button>
            </div>
        </div>
    );
}

export default CustomBar;
