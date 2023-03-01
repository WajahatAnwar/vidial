import {Page, Grid, Card, Text, Button, Banner, ProgressBar, Icon, TextField, Popover, DatePicker} from '@shopify/polaris';
import {useEffect, useState,useCallback} from 'react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmailLogo from "./imges/emailLogo.png";
import WaitingLogo from "./imges/WaitingLogo.png";
import  ApprovedLogo from "./imges/ApprovedLogo.png"
import WaitingIcon from "./imges/waiting2.png";
import VideoTumbnail from "./imges/bureau 11.png";
import { CircleCancelMajor, CircleTickMajor } from '@shopify/polaris-icons';
import downloadIcon from "./imges/downloadIcon.png";






function Dashboard() {








    const navigate = useNavigate();


    return (
        <Page >
                    <Grid>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 12, xl: 12}}>
                        <Text variant="headingXl" as="h4">
                            Welcome to Vidial 👋
                        </Text>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 4, lg: 4, xl: 4}}>
                        <Card  sectioned>
                            <div style={{display:"flex",}}>
                                <img src={EmailLogo}></img>
                                <div style={{marginLeft:"10px"}}>
                                    <Text variant="headingXl" as="h4">
                                        200
                                    </Text>
                                    <p style={{fontWeight:"600"}}>Emails Sent</p>
                                </div>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 4, lg: 4, xl: 4}}>
                        <Card  sectioned>
                            <div style={{display:"flex",}}>
                                <img src={WaitingLogo}></img>
                                <div style={{marginLeft:"10px"}}>
                                    <Text variant="headingXl" as="h4">
                                        8
                                    </Text>
                                    <p style={{fontWeight:"600"}}>Waiting Videos</p>
                                </div>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 4, lg: 4, xl: 4}}>
                        <Card  sectioned>
                            <div style={{display:"flex",}}>
                                <img src={ApprovedLogo}></img>
                                <div style={{marginLeft:"10px"}}>
                                    <Text variant="headingXl" as="h4">
                                        5
                                    </Text>
                                    <p style={{fontWeight:"600"}}>Approved Videos</p>
                                </div>
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 12, xl: 12}}>
                        <Card>
                            <Card.Section >
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"-10px",marginBottom:"-10px"}}>
                                    <div style={{display:"flex",alignItems:"center"}}>
                                        <img src={WaitingIcon} width="20px" height="20px" style={{marginRight:"10px"}}></img>
                                        <Text variant="headingLg" as="h5">
                                            Waiting Videos
                                        </Text>
                                    </div>
                                    <Button size="slim" onClick={()=>{navigate("/videos-to-review")}}>See All</Button>
                                </div>
                            </Card.Section>
                            <Card.Section>
                                <Grid>
                                    <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                                        <div style={{textAlign:"center"}}>
                                            {/* <img src={VideoTumbnail} width= "100%"></img> */}
                                            <video width="216" height="386" controls>
    <source src="https://uc551604e4eb007c970dff6e3c45.dl.dropboxusercontent.com/cd/0/get/B3H_crFjtwp4AEJVP5il6ofzl66OnNvJsMigGGPKq_tSS5Y5K_w_MvtFRyi86fLwIR8W9xAs2pUZSjn_LX-I40j9kFed1BSziqNScwo8QjuQQ5q5zGul-9q_r6runpmqsQxJ2qHewAkp7k7UH7h9knO9KSj3HkMn6SGC7bGNw5rVZjzCtNOH9tyVvAozuaM1o3M/file" type="video/mp4"/>
  Your browser does not support the video tag.
   </video>
                                                <div style={{border:"1px solid #dddd",padding:"6px 12px",borderRadius:"9px",width:"86px",margin:"auto",marginTop:"10px"}}>
                                                <div style={{display:"flex"}}>
                                                    <div style={{marginRight:"20px"}}>
                                                    <Icon
                                                        source={CircleTickMajor}
                                                        color="primary"
                                                        />
                                                    </div>
                                                <div>
                                                <Icon
                                                    source={CircleCancelMajor}
                                                    color="critical"
                                                    />
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                                        <div style={{textAlign:"center"}}>
                                            <img src={VideoTumbnail} width= "100%"></img>
                                                <div style={{border:"1px solid #dddd",padding:"6px 12px",borderRadius:"9px",width:"86px",margin:"auto",marginTop:"10px"}}>
                                                <div style={{display:"flex"}}>
                                                    <div style={{marginRight:"20px"}}>
                                                    <Icon
                                                        source={CircleTickMajor}
                                                        color="primary"
                                                        />
                                                    </div>
                                                <div>
                                                <Icon
                                                    source={CircleCancelMajor}
                                                    color="critical"
                                                    />
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                                        <div style={{textAlign:"center"}}>
                                            <img src={VideoTumbnail} width= "100%"></img>
                                                <div style={{border:"1px solid #dddd",padding:"6px 12px",borderRadius:"9px",width:"86px",margin:"auto",marginTop:"10px"}}>
                                                <div style={{display:"flex"}}>
                                                    <div style={{marginRight:"20px"}}>
                                                    <Icon
                                                        source={CircleTickMajor}
                                                        color="primary"
                                                        />
                                                    </div>
                                                <div>
                                                <Icon
                                                    source={CircleCancelMajor}
                                                    color="critical"
                                                    />
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                                        <div style={{textAlign:"center"}}>
                                            <img src={VideoTumbnail} width= "100%"></img>
                                                <div style={{border:"1px solid #dddd",padding:"6px 12px",borderRadius:"9px",width:"86px",margin:"auto",marginTop:"10px"}}>
                                                <div style={{display:"flex"}}>
                                                    <div style={{marginRight:"20px"}}>
                                                    <Icon
                                                        source={CircleTickMajor}
                                                        color="primary"
                                                        />
                                                    </div>
                                                <div>
                                                <Icon
                                                    source={CircleCancelMajor}
                                                    color="critical"
                                                    />
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                    </Grid.Cell>
                                </Grid>
                            </Card.Section>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 12, xl: 12}}>
                        <Card>
                            <Card.Section >
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"-10px",marginBottom:"-10px"}}>
                                    <div style={{display:"flex",alignItems:"center"}}>
                                        <img src={WaitingIcon} width="20px" height="20px" style={{marginRight:"10px"}}></img>
                                        <Text variant="headingLg" as="h5">
                                            Approved Videos
                                        </Text>
                                    </div>
                                    <Button size="slim" onClick={()=>{navigate("/approved-videos")}}>See All</Button>
                                </div>
                            </Card.Section>
                            <Card.Section>
                                <Grid>
                                    <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                                        <div style={{textAlign:"center"}}>
                                            <img src={VideoTumbnail} width= "100%"></img>
                                                <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                            </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                                        <div style={{textAlign:"center"}}>
                                            <img src={VideoTumbnail} width= "100%"></img>
                                                <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                            </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                                        <div style={{textAlign:"center"}}>
                                            <img src={VideoTumbnail} width= "100%"></img>
                                                <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                            </div>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                                        <div style={{textAlign:"center"}}>
                                            <img src={VideoTumbnail} width= "100%"></img>
                                                <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                            </div>
                                    </Grid.Cell>
                                </Grid>
                            </Card.Section>
                        </Card>
                    </Grid.Cell>
                    </Grid>
        </Page>
    );
}
export default Dashboard;
