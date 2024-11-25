
import '@/ReactJs/Applications/VirtualOptions/Assets/css/style.css';
import { Button, Card, Grid, Icon, Page } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';

import AppLayout from "@/ReactJs/Applications/VirtualOptions/AppLayout";
import { setAddLogoModal, setUpdateLogoId } from '@/ReactJs/reducers/ClubColorSlice';
import { router, usePage } from '@inertiajs/react';
import { useDispatch } from 'react-redux';
import AddEditLogo from './AddEditLogo';
import LogosSelect from './LogosSelect';
import LogosSelectTwo from './LogosSelectTwo';
import LogosTable from "./LogosTable";

const Logos = () => {

    const page = usePage().props;
    const { query } = page.ziggy;

    const dispatch = useDispatch();

    return (
        <div style={{ background: `url('${window.appURL}/images/background2.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <AddEditLogo />
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => router.get(route('index_virtual_options', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Logos List</div>
                            </div>
                            <Button onClick={() => { dispatch(setUpdateLogoId(false)); dispatch(setAddLogoModal(true)); }}> Add Logo +</Button>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
                        <LogosTable defaultEntries="10" indexPath={route("logos.get")} />
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Logo Groups</p>
                            <LogosSelect />
                        </Card>
                        <div style={{ marginTop: "18px" }}>
                            <Card>
                                <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Color Families</p>
                                <LogosSelectTwo />
                            </Card>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Page >
        </div>
    );
}
Logos.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Logos;
