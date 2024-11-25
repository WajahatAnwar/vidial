import { AppProvider, Banner, Frame, Page, Toast } from '@shopify/polaris';
import en from "@shopify/polaris/locales/en.json";
import CustomBar from '@/ReactJs/Applications/Filter/CustomBar';
import "@shopify/polaris/build/esm/styles.css";
import '@/ReactJs/Applications/Filter/Assets/css/style.css';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToastActive } from '@/ReactJs/reducers/ClubColorSlice';

export default function AppLayout({ auth, children }) {

    const toastMessage = useSelector((state) => state.clubColor.toastMessage);
    const toastActive = useSelector((state) => state.clubColor.toastActive);

    const dispatch = useDispatch();

    const toggleActive = useCallback(() => dispatch(setToastActive(!toastActive)), [toastActive]);

    const toastMarkup = toastActive ? (
        <Toast content={toastMessage} onDismiss={toggleActive} />
    ) : null;

    return (
        <AppProvider i18n={en}>
            {auth ? <div>
                <div>
                    <CustomBar />
                    <div style={{ height: '0px' }}>
                        <Frame>
                            {toastMarkup}
                        </Frame>
                    </div>
                </div>
            </div> : null}
            {children}
        </AppProvider>
    );
}
