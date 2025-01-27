import {
    Box,
    Button,
    ButtonGroup,
    Card,
    Grid,
    Icon,
    Page,
    Text,
    TextField,
    Divider
} from "@shopify/polaris";

import checkmark from "@/ReactJs/MyApplication/imges/checkmark.svg";
import noVedio from "@/ReactJs/MyApplication/imges/film.png";
import staricon from "@/ReactJs/MyApplication/imges/Staricon.svg";
import { router, usePage } from "@inertiajs/react";
import { CircleCancelMajor, CircleTickMajor } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { TitleBar, useAppBridge, Modal } from "@shopify/app-bridge-react";

function WaitingVideos() {
    const shopify = useAppBridge();

    const [videoFeedback, setVideoFeedback] = useState(" Congratulations, you just approved the video.");
    const [videoFeedbackPopupTitle, setVideoFeedbackPopupTitle] = useState("Please Confirm");
    const [rejectVideoFeedback, setRejectVideoFeedback] = useState("Are you sure you want to Reject?");
    const [rejectVideoFeedbackTitlePopup, setrejectVideoFeedbackTitlePopup] = useState("Please confirm");
    const [rejectVideoBodyText, setrejectVideoBodyText] = useState("Video Rejected Successfully");
    const [activeRejectionModel, setActiveRejectionModel] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [activeRejectionConfirmModel, setActiveRejectionConfirmModel] = useState(false);
    const [activeRejectionSuccessModel, setActiveRejectionSuccessModel] = useState(false);
    const [upgradeButton, setupgradeButton] = useState(false);



    const [activeApprovedConfirmModel, setActiveApprovedConfirmModel] = useState(false);
    const [activeApprovedSuccessModel, setActiveApprovedSuccessModel] = useState(false);


    const [numberOfVedios, setNumberOfVedios] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reload, setReload] = useState(false);
    const [videos, setVideos] = useState([]);
    const [rejectVideoId, setRejectVideoId] = useState(false);
    const [approvedUserVideoId, setapprovedUserVideoId] = useState(false);
    const [approvedVideoType, setApprovedVideoType] = useState(null);
    const [isClicked, setisClicked] = useState(false);

    // modalTitleBar , handleClickCancel, handleClickConfirm, approvalType, 

    const [modalTitleBar, setModalTitle] = useState();
    const [approvalType, setApprovalType] = useState();
    const [videoId, setVideoId] = useState();

    const handleClickCancel = () => {
        console.log("AOA");
        shopify.modal.hide('popup-modal');

    }

    const handleClickConfirm = () => {
        console.log("WS");
        console.log(approvalType);
        if(approvalType == 'approved'){
            handleApprovedUserVideo();
        }
        else if(approvalType == 'rejected'){

        }
    }


    const handleModalOpen = (id, type, message) => {
        shopify.modal.show('popup-modal');
        setModalTitle(message);
        setApprovalType(type);
        setVideoId(id);
    }


    const handleRejectionReason = useCallback(
        (newValue) => setRejectionReason(newValue),
        []
    );
    const handleChangeRejectionModel = useCallback(
        () => setActiveRejectionModel(!activeRejectionModel),
        [activeRejectionModel]
    );

    const handleChangeRejectionConfirmModel = () => {
        if (activeApprovedConfirmModel) {
            shopify.modal.hide('my-rejectmodal');
        } else {
            shopify.modal.show('my-rejectmodal');
        }

        setActiveRejectionConfirmModel(!activeRejectionConfirmModel);
    };

    const handleChangeRejectionSuccessModel = (() => {
        if (activeRejectionConfirmModel) {
            shopify.modal.hide('my-rejectmodal')
        }
        else {
            shopify.modal.show('my-rejectmodal')
        }
        setActiveRejectionSuccessModel(!activeRejectionSuccessModel);
        setRejectionReason("");
        setReload(!reload);
    }, [activeRejectionSuccessModel]);

    const handleChangeApprovedConfirmModel = () => {
        if (activeApprovedConfirmModel) {
            shopify.modal.hide('my-modal')
        }
        else {
            shopify.modal.show('my-modal')
        }
        setActiveApprovedConfirmModel(!activeApprovedConfirmModel)
    }

    const handleChangeApprovedSuccessModel = (() => {

        if (activeApprovedSuccessModel) {
            shopify.modal.hide('my-Sucessmodal')
        }
        else {
            shopify.modal.show('my-Sucessmodal')
        }

        setActiveApprovedSuccessModel(!activeApprovedSuccessModel);

        setReload(new Date().getSeconds());
    }, [activeApprovedSuccessModel]);

    const upgradePlan = () => {
        router.get(route('plans'));
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
            fetch(route('rejectVideo'), {
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
                        handleChangeRejectionSuccessModel();
                    } else {
                        setActiveRejectionModel(false);
                        handleChangeRejectionSuccessModel();

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

    const approvedUserVideo = (id, type = null) => {
        setapprovedUserVideoId(id);
        setApprovedVideoType(type);

        handleChangeApprovedConfirmModel()
    };

    /****** handle approved video *****/
    const handleApprovedUserVideo = () => {
        setisClicked(true);
        var formData = new FormData();
        formData.append("video_id", videoId);
        formData.append("type", approvalType);


        if (videoId) {
            if (approvalType == 'star_rating') {
                setVideoFeedback("Congratulations, you just approved the star rating video.");
            } else {
                setVideoFeedback("Congratulations, you just approved the video.");

            }
            // setVideoFeedbackPopupTitle("Please Confirm");
            fetch(route('videoOperation'), {
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
                        handleChangeApprovedConfirmModel()
                        handleChangeApprovedSuccessModel();
                    } else {
                        if (
                            data.data.remaining_Videos ||
                            data.data.remaining_emails
                        ) {
                            setupgradeButton(true);
                        }
                        handleChangeApprovedConfirmModel()
                        handleChangeApprovedSuccessModel();
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
        console.log('counter :');
        fetch(route('getPendingVideos', { page: currentPage }))
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
                console.log('count :' + data.videoCount);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [currentPage, reload]);

    return (
        <Page>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                    <Card>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "0px",
                            marginBottom: "8px",
                        }}>
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
                                />
                                <Text variant="headingLg" as="h5">
                                    Videos to Review
                                </Text>
                            </div>
                        </div>
                        <Divider />

                        {numberOfVedios <= 0 ? (
                            <div style={{
                                height: "400px",
                                background: "#f9f9f9",
                                borderRadius: "6px",
                                textAlign: "center",
                                paddingTop: "125px",
                                justifyItems: "center",
                            }}>
                                <img
                                    style={{ height: "102px", opacity: ".5" }}
                                    src={noVedio}
                                />

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
                            <Box paddingBlockEnd='500' paddingBlockStart='1000'>
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
                                                        className="video-wrapper-cstm"
                                                        style={{
                                                            textAlign: "center",
                                                        }}
                                                    >
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
                                                                        handleModalOpen(video.id, 'approved', ' mark this Approved');
                                                                    }}
                                                                >
                                                                    <a href={'#'}>
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
                                                                        href={`#`}
                                                                        onClick={() => {
                                                                            handleModalOpen(video.id, 'rejected', ' Reject');
                                                                        }}
                                                                    >
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
                                                                }}
                                                                    onClick={() => {
                                                                        handleModalOpen(video.id, 'star_rating', '  mark this Star Approved');
                                                                    }}
                                                                // onClick={() => {
                                                                //     approvedUserVideo(
                                                                //         video.id,
                                                                //         'star_rating'
                                                                //     );
                                                                // }}
                                                                >
                                                                    <img src={staricon} alt="" style={{ width: "20px" }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Grid.Cell>
                                            );
                                        })}
                                </Grid>
                            </Box>
                        )}
                    </Card>
                </Grid.Cell>
            </Grid>

            {currentPage >= totalPages ? null : (
                <div className="button_center black-global-btn">
                    <Button
                        onClick={() => {
                            setCurrentPage((prevPage) => prevPage + 1);
                        }}
                    >
                        Load More
                    </Button>
                </div>
            )}

            {/* <Modal
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
                                <span className="black-global-btn">
                                    <Button primary onClick={handleRejectionPopup}>
                                        Confirm
                                    </Button>
                                </span>
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
            </Modal> */}

            {/* <Modal id="my-rejectmodal">

                <TitleBar title={rejectVideoFeedbackTitlePopup}></TitleBar>
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
                            <span className="black-global-btn">
                                <Button primary onClick={handleRejectionPopup}>
                                    Confirm
                                </Button>
                            </span>
                        </ButtonGroup>
                    </div>
                </div>
            </Modal> */}

            {/* <Modal id="my-modal">

                <TitleBar title={videoFeedbackPopupTitle}>
                    <button
                        onClick={handleChangeApprovedConfirmModel}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isClicked}
                        variant="primary"
                        onClick={handleApprovedUserVideo}
                    >
                        Confirm
                    </button>
                </TitleBar>
                <div style={{ textAlign: "center" }}>
                    <Text variant="headingMd" as="h6">
                        {`Are you sure you want to mark this ${approvedVideoType ? 'Star Approved' : 'Approved'}?`}

                    </Text>
                </div>
            </Modal> */}

            {/* <Modal
                open={activeApprovedConfirmModel}
                onClose={handleChangeApprovedConfirmModel}
                title={videoFeedbackPopupTitle}
            >
                <Modal.Section>
                    <div style={{ textAlign: "center" }}>
                        <Text variant="headingMd" as="h6">
                            {`Are you sure you want to mark this ${approvedVideoType ? 'Star Approved' : 'Approved'}?`}

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
            </Modal> */}


            {/* <Modal
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
            </Modal> */}

            <Modal id="my-Sucessmodal">

                <TitleBar title={videoFeedbackPopupTitle}></TitleBar>
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
            </Modal>



            {/* For All Type of Approval Reject, Approved or Star Approved */}
            <Modal id="popup-modal">
                <TitleBar title='Please Confirm'>
                    <button
                        onClick={handleClickCancel}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isClicked}
                        variant="primary"
                        onClick={handleClickConfirm}
                    >
                        Confirm
                    </button>
                </TitleBar>
                <Box padding='500'>

                    <Text variant="headingMd" as="h6" alignment="center">
                        {`Are you sure you want to ${modalTitleBar}?`}
                    </Text>
                </Box>
            </Modal>
        </Page>
    );
}

export default WaitingVideos;
