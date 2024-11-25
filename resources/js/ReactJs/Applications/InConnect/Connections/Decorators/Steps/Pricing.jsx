import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { usePage } from '@inertiajs/react';
import {
    Button,
    Divider,
    Grid,
    Text,
    TextField
} from '@shopify/polaris';
import { useCallback, useState } from 'react';
// import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

// import Table from "./DecoratorsTable";
function Pricing() {
    const page = usePage().props;
    const { query } = page.ziggy;

    const animatedComponents = makeAnimated();

    const [value, setValue] = useState('1');
    const [valueTwo, setValueTwo] = useState('2');
    const [valueThree, setValueThree] = useState('1');

    const handleChange = useCallback(
        (newValue) => setValue(newValue),
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

    // Tags select start


    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const optionsVendorssingle = [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
    ]
    // Tags select ends

    const optionsVendors = [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
    ]

    const optionsVendorsTwo = [
        { value: 'Left Chest', label: 'Left Chest' },
        { value: 'Right Chest', label: 'Right Chest' },

    ]



    const [valueSix, setValueSix] = useState('1');

    const handleChangeSix = useCallback(
        (newValue) => setValueSix(newValue),
        [],
    );


        const [boxes, setBoxes] = useState([]);

        const handleAddBox = () => {
          setBoxes([...boxes, { isVisible: true }]);
        };

        const handleToggleVisibility = (index) => {
          const updatedBoxes = [...boxes];
          updatedBoxes[index].isVisible = !updatedBoxes[index].isVisible;
          setBoxes(updatedBoxes);
        };


    return (
        <div className='logolocation-main-div mt-4 mb-4'>

            <div className='btn-services flex justify-end'>


                <Button variant="primary">Add Services</Button>

            </div>


            <div className="logo-locationOne mt-4">
                <div className="location-text">
                    <Text variant="headingMd" as="h6">
                        Pricing
                    </Text>

                    <Divider />
                </div>
                <div className='logo-location' style={{ padding: "25px" }}>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>

                            <div className="servicesid">

                                <Text variant="headingsm" as="h6">
                                    Service ID
                                </Text>

                                <div className='mt-2' >
                                    <TextField

                                        type="number"
                                        value={valueTwo}
                                        onChange={handleChangeTwo}
                                        autoComplete="off"

                                    />


                                </div>

                            </div>

                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>

                            <div className="servicesid">

                                <Text variant="headingsm" as="h6">
                                    Decorator Options
                                </Text>

                                <div >

                                    <div className='mt-2'>
                                        <TextField

                                            type="number"
                                            value={valueThree}
                                            onChange={handleChangeThree}
                                            autoComplete="off"

                                        />
                                    </div>
                                </div>

                            </div>

                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>

                            <div className="servicesid">

                                <Text variant="headingsm" as="h6">
                                    Shopify Decoration
                                </Text>

                                <div >
                                    <div className='mt-2'>
                                        <Select
                                            closeMenuOnSelect={false}
                                            components={animatedComponents}
                                            isMulti
                                            options={optionsVendors}
                                        />

                                    </div>

                                </div>

                            </div>


                        </Grid.Cell>
                    </Grid>
                </div>
                <div className='Location-two'>
                    <Text variant="headingMd" as="h5">
                        Location
                    </Text>

                    {/* <button className='btn-plus mt-2'>+</button> */}
                    <button className='btn-plus mt-2' onClick={handleAddBox}>+</button>



                    {/* <Grid>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
                            <div className='location-boxes mt-3'>


                                <div className='flex justify-around'>
                                    <div className='box-lc1'>
                                        <Text variant="headingLg" as="h5">
                                            Decorator
                                        </Text>

                                        <div className='mt-2' style={{ width: "80px" }}>
                                            <TextField

                                                type="number"
                                                value={valueSix}
                                                onChange={handleChangeSix}
                                                autoComplete="off"
                                            />
                                        </div>



                                    </div>

                                    <div className='box-lc2'>
                                        <Text variant="headingLg" as="h5" alignment='center'>
                                            Shopify
                                        </Text>

                                        <div className='mt-2' style={{ width: "190px" }}>

                                            <Select
                                                closeMenuOnSelect={false}
                                                components={animatedComponents}
                                                isMulti
                                                options={optionsVendorsTwo}
                                            />
                                        </div>



                                    </div>
                                </div>

                            </div>
                        </Grid.Cell>
                    </Grid> */}

<Grid>
            {boxes.map((box, index) => (
              box.isVisible && (
        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
                  <button className='btn-minus' onClick={() => handleToggleVisibility(index)}>X</button>
          <div className='location-boxes mt-3'>
                <div key={index} className='flex justify-around' onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={() => handleMouseLeave(index)}>
                  <div className='box-lc1'>
                    <Text variant="headingLg" as="h5">
                      Decorator
                    </Text>

                    <div className='mt-2' style={{ width: "80px" }}>
                      <TextField
                        type="number"
                        value={valueSix}
                        onChange={handleChangeSix}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className='box-lc2'>
                    <Text variant="headingLg" as="h5" alignment='center'>
                      Shopify
                    </Text>

                    <div className='mt-2' style={{ width: "190px" }}>
                      <Select
                       menuPortalTarget={document.body}
                       styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        closeMenuOnSelect={false}
                        components={animatedComponents}
                        isMulti
                        options={optionsVendorsTwo}
                      />
                    </div>
                  </div>


          </div>
                </div>
        </Grid.Cell>
              )
            ))}
      </Grid>

                </div>




            </div>


        </div>

    );


}

Pricing.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Pricing;

