import { Page, Grid, Card, Text, Button, Banner, ProgressBar, Icon, TextField, Popover, DatePicker } from '@shopify/polaris';
import { useEffect, useState, useCallback } from 'react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmailLogo from "./imges/emailLogo.png";
import WaitingLogo from "./imges/WaitingLogo.png";
import ApprovedLogo from "./imges/ApprovedLogo.png"
import WaitingIcon from "./imges/waiting2.png";
import VideoTumbnail from "./imges/bureau 11.png";
import { CircleCancelMajor, CircleTickMajor } from '@shopify/polaris-icons';
import downloadIcon from "./imges/downloadIcon.png";

function ApprovedVideos() {


    return (
        <Page >
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                    <Card>
                        <Card.Section >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "-10px", marginBottom: "-10px" }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <img src={WaitingIcon} width="20px" height="20px" style={{ marginRight: "10px" }}></img>
                                    <Text variant="headingLg" as="h5">
                                        Approved Videos
                                    </Text>
                                </div>
                            </div>
                        </Card.Section>
                        <Card.Section>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div style={{ textAlign: "center" }}>
                                        <img src={VideoTumbnail} width="100%"></img>
                                        <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div style={{ textAlign: "center" }}>
                                        <img src={VideoTumbnail} width="100%"></img>
                                        <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div style={{ textAlign: "center" }}>
                                        <img src={VideoTumbnail} width="100%"></img>
                                        <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div style={{ textAlign: "center" }}>
                                        <img src={VideoTumbnail} width="100%"></img>
                                        <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div style={{ textAlign: "center" }}>
                                        <img src={VideoTumbnail} width="100%"></img>
                                        <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div style={{ textAlign: "center" }}>
                                        <img src={VideoTumbnail} width="100%"></img>
                                        <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div style={{ textAlign: "center" }}>
                                        <img src={VideoTumbnail} width="100%"></img>
                                        <button style={{background: "#FFFFFF", border: "1px solid #E1E3E5",borderRadius:"9px",padding: "5px 15px",fontWeight: "500",fontSize: "15px",marginTop:"10px"}}><img src={downloadIcon}></img> Download</button>
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                    <div style={{ textAlign: "center" }}>
                                        <img src={VideoTumbnail} width="100%"></img>
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

export default ApprovedVideos;
