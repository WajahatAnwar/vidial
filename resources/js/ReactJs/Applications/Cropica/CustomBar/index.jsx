import "@/ReactJs/Applications/Cropica/Assets/css/style.css";
import FetchProductIcon from '@/ReactJs/Applications/Cropica/Assets/images/FetchProductTabIcon.svg';
import Logo from '@/ReactJs/Applications/Cropica/Assets/images/logo.svg';
import ManageHistory from '@/ReactJs/Applications/Cropica/Assets/images/ManageHistory.svg';
import { router, usePage } from "@inertiajs/react";
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { Tabs } from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";

function CustomBar() {

    const page = usePage().props;
    useEffect(() => {

        if (location.pathname == "/punchout/dashboard") {
            setSelected(0);
        }

    }, [location.pathname]);
    const [selected, setSelected] = useState(0);
    const { query } = page.ziggy;
    const handleTabChange = useCallback((selectedTabIndex) => {

        setSelected(selectedTabIndex);

        if (selectedTabIndex == 0) {
            router.get(route('punch_index'))
        }
    }, []);
    const tabs = [
        {
            id: "Dashboard",
            content: "Dashboard",
        }
    ];
    const logOutHandler = () => {
        fetch('/logout', { method: 'POST' })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success == true) {
                    router.get(route('login', query));
                }
            })
    }
    return (
        <div className="navTabs  " style={{ height: "80vh" }}>

            <div className="mb-20" style={{ paddingTop: "35px", display: "flex", justifyContent: "space-between" }}>
                <div className="main-cstm-logo-PO" onClick={() => router.get(route('index'))}>
                    <img src={Logo} ></img>
                    {/* <p style={{ margin: "10px 0px 9px 10px", color: "#FFFFFF", fontSize: "16px", fontWeight: "600" }}>Cropica</p> */}
                </div>
                <br />
            </div>
            <MenuList className="main-left-menu-PO ">

                <MenuItem selected={route().current() == 'cropica.fetch.stores' ? true : false} onClick={() => {
                    router.get(route('cropica.fetch.stores'));
                }}>
                    <ListItemIcon>
                        <img className="w-4" src={FetchProductIcon} alt="" />
                    </ListItemIcon>
                    <ListItemText>Stores</ListItemText>

                </MenuItem>
                <MenuItem selected={route().current() == 'cropica.history' ? true : false} onClick={() => {
                    router.get(route('cropica.history'));
                }}>
                    <ListItemIcon>
                        <img className="w-4" src={ManageHistory} alt="" />
                    </ListItemIcon>
                    <ListItemText>History</ListItemText>
                </MenuItem>
            </MenuList>

            {/*  */}
            <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}></Tabs>

        </div>
    );
}
export default CustomBar;
