
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';
import { AppProvider, Grid, Icon, Page } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import "@shopify/polaris/build/esm/styles.css";

import en from "@shopify/polaris/locales/en.json";
import EmbeddedTable from "./EmbeddedTable";

const EmbeddedApp = () => {

    return (
        <AppProvider i18n={en}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex" }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ border: "1px solid", cursor: "pointer", borderColor: "#c1c1c1", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}
                                    onClick={() => {

                                    }}> <Icon color='base' source={ArrowLeftIcon} /> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px" }}> Products</div>
                            </div>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <EmbeddedTable defaultEntries="10" />
                    </Grid.Cell>
                </Grid>
            </Page>
        </AppProvider>
    );
}

export default EmbeddedApp;
