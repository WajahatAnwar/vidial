import { useCallback, useEffect, useState } from 'react';
// import { router, usePage } from '@inertiajs/react';
import { Button, Card, Collapsible, Divider, Page, Text } from '@shopify/polaris';
import { router, usePage } from '@inertiajs/react';
// import DownIcon from '../components/imges/downIcon.svg';





function GetStarted() {
    const page = usePage().props;
    const query = page.ziggy.query;

    const [open, setOpen] = useState(true);
    const [faqOne, setFaqOne] = useState(true);
    const [faqTwo, setFaqTwo] = useState(true);
    const [blockCheckbox, setBlockCheckbox] = useState(false);
    const [blockConversion, setBlockConversion] = useState(false);
    const [user,setUser] = useState(null);

    const handleToggle = useCallback(() => handleLanidngPage(), []);
    const handleFAQOneToggle = useCallback(() => setFaqOne((faqOne) => !faqOne), []);
    const handleFAQTwoToggle = useCallback(() => setFaqTwo((faqTwo) => !faqTwo), []);

    const handleLandingPage = (path) => {
        if(!blockCheckbox){
            fetch(route('visitLandingPage', query)).then((response) => response.json()).then((data) => {
                setBlockCheckbox(true);
                setBlockConversion(true);
            });
        }
        const name = store_name.split(".myshopify.com")[0];
        let redirect = `https://admin.shopify.com/store/${user?.store_name}/apps/vidial-staging-1/${path}`; 
        window.open(redirect);
    }

    useEffect(() => {
        fetch(route('currentUser',query)).then((response) => response.json()).then((data) => {
            setBlockCheckbox(data.data.user.landing_page_visited);
            setBlockConversion(data.data.user.landing_page_visited);
            setUser(data.data.user.store_name);
        });
    });
    return (
        <div>

            <Page title="Get Started" subtitle='Get started by following the instructions below'>

                <Card>
                    <div style={{padding:"15px"}}>
                        <p style={{marginBottom:"7px"}}>
                        <Text variant='bodyMd' as='h4' fontWeight='bold'>Configure your landing Page and Emails</Text>
                        </p>
                        <Divider />


                        <div className='' style={{ display: "flex", marginTop: "10px", gap: "15px" }}>
                            <div onClick={() => { setBlockCheckbox(!blockCheckbox) }} role='button' type="button">
                                {blockCheckbox ?
                                    <svg width="20px" height="20px" viewBox="0 0 512 512" fill="#000000" xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M256,0C114.837,0,0,114.843,0,256s114.837,256,256,256s256-114.843,256-256S397.163,0,256,0z M376.239,227.501 L257.348,346.391c-13.043,13.043-34.174,13.044-47.218,0l-68.804-68.804c-13.044-13.038-13.044-34.179,0-47.218 c13.044-13.044,34.174-13.044,47.218,0l45.195,45.19l95.282-95.278c13.044-13.044,34.174-13.044,47.218,0 C389.283,193.321,389.283,214.462,376.239,227.501z"></path> </g> </g> </g></svg>
                                    :
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="custom-loading-circle" role="img"><circle cx="10" cy="10" r="8.75" stroke="#BABEC3" stroke-width="2.5" stroke-dasharray="3.5 3.5"></circle></svg>

                                }
                            </div>
                            <div >
                                <div role='button' type="button" onClick={() => handleLandingPage('video-to-review')} ariaExpanded={open}
                                    ariaControls="basic-collapsible">
                                    <Text variant='bodyMd' as='h4' fontWeight='bold'>Setup your UGC collection</Text>

                                </div>
                                <Collapsible
                                    open={open}
                                    id="basic-collapsible"
                                    transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                    expandOnPrint
                                >

                                    <div className='mt-1'>
                                        <Text variant='bodyMd' as='p'>1. Setup your discounts.</Text>
                                        <Text variant='bodyMd' as='p'>2. Setup your video instructions.</Text>
                                        <Text variant='bodyMd' as='p'>3. Setup your emails.</Text>
                                    </div>

                                    <div className='polaris-black-btn-global' style={{marginTop:"10px"}}>

                                        <Button
                                            primary
                                            onClick={() => handleLandingPage('settings')}
                                        >
                                            Configure Landing Page
                                        </Button>
                                    </div>


                                </Collapsible>
                            </div>
                        </div>

                        <div className='' style={{ display: "flex", marginTop: "10px", gap: "15px" }}>
                            <div onClick={() => { setBlockConversion(!blockConversion) }} role='button' type="button">
                                {blockConversion ?
                                    <svg width="20px" height="20px" viewBox="0 0 512 512" fill="#000000" xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M256,0C114.837,0,0,114.843,0,256s114.837,256,256,256s256-114.843,256-256S397.163,0,256,0z M376.239,227.501 L257.348,346.391c-13.043,13.043-34.174,13.044-47.218,0l-68.804-68.804c-13.044-13.038-13.044-34.179,0-47.218 c13.044-13.044,34.174-13.044,47.218,0l45.195,45.19l95.282-95.278c13.044-13.044,34.174-13.044,47.218,0 C389.283,193.321,389.283,214.462,376.239,227.501z"></path> </g> </g> </g></svg>
                                    :
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="custom-loading-circle" role="img"><circle cx="10" cy="10" r="8.75" stroke="#BABEC3" stroke-width="2.5" stroke-dasharray="3.5 3.5"></circle></svg>

                                }
                            </div>
                            <div >
                                <div role='button' type="button" ariaExpanded={open}
                                    ariaControls="basic-collapsible">
                                      <Text variant='bodyMd' as='h4' fontWeight='bold'>Approve or deny your videos.</Text>

                                </div>
                                <Collapsible
                                    open={open}
                                    id="basic-collapsible"
                                    transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                    expandOnPrint
                                >
{/*
                                    <div className='mt-1' style={{marginTop:"5px"}}>
                                        <Text variant='bodyMd' as='p'>Approve or deny your videos.</Text>

                                    </div> */}

                                    {/* <div className='polaris-black-btn-global' style={{marginTop:"10px"}}>

                                    <Button primary>Add New Pixel</Button>
                                    </div> */}


                                </Collapsible>
                            </div>
                        </div>

                    </div>
                </Card>
                <div className='my-3' style={{marginTop:"10px",marginBottom:"10px"}}>
                    <Text variant='bodyMd' as='h4' fontWeight='medium'>Frequently Ask Questions</Text>
                </div>
                <Card>
                    <div style={{padding:"15px"}}>
                    <div className='flex gap-4' style={{display:"flex", gap:"10px"}}>
                        <div>
                            {/* <img style={{width:"10px"}} src={DownIcon}/> */}


                        </div>
                        <div>
                            <div onClick={handleFAQOneToggle}>
                                <Text variant='bodyMd' as='h4' fontWeight='bold'>
                                    Why should I use GoodAuthentic
                                </Text>

                            </div>
                            <Collapsible
                                open={faqOne}
                                id="basic-collapsible"
                                transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                expandOnPrint
                            >

                                <div className='mt-2'>
                                    <Text variant='bodyMd' as='p'>GoodAuthentic helps to collect UGC , reward customers and engage with your community at scale.Use GoodAuthentic to consistently receive UGC or setp up contests that generate more video at higher quality. </Text>
                                </div>


                            </Collapsible>
                        </div>
                    </div>
                    {/* <div className='flex' style={{display:"flex"}}>
                        <div>

                        </div>
                        <div>
                            <div onClick={handleFAQTwoToggle}>
                                <Text variant='bodyMd' as='h4' fontWeight='bold'>
                                    What is Thank You page cart?
                                </Text>

                            </div>
                            <Collapsible
                                open={faqTwo}
                                id="basic-collapsible"
                                transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                expandOnPrint
                            >

                                <div className='mt-1'>
                                    <Text variant='bodyMd' as='p'>The Thank You Cart is a pre-filled cart link that

                                        is presented to customers on the order confirmation page.
                                        Using this can improve repeat purchase rates by
                                        encouraging shoppers to make another order with the
                                        incentive. Afterparty makes it easy to create cart links and
                                        customize this block - either to use on its own or together
                                        with your upsell block

                                        For examples on how merchants are using Afterparty, visit
                                        <a target='_blank' href="https:/fafterpartyapp.notion.site/Merchant-
                                            Guide-81a41139946b407a9c78296ecct612c0/" className='text-blue-600'> https:/fafterpartyapp.notion.site/Merchant-
                                            Guide-81a41139946b407a9c78296ecct612c0/</a>  </Text>
                                </div>


                            </Collapsible>
                        </div>
                    </div> */}
                    </div>

                </Card>


            </Page>
        </div>
    )
}

export default GetStarted
