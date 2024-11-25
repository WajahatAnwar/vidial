import AppLayout from '@/ReactJs/Applications/Racoon/AppLayout';
import '@/ReactJs/Applications/Racoon/Assets/css/style.css';
import { Grid, Page } from '@shopify/polaris';
import OrdersTable from './OrdersTable';

function Orders({filter}) {
    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background11.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                        <OrdersTable filter={filter} />
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}

Orders.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Orders;
