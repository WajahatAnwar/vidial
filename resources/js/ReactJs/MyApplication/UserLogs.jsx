import { usePage } from "@inertiajs/react";
import {
    Badge,
    Button,
    DataTable,
    Select,
    TextField
} from "@shopify/polaris";
import React, { useEffect, useState } from 'react';
export default function UserLogs() {
    const page = usePage().props;
    const query = page.ziggy.query;
    const id = page.ziggy.query.id

    const [sorting, setSorting] = useState("desc");
    const [searchQuery, setSearchQuery] = useState(null);
    const [logs, setLogs] = useState([]);
    const [reload, setReload] = useState(false);

    const sortingOptions = [
        { label: 'Created At (desc)', value: 'desc' },
        { label: 'Created At (asc)', value: 'asc' },
        // { label: '50', value: '50' },
        // { label: '100', value: '100' },
    ];
    const handleSearch = (e) => {
        setSearchQuery(e);
        // setReload(!reload);
    }
    const handleSortingChange = (e) => {
        setSorting(e);
        setReload(!reload); // Toggle reload state to trigger reload
    };

    useEffect(() => {
        let url = `/u-logs?sort=${sorting}&id=${id}`;
        // search
        if (searchQuery) {
            url += `&q=${searchQuery}`;
        }
        console.log(url);
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                setLogs(data.data.logs)
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, [reload]);


    return (
        <div className='cstm-logs-wrapper'>


            <div className='cstm-select'>
                <Select
                    labelInline
                    label="Sort By:"
                    options={sortingOptions}
                    value={sorting}
                    onChange={(e) => handleSortingChange(e)}
                />


                <div className='cstm-search'>

                    <div style={{ margin: "0px 10px" }}>
                        <TextField
                            label=""
                            onChange={(e) => handleSearch(e)}
                            autoComplete="off"
                            placeholder="Search by Event Name"
                            value={searchQuery}
                        />
                    </div>
                    <div>


                        <Button onClick={() => setReload(!reload)}>
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




                ]}
                // rows={tableRows && tableRows}

                rows={logs.map((log) =>
                    [
                        log.formatted_date,
                        <Badge status='success' >{log.formatted_time}</Badge>,
                        <div className='cstm-eventname'>
                            <>
                                <div className='cstm-green-dot'></div>
                                {log.email_type ? log.email_type : 'N/A'}
                            </>
                        </div>,
                        log.customer_name,
                        log.customer_email,
                        // <Badge status='info' >{log.customerId}</Badge>,
                    ]
                )}
            // rows={[['1','Store1',,1,2, ]]}
            />

        </div>
    )
}
