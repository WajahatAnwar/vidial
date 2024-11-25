import AppLayout from '@/ReactJs/Applications/Racoon/AppLayout';
import "@/ReactJs/Applications/Racoon/Assets/css/style.css";
import { Grid, Page } from '@shopify/polaris';
import RestrictionsTable from './RestrictionsTable';

function Restrictions({ users, collections }) {

    return (
        <div style={{ background: `url('${window.appURL}/images/background11.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <RestrictionsTable users={users} collections={collections} />
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}
Restrictions.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Restrictions;
