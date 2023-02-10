import { Card, Tabs } from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function TabsExample() {
    //
    const navigate = useNavigate();
    let location = useLocation();



    const [selected, setSelected] = useState(0);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);

        if (selectedTabIndex == 0) {
            navigate("/");
        } else if (selectedTabIndex == 1) {
            navigate("/videos-to-review");
        } else if (selectedTabIndex == 2) {
            navigate("/approved-videos");
        } else if (selectedTabIndex == 3) {
            navigate("/settings");
        } else if (selectedTabIndex == 4) {
        navigate("/plans");
    }
    }, []);

    const tabs = [
        {
            id: "all-customers-1",
            content: "Dashboard",
        },
        {
            id: "accepts-marketing-1",
            content: <div>Videos To Review<sup style={{background: "rgba(255, 59, 44, 0.75)",padding: "1px 6px",borderRadius:"50%",marginLeft:"5px"}}>4</sup></div>,
        },
        {
            id: "repeat-customers-1",
            content: "Approved Videos",
        },
        {
            id: "teteat-customers-1",
            content: "Settings",
        },
        {
            id: "plans-customers-1",
            content: "Plans",
        },
    ];

    return (
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}></Tabs>
    );
}

export default TabsExample;
