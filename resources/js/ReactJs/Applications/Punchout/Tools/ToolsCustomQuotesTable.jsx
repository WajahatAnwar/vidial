
import {
    BlockStack,
    Button,
    Card,
    Grid,
    IndexFilters,
    IndexTable,
    Link,
    Modal,
    Pagination,
    Select,
    Spinner,
    Text,
    TextField,
    useBreakpoints,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../Settings/settings.css';
import ToolsLineItemsTable from './ToolsLineItemsTable';
const styles = {
    page: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 0,
        paddingBottom: 0,
        display: 'flex',
        flexDirection: 'row',
    },
    header: {
        backgroundColor: '#F4F4F4',
        paddingBottom: 10,
        fontSize: 20,
    },
    list: {
        padding: '8px 0px',
    },
    item: {
        display: 'flex',
        flexDirection: 'row',
        // justifyContent: 'space-between',
        gap: 15,
        flexWrap: 'wrap',
        fontSize: 16,
        marginBottom: 5,
    },
    itemOne: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',

        flexWrap: 'wrap',
        fontSize: 12,
        marginBottom: 15,
    },
    itemTwo: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        fontSize: 11,
        marginBottom: 10,
    },
    contentOne: {
        width: '50%',
        fontSize: 16,
        color: '#535353',
        fontWeight: 700,

    },
    contentTwo: {
        width: '50%',
        fontSize: 14,
        fontWeight: 400,
        color: '#949494',
    },
    card: {
        marginBottom: 16,
        padding: 20,
        width: '50%',
    },

};

function ToolsCustomQuotesTable({ refreshTable, openRelatedModal, setOpenRelatedModal }) {

    const [loading, setLoading] = useState(false);

    const [openCustomModal, setOpenCustomModal] = useState(false);

    const [openItemModal, setOpenItemModal] = useState(false);

    const [openPushModal, setOpenPushModal] = useState(false);

    const handleOpenCustomModal = () => {
        if (openItemModal) {
            handleOpenItemModal()
        }
        if (openPushModal) {
            handleOpenPushModal()
        }
        setOpenCustomModal(!openCustomModal)
        setReload(!reload)
    };


    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [deleteItemID, setDeleteItemID] = useState(null);

    const handleOpenDeleteModal = useCallback((id = null) => {
        if (!openDeleteModal) {
            setDeleteItemID(id);
        }
        else {
            setDeleteItemID(null)
            setReload(!reload)
        }
        setOpenDeleteModal(!openDeleteModal)
    }, [openDeleteModal])

    const handleOpenPushModal = (id = null) => {
        setErrors(false)
        setOpenPushModal(!openPushModal)
        setPushData({
            website: '',
            taxable: '',
            id: id
        })
        if (openItemModal) {
            handleOpenItemModal()
        }
    };


    const [refresh, setRefresh] = useState(false);

    const [errors, setErrors] = useState(false);

    const handleOpenItemModal = (id = null) => {
        setOpenItemModal(!openItemModal)
        setRefresh(false)
        setErrors(false)
        setLineItem({
            description: '',
            unitPrice: '',
            quantity: '',
            type: '',
            id: id,
        })
        if (openPushModal) {
            handleOpenPushModal()
        }
    };

    const sortOptions = [
        { label: 'DBID', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'DBID', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);

    const headings = [
        { title: 'DBID' },
        { title: 'SKU' },
        { title: 'Items #' },
        { title: 'Date' },
        { title: 'Action' },
    ]

    const [customeQuote, setCustomeQuote] = useState([]);

    const [customQuoteData, setCustomQuoteData] = useState({
        sku: '',
        total: '',
        items_count: '',
        pushed: '',
        admin: '',
        searchTag: '',
        items: [],
        id: '',
    })

    const [lineItem, setLineItem] = useState({
        description: '',
        unitPrice: '',
        quantity: '',
        type: '',
    });

    const [pushData, setPushData] = useState({
        website: '',
        taxable: '',
    });

    const [taxableOptions, setTaxableOptions] = useState([{
        label: 'Yes',
        value: 'true',
    }, {
        label: 'No',
        value: 'false',
    }
    ]);

    const handleLineItemChange = (name, value) => {
        setLineItem({
            ...lineItem,
            [name]: value
        })
        setErrors({
            ...errors,
            [name]: false
        })
    }

    const handlePushDataChange = (name, value) => {
        setPushData({
            ...pushData,
            [name]: value
        })
    }

    const [lineItemsType, setLineItemsType] = useState([])

    const [webisteOptions, setWebsiteOptions] = useState([])

    const [pagination, setPagination] = useState({
        path: route("punchout.custom.quote.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    const [currentCursor, setCurrentCursor] = useState(null);

    const [reload, setReload] = useState(true);

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const [pageCount, setPageCount] = useState("10");

    const handlePageCount = useCallback((value) => {
        setPageCount(value);
        setCurrentCursor(null);
        setReload(true);
    }, [customeQuote]);

    const [tableTabs, setTableTabs] = useState([
        // Add more tabs to the table if required
    ]);

    const tabs = tableTabs.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
    }));

    const { mode, setMode } = useSetIndexFiltersMode();

    const [queryValue, setQueryValue] = useState('');

    let timeout = null;

    const handleQueryChange = useCallback(
        (value) => {
            setQueryValue(value)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(true);
            }, 500);
        },
        []
    );

    const handleQueryClear = useCallback(
        () => {
            setQueryValue('')
            setCurrentCursor(null);
            setReload(true);
        },
        []
    );

    const handleCreateLineItem = async () => {

        setLoading(true);

        setErrors(false)

        const payload = lineItem;

        const response = await fetch(route('punchout.custom.quote.line.item.create'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        setLoading(false);
        if (result.success) {
            handleOpenItemModal()
            setRefresh(true)
            setReload(!reload)
            setCustomQuoteData({
                ...customQuoteData,
                'items_count': customQuoteData.items_count + 1,
                'total' : customQuoteData.total + (payload.quantity * payload.unitPrice)
            })
            Swal.fire({
                icon: 'success',
                title: 'Created...'
            });
        } else {
            if (response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permission.",
                })
            }
            else {

                setErrors(result.errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    }

    const handleQuoteDelete = async () => {

        setLoading(true);

        const response = await fetch(route('punchout.custom.quote.delete', deleteItemID), {
            method: 'post',
        });

        const result = await response.json();

        if (result.success) {
            handleOpenDeleteModal()
            setLoading(false);
            Swal.fire({
                icon: 'success',
                title: 'Success...',
                text: 'Deleted.',
            });
        } else {
            setLoading(false);
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

    const handlePushToShopify = async () => {

        setLoading(true);

        setErrors(false)

        const payload = pushData;

        const response = await fetch(route('punchout.custom.quote.push.shopify.create'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        setLoading(false);
        if (result.success) {
            handleOpenPushModal()
            handleOpenCustomModal()
            setReload(true)
            Swal.fire({
                icon: 'success',
                title: 'Pushed...'
            });
        } else {
            if (response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permission.",
                })
            }
            else {

                setErrors(result.errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    }

    useEffect(() => {
        if (reload) {
            let url = new URL(pagination.path);
            url.searchParams.set('page_count', pageCount);
            if (currentCursor) {
                url.searchParams.set('cursor', currentCursor);
            }
            if (sortSelected != "") {
                url.searchParams.set('sort', sortSelected[0])
            } else {
                url.searchParams.delete('sort');
            }
            if (queryValue != '') {
                url.searchParams.set('q', queryValue);
            } else {
                url.searchParams.delete('q');
            }
            url = url.toString();
            fetch(url).then((response) => response.json()).then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((value, index) => {
                        my_rows.push(
                            {
                                id: value.id,
                                dbid: value.id,
                                sku: value.sku,
                                items_count: value.custom_quote_items_count,
                                date: value.created_at,
                                total: value.total_price,
                                pushed: value.pushed,
                                admin: value.shopify_admin_url,
                                searchTag: value.search_tag,
                            }
                        );
                        if (openRelatedModal && index < 1) {
                            handleLoadDataToModal(value.sku, value.total_price, value.custom_quote_items_count, value.pushed, value.shopify_admin_url, value.search_tag, value.id)
                            setOpenRelatedModal(false)
                        }
                    });
                    setCustomeQuote(my_rows);
                    setPagination({
                        path: result.data.path,
                        next_cursor: result.data.next_cursor,
                        next_page_url: result.data.next_page_url,
                        prev_cursor: result.data.prev_cursor,
                        prev_page_url: result.data.prev_page_url,
                    });
                }
                setReload(false);
            }).catch((err) => {
                console.log(err);
                setReload(false);
            });
        }
    }, [reload])

    useEffect(() => {
        fetch(route('punchout.custom.quote.type.list'))
            .then(response => response.json())
            .then(result => {
                setLineItemsType(result.data[0].map((type) => {
                    return {
                        label: type.uri,
                        value: `${type.id}`
                    }
                }));
                setWebsiteOptions(result.data[1].map((websites) => {
                    return {
                        label: websites.store_name,
                        value: `${websites.id}`
                    }
                }));
            });
    }, []);

    useEffect(() => {
        setReload(!reload);
    }, [sortSelected]);

    useEffect(() => {
        if (refreshTable) {
            setReload(!reload);
        }
    }, [refreshTable])

    const resourceName = {
        singular: 'Custom Quote',
        plural: 'Custom Quotes ',
    };

    const handleLoadDataToModal = (sku, total, items_count, pushed, admin, searchTag, id) => {
        sku = "Quote " + sku;
        setCustomQuoteData({
            sku,
            total,
            items_count,
            pushed,
            admin,
            searchTag,
            id,
        })
        setLineItem({
            description: '',
            unitPrice: '',
            quantity: '',
            type: '',
            id: id,
        })
        setPushData({
            website: '',
            taxable: '',
            id: id
        })
        handleOpenCustomModal()
    }

    const rowMarkup = customeQuote.map(
        (
            { id, dbid, sku, items_count, date, total, pushed, admin, searchTag, items },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" as="span">
                        {dbid}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <span className='cstm-green'>
                    <Link
                        removeUnderline={true}
                        onClick={() => handleLoadDataToModal(sku, total, items_count, pushed, admin, searchTag, id)}
                    >
                        {sku}
                    </Link></span>
                </IndexTable.Cell>
                <IndexTable.Cell>{items_count}</IndexTable.Cell>
                <IndexTable.Cell>{moment(date).format('MMMM DD, YYYY hh:mm:ss A')}</IndexTable.Cell>
                <IndexTable.Cell>
                 <div className='tools-custom-delete-btn' onClick={() => handleOpenDeleteModal(dbid)}>
                      {/* <Button size='medium' icon={DeleteIcon} onClick={() => handleOpenDeleteModal(dbid)}>
                        </Button> */}
                        <DeleteIcon width={20}/>
                        </div>
                </IndexTable.Cell>
            </IndexTable.Row >
        ),
    );

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'right', marginBottom: '15px' }}>
                <Select
                    labelInline
                    label="Rows:"
                    options={pageOptions}
                    value={pageCount}
                    onChange={handlePageCount}
                />
            </div>
            <Card>
                <IndexFilters
                    sortOptions={sortOptions}
                    sortSelected={sortSelected}
                    onSort={setSortSelected}
                    hideFilters={true}
                    queryValue={queryValue}
                    queryPlaceholder="Searching in all"
                    onQueryChange={handleQueryChange}
                    onQueryClear={handleQueryClear}
                    cancelAction={{
                        onAction: handleQueryClear,
                        disabled: false,
                        loading: false,
                    }}
                    tabs={tabs}
                    canCreateNewView={false}
                    mode={mode}
                    setMode={setMode}
                    loading={reload}
                />
                <IndexTable
                    condensed={useBreakpoints().smDown}
                    resourceName={resourceName}
                    itemCount={customeQuote.length}
                    headings={headings}
                    selectable={false}
                >
                    {rowMarkup}
                </IndexTable>
            </Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '22px', paddingBottom: '22px' }}>
                <Pagination
                    hasNext={pagination.next_cursor ? true : false}
                    hasPrevious={pagination.prev_cursor ? true : false}
                    onNext={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.next_page_url
                        })
                        setCurrentCursor(pagination.next_cursor);
                        setReload(!reload);
                    }}
                    onPrevious={() => {
                        setPagination({
                            ...pagination,
                            path: pagination.prev_page_url
                        })
                        setCurrentCursor(pagination.prev_cursor);
                        setReload(!reload);
                    }}
                />
            </div>
            {/* details Model */}
            <div>
                <Modal
                    open={openCustomModal}
                    onClose={handleOpenCustomModal}
                    title={customQuoteData.sku}
                    size='Large'
                >
                    <Modal.Section>
                        <div className='modal-wrapper-PO'>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: "40px", alignItems: 'center', marginTop: "30px" }}>
                                <p style={{ fontSize: "20px", fontWeight: "700" }}>
                                    Summary
                                </p>
                                <div className="multi-color-btn modal-pop-up-multi-btn">
                                    <Button onClick={() => handleOpenPushModal(customQuoteData.id)}>Push to Shopify</Button>
                                    <Button onClick={() => handleOpenItemModal(customQuoteData.id)}>Add Line Item</Button>
                                </div>
                            </div>
                            <div>
                                <div style={styles.page}>
                                    <div style={styles.card}>
                                        <div style={styles.list}>
                                            <div style={styles.item}>
                                                <p style={{ fontSize: "16px", fontWeight: "700" }}>Total :</p>
                                                <p style={{ fontSize: "14px", fontWeight: "400" }}>{customQuoteData.total.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
                                            </div>
                                            <div style={styles.item}>
                                                <p style={{ fontSize: "16px", fontWeight: "700" }}>Items:</p>
                                                <p style={{ fontSize: "14px", fontWeight: "400" }}>{customQuoteData.items_count}</p>
                                            </div>
                                            <div style={styles.item}>
                                                <p style={{ fontSize: "16px", fontWeight: "700" }}>Pushed to Store  :</p>
                                                <p style={{ fontSize: "14px", fontWeight: "400" }}>{customQuoteData.pushed ? 'Yes' : 'No'}</p>
                                            </div>
                                            <div style={styles.item}>
                                                <p style={{ fontSize: "16px", fontWeight: "700" }}>Administration:</p>
                                                <p style={{ fontSize: "14px", fontWeight: "400" }}>
                                                    <Link
                                                        dataPrimaryLink
                                                        removeUnderline={true}
                                                        onClick={() => window.open(customQuoteData.admin, '_blank')}
                                                    >
                                                        Manage in shopify
                                                    </Link>
                                                </p>
                                            </div>
                                            <div style={styles.item}>
                                                <p style={{ fontSize: "16px", fontWeight: "700" }}>Search Tag:</p>
                                                <p style={{ fontSize: "14px", fontWeight: "400" }}>{customQuoteData.searchTag}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='px-4'>
                                    <ToolsLineItemsTable id={customQuoteData.id} refresh={refresh} />
                                </div>
                            </div>
                        </div>
                    </Modal.Section>
                </Modal>
            </div>
            {/* Add line items */}
            <div>
                <Modal
                    open={openItemModal}
                    onClose={handleOpenItemModal}
                    title='Add line item to quote'
                    size='Medium'
                >
                    <Modal.Section>
                        <div className='modal-wrapper-PO'>
                            <div className='mt-3'>
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <div className='cstm-aesterik'>
                                                <TextField
                                                    label="Description"
                                                    value={lineItem.description}
                                                    onChange={(value) => handleLineItemChange('description', value)}
                                                    autoComplete="off"
                                                    error={errors ? errors.description ? errors.description[0] : false : false}
                                                />
                                            </div>
                                            <div className='cstm-aesterik'>
                                                <TextField
                                                    label="Unit Price"
                                                    value={lineItem.unitPrice}
                                                    onChange={(value) => handleLineItemChange('unitPrice', value)}
                                                    autoComplete="off"
                                                    error={errors ? errors.unitPrice ? errors.unitPrice[0] : false : false}
                                                />
                                            </div>
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <div className='cstm-aesterik'>
                                                <TextField
                                                    label="Quantity"
                                                    value={lineItem.quantity}
                                                    onChange={(value) => handleLineItemChange('quantity', value)}
                                                    autoComplete="off"
                                                    error={errors ? errors.quantity ? errors.quantity[0] : false : false}
                                                />
                                            </div>
                                            <div className='cstm-aesterik'>
                                                <Select
                                                    placeholder='Select'
                                                    label="Type"
                                                    options={lineItemsType}
                                                    value={lineItem.type}
                                                    onChange={(value) => handleLineItemChange('type', value)}
                                                    error={errors ? errors.type ? errors.type[0] : false : false}
                                                />
                                            </div>
                                        </BlockStack>
                                    </Grid.Cell>
                                </Grid>
                            </div>
                            <div className=' modal-wrapper-PO-btn mt-5'>
                                <div className='flex items-center ml-5 mr-2 mt-3 mb-3 float-right'>
                                    <div className='multi-color-btn modal-pop-up-multi-btn'>
                                        <Button size='large' onClick={handleCreateLineItem} disabled={loading ? true : false}>{!loading ? 'Create Line Item' : <Spinner size='small' />}</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Section>
                </Modal>

            </div>
            {/* Push to shopify Modal */}
            <div>
                <Modal
                    open={openPushModal}
                    onClose={handleOpenPushModal}
                    size='Medium'
                    title='Push to Shopify'
                >
                    <Modal.Section>
                        <div className='modal-wrapper-PO'>
                            <div className='mt-2'>
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <div className='cstm-aesterik'>
                                                <Select
                                                    placeholder='Select'
                                                    label="Websites"
                                                    options={webisteOptions}
                                                    value={pushData.website}
                                                    onChange={(value) => handlePushDataChange('website', value)}
                                                    error={errors ? errors.website ? errors.website[0] : false : false}
                                                />
                                            </div>
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <div className='cstm-aesterik'>
                                                <Select
                                                    placeholder='Select'
                                                    label="Taxable"
                                                    options={taxableOptions}
                                                    value={pushData.taxable}
                                                    onChange={(value) => handlePushDataChange('taxable', value)}
                                                    error={errors ? errors.taxable ? errors.taxable[0] : false : false}
                                                />
                                            </div>
                                        </BlockStack>
                                    </Grid.Cell>
                                </Grid>
                            </div>
                            <div className='multi-color-btn modal-pop-up-multi-btn modal-wrapper-PO-btn mt-5'>
                                <Button size='small' onClick={handlePushToShopify} disabled={loading ? true : false}>{!loading ? 'Push to shopify' : <Spinner size='small' />}</Button>
                            </div>
                        </div>
                    </Modal.Section>
                </Modal>
            </div>
            {/* Delete Modal */}
            <div>
                <Modal
                    open={openDeleteModal}
                    onClose={handleOpenDeleteModal}
                    title="Confirm Deletion"
                    size='small'
                    primaryAction={{
                        content: loading ? <Spinner size='small' /> : 'Delete',
                        disabled: loading,
                        onAction: handleQuoteDelete,
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
}

ToolsCustomQuotesTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default ToolsCustomQuotesTable;
