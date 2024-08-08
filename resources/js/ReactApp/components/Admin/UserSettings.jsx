import {
    Badge,
    Button,
    Card,
    DataTable,
    Frame,
    Grid,
    Page,
    Select,
    SkeletonBodyText,
    SkeletonDisplayText,
    SkeletonPage,
    Spinner,
    Tabs,
    TextContainer,
    TextField,
    Toast
} from "@shopify/polaris";
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Link } from "react-router-dom";
import Toggle from "../Toggle";


function UserSettings(props) {

    const navigate = useNavigate();
    const { id } = useParams();

    // useEffect(() => {
    //     console.log(sorting);
    //     console.log("sorting");
    //     let url = new URL(pagination.path);
    //     if (searchQuery) {
    //         url.searchParams.set('s', searchQuery);
    //     }
    //     if (pageCount) {
    //         url.searchParams.set('page_count', pageCount);
    //     }
    //     if (sorting) {
    //         url.searchParams.set('sorting', sorting);
    //     }

    //     if (currentCursor) {
    //         url.searchParams.set('cursor', currentCursor);
    //     }

    //     setResponseState('pending');
    //     fetch(url, {
    //         method: "GET",
    //     }).then((response) => {
    //         if (!response.ok) {
    //             throw new Error("Something went wrong");
    //         }
    //         return response.json();
    //     }).then((data) => {
          

    //     }).catch((error) => {
    //         setResponseState(null);
    //         console.log(error);
    //     });

    //     let realRows = tableRowsStatic;

    //     if (selectedTab == 0) {
    //         setTableRows(tableRowsStatic);
    //     }
    //     else if (selectedTab == 1) {
    //         realRows = realRows.filter((value) => value[5].props.toggled == 1);
    //         setTableRows(realRows);
    //     }
    //     else if (selectedTab == 2) {
    //         realRows = realRows.filter((value) => value[5].props.toggled == 0);
    //         setTableRows(realRows);
    //     }

    //     realRows = realRows.filter((value) => value[1].toLowerCase().includes(queryValue.toLowerCase()))
    //     setTableRows(realRows);

      

    //     if (availability.length == 1)
    //         realRows = realRows.filter((value) => value[2].props.value == availability[0])

    //     if (availability.length == 2)
    //         realRows = realRows.filter((value) => value[2].props.value == availability[0] || value[2].props.value == availability[1])

    //     if (availability.length == 3)
    //         realRows = realRows.filter((value) => value[2].props.value == availability[0] || value[2].props.value == availability[1] || value[2].props.value == availability[2])

    //     setTableRows(realRows);

        

    // }, [reload]);

   

   

    return (
        <Page fullWidth>
            {
                <div>
                    User Settings
                </div>
            }
        </Page>
    );
    
}

export default UserSettings;
