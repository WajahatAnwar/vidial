import { router, usePage } from "@inertiajs/react";
import { Button, Card, Tabs } from "@shopify/polaris";
import React from "react";
import "@/ReactJs/MyApplication/Assets/css/style.css";
import Logo from '@/ReactJs/MyApplication/Assets/images/club_color_logo.png';
import { useEffect } from "react";
import { useState } from "react";
import { useCallback } from "react";

function CustomBar(props) {

    const page = usePage().props;

    useEffect(() => {

        if (location.pathname == "/dashboard") {
            setSelected(0);
        }
        else if (location.pathname == "/users") {
            setSelected(1);
        }

    }, [location.pathname]);

    const [selected, setSelected] = useState(0);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);

        if (selectedTabIndex == 0) {
            router.get(route('index'))
        }
        else if (selectedTabIndex == 1) {

            router.get(route('users_aio'))
        }

    }, []);

    const tabs = page.auth.user.role_id != 3 ? [
        {
            id: "Dashboard",
            content: "Dashboard",
        },
        {
            id: "Users",
            content: "Users",
        }
    ] : [{
        id: "Dashboard",
        content: "Dashboard",
    }];



    const logOutHandler = () => {

        fetch('/logout', { method: 'POST' })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                if (data.success == true) {
                    router.get(route('login'));
                }
            })
    }

    return (
        <div className="navTabs">
            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            </Tabs>
            <div style={{ marginTop: "-35px", display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", marginLeft: "10px", cursor: "pointer" }} onClick={() => router.get(route('index'))}>
                    <img src={Logo} width="72px"></img>
                    <p style={{ margin: "10px 0px 9px 10px", color: "#FFFFFF", fontSize: "16px", fontWeight: "600" }}>Club Colors</p>
                </div>
                <button type="button" onClick={logOutHandler} className="logout_btn" style={{ color: "rgb(16, 13, 98)" }}>Log Out</button>
            </div>
        </div>
    );
}

export default CustomBar;
