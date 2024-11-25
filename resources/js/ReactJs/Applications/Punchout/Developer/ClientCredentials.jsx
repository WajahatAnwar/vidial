import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';
import { AppProvider, Button, Card, Grid, Icon, Modal, Page, Select, Tabs, Text, TextField } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useEffect, useState } from 'react';
import GatewayClientsTable from '../Components/GatewayClientsTable';
import { Spinner } from '@shopify/polaris';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { resetGatewayClient, setGatewayClient } from '@/ReactJs/reducers/Punchout/DeveloperSlice';
import { Document, pdf, StyleSheet, View } from '@react-pdf/renderer';
import { HideIcon, ViewIcon } from '@shopify/polaris-icons';
const ClientCredentials = (props) => {
    //
    console.log(props.gatewayClient, props.loggedIn)
    const styles = StyleSheet.create({
        page: {
            padding: 20,
            display: 'flex',
            flexDirection: 'row',
        },
        header: {
            backgroundColor: '#F4F4F4',
            paddingBottom: 10,
            fontSize: 20,
        },
        list: {
            padding: '8px 0px',
        },
        item: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            fontSize: 16,
            marginBottom: 15,
        },
        contentOne: {
            width: '50%',
            fontSize: 16,
            color: '#535353',
            fontWeight: 700,

        },
        contentTwo: {
            width: '50%',
            fontSize: 14,
            fontWeight: 400,
            color: '#949494',
        },
        card: {
            marginBottom: 16,
            padding: 20,
            width: '100%',
        },

    });

    const [isLoggedIn, setIsLoggedIn] = useState(props.loggedIn)
    const [gatewayClient, setGatewayClient] = useState(props.gatewayClient)

    const [credentialsValue, setCredentialsValue] = useState('');

    const handleCredentialsChange = useCallback(
        (value) => setCredentialsValue(value),
        []
    );
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(false)
    const handleAuthenticate = async () => {

        setLoading(true);

        setErrors(false)

        const formData = new FormData();
        formData.append('password', credentialsValue)

        const response = await fetch(route('punchout.gateway.credentials.authenticate', { 'id': gatewayClient.uuid }), {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        setLoading(false);
        if (result.success) {
            setIsLoggedIn(true);
        } else {
            setErrors(result.errors)
            Swal.fire({
                icon: 'error',
                title: 'Incorrect Password',
                text: 'The password you entered was incorrect. Please try again.',
            });
        }
    }
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    return (
        <AppProvider>
            <div>
                <Page fullWidth>
                    <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                        <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}>
                            {/* <small style={{ display: 'block', fontWeight: '200' }}>Increased in the last 1 month</small> */}
                        </div>
                    </div>
                    <div className='Gateway-Activity-boxes-wrapper-PO'>
                        {isLoggedIn ?
                            <div className='mt-5'>
                                <Card>
                                    <Document>
                                        <Page style={styles.page}>
                                            {/* General Section */}
                                            <View style={styles.card}>

                                                <View style={styles.list}>

                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Name:</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{gatewayClient.name}</p>
                                                    </View>

                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Domain:</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{gatewayClient.domain}</p>
                                                    </View>

                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", Width: "50%" }}>Integration Type:</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{gatewayClient.network}</p>
                                                    </View>

                                                    <hr />

                                                    <p style={{ fontSize: "22px", fontWeight: "700", marginTop: "15px", marginBottom: "15px" }}>
                                                        Credentials for Shopify Client
                                                    </p>
                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Punchout Start Url:</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{route('punchout.gateway.punchout', gatewayClient.uuid)}</p>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Order transfer Url:</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{route('punchout.gateway.order.request', gatewayClient.uuid)}</p>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Profile Url :</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{route('punchout.gateway.profile', gatewayClient.uuid)}</p>

                                                    </View>

                                                    {/* Arsalan  */}
                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Credentials Pickup :</p>
                                                        {/* <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", color: "#45BD4A", cursor: "pointer" }} onClick={handleActiveCredentialsPickup}>https://procurement.clubhub.host/gateway/punchout/72f8db00-2050-4d59-a92d-</p> */}
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", cursor: "pointer" }} >{route('punchout.gateway.credentials', gatewayClient.uuid)}</p>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Invoice Url :</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%",wordWrap:'break-word' }}>{gatewayClient.invoice_receiver_url}</p>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Shared Secret :</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{gatewayClient.shared_secret}</p>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>To Identity :</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%",wordWrap:'break-word' }}>{gatewayClient.toIdentity}</p>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>To Domain :</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%",wordWrap:'break-word' }}>{gatewayClient.toDomain}</p>
                                                    </View>

                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>From Identity :</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%",wordWrap:'break-word' }}>{gatewayClient.fromIdentity}</p>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>From Domain :</p>
                                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%",wordWrap:'break-word' }}>{gatewayClient.fromDomain}</p>
                                                    </View>

                                                </View>
                                            </View>

                                            {/* Session Section */}

                                        </Page>
                                    </Document>

                                </Card>
                            </div>
                            :
                            <Card>
                                <div className='client-Credentials-main'>
                                    <p>{gatewayClient.name} Shopify Client Credentials</p>
                                    <div className='client-Credentials-main-textfield client-Credentials-main-textfield-border-0'>
                                        {/* <TextField value={credentialsvalue} onChange={handleCredentialsChange} autoComplete="off" /> */}
                                        <TextField
                                           suffix={
                                            <div onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                                                <Icon source={showPassword ? HideIcon : ViewIcon} />
                                            </div>
                                        }
                                        type={showPassword ? 'text' : 'password'} requiredIndicator label="Password" value={credentialsValue} onChange={handleCredentialsChange} autoComplete="off" error={errors?.password ? errors.password[0] : false} />
                                    </div>
                                    <div className="multi-color-btn client-Credentials-main-button modal-pop-up-multi-btn">
                                        <button onClick={handleAuthenticate}>Authenticate</button>
                                    </div>
                                </div>
                            </Card>
                        }

                    </div>
                </Page>
            </div>
        </AppProvider>
    )
}
// ClientCredentials.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default ClientCredentials
