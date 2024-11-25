import { router, usePage } from "@inertiajs/react";
import { Button, Card, Tabs } from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "@/ReactJs/Applications/SizeChart/Assets/css/style.css";
import Logo from '@/ReactJs/Applications/SizeChart/Assets/images/club_color_logo.png';

function CustomBar(props) {
    const page = usePage().props;
    useEffect(() => {
        if (location.pathname == "/size_chart/dashboard") {
            setSelected(0);
        } else if (location.pathname == "/size_chart/size-charts") {
            setSelected(1);
        } else if (location.pathname == "/size_chart/rules") {
            setSelected(2);
        } else if (location.pathname == "/size_chart/settings") {
            setSelected(3);
        }
    }, [location.pathname]);

    const [selected, setSelected] = useState(0);

    const { query } = page.ziggy;

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);

        if (selectedTabIndex == 0) {
            router.get(route('index_size_chart', query))
        } else if (selectedTabIndex == 1) {
            router.get(route('size.charts', query));
        } else if (selectedTabIndex == 2) {
            router.get(route('rules', query))
        } else if (selectedTabIndex == 3) {
            router.get(route('settings_size_chart', query))
        }
    }, []);

    const tabs = [
        {
            id: "all-customers-1",
            content: "Dashboard",
        },
        {
            id: "accepts-marketing-1",
            content: "Size Charts",
        },
        {
            id: "rules",
            content: "Rules",
        },
        {
            id: "teteat-customers-1",
            content: "Settings",
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
                <button type="button" onClick={logOutHandler} className="logout_btn" style={{ color: "#C9194E" }}>Log Out</button>
            </div>
        </div>
    );
}

export default CustomBar;
