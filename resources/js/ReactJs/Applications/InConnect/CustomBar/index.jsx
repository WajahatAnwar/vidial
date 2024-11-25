import { router, usePage } from "@inertiajs/react";
import { Button, Card, Tabs, Icon } from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";
import "@/ReactJs/Applications/InConnect/Assets/css/style.css";
import Logo from '@/ReactJs/Applications/InConnect/Assets/images/goosely_logo.png';
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

        if (location.pathname == "/goosely/dashboard") {
            setSelected(0);
        } else if (location.pathname == "/goosely/orders") {
            setSelected(1);
        } else if (location.pathname == "/goosely/shopify-accounts") {
            setSelected(2);
        } else if (location.pathname == "/goosely/logs") {
            setSelected(3);
        } else if (location.pathname == "/goosely/emails") {
            setSelected(4);
        } else if (location.pathname == "/goosely/batch/settings") {
            setSelected(5);
        } else if (location.pathname == "/goosely/tracking") {
            setSelected(6);
        } else if (location.pathname == "/maven/goosely/maven-listing") {
            setSelected(7);
        }

    }, [location.pathname]);
    const [selected, setSelected] = useState(0);
    const { query } = page.ziggy;
    const handleTabChange = useCallback((selectedTabIndex) => {
        console.log(selectedTabIndex);
        setSelected(selectedTabIndex);
        if (selectedTabIndex == 0) {
            router.get(route('ic_index'))
        } else if (selectedTabIndex == 1) {
            router.get(route('ic_orders.index'))
        } else if (selectedTabIndex == 2) {
            router.get(route('ic_shopifyaccounts'))
        } else if (selectedTabIndex == 3) {
            router.get(route('ic_logs.index'))
        } else if (selectedTabIndex == 4) {
            router.get(route('ic_emails.index'))
        } else if (selectedTabIndex == 5) {
            router.get(route('ic_batch.index'))
        } else if (selectedTabIndex == 6) {
            router.get(route('ic_batch.tracking'))
        } else if (selectedTabIndex == 7) {
            router.get(route('maven.listing'))
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
        },
        {
            id: "Connections",
            content: "Connections",
        },
        {
            id: "Logs",
            content: "Logs",
        },
        {
            id: "Emails",
            content: "Emails",
        },
        {
            id: "Batch",
            content: "Batch",
        },
        {
            id: "Tracking",
            content: "Tracking",
        },
        {
            id: "Maven",
            content: "Maven",
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
        <div className="navTabs">
            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}></Tabs>
            <div style={{ marginTop: "-35px", display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", marginLeft: "10px", cursor: "pointer" }} onClick={() => router.get(route('index'))}>
                    <img src={Logo} width="40px"></img>
                    <p style={{ margin: "8px 0px 9px 10px", color: "#FFFFFF", fontSize: "16px", fontWeight: "600" }}>Goosely</p>
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
