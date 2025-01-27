import { Banner, Icon } from '@shopify/polaris';
import { PlayMinor } from '@shopify/polaris-icons';
import React from 'react'
import linksvgrepo from "./imges/link-svgrepo.svg";
import ticker from "./imges/dellIcon.png";
import { router } from "@inertiajs/react";



export default function Ticker() {

    const updateApp = async () => {
        try {
            const response = await fetch(route('update-app'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (data?.url) {
                window.open(data.url, '_blank');
            } else {
                console.error('URL not provided in response:', data);
            }
        } catch (error) {
            console.error('Error updating the app:', error);
        }

    };

    return (
        <div className="setting_banner">
            <Banner
                title={`Welcome to GoodAuthentic 👋`}

                status="info"
                onDismiss={() => { }}
            >
                <p>GoodAuthentic will help you collect videos from and reward your customers.</p>
                <a style={{ textDecoration: "none" }} href="#">
                    <button onClick={() => {
                        window.open(
                            'https://goodauthentic.notion.site/Merchant-Guide-d8e3158efbd64a69a876b89d37d78b62'
                        );
                    }} style={{
                        cursor: 'pointer',
                        display: "flex", padding: "7px 10px",
                        marginTop: "20px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid #95c9b4", borderRadius: "4px"
                    }}>
                        <img src={linksvgrepo} style={{ width: "20px", height: "20px" }} />
                        <span style={{ marginLeft: "10px" }}>How GoodAuthentic Works</span>
                    </button>
                </a>

                <a style={{ textDecoration: "none" }} href="#">
                    <button onClick={updateApp}
                        style={{
                            cursor: 'pointer',
                            display: "flex", padding: "7px 10px",
                            marginTop: "20px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid #95c9b4", borderRadius: "4px"
                        }}>
                        <img src={ticker} style={{ width: "20px", height: "20px" }} />
                        <span style={{ marginLeft: "10px" }}>Update GoodAuthentic</span>
                    </button>
                </a>
            </Banner>
        </div>
    )
}
