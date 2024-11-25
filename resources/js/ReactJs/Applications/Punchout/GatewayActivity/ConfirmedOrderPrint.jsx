import "@shopify/polaris/build/esm/styles.css";
import { Document, Page, pdf, StyleSheet, Text, View } from '@react-pdf/renderer';

export default function OriginalOrderPrint({ orderRequest, convertISOToYMD, Detailsstyles }) {

    return (
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
                            <Text style={Detailsstyles.heading}>Order # {orderRequest && orderRequest.pomw_confirmed_order.internal_id}</Text>
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
                                    <Text style={Detailsstyles.boldText}>Grand Total:</Text>
                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.pomw_confirmed_order.total).toFixed(2)} USD</Text>
                                </View>
                                <View style={Detailsstyles.itemTwo}>
                                    <Text style={Detailsstyles.boldText}>Shipping:</Text>
                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && parseInt(orderRequest.pomw_confirmed_order.shipping_total).toFixed(2)} USD</Text>
                                </View>
                                <View style={Detailsstyles.itemTwo}>
                                    <Text style={Detailsstyles.boldText}>Tax:</Text>
                                    <Text style={Detailsstyles.contentTwo}>${orderRequest && !isNaN(parseInt(orderRequest.pomw_confirmed_order.discount_total)) ? parseInt(orderRequest.discount_total).toFixed(2) : '0.00'} USD</Text>
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
    );
}
