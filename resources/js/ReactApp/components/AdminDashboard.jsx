import {
    ChoiceList,
    TextField,
    Card,
    Filters,
    DataTable,
    Page,
    Spinner,
    Toast,
    Frame,
    TextContainer,
    SkeletonBodyText,
    SkeletonPage,
    Layout,
    SkeletonDisplayText,
    Pagination,
} from "@shopify/polaris";
import { Grid, Text, Banner, Button, Icon, Select, Checkbox, Tabs, Tooltip, Badge } from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useAsyncError, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { CollectionsMajor, DuplicateMinor, EditMajor, InfoMinor, LinkMinor, MinusMinor, ProductsMajor, ProductsMinor, SearchMajor, StoreMinor } from '@shopify/polaris-icons';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faEye,
    faTrash,
    faPencil
} from "@fortawesome/free-solid-svg-icons";
import Toggle from "./Toggle";


function AdminDashboard(props) {

    const navigate = useNavigate();
    const [pagination, setPagination] = useState({
        path: 'https://app.vidial.co/getDataofallPlans',
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });
    const [currentCursor, setCurrentCursor] = useState(null);
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState([]);
    const [queryValue, setQueryValue] = useState("");
    const [tableRowsStatic, setTableRowsStatic] = useState([]);
    const [tableRows, setTableRows] = useState([]);
    const [responseState, setResponseState] = useState(null);
    const [searchQuery, setSearchQuery] = useState(null);
    
    const logState = state => {
        console.log("Toggled:", state)
    }
    const [users, setUsers] = useState([]);

    // const [watermark, setWatermark] = useState([]);

    const [selectedTab, setSelected] = useState(0);
    const handleTabChange = useCallback((selectedTabIndex) => setSelected(selectedTabIndex), [],);

    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const toastMarkup = active ? (
        <Toast content="Link Copied to Clipboard" onDismiss={toggleActive} />
    ) : null;

    const tabs = [
        {
            id: 'all-customers-1',
            content: 'All',
        }
        // {
        //     id: 'accepts-marketing-1',
        //     content: 'Active',
        // },
        // {
        //     id: 'repeat-customers-1',
        //     content: 'Inactive',
        // }
    ];

    const handleAvailabilityChange = useCallback(
        (value) => setAvailability(value),
        []
    );
    const handleFiltersQueryChange = useCallback(
        (value) => setQueryValue(value),
        []
    );
    const handleAvailabilityRemove = useCallback(
        () => setAvailability([]),
        []
    );
    const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
    const handleFiltersClearAll = useCallback(() => {
        handleAvailabilityRemove();
        handleQueryValueRemove();
    }, [
        handleAvailabilityRemove,
        handleQueryValueRemove,
    ]);

    const filters = [
    ];

    const appliedFilters = [];
    if (!isEmpty(availability)) {
        const key = "filterbytype";
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, availability),
            onRemove: handleAvailabilityRemove,
        });
    }


    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        // { label: '50', value: '50' },
        // { label: '100', value: '100' },
    ];
    const [pageCount, setPageCount] = useState("10");
    const handlePageCount = useCallback((value) => { setPageCount(value); setReload(!reload); setCurrentCursor(null) }, [tableRows]);
    const handleSearch = (e)=>{
        console.log(e.target.value);
        console.log(e.target.value);
        setSearchQuery(e.target.value);
        // setReload(!reload);
    }

    useEffect(() => {
        let url = new URL(pagination.path);
        // if (searchQuery) {
        //     url.searchParams.set('s', searchQuery);
        // }
        if (pageCount) {
            url.searchParams.set('page_count', pageCount);
        }

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }
        console.log(url);
        setResponseState('pending');
        fetch(url, {
            method: "GET",
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Something went wrong");
            }
            return response.json();
        }).then((data) => {
            setUsers(data.user_details);
            setResponseState(null);


            setPagination({
                path: data.pagination.path,
                next_cursor: data.pagination.next_cursor,
                next_page_url: data.pagination.next_page_url,
                prev_cursor: data.pagination.prev_cursor,
                prev_page_url: data.pagination.prev_page_url,
            });
            //console.log(data);

        }).catch((error) => {
            setResponseState(null);
            console.log(error);
        });

        let realRows = tableRowsStatic;

        if (selectedTab == 0) {
            setTableRows(tableRowsStatic);
        }
        else if (selectedTab == 1) {
            realRows = realRows.filter((value) => value[5].props.toggled == 1);
            setTableRows(realRows);
        }
        else if (selectedTab == 2) {
            realRows = realRows.filter((value) => value[5].props.toggled == 0);
            setTableRows(realRows);
        }

        realRows = realRows.filter((value) => value[1].toLowerCase().includes(queryValue.toLowerCase()))
        setTableRows(realRows);

      

        if (availability.length == 1)
            realRows = realRows.filter((value) => value[2].props.value == availability[0])

        if (availability.length == 2)
            realRows = realRows.filter((value) => value[2].props.value == availability[0] || value[2].props.value == availability[1])

        if (availability.length == 3)
            realRows = realRows.filter((value) => value[2].props.value == availability[0] || value[2].props.value == availability[1] || value[2].props.value == availability[2])

        setTableRows(realRows);

        

    }, [reload]);

    function handlewatermark(id, status) {
        const requestData = {
            user_id: id,
            status: status,
        };

        fetch("/update_status_for_water_mark", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // tell the server to expect JSON data
            },
            body: JSON.stringify(requestData), // convert the data to a JSON string
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.user_details == 1) {

                    const updatedUsers = users.map((user) => {
                        if (user.id === id) {
                            console.log(user);
                            return { ...user, Watermark: !status };
                        }
                        return user;
                    });
                    setUsers(updatedUsers);
                    location.reload();
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const logoutHandler = () => {

        fetch("/logout", {
            method: "POST",
        })
            .then((response) => response.json())
            .then((data) => {
                navigate("/login");
            })
    }

    return (
        <Page fullWidth>
            {
                responseState == 'pending' ? <div className="" >
                    <SkeletonPage primaryAction>
                        <div className="loadingStateCustom">
                                    <SkeletonBodyText />
                               <Card>
                                    <TextContainer>
                                        <SkeletonDisplayText size="small" />
                                        <SkeletonBodyText />
                                    </TextContainer>
                               </Card>
                                   <Card>
                                    <TextContainer>
                                        <SkeletonDisplayText size="small" />
                                        <SkeletonBodyText />
                                    </TextContainer>
                                    </Card>
                              
                            
                                    <Card>
                                        <TextContainer>
                                            <SkeletonDisplayText size="small" />
                                            <SkeletonBodyText lines={2} />
                                        </TextContainer>
                                    </Card>
                                    <Card>
                                        <SkeletonBodyText lines={1} />
                                    </Card>

                                    <Card>
                                        <TextContainer>
                                            <SkeletonDisplayText size="small" />
                                            <SkeletonBodyText lines={2} />
                                        </TextContainer>
                                    </Card>
                                    <Card>
                                        <SkeletonBodyText lines={2} />
                                    </Card>
                        </div>
                    </SkeletonPage>
                </div>  : 
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                    <div style={{ height: "0px" }}>
                        
                        <Frame>
                            {toastMarkup}
                        </Frame>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h1 className="Polaris-Header-Title" style={{ paddingBottom: "10px", paddingTop: "10px" }}>Stores List</h1>
                        <div style={{ marginBottom: "10px" }}><Button outline onClick={logoutHandler}>Log Out</Button></div>
                    </div>

                            <div style={{ display: "flex",justifyContent:"flex-end" }}>
                    <div>
                                <Select
                                    labelInline
                                    label="Rows:"
                                    options={pageOptions}
                                    value={pageCount}
                                    onChange={handlePageCount}
                                />
                    </div>
                    <div>
                                    <TextField
                                        label=""
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e)}
                                        autoComplete="off"
                                        placeholder="Search by Store Name"
                                    />
                    </div>
                    </div>
                    <div style={{ height: "568px" }}>
                        <Card>
                            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                            </Tabs>
                            {loading ? <div style={{ boxShadow: "0 1px 4px -2px grey", display: "flex", backgroundColor: "#ebf9fc", padding: "7px", paddingBottom: "3px", margin: "0px 21px", marginBottom: "3px", borderRadius: "3px", marginTop: "-20px" }}>
                                <Spinner accessibilityLabel="Small spinner example" size="small" />
                                <div style={{ fontSize: "14.5px", marginLeft: "10px" }}> Loading campaigns... </div>
                            </div> : null}
                            <DataTable
                                columnContentTypes={[
                                    'text',
                                    'text',
                                    'text',
                                    'text',
                                    'text',
                                    'text',
                                    'text',
                                    'text',
                                    'text',
                                    'text',
                                ]}
                                headings={[
                                    'Id',
                                    'Store Name',
                                    'Plan',
                                    'Approved Videos',
                                    'Email Sent',
                                    'Total Customers',
                                    'Store Email',
                                    'Install Date',
                                    'Install Status',
                                    'Remove Watermark',

                                    
                                ]}
                                // rows={tableRows && tableRows}

                                rows={users.map((user) =>
                                    [
                                        user.id,
                                        user.store_name,
                                        <Badge>{user.plan_name}</Badge>,
                                        user.approved_video,
                                        user.email_send,
                                        <div>{user.customers_count}</div>,
                                        <div>{user.store_email}</div>,
                                        <div>{user.install_date}</div>,
                                        <div>{user.install_status ? <Badge status="success">Installed</Badge> : <Badge status="critical">Un Installed</Badge> }</div>,
                                        <Toggle toggled={user.Watermark} onClick={() => handlewatermark(user.id, !user.Watermark)} />,
                                        
                                    ]
                                )}
                            // rows={[['1','Store1',,1,2, ]]}
                            />
                                    <hr></hr>
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
                        </Card>
                    </div>
                </Grid.Cell>
            </Grid>
            }
        </Page>
    );
    function disambiguateLabel(key, value) {
        switch (key) {
            case "filterbytype":
                return `Filtered by ${value.map((val) => val).join(", ")}`;
            default:
                return value;
        }
    }

    function isEmpty(value) {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === "" || value == null;
        }
    }
}

export default AdminDashboard;
