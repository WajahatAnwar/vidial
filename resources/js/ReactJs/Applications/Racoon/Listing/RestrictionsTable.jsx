import { router, usePage } from '@inertiajs/react';
import { Badge, Button, Card, Grid, IndexFilters, IndexTable, Modal, Pagination, Select, useIndexResourceState, useSetIndexFiltersMode } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import editracoon from '../Assets/images/edit-racoon.svg';
import trashracoon from '../Assets/images/trash-racoon.svg';
import RestrictionForm from '../Restrictions/RestrictionForm';
import EmailsList from './EmailsList';
import TagsList from './TagsList';

function RestrictionsTable({ users }) {

    const [activeM, setActiveM] = useState(false);

    const [selectedRestriction, setSelectedRestriction] = useState({});

    const handleChangeRestriction = (restriction) => {
        setSelectedRestriction(restriction);
        setActiveM(!activeM);
    }
    const handleCloseModal = () => {
        setActiveM(false); // Close the modal
    };

    const activator = '';

    const handleDelete = (id) => () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete this restriction!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(route('restrictions.destroy', id), {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                setReload(!reload);
            }
        });
    }

    const page = usePage().props;
    let timeout = null;

    const resourceName = {
        singular: 'restriction',
        plural: 'restrictions',
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
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);
    const [queryValue, setQueryValue] = useState("");
    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };

    const [pagination, setPagination] = useState({
        path: route("restrictions.list"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");
    const [reload, setReload] = useState(false);
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);
    const handlePageCount = useCallback((value) => { setPageCount(value); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    useEffect(() => {

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

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    const my_rows = [];
                    result.data.data.forEach((restriction, index) => {
                        my_rows.push(
                            {
                                id: restriction.id,
                                name: restriction.name,
                                user: restriction.user?.name,
                                collections: restriction.collections.map((collection) => collection.title).join(', '),
                                emails: <EmailsList restriction_emails={restriction.emails} />,
                                TagsList: restriction.tags.length > 0 ? <TagsList restriction_tags={restriction.tags} /> : 'N/A',
                                auto_cancel: <div className={restriction.auto_cancel ? 'badgeSuccess' : 'badgeWarning'}><Badge> {restriction.auto_cancel ? 'Yes' : 'No'} </Badge></div>,
                                notifications: <div className={restriction.notifications_enabled ? 'badgeSuccess' : 'badgeWarning'}><Badge> {restriction.notifications_enabled ? 'Yes' : 'No'} </Badge></div>,
                                action: <span style={{ display: 'flex', alignItems: 'center' }}><a onClick={() => { handleChangeRestriction(restriction) }} style={{ cursor: 'pointer' }}><img src={editracoon} style={{ marginRight: '15px' }} /></a> <a onClick={handleDelete(restriction.id)} style={{ cursor: 'pointer' }}> <img src={trashracoon} style={{ cursor: 'pointer' }} /></a></span>,
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
    }, [selected, sortSelected]);

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
        handleQueryValueRemove
    ]);

    const filters = [];

    const appliedFilters = [];

    const rowMarkup = tableRows.map(({ id, name, user, collections, emails, TagsList, auto_cancel, notifications, action }) => (
        <IndexTable.Row key={id}>
            <IndexTable.Cell>{name}</IndexTable.Cell>
            <IndexTable.Cell>{user}</IndexTable.Cell>
            <IndexTable.Cell>{collections}</IndexTable.Cell>
            <IndexTable.Cell>{emails}</IndexTable.Cell>
            <IndexTable.Cell>{TagsList}</IndexTable.Cell>
            <IndexTable.Cell>{auto_cancel}</IndexTable.Cell>
            <IndexTable.Cell>{notifications}</IndexTable.Cell>
            <IndexTable.Cell>{action}</IndexTable.Cell>
        </IndexTable.Row>
    ));
    const [active, setActive] = useState(false);

    const [firstRun, setFirstRun] = useState(true);
    useEffect(() => {

        if (!firstRun) {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
        }
        setFirstRun(false);

    }, [selected])

    return (
        <div>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>


                    <div style={{ display: "flex", justifyContent: 'space-between' }}>
                        <div style={{ display: "flex" }}>
                            {/* <div onClick={() => router.get(route('ic_index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div> */}
                            <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Restrictions </div>
                        </div>
                        <div className='orders-cc-in-printsave' style={{ display: "flex" }}>
                            <div className='flex justify-between'>
                                <div className='addnewvendors text-black' style={{ marginLeft: "10px", marginRight: "10px" }}>
                                    <Button variant="primary" onClick={() => router.get(route('restrictions.create'))}>Add New Restriction</Button>
                                </div>
                            </div>
                            <Select
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
                                { title: 'Name' },
                                { title: 'Store' },
                                { title: 'Collections' },
                                { title: 'Emails' },
                                { title: 'Customer Tags' },
                                { title: 'Auto Cancel' },
                                { title: 'Notifications' },
                                { title: 'Action' },
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
                </Grid.Cell>
            </Grid>


            <Modal
                activator={activator}
                open={activeM}
                onClose={handleCloseModal}
                title="Edit Restriction"
            >
                <Modal.Section>
                    <div>
                        <RestrictionForm users={users} restriction={selectedRestriction} onCloseModal={handleCloseModal} />
                    </div>
                </Modal.Section>
            </Modal>
        </div>
    );
}

export default RestrictionsTable;
