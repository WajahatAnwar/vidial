import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import { setGatewayClient } from '@/ReactJs/reducers/Punchout/DeveloperSlice';
import {
    Button,
    Card,
    ChoiceList,
    Grid,
    IndexFilters,
    IndexTable,
    Link,
    Pagination,
    Select as ShopifySelect,
    Text as TextPolaris,
    Modal,
    Select,
    useIndexResourceState, useSetIndexFiltersMode,
    TextField
} from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { Document, Page, pdf, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useDispatch, useSelector } from 'react-redux';

function GatewayClientsTable({ reloadTable, handleEditChange }) {

    const dispatch = useDispatch();
    const gatewayClient = useSelector(state => state.punchoutDeveloper.gatewayClient);

    const [selected, setSelected] = useState(0);

    const [activegatewayclients, setactiveGatewayClients] = useState(false);

    const [activecredentialspickup, setaCredentialsPickup] = useState(false);


    const handleActiveGatewayClients = useCallback(() => setactiveGatewayClients(!activegatewayclients), [activegatewayclients]);
    // const handleActiveCredentialsPickup = useCallback(() => setaCredentialsPickup(!activecredentialspickup), [activecredentialspickup]);

    const handleActiveCredentialsPickup = useCallback(() => {
        setaCredentialsPickup(prevState => !prevState);  // Toggle the state for activeCredentialsPickup
        setactiveGatewayClients(false);      // Toggle the state for activeGatewayClients
    }, [activecredentialspickup, activegatewayclients]);  // Ensure the function only changes when the setters change


    const [credentialsvalue, setCredentialsValue] = useState('');

    const handleCredentialsChange = useCallback(
        (credentialsvalue) => setCredentialsValue(credentialsvalue),
        [],
    );

    function convertISOToYMD(isoDateString) {
        var date = new Date(Date.parse(isoDateString));

        var year = date.getUTCFullYear();
        var month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
        var day = String(date.getUTCDate()).padStart(2, '0');

        return year + '-' + month + '-' + day;
    }

    let timeout = null;

    const resourceName = {
        singular: 'Gateway Client',
        plural: 'Gateway Clients',
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


    const styles = StyleSheet.create({
        page: {
            padding: 20,
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
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            fontSize: 16,
            marginBottom: 15,
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
            width: '100%',
        },

    });




    const [pagination, setPagination] = useState({
        path: route("punchout.clients_list.list"),
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

    const [networks, setNetworks] = useState([]);
    const [searchNetworks, serSearchShops] = useState([]);

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

        if (searchNetworks.length != 0) {
            url.searchParams.set('q2', JSON.stringify(searchNetworks));
        } else {
            url.searchParams.delete('q2');
        }

        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    // console.log(result.data);
                    setTableRows(result.data.data);
                    // setTableRows([
                    //     {
                    //         property_one: 'value',
                    //         property_two: 'value',
                    //     }, {
                    //         property_one: 'value',
                    //         property_two: 'value',
                    //     }
                    // ])

                    setNetworks(result.data2.map((item, index) => {
                        return {
                            value: item.id,
                            label: item.name
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
                // console.log(err);
                setLoading(false);
            });

    }, [reload, reloadTable])

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

    const handleSearchNetworksChange = useCallback(
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

    const handleQueryValueRemove = useCallback(() => { setQueryValue(""); setCurrentCursor(null); setReload(!reload); }, [tableRows]);
    const handleSearchNetworksRemove = useCallback(() => { serSearchShops([]); setCurrentCursor(null); setReload(!reload); }, [tableRows]);

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
        handleSearchNetworksRemove();
    }, [
        handleQueryValueRemove,
        handleSearchNetworksRemove
    ]);

    const filters = [
        {
            key: "filterbyNetwork",
            label: "Filter by Network",
            filter: (
                <ChoiceList
                    title="Network"
                    titleHidden
                    choices={networks}
                    selected={searchNetworks || []}
                    onChange={handleSearchNetworksChange}
                    allowMultiple
                />
            ),
        }
    ];

    const appliedFilters = [];

    if (!isEmpty(searchNetworks)) {
        const key = "filterbyNetwork";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, searchNetworks),
            onRemove: handleSearchNetworksRemove,
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
                <div className='custom_style'>
                    <Link dataPrimaryLink>
                        {value.id}
                    </Link>
                </div>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <span className='cstm-green' onClick={() => {
                    dispatch(setGatewayClient({
                        uuid: value.uuid,
                        name: value.name,
                        network: value.pomw_client_network.name,
                        toDomain: value.to_domain,
                        fromDomain: value.from_domain,
                        fromIdentity: value.from_identity,
                        toIdentity: value.to_identity,
                        selectedNetwork: `${value.network_id}`,
                        invoice_receiver_url: value.invoice_receiver_url,
                        shared_secret: value.shared_secret,
                        domain: value.domain,
                    }));
                    handleActiveGatewayClients();
                }}>{value.name}</span>

            </IndexTable.Cell>
            <IndexTable.Cell>
                {value.domain}
            </IndexTable.Cell>
            <IndexTable.Cell>
                Shopify
            </IndexTable.Cell>
            <IndexTable.Cell>
                {value.pomw_client_network.name}
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Button disabled size='slim' onClick={() => {
                    dispatch(setGatewayClient({
                        uuid: value.uuid,
                        name: value.name,
                        network: value.pomw_client_network.name,
                        toDomain: value.to_domain,
                        fromDomain: value.from_domain,
                        fromIdentity: value.from_identity,
                        toIdentity: value.to_identity,
                        selectedNetwork: `${value.network_id}`,
                        invoice_receiver_url: value.invoice_receiver_url,
                        shared_secret: value.shared_secret
                    }));
                    handleEditChange();
                }}>Edit</Button>
                {/* <span style={{ marginLeft: "10px" }}></span> */}
                {/* <Button variant="primary" tone="critical">Del</Button> */}
            </IndexTable.Cell>
        </IndexTable.Row >
    ));

    return (
        <div>
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
                            queryPlaceholder="Name, Domain, Network, etc..."
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
                                { title: 'Name' },
                                { title: 'Domain' },
                                { title: 'Type' },
                                { title: 'Network' },
                                { title: 'Actions' },
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
                open={activegatewayclients}
                onClose={handleActiveGatewayClients}
                size="large"
            >
                <div className="custom-modal">
                    <Modal.Section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: "40px", marginTop: "30px" }}>
                            <p style={{ fontSize: "22px", fontWeight: "700" }}>
                                Client Information
                            </p>

                            {/* <div className="multi-color-btn develop-multi-color-btn modal-pop-up-multi-btn">
                                <Button>Convert to catalog</Button>
                                <Button>Edit</Button>
                            </div> */}
                        </div>

                        <Document>
                            <Page style={styles.page}>
                                {/* General Section */}
                                <View style={styles.card}>

                                    <View style={styles.list}>

                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Name:</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{gatewayClient.name}</p>
                                        </View>

                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Domain:</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{gatewayClient.domain}</p>
                                        </View>

                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", Width: "50%" }}>Integration Type:</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{gatewayClient.network}</p>
                                        </View>

                                        <hr />

                                        <p style={{ fontSize: "22px", fontWeight: "700", marginTop: "15px", marginBottom: "15px" }}>
                                            Credentials for Shopify Client
                                        </p>
                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Punchout Start Url:</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{route('punchout.gateway.punchout', gatewayClient.uuid)}</p>
                                        </View>
                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Order transfer Url:</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{route('punchout.gateway.order.request', gatewayClient.uuid)}</p>
                                        </View>
                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Profile Url :</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{route('punchout.gateway.profile', gatewayClient.uuid)}</p>

                                        </View>

                                        {/* Arsalan  */}
                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Credentials Pickup :</p>
                                            {/* <p style={{ fontSize: "14px", fontWeight: "400", width: "50%", color: "#45BD4A", cursor: "pointer" }} onClick={handleActiveCredentialsPickup}>https://procurement.clubhub.host/gateway/punchout/72f8db00-2050-4d59-a92d-</p> */}
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }} >{route('punchout.gateway.credentials', gatewayClient.uuid)}</p>
                                        </View>
                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Invoice Url :</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%",wordWrap:'break-word' }}>{gatewayClient.invoice_receiver_url}</p>
                                        </View>
                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>Shared Secret :</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%" }}>{gatewayClient.shared_secret}</p>
                                        </View>
                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>To Identity :</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%",wordWrap:'break-word'}}>{gatewayClient.toIdentity}</p>
                                        </View>
                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>To Domain :</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%",wordWrap:'break-word' }}>{gatewayClient.toDomain}</p>
                                        </View>

                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>From Identity :</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%",wordWrap:'break-word' }}>{gatewayClient.fromIdentity}</p>
                                        </View>
                                        <View style={styles.item}>
                                            <p style={{ fontSize: "16px", fontWeight: "700", width: "50%" }}>From Domain :</p>
                                            <p style={{ fontSize: "14px", fontWeight: "400", width: "50%",wordWrap:'break-word' }}>{gatewayClient.fromDomain}</p>
                                        </View>

                                    </View>
                                </View>

                                {/* Session Section */}

                            </Page>
                        </Document>


                    </Modal.Section>
                </div>
            </Modal>
            <Modal
                open={activecredentialspickup}
                onClose={handleActiveCredentialsPickup}
                size="medium"
            >
                <div className="custom-modal">
                    <Modal.Section>
                        <div className='client-Credentials-main'>
                            <p>eku.ccbrands.com Shopify Client Credentials</p>

                            <div className='client-Credentials-main-textfield'>
                                <span>Password</span>
                                <TextField value={credentialsvalue} onChange={handleCredentialsChange} autoComplete="off" />
                            </div>


                            <div className="multi-color-btn client-Credentials-main-button modal-pop-up-multi-btn">
                                <Button>Authenticate</Button>

                            </div>


                        </div>



                    </Modal.Section>
                </div>
            </Modal>
        </div >
    );

    function disambiguateLabel(key, value) {

        switch (key) {
            case "filterbyNetwork":
                return `Filtered by Network: ${value.map((val) => networks.find(value => value.value == val).label).join(", ")}`;
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

GatewayClientsTable.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default GatewayClientsTable;
