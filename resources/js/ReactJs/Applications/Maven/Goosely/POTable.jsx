import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import {
    Button,
    Card,
    IndexFilters,
    IndexTable,
    Modal,
    Pagination,
    useIndexResourceState,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

function ShopifyAccountsTable() {

    const reloadAccountsTable = useSelector(state => state.inConnectAccounts.reloadAccountsTable);

    const convertDateFormat = (dateString) => new Date(dateString).toISOString().split('T')[0].split('-').reverse().join('-');

    let timeout = null;

    const resourceName = {
        singular: 'purchase order',
        plural: 'purchase orders',
    };

    const [tableRows, setTableRows] = useState([]);

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    const [pageCount, setPageCount] = useState("10");
    const handlePageCount = useCallback((value) => { setPageCount(value); setReload(!reload); }, [tableRows]);

    const [selected, setSelected] = useState(0);
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
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' }
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);

    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [queryValue, setQueryValue] = useState('');

    const [pagination, setPagination] = useState({
        path: route("maven.goosely.orders.list"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);

    const [active, setActive] = useState(false);

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);

    useEffect(() => {

        let url = new URL(pagination.path);

        if (pageCount) {
            url.searchParams.set('page_count', pageCount);
        }

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        if (sortSelected != "") {
            url.searchParams.set('q5', sortSelected[0]);
        } else {
            url.searchParams.delete('q5');
        }

        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    // console.log(result);

                    const my_rows = result.data.data.map((order, index) => {
                        return {
                            id: order.id,
                            due_date: order.due_date,
                            vendor_id: order.vendor_id,
                            reference_no: order.reference_no,
                            document_no: order.document_no,
                            intacct_invoice_no: order.intacct_invoice_number ? order.intacct_invoice_number : 'N/A',
                            intacct_po_id: order.intacct_purchase_order_id,
                        }
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

    }, [reload, reloadAccountsTable])

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

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [
        handleQueryValueRemove,
    ]);

    const filters = [];

    const appliedFilters = [];

    const rowMarkup = tableRows.map(
        ({ id, due_date, vendor_id, reference_no, document_no, intacct_invoice_no, intacct_po_id }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    {id}
                </IndexTable.Cell>

                <IndexTable.Cell>
                    {due_date}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {vendor_id}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className='custom_style'>
                        {reference_no}
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {document_no}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {intacct_po_id}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {intacct_invoice_no}
                </IndexTable.Cell>
                {/* <IndexTable.Cell>
                    <Button size='slim' onClick={() => generateInvoice(id)}>Generate Invoice</Button>
                </IndexTable.Cell> */}
            </IndexTable.Row>
        ),
    );

    // const generateInvoice = (id) => {
    //     Swal.fire({
    //         title: "Are you sure?",
    //         text: "You won't be able to revert this!",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: "#3085d6",
    //         cancelButtonColor: "#d33",
    //         confirmButtonText: "Yes, Generate Invoice!"
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    //             async function postJSON(data) {
    //                 try {
    //                     const response = await fetch(route('maven.goosely.generate.invoice'), {
    //                         method: "POST",
    //                         headers: {
    //                             "Content-Type": "application/json",
    //                         },
    //                         body: JSON.stringify(data),
    //                     });

    //                     const result = await response.json();
    //                     console.log("Success:", result);
    //                 } catch (error) {
    //                     console.error("Error:", error);
    //                 }
    //             }
    //             const data = { id: id };
    //             postJSON(data);
    //         }
    //     });
    // }

    return (
        <div>
            <Modal
                open={active}
                onClose={() => setActive(false)}
                title="Log Detail"
                secondaryActions={[{
                    content: 'Close',
                    onAction: () => setActive(false),
                }]}
            >
                <Modal.Section>
                    Content
                </Modal.Section>
            </Modal>
            <Card>
                <IndexFilters
                    sortOptions={sortOptions}
                    sortSelected={sortSelected}
                    queryValue={queryValue}
                    queryPlaceholder="Searching in all"
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
                        { title: 'Id' },
                        { title: 'Due Date' },
                        { title: 'Vendor ID' },
                        { title: 'Reference #' },
                        { title: 'Document #' },
                        { title: 'Intacct PO #' },
                        { title: 'Intacct Invoice #' },
                        // { title: 'Actions' }
                    ]}
                    hasMoreItems
                    selectable={false}
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
        </div>
    );
}

ShopifyAccountsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default ShopifyAccountsTable;


