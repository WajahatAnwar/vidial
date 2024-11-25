import AppLayout from '@/ReactJs/AllInOne/AppLayout';
import '@/ReactJs/AllInOne/Users/user.css';
import { router, usePage } from '@inertiajs/react';
import { Box } from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Select from 'react-select';

import {
    Button,
    Card,
    Checkbox,
    Divider,
    Grid, Icon,
    Page,
    Text,
    TextField
} from '@shopify/polaris';
import { ArrowLeftIcon, HideIcon, NoteIcon, ViewIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function Users() {
    const userTypes = [
        { label: 'Normal User', value: 3 },
        { label: 'Punchout User', value: 4 },
    ];
    const [userType, setUserType] = useState(userTypes[0]);
    const [accessLevels, setAccessLevels] = useState([]);
    const [accessLevel, setAccessLevel] = useState(false);
    const pageData = usePage().props;
    const [user,setUser] = useState({});
    const [page, setPage] = useState(false);
    const [applications, setApplications] = useState([]);
    const [reload, setReload] = useState(false);



    useEffect(() => {
        async function load() {
            const response = await fetch(`/user-detail-data?user=${pageData.user}`);
            const result = await response.json();
            console.log(result);
            if (result.success) {
                setPage(result);
                const temp = [];
                let accessLevelList = [];
                result.user.applications.forEach((value, index) => {
                    if (value.route)
                        temp.push(value);
                })
                result.accessLevels.forEach(level => {
                    accessLevelList.push({
                        label: level.name,
                        value: level.id
                    });
                });
                setAccessLevels(accessLevelList);
                setApplications(temp);
                setUserName(result.user.name);
                setUserEmail(result.user.email);
                setToken(result.user.access_token);
                setUser(result.user);
                setUserType(userTypes.find((type) => {
                    if (type.value == result.user.role_id) {
                        return true;
                    }
                }));
                result.user.access_level_id &&
                    result.accessLevels.find((level) => {
                    if (level.id == result.user.access_level_id) {
                        setAccessLevel({
                            label: level.name,
                            value: level.id
                        });
                        return true;
                    }
                });
            }
        }
        load();
    }, [reload]);


    const [currentApplication, setCurrentApplication] = useState(false);

    const [currentPage, setCurrentPage] = useState(null);
    const handleChange = (event, newValue) => {
        setCurrentPage(newValue);
        setCurrentApplication(applications.find(value => value.name == event.target.innerText));
    };

    const [token, setToken] = useState("");
    const [userName, setUserName] = useState('Wajahat');
    const [userEmail, setUserEmail] = useState('ABC@gmail.com');
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => { setShowPassword(!showPassword) };

    const [readAccess, setReadAccess] = useState(false);
    const [writeAccess, setWriteAccess] = useState(false);

    const [inconnectStatuses, setInconnectStatuses] = useState([
        { name: "Shopify Accounts", read_access: false, write_access: false },
        { name: "Vendors", read_access: false, write_access: false },
        { name: "Decorators", read_access: false, write_access: false }
    ]);

    const [punchoutStatuses, setPunchoutStatuses] = useState([
        { name: "Tools", read_access: false, write_access: false }
    ]);

    useEffect(() => {
        if (currentApplication) {
            // console.log(currentApplication);
            setReadAccess(currentApplication.pivot.read_access ? true : false);
            setWriteAccess(currentApplication.pivot.write_access ? true : false);
            if (currentApplication.name == "Goosely") {
                setInconnectStatuses(currentApplication.pivot.inconnect.map((value, index) => {
                    return { name: value.type, read_access: value.read_access ? true : false, write_access: value.write_access ? true : false }
                }))
            }
            if (currentApplication.name == "Punchout") {
                setPunchoutStatuses(currentApplication.pivot.punchout.map((value, index) => {
                    return { name: value.type, read_access: value.read_access ? true : false, write_access: value.write_access ? true : false }
                }))
            }
        }
    }, [currentApplication]);

    const editUserHandler = () => {
        async function upload(formData) {
            try {
                const response = await fetch("/all_in_one/edit_user", {
                    method: "POST",
                    body: formData,
                });
                const result = await response.json();
                if (result.success) {
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        'User Edited Successfully.',
                        'success'
                    )
                } else {
                    Swal.fire(
                        'Error!',
                        result.message,
                        'error'
                    )
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        const formData = new FormData();

        formData.append("name", userName);
        formData.append("email", userEmail);
        formData.append("id", page.user.id);
        formData.append("user_role", JSON.stringify(userType));
        formData.append("access_level", JSON.stringify(accessLevel));

        upload(formData);
    }

    const resetPasswordHandler = () => {

        async function upload(formData) {
            try {
                const response = await fetch("/all_in_one/reset_password", {
                    method: "POST",
                    body: formData,
                });
                const result = await response.json();
                if (result.success) {
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        'User password Updated.',
                        'success'
                    )
                } else {
                    Swal.fire(
                        'Error!',
                        result.message,
                        'error'
                    )
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        const formData = new FormData();

        formData.append("password", password);
        formData.append("id", page.user.id);

        upload(formData);

    }

    const saveAccessHandler = () => {

        async function upload(formData) {
            try {
                const response = await fetch("/change-read-write", {
                    method: "POST",
                    body: formData,
                });
                const result = await response.json();
                if (result.success) {
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        'Application Statuses Updated.',
                        'success'
                    )
                } else {
                    Swal.fire(
                        'Error!',
                        result.message,
                        'error'
                    )
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        const formData = new FormData();

        formData.append("read_access", readAccess);
        formData.append("write_access", writeAccess);
        formData.append("application_status_id", currentApplication.pivot.id);
        formData.append("inconnect_statuses", JSON.stringify(inconnectStatuses));
        formData.append("punchout_statuses", JSON.stringify(punchoutStatuses));
        if (currentApplication.id == 6)
            formData.append("inconnect", true);

        if (currentApplication.id == 9)
            formData.append("punchout", true);

        upload(formData);

    }

    const CustomTab = ({ label, icon }) => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img src={icon} alt={label} style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                <Text variant='headingSm' as='h6'>{label}</Text>
            </Box>
        );
    };

    const regenerateHandler = (command) => {
        async function upload(formData) {
            try {
                const response = await fetch("/regenerate-token", {
                    method: "POST",
                    body: formData,
                });
                const result = await response.json();
                if (result.success) {
                    setReload(!reload);
                    Swal.fire(
                        'Success!',
                        result.message,
                        'success'
                    )
                    if (result.data)
                        navigator.clipboard.writeText(result.data.access_token);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        const formData = new FormData();
        formData.append("user_id", page.user.id);
        formData.append("command", command);
        upload(formData);
    }

    return (
        <div className='user_parent_class' style={{ background: `url('${window.appURL}/images/background4.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            {page &&
                <Page>
                    <div>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                    <div style={{ display: "flex" }}>
                                        <div style={{ display: "flex" }}>
                                            <div onClick={() => router.get(route('users_aio'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                            <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> User Detail</div>
                                        </div>
                                    </div>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>
                                <div>
                                    <Card>
                                        <div className='px-3 flex pb-4'>
                                            <p className='flex text-zinc-400' role='button' style={{ fontSize: "16px" }} onClick={() => {
                                                setCurrentPage(null);
                                                setCurrentApplication(false);
                                            }}> <span className='mx-2'><Icon source={NoteIcon} tone="base" /></span> Basic Info</p>
                                        </div>
                                        <Divider />
                                        <div className='p-4'>
                                            <Text variant='headingMd' as='h6'>App Permissions</Text>
                                        </div>
                                        <div>
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ borderBottom: 1, borderColor: 'divider', }} className="VerticalTabCust">
                                                    <Tabs
                                                        sx={{ display: 'flex', flexDirection: 'column' }}
                                                        value={currentPage}
                                                        onChange={handleChange}
                                                        aria-label="basic tabs example"
                                                    >
                                                        {applications.map((tab, index) => {
                                                            if (user.role_id == 4) {
                                                                if(tab.name == 'Punchout'){
                                                                    return (
                                                                        <Tab
                                                                            key={index}
                                                                            label={<CustomTab label={tab.name} icon={tab.image_link} />}
                                                                            {...a11yProps(index)}
                                                                        />
                                                                    );
                                                                }
                                                            }else{
                                                                return (
                                                                    <Tab
                                                                        key={index}
                                                                        label={<CustomTab label={tab.name} icon={tab.image_link} />}
                                                                        {...a11yProps(index)}
                                                                    />
                                                                );
                                                            }
                                                        })}

                                                    </Tabs>
                                                </Box>
                                            </Box>
                                        </div>
                                    </Card>
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 9, lg: 9, xl: 9 }}>
                                <div className='basic-info'>
                                    <div className='mb-4'>
                                        <Card>
                                            <div className='flex justify-between items-center'>
                                                <div className='flex items-center'>
                                                    <div>
                                                        <img src={`${window.appURL}/${page.user.user_picture}`} style={{ height: "60px", borderRadius: "5px" }} />
                                                    </div>
                                                    <span className='mx-3'> <Text variant='headingLg' as='h6'>{page.user.name}</Text>
                                                        <p className='text-zinc-500'>{page.user.email}</p>
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                                <div>
                                    {currentPage === null &&
                                        <div>
                                            <div>
                                                <Card>
                                                    <Grid>
                                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                                                            <div>
                                                                <Text variant="headingLg" as="h1">
                                                                    Basic Info
                                                                </Text>
                                                            </div>
                                                        </Grid.Cell>
                                                    </Grid>
                                                    <div className='mt-4'>
                                                        <Grid>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                <TextField
                                                                    label="Name"
                                                                    value={userName}
                                                                    onChange={(e) => setUserName(e)}
                                                                    autoComplete="off"
                                                                />
                                                            </Grid.Cell>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                <TextField
                                                                    label="Email Address"
                                                                    value={userEmail}
                                                                    onChange={(e) => setUserEmail(e)}
                                                                    autoComplete="off"
                                                                />
                                                            </Grid.Cell>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                            <div style={{ margin: '5px 0' }}>User Type</div>
                                                            <Select
                                                                menuPortalTarget={document.body}
                                                                styles={{
                                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                }}
                                                                placeholder="User Type"
                                                                options={userTypes}
                                                                value={userType}
                                                                onChange={(e) => {
                                                                    setUserType(e);
                                                                }}
                                                            />
                                                            </Grid.Cell>
                                                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                {
                                                                userType && userType.value == 4 && (
                                                                    <>
                                                                        <div style={{ margin: '5px 0' }}>Access Level</div>
                                                                        <Select
                                                                            menuPortalTarget={document.body}
                                                                            styles={{
                                                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                            }}
                                                                            placeholder="Access Level"
                                                                            options={accessLevels}
                                                                            value={accessLevel}
                                                                            onChange={(e) => setAccessLevel(e)}
                                                                        />
                                                                    </>
                                                                )
                                                                }
                                                                </Grid.Cell>
                                                        </Grid>
                                                    </div>
                                                    <div className="users-button-group mt-8 flex justify-end">
                                                        <Button variant="primary" onClick={editUserHandler}>Save</Button>
                                                    </div>
                                                    <hr className='mt-5 mb-4' style={{ width: "100%" }} />
                                                    <Grid>
                                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                                                            <div>
                                                                <Text variant="headingLg" as="h1">
                                                                    Developer Token
                                                                </Text>
                                                            </div>
                                                        </Grid.Cell>
                                                    </Grid>
                                                    <div style={{ display: "flex" }}>
                                                        <div className='mt-4' style={{ width: "100%" }}>
                                                            <TextField
                                                                label="Token"
                                                                value={token}
                                                                autoComplete="off"
                                                                type='text'
                                                                placeholder='Click Generate to get Token'
                                                                disabled={true}
                                                            />
                                                        </div>
                                                        <div className="mt-10 ml-5 justify-end" style={{ display: "flex" }}>
                                                            <Button onClick={() => regenerateHandler('generate')} variant="primary"> {page.user.access_token ? 'Regenerate' : 'Generate'}</Button>
                                                            <span style={{ marginLeft: "20px" }}></span>
                                                            <Button onClick={() => {
                                                                navigator.clipboard.writeText(page.user.access_token);
                                                                Swal.fire(
                                                                    'Success!',
                                                                    'Token copied to clipboard.',
                                                                    'success'
                                                                )
                                                            }} disabled={page.user.access_token ? false : true}>Copy</Button>
                                                            <span style={{ marginLeft: "20px" }}></span>
                                                            <Button onClick={() => regenerateHandler('revoke')} tone="critical" disabled={page.user.access_token ? false : true}> Revoke</Button>
                                                        </div>
                                                    </div>

                                                    <hr className='mt-5' style={{ width: "100%" }} />
                                                    <Grid>
                                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                                                            <div className='mt-4'>
                                                                <Text variant="headingLg" as="h5">
                                                                    Change Password
                                                                </Text>
                                                            </div>
                                                        </Grid.Cell>
                                                    </Grid>
                                                    <div className='mt-4'>
                                                        <Grid>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                <div>
                                                                    <p>Password</p>
                                                                    <div className='relative input-cust'>
                                                                        <div className='basic-icons flex justify-end'>
                                                                            {showPassword ? (
                                                                                <ViewIcon width={20} onClick={togglePasswordVisibility} className='dashboard-eye-icon' />
                                                                            ) : (
                                                                                <HideIcon width={20} onClick={togglePasswordVisibility} className='dashboard-eye-icon' />
                                                                            )}
                                                                        </div>
                                                                        <input
                                                                            className='Basic-Info-field'
                                                                            type={showPassword ? 'text' : 'password'}
                                                                            placeholder='********'
                                                                            value={password}
                                                                            onChange={(e) => setPassword(e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </Grid.Cell>
                                                        </Grid>
                                                    </div>
                                                    <div className="users-button-group mt-8 flex justify-end">
                                                        <Button variant="primary" onClick={resetPasswordHandler}>Save</Button>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                    }

                                    {currentApplication && <div>
                                        {currentApplication.name == 'Goosely' ?
                                            <div className=''>
                                                <Card>
                                                    <Grid>
                                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                                                            <div className='flex'>
                                                                <img src={`${currentApplication.image_link}`} alt="" width={"30px"} />
                                                                <div className='ml-3 '>
                                                                    <Text variant="headingLg" as="h5">
                                                                        {currentApplication.name}
                                                                    </Text>
                                                                </div>
                                                            </div>
                                                        </Grid.Cell>
                                                    </Grid>
                                                    <hr className='mt-8' />
                                                    <div className='mt-4'>
                                                        <Grid>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                <Text variant="headingMd" as="h6">
                                                                    Total Dominace
                                                                </Text>
                                                                <p className='' style={{ color: "#A0AEC0", fontSize: "12px" }}>With read and write authority, you shape the narrative of your data universe
                                                                </p>
                                                            </Grid.Cell>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                <div className='user-checkbox flex justify-around'>
                                                                    <div>
                                                                        <Checkbox
                                                                            label="Read"
                                                                            checked={readAccess}
                                                                            onChange={(e) => setReadAccess(e)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Checkbox
                                                                            label="Write"
                                                                            checked={writeAccess}
                                                                            onChange={(e) => {
                                                                                console.log(e);
                                                                                setWriteAccess(e)
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </Grid.Cell>
                                                        </Grid>
                                                    </div>
                                                    {inconnectStatuses.map((value, index) => {
                                                        return (
                                                            <div key={index}>
                                                                <hr className='mt-8' />
                                                                <div className='mt-4'>
                                                                    <Grid>
                                                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                            <Text variant="headingMd" as="h6">
                                                                                {value.name}
                                                                            </Text>
                                                                            <p className='' style={{ color: "#A0AEC0", fontSize: "12px" }}>
                                                                                With read and write authority, you shape the narrative of your data universe
                                                                            </p>
                                                                        </Grid.Cell>
                                                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                            <div className='user-checkbox flex justify-around'>
                                                                                <div>
                                                                                    <Checkbox
                                                                                        label="Read"
                                                                                        checked={value.read_access}
                                                                                        onChange={(e) => {
                                                                                            let temp = [...inconnectStatuses];
                                                                                            temp[index].read_access, temp[index].read_access = e;
                                                                                            setInconnectStatuses(temp);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <Checkbox
                                                                                        label="Write"
                                                                                        checked={value.write_access}
                                                                                        onChange={(e) => {
                                                                                            let temp = [...inconnectStatuses];
                                                                                            temp[index].write_access, temp[index].write_access = e;
                                                                                            setInconnectStatuses(temp);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </Grid.Cell>
                                                                    </Grid>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}

                                                    <hr className='mt-8' style={{ width: "100%" }} />
                                                    <div className="users-button-group mt-4 flex justify-end">
                                                        <Button variant="primary" onClick={saveAccessHandler}>Save</Button>
                                                    </div>
                                                </Card>
                                            </div> :
                                            currentApplication.name == 'Punchout' ?
                                                <div className=''>
                                                    <Card>
                                                        <Grid>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                                                                <div className='flex'>
                                                                    <img src={`${currentApplication.image_link}`} alt="" width={"30px"} />
                                                                    <div className='ml-3 '>
                                                                        <Text variant="headingLg" as="h5">
                                                                            {currentApplication.name}
                                                                        </Text>
                                                                    </div>
                                                                </div>
                                                            </Grid.Cell>
                                                        </Grid>
                                                        <hr className='mt-8' />
                                                        <div className='mt-4'>
                                                            <Grid>
                                                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                    <Text variant="headingMd" as="h6">
                                                                        Total Dominace
                                                                    </Text>
                                                                    <p className='' style={{ color: "#A0AEC0", fontSize: "12px" }}>With read and write authority, you shape the narrative of your data universe
                                                                    </p>
                                                                </Grid.Cell>
                                                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                    <div className='user-checkbox flex justify-around'>
                                                                        <div>
                                                                            <Checkbox
                                                                                label="Read"
                                                                                checked={readAccess}
                                                                                onChange={(e) => setReadAccess(e)}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Checkbox
                                                                                label="Write"
                                                                                checked={writeAccess}
                                                                                onChange={(e) => {
                                                                                    console.log(e);
                                                                                    setWriteAccess(e)
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </Grid.Cell>
                                                            </Grid>
                                                        </div>
                                                        {punchoutStatuses.map((value, index) => {
                                                            return (
                                                                <div key={index}>
                                                                    <hr className='mt-8' />
                                                                    <div className='mt-4'>
                                                                        <Grid>
                                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                                <Text variant="headingMd" as="h6">
                                                                                    {value.name}
                                                                                </Text>
                                                                                <p className='' style={{ color: "#A0AEC0", fontSize: "12px" }}>
                                                                                    With read and write authority, you shape the narrative of your data universe
                                                                                </p>
                                                                            </Grid.Cell>
                                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                                <div className='user-checkbox flex justify-around'>
                                                                                    <div>
                                                                                        <Checkbox
                                                                                            label="Read"
                                                                                            checked={value.read_access}
                                                                                            onChange={(e) => {
                                                                                                let temp = [...punchoutStatuses];
                                                                                                temp[index].read_access, temp[index].read_access = e;
                                                                                                setPunchoutStatuses(temp);
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <Checkbox
                                                                                            label="Write"
                                                                                            checked={value.write_access}
                                                                                            onChange={(e) => {
                                                                                                let temp = [...punchoutStatuses];
                                                                                                temp[index].write_access, temp[index].write_access = e;
                                                                                                setPunchoutStatuses(temp);
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </Grid.Cell>
                                                                        </Grid>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}

                                                        <hr className='mt-8' style={{ width: "100%" }} />
                                                        <div className="users-button-group mt-4 flex justify-end">
                                                            <Button variant="primary" onClick={saveAccessHandler}>Save</Button>
                                                        </div>
                                                    </Card>
                                                </div>
                                                :
                                            <div className=''>
                                                <Card>
                                                    <Grid>
                                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                                                            <div className='flex'>
                                                                <img src={`${currentApplication.image_link}`} alt="" width={"30px"} />
                                                                <div className='ml-3 '>
                                                                    <Text variant="headingLg" as="h5">
                                                                        {currentApplication.name}
                                                                    </Text>
                                                                </div>
                                                            </div>
                                                        </Grid.Cell>
                                                    </Grid>
                                                    <hr className='mt-5' />
                                                    <div className='mt-4'>
                                                        <Grid>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                <Text variant="headingMd" as="h6">
                                                                    Total Dominace
                                                                    {/* {JSON.stringify(currentApplication)} */}
                                                                </Text>
                                                                <p className='' style={{ color: "#A0AEC0", fontSize: "12px" }}>With read and write authority, you shape the narrative of your data universe
                                                                </p>
                                                            </Grid.Cell>
                                                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                                                <div className='user-checkbox flex justify-around'>
                                                                    <div>
                                                                        <Checkbox
                                                                            label="Read"
                                                                            checked={readAccess}
                                                                            onChange={(e) => setReadAccess(e)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Checkbox
                                                                            label="Write"
                                                                            checked={writeAccess}
                                                                            onChange={(e) => {
                                                                                setWriteAccess(e)
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                            </Grid.Cell>
                                                        </Grid>
                                                    </div>
                                                    <hr className='mt-6' style={{ width: "100%" }} />
                                                    <div className="users-button-group mt-4 flex justify-end">
                                                        <Button variant="primary" onClick={saveAccessHandler}>Save</Button>
                                                    </div>
                                                </Card>
                                            </div>
                                        }
                                    </div>
                                    }
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </div>
                </Page>
            }
        </div>
    );
}

Users.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Users;

