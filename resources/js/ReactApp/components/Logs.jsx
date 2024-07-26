import {
    Badge,
    Button,
    DataTable,
    Select,
    TextField
} from "@shopify/polaris";
import React, { useEffect, useState } from 'react';
export default function Logs() {
    const [sorting, setSorting] = useState("id desc");
    const [searchQuery, setSearchQuery] = useState(null);
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([{
        date: "July, 5, 2024",
        time: '12:30 pm',
        eventName: "New Order Trigger",
        customerName: "fahad",
        customerEmail: "olivia@untitledui.com",
        customerId: "ID43298",
        description: 'Description'
    }]);

    const sortingOptions = [
        { label: 'User Id (desc)', value: 'id desc' },
        { label: 'User Id (asc)', value: 'id asc' },
        { label: 'Install Date (desc)', value: 'created_at desc' },
        { label: 'Install Date (asc)', value: 'created_at asc' },
        // { label: '50', value: '50' },
        // { label: '100', value: '100' },
    ];
    const handleSearch = (e) => {
        setSearchQuery(e);
    }

    useEffect(() => {
        fetch('logs')
            .then((response) => response.json())
            .then((data) => {
                setLogs(data.data.logs)
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div className='cstm-logs-wrapper'>


            <div className='cstm-select'>
                <Select
                    labelInline
                    label="Sort By:"
                    options={sortingOptions}
                />


                <div className='cstm-search'>

                    <div style={{ margin: "0px 10px" }}>
                        <TextField
                            label=""
                            onChange={(e) => handleSearch(e)}
                            autoComplete="off"
                            placeholder="Search by Store Name"

                        />
                    </div>
                    <div>


                        <Button>
                            Search
                        </Button>
                    </div>

                </div>
            </div>

            <DataTable
                columnContentTypes={[
                    'text',
                    'text',
                    'text',
                    'text',
                    'text',
                    'text',
                    'text',
                    'text',
                    'text',
                    'text',
                ]}
                headings={[
                    'Date',
                    'Time',
                    'Event Name',
                    'Customer Name',
                    'Customer Email',
                    'Customer ID',
                    'Description',



                ]}
                // rows={tableRows && tableRows}

                rows={logs.map((log) =>
                    [
                        log.created_at,
                        <Badge status='success' >{log.created_at}</Badge>,
                        <div className='cstm-eventname'><div className='cstm-green-dot'></div>{log.event_type}</div>,
                        log.customer_name,
                        log.customer_email,
                        <Badge status='info' >{log.customerId}</Badge>,
                        <div>{log.description}</div>



                    ]
                )}
            // rows={[['1','Store1',,1,2, ]]}
            />

        </div>
    )
}
