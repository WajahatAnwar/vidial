
import '@/ReactJs/AllInOne/Assets/css/style.css';
import { usePage } from '@inertiajs/react';
import { AppProvider, Button, Grid, Icon, Page } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import "@shopify/polaris/build/esm/styles.css";
import en from "@shopify/polaris/locales/en.json";
import { useEffect, useState } from 'react';

const EmbeddedApp = () => {

    const page = usePage().props;
    const { query } = page.ziggy;

    const [currentShop, setCurrentShop] = useState(false);

    useEffect(() => {
        async function postJSON() {
            try {
                const response = await fetch(route("get_shop_real.get", query));
                const result = await response.json();
                console.log("Success:", result);
                setCurrentShop(result.data);
            } catch (error) {
                console.error("Error:", error);
            }
        }

        postJSON();

    }, []);

    return (
        <AppProvider i18n={en}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ border: "1px solid", cursor: "pointer", borderColor: "#c1c1c1", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}
                                    onClick={() => {

                                    }}> <Icon color='base' source={ArrowLeftIcon} /> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px" }}> All In One Embedded App</div>
                            </div>
                            <Button onClick={() => {
                                window.open(`${window.appURL}/authenticate?shop=${currentShop}`, "_blank")
                            }}>Update App</Button>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Page>
        </AppProvider>
    );
}

export default EmbeddedApp;
