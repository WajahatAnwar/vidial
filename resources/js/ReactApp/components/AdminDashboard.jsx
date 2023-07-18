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

    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState([]);
    const [queryValue, setQueryValue] = useState("");
    const [tableRowsStatic, setTableRowsStatic] = useState([]);
    const [tableRows, setTableRows] = useState([]);
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

    useEffect(() => {
        fetch("/getDataofallPlans", {
            method: "GET",
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Something went wrong");
            }
            return response.json();
        }).then((data) => {
            setUsers(data.user_details);
            console.log(data);
            //    console.log("data");
            //    console.log(data);
        }).catch((error) => {
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

        console.log(availability);
        console.log(realRows);

        if (availability.length == 1)
            realRows = realRows.filter((value) => value[2].props.value == availability[0])

        if (availability.length == 2)
            realRows = realRows.filter((value) => value[2].props.value == availability[0] || value[2].props.value == availability[1])

        if (availability.length == 3)
            realRows = realRows.filter((value) => value[2].props.value == availability[0] || value[2].props.value == availability[1] || value[2].props.value == availability[2])

        setTableRows(realRows);

    }, []);

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
        <Page>
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
                                    'Remove Watermark',
                                    'Install Date',
                                    'Install Status',
                                    'Total Customers',
                                    'Store Email',
                                    

                                ]}
                                // rows={tableRows && tableRows}

                                rows={users.map((user) =>

                                    [
                                        user.id,
                                        user.store_name,
                                        <Badge>{user.plan_name}</Badge>,
                                        user.approved_video,
                                        user.email_send,
                                        <Toggle toggled={user.Watermark} onClick={() => handlewatermark(user.id, !user.Watermark)} />,
                                        <div>hello1</div>,
                                        <div>hello2</div>,
                                        <div>hello3</div>,
                                        <div>hello4</div>
                                    ]
                                )}
                            // rows={[['1','Store1',,1,2, ]]}
                            />
                        </Card>
                    </div>
                </Grid.Cell>
            </Grid>

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
