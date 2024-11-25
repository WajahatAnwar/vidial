import { Button, Modal, Select, Tabs, Text as TextPolaris } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useEffect, useState } from 'react';
// import { Page, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import OrderInvoiceHistory from "./OrderInvoiceHistory";
import OrderInvoiceNotes from "./OrderInvoiceNotes";
import OrderInvoiceRequests from "./OrderInvoiceRequests";
import OrderInvoiceSimulatedCXML from "./OrderInvoiceSimulatedCXML";
import { CircularProgress } from '@mui/material';
import { ImportIcon } from '@shopify/polaris-icons';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const styles = StyleSheet.create({
    page: {
        padding: 20,
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
        justifyContent: 'space-between',
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
        padding: 20,
        width: '80%',
    },

});

const Detailsstyles = StyleSheet.create({
    Detailspage: {
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
    },
    DetailspageTwo: {

        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
    },
    heading: {
        display: 'block',
        marginBottom: 10,
        fontSize: 22,
        fontWeight: 700,
        color: '#333',

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
        marginTop: 75,
    },
    item: {
        width: "50%",
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
    },
    orderscontent: {
        fontSize: 14,
        fontWeight: 400,
        marginTop: 10,
        color: '#949494',
    },
    Detailscard: {
        marginBottom: 16,
        padding: 20,
        width: '45%',
        borderRadius: 10,
        border: "1px solid #ccc",
    },

    DetailscardTwo: {
        marginBottom: 16,
        padding: 20,
        width: '45%',
        borderRadius: 10,
        border: "1px solid #ccc",
    },
    DetailscardThree: {
        marginBottom: 16,
        padding: 20,
        width: '65%',
    },
    Ordersstyle: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    DetailscardFour: {
        marginBottom: 16,
        padding: 20,
        width: '100%',
        borderRadius: 10,
        border: "1px solid #ccc",
    },
    DetailscardFive: {
        display: 'block',
        marginBottom: 10,
        padding: 20,
        // width: '65%',
    },
    mainorderList: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
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
        marginTop: 20,
    }


});


function PunchoutExploreTableModal({ currentInvoice, handleChangePreparePunchout }) {

    const [invoiceData, setInvoiceData] = useState()
    const [simulatedCXML, setSimulatedCXML] = useState()
    const [history, setHistory] = useState()
    const [requests, setRequests] = useState()
    const [selected, setSelected] = useState(0);

    const handleTabChange = useCallback((selectedTabIndex) => {
        console.log(selectedTabIndex);
        setSelected(selectedTabIndex);
    }, []);

    const tabs = [
        {
            id: 'Summary',
            content: 'Summary',
            panelID: 'Summary-1',
        },
        {
            id: 'Details',
            content: ' Details',
            panelID: 'Details-1',
        },
        {
            id: 'Pushed',
            content: 'Pushed / Simulated CXML',
            panelID: 'Pushed-1',
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


    const [selecteddropdown, setSelecteddropdown] = useState();

    const handleSelectChange = async (value) => {
        setSelecteddropdown(parseInt(value))

        const response = await fetch(route('punchout.orderInvoice.updateStatus', { invoice: currentInvoice.id, status: value }), {
            method: 'post',
        });
        const result = await response.json();

        toast.dismiss()
        if (result.success) {
            handleChangePreparePunchout()
            Swal.fire({
                icon: 'success',
                title: 'Success...',
                text: "Order invoice updated successfully.",
            });
        } else {
            if (response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permissions.",
                });
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Somethin wrong occured.",
                });
            }
        }
    };

    const [options, setOptions] = useState([])


    const [active, setActive] = useState(false);
    const [activeAdvanceActions, setActiveAdvanceActions] = useState(false);

    const handleChangeAdvanceActions = useCallback(() => setActiveAdvanceActions(!activeAdvanceActions), [activeAdvanceActions]);

    const handleChange = useCallback(() => setActive(!active), [active]);

    useEffect(() => {
        fetch(route('punchout.orderInvoice.detail', { invoice: currentInvoice.id }))
            .then(response => response.json())
            .then(result => {
                console.log(result.data);
                result.data.statuses.map((status) => {
                    setOptions(prevOptions => [
                        ...prevOptions,
                        {
                            label: status.name,
                            value: status.id,
                        },
                    ]);
                    setInvoiceData(result.data.invoice);
                    setSimulatedCXML(result.data.simulated_cxml)
                    setHistory(result.data.journal_entries)
                    setRequests(result.data.requests)
                    setSelecteddropdown(result.data.invoice.status_id)
                })
            });

    }, []);
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

    const handlePrint = () => {
        const printContents = document.getElementById('printable-area').innerHTML;
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoiceData.external_id}</title>
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
    };

    const downloadHTML = () => {
        const htmlContent = document.getElementById('printable-area').innerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${invoiceData.external_id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const downloadPushedCXML = () => {
        const cxml = invoiceData.pushed_cxml.replace(/^<\?xml.*\?>\s*/, '')
            .replace(/^<!DOCTYPE.*?>\s*/, '');
        const blob = new Blob([cxml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${invoiceData.external_id}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const downloadSimulatedCXML = () => {
        const cxml = simulatedCXML.replace(/^<\?xml.*\?>\s*/, '')
            .replace(/^<!DOCTYPE.*?>\s*/, '');
        const blob = new Blob([cxml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${invoiceData.external_id}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePushInvoice = async () => {
        const response = await fetch(route('punchout.orderInvoice.push', { invoice: currentInvoice.id }), {
            method: 'post',
        })
        const result = await response.json();
        if (result.success) {
            handleChangePreparePunchout()
            Swal.fire({
                icon: 'success',
                title: 'Success...',
                text: "Invoice pushed successfully.",
            });
        }
        else {
            if (response.status === 403) {

                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permissions.",
                });
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    }
    return (
        <>
            <span className='menu-tabs-top-popup-PO'>
                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
            </span>

            {
                invoiceData?.can_be_pushed &&
                <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'end' }}>
                    <div className="multi-color-btn modal-pop-up-multi-btn">
                        <Button onClick={handlePushInvoice}>Send</Button>
                    </div>
                </div>
            }

            {invoiceData ?
                selected === 0 ? <div className="pt-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: "40px" }}>
                        <p style={{ fontSize: "22px", fontWeight: "700" }}>
                            Invoice: {invoiceData.overriden_external_id}
                        </p>
                    </div>

                    <Document>
                        <Page style={styles.page}>
                            {/* General Section */}
                            <View style={styles.card}>

                                <View style={styles.list}>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Client :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>{invoiceData.order.pomw_client.name}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Network :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>{invoiceData.order.pomw_client.pomw_client_network.name}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Status :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>
                                            <Select
                                                label=""
                                                options={options}
                                                onChange={handleSelectChange}
                                                value={selecteddropdown}

                                            />
                                        </p>
                                    </View>

                                    {/* Arsalan  */}
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Purpose:</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>{invoiceData.purpose}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Internal ID :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>{invoiceData.id}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>External ID :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>{invoiceData.external_id}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Overriden External ID :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>{invoiceData.overriden_external_id}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Internal Order ID :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>{invoiceData.order.id}</p>
                                    </View>

                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>External Order ID :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>{invoiceData.order.magento_order_id}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Purchase Order ID :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", color: "#2E93C8", textDecoration: "underline", width: "50%", textAlign: "left" }}>{invoiceData.order.external_id}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Punchout Session :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", color: "#2E93C8", textDecoration: "underline", width: "50%", textAlign: "left" }}>{invoiceData.order.pomw_session.session_key}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Invoice Value :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>${parseFloat(invoiceData.total).toLocaleString()}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Updated :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>{convertISOToYMD(invoiceData.updated_at)}</p>
                                    </View>
                                    <View style={styles.item}>
                                        <p style={{ fontSize: "16px", fontWeight: "700", width: "50%", textAlign: "left" }}>Created :</p>
                                        <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", textAlign: "left" }}>{convertISOToYMD(invoiceData.created_at)}</p>
                                    </View>
                                </View>
                            </View>

                            {/* Session Section */}

                        </Page>
                    </Document>

                </div>
                    : selected === 1 ? <div className="pt-4">
                        <div className="pop-code-wrapper" id='printable-area'>
                            <Document>
                                <Page>
                                    <View style={Detailsstyles.Detailspage}>
                                        <View style={Detailsstyles.DetailscardTwo}>
                                            <Text style={Detailsstyles.heading}>Invoice # {invoiceData.external_id}</Text>
                                            <View style={Detailsstyles.list}>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Internal Order ID:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{invoiceData.order.id}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>External Order ID:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{invoiceData.order.magento_order_id}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Purchase Order ID:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{invoiceData.order.external_id}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Purpose:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{invoiceData.purpose}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Invoice Value:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{parseFloat(invoiceData.total).toLocaleString()}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Updated:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{convertISOToYMD(invoiceData.updated_at)}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Created:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{convertISOToYMD(invoiceData.created_at)}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>External ID:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{invoiceData.external_id}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Internal ID:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>{invoiceData.id}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        {/* <View style={Detailsstyles.DetailscardTwo}>

                                            <Text style={Detailsstyles.heading}>Order # 6300007680</Text>
                                            <View style={Detailsstyles.list}>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Order Date :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>08-08-2024 06:54</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Total :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>$223</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Approved :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>Yes</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Rejected :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>No</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Deliverd :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>No</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Client :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>LKQ Shopify Client</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Placed from IP :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>136.226.102.185</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>External ID :</Text>
                                                    <Text style={Detailsstyles.contentTwo}>1582585</Text>
                                                </View>

                                            </View>
                                        </View> */}
                                    </View>
                                    <hr style={Detailsstyles.Detailshr} />
                                    <View style={Detailsstyles.DetailscardFive}>
                                        <View>
                                            <Text style={Detailsstyles.heading}>Items Ordered</Text>
                                        </View>
                                        {
                                            invoiceData.items.map((item, index) => (
                                                <>
                                                    <View style={Detailsstyles.mainorderList}>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Product:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.description}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Supplier Part Id:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.part_id}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Supplier Part Aux Id:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>{item.aux_part_id}</Text>
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
                                                            <Text style={Detailsstyles.orderscontent}>{parseInt(item.quantity)}</Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Unit Price:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>${parseFloat(item.unit_price).toLocaleString()} USD </Text>
                                                        </View>
                                                        <View style={Detailsstyles.ordersList}>
                                                            <Text style={Detailsstyles.boldText}>Total:</Text>
                                                            <Text style={Detailsstyles.orderscontent}>${parseFloat(item.unit_price * item.quantity).toLocaleString()} USD</Text>
                                                        </View>
                                                    </View >
                                                    <hr style={Detailsstyles.Detailshr} />
                                                </>
                                            ))
                                        }



                                    </View>
                                    <View style={Detailsstyles.DetailspageTwo}>
                                        <View style={Detailsstyles.DetailscardFour}>
                                            <View style={Detailsstyles.Ordersstyle}>
                                                <Text style={Detailsstyles.heading}>Order Totals</Text>
                                                <Text style={Detailsstyles.recepitText} onClick={handleChange} >Download Receipt</Text>
                                            </View>
                                            <View style={Detailsstyles.list}>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Grand Total:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${parseFloat(invoiceData.total).toLocaleString()}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Sub Total:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${parseFloat(invoiceData.subtotal).toLocaleString()}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Shipping:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${invoiceData.shipping ? parseFloat(invoiceData.shipping).toLocaleString() : '0'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Tax:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${invoiceData.tax ? parseFloat(invoiceData.tax).toLocaleString() : '0'}</Text>
                                                </View>
                                                <View style={Detailsstyles.itemTwo}>
                                                    <Text style={Detailsstyles.boldText}>Total Due:</Text>
                                                    <Text style={Detailsstyles.contentTwo}>${parseFloat(invoiceData.total).toLocaleString()}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </Page>
                            </Document >
                        </div>
                    </div>
                        : selected === 2 ? <div className="">
                            <div className="pop-code-wrapper">
                                <OrderInvoiceSimulatedCXML pushedCXML={invoiceData.pushed_cxml} simulatedCXML={simulatedCXML} />
                            </div>

                        </div>
                            : selected === 3 ? <div className="">
                                <div className="pop-code-wrapper">
                                    <OrderInvoiceNotes invoiceData={invoiceData} handleChangePreparePunchout={handleChangePreparePunchout} />
                                </div>

                            </div>
                                : selected === 4 ? <div className="">
                                    <div className="pop-code-wrapper">
                                        <OrderInvoiceHistory history={history} />
                                    </div>
                                </div>
                                    : selected === 5 ? <div className="">
                                        <div className="pop-code-wrapper">
                                            <OrderInvoiceRequests requests={requests} invoiceData={invoiceData} />
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
                            <div onClick={handlePrint} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px", marginTop: "10px" }}>
                                <a href='#' style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                    Print
                                </a>
                                <p className="custom-icon">
                                    <ImportIcon width={20} />
                                </p>
                            </div>
                            {
                                invoiceData?.pushed_cxml &&
                                <>
                                    <hr />
                                    <div onClick={downloadPushedCXML} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px", marginTop: "10px" }}>
                                        <a href="#" style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                            Pushed CXML
                                        </a>
                                        <p className="custom-icon">
                                            <ImportIcon width={20} />
                                        </p>
                                    </div>
                                </>
                            }
                            <hr />
                            <div onClick={downloadSimulatedCXML} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px", marginTop: "10px" }}>
                                <a href="#" style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                    Simulated CXML
                                </a>
                                <p className="custom-icon">
                                    <ImportIcon width={20} />
                                </p>
                            </div>
                            <hr />
                            <div onClick={downloadHTML} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', padding: "0px 10px", marginTop: "10px" }}>
                                <a href="#" style={{ textDecoration: 'none', color: '#2E93C8', fontSize: "14px", fontWeight: "500" }}>
                                    Simple HTML
                                </a>
                                <p className="custom-icon">
                                    <ImportIcon width={20} />
                                </p>
                            </div>
                        </div>
                    </Modal.Section>
                </div>
            </Modal>
        </>
    );

}

PunchoutExploreTableModal.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default PunchoutExploreTableModal;
