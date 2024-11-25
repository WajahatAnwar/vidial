import { router, usePage } from "@inertiajs/react";
import { Button, LegacyTabs, Tabs } from '@shopify/polaris';
import React, { useState, useCallback, useEffect } from "react";
import "@/ReactJs/Applications/Analytics/Assets/css/style.css";
import Logo from '@/ReactJs/Applications/Analytics/Assets/images/club_color_logo.png';

function CustomBar(props) {
    const page = usePage().props;

    useEffect(() => {

        // console.log(location.pathname);

        if (location.pathname == "/analytics/dashboard") {
            setSelected(0);
        }
        else if (location.pathname == "/analytics/reports" || location.pathname == "/analytics/orders" || location.pathname == "/analytics/products" || location.pathname == "/analytics/collections") {
            setSelected(1);
        } else if (location.pathname == "/analytics/settings") {
            setSelected(2);
        }

    }, [location.pathname]);

    const [selected, setSelected] = useState(0);

    const { query } = page.ziggy;

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);

        if (selectedTabIndex == 0) {
            router.get(route('index_analytics', query))
        }
        else if (selectedTabIndex == 1) {

            router.get(route('reports', query))
        } else if (selectedTabIndex == 2) {
            router.get(route('settings_analytics', query))
        }
    }, []);

    const tabs = [
        {
            id: "all-customers-1",
            content: "Dashboard",
        },
        {
            id: "Reports",
            content: "Reports",
        },
        {
            id: "settings",
            content: "Settings"
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
                    <button type="button" onClick={logOutHandler} className="logout_btn" style={{ color: "#FB6340" }}>Log Out</button>
                </div>
            </div >
        </>
    );
}

export default CustomBar;
