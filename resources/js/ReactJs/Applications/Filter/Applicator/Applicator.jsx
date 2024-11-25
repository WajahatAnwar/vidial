
import '@/ReactJs/Applications/Filter/Assets/css/style.css';
import { Grid, Icon, Page } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';

import AppLayout from "@/ReactJs/Applications/Filter/AppLayout";
import { router, usePage } from '@inertiajs/react';
import ApplicatorTable from "./ApplicatorTable";

const OptionSets = () => {

    const page = usePage().props;
    const { query } = page.ziggy;

    return (
        <div style={{ background: `url('${window.appURL}/images/background10.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex" }}>
                            <div onClick={() => router.get(route('index_filters', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                            <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}>Applicator</div>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <ApplicatorTable defaultEntries="10" indexPath={route("filters.collections.get")} />
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}
OptionSets.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default OptionSets;
