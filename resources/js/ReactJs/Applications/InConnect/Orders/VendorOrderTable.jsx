import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { DataTable } from '@shopify/polaris';

function VendorOrderTable({ items,order }) {
    // const rows = [
    //     ['Port Authority Regular Polo', 'K500-L-Black', '2', '$38.98', <span className='orders-tick-cc-inco-print' style={{ display: 'flex', alignItems: "center" }}><img src={`${window.appURL}/images/order-print.png`} style={{ width: '22px', marginRight: '5px' }} /><span>Mapped</span></span>],
    //     ['Dri Duck Work Jacket', 'Dri Duck Work Jacket', '1', '$51.28', <span className='orders-tick-cc-inco-print-notmapped' style={{ display: 'flex', alignItems: "center" }}><img src={`${window.appURL}/images/order-print-close.png`} style={{ width: '22px', marginRight: '5px' }} /><span>Not Mapped</span></span>],
    //     ['Port Authority Regular Polo', 'K500-L-Black', '2', '$38.98', <span className='orders-tick-cc-inco-print' style={{ display: 'flex', alignItems: "center" }}><img src={`${window.appURL}/images/order-print.png`} style={{ width: '22px', marginRight: '5px' }} /><span>Mapped</span></span>],
    // ];
    let vendor_purchase_orders = order.vendor_purchase_orders ? order.vendor_purchase_orders : [];
    const trackingNumber = (vendor_id) => {
        const purchaseOrder = vendor_purchase_orders.find((item) => item.vendor_id === vendor_id);
        return purchaseOrder ? purchaseOrder.tracking_number : 'N/A';
    }
    const rows = items.map((item, index) => {
        return [
            item?.vendor?.name,
            item.product_id,
            item.part_id,
            item.fob_id,
            item.fob_state,
            `$${item.price}`,
            item.price_type,
            trackingNumber(item.vendor.id)
        ];
    });

    return (

        <div className='print-doc'>
            <style>
                {`
    @media print {
    table {
     text-align: left !important;
     margin-top: 90px;
     min-width:600px;
     width:100%;
     }
     .print-table-wraper table
     {
        border-radius:5px;
        border:1px solid #cccccc;
        padding: 10px;
     }
     .print-table-wraper table tr
     {
            border:1px solid #cccccc;
            background-color:#333333;
     }
    }
  `}
            </style>
            <div className='print-table-wraper'>
                <DataTable
                    columnContentTypes={[
                        'text',
                        'text',
                        'text',
                        'text',
                        'text',
                        'numeric',
                        'text',
                    ]}
                    headings={[
                        'Vendor',
                        'Product ID',
                        'Part ID',
                        'Fob ID',
                        'Fob State',
                        'Price',
                        'Price Type',
                        'Tracking #'
                    ]}
                    rows={rows}
                />
            </div>
        </div>
    );
}
export default VendorOrderTable;
