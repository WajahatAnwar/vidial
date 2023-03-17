import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Frame, Loading as ShopLoading } from '@shopify/polaris';
import React from "react";
const Loading = ({ login }) => {
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/fetchCurrentUser", {
            method: "post",
            body:{}
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    if(data.data.user.is_install){
                        navigate("/dashboard");
                    }else{
                        navigate("/settings");
                    }

                }
                return;
            })
            .catch((error) => {
                console.log(error);
            });

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
