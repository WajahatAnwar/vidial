import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import Leftmenu from '@/ReactJs/Applications/InConnect/Connections/LeftMenu/LeftMenu';
import { resetDecorator } from '@/ReactJs/reducers/InConnect/DecoratorSlice';
import { router, usePage } from '@inertiajs/react';
import { Button, Grid, Icon, Page, Text } from '@shopify/polaris';
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { useDispatch } from 'react-redux';
import Table from "./DecoratorsTable";

function Decorators() {
    const page = usePage().props;
    const { query } = page.ziggy;

    const dispatch = useDispatch();

    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page >
                <div className='cc-inconnect-body-wraper  '>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('ic_index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}>Decorators</div>
                                </div>
                                <div className=' addnewdecorator'><Button style={{ cursor: 'pointer' }} onClick={() => {
                                    dispatch(resetDecorator());
                                    router.get(route('ic_decorators.create'))
                                }} >Add New Decorator</Button></div>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 3, xl: 3 }}>
                            <Text variant='headingLg' as='h5'>
                                <Leftmenu />
                            </Text>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 9, xl: 9 }}>
                            <Table />
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>
        </div>
    );
}

Decorators.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Decorators;
