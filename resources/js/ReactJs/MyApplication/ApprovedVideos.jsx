import {
    Button,
    Card,
    Grid,
    Page,
    Text
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import checkmark from "./imges/checkmark.svg";
import downloadIcon from "./imges/downloadIcon.png";
import noVedio from "./imges/film.png";
import Ticker from "./Ticker";
import { downloadVideo } from "./utils";
import { usePage } from "@inertiajs/react";
function ApprovedVideos() {

    const page = usePage().props;
    const query = page.ziggy.query;

    const [numberOfVedios, setNumberOfVedios] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    /******** Fetching Videos  ******/
    const [videos, setVideos] = useState([]);

    useEffect(() => {

        fetch(route('getApprovedVideos', { page: currentPage, ...query }))
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
        <Page>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                    <Ticker></Ticker>
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
                                        src={checkmark}
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
                            <div style={{ height: "400px", background: "#f9f9f9", borderRadius: "6px", textAlign: "center", paddingTop: "125px" }}>
                                <img style={{ height: "102px", opacity: ".5" }} src={noVedio}></img>

                                <p style={{ color: "#d3c9c9", fontSize: "17px" }}>No Approved Videos</p>

                            </div>
                        ) :
                            <Card.Section>
                                <Grid>
                                    {videos &&
                                        videos.map((video) => {
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
    );
}

export default ApprovedVideos;
