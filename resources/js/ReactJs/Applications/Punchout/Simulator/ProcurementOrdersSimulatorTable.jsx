import {
    TextField,
    IndexTable,
    LegacyCard,
    IndexFilters,
    useSetIndexFiltersMode,
    useIndexResourceState,
    Text as TextPolaris,
    ChoiceList,
    RangeSlider,
    Badge,
    useBreakpoints,
    Card,
    Pagination,
    Select,
    Modal,
    Button,

} from '@shopify/polaris';
import { DataTable } from '@shopify/polaris';
// import type {IndexFiltersProps, TabProps} from '@shopify/polaris';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

import { BlobProvider, PDFDownloadLink } from '@react-pdf/renderer';
import React, { useState, useCallback, useEffect } from 'react';
import OrdersSimulatorTableModal from './OrdersSimulatorTableModal';
import Swal from 'sweetalert2';



const styles = StyleSheet.create({
    page: {
        display: "flex",
        flexDirection: 'column',
        padding: '20px 30px',
    },
    heading: {
        fontWeight: 'bold',
        fontSize: '20px',
        marginBottom: '20px',
    },
    section: {
        border: '1px solid #D9D9D9',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
    },
    row: {
        display: "flex",
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '5px',
    },
    column: {
        display: "flex",
        flexDirection: 'column',
        width: '50%',

    },
    subHeading: {
        fontWeight: 'bold',
        fontSize: '21px',
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
        marginTop: 10
    },
    itemRow: {
        display: "flex",
        flexDirection: 'row',
        marginBottom: '5px',
        flexWrap: "wrap",

    },
    itemColumn: {
        display: "flex",
        flexDirection: 'column',
        width: "25%",
        minWidth: "25%",
        maxWidth: "25%",
        margin: "10px 0px"
    },
    totals: {
        display: "flex",
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: '10px',
    },
    boldTextHorizontal: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: 'black',
        minWidth: "120px",
        maxWidth: "120px",
        width: "120px",
        display: "inline-block",
        marginTop: 10
    },
    hr: {
        borderBottomColor: '#EBEBEB',
        borderBottomWidth: 1,
        margin: "15px 0px",
        borderStyle: "solid",
        width: "100%",
    },
});


function ProcurementOrdersSimulatorTable() {

    // Modal
    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);
    const activator = [];

    // Modal


    //   Modal Two
    const [openModal, setOpenModal] = useState(false);
    const [queryOrderLoaded, setQueryOrderLoaded] = useState(false);
    const handleOpenModal = () => {
        setOpenModal(true);
    }
    const handleCloseModal = () => {
        if (openDeleteModal) {
            handleOpenDeleteModal();
        }
        setOpenModal(false);
    }
    const activatororders = [];


    // Modal Two


    //
    const [activeapprovals, setActiveApprovals] = useState(false);
    const handleChangeApprovals = useCallback(() => setActiveApprovals(!activeapprovals), [activeapprovals]);
    const activatorapprovals = [];

    //

    const [selectedstatus, setSelectedStatus] = useState(['hidden']);

    const handleChangeStatus = useCallback((value) => setSelectedStatus(value), []);

    const [value, setValue] = useState('');

    const handleChangeAnnotation = useCallback(
        (event) => setValue(event.target.value),
        [],
    );

    const [shops, setShops] = useState([]);
    const [searchShops, serSearchShops] = useState([]);

    let timeout = null;


    const sleep = (ms) =>
        new Promise((resolve) => setTimeout(resolve, ms));
    const [itemStrings, setItemStrings] = useState([
        // 'All',
        // 'Unpaid',
        // 'Open',
        // 'Closed',
        // 'Local delivery',
        // 'Local pickup',
    ]);

    const [pagination, setPagination] = useState({
        path: route("punchout.simulator.orders.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [currentCursor, setCurrentCursor] = useState(null);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");
    const [reload, setReload] = useState(false);
    const [tableRows, setTableRows] = useState([]);
    const deleteView = (index) => {
        const newItemStrings = [...itemStrings];
        newItemStrings.splice(index, 1);
        setItemStrings(newItemStrings);
        setSelected(0);
    };

    var rows = currentOrder?.items?.map((item) => [
        item.id,
        item.description,
        item.supplier_part_id,
        item.supplier_auxiliary_id,
        item.manufacturer_name,
        item.classification,
        item.unit_of_measure,
        item.leadtime,
        item.quantity,
        '$' + parseFloat(item.unit_price).toFixed(2),
        '$' + parseFloat(item.total).toFixed(2),
    ]) ?? [];

    const duplicateView = async (name) => {
        setItemStrings([...itemStrings, name]);
        setSelected(itemStrings.length);
        await sleep(1);
        return true;
    };

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions:
            index === 0
                ? []
                : [
                    {
                        type: 'rename',
                        onAction: () => { },
                        onPrimaryAction: async (value) => {
                            const newItemsStrings = tabs.map((item, idx) => {
                                if (idx === index) {
                                    return value;
                                }
                                return item.content;
                            });
                            await sleep(1);
                            setItemStrings(newItemsStrings);
                            return true;
                        },
                    },
                    {
                        type: 'duplicate',
                        onPrimaryAction: async (value) => {
                            await sleep(1);
                            duplicateView(value);
                            return true;
                        },
                    },
                    {
                        type: 'edit',
                    },
                    {
                        type: 'delete',
                        onPrimaryAction: async () => {
                            await sleep(1);
                            deleteView(index);
                            return true;
                        },
                    },
                ],
    }));
    const [selected, setSelected] = useState(0);
    const onCreateNewView = async (value) => {
        await sleep(500);
        setItemStrings([...itemStrings, value]);
        setSelected(itemStrings.length);
        return true;
    };
    const sortOptions = [
        { label: 'DBID', value: 'pomw_procurement_orders.id asc', directionLabel: 'Ascending' },
        { label: 'DBID', value: 'pomw_procurement_orders.id desc', directionLabel: 'Descending' },
        { label: 'User Name', value: 'users name', directionLabel: 'Ascending' },
        { label: 'User Name', value: 'users.name desc', directionLabel: 'Descending' },
        { label: 'Supplier Name', value: 'pomw_catalogs.name asc', directionLabel: 'Ascending' },
        { label: 'Supplier Name', value: 'pomw_catalogs.name desc', directionLabel: 'Descending' },
    ];
    const [sortSelected, setSortSelected] = useState(['pomw_procurement_orders.id desc']);
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const onHandleSave = async () => {
        await sleep(1);
        return true;
    };

    const primaryAction =
        selected === 0
            ? {
                type: 'save-as',
                onAction: onCreateNewView,
                disabled: false,
                loading: false,
            }
            : {
                type: 'save',
                onAction: onHandleSave,
                disabled: false,
                loading: false,
            };
    const [accountStatus, setAccountStatus] = useState(
        undefined,
    );
    const [moneySpent, setMoneySpent] = useState(
        undefined,
    );
    const [taggedWith, setTaggedWith] = useState('');
    const [queryValue, setQueryValue] = useState('');

    const handleAccountStatusChange = useCallback(
        (value) => setAccountStatus(value),
        [],
    );
    const handleMoneySpentChange = useCallback(
        (value) => setMoneySpent(value),
        [],
    );
    const handleTaggedWithChange = useCallback(
        (value) => setTaggedWith(value),
        [],
    );
    const handleFiltersQueryChange = useCallback(
        (value) => {
            console.log('ok');
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );
    const handleAccountStatusRemove = useCallback(
        () => setAccountStatus(undefined),
        [],
    );
    const handleMoneySpentRemove = useCallback(
        () => setMoneySpent(undefined),
        [],
    );
    const handleTaggedWithRemove = useCallback(() => setTaggedWith(''), []);
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = useCallback(() => {
        handleAccountStatusRemove();
        handleMoneySpentRemove();
        handleTaggedWithRemove();
        handleQueryValueRemove();
    }, [
        handleAccountStatusRemove,
        handleMoneySpentRemove,
        handleQueryValueRemove,
        handleTaggedWithRemove,
    ]);

    const filters = [
        // {
        //     key: 'accountStatus',
        //     label: 'Account status',
        //     filter: (
        //         <ChoiceList
        //             title="Account status"
        //             titleHidden
        //             choices={[
        //                 { label: 'Enabled', value: 'enabled' },
        //                 { label: 'Not invited', value: 'not invited' },
        //                 { label: 'Invited', value: 'invited' },
        //                 { label: 'Declined', value: 'declined' },
        //             ]}
        //             selected={accountStatus || []}
        //             onChange={handleAccountStatusChange}
        //             allowMultiple
        //         />
        //     ),
        //     shortcut: true,
        // },
        // {
        //     key: 'taggedWith',
        //     label: 'Tagged with',
        //     filter: (
        //         <TextField
        //             label="Tagged with"
        //             value={taggedWith}
        //             onChange={handleTaggedWithChange}
        //             autoComplete="off"
        //             labelHidden
        //         />
        //     ),
        //     shortcut: true,
        // },
        // {
        //     key: 'moneySpent',
        //     label: 'Money spent',
        //     filter: (
        //         <RangeSlider
        //             label="Money spent is between"
        //             labelHidden
        //             value={moneySpent || [0, 500]}
        //             prefix="$"
        //             output
        //             min={0}
        //             max={2000}
        //             step={1}
        //             onChange={handleMoneySpentChange}
        //         />
        //     ),
        // },
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
    if (moneySpent) {
        const key = 'moneySpent';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, moneySpent),
            onRemove: handleMoneySpentRemove,
        });
    }
    if (!isEmpty(taggedWith)) {
        const key = 'taggedWith';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, taggedWith),
            onRemove: handleTaggedWithRemove,
        });
    }

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const [pageCount, setPageCount] = useState("10");

    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };



    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(tableRows);

    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const rowMarkup = tableRows.map(
        (
            { id, dbid, internal_id, user_name, uuid, catalog_name, total, created_at },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {dbid}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{internal_id}</IndexTable.Cell>
                <IndexTable.Cell>{user_name}</IndexTable.Cell>
                <IndexTable.Cell ><div className='cstm-green' onClick={() => {
                    fetchOrderDetails(uuid);
                    handleOpenModal();
                }}>{catalog_name}</div> </IndexTable.Cell>
                <IndexTable.Cell>{total}</IndexTable.Cell>
                <IndexTable.Cell>{created_at}</IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    const fetchOrderDetails = async (orderId) => {
        var response = await fetch(route("punchout.simulator.order", orderId));
        var result = await response.json();
        if (result.success) {
            setCurrentOrder(result.data);
            // console.log(result.data);
        }
    }

    const handleStatus = async (approve) => {
        if (approve != 1) {
            approve = 0
        }
        var response = await fetch(route('punchout.simulator.order.update-status', currentOrder.uuid), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                approve: approve
            })
        });
        var json = await response.json();
        if (json.success) {
            Swal.fire({
                icon: 'success',
                title: 'Status Changed',
                text: approve === 0 ? 'Rejected Successfully' : 'Approved Successfully',
            });
            handleCloseModal();
        }
        else {
            if (response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permission.",
                })
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }

    }
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const handleOpenDeleteModal = useCallback(() => {
        setOpenDeleteModal(!openDeleteModal)
    }, [openDeleteModal])

    function formatDate(date) {
        const day = date.getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');

        // Get day suffix (st, nd, rd, th)
        const suffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        return `${day}${suffix(day)} ${monthNames[date.getMonth()]} ${year} ${hours}:${minutes}`;
    }


    useEffect(() => {
        if (!queryOrderLoaded) {
            var search_params = new URLSearchParams(window.location.search);
            if (search_params.get('order_id')) {
                fetchOrderDetails(search_params.get('order_id'));
                handleOpenModal();
            }
            setQueryOrderLoaded(true);
        }
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

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((value, index) => {
                        my_rows.push(
                            {
                                id: value.id,
                                dbid: value.id,
                                internal_id: value.internal_id,
                                user_name: value.user_name,
                                catalog_name: value.catalog_name,
                                total: '$' + value.total,
                                uuid: value.uuid,
                                created_at: value.created_time,
                            }
                        );
                    });

                    setTableRows(my_rows);
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

    return (
        <>

            <div>
                <React.Fragment>
                    <div style={{ display: 'flex', justifyContent: 'right', marginBottom: '15px' }}>
                        <Select labelInline label="Rows:" options={pageOptions} value={pageCount} onChange={handlePageCount} />
                    </div>
                    <Card>
                        <IndexFilters
                            sortOptions={sortOptions}
                            sortSelected={sortSelected}
                            queryValue={queryValue}
                            queryPlaceholder="Searching all orders"
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
                            // promotedBulkActions={promotedBulkActions}
                            hasMoreItems
                            selectable={false}
                            headings={[
                                { title: 'DBID' },
                                { title: 'Order ID' },
                                { title: 'User' },
                                { title: 'Supplier' },
                                { title: 'Total' },
                                { title: 'Created at' },
                            ]}
                        >
                            {rowMarkup}
                        </IndexTable>
                    </Card>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px', paddingBottom: '22px' }}>
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

                    {/* <div style={{ height: '500px' }}>

                        <Modal
                            activator={activator}  open={active}  onClose={handleChange} size='Large'
                        >
                            <Modal.Section>

                                <OrdersSimulatorTableModal />

                            </Modal.Section>
                        </Modal>
                    </div> */}

                    <div>
                        <Modal
                            // activator={activatororders}
                            open={openModal}
                            onClose={handleCloseModal}
                            size='Large'

                        >
                            <Modal.Section>

                                <Document>
                                    <Page style={styles.page}>
                                        {/* Title */}
                                        <div className='flex justify-between mb-4'>


                                            <Text style={styles.heading}>Procurement Order: {currentOrder?.internal_id}</Text>
                                            <div className="multi-color-btn modal-pop-up-multi-btn Approvals-btn-cstm">
                                                {/* <Button onClick={handleChangeApprovals}>Approve </Button> */}
                                                {!currentOrder?.is_rejected && !currentOrder?.is_approved ? (
                                                    <>
                                                        <Button onClick={handleOpenDeleteModal}>Reject </Button>
                                                        <Button onClick={() => handleStatus(1)}>Approve </Button>
                                                    </>
                                                ) : <Button>{currentOrder?.is_rejected ? 'Rejected' : currentOrder?.is_approved ? 'Approved' : ''}</Button>}
                                            </div>
                                        </div>

                                        {/* <div className='main-approval' >
                                            <div className='' style={{ width: "50%" }}>
                                                <p className='text-lg font-bold px-4'>
                                                    Manage approval for order: 8000000042
                                                </p>
                                                <div className='manage-approval-choicelist mt-3 px-4'>
                                                    <TextPolaris variant="headingMd" as="h6">Status</TextPolaris>
                                                    <ChoiceList

                                                        direction="horizontal"
                                                        className="horizontal-choice-list"
                                                        choices={[
                                                            { label: 'Approve', value: 'approve' },
                                                            { label: 'Reject', value: 'reject' },

                                                        ]}
                                                        selected={selectedstatus}
                                                        onChange={handleChangeStatus}
                                                    />
                                                </div>
                                            </div>
                                            <div className='orderinvoicemain p-4'>
                                                <TextPolaris variant="headingLg" as="h5">
                                                    Annotation
                                                </TextPolaris>
                                                <div className='mt-3'>
                                                    <textarea
                                                        className='gravitynotesTextArea'
                                                        rows={6}
                                                        value={value}
                                                        onChange={handleChangeAnnotation}
                                                        placeholder="Write a note........"
                                                        autoComplete="off"
                                                    />
                                                </div>

                                                <div className=' notesBtnannotation'>
                                                    <Button primary size='large'>Submit</Button>
                                                </div>
                                            </div>

                                        </div> */}

                                        {/* Order and Account Information */}
                                        <View style={styles.section}>
                                            <View style={styles.row}>
                                                <View style={styles.column}>
                                                    <Text style={styles.subHeading}>Order # {currentOrder?.internal_id}</Text>
                                                    <View style={{ flexDirection: 'row', marginTop: '5px' }}>
                                                        <Text style={styles.boldTextHorizontal}>Order Date :</Text>
                                                        <Text style={styles.greyText}> {formatDate(new Date(currentOrder?.date))}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={styles.boldTextHorizontal}>Total :</Text>
                                                        <Text style={styles.greyText}> ${currentOrder?.total ?? '0.00'}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={styles.boldTextHorizontal}>Approved :</Text>
                                                        <Text style={styles.greyText}> {currentOrder?.is_approved ? 'Yes' : 'No'}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={styles.boldTextHorizontal}>Rejected :</Text>
                                                        <Text style={styles.greyText}> {currentOrder?.is_rejected ? 'Yes' : 'No'}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={styles.boldTextHorizontal}>Delivered :</Text>
                                                        <Text style={styles.greyText}> {currentOrder?.delivered ? 'Yes' : 'No'}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={styles.boldTextHorizontal}>Catalog :</Text>
                                                        <Text style={styles.greyText}> {currentOrder?.catalog?.name}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={styles.boldTextHorizontal}>Placed from IP :</Text>
                                                        <Text style={styles.greyText}> {currentOrder?.remote_ip}</Text>
                                                    </View>
                                                    {/* <View style={{ flexDirection: 'row' }}>
                                                        <Text style={styles.boldTextHorizontal}>External ID :</Text>
                                                        <Text style={styles.greyText}> 1582585</Text>
                                                    </View> */}
                                                </View>
                                                <View style={styles.column}>
                                                    <Text style={styles.subHeading}>Account Information </Text>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={styles.boldTextHorizontal}>Name :</Text>
                                                        <Text style={styles.greyText}> {currentOrder?.user?.name}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={styles.boldTextHorizontal}>Customer Email :</Text>
                                                        <Text style={styles.greyText}> {currentOrder?.user?.email}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>


                                        {/* Arsalan */}

                                        <div className='mb-4 table-box-wrapper-cstm'>

                                            <div className='mb-4 pl-4 pt-4'>
                                                <TextPolaris variant="headingLg" as="h5">Items Ordered</TextPolaris>
                                            </div>


                                            <div className="gravityactivityhistory-main mt-2" style={{ backgroundColor: '#f7f7f7' }}>

                                                <DataTable
                                                    columnContentTypes={[
                                                        'text',
                                                        'text',
                                                        'text',
                                                        'text',
                                                        'text',
                                                        'text',
                                                        'text',
                                                        'numeric',
                                                        'numeric',
                                                        'text',
                                                        'text',
                                                    ]}
                                                    headings={[
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Item no</span>,
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Product</span>,
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Supplier Part Id</span>,
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Supplier Part Aux Id</span>,
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Manufacturer</span>,
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Classification</span>,
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Uom</span>,
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Lead Time</span>,
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Quantity</span>,
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Unit Price</span>,
                                                        <span style={{ fontSize: '12.114px', fontWeight: 700 }}>Total</span>,
                                                    ]}
                                                    rows={rows.map(row => row.map((cell, index) => (
                                                        <span style={{ color: '#424242', textAlign: 'center', fontSize: '13.123px', fontWeight: 500 }}>{cell}</span>
                                                    )))}
                                                    footerContent={
                                                        <div style={{ backgroundColor: '#f7f7f7', padding: '10px', textAlign: 'justify', fontSize: '11px' }}>
                                                            {`Showing 1 to ${rows.length} of ${rows.length} entries`}
                                                        </div>
                                                    }
                                                />

                                            </div>



                                        </div>

                                        {/* Items Ordered */}
                                        {/* <View style={styles.section}>
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
                                        </View> */}

                                        {/* Order Totals */}
                                        <View style={styles.section}>
                                            <Text style={styles.subHeading}>Order Totals </Text>
                                            <View style={styles.totals}>
                                                <Text style={styles.boldText}>Grand Total :</Text>
                                                <Text style={styles.greyText}>${parseFloat(currentOrder?.sub_total ?? '0.00').toFixed(2)}</Text>
                                            </View>
                                            <View style={styles.totals}>
                                                <Text style={styles.boldText}>Shipping :</Text>
                                                <Text style={styles.greyText}>${parseFloat(currentOrder?.shipping_total ?? '0.00').toFixed(2)}</Text>
                                            </View>
                                            <View style={styles.totals}>
                                                <Text style={styles.boldText}>Tax :</Text>
                                                <Text style={styles.greyText}>${parseFloat(currentOrder?.tax_total ?? '0.00').toFixed(2)}</Text>
                                            </View>
                                            <View style={styles.totals}>
                                                <Text style={styles.boldText}>Total Due :</Text>
                                                <Text style={styles.greyText}>${parseFloat(currentOrder?.total ?? '0.00').toFixed(2)}</Text>
                                            </View>
                                        </View>
                                    </Page>
                                </Document>

                            </Modal.Section>
                        </Modal>



                    </div>

                    {/* <div>
                        <Modal
                            activator={activator}
                            open={active}
                            onClose={handleChange}
                            size='Large'

                        >
                            <Modal.Section>

                                <OrdersSimulatorTableModal />

                            </Modal.Section>
                        </Modal>
                    </div> */}

                    <Modal
                        // activator={activatorapprovals}
                        open={activeapprovals}
                        onClose={handleChangeApprovals}
                        size='Medium'

                    >
                        <Modal.Section>
                            <div className='main-approval'>

                                <p className='text-lg font-bold px-4'>
                                    Manage approval for order: 8000000042
                                </p>

                                <div className='manage-approval-choicelist mt-3 px-4'>
                                    <TextPolaris variant="headingMd" as="h6">Status</TextPolaris>
                                    <ChoiceList

                                        direction="horizontal"
                                        className="horizontal-choice-list"
                                        choices={[
                                            { label: 'Approve', value: 'approve' },
                                            { label: 'Reject', value: 'reject' },

                                        ]}
                                        selected={selectedstatus}
                                        onChange={handleChangeStatus}
                                    />
                                </div>
                                <div className='orderinvoicemain p-4'>
                                    <TextPolaris variant="headingLg" as="h5">
                                        Annotation
                                    </TextPolaris>
                                    <div className='mt-3'>
                                        <textarea
                                            className='gravitynotesTextArea'
                                            rows={6}
                                            value={value}
                                            onChange={handleChangeAnnotation}
                                            placeholder="Write a note........"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className=' notesBtnannotation'>
                                        <Button primary size='large'>Submit</Button>
                                    </div>
                                </div>

                            </div>

                        </Modal.Section>
                    </Modal>


                </React.Fragment>
            </div>

            <div>
                <Modal
                    open={openDeleteModal}
                    onClose={handleOpenDeleteModal}
                    title="Confirm Rejection"
                    size='small'
                    primaryAction={{
                        content: 'Reject',
                        onAction: handleStatus,
                    }}
                    secondaryActions={[
                        {
                            content: 'Cancel',
                            onAction: handleOpenDeleteModal,
                        },
                    ]}
                >
                    <Modal.Section>
                        <Text>
                            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
                        </Text>
                    </Modal.Section>
                </Modal>
            </div>
        </>
    );

    function disambiguateLabel(key, value) {

        switch (key) {
            case "filterbyshop":
                return `Filtered by Shop: ${value.map((val) => shops.find(value => value.value == val).label).join(", ")}`;
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

ProcurementOrdersSimulatorTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default ProcurementOrdersSimulatorTable;
