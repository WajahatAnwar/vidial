import { router, usePage } from "@inertiajs/react";
import { Button, Card, Tabs, Icon } from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";
import "@/ReactJs/Applications/InConnect/Assets/css/style.css";
import Logo from '@/ReactJs/Applications/Racoon/Assets/images/club_color_logo.png';
import { SettingsIcon } from '@shopify/polaris-icons';

import { EnterIcon } from '@shopify/polaris-icons';
import { Popover, ActionList } from '@shopify/polaris';
function CustomBar() {

    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const activator = (
        <span style={{ marginRight: '10px' }}>
            <Button onClick={toggleActive}>
                <Icon source={SettingsIcon} tone="base" />
            </Button>
        </span>
    );
    const page = usePage().props;
    useEffect(() => {

        console.log(location.pathname)

        if (location.pathname == "/racoon/restrictions") {
            setSelected(0);
        } else if (location.pathname == "/racoon/orders") {
            setSelected(1);
        }
    }, [location.pathname]);
    const [selected, setSelected] = useState(0);
    const { query } = page.ziggy;
    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);

        if (selectedTabIndex == 0) {
            router.get(route('restrictions.index', query))
        } else if (selectedTabIndex == 1) {
            router.get(route('rc_orders.index', query))
        }
    }, []);
    const tabs = [
        {
            id: "Dashboard",
            content: "Dashboard",
        },
        {
            id: "Orders",
            content: "Orders",
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
                    <p style={{ margin: "10px 0px 9px 10px", color: "#FFFFFF", fontSize: "16px", fontWeight: "600" }}>Racoon</p>
                </div>
                <br />
                <Popover
                    active={active}
                    activator={activator}
                    autofocusTarget="first-node"
                    onClose={toggleActive}
                >
                    <ActionList
                        actionRole="menuitem"
                        items={[
                            {
                                content: 'Logout',
                                icon: EnterIcon,
                                onAction: () => logOutHandler()
                            },
                        ]}
                    />
                </Popover>
            </div>
        </div>
    );
}
export default CustomBar;
