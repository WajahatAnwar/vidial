import {
    Button,
    Card,
    IndexFilters,
    IndexTable,
    Modal,
    Pagination,
    Select,
    Spinner,
    Text,
    useBreakpoints,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function ToolsLineItemsTable({ id, refresh }) {

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

    const sortOptions = [
        { label: 'Id', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);

    const headings = [
        { title: 'Id' },
        { title: 'Description' },
        { title: 'Type' },
        { title: 'Quantity' },
        { title: 'Unit Price' },
        { title: 'Raw Total' },
        { title: 'Action' },
    ]

    const [customQuoteItems, setCustomQuoteItems] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("punchout.custom.quote.items.get", [id]),
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
    }, [customQuoteItems]);


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
        }, []
    );

    useEffect(() => {
        if (reload) {
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
            url = url.toString();
            fetch(url).then((response) => response.json()).then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((value, index) => {
                        my_rows.push(
                            {
                                id: value.id,
                                description: value.description,
                                type: value.type_name,
                                quantity: value.quantity,
                                unit_price: value.unit_price,
                                raw_total: value.unit_price * value.quantity
                            }
                        );
                    });
                    setCustomQuoteItems(my_rows);
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
        setReload(!reload);
    }, [sortSelected]);

    useEffect(() => {
        if (refresh) {
            setReload(!reload);
        }
    }, [refresh]);

    const resourceName = {
        singular: 'Custom Quote Item',
        plural: 'Custom Quote Items',
    };
    const [loading, setLoading] = useState(false)
    const handleLineItemDelete = async () => {
        setLoading(true);
        const response = await fetch(route('punchout.custom.quote.line.item.delete', { id: deleteItemID }), {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        setLoading(false);
        if (result.success) {
            handleOpenDeleteModal()
            setReload(!reload)
            Swal.fire({
                icon: 'success',
                title: 'Item deleted successfully!',
            })
        } else {
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

    const rowMarkup = customQuoteItems.map(
        (
            { id, description, type, quantity, unit_price, raw_total },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {id}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{description}</IndexTable.Cell>
                <IndexTable.Cell>{type}</IndexTable.Cell>
                <IndexTable.Cell>{quantity}</IndexTable.Cell>
                <IndexTable.Cell>${unit_price}</IndexTable.Cell>
                <IndexTable.Cell>${raw_total}</IndexTable.Cell>
                <IndexTable.Cell> <div className='tools-custom-delete-btn' onClick={() => handleOpenDeleteModal(id)}>
                    {/* <Button size='medium' icon={DeleteIcon} onClick={() => handleOpenDeleteModal(id)}></Button> */}
                    <DeleteIcon width={20} />
                </div></IndexTable.Cell>
            </IndexTable.Row>
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
                    itemCount={customQuoteItems.length}
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
            {/* Delete Modal */}
            <div>
                <Modal
                    open={openDeleteModal}
                    onClose={handleOpenDeleteModal}
                    title="Confirm Deletion"
                    size='small'
                    primaryAction={{
                        content: loading ? <Spinner size='small'></Spinner> : 'Delete',
                        onAction: handleLineItemDelete,
                        disabled: loading,
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
                            <p>Are you sure you want to delete this item? This action cannot be undone. </p>
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

ToolsLineItemsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default ToolsLineItemsTable;
