import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { usePage } from '@inertiajs/react';
import { Divider, Text, TextField } from '@shopify/polaris';
import { DeleteIcon } from "@shopify/polaris-icons";
// import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { setDecorator } from '@/ReactJs/reducers/InConnect/DecoratorSlice';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';

function LogoPhrase() {
    const page = usePage().props;
    const { query } = page.ziggy;
    const dispatch = useDispatch();
    const decorator = useSelector(state => state.inConnectDecorator.decorator);

    const handleChange = (object) => {
        dispatch(setDecorator(object));
    }

    const handleAddLogoPhrase = () => {
        let temp = [...decorator.logo_phrases];
        temp.push('');
        handleChange({ ...decorator, logo_phrases: temp });
    };

    const handleAddSecondLogoPhrase = () => {
        let temp = [...decorator.second_logo_phrases];
        temp.push('');
        handleChange({ ...decorator, second_logo_phrases: temp });
    };

    const handleAddDecoration = () => {
        let temp = [...decorator.decorations];
        temp.push('');
        handleChange({ ...decorator, decorations: temp });
    };

    const handleAddCustomDecoration = () => {
        let temp = [...decorator.custom_decorations];
        temp.push('');
        handleChange({ ...decorator, custom_decorations: temp });
    };

    const handleAddPersonalizationInput = () => {
        let temp = [...decorator.personalization_inputs];
        temp.push('');
        handleChange({ ...decorator, personalization_inputs: temp });
    };

    const handleAddLogoLocationPhrase = () => {
        let temp = [...decorator.logo_location_phrases];
        temp.push('');
        handleChange({ ...decorator, logo_location_phrases: temp });
    };

    const handleAddSecondLogoLocationPhrase = () => {
        let temp = [...decorator.second_logo_location_phrases];
        temp.push('');
        handleChange({ ...decorator, second_logo_location_phrases: temp });
    };

    const [logoPhraseOptions, setLogoPhraseOptions] = useState([]);
    const [logoLocationPhraseOptions, setLogoLocationPhraseOptions] = useState([]);
    const [decorationOptions, setDecorationOptions] = useState([]);
    const [personalizationInputOptions, setPersonalizationInputOptions] = useState([]);

    useEffect(() => {
        fetchLogoPhraseOptions();
        fetchLogoLocationPhraseOptions();
        fetchDecorationOptions();
        fetchPersonalizationInputOptions();
    }, []);

    const fetchLogoPhraseOptions = async () => {
        try {
            const response = await fetch(route('ic_options', 'logo_group'), {
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
                setLogoPhraseOptions(options);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchLogoLocationPhraseOptions = async () => {
        try {
            const response = await fetch(route('ic_options', 'logo_location'), {
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
                setLogoLocationPhraseOptions(options);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchDecorationOptions = async () => {
        try {
            const response = await fetch(route('ic_options', 'decoration'), {
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
    }

    const fetchPersonalizationInputOptions = async () => {
        try {
            const response = await fetch(route('ic_options', 'personalization_input'), {
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
                setPersonalizationInputOptions(options);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }


    return (
        <div>
            <div className='steps-div logolocation-main-div mt-10 mb-4'>
                {/* ... (other code) */}
                <div className="logo-locationOne mt-4">
                    <div className="location-text">
                        <Text variant="headingMd" as="h6">
                            Logo Selection Phrases
                        </Text>
                        <Divider />
                    </div>
                    <div className='logo-location' style={{ padding: "25px" }}>
                        <div className="phrase-textfield">
                            <Text variant="headingMd" as="h6">
                                <span className='cust-staric'>

                                    Shopify Phrase
                                </span>
                            </Text>
                            {decorator.logo_phrases.map((value, index) => (
                                <div key={index} className='mt-3'>
                                    <div className='flex justify-between'>
                                        <div style={{ width: '100%' }}>
                                            <Select
                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                options={logoPhraseOptions}
                                                value={value}
                                                onChange={(e) => {
                                                    let temp = [...decorator.logo_phrases];
                                                    temp[index] = e;
                                                    handleChange({ ...decorator, logo_phrases: temp });
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginLeft: "10px", marginTop: "7px" }}>

                                            <span style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    let temp = [...decorator.logo_phrases];
                                                    temp.splice(index, 1);
                                                    handleChange({ ...decorator, logo_phrases: temp });
                                                }}
                                            > <DeleteIcon width={20} /> </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className='flex justify-center mt-4'>
                                <button className="btn-phrase" onClick={handleAddLogoPhrase}>
                                    Add Phrase
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ABDULLAH CODE FRONTEND*/}
            <div className='steps-div logolocation-main-div mt-10 mb-4'>
                {/* ... (other code) */}
                <div className="logo-locationOne mt-4">
                    <div className="location-text">
                        <Text variant="headingMd" as="h6">
                            2nd Logo Selection Phrases
                        </Text>
                        <Divider />
                    </div>
                    <div className='logo-location' style={{ padding: "25px" }}>
                        <div className="phrase-textfield">
                            <Text variant="headingMd" as="h6">
                                <span className='cust-staric'>

                                    Shopify Phrase
                                </span>
                            </Text>
                            {decorator.second_logo_phrases.map((value, index) => (
                                <div key={index} className='mt-3'>
                                    <div className='flex justify-between'>
                                        <div style={{ width: '100%' }}>
                                            <Select
                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                options={logoPhraseOptions}
                                                value={value}
                                                onChange={(e) => {
                                                    let temp = [...decorator.second_logo_phrases];
                                                    temp[index] = e;
                                                    handleChange({ ...decorator, second_logo_phrases: temp });
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginLeft: "10px", marginTop: "7px" }}>

                                            <span style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    let temp = [...decorator.second_logo_phrases];
                                                    temp.splice(index, 1);
                                                    handleChange({ ...decorator, second_logo_phrases: temp });
                                                }}
                                            > <DeleteIcon width={20} /> </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className='flex justify-center mt-4'>
                                <button className="btn-phrase" onClick={handleAddSecondLogoPhrase}>
                                    Add Phrase
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* ABDULLAH CODE FRONTEND*/}

            <div className='logolocation-main-div mt-10 mb-4'>
                <div className="logo-locationOne mt-4">
                    <div className="location-text">
                        <Text variant="headingMd" as="h6">
                            Decorations
                        </Text>
                        <Divider />
                    </div>
                    <div className='logo-location' style={{ padding: "25px" }}>
                        <div className="phrase-textfield">

                            <Text variant="headingMd" as="h6">
                                <span className='cust-staric'>

                                    Shopify Decoration Fields
                                </span>
                            </Text>
                        </div>
                        {decorator.decorations.map((value, index) => (
                            <div key={index} className="personalization-textfield flex justify-around mt-4">
                                <div className='personalization-input'>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        options={decorationOptions}
                                        value={value}
                                        onChange={(e) => {
                                            let temp = [...decorator.decorations];
                                            temp[index] = e;
                                            handleChange({ ...decorator, decorations: temp });
                                        }}
                                    />
                                </div>
                                <div style={{ marginLeft: "10px", marginTop: "2px" }}>
                                    <span style={{ cursor: "pointer" }} onClick={() => {
                                        let temp = [...decorator.decorations];
                                        temp.splice(index, 1);
                                        handleChange({ ...decorator, decorations: temp });
                                    }} > <DeleteIcon width={20} /> </span>
                                </div>

                            </div>
                        ))}
                        <div className='flex justify-center mt-4'>
                            <button className="btn-personalization" onClick={handleAddDecoration}>
                                Add Decoration
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='logolocation-main-div mt-10 mb-4'>
                <div className="logo-locationOne mt-4">
                    <div className="location-text">
                        <Text variant="headingMd" as="h6">
                            Custom Decorations
                        </Text>
                        <Divider />
                    </div>
                    <div className='logo-location' style={{ padding: "25px" }}>
                        <div className="phrase-textfield">

                            <Text variant="headingMd" as="h6">
                                <span className='cust-staric'>
                                    Shopify Decoration Name
                                </span>
                            </Text>
                        </div>
                        {decorator.custom_decorations.map((value, index) => (
                            <div key={index} className="personalization-textfield flex justify-around mt-4">
                                <div className='personalization-input'>
                                    <TextField
                                         onChange={(e) => {
                                            let temp = [...decorator.custom_decorations];
                                            temp[index] = e;
                                            handleChange({ ...decorator, custom_decorations: temp });
                                        }}
                                        value={value}
                                        autoComplete="off"
                                    />
                                </div>
                                <div style={{ marginLeft: "10px", marginTop: "2px" }}>
                                    <span style={{ cursor: "pointer" }} onClick={() => {
                                        let temp = [...decorator.custom_decorations];
                                        temp.splice(index, 1);
                                        handleChange({ ...decorator, custom_decorations: temp });
                                    }} > <DeleteIcon width={20} /> </span>
                                </div>
                            </div>
                        ))}
                        <div className='flex justify-center mt-4'>
                            <button className="btn-personalization" onClick={handleAddCustomDecoration}>
                                Add Custom Decoration
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='logolocation-main-div mt-10 mb-4'>
                <div className="logo-locationOne mt-4">
                    <div className="location-text">
                        <Text variant="headingMd" as="h6">
                            Logo Location Phrase
                        </Text>
                        <Divider />
                    </div>
                    <div className='logo-location' style={{ padding: "25px" }}>
                        <div className="phrase-textfield">

                            <Text variant="headingMd" as="h6">
                                <span className='cust-staric'>


                                    Shopify Logo Locations
                                </span>

                            </Text>
                        </div>
                        {decorator.logo_location_phrases.map((value, index) => (
                            <div key={index} className="personalization-textfield flex justify-around mt-4">
                                <div className='personalization-input'>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        options={logoLocationPhraseOptions}
                                        value={value}
                                        onChange={(e) => {
                                            let temp = [...decorator.logo_location_phrases];
                                            temp[index] = e;
                                            handleChange({ ...decorator, logo_location_phrases: temp });
                                        }}
                                    />
                                </div>
                                <div style={{ marginLeft: "10px", marginTop: "2px" }}>
                                    <span style={{ cursor: "pointer" }} onClick={() => {
                                        let temp = [...decorator.logo_location_phrases];
                                        temp.splice(index, 1);
                                        handleChange({ ...decorator, logo_location_phrases: temp });
                                    }} > <DeleteIcon width={20} /> </span>
                                </div>

                            </div>
                        ))}
                        <div className='flex justify-center mt-4'>
                            <button className="btn-personalization" onClick={handleAddLogoLocationPhrase}>
                                Add Logo Location Phrase
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ABDULLAH CODE FRONTEND*/}
            <div className='logolocation-main-div mt-10 mb-4'>
                <div className="logo-locationOne mt-4">
                    <div className="location-text">
                        <Text variant="headingMd" as="h6">
                            2nd Logo Location Phrase
                        </Text>
                        <Divider />
                    </div>
                    <div className='logo-location' style={{ padding: "25px" }}>
                        <div className="phrase-textfield">

                            <Text variant="headingMd" as="h6">
                                <span className='cust-staric'>


                                    Shopify Logo Locations
                                </span>

                            </Text>
                        </div>
                        {decorator.second_logo_location_phrases.map((value, index) => (
                            <div key={index} className="personalization-textfield flex justify-around mt-4">
                                <div className='personalization-input'>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        options={logoLocationPhraseOptions}
                                        value={value}
                                        onChange={(e) => {
                                            let temp = [...decorator.second_logo_location_phrases];
                                            temp[index] = e;
                                            handleChange({ ...decorator, second_logo_location_phrases: temp });
                                        }}
                                    />
                                </div>
                                <div style={{ marginLeft: "10px", marginTop: "2px" }}>
                                    <span style={{ cursor: "pointer" }} onClick={() => {
                                        let temp = [...decorator.second_logo_location_phrases];
                                        temp.splice(index, 1);
                                        handleChange({ ...decorator, second_logo_location_phrases: temp });
                                    }} > <DeleteIcon width={20} /> </span>
                                </div>

                            </div>
                        ))}
                        <div className='flex justify-center mt-4'>
                            <button className="btn-personalization" onClick={handleAddSecondLogoLocationPhrase}>
                                Add Logo Location Phrase
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* ABDULLAH CODE FRONTEND*/}

            <div className='logolocation-main-div mt-10 mb-4'>
                <div className="logo-locationOne mt-4">
                    <div className="location-text">
                        <Text variant="headingMd" as="h6">
                            Personalization Phrases (Input Values)
                        </Text>
                        <Divider />
                    </div>
                    <div className='logo-location' style={{ padding: "25px" }}>
                        <div className="phrase-textfield">

                            <Text variant="headingMd" as="h6">
                                <span className='cust-staric'>
                                    Shopify Personalization Fields

                                </span>
                            </Text>
                        </div>
                        {decorator.personalization_inputs.map((value, index) => (
                            <div key={index} className="personalization-textfield flex justify-around mt-4">
                                <div className='personalization-input'>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                        options={personalizationInputOptions}
                                        value={value}
                                        onChange={(e) => {
                                            let temp = [...decorator.personalization_inputs];
                                            temp[index] = e;
                                            handleChange({ ...decorator, personalization_inputs: temp });
                                        }}
                                    />
                                </div>
                                <div style={{ marginLeft: "10px", marginTop: "2px" }}>
                                    <span style={{ cursor: "pointer" }} onClick={() => {
                                        let temp = [...decorator.personalization_inputs];
                                        temp.splice(index, 1);
                                        handleChange({ ...decorator, personalization_inputs: temp });
                                    }} > <DeleteIcon width={20} /> </span>
                                </div>

                            </div>
                        ))}
                        <div className='flex justify-center mt-4'>
                            <button className="btn-personalization" onClick={handleAddPersonalizationInput}>
                                Add Input Value
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </div>

    );
}

LogoPhrase.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default LogoPhrase;
