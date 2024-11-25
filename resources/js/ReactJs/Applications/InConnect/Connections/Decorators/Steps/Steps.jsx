import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import Leftmenu from '@/ReactJs/Applications/InConnect/Connections/LeftMenu/LeftMenu';
import { setDecorator } from '@/ReactJs/reducers/InConnect/DecoratorSlice';
import { router } from '@inertiajs/react';
import { Button, Card, Grid, Page, Text } from '@shopify/polaris';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import Address from '../Steps/Address';
import Basic from '../Steps/Basic';
import LogoLocation from '../Steps/LogoLocation';
import LogoPhrase from '../Steps/LogoPhrase';
import Sizes from '../Steps/Sizes';
import StitchCount from './StitchCount';
import './style.css';
function Steps({ decorator, intactVendors, intactLocations, intactDepartments, shopifyVendors }) {
    
    const [currentStep, setCurrentStep] = useState(1);
    const [step1Completed, setStep1Completed] = useState(false);
    const [step2Completed, setStep2Completed] = useState(false);
    const [step3Completed, setStep3Completed] = useState(false);
    const [step4Completed, setStep4Completed] = useState(false);
    const [step5Completed, setStep5Completed] = useState(false);
    const [step6Completed, setStep6Completed] = useState(false);
    const dispatch = useDispatch();
    const stateDecorator = useSelector(state => state.inConnectDecorator.decorator);
    const dbDecorator = decorator;
    const totalSteps = 6;

    useEffect(() => {
        if (dbDecorator !== undefined) {
            if (dbDecorator.intact_vendor) {
                dbDecorator.intact_vendor = {
                    value: dbDecorator.intact_vendor.id,
                    label: dbDecorator.intact_vendor.name,
                }
            }
            if (dbDecorator.intact_location) {
                dbDecorator.intact_location = {
                    value: dbDecorator.intact_location.id,
                    label: dbDecorator.intact_location.name,
                }
            }
            if (dbDecorator.intact_department) {
                dbDecorator.intact_department = {
                    value: dbDecorator.intact_department.id,
                    label: dbDecorator.intact_department.name,
                }
            }
            if (dbDecorator.sizes) {
                dbDecorator.sizes = dbDecorator.sizes.map((size) => {
                    return {
                        ...size,
                        shopify_sizes: size.shopify_sizes.map((shopify_size) => {
                            return {
                                ...shopify_size,
                                value: shopify_size.id,
                                label: shopify_size.name,
                            }
                        })
                    }
                });
            }
            if (dbDecorator.services) {
                dbDecorator.services = dbDecorator.services.map((service) => {
                    return {
                        ...service,
                        service_id: service.service_id,
                        option_ids: service.option_ids,
                        shopify_decoration: {
                            value: service?.shopify_decoration?.id,
                            label: service?.shopify_decoration?.name,
                        },
                        locations: service.locations ? service.locations.map((location) => {
                            return {
                                ...location,
                                location_id: location.location_id,
                                shopify_location: {
                                    value: location?.shopify_location?.id,
                                    label: location?.shopify_location?.name,
                                },
                            }
                        }) : []
                    }
                });
            }
            /****************** Start https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7692044547 ********************/
            // console.log(dbDecorator.stich_list);
            if (dbDecorator.stich_list) {
                dbDecorator.stich_list = dbDecorator.stich_list.map((stichingList) => {
                    return {
                        ...stichingList,
                        title: stichingList.title,
                        min: stichingList.min,
                        max: stichingList.max,
                        stitch_list_details: stichingList.stiching_list_details ? stichingList.stiching_list_details.map((detail) => {
                            return {
                                ...detail,
                                from: detail.from,
                                to: detail.to,
                                price: detail.price
                            }
                        }) : []
                    }
                });
            }
            /****************** End https://3.basecamp.com/5293232/buckets/34717198/card_tables/cards/7692044547 ********************/

            if (dbDecorator.logo_phrases) {
                dbDecorator.logo_phrases = dbDecorator.logo_phrases.map((item) => {
                    return item.logo_phrase;
                });
            }
            if (dbDecorator.second_logo_phrases) {
                dbDecorator.second_logo_phrases = dbDecorator.second_logo_phrases.map((item) => {
                    return item.second_logo_phrase;
                });
            }
            if (dbDecorator.logo_location_phrases) {
                dbDecorator.logo_location_phrases = dbDecorator.logo_location_phrases.map((item) => {
                    return item.logo_location_phrase;
                });
            }
            if (dbDecorator.second_logo_location_phrases) {
                dbDecorator.second_logo_location_phrases = dbDecorator.second_logo_location_phrases.map((item) => {
                    return item.second_logo_location_phrase;
                });
            }
            if (dbDecorator.decorations) {
                dbDecorator.decorations = dbDecorator.decorations.map((item) => {
                    return item.decoration;
                });
            }
            if (dbDecorator.custom_decorations) {
                dbDecorator.custom_decorations = dbDecorator.custom_decorations.map((item) => {
                    return item.name;
                });
            }
            if (dbDecorator.personalization_inputs) {
                dbDecorator.personalization_inputs = dbDecorator.personalization_inputs.map((item) => {
                    return item.input;
                });
            }
            if (dbDecorator.vendor_stocks) {
                dbDecorator.vendor_stocks = dbDecorator.vendor_stocks.map((item) => {
                    return { label: item.shopify_vendor.name, value: item.shopify_vendor.id };
                });
            }
            dispatch(setDecorator(dbDecorator));
        }
    }, [decorator]);

    const handleSave = async () => {
        const formDecorator = { ...stateDecorator, step: currentStep };
        let form_action = route('ic_decorators.store');
        let form_method = 'POST';
        if (dbDecorator !== undefined) {
            form_action = route('ic_decorators.update', dbDecorator.id);
            form_method = 'PATCH';
        }
        let response = await fetch(form_action, {
            method: form_method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDecorator),
        });
        let data = await response.json();
        if (data.success) {
            if (data.message) {
                Swal.fire({
                    title: 'Success!',
                    icon: 'success',
                    text: data.message,
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    router.get(route('ic_decorators.index'));
                });
            } else {
                handleNextStep()
            }
        } else {
            Swal.fire({
                position: "top-end",
                text: data.message,
                icon: "info",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    const handleNextStep = () => {

        if (currentStep === 1) {
            setStep1Completed(true);
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setStep2Completed(true);
            setCurrentStep(3);
        } else if (currentStep === 3) {
            setStep3Completed(true);
            setCurrentStep(4);
        }
        else if (currentStep === 4) {
            setStep4Completed(true);
            setCurrentStep(5);
        }
        else if (currentStep === 5) {
            setStep5Completed(true);
            setCurrentStep(6);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else if (currentStep === 3) {
            setCurrentStep(2);
        }
        else if (currentStep === 4) {
            setCurrentStep(3);
        }
        else if (currentStep === 5) {
            setCurrentStep(4);
        }
        else if (currentStep === 6) {
            setCurrentStep(5);
        }
    };

    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div className='cc-inconnect-body-wraper'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>
                            <Text variant='headingLg' as='h5'>
                                <Leftmenu />
                            </Text>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 9, lg: 9, xl: 9 }}>
                            <Card>
                                <div className="steps">
                                    <Grid>
                                        <Grid.Cell columnSpan={{ md: 12, lg: 12, xl: 12 }}>
                                            <div>
                                                <div className="step-indicator-deco">
                                                    <div>
                                                        <button onClick={() => setCurrentStep(1)}>
                                                            <div className={`step-name ${currentStep === 1 ? 'current' : ''}`}>Basic</div>
                                                            <div className={`step-circle ${step1Completed ? 'completed' : ''}`}>
                                                                {step1Completed ? (
                                                                    <div className="step-icon">✓</div>
                                                                ) : (
                                                                    1
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>
                                                    <div className={`step-line ${step1Completed ? 'completed' : ''}`}></div>
                                                    <div>
                                                        <button onClick={() => setCurrentStep(2)}>
                                                            <div className={`step-name ${currentStep === 2 ? 'current' : ''}`}>Sizes</div>
                                                            <div className={`step-circle ${step2Completed ? 'completed' : ''}`}>
                                                                {step2Completed ? (
                                                                    <div className="step-icon">✓</div>
                                                                ) : (
                                                                    2
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>
                                                    {/**************** step 3 ***************/}
                                                    <div className={`step-line ${step2Completed ? 'completed' : ''}`}></div>
                                                    <div>
                                                        <button onClick={() => setCurrentStep(3)}>
                                                            <div className={`step-name ${currentStep === 3 ? 'current' : ''}`}>Stitch Count</div>
                                                            <div className={`step-circle ${step3Completed ? 'completed' : ''}`}>
                                                                {step3Completed ? (
                                                                    <div className="step-icon">✓</div>
                                                                ) : (
                                                                    3
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>
                                                    {/**************** step 3 ***************/}
                                                    <div className={`step-line ${step3Completed ? 'completed' : ''}`}></div>
                                                    <div>
                                                        <button onClick={() => setCurrentStep(4)}>
                                                            <div className={`step-name ${currentStep === 4 ? 'current' : ''}`}>Logo Location</div>
                                                            <div className={`step-circle ${step4Completed ? 'completed' : ''}`}>
                                                                {step4Completed ? (
                                                                    <div className="step-icon">✓</div>
                                                                ) : (
                                                                    4
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>
                                                    <div className={`step-line ${step4Completed ? 'completed' : ''}`}></div>
                                                    <div>
                                                        <button onClick={() => setCurrentStep(5)}>
                                                            <div className={`step-name ${currentStep === 5 ? 'current' : ''}`}>Logo Phrase</div>
                                                            <div className={`step-circle ${step5Completed ? 'completed' : ''}`}>
                                                                {step5Completed ? (
                                                                    <div className="step-icon">✓</div>
                                                                ) : (
                                                                    5
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>
                                                    <div className={`step-line ${step5Completed ? 'completed' : ''}`}></div>
                                                    <div>
                                                        <button onClick={() => setCurrentStep(6)}>
                                                            <div className={`step-name ${currentStep === 6 ? 'current' : ''}`}>Address</div>
                                                            <div className={`step-circle ${step6Completed ? 'completed' : ''}`}>
                                                                {step6Completed ? (
                                                                    <div className="step-icon">✓</div>
                                                                ) : (
                                                                    6
                                                                )}
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="step-content">
                                                    {currentStep === 1 && (
                                                        <div>
                                                            <Basic intactVendors={intactVendors} intactLocations={intactLocations} intactDepartments={intactDepartments} shopifyVendors={shopifyVendors} />
                                                        </div>
                                                    )}
                                                    {currentStep === 2 && (
                                                        <div>
                                                            <Sizes />
                                                        </div>
                                                    )}
                                                    {currentStep === 3 && (
                                                        <div>
                                                            {<StitchCount />}

                                                        </div>
                                                    )}
                                                    {currentStep === 4 && (
                                                        <div>
                                                            <LogoLocation />
                                                        </div>
                                                    )}
                                                    {currentStep === 5 && (
                                                        <div>
                                                            <LogoPhrase />
                                                        </div>
                                                    )}
                                                    {currentStep === 6 && (
                                                        <div>
                                                            <Address />
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                        </Grid.Cell>
                                    </Grid>
                                </div>
                            </Card>
                            <div className="button-group mt-4">
                                {currentStep !== 1 && (
                                    <Button onClick={handlePreviousStep}>Previous</Button>
                                )}
                                &nbsp;&nbsp;&nbsp;
                                <Button variant="primary" onClick={handleSave}> {currentStep === totalSteps ? 'Save' : 'Next'} </Button>
                            </div>
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>
        </div>
    );
}
Steps.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Steps;
