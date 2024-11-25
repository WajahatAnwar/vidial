import {
    Button,
    Card,
    IndexFilters,
    IndexTable,
    Link,
    Modal,
    Pagination,
    Select,
    Spinner,
    Text,
    useBreakpoints,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function ToolsDiscountCodesTable({ refreshTable, handleEditModal }) {

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
        { title: 'DBID' },
        { title: 'Label' },
        { title: 'Value' },
        { title: 'Client' },
        { title: 'Type' },
        { title: 'Usage' },
        { title: 'Current/Initial Balance' },
        { title: 'Date' },
        { title: 'Expiry Date' },
        { title: 'Action' },
    ]

    const [discountCodes, setDiscountCodes] = useState([]);

    const [pagination, setPagination] = useState({
        path: route("punchout.discount.codes.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    const [currentCursor, setCurrentCursor] = useState(null);

    const [loading, setLoading] = useState(false);

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
    }, [discountCodes]);


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
                                dbid: value.id,
                                label: value.label,
                                type: value.type_name,
                                value: value.value,
                                client: value.client_name,
                                usage: value.usage_type_name,
                                current: value.current_balance_value,
                                date: value.created_at,
                                discountCode: value,
                                expiry_date: value.expiry_date
                            }
                        );
                    });
                    setDiscountCodes(my_rows);
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
        if (refreshTable) {
            setReload(!reload);
        }
    }, [refreshTable])

    const resourceName = {
        singular: 'Discount Code',
        plural: 'Discount Codes',
    };

    const handleDiscountCodeDelete = async () => {

        setLoading(true);

        const response = await fetch(route('punchout.discount.code.delete', deleteItemID), {
            method: 'post',
        });

        const result = await response.json();

        if (result.success) {
            handleOpenDeleteModal()
            setLoading(false);
            Swal.fire({
                icon: 'success',
                title: 'Deleted...',
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

    const rowMarkup = discountCodes.map(
        (
            { dbid, label, value, client, type, usage, current, date, expiry_date, discountCode },
            index,
        ) => (
            <IndexTable.Row
                id={dbid}
                key={dbid}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd"  as="span">
                        {dbid}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <span className='cstm-green'>
                    <Link
                        removeUnderline={true}
                        onClick={() => handleEditModal(discountCode)}
                    >
                        {label}
                    </Link></span>
                </IndexTable.Cell>
                <IndexTable.Cell>{value}</IndexTable.Cell>
                <IndexTable.Cell>{client}</IndexTable.Cell>
                <IndexTable.Cell>{type}</IndexTable.Cell>
                <IndexTable.Cell>{usage}</IndexTable.Cell>
                <IndexTable.Cell>{current}</IndexTable.Cell>
                <IndexTable.Cell>{moment(date).format('MMMM DD, YYYY hh:mm:ss A')}</IndexTable.Cell>
                <IndexTable.Cell>{moment(expiry_date).format('MMMM DD, YYYY')}</IndexTable.Cell>

                <IndexTable.Cell>
                    <div className='tools-custom-delete-btn' onClick={() => handleOpenDeleteModal(dbid)}>
                        {/* <Button size='medium' icon={DeleteIcon} onClick={() => handleOpenDeleteModal(dbid)}></Button> */}
                        <DeleteIcon  width={20}/>
                    </div>
                    </IndexTable.Cell>
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
                    itemCount={discountCodes.length}
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
                        content: loading ? <Spinner size='small' /> : 'Delete',
                        disabled: loading,
                        onAction: handleDiscountCodeDelete,
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
                            <p>Are you sure you want to delete this item ? This action cannot be undone.</p>
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

ToolsDiscountCodesTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default ToolsDiscountCodesTable;
