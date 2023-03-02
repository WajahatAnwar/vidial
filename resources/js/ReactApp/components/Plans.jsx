import {Page, Grid, Card, Text, Button, Banner, ProgressBar, Icon, TextField, Popover, DatePicker, Badge, Link} from '@shopify/polaris';
import {useEffect, useState,useCallback} from 'react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Person from "./imges/connard 1.png";
import { get } from 'lodash';


function Plans() {

    const [plan,setPlan] = useState([]);
    const [users, setUser] = useState([]);
     useEffect(()=>{

        fetch('/get_plans')
        .then(response => {
          if (!response.ok) {
            throw new Error('Something went wrong');
          }
          return response.json();
        })
        .then(data => {
            if(data.success){
                // console.log(data.users);
                setPlan(data.data)
                setUser(data.users)
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
        .catch(error => {
            console.log(error.message());
        });


     },[]);

     console.log(plan);
    console.log(users);
    const navigate = useNavigate();

    function handlechangeplan(name,plan_id) {

        fetch()
        .then(response => {
          if (!response.ok) {
            throw new Error('Something went wrong');
          }
          return response.json();
        })
        .then(data => {
          if(data.success){
            toggleActive();

          }
        })
        .catch(error => {
            console.log(error);
        });
    }

    return (
        <Page >

                        <div style={{textAlign:"center",marginBottom:"20px"}}>
                        <Text variant="headingXl" as="h4">
                            Choose the perfect plan for your team’s needs
                        </Text>
                        </div>

                        <Card sectioned>
                           <Grid>
                                <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 3, xl: 3}}>
                                    <img src={Person}></img>

                                    <div style={{paddingLeft:"20px"}}>
                                    <div style={{marginBottom:"15px",marginTop:"55px"}}>
                                    <Text variant="headingLg" as="h5">
                                        Features
                                    </Text>
                                    </div>
                                    <p style={{marginBottom:"8px",fontSize:"11px"}}>Videos Capacity</p>
                                    <p style={{marginBottom:"8px",fontSize:"11px"}}>Emails Capacity</p>
                                    <p style={{fontSize:"11px"}}>Storage Duration</p>
                                    </div>
                                </Grid.Cell>
                                {plan.map((data) =><Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 3, xl: 3}}>
                                    <div style={{    border: "1px solid #C9CCCF",padding: "10px",borderRadius: "10px"}}>

                                        {/* @if($data.name == "Premium") */}
                                        <div style={{     textAlign: "end",marginTop: "-20px" }}>
                                            <Badge status="attention">Recommended</Badge>
                                        </div>
                                        {/* @endif */}
                                        <Text variant="headingXl" as="h4">
                                        {data.name}
                                        </Text>
                                        <p style={{marginBottom:"30px",marginTop:"10px"}}>   {data.description}</p>
                                        <Text variant="headingXl" as="h4" color="success">
                                            {data.price}
                                        </Text>
                                        <Text variant="bodySm" as="p" color="subdued">
                                            per {data.type}
                                        </Text>
                                        <div style={{marginTop:"20px",marginBottom:"33px"}}>
                                       {
                                            data.id == users.plan_id ?
                                            <Button  disabled fullWidth>Select plan</Button> :
                                            <a href={`/billing/${data.id}${location.search}`}>Select plan</a>
                                       }
                                        </div>
                                        <p style={{marginBottom:"8px",textAlign:"center",fontSize:"11px",fontWeight:"bold"}}>Maximum of {data.ugc_video_count} monthly UGC videos</p>
                                        <p style={{marginBottom:"8px",textAlign:"center",fontSize:"11px",fontWeight:"bold"}}>Maximum of {data.ugc_email_count} post-purchase emails</p>
                                        <p style={{marginBottom:"30px",textAlign:"center",fontSize:"11px",fontWeight:"bold"}}>1 year video storage</p>
                                    </div>
                                </Grid.Cell>

                                )}
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
export default Plans;
