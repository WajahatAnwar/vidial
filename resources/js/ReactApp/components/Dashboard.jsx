import {
    Page,
    Grid,
    Card,
    Text,
    Button,
    Banner,
    ProgressBar,
    Icon,
    TextField,
    Popover,
    DatePicker,
} from "@shopify/polaris";
import { useEffect, useState, useCallback } from "react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmailLogo from "./imges/emailLogo.png";
import WaitingLogo from "./imges/WaitingLogo.png";
import ApprovedLogo from "./imges/ApprovedLogo.png";
import WaitingIcon from "./imges/waiting2.png";
import VideoTumbnail from "./imges/bureau 11.png";
import { CircleCancelMajor, CircleTickMajor } from "@shopify/polaris-icons";
import downloadIcon from "./imges/downloadIcon.png";

function Dashboard() {
    const [pendingVideos, setPendingVideos] = useState([]);
    const [approvedVideos, setApprovedVideos] = useState([]);
    /********  get Settings Data  ******/
    useEffect(() => {
        fetch("/getDashboardContent")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    setPendingVideos(data.data.pendingVideos);
                    setApprovedVideos(data.data.approvedVideos);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const navigate = useNavigate();

    return (
        <Page>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                    <Text variant="headingXl" as="h4">
                        Welcome to Vidial 👋
                    </Text>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                    <Card sectioned>
                        <div style={{ display: "flex" }}>
                            <img src={EmailLogo}></img>
                            <div style={{ marginLeft: "10px" }}>
                                <Text variant="headingXl" as="h4">
                                    200
                                </Text>
                                <p style={{ fontWeight: "600" }}>Emails Sent</p>
                            </div>
                        </div>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                    <Card sectioned>
                        <div style={{ display: "flex" }}>
                            <img src={WaitingLogo}></img>
                            <div style={{ marginLeft: "10px" }}>
                                <Text variant="headingXl" as="h4">
                                    8
                                </Text>
                                <p style={{ fontWeight: "600" }}>
                                    Waiting Videos
                                </p>
                            </div>
                        </div>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                    <Card sectioned>
                        <div style={{ display: "flex" }}>
                            <img src={ApprovedLogo}></img>
                            <div style={{ marginLeft: "10px" }}>
                                <Text variant="headingXl" as="h4">
                                    5
                                </Text>
                                <p style={{ fontWeight: "600" }}>
                                    Approved Videos
                                </p>
                            </div>
                        </div>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                    <Card>
                        <Card.Section>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginTop: "-10px",
                                    marginBottom: "-10px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <img
                                        src={WaitingIcon}
                                        width="20px"
                                        height="20px"
                                        style={{ marginRight: "10px" }}
                                    ></img>
                                    <Text variant="headingLg" as="h5">
                                        Waiting Videos
                                    </Text>
                                </div>
                                <Button
                                    size="slim"
                                    onClick={() => {
                                        navigate("/videos-to-review");
                                    }}
                                >
                                    See All
                                </Button>
                            </div>
                        </Card.Section>
                        <Card.Section>
                            <Grid>
                                {pendingVideos &&
                                    pendingVideos.map((video) => {
                                        return (
                                            <Grid.Cell
                                                columnSpan={{
                                                    xs: 3,
                                                    sm: 3,
                                                    md: 3,
                                                    lg: 3,
                                                    xl: 3,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {/* <img src={VideoTumbnail} width= "100%"></img> */}
                                                    <video
                                                        width="216"
                                                        height="386"
                                                        controls
                                                    >
                                                        <source
                                                            src={
                                                                video.video_link
                                                            }
                                                            type="video/mp4"
                                                        />
                                                        Your browser does not
                                                        support the video tag.
                                                    </video>
                                                    <div
                                                        style={{
                                                            border: "1px solid #dddd",
                                                            padding: "6px 12px",
                                                            borderRadius: "9px",
                                                            width: "86px",
                                                            margin: "auto",
                                                            marginTop: "10px",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    marginRight:
                                                                        "20px",
                                                                }}
                                                            >
                                                                <Icon
                                                                    source={
                                                                        CircleTickMajor
                                                                    }
                                                                    color="primary"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Icon
                                                                    source={
                                                                        CircleCancelMajor
                                                                    }
                                                                    color="critical"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Grid.Cell>
                                        );
                                    })}
                            </Grid>
                        </Card.Section>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                    <Card>
                        <Card.Section>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginTop: "-10px",
                                    marginBottom: "-10px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <img
                                        src={WaitingIcon}
                                        width="20px"
                                        height="20px"
                                        style={{ marginRight: "10px" }}
                                    ></img>
                                    <Text variant="headingLg" as="h5">
                                        Approved Videos
                                    </Text>
                                </div>
                                <Button
                                    size="slim"
                                    onClick={() => {
                                        navigate("/approved-videos");
                                    }}
                                >
                                    See All
                                </Button>
                            </div>
                        </Card.Section>
                        <Card.Section>
                            <Grid>
                                {approvedVideos &&
                                    approvedVideos.map((video) => {
                                        return (
                                            <Grid.Cell
                                                columnSpan={{
                                                    xs: 3,
                                                    sm: 3,
                                                    md: 3,
                                                    lg: 3,
                                                    xl: 3,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <video
                                                        width="216"
                                                        height="386"
                                                        controls
                                                    >
                                                        <source
                                                            src={
                                                                video.video_link
                                                            }
                                                            type="video/mp4"
                                                        />
                                                        Your browser does not
                                                        support the video tag.
                                                    </video>{" "}
                                                    <button
                                                        style={{
                                                            background:
                                                                "#FFFFFF",
                                                            border: "1px solid #E1E3E5",
                                                            borderRadius: "9px",
                                                            padding: "5px 15px",
                                                            fontWeight: "500",
                                                            fontSize: "15px",
                                                            marginTop: "10px",
                                                        }}
                                                    >
                                                        <img
                                                            src={downloadIcon}
                                                        ></img>{" "}
                                                        Download
                                                    </button>
                                                </div>
                                            </Grid.Cell>
                                        );
                                    })}
                            </Grid>
                        </Card.Section>
                    </Card>
                </Grid.Cell>
            </Grid>
        </Page>
    );
}
export default Dashboard;
