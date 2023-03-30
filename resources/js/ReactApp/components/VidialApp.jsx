import "@shopify/polaris/build/esm/styles.css";
import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import { Route, Routes } from "react-router-dom";
import CustomBar from "./CustomBar";
// import NavigationCustom from "./NavigationCustom";

import Loading from "./Loading";
import VideosToReview from "./VideosToReview";
import Dashboard from "./Dashboard";
import ApprovedVideos from "./ApprovedVideos";
import React from "react";
import EditCampaign from "./EditCampaign";
import Settings from "./Settings";
import Plans from "./Plans";
import Resources from "./Resources";
import AdminDashboard from "./AdminDashboard";

const VidialApp = () => {
    return (
        <AppProvider i18n={en}>
            <CustomBar />
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/videos-to-review" element={<VideosToReview />} />
                <Route path="/approved-videos" element={<ApprovedVideos />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<Loading login={false} />} />
            </Routes>

        </AppProvider>
    );
};

export default VidialApp;
