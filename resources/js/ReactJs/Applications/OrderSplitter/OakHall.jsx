import AppLayout from '@/ReactJs/Applications/OrderSplitter/AppLayout';
import "@/ReactJs/Applications/OrderSplitter/Assets/css/style.css";
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';
import { router, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    Grid, Icon,
    Text,
    IndexFilters,
    IndexTable,
    Link,
    Modal,
    ChoiceList ,
    Page,
    Pagination,
    Select,
    TextContainer,
    TextField,
    useIndexResourceState,
    useSetIndexFiltersMode,
    BlockStack

} from '@shopify/polaris';

import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { DataTable, Badge } from '@shopify/polaris';
import { PersonIcon } from '@shopify/polaris-icons';

import {
    ViewIcon
} from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function OakHall({orders}) {
    const [selectedOrderId, setSelectedOrderId] = useState(0);
    const [active, setActive] = useState(true);
    const toggleModal = useCallback((id=null) => {
        setActive((active) => !active);
        setSelectedOrderId(id);
    }, []);
    const page = usePage().props;
    const { query } = page.ziggy;

    let timeout = null;
    const resourceName = {
        singular: 'Order',
        plural: 'Orders',
    };

    const [tableRows, setTableRows] = useState([]);
    const [tableRows2, setTableRows2] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [orderNo, setOrderNo] = useState("");

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];
    const [pageCount, setPageCount] = useState("10");
    const handlePageCount = useCallback((value) => { setPageCount(value); setReload(!reload); }, [tableRows]);

    const [myUrl, setMyUrl] = useState("");
    const [selected, setSelected] = useState(0);
    const [itemStrings, setItemStrings] = useState([
        'All'
    ]);

    const handleChange = useCallback(() => {
        setFlag(false);
        setActive(!active);
    }, [active]);

    const [orderId, setOrderId] = useState("");
    const [userId, setUserId] = useState("");
    const [queryValue, setQueryValue] = useState("");
    const sortOptions = [
        { label: 'Id', value: 'id asc', directionLabel: 'Ascending' },
        { label: 'Id', value: 'id desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id desc']);
    const [shops, setShops] = useState([]);

    const tabs = ['All'].map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions: []
    }));

    const { mode, setMode } = useSetIndexFiltersMode();

    const [pagination, setPagination] = useState({
        path: route("oak_hall_order.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);

    const [reload, setReload] = useState(false);
    const [searchShops, serSearchShops] = useState([]);

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);

   

    const [products, setProducts] = useState([
        [<div><p style={{ color: '#45BD4A' }}>GM6FAbUFSUH0NAq</p></div>, '26-05-2024', '240', '$450.00'],
        [<div><p style={{ color: '#45BD4A' }}>GM6FAbUFSUH0NAq</p></div>, '05-05-2024', '377', '$235.00'],
        [<div><p style={{ color: '#45BD4A' }}>GM6FAbUFSUH0NAq</p></div>, '24-05-2024', '124', '$120.00'],
        [<div><p style={{ color: '#45BD4A' }}>GM6FAbUFSUH0NAq</p></div>, '03-05-2024', '223', '$680.00'],
        [<div><p style={{ color: '#45BD4A' }}>GM6FAbUFSUH0NAq</p></div>, '25-05-2024', '198', '$400.00'],

    ]);
    

    const rowMarkup2 = tableRows2.map((value, index) => {

        return [
            value.line_number,
            value.product_id,
            value.quantity,
            value.book_store_cost,
        ];
    });

    const rowMarkup = tableRows.map((value, index) => (
        <IndexTable.Row
            id={value.id}
            key={value.id}
            selected={selectedResources.includes(value.id)}
            position={index}
        >
            <IndexTable.Cell> 
                <div className='custom_style'>
                    <Link dataPrimaryLink>
                        {value.external_order_id}
                    </Link>
                </div>
            </IndexTable.Cell>
            <IndexTable.Cell>
                {value.customer_name}
            </IndexTable.Cell>
            <IndexTable.Cell>
                {value.order_status == 'not_sent_to_shipstation' ? <Badge tone="critical">Not sent to shipstation</Badge> : <Badge tone="success">Sent to shipstation</Badge>}
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Button icon={ViewIcon} onClick={() => toggleModal(value.id)} plain>
                    View
                </Button>
            </IndexTable.Cell>
        </IndexTable.Row >
    ));
   

   


    const orderData = (id) => {
        fetch(route('oak_hall_order.detail',{id:id})).then(response => response.json()).then(data => {
            console.log(data.data.order.order_line_items);
            setTableRows2(data.data.order.order_line_items);
            setCustomerName(data.data.order?.customer_name);
            setCustomerEmail(data.data.order?.customer_email);
            setOrderNo(data.data.order?.external_order_id);
        });
    }

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

    const filters = [
        {
            key: "filterbyclient",
            label: "Filter by Client",
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
        }
    ];

    const appliedFilters = [];

    if (!isEmpty(searchShops)) {
        const key = "filterbyclient";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchShops),
            onRemove: handleSearchShopsRemove,
        });
    }

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
    const handleSearchShopsRemove = useCallback(() => { serSearchShops([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchShopsRemove();
    }, [
        handleQueryValueRemove,
        handleSearchShopsRemove
    ]);

    const onHandleCancel = () => { };


   
    
    useEffect(() => {
        console.log(route("oak_hall_order.get"));
        let url = new URL(route("oak_hall_order.get"));
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

        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                console.log("result");
                console.log(result.data.orders.next_cursor);
                setTableRows(result.data.orders.data);
                    setPagination({
                        path: result.data.path,
                        next_cursor: result.data.orders.next_cursor,
                        next_page_url: result.data.orders.next_page_url,
                        prev_cursor: result.data.orders.prev_cursor,
                        prev_page_url: result.data.orders.prev_page_url,
                    });
               
                setLoading(false);
            })

    }, [reload])

    useEffect(()=>{
        if (selectedOrderId && !active) {
            console.log("active :" + active);
            console.log("selectedOrderId" + selectedOrderId);
         orderData(selectedOrderId);
        } 
    },[active])

    return (
        <div style={{ background: `url('${window.appURL}/images/background5.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>

            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('index_order_splitter', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Oak Hall</div>
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
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                        <Card>
                            <IndexFilters
                                sortOptions={sortOptions}
                                sortSelected={sortSelected}
                                queryValue={queryValue}
                                queryPlaceholder="search by order id, customer name, customer email"
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
                                filters={[]}
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
                                    { title: 'Order Id' },
                                    { title: 'Customer name' },
                                    { title: 'Customer Email' },
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
                    open={!active}
                    onClose={toggleModal}
                    title="Order Detail"
                    primaryAction={{
                        content: 'Close',
                        onAction: toggleModal,
                    }}
                    size='large'
                >
                    <Modal.Section>
                        <div style={{ padding: '20px' }}>
                            <BlockStack gap={'300'}>

                                <Card sectioned style={{ marginBottom: '20px' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <Text variant="headingMd" as="h5">Order Detail</Text>
                                            <Badge tone="success">Fulfilled</Badge>
                                        </div>
                                        <p style={{ color: '#71717A' }}>Review your order details, including items, shipping, and payment information.</p>
                                    </div>
                                </Card>


                                <Card sectioned style={{ marginTop: '20px' }}>

                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center',marginBottom:"10px" }}>

                                        <div style={{background:"#EBEBEB",padding:"5px",borderRadius:"50%"}}><Icon source={PersonIcon} tone="base"/></div>
                                        <Text variant="headingLg" as="h5">Order Detail</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <p><strong>Name:</strong> {customerName}</p>
                                            <p><strong>Email:</strong> {customerEmail}</p>
                                            {/* <p><strong>Phone:</strong> 03153397711</p> */}
                                        </div>
                                        <div>
                                            <p><strong>Order ID:</strong>{orderNo} </p>
                                           
                                        </div>
                                    </div>
                                </Card>

                                {/* Products Table */}
                                <Card sectioned>
                                    <Text variant="headingLg" as="h5">Products</Text>
                                    <DataTable

                                        columnContentTypes={['text', 'text', 'numeric', 'text']}
                                        headings={['Line Number', 'Product Id', 'Quantity', 'Book store cost']}
                                        rows={rowMarkup2}
                                    />
                                </Card>


                            </BlockStack>
                        </div>
                    </Modal.Section>
                </Modal>
            </Page>
        </div>
    );

    function isEmpty(value) {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === '' || value == null;
        }
    }

}

OakHall.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default OakHall;

