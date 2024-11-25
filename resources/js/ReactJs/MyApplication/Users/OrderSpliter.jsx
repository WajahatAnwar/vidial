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

    const handleChangeCheck = useCallback(
        (newChecked) => setChecked(newChecked),
        [],
    );

    const handleChangeOne = useCallback(
        (newChecked) => setCheckedOne(newChecked),
        [],
    );

    return (
        <div >
            <Page >

                <div className=''>

                    <Grid>

                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>

                            <div className='flex'>
                                <img src={`${window.appURL}/images/os.png`} alt="" width={"30px"} />
                                <div className='ml-3 '>
                                    <Text variant="headingLg" as="h5">
                                        Order Splitter
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
                                            onChange={handleChangeCheck}
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

