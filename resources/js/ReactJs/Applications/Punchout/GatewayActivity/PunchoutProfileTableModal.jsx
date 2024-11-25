import GatewayActivityHistory from "@/ReactJs/Applications/Punchout/GatewayActivity/GatewayActivityHistory";
import GatewayActivityNotes from "@/ReactJs/Applications/Punchout/GatewayActivity/GatewayActivityNotes";
import GatewayActivityOrginalDetails from "@/ReactJs/Applications/Punchout/GatewayActivity/GatewayActivityOrginalDetails";
import GatewayActivityRequest from "@/ReactJs/Applications/Punchout/GatewayActivity/GatewayActivityRequest";
import { Document, Page, pdf, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Button, Modal, Spinner, Tabs, TextField, Text as TextPolaris } from '@shopify/polaris';
import { ImportIcon } from '@shopify/polaris-icons';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useEffect, useState } from 'react';
import SummaryInvoice from "./SummaryInvoice";
import { CircularProgress } from "@mui/material";
import OriginalOrderPrint from "./OriginalOrderPrint";
import ConfirmedOrderPrint from "./ConfirmedOrderPrint";
import ReactDOMServer from 'react-dom/server'
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

function PunchoutProfileTableModal({ orderPayload, handleChangePreparePunchout }) {

    const [orderRequest, setOrderRequest] = useState(false);

    useEffect(() => {
        fetch(route('punchout.orderRequests.detail', { order: orderPayload.id }))
            .then(response => response.json())
            .then(result => {
                console.log(result);
                setOrderRequest(result);
                setOrderShipping(parseFloat(result.pomw_confirmed_order.shipping_total).toFixed(2))
                setOrderTax(parseFloat(result.pomw_confirmed_order.tax_total).toFixed(2))
                setORGOrderShipping(parseFloat(result.shipping_total).toFixed(2))
                setORGOrderTax(parseFloat(result.tax_total).toFixed(2))
            });

    }, []);

    const handleRecreateConfirmOrder = async () => {
        toast.loading('...loading')
        const response = await fetch(route('punchout.orderRequests.recreate', { order: orderPayload.id }), {
            method: 'POST',
        });

        const result = await response.json();

        toast.dismiss()
        if (result.success) {
            toast.success('Recreated confirmed order successfully')
             handleChangeAdvanceActions()
        } else {
            if (response.status === 403) {
                toast.error("You don't have write permissions.")
            }
            else {
                toast.error("error")
            }
        }
    };

    function convertISOToYMD(isoDateString) {
        var date = new Date(Date.parse(isoDateString));

        var year = date.getUTCFullYear();
        var month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
        var day = String(date.getUTCDate()).padStart(2, '0');

        var hours = String(date.getUTCHours()).padStart(2, '0');
        var minutes = String(date.getUTCMinutes()).padStart(2, '0');
        var seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const styles = StyleSheet.create({
        page: {
            padding: '20px 0px',
            display: 'flex',
            flexDirection: 'row',
        },
        header: {
            backgroundColor: '#F4F4F4',
            paddingBottom: 10,
            fontSize: 20,
        },
        list: {
            padding: '8px 0px',
        },
        item: {
            display: 'flex',
            flexDirection: 'row',
            // justifyContent: 'space-between',
            flexWrap: 'wrap',
            fontSize: 16,
            marginBottom: 15,
        },
        contentOne: {
            width: '50%',
            fontSize: 16,
            color: '#535353',
            fontWeight: 700,

        },
        contentTwo: {
            width: '50%',
            fontSize: 14,
            fontWeight: 400,
            color: '#949494',
        },
        card: {
            marginBottom: 16,
            padding: '20px 0px',
            width: '100%',
        },

        carddelivered: {
            marginBottom: 16,
            padding: 20,
            width: '100%',
        },
    });

    const Detailsstyles = StyleSheet.create({
        Detailspage: {
            padding: 20,
            display: 'flex',
            flexDirection: 'row',
        },
        DetailspageTwo: {

            padding: '0 20px',
            display: 'flex',
            flexDirection: 'row',
        },
        heading: {
            display: 'block',
            marginBottom: 10,
            fontSize: 22,
            fontWeight: 700,
            color: '#333',
        },
        heading2: {
            display: 'block',
            marginBottom: 0,
            fontSize: 22,
            fontWeight: 700,
            color: '#333',
            marginLeft: 20,
        },
        hr: {
            borderBottomColor: '#EBEBEB',
            borderBottomWidth: 1,
            margin: "15px 0px",
            borderStyle: "solid",
            width: "100%",
        },
        Detailsheader: {
            backgroundColor: '#F4F4F4',
            paddingBottom: 10,
            fontSize: 14,
        },
        Detailslist: {
            padding: '8px 0px',
        },
        DetailslistShipping: {
            display: 'inline-block',
            marginTop: 0,
        },
        itemOne: {
            display: 'flex',
            flexDirection: 'row',
            gap: 15,
            flexWrap: 'wrap',
            fontSize: 12,
            marginBottom: 3,
        },
        itemTwo: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            fontSize: 11,
            marginBottom: 10,
        },
        boldText: {
            color: "#535353",
            fontSize: 12,
            fontWeight: 700,
            width: '100%',

        },
        mainContent: {
            color: "#333",
            fontSize: 16,
            fontWeight: 700,
        },
        contentOne: {

            fontSize: 16,
            color: '#6D6D6D',
            fontWeight: 400,


        },
        contentTwo: {

            fontSize: 14,
            fontWeight: 400,
            color: '#6D6D6D',
            display: 'flex',
            width: '60%',
            // marginTop: 15,
        },


        OrdersContentTwo: {
            fontSize: 14,
            fontWeight: 400,
            color: '#6D6D6D',
            display: 'flex',
            width: '60%',
            marginTop: 15,
        },
        orderscontent: {
            fontSize: 14,
            fontWeight: 400,
            marginTop: 0,
            color: '#949494',
        },
        Detailscard: {
            marginBottom: 0,
            padding: '0 20px',
            width: '60%',
        },
        DetailscardTwo: {
            marginBottom: 0,
            padding: '0 20px',
            width: '40%',
        },
        DetailscardThree: {
            marginBottom: 0,
            padding: 20,
            width: '60%',
        },
        DetailscardFour: {
            marginBottom: 0,
            padding: 20,
            width: '40%',
        },
        DetailscardFive: {
            display: 'block',
            marginBottom: 0,
            padding: 20,
            // width: '65%',
        },
        mainorderList: {
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            // border: "1px solid rgb(202, 198, 198)",
            borderRadius: "5px",
            marginBottom: 20,
        },
        ordersList: {
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
        },
        recepitMainText: {

            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'end',
            gap: 15,
            width: "450px",
            float: "right",
        },
        recepitText: {
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            textAlign: 'right',
            color: '#FF3E84'
        },
        Detailshr: {
            display: "block",
            width: "100%",
            marginTop: 30,
            marginBottom: 30,
        }
    });

    const [selected, setSelected] = useState(0);
    const handleTabChange = useCallback((selectedTabIndex) => {
        // console.log(selectedTabIndex);
        setSelected(selectedTabIndex);
    }, []);


    const tabs = [
        {
            id: 'Summary',
            content: 'Summary',
            panelID: 'Summary-1',
        },
        {
            id: 'Original-Details',
            content: 'Original Details',
            panelID: 'Original-Details-1',
        },
        {
            id: 'Confirmed-Order',
            content: 'Confirmed Order',
            panelID: 'Confirmed-Order-1',
        },
        {
            id: 'Notes',
            content: 'Notes',
            panelID: 'Notes-1',
        },
        {
            id: 'History',
            content: 'History',
            panelID: 'History-1',
        },
        {
            id: 'Requests',
            content: 'Requests',
            panelID: 'Requests-1',
        },
    ];

    const [active, setActive] = useState(false);
    const [activeAdvanceActions, setActiveAdvanceActions] = useState(false);

    const handleChangeAdvanceActions = () => {
        if (active) {
            handleChange()
        }
        setActiveAdvanceActions(!activeAdvanceActions)
    };

    const handleChange = () => {
        if (activeAdvanceActions) {
            handleChangeAdvanceActions()
        }
        setActive(!active)
    };

    const [createinvoiceactive, setCreateInvoiceActive] = useState(false);
    const [createinvoiceorgactive, setCreateInvoiceORGActive] = useState(false);

    const [orderShipping, setOrderShipping] = useState();

    const handleShippingChange = useCallback(
        (newValue) => setOrderShipping(newValue),
        [],
    );

    const [oRGOrderShipping, setORGOrderShipping] = useState();

    const handleORGShippingChange = useCallback(
        (newValue) => setORGOrderShipping(newValue),
        [],
    );

    const [orderQuantity, setOrderQuantity] = useState({
        quantity: '',
        show: false,
    });

    const handleQuantityChange = (newValue, item) => {
        setOrderQuantity({
            ...orderQuantity,
            [item.id]: {
                quantity: newValue,
                show: true,
            }
        })
    }

    const [orderTax, setOrderTax] = useState();

    const handleTaxChange = useCallback(
        (newValue) => setOrderTax(newValue),
        [],
    );
    const [oRGOrderTax, setORGOrderTax] = useState();

    const handleORGTaxChange = useCallback(
        (newValue) => setORGOrderTax(newValue),
        [],
    );

    const [orderPrice, setOrderPrice] = useState({
        price: '',
        show: false,
    });

    const handlePriceChange = (newValue, item) => {
        setOrderPrice({
            ...orderPrice,
            [item.id]: {
                price: newValue,
                show: true,
            }
        })
    }

    const handleCreateInvoiceGet = useCallback(() => {
        setOrderQuantity({
            quantity: '',
            show: false,
        });
        setOrderPrice({
            price: '',
            show: false,
        });
        setCreateInvoiceActive(!createinvoiceactive)
    }, [createinvoiceactive]);

    const handleOriginalOrderInvoice = useCallback(() => {
        setOrderQuantity({
            quantity: '',
            show: false,
        });
        setOrderPrice({
            price: '',
            show: false,
        });
        setCreateInvoiceORGActive(!createinvoiceorgactive)
    }, [createinvoiceorgactive]);

    const [loading, setLoading] = useState(false)

    const [errors, setErrors] = useState(false)

    const handleCreateInvoicePost = async () => {
        setLoading(true)

        let formData = new FormData();
        formData.append('id', orderRequest.id);
        formData.append('shipping', orderShipping);
        formData.append('tax', orderTax);
        for (const [id, item] of Object.entries(orderQuantity)) {
            if (id != 'quantity' && id != "show") {
                formData.append(`items_quantity[${id}]`, item.quantity);
            }
        }
        for (const [id, item] of Object.entries(orderPrice)) {
            if (id != 'price' && id != "show") {
                formData.append(`items_price[${id}]`, item.price);
            }
        }

        setErrors(false)

        const response = await fetch(route('punchout.createinvoice.post'), {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        setLoading(false);
        if (result.success) {
            handleCreateInvoiceGet()
            Swal.fire({
                icon: 'success',
                title: 'Created...',
                text: 'Invoices created successfully',
            });
            handleChangePreparePunchout()
        } else {
            if (response.status === 403) {

                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permissions.",
                });
            }
            else {

                setErrors(result.errors)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    }
    const handleCreateORGInvoicePost = async () => {
        setLoading(true)

        let formData = new FormData();
        formData.append('id', orderRequest.id);
        formData.append('shipping', oRGOrderShipping);
        formData.append('tax', oRGOrderTax);
        for (const [id, item] of Object.entries(orderQuantity)) {
            if (id != 'quantity' && id != "show") {
                formData.append(`items_quantity[${id}]`, item.quantity);
            }
        }
        for (const [id, item] of Object.entries(orderPrice)) {
            if (id != 'price' && id != "show") {
                formData.append(`items_price[${id}]`, item.price);
            }
        }

        setErrors(false)

        const response = await fetch(route('punchout.createinvoiceORG.post'), {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        setLoading(false);
        if (result.success) {
            handleOriginalOrderInvoice()
            handleChangeAdvanceActions()
        } else {
            if (response.status === 403) {

                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permissions.",
                });
            }
            else {
                setErrors(result.errors)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    }

    const handlePrintOriginal = () => {
        const printContents = ReactDOMServer.renderToString(<OriginalOrderPrint orderRequest={orderRequest} convertISOToYMD={convertISOToYMD} Detailsstyles={Detailsstyles} />);
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
      <html>
        <head>
          <title>Order #${orderRequest.internal_id}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { text-align: center; }
            .Detailspage { padding: 20px; }
            .DetailscardTwo { border: 1px solid #ccc; margin-bottom: 16px; padding: 20px; }
            hr{
            display: block;
            }
            /* Add more styles as needed */
          </style>
        </head>
        <body>
        ${printContents}
        </body>
      </html>
    `);
        newWindow.document.close();
        newWindow.print();
        handleChange()
    };
    const handlePrintConfirmed = () => {
        const printContents = ReactDOMServer.renderToString(<ConfirmedOrderPrint orderRequest={orderRequest} convertISOToYMD={convertISOToYMD} Detailsstyles={Detailsstyles} />);
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
      <html>
        <head>
          <title>Order #${orderRequest.internal_id}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { text-align: center; }
            .Detailspage { padding: 20px; }
            .DetailscardTwo { border: 1px solid #ccc; margin-bottom: 16px; padding: 20px; }
            hr{
            display: block;
            }
            /* Add more styles as needed */
          </style>
        </head>
        <body>
        ${printContents}
        </body>
      </html>
    `);
        newWindow.document.close();
        newWindow.print();
        handleChange()
    };

    const downloadHTML = () => {
        const htmlContent = ReactDOMServer.renderToString(<ConfirmedOrderPrint orderRequest={orderRequest} convertISOToYMD={convertISOToYMD} Detailsstyles={Detailsstyles} />);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Order_${orderRequest.internal_id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        handleChange()
    };
    const downloadOriginalCXML = () => {
        const request = orderRequest.pomw_session.pomw_client_request.filter(request => request.type === 'IncomingOrderRequest');
        const cxml = request[0].request_data.replace(/^<\?xml.*\?>\s*/, '')
            .replace(/^<!DOCTYPE.*?>\s*/, '');
        const blob = new Blob([cxml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ORG_ORDER_${orderRequest.internal_id}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        handleChange()
    };
    const downloadFilteredCXML = () => {
        const request = orderRequest.pomw_session.pomw_client_request.filter(request => request.type === 'IncomingOrderRequest');
        const cxml = request[0].decoded_request_data.replace(/^<\?xml.*\?>\s*/, '')
            .replace(/^<!DOCTYPE.*?>\s*/, '');
        const blob = new Blob([cxml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `FILTERED_ORDER_${orderRequest.internal_id}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        handleChange()
    };


    return (
        <div>
            <Toaster
                position="top-right"
                reverseOrder={true}
            />
            <span className='menu-tabs-top-popup-PO'>
                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
            </span>
            {orderRequest ?
                selected === 0 ? <div className="pt-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TextPolaris variant="headingLg" as="h5">
                            Gateway Order Request  : {orderRequest && orderRequest.internal_id}
                        </TextPolaris>
                        <div className="multi-color-btn modal-pop-up-multi-btn">
                            <Button disabled={orderRequest ? false : true} onClick={handleCreateInvoiceGet}>Create Invoice </Button>
                            {/* <Button>Create Credit Memo</Button> */}
                        </div>
                    </div>
                    <Document>
                        <Page style={styles.page}>
                            <View style={styles.card}>
                                <View style={styles.list}>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Date :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && convertISOToYMD(orderRequest.created_at)}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>DB ID:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.id}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Client:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.pomw_client.name}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Client Order:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.internal_id}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Customer:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.pomw_customer.name}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Items Count:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.pomw_order_items.length}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Status:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.is_delivered ? 'Delivered' : 'Undevlivered'}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Approved:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.is_approved ? 'Yes' : 'No'}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Rejected:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.is_rejected ? 'Yes' : 'No'}</p>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.card}>
                                <View style={styles.list}>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Delivered:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.is_delivered ? 'Yes' : 'No'}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>External ID:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.external_id}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Total:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>${orderRequest && parseInt(orderRequest.total).toFixed(2)} USD</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Confirmed Order Total:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>${orderRequest && parseInt(orderRequest.total).toFixed(2)} USD</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Confirmed Order Matches:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.confirmed_order_total_matches ? 'Yes' : 'No'}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Shipping Total:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>${orderRequest && parseInt(orderRequest.shipping_total).toFixed(2)} USD</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Discount Total:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>${orderRequest && !isNaN(parseInt(orderRequest.discount_total)) ? parseInt(orderRequest.discount_total).toFixed(2) : '0.00'} USD</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Tax Total:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>${orderRequest && parseInt(orderRequest.tax_total).toFixed(2)} USD</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Punchout Session:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{orderRequest && orderRequest.pomw_session.session_key}</p>
                                    </View>
                                </View>
                            </View>
                        </Page>
                    </Document>
                </div>
                    : selected === 1 ? <div className="pt-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TextPolaris variant="headingLg" as="h5">
                            </TextPolaris>
                            <div className="multi-color-btn modal-pop-up-multi-btn">
                                <Button disabled={orderRequest ? false : true} onClick={handleCreateInvoiceGet}>Create Invoice</Button>
                                {/* <Button>Create Credit Memo</Button> */}
                            </div>
                        </div>
                        <div className="pop-code-wrapper">
                            <Document>
                                <Page>
                                    <View style={Detailsstyles.Detailspage}>
                                        <View style={Detailsstyles.Detailscard}>
                                            <View style={Detailsstyles.list}>
                                                <View>
                                                    <Text style={Detailsstyles.heading}> Account Information</Text>
                                                </View>
                                                <View style={Detailsstyles.itemOne}>
                                                    <Text style={Detailsstyles.mainContent}>Customer Name:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_customer.name}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemOne}>
                                                    <Text style={Detailsstyles.mainContent}>Customer Email:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_customer.email}</Text>
                                                </View>
                                            </View>
                                            <hr style={Detailsstyles.Detailshr} />
                                            <View style={Detailsstyles.DetailslistShipping}>
                                                <View>
                                                    <Text style={Detailsstyles.heading}>Shipping Address</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.label}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.country}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.deliver_to}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.state + ", " + orderRequest.pomw_confirmed_order.shipping_address.zip}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.line1}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.city}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={Detailsstyles.DetailscardTwo}>


                                            <Text style={Detailsstyles.heading}>Order # {orderRequest && orderRequest.internal_id}</Text>
                                            <View style={Detailsstyles.list}>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Order Date :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && convertISOToYMD(orderRequest.created_at)}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Total :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.total).toFixed(2)} USD</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Approved :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.is_approved ? 'Yes' : 'No'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Rejected :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.is_rejected ? 'Yes' : 'No'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Deliverd :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.is_delivered ? 'Yes' : 'No'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Client :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_client.name}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Placed from IP :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.remote_ip}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>External ID :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.external_id}</Text>
                                                </View>

                                            </View>
                                        </View>
                                    </View>
                                    <hr style={Detailsstyles.Detailshr} />
                                    <View style={Detailsstyles.DetailspageTwo}>
                                        <View style={Detailsstyles.DetailscardThree}>
                                            <View style={Detailsstyles.DetailslistShipping}>
                                                <View>
                                                    <Text style={Detailsstyles.heading}>Billing Address </Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.label}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.country}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.deliver_to}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.state + ", " + orderRequest.pomw_confirmed_order.shipping_address.zip}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.line1}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.city}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={Detailsstyles.DetailscardFour}>
                                            <Text style={Detailsstyles.heading}>Order Totals  </Text>
                                            <View style={Detailsstyles.list}>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Grand Total</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.total).toFixed(2)} USD</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Shipping</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.shipping_total).toFixed(2)} USD</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Tax</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && !isNaN(parseInt(orderRequest.discount_total)) ? parseInt(orderRequest.discount_total).toFixed(2) : '0.00'} USD</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Total Due</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.total).toFixed(2)} USD</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <hr style={Detailsstyles.Detailshr} />
                                    <View style={Detailsstyles.DetailscardFive}>
                                        <View>
                                            <Text style={Detailsstyles.heading2}>Items Ordered</Text>
                                        </View>
                                        {
                                            orderRequest && orderRequest.pomw_order_items.map((item, index) => (
                                                <View key={index} style={Detailsstyles.mainorderList}>
                                                    <View style={Detailsstyles.ordersList}>
                                                        <Text style={Detailsstyles.boldText}>Product:</Text>
                                                        <Text style={Detailsstyles.orderscontent}>{item.description}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.ordersList}>
                                                        <Text style={Detailsstyles.boldText}>Supplier Part Id:</Text>
                                                        <Text style={Detailsstyles.orderscontent}>{item.supplier_part_id}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.ordersList}>
                                                        <Text style={Detailsstyles.boldText}>Supplier Part Aux Id:</Text>
                                                        <Text style={Detailsstyles.orderscontent}>{item.supplier_auxiliary_id}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.ordersList}>
                                                        <Text style={Detailsstyles.boldText}>Manufacturer:</Text>
                                                        <Text style={Detailsstyles.orderscontent}>{item.manufacturer_name}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.ordersList}>
                                                        <Text style={Detailsstyles.boldText}>Classification:</Text>
                                                        <Text style={Detailsstyles.orderscontent}>{item.classification}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.ordersList}>
                                                        <Text style={Detailsstyles.boldText}>UOM:</Text>
                                                        <Text style={Detailsstyles.orderscontent}>{item.unit_of_measure}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.ordersList}>
                                                        <Text style={Detailsstyles.boldText}>Lead Time:</Text>
                                                        <Text style={Detailsstyles.orderscontent}>{item.leadtime}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.ordersList}>
                                                        <Text style={Detailsstyles.boldText}>Quantity:</Text>
                                                        <Text style={Detailsstyles.orderscontent}>{item.quantity}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.ordersList}>
                                                        <Text style={Detailsstyles.boldText}>Unit Price:</Text>
                                                        <Text style={Detailsstyles.orderscontent}>${item.unit_price} USD
                                                        </Text>
                                                    </View>
                                                    <View style={Detailsstyles.ordersList}>
                                                        <Text style={Detailsstyles.boldText}>Total:</Text>
                                                        <Text style={Detailsstyles.orderscontent}>${item.unit_price * item.quantity} USD</Text>
                                                    </View>
                                                </View>
                                            ))
                                        }
                                    </View>
                                    <View style={Detailsstyles.recepitMainText}>
                                        <Text style={Detailsstyles.recepitText} onClick={handleChangeAdvanceActions} >Advanced Actions</Text>
                                        <Text style={Detailsstyles.recepitText} onClick={handleChange}>Download Receipts</Text>
                                    </View>
                                    <hr style={Detailsstyles.Detailshr} />
                                    <View style={Detailsstyles.DetailscardThree}>
                                        <View style={Detailsstyles.hr}></View>
                                        <View style={Detailsstyles.ordersList}>
                                            <Text style={Detailsstyles.heading}>Shipping Method:</Text>
                                            <Text style={Detailsstyles.orderscontent}>Method: {orderRequest && orderRequest.pomw_confirmed_order.shipping_method}</Text>
                                        </View>
                                    </View>
                                </Page>
                            </Document>
                        </div>
                    </div>
                        : selected === 2 ? <div className="">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <TextPolaris variant="headingLg" as="h5">
                                </TextPolaris>
                                <div className="multi-color-btn modal-pop-up-multi-btn">
                                    <Button disabled={orderRequest ? false : true} onClick={handleCreateInvoiceGet}>Create Invoice</Button>
                                    {/* <Button>Create Credit Memo</Button> */}
                                </div>
                            </div>
                            <div className="pop-code-wrapper">
                                <Document>
                                    <Page>
                                        <View style={Detailsstyles.Detailspage}>
                                            <View style={Detailsstyles.Detailscard}>
                                                <View style={Detailsstyles.list}>
                                                    <View>
                                                        <Text style={Detailsstyles.heading}> Account Information</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemOne}>
                                                        <Text style={Detailsstyles.mainContent}>Name:</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_customer.name}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemOne}>
                                                        <Text style={Detailsstyles.mainContent}>Customer Email:</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_customer.email}</Text>
                                                    </View>
                                                </View>
                                                <hr style={Detailsstyles.Detailshr} />
                                                <View style={Detailsstyles.DetailslistShipping}>
                                                    <View>
                                                        <Text style={Detailsstyles.heading}>Shipping Address</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.label}</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.country}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.deliver_to}</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.state + ", " + orderRequest.pomw_confirmed_order.shipping_address.zip}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.line1}</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.city}</Text>
                                                    </View>
                                                </View>
                                                <hr style={Detailsstyles.Detailshr} />
                                            </View>
                                            <View style={Detailsstyles.DetailscardTwo}>
                                                <Text style={Detailsstyles.heading}>Order # {orderRequest && orderRequest.pomw_confirmed_order.external_id}</Text>
                                                <View style={Detailsstyles.list}>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Confirmed Date :</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && convertISOToYMD(orderRequest.pomw_confirmed_order.date)}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Total :</Text>
                                                        <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.pomw_confirmed_order.total).toFixed(2)} USD</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Approved :</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.is_approved ? 'Yes' : 'No'}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Rejected :</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.is_rejected ? 'Yes' : 'No'}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Deliverd :</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.is_delivered ? 'Yes' : 'No'}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Client :</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_client.name}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Placed from IP :</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.remote_ip}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={Detailsstyles.DetailspageTwo}>
                                            <View style={Detailsstyles.DetailscardThree}>
                                                <View style={Detailsstyles.DetailslistShipping}>
                                                    <View>
                                                        <Text style={Detailsstyles.heading}>Billing Address</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.label}</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.country}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.deliver_to}</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.state + ", " + orderRequest.pomw_confirmed_order.shipping_address.zip}</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.line1}</Text>
                                                        <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.city}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={Detailsstyles.DetailscardFour}>
                                                <Text style={Detailsstyles.heading}>Order Totals </Text>
                                                <View style={Detailsstyles.list}>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Grand Total</Text>
                                                        <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.pomw_confirmed_order.total).toFixed(2)} USD</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Shipping</Text>
                                                        <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.pomw_confirmed_order.shipping_total).toFixed(2)} USD</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Tax</Text>
                                                        <Text style={Detailsstyles.contentTwo}>${orderRequest && !isNaN(parseInt(orderRequest.pomw_confirmed_order.discount_total)) ? parseInt(orderRequest.discount_total).toFixed(2) : '0.00'} USD</Text>
                                                    </View>
                                                    <View style={Detailsstyles.itemTwo}>
                                                        <Text style={Detailsstyles.boldText}>Total Due</Text>
                                                        <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.pomw_confirmed_order.total).toFixed(2)} USD</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        <hr style={Detailsstyles.Detailshr} />
                                        <View style={Detailsstyles.DetailscardFive}>
                                            <View>
                                                <Text style={Detailsstyles.heading2}>Items Ordered</Text>
                                            </View>
                                            {
                                                orderRequest && orderRequest.pomw_confirmed_order.confirmed_order_items.map((item, index) => (
                                                    <View key={index} style={Detailsstyles.mainorderList}>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Product:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.description}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Supplier Part Id:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.supplier_part_id}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Supplier Part Aux Id:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.supplier_auxiliary_id}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Manufacturer:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.manufacturer_name}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Classification:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.classification}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>UOM:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.unit_of_measure}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Lead Time:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.leadtime}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Quantity:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.quantity}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Unit Price:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>${item.unit_price} USD
                                                            </Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Total:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>${item.unit_price * item.quantity} USD</Text>
                                                        </View>
                                                    </View>
                                                ))
                                            }
                                        </View>
                                        <View style={Detailsstyles.recepitMainText}>
                                            <Text style={Detailsstyles.recepitText} onClick={handleChangeAdvanceActions} >Advanced Actions</Text>
                                            <Text style={Detailsstyles.recepitText} onClick={handleChange}>Download Recepits</Text>
                                        </View>
                                        <hr style={Detailsstyles.Detailshr} />
                                        <View style={Detailsstyles.DetailscardThree}>
                                            <View style={Detailsstyles.hr}></View>
                                            <View style={Detailsstyles.ordersList}>
                                                <Text style={Detailsstyles.heading}>Shipping Method:</Text>
                                                <Text style={Detailsstyles.orderscontent}>Method: {orderRequest && orderRequest.pomw_confirmed_order.shipping_method}</Text>
                                            </View>
                                        </View>
                                    </Page>
                                </Document>
                            </div>
                        </div>
                            : selected === 3 ? <div className="">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TextPolaris variant="headingLg" as="h5">
                                    </TextPolaris>
                                    <div className="multi-color-btn modal-pop-up-multi-btn">
                                        <Button disabled={orderRequest ? false : true} onClick={handleCreateInvoiceGet}>Create Invoice</Button>
                                        {/* <Button>Create Credit Memo</Button> */}
                                    </div>
                                </div>
                                <div className="pop-code-wrapper">
                                    <GatewayActivityNotes order={orderRequest} handleChangePreparePunchout={handleChangePreparePunchout} />
                                </div>
                            </div>
                                : selected === 4 ? <div className="">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <TextPolaris variant="headingLg" as="h5">
                                        </TextPolaris>
                                        <div className="multi-color-btn modal-pop-up-multi-btn">
                                            <Button disabled={orderRequest ? false : true} onClick={handleCreateInvoiceGet}>Create Invoice</Button>
                                            {/* <Button>Create Credit Memo</Button> */}
                                        </div>
                                    </div>
                                    <div className="pop-code-wrapper">
                                        <GatewayActivityHistory orderRequest={orderRequest} />
                                    </div>
                                </div>
                                    : selected === 5 ? <div className="">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                            <TextPolaris variant="headingLg" as="h5">

                                            </TextPolaris>
                                            <div className="multi-color-btn modal-pop-up-multi-btn">
                                                <Button disabled={orderRequest ? false : true} onClick={handleCreateInvoiceGet}>Create Invoice</Button>
                                                {/* <Button>Create Credit  Memo</Button> */}
                                            </div>
                                        </div>
                                        <div className="pop-code-wrapper">
                                            <GatewayActivityRequest orderRequest={orderRequest} />
                                        </div>
                                    </div>
                                        : null : <CircularProgress></CircularProgress>}


            <Modal
                open={active}
                onClose={handleChange}
                size="small"
            >
                <div className="custom-modal">
                    <Modal.Section>
                        <div>
                            <p style={{ color: "#494949", fontSize: "18px", fontWeight: "700", padding: "0px 10px" }}>
                                <Text variant="headingMd" as="h6">Downloads Versions</Text>
                            </p>
                            <div style={{ margin: '10px 0px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px" }}>
                                <a onClick={handlePrintOriginal} href="#" style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                    Print
                                </a>
                                <p className="custom-icon">
                                    <ImportIcon width={20} onClick={handlePrintOriginal} />
                                </p>
                            </div>
                            <hr />
                            <div style={{ margin: '10px 0px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px" }}>
                                <a onClick={downloadOriginalCXML} href="#" style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                    Original CXML
                                </a>
                                <p className="custom-icon" onClick={downloadOriginalCXML}>
                                    <ImportIcon width={20} />
                                </p>
                            </div>
                            <hr />
                            <div style={{ margin: '10px 0px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px" }}>
                                <a onClick={downloadFilteredCXML} href="#" style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                    Filtered CXML
                                </a>
                                <p className="custom-icon" onClick={downloadFilteredCXML}>
                                    <ImportIcon width={20} />

                                </p>
                            </div>
                            <hr />
                            <div style={{ margin: '10px 0px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px" }}>
                                <a href="#" onClick={downloadHTML} style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                    Simple HTML
                                </a>
                                <p className="custom-icon" onClick={downloadHTML}>
                                    <ImportIcon width={20} />
                                </p>
                            </div>
                            <hr />
                            <div style={{ margin: '10px 0px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px" }}>
                                <a href="#" onClick={handlePrintConfirmed} style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                    Print Confirmed Order
                                </a>
                                <p className="custom-icon" onClick={handlePrintConfirmed} >
                                    <ImportIcon width={20} />
                                </p>
                            </div>
                        </div>
                    </Modal.Section>
                </div>
            </Modal>

            <Modal
                open={activeAdvanceActions}
                onClose={handleChangeAdvanceActions}
                size="small"
            >
                <div className="custom-modal">
                    <Modal.Section>
                        <div>
                            <p style={{ color: "#494949", fontSize: "18px", fontWeight: "700", padding: "0px 10px" }}>
                                <Text variant="headingMd" as="h6">Advance Actions</Text>
                            </p>
                            <div style={{ marginTop: "10px", margin: '10px 0px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px" }}>
                                <a onClick={handleOriginalOrderInvoice} href="#" style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                    Create Invoice From Original Order
                                </a>
                                <p className="custom-icon" onClick={handleOriginalOrderInvoice}>
                                    <ImportIcon width={20} />

                                </p>
                            </div>
                            <hr />
                            <div style={{ marginTop: "10px", margin: '10px 0px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px" }}>
                                <a onClick={handleRecreateConfirmOrder} href="#" style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                    Recreate Confirmed Order
                                </a>
                                <p className="custom-icon" onClick={handleRecreateConfirmOrder}>
                                    <ImportIcon width={20} />

                                </p>
                            </div>
                            <hr />
                        </div>
                    </Modal.Section>
                </div>
            </Modal>




            <Modal
                open={createinvoiceactive}
                onClose={handleCreateInvoiceGet}
                size="Large"
            >
                <div className="custom-modal">
                    <Modal.Section>
                        <div className="pop-code-wrapper">
                            <Document>
                                <Page>
                                    {/* <Button onClick={handleDownloadAndOpen}>Create Invoice </Button>  */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                                        <TextPolaris variant="headingLg" as="h5">
                                            Create Invoice for Order Request: {orderRequest && orderRequest.internal_id}
                                        </TextPolaris>
                                        <div className="multi-color-btn modal-pop-up-multi-btn">
                                            <Button disabled={loading} onClick={handleCreateInvoicePost}>{loading ? <Spinner size="small"></Spinner > : 'Create Invoice'}</Button>
                                        </div>
                                    </div>
                                    <View style={Detailsstyles.Detailspage}>
                                        <View style={Detailsstyles.Detailscard}>
                                            <View style={Detailsstyles.list}>
                                                <View>
                                                    <Text style={Detailsstyles.heading}> Account Information</Text>
                                                </View>
                                                <View style={Detailsstyles.itemOne}>
                                                    <Text style={Detailsstyles.mainContent}>Name:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_customer.name}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemOne}>
                                                    <Text style={Detailsstyles.mainContent}>Customer Email:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_customer.email}</Text>
                                                </View>
                                            </View>
                                            <hr style={Detailsstyles.Detailshr} />
                                            <View style={Detailsstyles.DetailslistShipping}>
                                                <View>
                                                    <Text style={Detailsstyles.heading}>Shipping Address</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.label}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.country}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.deliver_to}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.state + ", " + orderRequest.pomw_confirmed_order.shipping_address.zip}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.line1}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.city}</Text>
                                                </View>
                                            </View>
                                            <hr style={Detailsstyles.Detailshr} />
                                        </View>

                                        <View style={Detailsstyles.DetailscardTwo}>

                                            <Text style={Detailsstyles.heading}>Order #{orderRequest && orderRequest.external_id}</Text>
                                            <View style={Detailsstyles.list}>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Order Date :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && convertISOToYMD(orderRequest.created_at)}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Total :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.pomw_confirmed_order.total).toFixed(2)} USD</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Approved :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.is_approved ? 'Yes' : 'No'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Rejected :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.is_rejected ? 'Yes' : 'No'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Deliverd :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.is_delivered ? 'Yes' : 'No'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Client :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_client.name}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Placed from IP :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.remote_ip}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={Detailsstyles.DetailspageTwo}>
                                        <View style={Detailsstyles.DetailscardThree}>
                                            <View style={Detailsstyles.DetailslistShipping}>
                                                <View>
                                                    <Text style={Detailsstyles.heading}>Billing Address</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.label}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.country}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.deliver_to}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.state + ", " + orderRequest.pomw_confirmed_order.shipping_address.zip}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.line1}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.city}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={Detailsstyles.DetailscardFour}>
                                            <Text style={Detailsstyles.heading}>Order Totals hhh </Text>
                                            <View style={Detailsstyles.list}>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Grand Total:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.pomw_confirmed_order.total).toFixed(2)} USD</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Shipping:</Text>
                                                    {/* <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.shipping_total).toFixed(2)} USD</Text> */}
                                                    <Text style={Detailsstyles.OrdersContentTwo}>$<p className="" style={{ marginLeft: "7px", width: "auto", height: '37px', marginTop: '-7px' }}><TextField value={orderShipping} onChange={handleShippingChange}></TextField></p>USD</Text>

                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Tax:</Text>
                                                    {/* <Text style={Detailsstyles.contentTwo}>${orderRequest && !isNaN(parseInt(orderRequest.discount_total)) ? parseInt(orderRequest.discount_total).toFixed(2) : '0.00'} USD</Text> */}
                                                    <Text style={Detailsstyles.OrdersContentTwo}>$<p className="" style={{ marginLeft: "7px", width: "auto", height: '37px', marginTop: '-7px' }}><TextField value={orderTax} onChange={handleTaxChange}></TextField></p></Text>

                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Total Due:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.pomw_confirmed_order.total).toFixed(2)} USD</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <hr style={Detailsstyles.Detailshr} />
                                    <View style={Detailsstyles.DetailscardFive}>
                                        <View>
                                            <Text style={Detailsstyles.heading}>Items Ordered</Text>
                                        </View>
                                        {
                                            orderRequest && orderRequest.pomw_confirmed_order.confirmed_order_items.map((item, index) => (
                                                <>
                                                    <View style={Detailsstyles.mainorderList}>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Product:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.description}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Supplier Part Id:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.supplier_part_id}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Supplier Part Aux Id:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.supplier_auxiliary_id}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Manufacturer:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.manufacturer_name}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Classification:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.classification}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>UOM:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.unit_of_measure}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Lead Time:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.leadtime}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Quantity:</Text>
                                                            {/* <Text style={Detailsstyles.orderscontent}>{item.quantity}</Text> */}
                                                            <p className="" style={{ width: "50%", marginTop: '5px' }}>
                                                                <TextField value={orderQuantity[item.id] ? orderQuantity[item.id].quantity : item.quantity} onChange={(newValue) => handleQuantityChange(newValue, item)} ></TextField>
                                                            </p>

                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Unit Price:</Text>
                                                            {/* <Text style={Detailsstyles.orderscontent}>${item.unit_price} USD </Text> */}
                                                            <p className="" style={{ width: "50%", marginTop: '5px' }}><TextField value={orderPrice[item.id] ? orderPrice[item.id].price : item.unit_price} onChange={(newValue) => handlePriceChange(newValue, item)}></TextField></p>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Total:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>${item.unit_price * item.quantity} USD</Text>
                                                        </View>
                                                    </View >
                                                    <hr style={Detailsstyles.Detailshr} />
                                                </>
                                            ))
                                        }
                                    </View>
                                    <View style={Detailsstyles.DetailscardThree}>
                                        <View style={Detailsstyles.hr}></View>
                                        <View style={Detailsstyles.ordersList}>
                                            <Text style={Detailsstyles.heading}>Shipping Method:</Text>
                                            <Text style={Detailsstyles.orderscontent}>Method: {orderRequest && orderRequest.pomw_confirmed_order.shipping_method}</Text>
                                        </View>
                                    </View>
                                </Page>
                            </Document>
                        </div>
                    </Modal.Section>
                </div>
            </Modal >

            <Modal
                open={createinvoiceorgactive}
                onClose={handleOriginalOrderInvoice}
                size="Large"
            >
                <div className="custom-modal">
                    <Modal.Section>
                        <div className="pop-code-wrapper">
                            <Document>
                                <Page>
                                    {/* <Button onClick={handleDownloadAndOpen}>Create Invoice </Button>  */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                                        <TextPolaris variant="headingLg" as="h5">
                                            Create Invoice for Original Order Request: {orderRequest && orderRequest.internal_id}
                                        </TextPolaris>
                                        <div className="multi-color-btn modal-pop-up-multi-btn">
                                            <Button disabled={loading} onClick={handleCreateORGInvoicePost}>{loading ? <Spinner size="small"></Spinner> : 'Create Invoice'}</Button>
                                        </div>
                                    </div>
                                    <View style={Detailsstyles.Detailspage}>
                                        <View style={Detailsstyles.Detailscard}>
                                            <View style={Detailsstyles.list}>
                                                <View>
                                                    <Text style={Detailsstyles.heading}> Account Information</Text>
                                                </View>
                                                <View style={Detailsstyles.itemOne}>
                                                    <Text style={Detailsstyles.mainContent}>Name:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_customer.name}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemOne}>
                                                    <Text style={Detailsstyles.mainContent}>Customer Email:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_customer.email}</Text>
                                                </View>
                                            </View>
                                            <hr style={Detailsstyles.Detailshr} />
                                            <View style={Detailsstyles.DetailslistShipping}>
                                                <View>
                                                    <Text style={Detailsstyles.heading}>Shipping Address</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.label}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.country}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.deliver_to}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.state + ", " + orderRequest.pomw_confirmed_order.shipping_address.zip}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.line1}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.shipping_address.city}</Text>
                                                </View>
                                            </View>
                                            <hr style={Detailsstyles.Detailshr} />
                                        </View>

                                        <View style={Detailsstyles.DetailscardTwo}>

                                            <Text style={Detailsstyles.heading}>Order #{orderRequest && orderRequest.external_id}</Text>
                                            <View style={Detailsstyles.list}>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Order Date :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && convertISOToYMD(orderRequest.created_at)}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Total :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.total).toFixed(2)} USD</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Approved :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.is_approved ? 'Yes' : 'No'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Rejected :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.is_rejected ? 'Yes' : 'No'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Deliverd :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.is_delivered ? 'Yes' : 'No'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Client :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_client.name}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Placed from IP :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.remote_ip}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={Detailsstyles.DetailspageTwo}>
                                        <View style={Detailsstyles.DetailscardThree}>
                                            <View style={Detailsstyles.DetailslistShipping}>
                                                <View>
                                                    <Text style={Detailsstyles.heading}>Billing Address</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.label}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.country}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.deliver_to}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.state + ", " + orderRequest.pomw_confirmed_order.shipping_address.zip}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.contentOne}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.line1}</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{orderRequest && orderRequest.pomw_confirmed_order.billing_address.city}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={Detailsstyles.DetailscardFour}>
                                            <Text style={Detailsstyles.heading}>Order Totals</Text>
                                            <View style={Detailsstyles.list}>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Grand Total:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.total).toFixed(2)} USD</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Shipping:</Text>
                                                    {/* <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.shipping_total).toFixed(2)} USD</Text> */}
                                                    <Text style={Detailsstyles.contentTwo}>$<p className="" style={{ marginLeft: "7px", width: "auto", height: '37px', marginTop: '-7px' }}><TextField value={oRGOrderShipping} onChange={handleORGShippingChange}></TextField></p>USD</Text>

                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Tax:</Text>
                                                    {/* <Text style={Detailsstyles.contentTwo}>${orderRequest && !isNaN(parseInt(orderRequest.discount_total)) ? parseInt(orderRequest.discount_total).toFixed(2) : '0.00'} USD</Text> */}
                                                    <Text style={Detailsstyles.contentTwo}>$<p className="" style={{ marginLeft: "7px", width: "auto", height: '37px', marginTop: '-7px' }}><TextField value={oRGOrderTax} onChange={handleORGTaxChange}></TextField></p></Text>

                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Total Due:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.total).toFixed(2)} USD</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <hr style={Detailsstyles.Detailshr} />
                                    <View style={Detailsstyles.DetailscardFive}>
                                        <View>
                                            <Text style={Detailsstyles.heading}>Items Ordered</Text>
                                        </View>
                                        {
                                            orderRequest && orderRequest.pomw_order_items.map((item, index) => (
                                                <>
                                                    <View style={Detailsstyles.mainorderList}>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Product:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.description}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Supplier Part Id:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.supplier_part_id}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Supplier Part Aux Id:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.supplier_auxiliary_id}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Manufacturer:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.manufacturer_name}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Classification:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.classification}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>UOM:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.unit_of_measure}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Lead Time:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.leadtime}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Quantity:</Text>
                                                            {/* <Text style={Detailsstyles.orderscontent}>{item.quantity}</Text> */}
                                                            <p className="" style={{ width: "50%", marginTop: '5px' }}>
                                                                <TextField value={orderQuantity[item.id] ? orderQuantity[item.id].quantity : item.quantity} onChange={(newValue) => handleQuantityChange(newValue, item)} ></TextField>
                                                            </p>

                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Unit Price:</Text>
                                                            {/* <Text style={Detailsstyles.orderscontent}>${item.unit_price} USD </Text> */}
                                                            <p className="" style={{ width: "50%", marginTop: '5px' }}><TextField value={orderPrice[item.id] ? orderPrice[item.id].price : item.unit_price} onChange={(newValue) => handlePriceChange(newValue, item)}></TextField></p>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Total:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>${item.unit_price * item.quantity} USD</Text>
                                                        </View>
                                                    </View >
                                                    <hr style={Detailsstyles.Detailshr} />
                                                </>
                                            ))
                                        }
                                    </View>
                                    <View style={Detailsstyles.DetailscardThree}>
                                        <View style={Detailsstyles.hr}></View>
                                        <View style={Detailsstyles.ordersList}>
                                            <Text style={Detailsstyles.heading}>Shipping Method:</Text>
                                            <Text style={Detailsstyles.orderscontent}>Method: {orderRequest && orderRequest.pomw_confirmed_order.shipping_method}</Text>
                                        </View>
                                    </View>
                                </Page>
                            </Document>
                        </div>
                    </Modal.Section>
                </div>
            </Modal >
        </div >
    );
}

PunchoutProfileTableModal.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default PunchoutProfileTableModal;
