import { AppProvider } from '@shopify/polaris';
import en from "@shopify/polaris/locales/en.json";
import CustomBar from '@/ReactJs/Applications/PurchaseOrder/CustomBar';
import "@shopify/polaris/build/esm/styles.css";
import "@/ReactJs/Applications/PurchaseOrder/Assets/css/style.css";

export default function AppLayout({ auth, children }) {
    return (
        <>
        <AppProvider i18n={en}>

            {auth ? <CustomBar /> : null}
            {children}
        </AppProvider>
        </>
    );
}
