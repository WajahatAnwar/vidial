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
import UserSettings from "./Admin/Components/UserSettings";
import UserEmail from "./Admin/Components/UserEmail";
import UserLogs from "./Admin/Components/UserLogs";
import UserApprovedVideos from "./Admin/Components/UserApprovedVideos";
import UserReviewdVideos from "./Admin/Components/UserReviewdVideos";
import GetStarted from "./GetStarted";

const VidialApp = () => {

    let location = useLocation();
    let query = localStorage.getItem('queryParams');

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

                // else if (location.pathname != '/forget-password' && location.pathname != '/reset-password') {
                //     if (location.pathname != "/login") {
                //         alert('Please login to continue');
                //         navigate("/login");
                //     }
                // }

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
            {/* {topBarCheck && <CustomBar />} */}
            <Routes>
                <Route path="/login" element={<Login query={query}/>} />
                <Route path="/forget-password" element={<ForgetPassword query={query}/>} />
                <Route path="/reset-password" element={<ResetPassword query={query}/>} />

                <Route path={`dashboard`} element={<Dashboard query={query}/>} />
                <Route path="/settings" element={<Settings query={query}/>} />
                <Route path="/videos-to-review" element={<VideosToReview query={query}/>} />
                <Route path="/approved-videos" element={<ApprovedVideos query={query}/>} />
                <Route path="/email" element={<Email query={query}/>} />
                <Route path="/plans" element={<Plans query={query}/>} />
                <Route path="/resources" element={<Resources query={query}/>} />
                <Route path="/admin-dashboard" element={<AdminDashboard query={query}/>} />
                <Route path="/user-settings/:id?" element={<UserSettings query={query}/>} />
                <Route path="/user-email-settings/:id?" element={<UserEmail query={query}/>} />
                <Route path="/post-purchase-email/:id?" element={<PostPurchaseEmail query={query}/>} />
                <Route path="/reminder-email/:id?" element={<ReminderEmail query={query}/>} />
                <Route path="/ugc-approved-email/:id?" element={<UgcApprovedEmail query={query}/>} />
                <Route path="/ugc-declined-email/:id?" element={<UgcDeclinedEmail query={query}/>} />
                <Route path="/ugc-star-approved/:id?" element={<UgcStarApproved query={query}/>} />
                <Route path="/user-logs/:id" element={<UserLogs />} />
                <Route path="/user-approved-videos/:id" element={<UserApprovedVideos query={query}/>} />
                <Route path="/user-reviewd-videos/:id" element={<UserReviewdVideos query={query}/>} />
                <Route path="/logs" element={<Logs query={query}/>} />
                <Route path="/get-started" element={<GetStarted />} />

                <Route path="*" element={<Loading />} />
            </Routes>
            {
            location.search ? <div className="updateButton">
                <div className="polaris-black-btn-global">
                <Button onClick={handleUpdateApp} success primary>Update App</Button>
                </div>
            </div> : ''
            }

        </AppProvider>
    );
};

export default VidialApp;
