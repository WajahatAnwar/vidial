import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import '@/ReactJs/Applications/InConnect/Connections/ShopifyAccounts/custom.css';
import Leftmenu from '@/ReactJs/Applications/Maven/Goosely/LeftMenu';
import { setReloadAccountsTable } from '@/ReactJs/reducers/InConnect/AccountsSlice';
import { router, usePage } from '@inertiajs/react';
import {
    Grid, Icon,
    Page,
    Text
} from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import Table from './POTable';

function ShopifyAccounts() {

    const reloadAccountsTable = useSelector(state => state.inConnectAccounts.reloadAccountsTable);

    const page = usePage().props;
    const { query } = page.ziggy;

    const dispatch = useDispatch();

    const [active, setActive] = useState(false);
    const [stores, setStores] = useState([]);
    const [inconnectStores, setInconnectStores] = useState([]);
    const [fromStore, setFromStore] = useState(false);
    const [toStore, setToStore] = useState(false);

    useEffect(() => {

        async function load() {
            const response = await fetch("/goosely/get-users");
            const result = await response.json();
            console.log(result);
            if (result.success) {
                setStores(result.data.map((value, index) => {
                    return { value: value.id, label: value.store_name ? value.store_name : value.name }
                }))
                setInconnectStores(result.data2.map((value, index) => {
                    return { value: value.id, label: value.store_name ? value.store_name : value.name }
                }))
            } else {

            }
        }
        load()


    }, []);

    const duplicateHandler = () => {
        async function postJSON(data) {
            try {
                const response = await fetch("/goosely/shopify-accounts/duplicate-inconnect", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();
                if (result.success) {
                    Swal.fire('Success', result.message, 'success')
                    setActive(false);
                    dispatch(setReloadAccountsTable(!reloadAccountsTable));
                } else {
                    Swal.fire('Oops...', result.message, 'error')
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        const data = { from: fromStore, to: toStore };
        postJSON(data);
    }

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
                                        <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}>Purchase Orders</div>
                                    </div>
                                </div>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 2, lg: 3, xl: 3 }}>
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
        </div >
    );
}

ShopifyAccounts.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default ShopifyAccounts;
