import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { usePage } from '@inertiajs/react';
import { Divider, Grid, Text, TextField } from '@shopify/polaris';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { setDecorator } from '@/ReactJs/reducers/InConnect/DecoratorSlice';
import { useDispatch, useSelector } from 'react-redux';

function Address() {
    const page = usePage().props;

    const dispatch = useDispatch();

    const decorator = useSelector(state => state.inConnectDecorator.decorator);

    const handleChange = (object) => {
        dispatch(setDecorator(object));
    }

    return (
        <div className='steps-div logolocation-main-div mt-10 mb-4'>
            <div className="logo-locationOne mt-4">
                <div className="location-text">
                    <Text variant="headingMd" as="h6">
                        Address
                    </Text>
                    <Divider />
                </div>
                <div className='logo-location' style={{ padding: "25px" }}>
                    <div className="address-grid">
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <Text variant='headingMd' as='h6'> <span className='cust-staric'>Address Line 1</span></Text>
                                <div className='mt-3'>
                                    <TextField
                                        onChange={(e) => handleChange({ ...decorator, address: { ...decorator.address, address_line_1: e } })}
                                        value={decorator.address.address_line_1}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <Text variant='headingMd' as='h6'>
                                    Address Line 2
                                </Text>
                                <div className='mt-3'>
                                    <TextField
                                        onChange={(e) => handleChange({ ...decorator, address: { ...decorator.address, address_line_2: e } })}
                                        value={decorator.address.address_line_2}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </div>
                    <div className="address-city mt-3">
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <Text variant='headingMd' as='h6'><span className='cust-staric'>City</span></Text>
                                <div className='mt-3'>
                                    <TextField
                                        onChange={(e) => handleChange({ ...decorator, address: { ...decorator.address, city: e } })}
                                        value={decorator.address.city}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>
                                <Text variant='headingMd' as='h6'><span className='cust-staric'>State</span> </Text>
                                <div className='mt-3'>
                                    <TextField
                                        onChange={(e) => handleChange({ ...decorator, address: { ...decorator.address, state: e } })}
                                        value={decorator.address.state}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>
                                <Text variant='headingMd' as='h6'><span className='cust-staric'>Zip</span></Text>
                                <div className='mt-3'>
                                    <TextField
                                        onChange={(e) => handleChange({ ...decorator, address: { ...decorator.address, zip_code: e } })}
                                        value={decorator.address.zip_code}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </div>
                </div>
            </div>
            <div className="logo-locationOne mt-4">
                <div className="location-text">
                    <Text variant="headingMd" as="h6">
                        Credentials
                    </Text>
                    <Divider />
                </div>
                <div className='logo-location' style={{ padding: "25px" }}>
                    <div className="address-grid">
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <Text variant='headingMd' as='h6'> <span className='cust-staric'>Username</span></Text>
                                <div className='mt-3'>
                                    <TextField
                                        onChange={(e) => handleChange({ ...decorator, username: e })}
                                        value={decorator.username}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <Text variant='headingMd' as='h6'><span className='cust-staric'>Password</span></Text>
                                <div className='mt-3'>
                                    <TextField
                                        type='password'
                                        onChange={(e) => handleChange({ ...decorator, password: e })}
                                        value={decorator.password}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <Text variant='headingMd' as='h6'> <span className='cust-staric'>Client ID</span></Text>
                                <div className='mt-3'>
                                    <TextField
                                        onChange={(e) => handleChange({ ...decorator, client_id: e })}
                                        value={decorator.client_id}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                <Text variant='headingMd' as='h6'><span className='cust-staric'>Client Secret</span></Text>
                                <div className='mt-3'>
                                    <TextField
                                        onChange={(e) => handleChange({ ...decorator, client_secret: e })}
                                        value={decorator.client_secret}
                                        autoComplete="off"
                                    />
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </div>
                </div>
            </div>
        </div>
    );


}

Address.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Address;

