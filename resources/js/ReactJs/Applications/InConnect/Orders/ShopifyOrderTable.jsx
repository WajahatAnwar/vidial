import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { Badge, DataTable } from '@shopify/polaris';

function ShopifyOrderTable({ items, current_subtotal_price }) {

    const rows = items.map((item, index) => {
        return [
            item.title,
            item.vendor,
            item.sku,
            item.quantity,
            `$${item.price}`,
            item.batched ? <Badge tone='attention' progress='complete'>Batched</Badge> : 'N/A'
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
                        'numeric',
                        'numeric',
                        'text',
                    ]}
                    headings={[
                        'Name',
                        'Vendor',
                        'SKU',
                        'QTY',
                        'Price',
                        'Batch',
                    ]}
                    rows={rows}
                    totals={['', '', '', items.reduce((accumulator, item) => {
                        return accumulator + parseInt(item.quantity);
                    }, 0), `$${current_subtotal_price ? parseFloat(current_subtotal_price).toFixed(2) : 0}`, '']}
                    showTotalsInFooter
                />
            </div>
        </div>
    );
}
export default ShopifyOrderTable;
