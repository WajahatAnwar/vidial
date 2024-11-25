import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { Grid, Page } from '@shopify/polaris';
import LogsTable from './LogsTable';
function Logs({filter}) {
    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div className='cc-inconnect-body-wraper'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
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
