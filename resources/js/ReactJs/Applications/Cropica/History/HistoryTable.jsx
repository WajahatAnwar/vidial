import {
    Button,
    Card,
    ChoiceList,
    Frame,
    Grid,
    IndexFilters,
    IndexTable,
    Modal,
    Pagination,
    Select as ShopifySelect,
    Tabs,
    Text,
    Toast,
    useIndexResourceState, useSetIndexFiltersMode
} from '@shopify/polaris';

import Swal from 'sweetalert2';
import { useCallback, useEffect, useState } from 'react';
import Timeline from '../../InConnect/Batches/Timeline';

function HistoryTable({ }) {

    const [activeTwo, setActiveTwo] = useState(false);
    const handleChange = useCallback(() => setActiveTwo(!activeTwo), [activeTwo]);
    const [selectedCropicaJob, setSelectedCropicaJob] = useState(false);

    const [selectedTab, setSelectedTab] = useState(0);
    const handleTabChange = useCallback((selectedTabIndex) => setSelectedTab(selectedTabIndex), []);

    const cardTabs = [
        {
            id: 'Logs',
            content: 'Logs',
            panelID: 'Logs',
        },
        {
            id: 'Failed Products',
            content: 'Failed Products',
            panelID: 'Failed Products',
        },
    ];

    const [active, setActive] = useState(false);
    const handleClose = useCallback(() => { setActive(false); }, [active]);

    const [toastMessage, setToastMessage] = useState('');
    const [toastActive, setToastActive] = useState(false);
    const toggleToastActive = useCallback(() => setToastActive((toastActive) => !toastActive), []);

    let toastMarkup = toastActive ? (
        <Toast content={toastMessage} onDismiss={toggleToastActive} />
    ) : null;

    const [selected, setSelected] = useState(0);

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

    let timeout = null;

    const resourceName = {
        singular: 'History',
        plural: 'Histories',
    };

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const [pageCount, setPageCount] = useState("10");

    const [tableRows, setTableRows] = useState([]);

    const tabs = ['All'].map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions: []
    }));

    const sortOptions = [
        { label: 'Id', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);
    const [queryValue, setQueryValue] = useState("");
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [pagination, setPagination] = useState({
        path: route('cropica.fetch.history'),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);
    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const [shops, setShops] = useState([]);
    const [searchShops, serSearchShops] = useState([]);
    const [statuses, setStatuses] = useState([
        { label: 'InQueue', value: 'InQueue' },
        { label: 'InProgress', value: 'InProgress' },
        { label: 'Complete', value: 'Complete' },
        { label: 'Failed', value: 'Failed' },
        { label: 'Cancelled', value: 'Cancelled' }
    ]);
    const [searchStatuses, setSearchStatuses] = useState([]);
    const [currentJobId, setCurrentJobId] = useState(null);

    const JobStatusTextColor = (jobStatus) => {
        let textReturn;
        switch (jobStatus) {
            case 'Failed':
                textReturn = '<span style="font-weight:bold;color:#EC3E3E;">' + jobStatus + '</span>';
                break;
            case 'Complete':
                textReturn = '<span style="font-weight:bold;color:#12B135;">Completed</span>';
                break;
            case 'InProgress':
                textReturn = '<span style="font-weight:bold;color: #FBBE17">' + jobStatus + '</span>';
                break;
            case 'InQueue':
                textReturn = '<span style="font-weight:bold;color:#39A6CD;">' + jobStatus + '</span>';
                break;
            case 'Cancelled':
                textReturn = '<span style="font-weight:bold;color:#F44336;">' + jobStatus + '</span>';
                break;
            default:
                textReturn = '<span style="font-weight:bold;color:#39A6CD;">' + jobStatus + '</span>';
        }
        return textReturn;
    }

    const changeDateFormat = (date) => {
        let d = new Date(date);
        let day = String(d.getDate()).padStart(2, '0');      // Add leading zero to day
        let month = String(d.getMonth() + 1).padStart(2, '0'); // Add leading zero to month
        let year = d.getFullYear();
        let formatted_date = `${year}-${month}-${day}`;
        return formatted_date;
    }

    useEffect(() => {

        let url = new URL(pagination.path);

        url.searchParams.set('page_count', pageCount);

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        if (sortSelected != "") {
            url.searchParams.set('sort', sortSelected[0])
        } else {
            url.searchParams.delete('sort');
        }

        if (searchShops.length != 0) {
            url.searchParams.set('q2', JSON.stringify(searchShops));
        } else {
            url.searchParams.delete('q2');
        }

        if (searchStatuses.length != 0) {
            url.searchParams.set('q3', JSON.stringify(searchStatuses));
        } else {
            url.searchParams.delete('q3');
        }

        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    console.log(result);
                    setTableRows(result.data.data);
                    setShops(result.data2.map((item, index) => {
                        return {
                            value: item.id,
                            label: item.store_name ? item.store_name : item.name
                        }
                    }));

                    setPagination({
                        path: result.data.path,
                        next_cursor: result.data.next_cursor,
                        next_page_url: result.data.next_page_url,
                        prev_cursor: result.data.prev_cursor,
                        prev_page_url: result.data.prev_page_url,
                    });
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });

    }, [reload])

    useEffect(() => {
        setReload(!reload);
    }, [sortSelected]);

    const handleFiltersQueryChange = useCallback(
        (value) => {
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleSearchShopsChange = useCallback(
        (value) => {
            serSearchShops(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );
    const handleSearchStatusChange = useCallback(
        (value) => {
            setSearchStatuses(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchShopsRemove = useCallback(() => { serSearchShops([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchStatusRemove = useCallback(() => { setSearchStatuses([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchShopsRemove();
        handleSearchStatusRemove();
    }, [
        handleQueryValueRemove,
        handleSearchShopsRemove,
        handleSearchStatusRemove
    ]);

    const filters = [
        {
            key: "filterbyshop",
            label: "Filter by Shop",
            filter: (
                <ChoiceList
                    title="Shop"
                    titleHidden
                    choices={shops}
                    selected={searchShops || []}
                    onChange={handleSearchShopsChange}
                    allowMultiple
                />
            ),
        },
        {
            key: "filterbystatus",
            label: "Filter by Status",
            filter: (
                <ChoiceList
                    title="Status"
                    titleHidden
                    choices={statuses}
                    selected={searchStatuses || []}
                    onChange={handleSearchStatusChange}
                    allowMultiple
                />
            ),
        }
    ];

    const appliedFilters = [];

    if (!isEmpty(searchShops)) {
        const key = "filterbyshop";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchShops),
            onRemove: handleSearchShopsRemove,
        });
    }
    if (!isEmpty(searchStatuses)) {
        const key = "filterbystatus";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchStatuses),
            onRemove: handleSearchStatusRemove,
        });
    }

    const rowMarkup = tableRows.map((job, index) => (

        <IndexTable.Row id={job.id} key={job.id} selected={selectedResources.includes(job.id)} position={index}>
            <IndexTable.Cell>
                <Text>{job.id}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">{job.store_name}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{changeDateFormat(job.created_at)}</IndexTable.Cell>
            <IndexTable.Cell>{job.total_products}</IndexTable.Cell>
            <IndexTable.Cell>{job.processed_products}</IndexTable.Cell>
            <IndexTable.Cell><div dangerouslySetInnerHTML={{ __html: JobStatusTextColor(job.status) }} /></IndexTable.Cell>
            <IndexTable.Cell>{job.processed_images}/{job.total_images}</IndexTable.Cell>
            <IndexTable.Cell>
                <Button onClick={() => {
                    setSelectedCropicaJob(job);
                    setActiveTwo(true);
                }}>Logs</Button>
                <span style={{ marginRight: "10px" }}></span>
                <Button disabled={job.status != 'InProgress' && job.status != 'InQueue'} tone='critical' variant='primary' onClick={() => { setActive(true); setCurrentJobId(job.id) }}>Cancel</Button>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    const handleCancelJob = async (job_id) => {
        var response = await fetch(route('cropica.jobs.cancel'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                job_id,
            })
        });
        var json = await response.json();
        if (json.success) {
            setToastMessage(json.message);
            toggleToastActive();
            setActive(false);
            setReload(!reload);
        }
    }

    const restartCropicaHandler = (failedProducts) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to restart the process!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, restart it!'
        }).then((result) => {
            if (result.isConfirmed) {

                let temp = [];
                let user_id = "";
                let cropica_job_id = "";
                failedProducts.forEach(element => {
                    user_id = element.user_id;
                    cropica_job_id = element.cropica_job_id;
                    temp.push(element.product_id);
                });

                fetch(route('cropica.initiate.cropping'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ selectedResources: temp, store: user_id, retry: true, existingCropicaJobId: cropica_job_id })
                }).then((response) => response.json())
                    .then((data) => {
                        if (data.status == "success") {
                            handleSelectionChange('all', false)
                            setReload(!reload);
                            setActiveTwo(false);
                            setToastActive(true);
                            setToastMessage("Process restarted Sucessfully");
                        } else {
                            setToastActive(true);
                            setToastMessage("Process restarted not Sucessfully");
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        })
    }

    return (
        <div>
            <Modal
                size='large'
                open={activeTwo}
                onClose={handleChange}
                title="Cropica Job Details"
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: handleChange,
                    },
                ]}
            >
                <div style={{ display: "flex", justifyContent: 'space-between', alignItems: "center" }}>
                    <div>
                        <Tabs tabs={cardTabs} selected={selectedTab} onSelect={handleTabChange}>
                        </Tabs>
                    </div>
                    {selectedCropicaJob && selectedCropicaJob.failed_products.length > 0 &&
                        <div style={{ marginRight: "15px" }}>
                            <Button size='slim' variant='primary' onClick={() => restartCropicaHandler(selectedCropicaJob.failed_products)}>Restart Process</Button>
                        </div>
                    }
                </div>
                <div style={{ fontSize: "14px", border: "1px solid #bfbfbf", margin: "15px", marginTop: "5px", padding: "15px", borderRadius: "10px", background: "#fafafa", minHeight: "230px" }}>
                    {selectedTab == 0 && selectedCropicaJob && <div style={{ paddingBottom: "40px" }}>
                        <Timeline items={selectedCropicaJob.logs.map((value, index) => {
                            return {
                                tone: value.type == "info" ? 'base' : value.type == "error" ? 'critical' : value.type == "success" ? 'success' : 'base',
                                timelineEvent: value.description,
                                timestamp: new Date(value.created_at)
                            }
                        })} />
                    </div>}
                    {selectedTab == 1 && selectedCropicaJob && <div style={{ paddingBottom: "40px" }}>
                        <Timeline items={selectedCropicaJob.failed_products.map((value, index) => {
                            return {
                                tone: 'critical',
                                timelineEvent: value.product_title,
                                timestamp: new Date(value.created_at)
                            }
                        })} />
                    </div>}
                </div>
            </Modal>
            <Modal
                open={active}
                onClose={handleClose}
            >
                <Modal.Section>
                    <div className='text-center mt-10'>
                        <p className='font-bold'>Are you Sure you Cancel this job? This can't be undone!</p>
                    </div>
                    <div className='confirmation-btns  flex mt-6 justify-center gap-3'>
                        <Button variant="tertiary" onClick={handleClose}>Cancel</Button>
                        <Button onClick={() => handleCancelJob(currentJobId)}>Proceed</Button>
                    </div>
                </Modal.Section>
            </Modal>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                    <div>
                        <div className='orders-cc-in-printsave' style={{ display: "flex", justifyContent: 'flex-end' }}>
                            <ShopifySelect
                                labelInline
                                label="Rows:"
                                options={pageOptions}
                                value={pageCount}
                                onChange={handlePageCount}
                            />
                        </div>
                    </div>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                    <Card>
                        <IndexFilters
                            sortOptions={sortOptions}
                            sortSelected={sortSelected}
                            queryValue={queryValue}
                            queryPlaceholder="Job Name, Store Name, etc..."
                            onQueryChange={handleFiltersQueryChange}
                            onQueryClear={handleQueryValueRemove}
                            onSort={setSortSelected}
                            cancelAction={{
                                onAction: onHandleCancel,
                                disabled: false,
                                loading: false,
                            }}
                            tabs={tabs}
                            selected={selected}
                            onSelect={setSelected}
                            canCreateNewView={false}
                            filters={filters}
                            appliedFilters={appliedFilters}
                            onClearAll={handleFiltersClearAll}
                            mode={mode}
                            setMode={setMode}
                            loading={loading}
                        />
                        <IndexTable
                            resourceName={resourceName}
                            itemCount={tableRows.length}
                            selectedItemsCount={
                                allResourcesSelected ? 'All' : selectedResources.length
                            }
                            onSelectionChange={handleSelectionChange}
                            headings={[
                                { title: 'ID' },
                                { title: 'Store Name' },
                                { title: 'Date' },
                                { title: 'Total Products' },
                                { title: 'Processed Products' },
                                { title: 'Status' },
                                { title: 'Image Quantity' },
                                { title: 'Action' },
                            ]}
                            hasMoreItems
                            selectable={false}
                        >
                            {rowMarkup}
                        </IndexTable>
                    </Card>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px' }}>
                        <Pagination hasNext={pagination.next_cursor ? true : false} hasPrevious={pagination.prev_cursor ? true : false} onNext={() => {
                            setPagination({
                                ...pagination,
                                path: pagination.next_page_url
                            })
                            setCurrentCursor(pagination.next_cursor);
                            setReload(!reload);
                        }} onPrevious={() => {
                            setPagination({
                                ...pagination,
                                path: pagination.prev_page_url
                            })
                            setCurrentCursor(pagination.prev_cursor);
                            setReload(!reload);
                        }} />
                    </div>
                </Grid.Cell>
            </Grid>
            <div className='cstm-toast-wrapper' style={{ height: '0px' }}>
                <Frame>
                    {toastMarkup}
                </Frame>
            </div>
        </div >
    );

    function disambiguateLabel(key, value) {

        switch (key) {
            case "filterbyshop":
                return `Filtered by Shop: ${value.map((val) => shops.find(value => value.value == val).label).join(", ")}`;
            case "filterbystatus":
                return `Filtered by Status: ${value.map((val) => statuses.find(value => value.value == val).label).join(", ")}`;
            default:
                return value;
        }
    }

    function isEmpty(value) {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === '' || value == null;
        }
    }
}

export default HistoryTable;
