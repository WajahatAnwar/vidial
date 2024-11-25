import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
// const styles = StyleSheet.create({
//     page: {
//       padding: 20,
//       display: 'flex',
//       flexDirection: 'column',
//     },
//     header: {
//       backgroundColor: '#F4F4F4',
//       paddingBottom: 10,
//       fontSize: 20,
//     },
//     list: {
//       padding: '8px 0px',
//     },
//     item: {
//       display: 'flex',
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       flexWrap: 'wrap',
//       fontSize: 16,
//       marginBottom: 15,
//     },
//     contentOne: {
//       width: '50%',
//       fontSize: 12,
//       color: '#535353',
//       fontWeight: 700,

//     },
//     contentTwo: {
//       width: '50%',
//       fontSize: 10,
//       fontWeight:400,
//       color: '#949494',
//     },
//     card: {
//       marginBottom: 16,
//       padding: 20,
//       width: '100%',
//     },

//   });



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
        fontSize: 18,
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

    },
    mainContent: {
        color: "#333",
        fontSize: 14,
        fontWeight: 700,
    },
    contentOne: {

        fontSize: 12,
        color: '#6D6D6D',
        fontWeight: 400,


    },
    contentTwo: {

        fontSize: 12,
        fontWeight: 400,
        color: '#6D6D6D',
        display:'flex',
        width: '50%',
    },
    orderscontent: {
        fontSize: 12,
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
        display: "table",
        width: "100%",
        marginTop: 20,
    }
});
const SummaryInvoice = () => {
  return (
//     <Document>
//     <Page style={styles.page}>
//       {/* General Section */}
//       <View style={styles.card}>

//         <View style={styles.list}>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Date:</Text>
//             <Text style={styles.contentTwo}>08-08-2024 09:15</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>DB ID:</Text>
//             <Text style={styles.contentTwo}>17236</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Client:</Text>
//             <Text style={styles.contentTwo}>northeastern-university-brand</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Client Order:</Text>
//             <Text style={styles.contentTwo}>Noah Pizzirusso n.pizziruss</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Items Count:</Text>
//             <Text style={styles.contentTwo}>3</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Status:</Text>
//             <Text style={styles.contentTwo}>Undelivered</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Approved:</Text>
//             <Text style={styles.contentTwo}>Yes</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Rejected:</Text>
//             <Text style={styles.contentTwo}>No</Text>
//           </View>
//         </View>
//       </View>

//       {/* Session Section */}
//       <View style={styles.card}>
//         {/* <Text style={styles.header}>Session</Text> */}
//         <View style={styles.list}>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Delivered:</Text>
//             <Text style={styles.contentTwo}>No</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>External ID:</Text>
//             <Text style={styles.contentTwo}>193501</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Total:</Text>
//             <Text style={styles.contentTwo}>$4,746.00 USD</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Confirmed Order Total:</Text>
//             <Text style={styles.contentTwo}>$4,746.00 USD</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Confirmed Order Matches:</Text>
//             <Text style={styles.contentTwo}>Yes</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Shipping Total:</Text>
//             <Text style={styles.contentTwo}>$534.00 USD</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Discount Total:</Text>
//             <Text style={styles.contentTwo}>$0.00 USD</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Tax Total:</Text>
//             <Text style={styles.contentTwo}>$0.00 USD</Text>
//           </View>
//           <View style={styles.item}>
//             <Text style={styles.contentOne}>Punchout Session:</Text>
//             <Text style={styles.contentTwo}>u8U1sQmU6OdjATBZ</Text>
//           </View>
//         </View>
//       </View>
//     </Page>
//   </Document>
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
                    <Text style={Detailsstyles.contentTwo}>Tammy Burris </Text>
                </View>
                <View style={Detailsstyles.itemOne}>
                    <Text style={Detailsstyles.mainContent}>Customer Email:</Text>
                    <Text style={Detailsstyles.contentTwo}>tdburris@LKQCORP.com</Text>
                </View>
            </View>
            <hr style={Detailsstyles.Detailshr} />
            <View style={Detailsstyles.DetailslistShipping}>
                <View>
                    <Text style={Detailsstyles.heading}>Shipping Address</Text>
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
            <hr style={Detailsstyles.Detailshr} />
        </View>

        <View style={Detailsstyles.DetailscardTwo}>

            <Text style={Detailsstyles.heading}>Order # 6300007680</Text>
            <View style={Detailsstyles.list}>
                <View style={Detailsstyles.itemTwo}>
                    <Text style={Detailsstyles.boldText}>Order Date :</Text>
                    <Text style={Detailsstyles.contentTwo}>08-08-2024 06:54</Text>
                </View>
                <View style={Detailsstyles.itemTwo}>
                    <Text style={Detailsstyles.boldText}>Total :</Text>
                    <Text style={Detailsstyles.contentTwo}>$155.23</Text>
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
                    <Text style={Detailsstyles.contentTwo}>Yes</Text>
                </View>
                <View style={Detailsstyles.itemTwo}>
                    <Text style={Detailsstyles.boldText}>Client :</Text>
                    <Text style={Detailsstyles.contentTwo}>pypbrandshop.myshopify.com</Text>
                </View>
                <View style={Detailsstyles.itemTwo}>
                    <Text style={Detailsstyles.boldText}>Placed from IP :</Text>
                    <Text style={Detailsstyles.contentTwo}>136.226.102.185</Text>
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
                    <Text style={Detailsstyles.contentOne}>LKQ Corporation (Indirect Procurement) 8</Text>
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
        </View>
        <View style={Detailsstyles.DetailscardFour}>
            <Text style={Detailsstyles.heading}>Order Totals</Text>
            <View style={Detailsstyles.list}>
                <View style={Detailsstyles.itemTwo}>
                    <Text style={Detailsstyles.boldText}>Grand Total:</Text>
                    <Text style={Detailsstyles.contentTwo}>155.23</Text>
                </View>
                <View style={Detailsstyles.itemTwo}>
                    <Text style={Detailsstyles.boldText}>Shipping:</Text>

                    {/* <Text style={Detailsstyles.contentTwo}>$<p className="" style={{marginLeft:"7px",width:"auto",height:'37px',marginTop:'-7px'}}><TextField value={ordershipping} onChange={handleShippingChange}></TextField></p></Text> */}

                </View>
                <View style={Detailsstyles.itemTwo}>
                    <Text style={Detailsstyles.boldText}>Tax:</Text>

                    {/* <Text style={Detailsstyles.contentTwo}>$<p className="" style={{marginLeft:"7px",width:"auto",height:'37px',marginTop:'-7px'}}><TextField value={ordertax} onChange={handleTaxChange}></TextField></p></Text> */}

                </View>
                <View style={Detailsstyles.itemTwo}>
                    <Text style={Detailsstyles.boldText}>Total Due:</Text>
                    <Text style={Detailsstyles.contentTwo}>$155.23</Text>
                </View>
            </View>
        </View>
    </View>
    <hr style={Detailsstyles.Detailshr} />
    <View style={Detailsstyles.DetailscardFive}>
        <View>
            <Text style={Detailsstyles.heading}>Items Ordered</Text>
        </View>

                <View  style={Detailsstyles.mainorderList}>

                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Product:</Text>
                        <Text style={Detailsstyles.orderscontent}>CINCINNATI</Text>
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
                        <Text style={Detailsstyles.orderscontent}>unknown</Text>
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
                        {/* <Text style={Detailsstyles.orderscontent}>{item.quantity}</Text> */}
                      {/* <p className="" style={{width:"50%",marginTop:'5px'}}><TextField value={orderquantity} onChange={handleQuantityChange}></TextField></p> */}

                    </View>
                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Unit Price:</Text>
                        {/* <Text style={Detailsstyles.orderscontent}>${item.unit_price} USD </Text> */}
                        {/* <p className="" style={{width:"50%",marginTop:'5px'}}><TextField value={orderprice} onChange={handlePriceChange}></TextField></p> */}
                    </View>
                    <View style={Detailsstyles.ordersList}>
                        <Text style={Detailsstyles.boldText}>Total:</Text>
                        <Text style={Detailsstyles.orderscontent}>$50.25</Text>
                    </View>
                </View>

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
</Document>
  )
}

export default SummaryInvoice
