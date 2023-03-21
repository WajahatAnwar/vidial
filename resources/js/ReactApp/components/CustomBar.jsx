import { Card, Tabs } from "@shopify/polaris";
import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function TabsExample() {
    const { search } = useLocation();
    const navigate = useNavigate();
    let location = useLocation();
    const [pendingVideosCount, setPendingVideosCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/getPendingVideoCount");
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                const data = await response.json();
                if (data.success) {
                    setPendingVideosCount(data.data.pendingVideosCount);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();

        if (location.pathname == "/") {
            setSelected(0);
        } else if (location.pathname == "/videos-to-review") {
            setSelected(1);
        } else if (location.pathname == "/approved-videos") {
            setSelected(2);
        } else if (location.pathname == "/settings") {
            setSelected(3);
        } else if (location.pathname == "/plans") {
            setSelected(4);
        }
    }, [location]);
    const [selected, setSelected] = useState(0);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);

        if (selectedTabIndex == 0) {
            navigate(`/dashboard${search}`);
        } else if (selectedTabIndex == 1) {
            navigate(`/videos-to-review${search}`);
        } else if (selectedTabIndex == 2) {
            navigate("/approved-videos");
        } else if (selectedTabIndex == 3) {
            navigate("/settings");
        } else if (selectedTabIndex == 4) {
            navigate("/plans" + location.search);
        }
    }, []);

    const tabs = [
        {
            id: "all-customers-1",
            content: "Dashboard",
        },
        {
            id: "accepts-marketing-1",
            content: (
                <div>
                {pendingVideosCount >= 10 ?
                <div>
                    Videos To Review
                    <sup
                        style={{
                            color:"white",
                            background: "#D82C0D",
                            padding: "3px 4px",
                            borderRadius: "50%",
                            marginLeft: "5px",
                        }}
                    >
                         {pendingVideosCount}
                    </sup>
                    </div>
                    : <div>
                    Videos To Review
                    <sup
                        style={{
                            color:"white",
                            background: "#D82C0D",
                            padding: "2px 7px",
                            borderRadius: "50%",
                            marginLeft: "5px",
                        }}
                    >
                         {pendingVideosCount}
                    </sup>
                    </div>}


                </div>
            ),
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
