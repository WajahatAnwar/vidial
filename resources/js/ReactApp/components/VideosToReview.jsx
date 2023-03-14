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
import { useEffect, useState, useCallback, useRef } from "react";
import React from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import EmailLogo from "./imges/emailLogo.png";
import WaitingLogo from "./imges/WaitingLogo.png";
import ApprovedLogo from "./imges/ApprovedLogo.png";
import WaitingIcon from "./imges/waiting2.png";
import VideoTumbnail from "./imges/bureau 11.png";
import { CircleCancelMajor, CircleTickMajor } from "@shopify/polaris-icons";
import downloadIcon from "./imges/downloadIcon.png";
import noVedio from "./imges/film.png";
function WaitingVideos() {
    const { search } = useLocation();
    const [videoFeedback, setVideoFeedback] = useState(
        " Congratulations, you just approved the video."
    );

    const [videoFeedbackPopupTitle, setVideoFeedbackPopupTitle] = useState(
        "Confirmation for approving video"
    );
    const [rejectVideoFeedback, setRejectVideoFeedback] = useState(
        "Are you sure you want to Reject?"
    );
    const [rejectVideoFeedbackTitlePopup, setrejectVideoFeedbackTitlePopup] =
        useState("Confirmation for reject video");
    const [rejectVideoBodyText, setrejectVideoBodyText] = useState(
        "Video Rejected Successfully"
    );

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
        setReload(!reload);
    });
    const [upgradeButton, setupgradeButton] = useState(false);
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

        // navigate(`/videos-to-review${search}`);
        setReload(new Date().getSeconds());
    });
    // const activatorApprovedSuccessModel = <Button onClick={handleChangeApprovedSuccessModel}>Open</Button>;

    const [numberOfVedios, setNumberOfVedios] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reload, setReload] = useState(false);
    const [videos, setVideos] = useState([]);
    const [rejectVideoId, setRejectVideoId] = useState(false);
    const [approvedUserVideoId, setapprovedUserVideoId] = useState(false);
    const [isClicked, setisClicked] = useState(false);

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
        navigate("/plans");
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
            setrejectVideoBodyText("Video Rejected Successfully");
            setrejectVideoFeedbackTitlePopup("Confirmation for reject video");
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

    const approvedUserVideo = (id) => {
        setapprovedUserVideoId(id);

        setActiveApprovedConfirmModel(true);
    };

    /****** handle approved video *****/
    const handleApprovedUserVideo = () => {
        setisClicked(true);
        var formData = new FormData();
        formData.append("video_id", approvedUserVideoId);

        if (approvedUserVideoId) {
            setVideoFeedback("Congratulations, you just approved the video.");
            setVideoFeedbackPopupTitle("Confirmation for Approving Video");
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
                    setReload(true);
                    return;
                })
                .catch((error) => {
                    setisClicked(false);
                    console.log(error);
                });
        }
    };
    useEffect(() => {
        fetch("/getPendingVideos?page=" + currentPage)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    setVideos(data.data);
                    setTotalPages(data.totalPages);
                    setNumberOfVedios(data.videoCount);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, [currentPage, reload]);
    const navigate = useNavigate();

    return (
        <Page>
            <Grid>
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
                            </div>
                        </Card.Section>
                        {numberOfVedios <= 0 ? (
                            <div
                                style={{
                                    height: "400px",
                                    background: "#f9f9f9",
                                    borderRadius: "6px",
                                    textAlign: "center",
                                    paddingTop: "125px",
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
                                    No Videos To Review
                                </p>
                            </div>
                        ) : (
                            <Card.Section>
                                <Grid>
                                    {videos &&
                                        videos.map((video, index) => {
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
                                                            key={
                                                                video.video_link
                                                            }
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
                                                                width: "86px",
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
                                                                                video.id
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
                        )}
                    </Card>
                </Grid.Cell>
            </Grid>
            {currentPage >= totalPages ? null : (
                <div className="button_center">
                    <Button
                        onClick={() => {
                            setCurrentPage((prevPage) => prevPage + 1);
                        }}
                    >
                        Load More
                    </Button>
                </div>
            )}
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
                        <Text variant="heading2xl" as="h3">
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
                        <Text variant="heading2xl" as="h3">
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
                        <Text variant="heading2xl" as="h3">
                            Are you sure you want to Approve?
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
                                    onClick={handleChangeApprovedConfirmModel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isClicked}
                                    primary
                                    onClick={handleApprovedUserVideo}
                                >
                                    Sure
                                </Button>
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
                        <Text variant="headingXl" as="h4">
                            {videoFeedback}
                            <br />
                            <br />
                            {upgradeButton ? (
                                <Button primary onClick={upgradePlan}>
                                    Updrade
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

export default WaitingVideos;
