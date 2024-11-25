import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { DataTable } from '@shopify/polaris';

function LogsTable({ items }) {
    const rows = items.map((item, index) => {
        return [
            item.id,
            new Date(item.created_at).toLocaleString(),
            item.type,
            item.priority ? 'high' : 'low',
            item.description
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
                        'numeric',
                        'text',
                        'text',
                        'text',
                        'text',
                    ]}
                    headings={[
                        'ID',
                        'Created At',
                        'Type',
                        'Priority',
                        'Description'
                    ]}
                    rows={rows}
                />
            </div>
        </div>
    );
}
export default LogsTable;
