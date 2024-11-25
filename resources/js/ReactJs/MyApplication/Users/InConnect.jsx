import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { usePage } from '@inertiajs/react';
import {
    Button,
    ButtonGroup,
    Checkbox,
    Grid,
    Page,
    Text
} from '@shopify/polaris';
import { useCallback, useState } from 'react';

function Decorators() {
    const page = usePage().props;
    const { query } = page.ziggy;

    const [checked, setChecked] = useState(false);
    const [checkedOne, setCheckedOne] = useState(true);
    const [checkedTwo, setCheckedTwo] = useState(true);
    const [checkedThree, setCheckedThree] = useState(false);
    const [checkedFour, setCheckedFour] = useState(false);
    const [checkedFive, setCheckedFive] = useState(true);
    const [checkedSix, setCheckedSix] = useState(true);
    const [checkedSeven, setCheckedSeven] = useState(false);


    const handleChange = useCallback(
        (newChecked) => setChecked(newChecked),
        [],
    );

    const handleChangeOne = useCallback(
        (newChecked) => setCheckedOne(newChecked),
        [],
    );
    const handleChangeTwo = useCallback(
        (newChecked) => setCheckedTwo(newChecked),
        [],
    );
    const handleChangeThree = useCallback(
        (newChecked) => setCheckedThree(newChecked),
        [],
    );
    const handleChangeFour = useCallback(
        (newChecked) => setCheckedFour(newChecked),
        [],
    );

    const handleChangeFive = useCallback(
        (newChecked) => setCheckedFive(newChecked),
        [],
    );
    const handleChangeSix = useCallback(
        (newChecked) => setCheckedSix(newChecked),
        [],
    );
    const handleChangeSeven = useCallback(
        (newChecked) => setCheckedSeven(newChecked),
        [],
    );

    return (
        <div >
            <Page >

                <div className=''>

                    <Grid>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>

                            <div className='flex'>
                                <img src={`${window.appURL}/images/goosley.png`} alt="" width={"30px"} />
                                <div className='ml-3 '>
                                    <Text variant="headingLg" as="h5">
                                        Goosely
                                    </Text>
                                </div>
                            </div>
                        </Grid.Cell>
                    </Grid>
                    <hr className='mt-8' />
                    <div className='mt-4'>
                        <Grid>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>


                                <Text variant="headingMd" as="h6">
                                    Total Dominace
                                </Text>


                                <p className='' style={{ color: "#A0AEC0", fontSize: "12px" }}>With read and write authority, you shape the narrative of your data universe
                                </p>

                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                <div className='user-checkbox flex justify-around'>

                                    <div>
                                        <Checkbox
                                            label="Read"
                                            checked={checked}
                                            onChange={handleChange}
                                        />
                                    </div>


                                    <div>
                                        <Checkbox

                                            label="Write"
                                            checked={checkedOne}
                                            onChange={handleChangeOne}
                                        />
                                    </div>

                                </div>

                            </Grid.Cell>
                        </Grid>
                    </div>
                    <hr className='mt-8' />
                    <div className='mt-4'>
                        <Grid>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>


                                <Text variant="headingMd" as="h6">
                                    Shopify Accounts
                                </Text>


                                <p className='' style={{ color: "#A0AEC0", fontSize: "12px" }}>body text will go here
                                </p>

                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                <div className='user-checkbox flex justify-around'>

                                    <div>
                                        <Checkbox
                                            label="Read"
                                            checked={checkedTwo}
                                            onChange={handleChangeTwo}
                                        />
                                    </div>


                                    <div>
                                        <Checkbox

                                            label="Write"
                                            checked={checkedThree}
                                            onChange={handleChangeThree}
                                        />
                                    </div>

                                </div>

                            </Grid.Cell>
                        </Grid>
                    </div>
                    <hr className='mt-8' />
                    <div className='mt-4'>
                        <Grid>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>


                                <Text variant="headingMd" as="h6">
                                    Shopify Accounts
                                </Text>


                                <p className='' style={{ color: "#A0AEC0", fontSize: "12px" }}>body text will go here
                                </p>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                <div className='user-checkbox flex justify-around'>

                                    <div>
                                        <Checkbox
                                            label="Read"
                                            checked={checkedFour}
                                            onChange={handleChangeFour}
                                        />
                                    </div>


                                    <div>
                                        <Checkbox

                                            label="Write"
                                            checked={checkedFive}
                                            onChange={handleChangeFive}
                                        />
                                    </div>

                                </div>

                            </Grid.Cell>
                        </Grid>
                    </div>

                    <hr className='mt-8' />
                    <div className='mt-4'>
                        <Grid>

                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>


                                <Text variant="headingMd" as="h6">
                                    Shopify Accounts
                                </Text>


                                <p className='' style={{ color: "#A0AEC0", fontSize: "12px" }}>body text will go here
                                </p>

                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>

                                <div className='user-checkbox flex justify-around'>

                                    <div>
                                        <Checkbox
                                            label="Read"
                                            checked={checkedSix}
                                            onChange={handleChangeSix}
                                        />
                                    </div>


                                    <div>
                                        <Checkbox

                                            label="Write"
                                            checked={checkedSeven}
                                            onChange={handleChangeSeven}
                                        />
                                    </div>

                                </div>

                            </Grid.Cell>
                        </Grid>
                    </div>
                    <hr className='mt-8' style={{ width: "100%" }} />
                    <div className="users-button-group mt-4 flex justify-end">
                        <ButtonGroup>
                            <Button size='slim'>Cancel</Button>
                            <Button size='slim' variant="primary">Save</Button>
                        </ButtonGroup>
                    </div>

                </div>
            </Page>
        </div>
    );


}

Decorators.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Decorators;

