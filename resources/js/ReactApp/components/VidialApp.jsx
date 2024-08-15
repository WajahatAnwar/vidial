import "@shopify/polaris/build/esm/styles.css";
import { AppProvider, Button } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import CustomBar from "./CustomBar";
import Logs from "./Logs";

// import NavigationCustom from "./NavigationCustom";

import Loading from "./Loading";
import VideosToReview from "./VideosToReview";
import Dashboard from "./Dashboard";
import ApprovedVideos from "./ApprovedVideos";
import React, { useEffect, useState } from "react";
import EditCampaign from "./EditCampaign";
import Settings from "./Settings";
import Plans from "./Plans";
import Resources from "./Resources";
import AdminDashboard from "./AdminDashboard";
import Login from "./Login";
import ForgetPassword from "./ForgetPassword";
import ResetPassword from "./ResetPassword";
import PostPurchaseEmail from "./PostPurchaseEmail"
import ReminderEmail from "./ReminderEmail"
import UgcApprovedEmail from "./UgcApprovedEmail"
import UgcDeclinedEmail from "./UgcDeclinedEmail"
import UgcStarApproved from "./UgcStarApproved";
import Email from "./Email";
import UserSettings from "./Admin/UserSettings";
import StoreUrlSection from "./Admin/Components/StoreUrlSection";
import UserEmail from "./Admin/Components/UserEmail";
import UserLogs from "./Admin/Components/UserLogs";

const VidialApp = () => {

    let location = useLocation();
    
    const [topBarCheck, setTopBarCheck] = useState(false);
    const [currentUser, setCurrentUser] = useState(false);

    const navigate = useNavigate();
    /** Update app */
    const handleUpdateApp = () => {
        fetch('update-app').then((response) => response.json())
            .then((data) => {
                let url = 'authenticate?shop=';
                if (data.success) {
                    url = url + data.data.user.name;
                    window.open(url)
                }


            })
    }

    useEffect(() => {

        const getUser = async () => {

            const data = await fetch('/getSession');
            const response = await data.json();

            if (!response.success) {

                if (typeof shopNm !== 'undefined') {
                    setTopBarCheck(true);
                }

                else if (location.pathname != '/forget-password' && location.pathname != '/reset-password') {
                    if (location.pathname != "/login") {
                        navigate("/login");
                    }
                }

            } else {

                setCurrentUser(response.data);

                if (location.pathname == '/forget-password' || location.pathname == '/reset-password' || location.pathname == '/login') {
                    if (location.pathname != "/") {
                        navigate("/");
                    }
                }
            }
        }
        getUser();
    }, [location]);

    return (
        <AppProvider i18n={en}>
            {topBarCheck && <CustomBar />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/videos-to-review" element={<VideosToReview />} />
                <Route path="/approved-videos" element={<ApprovedVideos />} />
                <Route path="/email" element={<Email />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/user-settings/:id?" element={<StoreUrlSection />} />
                <Route path="/user-email-settings/:id?" element={<UserEmail />} />
                <Route path="/post-purchase-email/:id?" element={<PostPurchaseEmail />} />
                <Route path="/reminder-email/:id?" element={<ReminderEmail />} />
                <Route path="/ugc-approved-email/:id?" element={<UgcApprovedEmail />} />
                <Route path="/ugc-declined-email/:id?" element={<UgcDeclinedEmail />} />
                <Route path="/ugc-star-approved/:id?" element={<UgcStarApproved />} />
                <Route path="/user-logs/:id" element={<UserLogs />} />

                <Route path="/logs" element={<Logs />} />

                <Route path="*" element={<Loading />} />
            </Routes>
            {
            location.search ? <div className="updateButton">
                <Button onClick={handleUpdateApp} success primary>Update App</Button>
            </div> : ''
            }
           
        </AppProvider>
    );
};

export default VidialApp;
