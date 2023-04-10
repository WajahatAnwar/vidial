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
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";


function Resources() {
    return (
        <Page>
            <div style={{ textAlign: "center",marginBottom:"40px" }}>
                <Text variant="headingXl" as="h4">
                    All resources
                </Text>
                <p>
                    Learn the best practices for collecting the best UGC videos from your customers.
                </p>
            </div>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                    <div >
                        <iframe width="100%" height="305px" style={{ borderRadius: "5px" }} src="https://www.youtube.com/embed/cGiSXNK_N00" title="Shopify Explainer Video (Helpful!) What is Shopify and How Does it Work?" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <div style={{padding:"10px"
                        }}>
                        <Text variant="headingXl" as="h4">
                            Getting Started with Vidial
                        </Text>

                        <p style={{marginTop:"5px"}}>
                            Learn how to setup Vidial and all the basic and all the basic functionality of the application to optimize the UGC collection.
                        </p>
                        </div>
                    </div>
                </Grid.Cell>
                {/* <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                    <div >
                        <iframe width="465px" height="305px" style={{ borderRadius: "5px" }} src="https://www.youtube.com/embed/GtDPjlUToKU" title="Shopify Explainer Video (Helpful!) What is Shopify and How Does it Work?" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <div style={{padding:"10px"
                        }}>
                        <Text variant="headingXl" as="h4">
                            Getting Started with Vidial
                        </Text>

                        <p style={{marginTop:"5px"}}>
                            Learn how to setup Vidial and all the basic and all the basic functionality of the application to optimize the UGC collection.
                        </p>
                        </div>
                    </div>
                </Grid.Cell> */}
                {/* <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                    <div >
                        <iframe width="465px" height="305px" style={{ borderRadius: "5px" }} src="https://www.youtube.com/embed/GtDPjlUToKU" title="Shopify Explainer Video (Helpful!) What is Shopify and How Does it Work?" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <div style={{padding:"10px"
                        }}>
                        <Text variant="headingXl" as="h4">
                            Getting Started with Vidial
                        </Text>

                        <p style={{marginTop:"5px"}}>
                            Learn how to setup Vidial and all the basic and all the basic functionality of the application to optimize the UGC collection.
                        </p>
                        </div>
                    </div>
                </Grid.Cell> */}
                {/* <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                    <div >
                        <iframe width="465px" height="305px" style={{ borderRadius: "5px" }} src="https://www.youtube.com/embed/GtDPjlUToKU" title="Shopify Explainer Video (Helpful!) What is Shopify and How Does it Work?" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <div style={{padding:"10px"
                        }}>
                        <Text variant="headingXl" as="h4">
                            Getting Started with Vidial
                        </Text>

                        <p style={{marginTop:"5px"}}>
                            Learn how to setup Vidial and all the basic and all the basic functionality of the application to optimize the UGC collection.
                        </p>
                        </div>
                    </div>
                </Grid.Cell> */}


            </Grid>
        </Page>
    );
}
export default Resources;
