import {
    Button,
    Card,
    Grid,
    Page,
    Text
} from "@shopify/polaris";
import React, { useEffect, useRef, useState } from "react";

import noVedio from "@/ReactJs/MyApplication/imges/film.png";
import WaitingIcon from "@/ReactJs/MyApplication/imges/waiting2.png";
import { usePage } from "@inertiajs/react";
function UserApprovedVideos() {
    const page = usePage().props;
    const query = page.ziggy.query;
    const id = page.ziggy.query.id;
    const [numberOfVedios, setNumberOfVedios] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const videoRef = useRef(null);
    /******** Fetching Videos  ******/
    const [videos, setVideos] = useState([]);
    const videoRefs = useRef([]);

    const playVideo = (index) => {
        // Pause all other videos
        videoRefs.current.forEach((video, idx) => {
            if (video && idx !== index) {
                video.pause();
            }
        });

        // Play the selected video
        const selectedVideo = videoRefs.current[index];
        if (selectedVideo) {
            selectedVideo.play();
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
    };
    useEffect(() => {

        /************* start --- disabled right inspect element ***************/
        const handleKeyDown = (e) => {
            // Prevent F12 key
            if (e.key === 'F12') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Prevent Ctrl+Shift+I (Windows/Linux) or Cmd+Opt+I (Mac)
            if ((e.ctrlKey && e.shiftKey && e.key === 'I') || (e.metaKey && e.altKey && e.key === 'I')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Prevent Ctrl+Shift+J (Windows/Linux) or Cmd+Opt+J (Mac)
            if ((e.ctrlKey && e.shiftKey && e.key === 'J') || (e.metaKey && e.altKey && e.key === 'J')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Prevent Ctrl+U (Windows/Linux) or Cmd+U (Mac)
            if ((e.ctrlKey && e.key === 'U') || (e.metaKey && e.key === 'U')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        /************* End --- disabled right inspect element ***************/
        let saveUrl = route('getApprovedVideos', { currentPage: currentPage, ...query });
        if (id) {
            saveUrl = route('getUserApprovedVideos', { id: id, currentPage: currentPage, ...query });
        }
        fetch(url)
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
                    setNumberOfVedios(data.videosCount);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, [currentPage]);

    return (
        <div onContextMenu={handleContextMenu}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>

                        <br></br>
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
                                </div>
                            </Card.Section>
                            {numberOfVedios <= 0 ? (
                                <div style={{ height: "400px", background: "#f9f9f9", borderRadius: "6px", textAlign: "center", paddingTop: "125px", justifyItems: "center", }}>
                                    <img style={{ height: "102px", opacity: ".5" }} src={noVedio}></img>

                                    <p style={{ color: "#d3c9c9", fontSize: "17px" }}>No Approved Videos</p>

                                </div>
                            ) :
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
                                                            onContextMenu={handleContextMenu}
                                                        >
                                                            <video
                                                                width="216"
                                                                height="386"
                                                                ref={(el) => (videoRefs.current[index] = el)}
                                                                muted
                                                                onClick={() => playVideo(index)} // Play on click
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
                                                                {video.approved_video_type == 'star_rating' ? 'Star Approved' : 'Approved'} {video.updated_at}

                                                            </p>
                                                            <p
                                                                style={{
                                                                    fontSize: "12px",
                                                                    color: "#797979",
                                                                }}
                                                            >
                                                                Sent by {video.email}
                                                            </p>

                                                            {/* <button
                                                                onClick={playVideo}
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
                                                                Play
                                                            </button> */}

                                                        </div>
                                                    </Grid.Cell>
                                                );
                                            })}
                                    </Grid>
                                </Card.Section>
                            }
                        </Card>
                    </Grid.Cell>
                </Grid>
                {currentPage >= totalPages ? null : (
                    <div className="button_center">
                        <Button
                            onClick={() =>
                                setCurrentPage((prevPage) => prevPage + 1)
                            }
                        >
                            Load More
                        </Button>
                    </div>
                )}
            </Page>
        </div>
    );
}

export default UserApprovedVideos;
