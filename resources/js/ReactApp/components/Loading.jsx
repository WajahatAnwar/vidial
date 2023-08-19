import { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { Frame, Loading as ShopLoading } from '@shopify/polaris';
import React from "react";
const Loading = () => {

    const { search } = useLocation();
    const [currentUser, setCurrentUser] = useState();
    const navigate = useNavigate();

    useEffect(() => {

        const getUser = async () => {

            const data = await fetch('/getSession');
            const response = await data.json();
            setCurrentUser(response.data);
            

            if (response.success && response.data.role_id==1) {
                
                navigate("/admin-dashboard");

            } else {

                fetch("/fetchCurrentUser", {
                    method: "post",
                    body: {}
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Something went wrong");
                        }
                        return response.json();
                    })
                    .then((data) => {
                        if (data.success) {
                            if (data.data.user.is_install) {
                                navigate(`/dashboard${search}`);
                            } else {
                                navigate("/settings");
                            }

                        }
                        return;
                    })
                    .catch((error) => {
                        console.log(error);
                    });

            }
        }
        getUser();

    }, []);

    return (
        <div style={{ display: "block", marginTop: "-55px" }}>
            <Frame>
                <ShopLoading />
            </Frame>
        </div>
    )
}

export default Loading;
