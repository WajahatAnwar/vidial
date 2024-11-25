import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import '@/ReactJs/Applications/InConnect/Connections/Decorators/Steps/decorator.css';
import { setDecorator } from '@/ReactJs/reducers/InConnect/DecoratorSlice';
import { usePage } from '@inertiajs/react';
import { Divider, Grid, Text, TextField } from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { WithContext as ReactTags } from 'react-tag-input';

const KeyCodes = {
    comma: 188,
    enter: 13
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

function LogoLocation() {
    const page = usePage().props;
    const { query } = page.ziggy;

    const AnimatedSelect = makeAnimated();
    const animatedComponents = makeAnimated();

    const decorator = useSelector(state => state.inConnectDecorator.decorator);

    const dispatch = useDispatch();

    const handleChange = (object) => {
        dispatch(setDecorator(object));
    }

    const addService = () => {
        let temp = [...decorator.services];
        temp.push({
            service_id: '',
            option_ids: [],
            shopify_decoration: {
                value: '',
                label: ''
            },
            locations: [
                {
                    location_id: '',
                    shopify_location: {
                        value: '',
                        label: ''
                    },
                }
            ]
        });
        handleChange({ ...decorator, services: temp });
    };

    const removeService = (index) => {
        let temp = [...decorator.services];
        temp.splice(index, 1);
        handleChange({ ...decorator, services: temp });
    };

    const [decorationOptions, setDecorationOptions] = useState([]);

    const [locationOptions, setLocationOptions] = useState([]);

    useEffect(() => {
        fetchDecorationOptions();
        fetchLocationOptions();
    }, []);

    const fetchDecorationOptions = async () => {
        try {
            const response = await fetch(route('ic_options', 'admin_note'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            let data = await response.json();
            if (data.success) {
                const options = data.data.map((option) => {
                    return {
                        value: option.id,
                        label: option.name,
                    }
                });
                setDecorationOptions(options);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchLocationOptions = async () => {
        try {
            const response = await fetch(route('ic_options', 'dropdown,admin_note'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            let data = await response.json();
            if (data.success) {
                const options = data.data.map((option) => {
                    return {
                        value: option.id,
                        label: option.name,
                    }
                });
                setLocationOptions(options);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const addServiceLocation = (index) => {
        let temp = [...decorator.services];
        let tempLocations = [...temp[index].locations];
        tempLocations.push({
            location_id: '',
            shopify_location: {
                value: '',
                label: ''
            },
        });
        temp[index] = { ...temp[index], locations: tempLocations };
        handleChange({ ...decorator, services: temp });
    };

    const removeServiceLocation = (index, innerIndex) => {
        let temp = [...decorator.services];
        let tempLocations = [...temp[index].locations];
        tempLocations.splice(innerIndex, 1);
        temp[index] = { ...temp[index], locations: tempLocations };
        handleChange({ ...decorator, services: temp });
    };

    return (
        <div className='steps-div logolocation-main-div mt-4 mb-4'>
            <div className="logo-location" style={{ padding: '' }}>
                {decorator.services.map((currentServiceSet, index) => (
                    <div key={index} className="logo-locationOne mt-4">
                        <div className="location-text flex justify-between">
                            <Text variant="headingMd" as="h6">
                                Logo Location
                            </Text>
                            <div style={{ marginTop: "2px" }} onClick={() => removeService(index)}><DeleteIcon width={20} /></div>
                        </div>
                        <Divider />
                        <div className="logo-location" style={{ padding: '25px' }}>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                                    <Text variant="headingsm" as="h6">
                                        <span className='cust-staric'>
                                            Shopify Decoration

                                        </span>
                                    </Text>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        components={AnimatedSelect}
                                        options={decorationOptions}
                                        value={currentServiceSet.shopify_decoration}

                                        onChange={(e) => {
                                            let temp = [...decorator.services];
                                            temp[index] = { ...temp[index], shopify_decoration: e };
                                            handleChange({ ...decorator, services: temp });
                                        }}
                                    />
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>
                                    <Text variant="headingsm" as="h6">
                                        <span className='cust-staric'>

                                            Service/Design Type ID
                                        </span>
                                    </Text>
                                    <TextField
                                        type="text"
                                        value={currentServiceSet.service_id}
                                        onChange={(e) => {
                                            let temp = [...decorator.services];
                                            temp[index] = { ...temp[index], service_id: e };
                                            handleChange({ ...decorator, services: temp });
                                        }}
                                        autoComplete="off"
                                    />
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
                                    <div>
                                        <Text variant="headingsm" as="h6">
                                            Option IDs
                                        </Text>
                                        <ReactTags
                                            tags={currentServiceSet.option_ids}
                                            placeholder="Type and press enter"
                                            // suggestions={suggestions}
                                            delimiters={delimiters}
                                            handleDelete={(i) => {
                                                let temp = [...decorator.services];
                                                temp[index] = { ...temp[index], option_ids: temp[index].option_ids.filter((tag, index2) => index2 !== i) };
                                                handleChange({ ...decorator, services: temp });
                                            }}
                                            handleAddition={(tag) => {
                                                let temp = [...decorator.services];
                                                temp[index] = { ...temp[index], option_ids: [...temp[index].option_ids, tag] };
                                                handleChange({ ...decorator, services: temp });
                                            }}
                                            inputFieldPosition="inline"
                                            autocomplete
                                        />
                                    </div>
                                </Grid.Cell>
                            </Grid>
                            <div className='Location-two-logo'>
                                <Text variant="headingMd" as="h5">
                                    Locations
                                </Text>
                                <button className='btn-plus mt-2' onClick={() => addServiceLocation(index)}>+</button>
                                <Grid>
                                    {currentServiceSet.locations && currentServiceSet.locations.map((location, innerIndex) => (
                                        <Grid.Cell key={innerIndex} columnSpan={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                                            <div style={{ marginTop: "22px", float: "right", cursor: "pointer" }}><DeleteIcon width={20} onClick={() => removeServiceLocation(index, innerIndex)} /></div>
                                            <div className='location-boxes mt-3'>
                                                <div className='flex justify-around' >
                                                    <div className='box-lc1'>
                                                        <Text variant="headingsm" as="h6">
                                                            <span className='cust-staric'>
                                                                Location ID
                                                            </span>
                                                        </Text>
                                                        <div className='mt-2' style={{ width: "90px" }}>
                                                            <TextField
                                                                type='text'
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                                value={location.location_id}
                                                                onChange={(e) => {
                                                                    let temp = [...decorator.services];
                                                                    let tempLocations = [...temp[index].locations];
                                                                    tempLocations[innerIndex] = { ...tempLocations[innerIndex], location_id: e };
                                                                    temp[index] = { ...temp[index], locations: tempLocations };
                                                                    handleChange({ ...decorator, services: temp });
                                                                }}
                                                            />
                                                        </div>

                                                    </div>
                                                    <div className='box-lc2' style={{ marginLeft: "8px", width: "100%" }}>
                                                        <Text variant="headingsm" as="h6" alignment='center'>
                                                            <span className='cust-staric'>
                                                                Shopify Location
                                                            </span>
                                                        </Text>
                                                        <div className='mt-2'>
                                                            <Select
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                                components={AnimatedSelect}
                                                                options={locationOptions}
                                                                value={location.shopify_location}
                                                                onChange={(e) => {
                                                                    let temp = [...decorator.services];
                                                                    let tempLocations = [...temp[index].locations];
                                                                    tempLocations[innerIndex] = { ...tempLocations[innerIndex], shopify_location: e };
                                                                    temp[index] = { ...temp[index], locations: tempLocations };
                                                                    handleChange({ ...decorator, services: temp });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Grid.Cell>
                                    ))}
                                </Grid>
                            </div>
                        </div>

                    </div>
                ))}
                <div className='flex justify-center mt-4'>
                    <button className="btn-sizemodal" onClick={() => addService()}>
                        Add Logo Location
                    </button>
                </div>
            </div>
        </div>
    );
}
LogoLocation.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default LogoLocation;
