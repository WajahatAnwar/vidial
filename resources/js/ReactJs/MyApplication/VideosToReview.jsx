import {
    Box,
    Button,
    Card,
    Divider,
    Grid,
    Icon,
    Page,
    Text,
    TextField
} from "@shopify/polaris";

import checkmark from "@/ReactJs/MyApplication/imges/checkmark.svg";
import noVedio from "@/ReactJs/MyApplication/imges/film.png";
import staricon from "@/ReactJs/MyApplication/imges/Staricon.svg";
import { router } from "@inertiajs/react";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { CircleCancelMajor, CircleTickMajor } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";

function WaitingVideos() {
    const shopify = useAppBridge();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reload, setReload] = useState(false);
    const [isClicked, setisClicked] = useState(false);
    const [modalTitleBar, setModalTitle] = useState();
    const [approvalType, setApprovalType] = useState();
    const [videoId, setVideoId] = useState();
    const [rejectionReason, setRejectionReason] = useState("");
    const [videos, setVideos] = useState([]);
    const [videoCount, setVideoCount] = useState(0);

    const handleClickCancel = () => {
        shopify.modal.hide('popup-modal');
        shopify.modal.hide('rejectionModal');
    }

    const handleClickConfirm = () => {
        if (approvalType == 'rejected') {
            shopify.modal.show('rejectionModal');
        }
        else {
            handleApprovedUserVideo();
        }
        shopify.modal.hide('popup-modal');
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

    const upgradePlan = () => {
        router.get(route('plans'));
    };

    /******** Reject Video Handle   ******/
    const handleRejectVideo = () => {
        if (rejectionReason && videoId) {
            var formData = new FormData();
            formData.append("reason", rejectionReason);
            formData.append("video_id", videoId);
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
                        shopify.toast.show(data.message, {
                            duration: 5000,
                        })
                    } else {
                        shopify.toast.show(data.message, {
                            duration: 5000,
                        })
                    }
                    setisClicked(false);
                    setReload(true);
                    handleClickCancel();

                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            console.log("reason box empty");
        }
    };

    /****** handle approved video *****/
    const handleApprovedUserVideo = () => {
        setisClicked(true);
        var formData = new FormData();
        formData.append("video_id", videoId);
        formData.append("type", approvalType);


        if (videoId) {
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
                    console.log(data);
                    console.log("data");

                    if (data.success) {
                        // Show a Toast of Success
                        shopify.toast.show(data.message, {
                            duration: 5000,
                        })

                    } else {
                        shopify.toast.show(data.message, {
                            duration: 5000,
                        })
                        // if (
                        //     data.data.remaining_Videos ||
                        //     data.data.remaining_emails
                        // ) {
                        //     setupgradeButton(true);
                        //  We need to show a popup which says upgrade your plan as now it's limit reached . . . 
                        // }
                        // Show a Toast of Error

                        // setVideoFeedback(data.message);
                    }
                    setReload(true);
                    handleClickCancel();
                })
                .catch((error) => {
                    console.log(error);
                    shopify.toast.show(error, {
                        duration: 5000,
                    })
                });
            setisClicked(false);

        }
    };

    useEffect(() => {
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
                    setVideoCount(data.videoCount);
                }
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

                        {videoCount <= 0 ? (
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

            <Modal
                id="rejectionModal">
                <TitleBar title='Reason for rejecting video'>

                    <button
                        onClick={handleClickCancel}
                    >
                        Cancel
                    </button>
                    <button
                        variant="primary"
                        onClick={handleRejectVideo}
                    >
                        Confirm
                    </button>
                </TitleBar>
                <Box padding='500'>
                    <TextField
                        label="Reason for rejection"
                        value={rejectionReason}
                        onChange={handleRejectionReason}
                        multiline={4}
                        autoComplete="off"
                    />
                </Box>
            </Modal>
        </Page>
    );
}

export default WaitingVideos;
