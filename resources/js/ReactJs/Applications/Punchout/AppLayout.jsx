import '@/ReactJs/Applications/Punchout/Assets/css/style.css';
import CustomBar from '@/ReactJs/Applications/Punchout/CustomBar';
import * as React from 'react';

import { Button } from "@shopify/polaris";

import "@/ReactJs/Applications/Punchout/Assets/css/style.css";
import { Icon } from "@shopify/polaris";
import { useCallback, useState } from "react";

import { ActionList, Popover } from '@shopify/polaris';
import { EnterIcon } from '@shopify/polaris-icons';

import { CaretDownIcon } from '@shopify/polaris-icons';

import Smalllogo from '@/ReactJs/Applications/Punchout/Assets/images/small-logo.png';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

import { setToastActive } from '@/ReactJs/reducers/ClubColorSlice';
import { AppProvider, Toast } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import en from "@shopify/polaris/locales/en.json";
import { useDispatch, useSelector } from 'react-redux';

import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { router } from '@inertiajs/react';




const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));


export default function AppLayout({ auth, children }) {


    const [active, setActive] = useState(false);
    const toggleActive2 = useCallback(() => setActive((active) => !active), []);
    const activator = (
        <span style={{ marginRight: '10px' }}>
            <Button onClick={toggleActive2}>
                <div className='top-logout-cstm-bar'>
                    <img src={Smalllogo} />
                    <p>Club Color Admin</p> <Icon source={CaretDownIcon} tone="base" />
                </div>
            </Button>

        </span>
    );






    const toastMessage = useSelector((state) => state.clubColor.toastMessage);
    const toastActive = useSelector((state) => state.clubColor.toastActive);

    const dispatch = useDispatch();

    const toggleActive = useCallback(() => dispatch(setToastActive(!toastActive)), [toastActive]);

    const toastMarkup = toastActive ? (
        <Toast content={toastMessage} onDismiss={toggleActive} />
    ) : null;

    const logOutHandler = () => {

        fetch('/logout', { method: 'POST' })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                if (data.success == true) {
                    router.get(route('login'));
                }
            })
    }

    return (
        <AppProvider i18n={en}>
            <div style={{ background: `url('${window.appURL}/images/background12.png')`, backgroundSize: "cover",  height: "400px", }}>
                <React.Fragment>
                    <CssBaseline />
                    <Container maxWidth="xl" style={{ position: 'relative' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>

                                {auth ? <div>
                                    <div>

                                        <div style={{ height: '0px', marginTop: '25px' }}>
                                            <Paper  >
                                                <CustomBar />
                                                {toastMarkup}
                                            </Paper>
                                        </div>
                                    </div>
                                </div> : null}

                            </Grid>
                            <Grid item xs={9}>
                                <div className='pop-top-logout'>
                                    <Popover
                                        active={active}
                                        activator={activator}
                                        autofocusTarget="first-node"
                                        onClose={toggleActive2}
                                    >
                                        <ActionList
                                            actionRole="menuitem"
                                            items={[
                                                {
                                                    content: 'Logout',
                                                    icon: EnterIcon,
                                                    onAction: () => logOutHandler()
                                                },
                                            ]}
                                        />
                                    </Popover>
                                    {/* <div className='top-alert-cstm-PO'>
                                        <NotificationsOutlinedIcon  color="disabled"/>
                                        <span className='alert-dot-active'></span>
                                    </div> */}
                                </div>
                                {children}

                            </Grid>
                        </Grid>
                    </Container>
                </React.Fragment>
            </div>
        </AppProvider>
    );
}
