import AppLayout from '@/ReactJs/Applications/Racoon/AppLayout';
import "@/ReactJs/Applications/Racoon/Assets/css/style.css";
import { router } from '@inertiajs/react';
import { Grid, Icon, Page } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import RestrictionForm from './RestrictionForm';

function Restrictions({users}) {

    return (
        <div style={{ background: `url('${window.appURL}/images/background11.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex" }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => router.get(route('restrictions.index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Create Restriction</div>
                            </div>
                        </div>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <RestrictionForm users={users} />
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}
Restrictions.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Restrictions;
