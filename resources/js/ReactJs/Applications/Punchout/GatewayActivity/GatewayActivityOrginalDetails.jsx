import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create Detailsstyles
const Detailsstyles = StyleSheet.create({
    Detailspage: {
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
    },
    DetailspageTwo: {

        padding: 20,
        display: 'flex',
        flexDirection: 'row',
    },
    heading: {
        display: 'block',
        marginBottom: 10,
        fontSize: 14,
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
        display:'inline-block',
        marginTop: 75,
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
        color:"#333",
        fontSize: 12,
        fontWeight: 700,
    },

    contentOne: {

        fontSize: 11,
        color: '#6D6D6D',
        fontWeight: 400,


    },
    contentTwo: {

        fontSize: 11,
        fontWeight: 400,
        color: '#6D6D6D',
    },
    orderscontent: {
        fontSize: 11,
        fontWeight: 400,
        marginTop: 10,
        color: '#949494',
    },
    Detailscard: {
        marginBottom: 16,
        padding: 20,
        width: '65%',
    },

    DetailscardTwo: {
        marginBottom: 16,
        padding: 20,
        width: '35%',
    },
    DetailscardThree: {
        marginBottom: 16,
        padding: 20,
        width: '65%',
    },
    DetailscardFour: {
        marginBottom: 16,
        padding: 20,
        width: '35%',
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
        fontSize: 10,
        fontWeight: 700,

        textAlign: 'right',
        color: '#FF3E84'
    },
    Detailshr:{
        display: "table",
    width: "100%",
    marginTop: 20,
    }


});

// Create Document Component
const MyDocument = () => (
    <Document>
        <Page>
            <View style={Detailsstyles.Detailspage}>
                <View style={Detailsstyles.Detailscard}>

                    <View style={Detailsstyles.list}>
                        <View>
                            <Text style={Detailsstyles.heading}> Account Information     </Text>

                        </View>
                        <View style={Detailsstyles.itemOne}>
                            <Text style={Detailsstyles.mainContent}>Name:</Text>
                            <Text style={Detailsstyles.contentTwo}>Tyler Whitescarver</Text>
                        </View>
                        <View style={Detailsstyles.itemOne}>
                            <Text style={Detailsstyles.mainContent}>Customer Email:</Text>
                            <Text style={Detailsstyles.contentTwo}>63dd2a-fd.myshopify.com</Text>
                        </View>
                    </View>
                    {/* <View style={Detailsstyles.hr}></View> */}
                    <hr style={Detailsstyles.Detailshr}/>
                    <View style={Detailsstyles.DetailslistShipping}>

                        <View>

                            <Text style={Detailsstyles.heading}>Shipping Address</Text>
                        </View>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.contentOne}>LKQ Corporation (Indirect Procurement):</Text>
                            <Text style={Detailsstyles.contentTwo}>United States</Text>
                        </View>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.contentOne}>Tyler Whitescarver</Text>
                            <Text style={Detailsstyles.contentTwo}>TN, 37013</Text>
                        </View>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.contentOne}>5846 Crossings Blvd</Text>
                            <Text style={Detailsstyles.contentTwo}>Nashville</Text>
                        </View>

                    </View>
                    <hr style={Detailsstyles.Detailshr}/>
                </View>

                <View style={Detailsstyles.DetailscardTwo}>

                    <Text style={Detailsstyles.heading}>Order # 6300007680</Text>
                    <View style={Detailsstyles.list}>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.boldText}>Order Date :</Text>
                            <Text style={Detailsstyles.contentTwo}>08-08-2024 06:54</Text>
                        </View>
                        <View style={Detailsstyles. itemTwo}>
                            <Text style={Detailsstyles.boldText}>Total :</Text>
                            <Text style={Detailsstyles.contentTwo}>$223</Text>
                        </View>
                        <View style={Detailsstyles. itemTwo}>
                            <Text style={Detailsstyles.boldText}>Approved :</Text>
                            <Text style={Detailsstyles.contentTwo}>Yes</Text>
                        </View>
                        <View style={Detailsstyles. itemTwo}>
                            <Text style={Detailsstyles.boldText}>Rejected :</Text>
                            <Text style={Detailsstyles.contentTwo}>No</Text>
                        </View>
                        <View style={Detailsstyles. itemTwo}>
                            <Text style={Detailsstyles.boldText}>Deliverd :</Text>
                            <Text style={Detailsstyles.contentTwo}>No</Text>
                        </View>
                        <View style={Detailsstyles. itemTwo}>
                            <Text style={Detailsstyles.boldText}>Client :</Text>
                            <Text style={Detailsstyles.contentTwo}>LKQ Shopify Client</Text>
                        </View>
                        <View style={Detailsstyles. itemTwo}>
                            <Text style={Detailsstyles.boldText}>Placed from IP :</Text>
                            <Text style={Detailsstyles.contentTwo}>136.226.102.185</Text>
                        </View>
                        <View style={Detailsstyles. itemTwo}>
                            <Text style={Detailsstyles.boldText}>External ID :</Text>
                            <Text style={Detailsstyles.contentTwo}>1582585</Text>
                        </View>

                    </View>
                </View>
            </View>
            <View style={Detailsstyles.DetailspageTwo}>
                <View style={Detailsstyles.DetailscardThree}>

                    <View style={Detailsstyles.list}>
                        <View>
                            <Text style={Detailsstyles.heading}>Billing Address</Text>

                        </View>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.contentOne}>LKQ Corporation (Indirect Procurement)</Text>
                            <Text style={Detailsstyles.contentTwo}>United States</Text>
                        </View>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.contentOne}>Tyler Whitescarver</Text>
                            <Text style={Detailsstyles.contentTwo}>TN, 37013</Text>
                        </View>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.contentOne}>5846 Crossings Blvd</Text>
                            <Text style={Detailsstyles.contentTwo}>Nashville</Text>
                        </View>
                    </View>
                    {/* <View style={Detailsstyles.hr}></View> */}


                </View>


                <View style={Detailsstyles.DetailscardFour}>

                    <Text style={Detailsstyles.heading}>Order Totals </Text>
                    <View style={Detailsstyles.list}>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.boldText}>Grand Total:</Text>
                            <Text style={Detailsstyles.contentTwo}>$223</Text>
                        </View>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.boldText}>Shipping:</Text>
                            <Text style={Detailsstyles.contentTwo}>$0</Text>
                        </View>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.boldText}>Tax:</Text>
                            <Text style={Detailsstyles.contentTwo}>$0</Text>
                        </View>
                        <View style={Detailsstyles.itemTwo}>
                            <Text style={Detailsstyles.boldText}>Total Due:</Text>
                            <Text style={Detailsstyles.contentTwo}>$223</Text>
                        </View>


                    </View>
                </View>
            </View>
            {/* <View style={Detailsstyles.hr}></View> */}
            <hr style={Detailsstyles.Detailshr} />
            <View style={Detailsstyles.DetailscardFive}>
                <View>
                    <Text style={Detailsstyles.heading}>Items Ordered</Text>

                </View>

                <View style={Detailsstyles.mainorderList}>

                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Product:</Text>
                        <Text style={Detailsstyles.orderscontent}>Nike Dri-FIT</Text>

                    </View>

                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Supplier Part Id:</Text>
                        <Text style={Detailsstyles.orderscontent}>746099-XL-Black</Text>

                    </View>

                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Supplier Part Aux Id:</Text>
                        <Text style={Detailsstyles.orderscontent}>44152983126269</Text>

                    </View>

                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Manufacturer:</Text>
                        <Text style={Detailsstyles.orderscontent}>Nike Dri-FIT</Text>

                    </View>

                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Classification:</Text>
                        <Text style={Detailsstyles.orderscontent}>80141605</Text>

                    </View>

                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>UOM:</Text>
                        <Text style={Detailsstyles.orderscontent}>EA</Text>

                    </View>

                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Lead Time:</Text>
                        <Text style={Detailsstyles.orderscontent}>0</Text>

                    </View>
                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Quantity:</Text>
                        <Text style={Detailsstyles.orderscontent}>12</Text>

                    </View>
                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Unit Price:</Text>
                        <Text style={Detailsstyles.orderscontent}>$50.25
                        </Text>

                    </View>
                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Total:</Text>
                        <Text style={Detailsstyles.orderscontent}>$50.25</Text>

                    </View>
                </View>

            </View>

            <View style={Detailsstyles.recepitMainText}>
                <Text style={Detailsstyles.recepitText}>Advanced Actions</Text>
                <Text style={Detailsstyles.recepitText}>Download Receipts</Text>
            </View>
            <hr style={Detailsstyles.Detailshr} />

            <View style={Detailsstyles.DetailscardThree}>


                <View style={Detailsstyles.hr}></View>
                <View style={Detailsstyles.ordersList}>

                <Text style={Detailsstyles.heading}>Shipping Method:</Text>
                <Text style={Detailsstyles.orderscontent}>Method: Standard / UPS Ground </Text>



                </View>
            </View>

        </Page>
    </Document >

);

export default MyDocument;
