import {
    Button,
    ButtonGroup,
    Card,
    Grid,
    Icon,
    Modal,
    Page,
    Text,
    TextField
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import boxkbackground from "@/ReactJs/MyApplication/imges/box-background.svg";
import checkbackground from "./imges/check-background.svg";
import checkmark from "./imges/checkmark.svg";
import hourglass from "./imges/Hourglass-background.svg";
import staricon from "./imges/Staricon.svg";
import timericon from "./imges/timericon.svg";

import { router, usePage } from "@inertiajs/react";
import {
    CircleCancelMajor,
    CircleTickMajor
} from "@shopify/polaris-icons";
import downloadIcon from "./imges/downloadIcon.png";
import noVedio from "./imges/film.png";
import Ticker from "./Ticker";
import { downloadVideo } from "./utils";

function Dashboard() {
    const pathname = '/videos-to-review';
    const page = usePage().props;
    const query = page.ziggy.query;

    const [activeRejectionModel, setActiveRejectionModel] = useState(false);
    const handleChangeRejectionModel = useCallback(
        () => setActiveRejectionModel(!activeRejectionModel),
        [activeRejectionModel]
    );
    // const activatorRejectionModel = <Button onClick={handleChangeRejectionModel}>Open</Button>;

    const [rejectionReason, setRejectionReason] = useState("");
    const handleRejectionReason = useCallback(
        (newValue) => setRejectionReason(newValue),
        []
    );

    const [upgradeButton, setupgradeButton] = useState(false);

    const [activeRejectionConfirmModel, setActiveRejectionConfirmModel] =
        useState(false);
    const handleChangeRejectionConfirmModel = useCallback(
        () => setActiveRejectionConfirmModel(!activeRejectionConfirmModel),
        [activeRejectionConfirmModel]
    );
    // const activatorRejectionConfirmModel = <Button onClick={handleChangeRejectionConfirmModel}>Open</Button>;
    const [activeRejectionSuccessModel, setActiveRejectionSuccessModel] =
        useState(false);
    const handleChangeRejectionSuccessModel = useCallback(() => {
        setActiveRejectionSuccessModel(!activeRejectionSuccessModel),
            [activeRejectionSuccessModel];
        setRejectionReason("");
        router.get(route('home', query));
        setReload(new Date().getSeconds());
    });

    const [videoFeedback, setVideoFeedback] = useState(
        " Congratulations, you just approved the video."
    );
    const [videoFeedbackPopupTitle, setVideoFeedbackPopupTitle] = useState(
        "Please Confirm"
    );
    const [rejectVideoFeedback, setRejectVideoFeedback] = useState(
        "Are you sure you want to Reject?"
    );
    const [rejectVideoFeedbackTitlePopup, setrejectVideoFeedbackTitlePopup] =
        useState("Confirmation for reject video");
    const [rejectVideoBodyText, setrejectVideoBodyText] = useState(
        "Video Rejected Successfully"
    );

    // const activatorRejectionSuccessModel = <Button onClick={handleChangeRejectionSuccessModel}>Open</Button>;

    const [activeApprovedConfirmModel, setActiveApprovedConfirmModel] =
        useState(false);
    const handleChangeApprovedConfirmModel = useCallback(
        () => setActiveApprovedConfirmModel(!activeApprovedConfirmModel),
        [activeApprovedConfirmModel]
    );
    // const activatorApprovedConfirmModel = <Button onClick={handleChangeApprovedConfirmModel}>Open</Button>;

    const [activeApprovedSuccessModel, setActiveApprovedSuccessModel] =
        useState(false);
    const handleChangeApprovedSuccessModel = useCallback(() => {
        setActiveApprovedSuccessModel(!activeApprovedSuccessModel),
            [activeApprovedSuccessModel];
        router.get(route('home', query));
        setReload(new Date().getSeconds());
    });

    // const activatorApprovedSuccessModel = <Button onClick={handleChangeApprovedSuccessModel}>Open</Button>;

    const [pendingVideos, setPendingVideos] = useState([]);
    const [reloadPendingVideos, setReloadPendingVideos] = useState(false);
    const [approvedVideos, setApprovedVideos] = useState([]);
    const [approvedVideosCount, setApprovedVideosCount] = useState(0);
    const [pendingVideosCount, setPendingVideosCount] = useState(0);
    const [userEmail, setUserEmail] = useState(0);
    const [reload, setReload] = useState(false);
    const [rejectVideoId, setRejectVideoId] = useState(false);
    const [approvedUserVideoId, setapprovedUserVideoId] = useState(false);
    const [approvedVideoType, setApprovedVideoType] = useState(null);
    const [isClicked, setisClicked] = useState(false);


    /******** Operation on Videos  ******/
    const videoOperation = (id) => {
        const status = "Approved";
        const confirmed = confirm(`Are you sure you want to ${status}?`);
        var formData = new FormData();
        formData.append("video_id", id);
        if (confirmed) {
            fetch(route('videoOperation', query), {
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
                        alert(data.message);
                    }
                    setReload(true);
                    return;
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    /******** move to plan page *****/

    const upgradePlan = () => {
        router.get(route('plans', query));
    };
    /******** Rejection popup   ******/

    const handleRejectionPopup = () => {
        setActiveRejectionConfirmModel(false);
        setActiveRejectionModel(true);
        return;
    };
    /******** Reject Video Handle   ******/
    const handleRejectVideo = () => {
        if (rejectionReason && rejectVideoId) {
            setPendingVideos([]);
            setApprovedVideos([]);
            setrejectVideoBodyText("Video Rejected Successfully");
            setrejectVideoFeedbackTitlePopup("Confirmation for reject video");
            var formData = new FormData();
            formData.append("reason", rejectionReason);
            formData.append("video_id", rejectVideoId);
            fetch(route('rejectVideo', query), {
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
                        setActiveRejectionModel(false);
                        setActiveRejectionSuccessModel(true);
                    } else {
                        setActiveRejectionModel(false);
                        setActiveRejectionSuccessModel(true);

                        setrejectVideoFeedbackTitlePopup("Warning");
                        setrejectVideoBodyText(data.message);

                    }
                })
                .catch((error) => {
                    console.log(error);
                    router.get(route('home', query));
                });
        } else {
            console.log("reason box empty");
        }
    };

    /**** Reject video ***/
    const rejectVideo = (id) => {

        var formData = new FormData();
        setRejectVideoId(id);
        setActiveRejectionConfirmModel(true);
        return;
    };

    /**** approved video ***/

    const approvedUserVideo = (id, type = null) => {
        setapprovedUserVideoId(id);
        setApprovedVideoType(type);

        setActiveApprovedConfirmModel(true);
    };

    /****** handle approved video *****/
    const handleApprovedUserVideo = () => {
        setisClicked(true);
        setPendingVideos([]);
        setApprovedVideos([]);
        var formData = new FormData();
        formData.append("video_id", approvedUserVideoId);
        formData.append("type", approvedVideoType);
        if (approvedUserVideoId) {
            if (approvedVideoType == 'star_rating') {
                setVideoFeedback("Congratulations, you just approved the star rating video.");
            } else {
                setVideoFeedback("Congratulations, you just approved the video.");

            }
            setVideoFeedbackPopupTitle("Please Confirm");
            fetch(route('videoOperation', query), {
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
                        setActiveApprovedConfirmModel(false);
                        setActiveApprovedSuccessModel(true);

                        //setReload(new Date().getSeconds());
                    } else {
                        if (
                            data.data.remaining_Videos ||
                            data.data.remaining_emails
                        ) {
                            setupgradeButton(true);
                        }
                        setActiveApprovedConfirmModel(false);
                        setActiveApprovedSuccessModel(true);
                        setVideoFeedbackPopupTitle("Warning");
                        setVideoFeedback(data.message);
                    }
                    setisClicked(false);
                    // setReload(true);
                    setReload(true);
                    setApprovedVideoType(null);
                    return;
                })
                .catch((error) => {
                    setisClicked(false);
                    console.log(error);
                });
        }
    };

    /********  get Settings Data  ******/
    useEffect(() => {
        setReloadPendingVideos(true);
        fetch(route('getDashboardContent', query))
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                //console.log(data);
                if (data.success) {
                    setPendingVideos(data.data.pendingVideos);
                    setApprovedVideos(data.data.approvedVideos);
                    setApprovedVideosCount(data.data.approvedVideosCount);
                    setPendingVideosCount(data.data.pendingVideosCount);
                    setUserEmail(
                        data.data.user.ugc_email_count -
                        data.data.user.remaining_email
                    );
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, [reload]);

    return (
        <Page>
            <Grid>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                    <Ticker></Ticker>
                    <br></br>
                    {/* <Text variant="headingXl" as="h4">
                        Welcome to GoodAuthentic 👋
                    </Text> */}
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                    <Card sectioned>
                        <div style={{ display: "flex" }}>
                            <img src={boxkbackground}></img>
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
                            <img src={hourglass}></img>
                            <div style={{ marginLeft: "10px" }}>
                                <Text variant="headingXl" as="h4">
                                    {pendingVideosCount}
                                </Text>
                                <p style={{ fontWeight: "600" }}>
                                    Videos to Review
                                </p>
                            </div>
                        </div>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                    <Card sectioned>
                        <div style={{ display: "flex" }}>
                            <img src={checkbackground}></img>
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
                                        src={timericon}
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
                                            router.get(route('videos-to-review', query));
                                        }}
                                    >
                                        See All
                                    </Button>
                                )}
                            </div>
                        </Card.Section>
                        {pendingVideosCount <= 0 ? (
                            <div
                                style={{
                                    height: "400px",
                                    background: "#f9f9f9",
                                    borderRadius: "6px",
                                    textAlign: "center",
                                    paddingTop: "125px",
                                    justifyItems: "center",
                                }}
                            >
                                <img
                                    style={{ height: "102px", opacity: ".5" }}
                                    src={noVedio}
                                ></img>

                                <p
                                    style={{
                                        color: "#d3c9c9",
                                        fontSize: "17px",
                                    }}
                                >
                                    No Videos to Review
                                </p>
                            </div>
                        ) : (
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
                                                            Your browser does
                                                            not support the
                                                            video tag.
                                                        </video>
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                                color: "#797979",
                                                                marginTop:
                                                                    "10px",
                                                            }}
                                                        >
                                                            {video.email}
                                                        </p>
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                                color: "#797979",
                                                            }}
                                                        >
                                                            {video.created_at}
                                                        </p>
                                                        <div
                                                            style={{
                                                                border: "1px solid #dddd",
                                                                padding:
                                                                    "6px 12px",
                                                                borderRadius:
                                                                    "9px",
                                                                width: "124px",
                                                                margin: "auto",
                                                                marginTop:
                                                                    "10px",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        marginRight:
                                                                            "20px",
                                                                    }}
                                                                    onClick={() => {
                                                                        approvedUserVideo(
                                                                            video.id,

                                                                        );
                                                                    }}
                                                                >
                                                                    <a href={`${pathname}/${query}`}>
                                                                        <Icon
                                                                            source={
                                                                                CircleTickMajor
                                                                            }
                                                                            color="primary"
                                                                        />
                                                                    </a>
                                                                </div>
                                                                <div style={{
                                                                    marginRight:
                                                                        "20px",
                                                                }}>
                                                                    <a
                                                                        href={`${pathname}/${query}`}
                                                                        onClick={() => {
                                                                            rejectVideo(
                                                                                video.id
                                                                            );
                                                                        }}>
                                                                        <Icon
                                                                            source={
                                                                                CircleCancelMajor
                                                                            }
                                                                            color="critical"
                                                                        />
                                                                    </a>
                                                                </div>
                                                                <div style={{
                                                                    cursor: 'pointer'
                                                                }} onClick={() => {
                                                                    approvedUserVideo(
                                                                        video.id,
                                                                        'star_rating'
                                                                    );
                                                                }}>
                                                                    <img src={staricon} alt="" style={{ width: "20px" }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Grid.Cell>
                                            );
                                        })}
                                </Grid>
                            </Card.Section>
                        )}
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
                                        src={checkmark}
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
                                            router.get(route('approved-videos'), query)
                                        }}
                                    >
                                        See All
                                    </Button>
                                )}
                            </div>
                        </Card.Section>
                        {approvedVideosCount <= 0 ? (
                            <div
                                style={{
                                    height: "400px",
                                    background: "#f9f9f9",
                                    borderRadius: "6px",
                                    textAlign: "center",
                                    paddingTop: "125px",
                                    justifyItems: "center",
                                }}
                            >
                                <img
                                    style={{ height: "102px", opacity: ".5" }}
                                    src={noVedio}
                                ></img>

                                <p
                                    style={{
                                        color: "#d3c9c9",
                                        fontSize: "17px",
                                    }}
                                >
                                    No Approved Videos
                                </p>
                            </div>
                        ) : (
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
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
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
                                                            Your browser does
                                                            not support the
                                                            video tag.
                                                        </video>{" "}
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                                color: "#797979",
                                                                marginTop:
                                                                    "10px",
                                                            }}
                                                        >
                                                            {video.approved_video_type == 'star_rating' ? 'Star Approved' : 'Approved'}{" "}
                                                            {video.updated_at}
                                                        </p>
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                                color: "#797979",
                                                            }}
                                                        >
                                                            Sent by{" "}
                                                            {video.email}
                                                        </p>
                                                        <button
                                                            onClick={() => {
                                                                downloadVideo(
                                                                    video.path
                                                                );
                                                            }}
                                                            style={{
                                                                background:
                                                                    "#FFFFFF",
                                                                border: "1px solid #E1E3E5",
                                                                borderRadius:
                                                                    "9px",
                                                                padding:
                                                                    "5px 15px",
                                                                fontWeight:
                                                                    "500",
                                                                fontSize:
                                                                    "15px",
                                                                marginTop:
                                                                    "10px",
                                                                cursor: "pointer",
                                                                display:"flex",
                                                                alignItems:"center",
                                                                gap:"5px"
                                                            }}
                                                        >
                                                            <img
                                                                src={
                                                                    downloadIcon
                                                                }
                                                            ></img>{" "}
                                                            Download
                                                        </button>
                                                    </div>
                                                </Grid.Cell>
                                            );
                                        })}
                                </Grid>
                            </Card.Section>
                        )}
                    </Card>
                </Grid.Cell>
            </Grid>
            <Modal
                open={activeRejectionModel}
                onClose={handleChangeRejectionModel}
                title="Reason for rejecting video"
                primaryAction={{
                    content: "Send Reason",
                    onAction: handleRejectVideo,
                }}
                secondaryActions={[
                    {
                        content: "Cancel",
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
                title={rejectVideoFeedbackTitlePopup}
            >
                <Modal.Section>
                    <div style={{ textAlign: "center" }}>
                        <Text variant="headingMd" as="h6">
                            {rejectVideoFeedback}
                        </Text>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "20px",
                            }}
                        >
                            <ButtonGroup>
                                <Button
                                    onClick={handleChangeRejectionConfirmModel}
                                >
                                    Cancel
                                </Button>
                                <Button primary onClick={handleRejectionPopup}>
                                    Sure
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </Modal.Section>
            </Modal>
            <Modal
                open={activeRejectionSuccessModel}
                onClose={handleChangeRejectionSuccessModel}
                title={rejectVideoFeedbackTitlePopup}
            >
                <Modal.Section>
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                            marginBottom: "20px",
                        }}
                    >
                        <Text variant="headingMd" as="h6">
                            {rejectVideoBodyText}
                        </Text>
                    </div>
                </Modal.Section>
            </Modal>

            <Modal
                open={activeApprovedConfirmModel}
                onClose={handleChangeApprovedConfirmModel}
                title={videoFeedbackPopupTitle}
            >
                <Modal.Section>
                    <div style={{ textAlign: "center" }}>
                        <Text variant="headingMd" as="h6">
                            Are you sure you want to Star Approve?
                        </Text>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "20px",
                            }}

                        >
                            <ButtonGroup>
                                <Button
                                    disabled={isClicked}
                                    onClick={handleChangeApprovedConfirmModel}
                                >
                                    Cancel
                                </Button>


                                <div className="polaris-black-btn-global">



                                    <Button
                                        disabled={isClicked}
                                        primary
                                        onClick={handleApprovedUserVideo}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </ButtonGroup>
                        </div>
                    </div>
                </Modal.Section>
            </Modal>

            <Modal
                open={activeApprovedSuccessModel}
                onClose={handleChangeApprovedSuccessModel}
                title={videoFeedbackPopupTitle}
            >
                <Modal.Section>
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                            marginBottom: "20px",
                        }}
                    >
                        <Text variant="headingMd" as="h6">
                            {videoFeedback}
                            <br />
                            <br />
                            {upgradeButton ? (
                                <Button primary onClick={upgradePlan}>
                                    Upgrade
                                </Button>
                            ) : (
                                ""
                            )}
                        </Text>
                    </div>
                </Modal.Section>
            </Modal>
        </Page>
    );
}
export default Dashboard;
