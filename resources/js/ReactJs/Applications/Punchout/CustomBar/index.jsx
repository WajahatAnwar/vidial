import "@/ReactJs/Applications/Punchout/Assets/css/style.css";
import Logo from '@/ReactJs/Applications/Punchout/Assets/images/main-logo.svg';
import { router, usePage } from "@inertiajs/react";
import { Button, Icon, Tabs, Text, Frame } from "@shopify/polaris";
import { SettingsIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from "react";

import { ActionList, Popover } from '@shopify/polaris';
import { EnterIcon } from '@shopify/polaris-icons';




import Divider from '@mui/material/Divider';
import TerminalIcon from '@mui/icons-material/Terminal';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';


function CustomBar() {
    const gateWayRoutes = ['punchout.gateway-activity.sessions','punchout.gateway-activity.order-requests','punchout.gateway-activity.order-invoices']
    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const activator = (
        <span style={{ marginRight: '10px' }}>
            <Button onClick={toggleActive}>
                <Icon source={SettingsIcon} tone="base" />
            </Button>
        </span>
    );
    const page = usePage().props;
    useEffect(() => {

        if (location.pathname == "/punchout/dashboard") {
            setSelected(0);
        }

    }, [location.pathname]);
    const [selected, setSelected] = useState(0);
    const { query } = page.ziggy;
    const handleTabChange = useCallback((selectedTabIndex) => {
        console.log(selectedTabIndex);
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

        <div className="navTabs">

            <div style={{ paddingTop: "35px", display: "flex", justifyContent: "space-between" }}>
                <div className="main-cstm-logo-PO" onClick={() => router.get(route('index'))}>
                    <img src={Logo} ></img>
                    <p style={{ margin: "9px 0px 9px 10px", color: "#FFFFFF", fontSize: "16px", fontWeight: "600",display:"none"}}>Punchout</p>
                </div>
                <br />
            </div>

            {/*  */}

            <MenuList className="main-left-menu-PO">


                    {/* <ListItemText style={{color:'rgba(28,28,28,0.4)'}}>Dashboard</ListItemText> */}

                <MenuItem selected={route().current() == 'punchout.dashboard' ? true : false} onClick={() => {
                    router.get(route('punchout.dashboard'));
                }}>
                    <ListItemIcon>
                        <HomeOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Dashboard</ListItemText>

                </MenuItem>
                <MenuItem selected={(gateWayRoutes.includes(route().current())) ? true : false } onClick={() => {
                    router.get(route('punchout.gateway-activity.sessions' ||'punchout.gateway-activity.order-requests' ||'punchout.gateway-activity.order-invoices'));
                }}>
                    <ListItemIcon>
                        <SignalCellularAltIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Gateway Activity</ListItemText>

                </MenuItem>
                {/* <MenuItem selected={route().current() == 'punchout.reports' ? true : false} onClick={() => {
                    router.get(route('punchout.reports'));
                }}>
                    <ListItemIcon>
                        <ContentPasteSearchIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Reports</ListItemText>

                </MenuItem> */}
                <MenuItem selected={route().current() == 'punchout.developer' ? true : false} onClick={() => {
                    router.get(route('punchout.developer'));
                }}>
                    <ListItemIcon>
                        <TerminalIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Developer</ListItemText>

                </MenuItem>
                <MenuItem selected={route().current().includes('punchout.simulator') ? true : false} onClick={() => {
                    router.get(route('punchout.simulator.catalogs'));
                }}>
                    <ListItemIcon>
                        <VisibilityOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Simulator</ListItemText>

                </MenuItem>
                <MenuItem selected={route().current() == 'punchout.tools' ? true : false} onClick={() => {
                    router.get(route('punchout.tools'));
                }}>
                    <ListItemIcon>
                        <BuildOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Tools</ListItemText>

                </MenuItem>
                {/* <Divider /> */}

                    {/* <ListItemText style={{color:'rgba(28,28,28,0.4)', marginTop:'0px'}}>Settings</ListItemText> */}

                <MenuItem selected={route().current() == 'punchout.settings' ? true : false} onClick={() => {
                    router.get(route('punchout.settings'));
                }}>
                    <ListItemIcon>
                        <SettingsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                </MenuItem>
                <MenuItem selected={route().current() == 'punchout.system-messages' ? true : false} onClick={() => {
                    router.get(route('punchout.system-messages'));
                }}>
                    <ListItemIcon>
                        <MessageOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>System Messages</ListItemText>
                </MenuItem>

                {/* <MenuItem selected={route().current() == 'punchout.client-credentials' ? true : false} onClick={() => {
                    router.get(route('punchout.client-credentials'));
                }}>
                    <ListItemIcon>
                        <MessageOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Client Credentials</ListItemText>
                </MenuItem> */}



            </MenuList>

            {/*  */}
            <span style={{visibility:'hidden'}}><Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}></Tabs></span>

        </div>
    );
}
export default CustomBar;
