import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { Grid, Icon, Page, Text } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import LeftMenu from './LeftMenu';
import LogsTable from './LogsTable';

function Logs({ filter }) {
    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div className='cc-inconnect-body-wraper'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <div style={{ display: "flex" }}>
                                    <div style={{ display: "flex" }}>
                                        <div onClick={() => router.get(route('ic_index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                        <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}>Logs</div>
                                    </div>
                                </div>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 2, lg: 3, xl: 3 }}>
                            <Text variant='headingLg' as='h5'>
                                <LeftMenu />
                            </Text>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 9, xl: 9 }}>
                            <LogsTable filter={filter} />
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>
        </div>
    );
}

Logs.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Logs;
