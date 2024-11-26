import { Frame, Navigation } from "@shopify/polaris";
import { HomeMajor, ListMajor, } from "@shopify/polaris-icons";
import React from "react";
import { useNavigate } from "react-router-dom";

function NavigationCustom() {
    const navigate = useNavigate();

    const dashboardHandler = () => { navigate("/admin"); };
    const CampaignsHandler = () => { navigate("/campaign"); };

    return (
        <div style={{ display: "flex" }}>
            <Frame>
                <Navigation location="/">
                    <Navigation.Section
                        items={[
                            {
                                label: "Dashboard",
                                icon: HomeMajor,
                                onClick: dashboardHandler,
                            },
                            {
                                label: "Campaigns",
                                icon: ListMajor,
                                onClick: CampaignsHandler,
                            },

                        ]}
                    />
                </Navigation>
            </Frame>
        </div>
    );
}

export default NavigationCustom;
