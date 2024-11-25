import ToggleSmall from '@/ReactJs/Components/ToggleSmall';
import {
    Button,
    ButtonGroup,
    Card,
    Grid,
    Page,
    Text,
    TextField
} from '@shopify/polaris';
import { HideIcon, ViewIcon } from "@shopify/polaris-icons";

import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';


function Decorators() {
    const page = usePage().props;
    const { query } = page.ziggy;

    const [values, setValues] = useState('Wajahat');
    const [valueTwo, setValueTwo] = useState('Ali');

    const [valueThree, setValueThree] = useState('ABC@gmail.com');
    const [valueFour, setValueFour] = useState('0123456789');



    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordTwo, setShowPasswordTwo] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const togglePasswordVisibilityTwo = () => {
        setShowPasswordTwo(!showPasswordTwo);
    };


    const handleChanges = useCallback(
        (newValues) => setValues(newValue),
        [],
    );

    const handleChangeTwo = useCallback(
        (newValue) => setValueTwo(newValue),
        [],
    );

    const handleChangeThree = useCallback(
        (newValue) => setValueThree(newValue),
        [],
    );

    const handleChangeFour = useCallback(
        (newValue) => setValueFour(newValue),
        [],
    );

    return (
        <div >
            <Page >

                <Card>
                    <div>
                        <div className='flex justify-between'>



                            <div className='ml-2 flex'>
                                <div>
                                    <img src={`${window.appURL}/images/goosley.png`} alt="" width={"30px"} />
                                </div>
                                <span className='ml-2'> <Text>Wajahat Ali</Text>
                                    <p>Abc@gmail.com</p>
                                </span>
                            </div>

                            <div className='flex'>

                                <Text>Permissions</Text>
                                <ToggleSmall />
                            </div>

                        </div>
                    </div>
                </Card>
                <div>
                    <Card>




                        <Grid>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                                <div className='ml-3 '>
                                    <Text variant="headingLg" as="h5">
                                        Basic Info
                                    </Text>
                                </div>

                            </Grid.Cell>
                        </Grid>

                        <div className='mt-7'>
                            <Grid>

                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <TextField
                                        label="First Name"
                                        value={values}
                                        onChange={handleChanges}
                                        autoComplete="off"
                                    />


                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                    <TextField
                                        label="Last Name"
                                        value={valueTwo}
                                        onChange={handleChangeTwo}
                                        autoComplete="off"
                                    />



                                </Grid.Cell>
                            </Grid>
                        </div>

                        <div className='mt-10'>
                            <Grid>

                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <TextField
                                        label="Email Address"
                                        value={valueThree}
                                        onChange={handleChangeThree}
                                        autoComplete="off"
                                    />


                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                    <TextField
                                        label="Phone no"
                                        value={valueFour}
                                        onChange={handleChangeFour}
                                        autoComplete="off"
                                    />



                                </Grid.Cell>
                            </Grid>
                        </div>


                        <hr className='mt-8' style={{ width: "100%" }} />

                        <Grid>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                                <div className='ml-3 mt-4'>
                                    <Text variant="headingLg" as="h5">
                                        Change Password
                                    </Text>
                                </div>

                            </Grid.Cell>
                        </Grid>

                        <div className='mt-7'>
                            <Grid>

                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>



                                    <div>

                                        <p>Current Password</p>
                                        <div className='basic-icons flex justify-end'>
                                            {showPassword ? (
                                                <ViewIcon width={20} onClick={togglePasswordVisibility} className='dashboard-eye-icon' />
                                            ) : (
                                                <HideIcon width={20} onClick={togglePasswordVisibility} className='dashboard-eye-icon' />
                                            )}
                                        </div>
                                        <input
                                            className='Basic-Info-field'
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder='********'
                                        // style={{ paddingRight: '40px',width:"100%" }}
                                        />
                                    </div>


                                </Grid.Cell>

                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>



                                    <div>

                                        <p>New Password</p>
                                        <div className=' basic-icons flex justify-end'>
                                            {showPasswordTwo ? (
                                                <ViewIcon width={20} onClick={togglePasswordVisibilityTwo} className='dashboard-eye-icon' />
                                            ) : (
                                                <HideIcon width={20} onClick={togglePasswordVisibilityTwo} className='dashboard-eye-icon' />
                                            )}
                                        </div>
                                        <input
                                            className='Basic-Info-field'
                                            type={showPasswordTwo ? 'text' : 'password'}
                                            placeholder='********'
                                        // style={{ paddingRight: '40px',width:"100%" }}
                                        />
                                    </div>


                                </Grid.Cell>

                            </Grid>
                        </div>




                        <div className="users-button-group mt-4 flex justify-end">
                            <ButtonGroup>
                                <Button size='slim'>Cancel</Button>
                                <Button size='slim' variant="primary">Save</Button>
                            </ButtonGroup>
                        </div>


                    </Card>
                </div>
            </Page>
        </div>
    );


}

Decorators.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Decorators;

