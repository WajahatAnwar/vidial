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
import { Grid, Text, Banner, Button, Icon, Select, Checkbox, Tabs, Tooltip, Badge} from '@shopify/polaris';
import React, { useEffect } from 'react';
import { useAsyncError} from 'react-router-dom';
import { useState, useCallback } from 'react';
import { CollectionsMajor, DuplicateMinor, EditMajor,InfoMinor, LinkMinor, MinusMinor, ProductsMajor, ProductsMinor, SearchMajor, StoreMinor } from '@shopify/polaris-icons';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faEye,
    faTrash,
    faPencil
} from "@fortawesome/free-solid-svg-icons";
import Toggle from "./Toggle";


function StoresList(props) {

    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        fetch(`/get_all_campaigns`)
        .then((response) => response.json())
        .then((result) => {
            console.log(result);
            if(result.success == true)
            {
                const my_rows = [];

                result.data.forEach(element => {

                    const starting_date = new Date(element.start_date);
                    const end_date = new Date(element.end_date);
                    const monthArr = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sep","Oct","Nov","Dec"];

                    const myStartDate = starting_date.getDate()+ " " +monthArr[starting_date.getMonth()]+ " " +starting_date.getFullYear();
                    const myendDate = end_date.getDate()+ " " +monthArr[end_date.getMonth()]+ " " +end_date.getFullYear();


                    my_rows.push([

                    element.id,

                    element.name,

                    <Badge value="product" status="success">element.Clcik</Badge>,
                    <Toggle toggled={element.status} onClick={(e) => changeStatusHandler(e,element)} />,

                    <div style={{display:"flex"}}>
                        <div style={{marginRight:"10px"}} onClick={() => navigate(`/edit-campaign/${element.id}` )}> <Button size="slim"> Edit </Button> </div>
                        <Button size="slim" primary onClick={() => makeDuplicateHandler(element)}> Duplicate </Button>
                    </div>
                    ]);
                });

                setTableRowsStatic(my_rows);
                setTableRows(my_rows);
            }

        })
        .catch((err) => {
            console.log(err);
        });

    },[reload])

    const [availability, setAvailability] = useState([]);
    const [queryValue, setQueryValue] = useState("");

    const [tableRowsStatic,setTableRowsStatic] = useState([]);

    const [tableRows,setTableRows] = useState([]);

    const logState = state => {
        console.log("Toggled:", state)
    }

    const [selectedTab, setSelected] = useState(0);
    const handleTabChange = useCallback((selectedTabIndex) => setSelected(selectedTabIndex) ,[],);

    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const toastMarkup = active ? (
        <Toast content="Link Copied to Clipboard" onDismiss={toggleActive} />
    ) : null;

    const tabs = [
        {
        id: 'all-customers-1',
        content: 'All',
        },
        {
        id: 'accepts-marketing-1',
        content: 'Active',
        },
        {
        id: 'repeat-customers-1',
        content: 'Inactive',
        }
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
        {
            key: "filterbytype",
            label: "Filter by Type",
            filter: (
                <ChoiceList
                    title="Campaign Type"
                    titleHidden
                    choices={[
                        {label: 'Product Campaigns', value: 'product'},
                        {label: 'Collection Campaigns', value: 'collection'},
                        {label: 'Store Wide Campaigns', value: 'all_store'},
                    ]}
                    selected={availability || []}
                    onChange={handleAvailabilityChange}
                    allowMultiple
                />
            ),
            // shortcut: false,
        },
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

        // console.log(availability);
        // console.log(queryValue);
        // console.log(selectedTab);
        // console.log(tableRowsStatic);

        let realRows =  tableRowsStatic;

        if(selectedTab == 0) {
            setTableRows(tableRowsStatic);
        }
        else if(selectedTab == 1) {
            realRows = realRows.filter((value) => value[5].props.toggled == 1);
            setTableRows(realRows);
        }
        else if(selectedTab == 2) {
            realRows = realRows.filter((value) => value[5].props.toggled == 0);
            setTableRows(realRows);
        }

        realRows = realRows.filter((value) => value[1].toLowerCase().includes(queryValue.toLowerCase()))
        setTableRows(realRows);

        console.log(availability);
        console.log(realRows);

        if(availability.length == 1)
            realRows = realRows.filter((value) => value[2].props.value == availability[0])

        if(availability.length == 2)
            realRows = realRows.filter((value) => value[2].props.value == availability[0] || value[2].props.value == availability[1])

        if(availability.length == 3)
            realRows = realRows.filter((value) => value[2].props.value == availability[0] || value[2].props.value == availability[1] || value[2].props.value == availability[2])

        setTableRows(realRows);

    },[queryValue,availability,selectedTab]);

    const changeStatusHandler = (e,element) => {

        // console.log(e,element)

        setLoading(true);

        const formData = new FormData();
        formData.append("new_status", e.target.checked);
        formData.append("campaign_id", element.id);

        fetch( "/change_campaign_status", {
            method: "POST",
            // headers: { "content-Type": "application/json" },
            body: formData,
            }
        )
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success === true) {
                setReload(!reload);
                setLoading(false);
            } else if(data.success === false) {

            }
        });


    }

    const makeDuplicateHandler = (element) => {

        setLoading(true);

        const formData = new FormData();
        formData.append("campaign_id", element.id);

        fetch( "/make_campaign_duplicate", {
            method: "POST",
            // headers: { "content-Type": "application/json" },
            body: formData,
            }
        )
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success === true) {
                setReload(!reload);
                setLoading(false);
            } else if(data.success === false) {

            }
        });

    }

    return (
        <Page >
            <Grid>
                <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 12, lg: 12, xl: 12}}>
                <div style={{height:"0px"}}>
                <Frame>
                    {toastMarkup}
                </Frame>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <h1 className="Polaris-Header-Title" style={{paddingBottom:"20px",paddingTop:"10px"}}>Stores List</h1>

            </div>
                    <div style={{ height: "568px" }}>
                        <Card>
                            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                            </Tabs>
                            <Card.Section>
                                <Filters
                                    queryValue={queryValue}
                                    filters={filters}
                                    appliedFilters={appliedFilters}
                                    onQueryChange={handleFiltersQueryChange}
                                    onQueryClear={handleQueryValueRemove}
                                    onClearAll={handleFiltersClearAll}
                                />
                            </Card.Section>
                            {loading ? <div style={{boxShadow: "0 1px 4px -2px grey", display: "flex", backgroundColor: "#ebf9fc", padding: "7px", paddingBottom: "3px", margin: "0px 21px", marginBottom: "3px", borderRadius: "3px", marginTop: "-20px"}}>
                                <Spinner accessibilityLabel="Small spinner example" size="small" />
                                <div style={{fontSize:"14.5px", marginLeft:"10px"}}> Loading campaigns... </div>
                            </div> : null }
                            <DataTable
                                columnContentTypes={[
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
                                    'Watermark',

                                ]}
                                // rows={tableRows && tableRows}
                                rows={[['1','Store1',<Badge>Free</Badge>,1,2,<Toggle /> ],['2','Store2',<Badge status="info">Standard</Badge>,5,6,<Toggle /> ],['3','Store3',<Badge status="attention">Premium</Badge>,5,5,<Toggle /> ],['4','Store4',<Badge status="warning">Advanced</Badge>,5,5,<Toggle /> ]]}
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
                return `Filtered by ${value.map((val) =>  val).join(", ")}`;
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

export default StoresList;
