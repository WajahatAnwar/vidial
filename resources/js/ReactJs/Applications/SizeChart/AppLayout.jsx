import { AppProvider, Frame } from '@shopify/polaris';
import en from "@shopify/polaris/locales/en.json";
import CustomBar from '@/ReactJs/Applications/SizeChart/CustomBar';
import "@shopify/polaris/build/esm/styles.css";
import '@/ReactJs/Applications/SizeChart/Assets/css/style.css';

export default function AppLayout({ auth, children, message }) {
    return (
        <AppProvider i18n={en}>
            <Frame>
                {auth ? <CustomBar /> : null}
                {children}
            </Frame>
        </AppProvider>
    );
}
