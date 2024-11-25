import AppLayout from '@/ReactJs/Applications/Analytics/AppLayout';
import { Card, Grid, Icon, Page } from "@shopify/polaris";
import { ArrowLeftIcon } from "@shopify/polaris-icons";

import Icon1 from '@/ReactJs/Applications/Analytics/Assets/images/icon1.png';
import Icon2 from '@/ReactJs/Applications/Analytics/Assets/images/icon2.png';
import Icon3 from '@/ReactJs/Applications/Analytics/Assets/images/icon3.png';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from "react";

const Reports = () => {

    const page = usePage().props;
    const { query } = page.ziggy;

    const [responseJson, setResponseJson] = useState(false);
    const [reportContent, setReportContent] = useState({
        ordersCount: 0,
        productsCount: 0,
        collectionsCount: 0,
        ordersLastViewed: '',
        productsLastViewed: '',
        collectionsLastViewed: ''
    });

    const handleOrderRow = async (type) => {
        const formData = new FormData();
        formData.append("type", type);

        try {
            const response = await fetch("/analytics/generate-report-logs", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                if (type == 'order') {
                    router.get("orders");
                } else if (type == 'product') {
                    router.get("products");
                } else if (type == 'collection') {
                    router.get("collections");
                }

            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong");
        }
    }

    useEffect(() => {

        fetch(`/analytics/fetch-report-content`)
            .then((response) => response.json())
            .then((result) => {
                if (result.success) {
                    // console.log(result.data);
                    setResponseJson(result.data);
                    let ordersLastViewed = '', productsLastViewed = '', collectionsLastViewed = ''
                    result.data.reportLogs.forEach(element => {
                        if (element.report_type == 'order') {
                            ordersLastViewed = element.last_viewed;
                        }
                        if (element.report_type == 'product') {
                            productsLastViewed = element.last_viewed;
                        }
                        if (element.report_type == 'collection') {
                            collectionsLastViewed = element.last_viewed;
                        }

                    });

                    setReportContent({
                        ordersCount: result.data.ordersCount,
                        productsCount: result.data.productsCount,
                        collectionsCount: result.data.collectionsCount,
                        ordersLastViewed: ordersLastViewed,
                        productsLastViewed: productsLastViewed,
                        collectionsLastViewed: collectionsLastViewed,
                    })
                }

            })
            .catch((err) => {
                console.log(err);
            });

    }, [])

    return (
        <div style={{ background: `url('${window.appURL}/images/background.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => router.get(route('index_analytics', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Reports</div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
                <div style={{ marginTop: "18px" }}></div>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <div style={{ marginRight: "30px", cursor: "pointer" }} onClick={() => handleOrderRow('order')} >
                            <Card>
                                <img src={Icon1} width="45px"></img>
                                <p style={{ fontSize: "20px", fontWeight: "700", paddingTop: "18px", }}>List Of Orders</p>
                                <p style={{ color: "#8C9196", fontSize: "14px", fontWeight: "600", paddingTop: "18px", }}>Total <span style={{ color: "black", fontSize: "18px", paddingLeft: "5px", }}>{responseJson.ordersCount}</span></p>
                                <p style={{ paddingTop: "18px", color: "#ABABAB", fontSize: "12px", }}>Last Viewed</p>
                                <p style={{ fontSize: "12px", fontWeight: "600", }}>{reportContent.ordersLastViewed}</p>
                            </Card>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <div style={{ marginLeft: "15px", marginRight: "15px", cursor: "pointer" }} onClick={() => handleOrderRow('product')} >
                            <Card>
                                <img src={Icon2} width="45px"></img>
                                <p style={{ fontSize: "20px", fontWeight: "700", paddingTop: "18px", }}>List Of Products</p>
                                <p style={{ color: "#8C9196", fontSize: "14px", fontWeight: "600", paddingTop: "18px", }}>Total <span style={{ color: "black", fontSize: "18px", paddingLeft: "5px", }}>{responseJson.productsCount}</span></p>
                                <p style={{ paddingTop: "18px", color: "#ABABAB", fontSize: "12px", }}>Last Viewed</p>
                                <p style={{ fontSize: "12px", fontWeight: "600", }}>{reportContent.productsLastViewed}</p>
                            </Card>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <div style={{ marginLeft: "30px", cursor: "pointer" }} onClick={() => handleOrderRow('collection')} >
                            <Card>
                                <img src={Icon3} width="45px"></img>
                                <p style={{ fontSize: "20px", fontWeight: "700", paddingTop: "18px", }}>List Of Collections</p>
                                <p style={{ color: "#8C9196", fontSize: "14px", fontWeight: "600", paddingTop: "18px", }}>Total <span style={{ color: "black", fontSize: "18px", paddingLeft: "5px", }}>{responseJson.collectionsCount}</span></p>
                                <p style={{ paddingTop: "18px", color: "#ABABAB", fontSize: "12px", }}>Last Viewed</p>
                                <p style={{ fontSize: "12px", fontWeight: "600", }}>{reportContent.collectionsLastViewed}</p>
                            </Card>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Page >
        </div >
    );

    function disambiguateLabel(key, value) {
        switch (key) {
            case "filterbytype":
                return `Filtered by ${value.map((val) => val).join(", ")}`;
            default:
                return value;
        }
    }

    function isEmpty(value) {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === "" || value == null;
        }
    }
}

Reports.layout = (page) => (
    <AppLayout children={page} auth={page.props.auth} />
);
export default Reports;
