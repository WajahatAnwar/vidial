import '@/ReactJs/MyApplication/css/style.css';
// import CustomBar from '@/ReactJs/MyApplication/CustomBar';
import { AppProvider } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import en from "@shopify/polaris/locales/en.json";
import { MantleProvider } from "@heymantle/react";
import React, { useEffect, useState } from 'react';
import { usePage } from "@inertiajs/react";



export default function AppLayout({ auth, children }) {

    const [customertoken, setCustomerToken] = useState();

    function fetchShop() {
        fetch(route('settings.get.user'))
            .then(response => response.json())
            .then(data => {
                console.log("Response Data:", data); 
                if (data.success) {
                    console.log("data",data);
                    console.log("data1",data.data.customer_api_token);
    
                    try {
                      let customerApiToken = data.data.customer_api_token;
    
                        if (customerApiToken) {
                            console.log( 'custommer token' , customerApiToken);
                            setCustomerToken(customerApiToken);
                        } else {
                            console.error("API Token not found in parsed object!");
                        }
                    } catch (parseError) {
                        console.error("Error parsing customer_api_token:", parseError);
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    };
    
    useEffect(() => {
        fetchShop();
    }, []);

    return (
        <AppProvider i18n={en}>
            <MantleProvider
                appId={'e5b2960e-d6c0-4da5-975b-9daf76d18370'}
                customerApiToken={customertoken}
                apiUrl={'https://appapi.heymantle.com/v1'}
            >
                {auth ? <div>
                    <div>
                        {/* <CustomBar /> */}
                    </div>
                </div> : null}
                {children}
            </MantleProvider>
        </AppProvider>
    );
}