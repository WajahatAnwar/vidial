import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: '20px 30px',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: '16px',
    marginBottom: '20px',
  },
  section: {
    border: '1px solid #D9D9D9',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '20px',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '5px',
  },
  column: {
    flexDirection: 'column',
    width: '48%',
  },
  subHeading: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '10px',
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: '12px',
    color: 'black',
  },
  greyText: {
    color: '#949494',
    fontSize: '12px',
    marginTop:10
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: '5px',
    flexWrap:"wrap",

  },
  itemColumn: {
    flexDirection: 'column',
    display:"flex",
    width:"25%",
    minWidth:"25%",
    maxWidth:"25%",
    margin:"10px 0px"
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  boldTextHorizontal:{
    fontWeight: 'bold',
    fontSize: '12px',
    color: 'black',
    minWidth:"120px",
    maxWidth:"120px",
    width:"120px",
    display:"inline-block",
    marginTop:10
  },
  hr: {
    borderBottomColor: '#EBEBEB',
    borderBottomWidth: 1,
    margin:"15px 0px",
    borderStyle:"solid",
    width:"100%",
},
});

function ProcurementOrdersInvoice() {
  return (
    <Document>
      <Page style={styles.page}>
        {/* Title */}
        <Text style={styles.heading}>Procurement Order: 7300000019</Text>

        {/* Order and Account Information */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.subHeading}>Order # 6300007680</Text>
              <View style={{ flexDirection: 'row', marginTop: '5px' }}>
                <Text style={styles.boldTextHorizontal}>Order Date :</Text>
                <Text style={styles.greyText}> 08-08-2024 06:54</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.boldTextHorizontal}>Total :</Text>
                <Text style={styles.greyText}> $223</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.boldTextHorizontal}>Approved  :</Text>
                <Text style={styles.greyText}> Yes</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.boldTextHorizontal}>Rejected :</Text>
                <Text style={styles.greyText}> No</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.boldTextHorizontal}>Delivered :</Text>
                <Text style={styles.greyText}> No</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.boldTextHorizontal}>Client :</Text>
                <Text style={styles.greyText}> LKD Shopify Client</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.boldTextHorizontal}>Placed from IP :</Text>
                <Text style={styles.greyText}> 136.226.102.185</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.boldTextHorizontal}>External ID :</Text>
                <Text style={styles.greyText}> 1582585</Text>
              </View>
            </View>
            <View style={styles.column}>
              <Text style={styles.subHeading}>Account Information</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.boldTextHorizontal}>Name :</Text>
                <Text style={styles.greyText}> Tyler Whitescarver</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.boldTextHorizontal}>Customer Email :</Text>
                <Text style={styles.greyText}> 63dd2a-fd.myshopify.com</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items Ordered */}
        <View style={styles.section}>
          <Text style={styles.subHeading}>Items Ordered</Text>
          <View style={styles.itemRow}>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Product:</Text>
              <Text style={styles.greyText}>Nike Dri-FIT</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Supplier Part Id:</Text>
              <Text style={styles.greyText}>746099-XL-Black</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Supplier Part Aux Id:</Text>
              <Text style={styles.greyText}>44152983126269</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Manufacturer:</Text>
              <Text style={styles.greyText}>Nike Dri-FIT</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Classification:</Text>
              <Text style={styles.greyText}>80141605</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>UOM:</Text>
              <Text style={styles.greyText}>EA</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Lead Time:</Text>
              <Text style={styles.greyText}>0</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Quantity:</Text>
              <Text style={styles.greyText}>12</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Unit Price:</Text>
              <Text style={styles.greyText}>$50.25</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Total:</Text>
              <Text style={styles.greyText}>$50.25</Text>
            </View>
          </View>

          <View style={styles.hr}></View>


          <Text style={styles.subHeading}>Items Ordered</Text>
          <View style={styles.itemRow}>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Product:</Text>
              <Text style={styles.greyText}>Nike Dri-FIT</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Supplier Part Id:</Text>
              <Text style={styles.greyText}>746099-XL-Black</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Supplier Part Aux Id:</Text>
              <Text style={styles.greyText}>44152983126269</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Manufacturer:</Text>
              <Text style={styles.greyText}>Nike Dri-FIT</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Classification:</Text>
              <Text style={styles.greyText}>80141605</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>UOM:</Text>
              <Text style={styles.greyText}>EA</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Lead Time:</Text>
              <Text style={styles.greyText}>0</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Quantity:</Text>
              <Text style={styles.greyText}>12</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Unit Price:</Text>
              <Text style={styles.greyText}>$50.25</Text>
            </View>
            <View style={styles.itemColumn}>
              <Text style={styles.boldText}>Total:</Text>
              <Text style={styles.greyText}>$50.25</Text>
            </View>
          </View>
        </View>

        {/* Order Totals */}
        <View style={styles.section}>
          <Text style={styles.subHeading}>Order Totals </Text>
          <View style={styles.totals}>
            <Text style={styles.boldText}>Grand Total :</Text>
            <Text style={styles.greyText}>$223</Text>
          </View>
          <View style={styles.totals}>
            <Text style={styles.boldText}>Shipping :</Text>
            <Text style={styles.greyText}>$0</Text>
          </View>
          <View style={styles.totals}>
            <Text style={styles.boldText}>Tax :</Text>
            <Text style={styles.greyText}>$0</Text>
          </View>
          <View style={styles.totals}>
            <Text style={styles.boldText}>Total Due :</Text>
            <Text style={styles.greyText}>$223</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default ProcurementOrdersInvoice;
