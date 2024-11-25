import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import {
    Badge,
    Button,
    Card,
    ChoiceList,
    Frame,
    Grid,
    IndexFilters,
    IndexTable,
    Link,
    Modal,
    Page,
    Pagination,
    Select as ShopifySelect,
    TextContainer,
    Toast,
    useIndexResourceState, useSetIndexFiltersMode
} from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

function MavenOrders({ }) {

    const [selected, setSelected] = useState(0);
    const [active, setActive] = useState(false);
    const [active1, setActive1] = useState(false);

    const toggleActive = useCallback(() => setActive1((active) => !active), []);

    const toastMarkup = active1 ? (
        <Toast content="Code Copied!" onDismiss={toggleActive} />
    ) : null;
    const [popupData,setPopupData] = useState({
        title: '',
        content: '',
    });

    const handleChange = (type = null, id = null) => {
        const foundItem = tableRows.find((item) => item.id === id);
        if (foundItem) {
            setPopupData({
                ...popupData,
                title: type,
                content: type == 'payload' ? JSON.parse(foundItem.payload) : JSON.parse(foundItem.response)
            });
        }

        setActive(!active);

       
    };

    const handleCopyCode = (text) => {
        navigator.clipboard.writeText(JSON.stringify(text)).then(() => {
        }).catch(err => {
            alert('Failed to copy: ', err);
        });

        setTimeout(() => {
            setActive(!active);
        }, 1500);
        toggleActive()
    };

    let timeout = null;

    const resourceName = {
        singular: 'Call',
        plural: 'Calls',
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
        path: route("maven.orders"),
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

    const [status, setStatus] = useState([
        { label: 'Success', value: 'success' },
        { label: 'Failure', value: 'failure' },
    ]);
    const [searchStatus, setSearchStatus] = useState([]);

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

        if (searchStatus.length != 0) {
            url.searchParams.set('q2', JSON.stringify(searchStatus));
        } else {
            url.searchParams.delete('q2');
        }

        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    setTableRows(result.data.orders.data);
                    setPagination({
                        path: result.data.orders.path,
                        next_cursor: result.data.orders.next_cursor,
                        next_page_url: result.data.orders.next_page_url,
                        prev_cursor: result.data.orders.prev_cursor,
                        prev_page_url: result.data.orders.prev_page_url,
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

    const handleSearchStatusChange = useCallback(
        (value) => {
            setSearchStatus(value);
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                setCurrentCursor(null);
                setReload(!reload);
            }, 500);
        },
        [tableRows]
    );

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchStatusRemove = useCallback(() => { setSearchStatus([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchStatusRemove();
    }, [
        handleQueryValueRemove,
        handleSearchStatusRemove
    ]);

    const filters = [
        {
            key: "filterbystatus",
            label: "Filter by Status",
            filter: (
                <ChoiceList
                    title="Shop"
                    titleHidden
                    choices={status}
                    selected={searchStatus || []}
                    onChange={handleSearchStatusChange}
                    allowMultiple
                />
            ),
        }
    ];

    const appliedFilters = [];

    if (!isEmpty(searchStatus)) {
        const key = "filterbystatus";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchStatus),
            onRemove: handleSearchStatusRemove,
        });
    }

    const rowMarkup = tableRows.map((value, index) => (
        <IndexTable.Row
            id={value.id}
            key={value.id}
            selected={selectedResources.includes(value.id)}
            position={index}
        >
            <IndexTable.Cell>  {/*  THIS ONE COLUMN IS NECESSARY TO USE AT LEAST ONCE */}
                {value.id}
            </IndexTable.Cell>
            <IndexTable.Cell>
                {value.name}
            </IndexTable.Cell>
            <IndexTable.Cell>
                {
                    value.status == 'success' ? <Badge progress="complete" tone="success">{value.status}</Badge> : 
                    <Badge progress="incomplete" tone='critical' >
                        {value.status}
                    </Badge>
                } 
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Button primary onClick={() => handleChange('payload',value.id)}>Payload</Button>
                <span style={{ padding: '0 5px' }}></span>
                <Button primary onClick={() => handleChange('response',value.id)}>Response</Button>
            </IndexTable.Cell>
        </IndexTable.Row >
    ));

    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
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
                            queryPlaceholder="Search API Calls"
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
                                { title: 'Order Name' },
                                { title: 'Status' },
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
            </Page>

            <Modal
                open={active}
                onClose={() => handleChange()}
                title={popupData.title}
                primaryAction={{
                    content: 'Copy',
                    onAction: ()=>handleCopyCode(popupData.content),
                }}
               
            >
                <Modal.Section>
                        <pre>
                            <code
                                dangerouslySetInnerHTML={{
                                    __html: hljs.highlight('json', JSON.stringify(popupData.content, null, 2)).value,
                                }}
                            />
                        </pre>
                </Modal.Section>
            </Modal>
            <Frame>
                {toastMarkup}
            </Frame>
        </div >
    );

    function disambiguateLabel(key, value) {

        switch (key) {
            case "filterbystatus":
                return `Filtered by Client: ${value.map((val) => status.find(value => value.value == val).label).join(", ")}`;
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

MavenOrders.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default MavenOrders;
