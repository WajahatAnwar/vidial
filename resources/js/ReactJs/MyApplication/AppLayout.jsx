import '@/ReactJs/MyApplication/css/style.css';
import CustomBar from '@/ReactJs/MyApplication/CustomBar';
import { AppProvider } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import en from "@shopify/polaris/locales/en.json";

export default function AppLayout({ auth, children }) {

    return (
        <AppProvider i18n={en}>
            {auth ? <div>
                <div>
                    <CustomBar />
                </div>
            </div> : null}
            {children}
        </AppProvider>
    );
}
