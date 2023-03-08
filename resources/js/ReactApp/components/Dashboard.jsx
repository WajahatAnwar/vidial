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
    Modal,
    ButtonGroup,
} from "@shopify/polaris";
import { useEffect, useState, useCallback } from "react";
import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import EmailLogo from "./imges/emailLogo.png";
import WaitingLogo from "./imges/WaitingLogo.png";
import ApprovedLogo from "./imges/ApprovedLogo.png";
import WaitingIcon from "./imges/waiting2.png";
import VideoTumbnail from "./imges/bureau 11.png";
import { CircleCancelMajor, CircleTickMajor, PlayCircleMajor } from "@shopify/polaris-icons";
import downloadIcon from "./imges/downloadIcon.png";
import noVedio from "./imges/film.png"
import { downloadVideo } from "./utils";

function Dashboard() {
    const [activeRejectionModel, setActiveRejectionModel] = useState(false);
    const handleChangeRejectionModel = useCallback(() => setActiveRejectionModel(!activeRejectionModel), [activeRejectionModel]);
    // const activatorRejectionModel = <Button onClick={handleChangeRejectionModel}>Open</Button>;

    const [rejectionReason, setRejectionReason] = useState('');
    const handleRejectionReason = useCallback((newValue) => setRejectionReason(newValue), []);

    const [activeRejectionConfirmModel, setActiveRejectionConfirmModel] = useState(false);
    const handleChangeRejectionConfirmModel = useCallback(() => setActiveRejectionConfirmModel(!activeRejectionConfirmModel), [activeRejectionConfirmModel]);
    // const activatorRejectionConfirmModel = <Button onClick={handleChangeRejectionConfirmModel}>Open</Button>;

    const [activeRejectionSuccessModel, setActiveRejectionSuccessModel] = useState(false);
    const handleChangeRejectionSuccessModel = useCallback(() => setActiveRejectionSuccessModel(!activeRejectionSuccessModel), [activeRejectionSuccessModel]);
    // const activatorRejectionSuccessModel = <Button onClick={handleChangeRejectionSuccessModel}>Open</Button>;


    const [activeApprovedConfirmModel, setActiveApprovedConfirmModel] = useState(true);
    const handleChangeApprovedConfirmModel = useCallback(() => setActiveApprovedConfirmModel(!activeApprovedConfirmModel), [activeApprovedConfirmModel]);
    // const activatorApprovedConfirmModel = <Button onClick={handleChangeApprovedConfirmModel}>Open</Button>;

    const [activeApprovedSuccessModel, setActiveApprovedSuccessModel] = useState(false);
    const handleChangeApprovedSuccessModel = useCallback(() => setActiveApprovedSuccessModel(!activeApprovedSuccessModel), [activeApprovedSuccessModel]);
    // const activatorApprovedSuccessModel = <Button onClick={handleChangeApprovedSuccessModel}>Open</Button>;


    const [pendingVideos, setPendingVideos] = useState([]);
    const [approvedVideos, setApprovedVideos] = useState([]);
    const [approvedVideosCount, setApprovedVideosCount] = useState(0);
    const [pendingVideosCount, setPendingVideosCount] = useState(0);
    const [userEmail,setUserEmail] = useState(0);
    const [reload,setReload]=useState(false);
    const [rejectVideoId,setRejectVideoId] = useState(false);

      
    /******** Operation on Videos  ******/
const videoOperation = (id) => {
    const status = "Approved";
    const confirmed = confirm(`Are you sure you want to ${status}?`);
    var formData = new FormData();
    formData.append("video_id", id);
    if (confirmed) {
        fetch("/videoOperation", {
            method: "post",
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {

                    alert(
                        "Congratulation video has been approved code :" +
                            data.data.code
                    );
                } else {
                    alert(
                        data.message
                    );
                }
                setReload(true);
                return;
            })
            .catch((error) => {
                console.log(error);
            });
    }
};
/******** Reject Video Handle   ******/
const handleRejectVideo = ()=>{

    if(rejectionReason && rejectVideoId){
        var formData = new FormData();
        formData.append("reason", rejectionReason);
        formData.append("video_id", rejectVideoId);
    fetch("/rejectVideo", {
        method: "post",
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Something went wrong");
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
              console.log(data.message)
            } else {
                console.log(data.message)
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }
}

/**** Reject video ***/
const rejectVideo = (id) => {
    var formData = new FormData();
    setRejectVideoId(id)
    setActiveRejectionModel(true);
   return;
    
};
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
                    setApprovedVideosCount(data.data.approvedVideosCount);
                    setPendingVideosCount(data.data.pendingVideosCount);
                    setUserEmail(data.data.user.ugc_email_count - data.data.user.remaining_email)
                }
            })
            .catch((error) => {
                console.log(error);
            });
    },[reload]);

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
                                    {userEmail}
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
                                    {pendingVideosCount}
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
                                    {approvedVideosCount}
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
                                    Videos to Review
                                    </Text>
                                </div>
                                {pendingVideosCount <= 0 ? (
                                    ""
                                ) : (
                                    <Button
                                        size="slim"
                                        onClick={() => {
                                            navigate("/videos-to-review");
                                        }}
                                    >
                                        See All
                                    </Button>
                                )}
                            </div>
                        </Card.Section>
                        {pendingVideosCount <= 0 ? (
                                    <div style={{height:"400px",background:"#f9f9f9",borderRadius:"6px",textAlign:"center",paddingTop:"125px"}}>
                                        <img style={{height: "102px",opacity: ".5"}} src={noVedio}></img>

                                        <p style={{color: "#d3c9c9",fontSize:"17px"}}>No Videos to Review</p>

                                  </div>
                                ) :
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
                                                    <p
                                                        style={{
                                                            fontSize: "12px",
                                                            color: "#797979",
                                                            marginTop: "10px",
                                                        }}
                                                    >
                                                        {video.email}
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: "12px",
                                                            color: "#797979",
                                                        }}
                                                    >
                                                        {video.created_at}
                                                    </p>
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
                                                                onClick={() => {
                                                                    videoOperation(
                                                                        video.id
                                                                        
                                                                    );
                                                                }}
                                                            >
                                                                <Link to="#">
                                                                    <Icon
                                                                        source={
                                                                            CircleTickMajor
                                                                        }
                                                                        color="primary"
                                                                    />
                                                                </Link>
                                                            </div>
                                                            <div>
                                                                <Link
                                                                    to="#"
                                                                    onClick={() => {
                                                                        rejectVideo(
                                                                            video.id,
                                                                            
                                                                        );
                                                                    }}
                                                                >
                                                                    <Icon
                                                                        source={
                                                                            CircleCancelMajor
                                                                        }
                                                                        color="critical"
                                                                    />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Grid.Cell>
                                        );
                                    })}
                            </Grid>
                        </Card.Section>
                                }

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
                                {approvedVideosCount <= 0 ? (
                                    ""
                                ) : (
                                    <Button
                                        size="slim"
                                        onClick={() => {
                                            navigate("/approved-videos");
                                        }}
                                    >
                                        See All
                                    </Button>
                                )}
                            </div>
                        </Card.Section>
                        {approvedVideosCount <= 0 ? (
                                    <div style={{height:"400px",background:"#f9f9f9",borderRadius:"6px",textAlign:"center",paddingTop:"125px"}}>
                                    <img style={{height: "102px",opacity: ".5"}} src={noVedio}></img>

                                    <p style={{color: "#d3c9c9",fontSize:"17px"}}>No Approved Videos</p>

                              </div>
                                ) : <Card.Section>
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
                                                        <p
                                                        style={{
                                                            fontSize: "12px",
                                                            color: "#797979",
                                                            marginTop: "10px",
                                                        }}
                                                    >
                                                        Approved {video.updated_at}

                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: "12px",
                                                            color: "#797979",
                                                        }}
                                                    >
                                                       Sent by {video.email}
                                                    </p>
                                                        <button
                                                            onClick={() => {
                                                                downloadVideo(
                                                                    video.video_link
                                                                );
                                                            }}
                                                            style={{
                                                                background:
                                                                    "#FFFFFF",
                                                                border: "1px solid #E1E3E5",
                                                                borderRadius: "9px",
                                                                padding: "5px 15px",
                                                                fontWeight: "500",
                                                                fontSize: "15px",
                                                                marginTop: "10px",
                                                                cursor: "pointer",
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
                            </Card.Section>}

                    </Card>
                </Grid.Cell>
            </Grid>
            <Modal
        open={activeRejectionModel}
        onClose={handleChangeRejectionModel}
        title="Reason for rejecting video"
        primaryAction={{
          content: 'Send Reason',
          onAction: handleRejectVideo,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleChangeRejectionModel,
          },
        ]}
      >
        <Modal.Section>
          <TextField
            label="Reason for rejection"
            value={rejectionReason}
            onChange={handleRejectionReason}
            multiline={4}
            autoComplete="off"
            />
        </Modal.Section>
      </Modal>
      <Modal
        open={activeRejectionConfirmModel}
        onClose={handleChangeRejectionConfirmModel}
        title="Confirmation for rejecting video"

      >
                <Modal.Section>
                    <div style={{textAlign:"center"}}>
                        <Text variant="heading2xl" as="h3">
                        Are you sure you want to Reject?
                        </Text>
                        <div style={{display:"flex",justifyContent:"center",marginTop:"20px"}}>
                        <ButtonGroup>
                            <Button onClick={handleChangeRejectionConfirmModel}>Cancel</Button>
                            <Button primary onClick={handleChangeRejectionConfirmModel}>Sure</Button>
                        </ButtonGroup>
                        </div>
                    </div>
                </Modal.Section>
            </Modal>
            <Modal
        open={activeRejectionSuccessModel}
        onClose={handleChangeRejectionSuccessModel}
        title="Confirmation for rejecting video"

      >
                <Modal.Section>
                    <div style={{textAlign:"center",marginTop:"20px",marginBottom:"20px"}}>
                        <Text variant="heading2xl" as="h3">
                            Video Rejected Successfully.
                        </Text>

                    </div>
                </Modal.Section>
            </Modal>


            <Modal
        open={activeApprovedConfirmModel}
        onClose={handleChangeApprovedConfirmModel}
        title="Confirmation for approving video"

      >
                <Modal.Section>
                    <div style={{textAlign:"center"}}>
                        <Text variant="heading2xl" as="h3">
                        Are you sure you want to Approve?
                        </Text>
                        <div style={{display:"flex",justifyContent:"center",marginTop:"20px"}}>
                        <ButtonGroup>
                            <Button onClick={handleChangeApprovedConfirmModel}>Cancel</Button>
                            <Button primary onClick={handleChangeApprovedConfirmModel}>Sure</Button>
                        </ButtonGroup>
                        </div>
                    </div>
                </Modal.Section>
            </Modal>

            <Modal
        open={activeApprovedSuccessModel}
        onClose={handleChangeApprovedSuccessModel}
        title="Confirmation for approving video"

      >
                <Modal.Section>
                    <div style={{textAlign:"center",marginTop:"20px",marginBottom:"20px"}}>
                        <Text variant="headingXl" as="h4">
                        Congratulations, you just approved the video.
                        </Text>

                    </div>
                </Modal.Section>
            </Modal>
        </Page>
    );
}
export default Dashboard;
