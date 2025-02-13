import { router } from "@inertiajs/react";
import { Banner, Button, Card, Collapsible, Divider, Page, Text } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

import Ticker from './Ticker';
// import DownIcon from '../components/imges/downIcon.svg';
import RightIcon from '@/ReactJs/MyApplication/imges/righticon.png';
function GetStarted() {


  const app_url = 'https://app.goodauthentic.com';

  const [open, setOpen] = useState(true);
  const [faqOne, setFaqOne] = useState(true);
  const [faqTwo, setFaqTwo] = useState(true);
  const [faqThree, setFaqThree] = useState(true);
  const [blockCheckbox, setBlockCheckbox] = useState(false);
  const [blockConversion, setBlockConversion] = useState(false);
  const [user, setUser] = useState(null);

  const handleToggle = useCallback(() => handleLanidngPage(), []);
  const handleFAQOneToggle = useCallback(() => setFaqOne((faqOne) => !faqOne), []);
  const handleFAQTwoToggle = useCallback(() => setFaqTwo((faqTwo) => !faqTwo), []);
  const handleFAQThreeToggle = useCallback(() => setFaqThree((faqThree) => !faqThree), []);

  const handleLandingPage = (path) => {
    if (!blockCheckbox) {
      fetch(route('visitLandingPage')).then((response) => response.json()).then((data) => {
        setBlockCheckbox(true);
        setBlockConversion(true);
      });
    }
    if (user && user.name) {
      let name = user.name;
      name = name.split(".myshopify.com")[0];
      let redirect = `https://admin.shopify.com/store/${name}/apps/vidial-staging-1/${path}`;
      window.open(redirect);
    }
  }

  const handleRedirect = (path) => {
    // open(path, '_self');
    router.get(route(path));

  };

  const handleVersionUpdate = () => {
    let go_to_url = `${app_url}/authenticate?shop=${user.name}`;
    

    setTimeout(() => {
      fetch(route('update-version'))
        .then(response => response.json())
        .then(data => {
          console.log('Version Updated:', data);
        })
        .catch(error => console.error('Error updating version:', error));
    }, 3000);
    window.open(go_to_url);
  };

  useEffect(() => {
    fetch(route('currentUser')).then((response) => response.json()).then((data) => {
      setBlockCheckbox(data.data.user.landing_page_visited);
      setBlockConversion(data.data.user.landing_page_visited);
      setUser(data.data.user);
    });
  }, []);
  return (
    <div>
      <Page >
        <Ticker></Ticker>

        {
          user && user.version_update === 0 && (
            <div className="setting_banner" style={{ marginTop: "20px" }}>
              <Banner
                title={`Update Available 🚀`}
                tone="critical"
                onDismiss={() => { }}
              >
                <p>A new version is ready! Update now for the latest features and improvements.📢</p>
                <a style={{ textDecoration: "none" }} href="#">
                  <button
                    onClick={handleVersionUpdate}
                    style={{
                      cursor: 'pointer',
                      display: "flex", padding: "7px 10px",
                      marginTop: "20px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid #95c9b4", borderRadius: "4px"
                    }}>
                    <span style={{ marginLeft: "10px" }}>Update Now</span>
                  </button>
                </a>
              </Banner>
            </div>
          )
        }

      </Page>
      <Page title="Get Started" subtitle='Get started by following the instructions below'>
        <Card>
          <div style={{ padding: "15px" }}>
            <p style={{ marginBottom: "7px" }}>
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
                <div role='button' type="button" onClick={() => handleRedirect('videos-to-review')} ariaExpanded={open}
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
                    <Text variant='bodyMd' as='p'>2. Setup your instructions.</Text>
                    <Text variant='bodyMd' as='p'>3. Setup your emails.</Text>
                  </div>

                  <div className='polaris-black-btn-global' style={{ marginTop: "10px" }}>

                    <Button
                      primary
                      onClick={() => handleRedirect('settings')}
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
              <div>
                <div role='button' type="button" onClick={() => handleRedirect('videos-to-review')} ariaExpanded={open}
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
        <div className='my-3' style={{ marginTop: "10px", marginBottom: "10px" }}>
          <Text variant='bodyMd' as='h4' fontWeight='medium'>Frequently Asked Questions</Text>
        </div>
        <Card>

          <div style={{ padding: "15px" }}>
            {/* FAQ One */}
            <div
              className="flex gap-4"
              style={{ display: "flex", gap: "10px", cursor: "pointer" }}
            >
              <div
                style={{
                  width: "1%",
                  marginTop: '5px',

                  display: "inline-block",
                }}
              >
                <img
                  style={{
                    height: "12px",
                    display: "block",
                    transition: "transform 0.5s ease",
                    transform: faqOne ? "rotate(90deg)" : "rotate(0deg)", // Rotate when open
                  }}
                  src={RightIcon}
                  alt="Icon"
                />
              </div>
              <div style={{ width: "98%" }}>
                <div onClick={handleFAQOneToggle}>
                  <Text variant="bodyMd" as="h4" fontWeight="bold">
                    Why should I use GoodAuthentic?
                  </Text>
                </div>
                <Collapsible
                  open={faqOne}
                  id="basic-collapsible"
                  transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
                  expandOnPrint
                >
                  <div className="mt-2">
                    <Text variant="bodyMd" as="p">
                      GoodAuthentic helps brands collect UGC at higher quality and
                      higher quantity. Reward customers and engage with your
                      community at scale using GoodAuthentic for one-off contests or
                      run on autopilot. Customers that submit videos and try harder
                      for better rewards are more engaged and more likely to become
                      repeat customers. Better UGC videos make for better website
                      content and social media ads and posts.
                    </Text>
                  </div>
                </Collapsible>
              </div>
            </div>

            {/* FAQ Two */}
            <div
              className="flex gap-4"
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "12px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "1%",
                  marginTop: '5px',

                  display: "inline-block",
                }}
              >
                <img
                  style={{
                    height: "12px",
                    display: "block",
                    transition: "transform 0.5s ease",
                    transform: faqTwo ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                  src={RightIcon}
                  alt="Icon"
                />
              </div>
              <div style={{ width: "98%" }}>
                <div onClick={handleFAQTwoToggle}>
                  <Text variant="bodyMd" as="h4" fontWeight="bold">
                    What is GoodAuthentic?
                  </Text>
                </div>
                <Collapsible
                  open={faqTwo}
                  id="basic-collapsible"
                  transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
                  expandOnPrint
                >
                  <div className="mt-2">
                    <Text variant="bodyMd" as="p">
                      GoodAuthentic is a landing page that allows your customers to
                      upload a UGC video in exchange for a discount to a future
                      purchase. Submitted videos can receive higher or lower or no
                      rewards based on how you rate them. GoodAuthentic handles
                      everything from sending the UGC request to managing
                      submissions to sending discount rewards to customers.
                    </Text>
                  </div>
                </Collapsible>
              </div>
            </div>

            {/* FAQ Three */}
            <div
              className="flex gap-4"
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "12px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "1%",
                  marginTop: '5px',
                  display: "inline-block",
                }}
              >
                <img
                  style={{
                    height: "12px",
                    display: "block",
                    transition: "transform 0.5s ease",
                    transform: faqThree ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                  src={RightIcon}
                  alt="Icon"
                />
              </div>
              <div style={{ width: "98%" }}>
                <div onClick={handleFAQThreeToggle}>
                  <Text variant="bodyMd" as="h4" fontWeight="bold">
                    Help Center & Best Practices
                  </Text>
                </div>
                <Collapsible
                  open={faqThree}
                  id="basic-collapsible"
                  transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
                  expandOnPrint
                >
                  <div className="mt-2">
                    <Text variant="bodyMd" as="p">
                      Check out our video walkthroughs and best practices for how
                      other brands are getting high-quality UGC and engaging their
                      customers with GoodAuthentic:{" "}
                      <a href="https://goodauthentic.notion.site/Merchant-Guide-d8e3158efbd64a69a876b89d3778062">
                        Merchant Guide
                      </a>
                    </Text>
                  </div>
                </Collapsible>
              </div>
            </div>
          </div>
        </Card>

      </Page>
    </div>
  )
}

export default GetStarted
