
// import { Layout, Page, Card } from "@shopify/polaris";
// import { TitleBar } from "@shopify/app-bridge-react";
// import { PlanCardStack, PlanCardType } from "@heymantle/polaris";
// import { useMantle } from "@heymantle/react";
// import AppLayout from '../MyApplication/AppLayout';

//  function Plans() {
//   const { customer, plans, subscribe } = useMantle();
//   const handleSelectPlan = async ({ plan, discount }) => {

//     try {
//       const data = {
//         planId: plan?.id,
//         discountId: discount?.id,
//         returnUrl: "/pricing",
//         ...(plan?.customFields?.test && { billingProvider: "test" }),
//       };
  
//       console.log(data);
      
  
//       const subscription = await subscribe(data);
//       const url = subscription.confirmationUrl;
//       open(url, "_top");
    
//       if (subscription.confirmationUrl) {
//         console.log(subscription.confirmationUrl);
//       } else {
//         console.error("Confirmation URL is not available.");
//       }
//     } catch (error) {
//       console.error("Error during subscription:", error);
//     }
//   };

//   return (
//     <Page>
//       <TitleBar title="Select a plan" />
//         <Card>
//       <div className="paln-main-wrapper">
//       <Layout>
//         <Layout.Section>
//           {/*  */}
          
//           <PlanCardStack
//             cardType={PlanCardType.Highlighted}
//             customer={customer}
//             plans={plans}
//             onSelectPlan={handleSelectPlan}
//           />
//         </Layout.Section>
//       </Layout>
//       </div>
//       </Card>
//     </Page>
//   );
// }
// export default Plans;









import AppLayout from '../MyApplication/AppLayout';

import { usePage } from "@inertiajs/react";
import {
    Badge,
    Button,
    Card,
    Grid,
    Page,
    Text
} from "@shopify/polaris";
import { useEffect, useState } from "react";

function Plans() {

    const [plan, setPlan] = useState([]);
    const [users, setUser] = useState([]);
    useEffect(() => {
        fetch(route('get_plans'))
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {

                    // console.log(data.users);
                    setPlan(data.data);
                    setUser(data.users);
                    // setPriceValue(data.data.store_credit);
                    // setLandingPage(data.data.page_display_to_customers);
                    // setEmailSentToValue(data.data.email_sent_to_customer);
                    // setLandingPageDisplayedValue(data.data.page_link);
                    // setRows(data.data.instructions);
                    // setLogoImage(data.data.logo);
                    // setVideo(data.data.video);
                    // setStore(data.data.store);
                }
            })
            .catch((error) => {
                console.log(error.message());
            });
    }, []);

    function handlechangeplan(name, plan_id) {
        fetch()
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    toggleActive();
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <Page>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <Text variant="headingXl" as="h4">
                    Choose the perfect plan
                </Text>

                <div style={{ marginTop: "10px" }}></div>

                {/* <Text variant="headingXs" as="h6">
                    Integrations and more service available
                </Text> */}


            </div>

            <Card sectioned>
                <Grid>
                    {/* <Grid.Cell
                        columnSpan={{ xs: 6, sm: 6, md: 6, lg: 3, xl: 3 }}
                    >
                        <img style={{ width: "90%" }} src={Person}></img>

                        <div>
                            <div
                                style={{
                                    marginBottom: "15px",
                                    marginTop: "74px",
                                }}
                            >
                                <div style={{ marginLeft: "15px" }}>
                                    <Text variant="headingLg" as="h5">
                                        Features
                                    </Text>
                                </div>
                            </div>
                            <p
                                style={{
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                    background: "#F9F9F9B2",
                                    padding: "5px 15px",
                                }}
                            >
                                Videos Capacity
                            </p>
                            <p
                                style={{
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                    padding: "5px 15px",
                                }}
                            >
                                Emails Capacity
                            </p>
                            <p
                                style={{
                                    fontSize: "14px",
                                    background: "#F9F9F9B2",
                                    padding: "5px 15px",
                                }}
                            >
                                Storage Duration
                            </p>
                        </div>
                    </Grid.Cell> */}



                    {plan.map((data) => (





                        <Grid.Cell
                            columnSpan={{ xs: 6, sm: 6, md: 6, lg: 3, xl: 3 }}

                        >
                            <div
                                style={{
                                    border: "1px solid #C9CCCF",
                                    padding: "10px",
                                    borderRadius: "10px",
                                    height: "520px",
                                    minHeight: "520px",
                                    minWidth:"350px"
                                }}
                            >
                                {/* @if($data.name == "Premium") */}
                                <div
                                    style={{
                                        textAlign: "end",
                                        marginTop: "-20px",
                                    }}
                                >
                                    {data.id == 5 ? (
                                        <Badge status="attention">
                                            Recommended
                                        </Badge>
                                    ) : (
                                        <div className="customHidden">
                                            <Badge>Recommended</Badge>
                                        </div>
                                    )}
                                </div>
                                {/* @endif */}
                                <Text variant="headingLg" as="h5">
                                    {data.name}
                                </Text>
                                <p
                                    style={{
                                        marginBottom: "30px",
                                        marginTop: "10px",
                                        height: "100px",
                                    }}
                                >
                                    {data.description}
                                </p>
                                <Text
                                    variant="headingXl"
                                    as="h4"
                                    color=""
                                >
                                    ${Math.floor(data.price)}
                                </Text>
                                <Text variant="bodySm" as="p">
                                    per month
                                </Text>
                                <div
                                    style={{
                                        marginTop: "20px",
                                        marginBottom: "33px",
                                    }}
                                >
                                    {data.id == users.plan_id ? (
                                        <Button disabled fullWidth>
                                            Selected Plan
                                        </Button>
                                    ) : (
                                        <span className="polaris-black-btn-global">
                                            <a
                                                href={`/billing/${data.id}${location.search}`}
                                                style={{ textDecoration: "none" }}
                                                className=""
                                            >
                                                <Button fullWidth>


                                                    Select plan
                                                </Button>
                                            </a>
                                        </span>
                                    )}
                                </div>
                                <p
                                    style={{
                                        marginBottom: "8px",
                                        textAlign: "center",
                                        fontSize: "14px",
                                        padding: "0px 5px",
                                    }}
                                >
                                    {data.name == 'Free' ? '' : data.name == 'Standard' ? 'Everything in Free' : data.name == 'Premium' ? 'Everything in Standard' : 'Everything in Premium'}

                                </p>
                                <p
                                    style={{
                                        marginBottom: "8px",
                                        textAlign: "center",
                                        fontSize: "14px",
                                        padding: "0px 5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            lineHeight: '2.4em',
                                            background: "#F9F9F9B2",
                                        }}
                                    >   {
                                            // data.ugc_video_count == 500000 ? 'Unlimited monthly UGC videos' : `${data.ugc_video_count} monthly UGC videos`
                                            data.name == 'Free' ? '' : 'Unlimited Emails'
                                        }
                                    </div>
                                </p>
                                <p>
                                    <div
                                        style={{
                                            marginBottom: "8px",
                                            textAlign: "center",
                                            fontSize: "14px",
                                            padding: "0px 5px",
                                        }}
                                    >
                                        {
                                            data.name == 'Free' ? '1  video monthly' : 'Unlimited Videos'
                                        }
                                    </div>
                                </p>
                                <p>
                                    <div
                                        style={{
                                            marginBottom: "0px",
                                            textAlign: "center",
                                            fontSize: "14px",
                                            padding: "5px 0",
                                        }}
                                    >
                                        {
                                            data.name == 'Free' ? 'Full Access' : ''
                                        }
                                    </div>
                                </p>
                                <p
                                    style={{
                                        marginBottom: "8px",
                                        textAlign: "center",
                                        fontSize: "14px",

                                        padding: "0px 5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            background: "#F9F9F9B2", 
                                        }}
                                    >
                                        {
                                            (data.name == 'Free') || (data.name == 'Standard') ? '' : 'Klaviyo Integration'
                                        }
                                    </div>
                                </p>
                                <p
                                    style={{
                                        marginBottom: "30px",
                                        textAlign: "center",
                                        fontSize: "14px",

                                        padding: "5px 0px",
                                    }}
                                >
                                    <div
                                        style={{
                                            background: "#F9F9F9B2", 
                                        }}
                                    >
                                        {
                                            (data.name == 'Free') || (data.name == 'Standard')  || (data.name == 'Premium') ? '' : 'Managed Services'
                                        }
                                    </div>
                                </p>
                                
                            </div>
                        </Grid.Cell>



                    ))}


                    {/*  */}



                    {/* <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 3, xl: 3}}>
                                    <div style={{    border: "1px solid #C9CCCF",padding: "10px",borderRadius: "10px"}}>
                                        <Text variant="headingXl" as="h4">
                                        Premium
                                        </Text>
                                        <p style={{marginBottom:"30px",marginTop:"10px"}}>For medium brands who wants to collect fews videos UGC for their Ads, Reviews & Social Networks.</p>
                                        <Text variant="headingXl" as="h4" color="success">
                                            $99.99
                                        </Text>
                                        <Text variant="bodySm" as="p" color="subdued">
                                            per month
                                        </Text>
                                        <div style={{marginTop:"20px",marginBottom:"33px"}}>
                                            <Button primary fullWidth>Select plan</Button>
                                        </div>
                                        <p style={{marginBottom:"8px",textAlign:"center",fontSize:"11px",fontWeight:"bold"}}>Up to 50 monthly UGC videos</p>
                                        <p style={{marginBottom:"8px",textAlign:"center",fontSize:"11px",fontWeight:"bold"}}>Up to 10,000 post-purchase emails</p>
                                        <p style={{marginBottom:"30px",textAlign:"center",fontSize:"11px",fontWeight:"bold"}}>1 year video storage</p>
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 3, xl: 3}}>
                                    <div style={{    border: "1px solid #C9CCCF",padding: "10px",borderRadius: "10px"}}>
                                        <Text variant="headingXl" as="h4">
                                            Advanced
                                        </Text>
                                        <p style={{marginBottom:"30px",marginTop:"10px"}}>For bigs brands and Shopify Plus who wants to collect fews videos UGC for their Ads, Reviews & Social Networks.</p>
                                        <Text variant="headingXl" as="h4" color="success">
                                            $299.99
                                        </Text>
                                        <Text variant="bodySm" as="p" color="subdued">
                                            per month
                                        </Text>
                                        <div style={{marginTop:"20px",marginBottom:"33px"}}>
                                            <Button primary fullWidth>Select plan</Button>
                                        </div>
                                        <p style={{marginBottom:"8px",textAlign:"center",fontSize:"11px",fontWeight:"bold"}}>Up to 200 monthly UGC videos</p>
                                        <p style={{marginBottom:"8px",textAlign:"center",fontSize:"11px",fontWeight:"bold"}}>Up to 50,000 post-purchase emails</p>
                                        <p style={{marginBottom:"30px",textAlign:"center",fontSize:"11px",fontWeight:"bold"}}>1 year video storage</p>
                                    </div>
                                </Grid.Cell> */}
                </Grid>
            </Card>
        </Page>
    );
}
Plans.layout = page => <AppLayout children={page} />
export default Plans;
