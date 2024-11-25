import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { Button, Card, Grid, Page, Spinner, Text } from '@shopify/polaris';
import { useCallback, useState } from 'react';


import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import Leftmenu from '@/ReactJs/Applications/InConnect/Connections/LeftMenu/LeftMenu';
import Swal from 'sweetalert2';

function Jobs({ productTypes }) {
    const [active, setActive] = useState(false);
    const [reqState, setReqState] = useState(null);
    const handleChange = useCallback(() => setActive(!active), [active]);
    const handleCronJob = (path) => {
        setReqState('pending');
        const url = window.appURL + path;
        fetch(url).then((response)=>response.json()).then((data)=>{
        });
        setTimeout(() => {
            setReqState('success');
            Swal.fire({
                title: 'Success!',
                text: 'Cron Job has been executed successfully',
                icon: 'success',
                confirmButtonText: 'Close'
            });
        }, 3000);

    }
    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div className='cc-inconnect-body-wraper'>
                    <Grid>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 3, xl: 3 }}>
                            <Text variant='headingLg' as='h5'>
                                <Leftmenu />
                            </Text>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 9, xl: 9 }}>
                         <Card>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <h1 style={{ marginBottom: '10px' }}><b>Sync Goosely Customers</b></h1>
                                    <p style={{ marginBottom: '15px', color: '#666' }}>Click to sync Goosely customers.</p>
                                    {
                                      reqState == 'pending' ?
                                      <Button><Spinner accessibilityLabel="Small spinner example" size="small" /></Button>
                                    :
                                     <Button onClick={() => handleCronJob('/goosely/get-intacct-customers')}>Sync Now</Button>

                                    }
                                </div>
                         </Card>
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>



        </div>
    );
}

Jobs.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Jobs;
