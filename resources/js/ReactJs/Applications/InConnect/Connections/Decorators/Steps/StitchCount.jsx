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

function StitchCount() {
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
        let temp = [...decorator.stich_list];
        temp.push({
            title: '',
            min: '',
            max: '',
            stitch_list_details: [
                {
                    from: '',
                    to: '',
                    price: ''
                }
            ]
        });
        handleChange({ ...decorator, stich_list: temp });
    };

    const removeService = (index) => {
        let temp = [...decorator.stich_list];
        temp.splice(index, 1);
        handleChange({ ...decorator, stich_list: temp });
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
        let temp = [...decorator.stich_list];
        let tempLocations = [...temp[index].stitch_list_details];
        tempLocations.push({
            location_id: '',
            shopify_location: {
                value: '',
                label: ''
            },
        });
        temp[index] = { ...temp[index], stitch_list_details: tempLocations };
        handleChange({ ...decorator, stich_list: temp });
    };

    const removeServiceLocation = (index, innerIndex) => {
        let temp = [...decorator.stich_list];
        let tempLocations = [...temp[index].stitch_list_details];
        tempLocations.splice(innerIndex, 1);
        temp[index] = { ...temp[index], stitch_list_details: tempLocations };
        handleChange({ ...decorator, stich_list: temp });
    };

    return (
        <div className='steps-div logolocation-main-div mt-4 mb-4'>
            <div className="logo-location" style={{ padding: '' }}>
                {decorator.stich_list.map((currentStitchCountSet, index) => (
                    <div key={index} className="logo-locationOne mt-4">
                        <div className="location-text flex justify-between">
                            <Text variant="headingMd" as="h6">
                                Stitch Count
                            </Text>
                            <div style={{ marginTop: "2px" }} onClick={() => removeService(index)}><DeleteIcon width={20} /></div>
                        </div>
                        <Divider />
                        <div className="logo-location" style={{ padding: '25px' }}>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
                                    <Text variant="headingsm" as="h6">
                                        <span className='cust-staric'>
                                            Title

                                        </span>
                                    </Text>
                                    <TextField
                                        type="text"
                                        value={currentStitchCountSet.title}
                                        onChange={(e) => {
                                            let temp = [...decorator.stich_list];
                                            temp[index] = { ...temp[index], title: e };
                                            handleChange({ ...decorator, stich_list: temp });
                                        }}
                                        autoComplete="off"
                                    />
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>
                                    <Text variant="headingsm" as="h6">
                                        <span className='cust-staric'>

                                            Min
                                        </span>
                                    </Text>
                                    <TextField
                                        type="text"
                                        value={currentStitchCountSet.min}
                                        onChange={(e) => {
                                            let temp = [...decorator.stich_list];
                                            temp[index] = { ...temp[index], min: e };
                                            handleChange({ ...decorator, stich_list: temp });
                                        }}
                                        autoComplete="off"
                                    />
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
                                    <div>
                                        <Text variant="headingsm" as="h6">
                                            Max
                                        </Text>
                                        <TextField
                                            type="text"
                                            value={currentStitchCountSet.max}
                                            onChange={(e) => {
                                                let temp = [...decorator.stich_list];
                                                temp[index] = { ...temp[index], max: e };
                                                handleChange({ ...decorator, stich_list: temp });
                                            }}
                                            autoComplete="off"
                                        />
                                    </div>
                                </Grid.Cell>
                            </Grid>
                            <div className='Location-two-logo'>
                                <Text variant="headingMd" as="h5">
                                    Stich Count Prices
                                </Text>
                                <button className='btn-plus mt-2' onClick={() => addServiceLocation(index)}>+</button>
                                <Grid>
                                    {currentStitchCountSet.stitch_list_details && currentStitchCountSet.stitch_list_details.map((sc_prices, innerIndex) => (
                                        <Grid.Cell key={innerIndex} columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                            <div style={{ marginTop: "22px", float: "right", cursor: "pointer" }}><DeleteIcon width={20} onClick={() => removeServiceLocation(index, innerIndex)} /></div>
                                            <div className='location-boxes mt-3'>
                                                <div className='flex justify-around' >
                                                    <div className='box-lc1'>
                                                        <Text variant="headingsm" as="h6">
                                                            <span className='cust-staric'>
                                                                From
                                                            </span>
                                                        </Text>
                                                        <div className='mt-2' style={{ width: "90px" }}>
                                                            <TextField
                                                                type='text'
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                                value={sc_prices.from}
                                                                onChange={(e) => {
                                                                    let temp = [...decorator.stich_list];
                                                                    let tempLocations = [...temp[index].stitch_list_details];
                                                                    tempLocations[innerIndex] = { ...tempLocations[innerIndex], from: e };
                                                                    temp[index] = { ...temp[index], stitch_list_details: tempLocations };
                                                                    handleChange({ ...decorator, stich_list: temp });
                                                                }}
                                                            />
                                                        </div>

                                                    </div>
                                                    <div className='box-lc2' style={{ marginLeft: "8px", width: "100%" }}>
                                                        <Text variant="headingsm" as="h6" alignment='center'>
                                                            <span className='cust-staric'>
                                                                To
                                                            </span>
                                                        </Text>
                                                        <div className='mt-2'>
                                                            <TextField
                                                                type='text'
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                                value={sc_prices.to}
                                                                onChange={(e) => {
                                                                    let temp = [...decorator.stich_list];
                                                                    let tempLocations = [...temp[index].stitch_list_details];
                                                                    tempLocations[innerIndex] = { ...tempLocations[innerIndex], to: e };
                                                                    temp[index] = { ...temp[index], stitch_list_details: tempLocations };
                                                                    handleChange({ ...decorator, stich_list: temp });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className='box-lc2' style={{ marginLeft: "8px", width: "100%" }}>
                                                        <Text variant="headingsm" as="h6" alignment='center'>
                                                            <span className='cust-staric'>
                                                                Price
                                                            </span>
                                                        </Text>
                                                        <div className='mt-2'>
                                                            <TextField
                                                                type='text'
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                                value={sc_prices.price}
                                                                onChange={(e) => {
                                                                    let temp = [...decorator.stich_list];
                                                                    let tempLocations = [...temp[index].stitch_list_details];
                                                                    tempLocations[innerIndex] = { ...tempLocations[innerIndex], price: e };
                                                                    temp[index] = { ...temp[index], stitch_list_details: tempLocations };
                                                                    handleChange({ ...decorator, stich_list: temp });
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
                        Add Stitch Count
                    </button>
                </div>
            </div>
        </div>
    );
}
StitchCount.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default StitchCount;
