import AppLayout from '@/ReactJs/MyApplication/AppLayout';
import MessagesBanner from '@/ReactJs/Components/MessagesBanner';
import ToggleSmall from '@/ReactJs/Components/ToggleSmall';
import { router, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    Grid, Icon,
    IndexFilters,
    IndexTable,
    Modal,
    Page,
    Pagination,
    Select as ShopifySelect,
    Text,
    TextField,
    useIndexResourceState,
    useSetIndexFiltersMode
} from '@shopify/polaris';
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';

import Swal from 'sweetalert2';

function Users() {

    const page = usePage().props;
    const { query } = page.ziggy;
    const userTypes = [
        { label: 'Normal User', value: 3 },
        { label: 'Punchout User', value: 4 },
    ];
    const [userType, setUserType] = useState(userTypes[0]);
    const [accessLevels, setAccessLevels] = useState([]);
    const [accessLevel, setAccessLevel] = useState(false);

    function deleteUserHandler(id) {

        fetch(`/all_in_one/delete_user?id=${id}`, {
            method: "POST"
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    Swal.fire(
                        'Deleted!',
                        'User has been deleted.',
                        'success'
                    )
                    setReload(!reload);
                }
            });
    }

    let timeout = null;

    const resourceName = {
        singular: 'user',
        plural: 'users',
    };

    const [tableRows, setTableRows] = useState([]);

    const [firstLoad, setFirstLoad] = useState(false);

    const pageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];
    const [pageCount, setPageCount] = useState("10");
    const handlePageCount = useCallback((value) => { setPageCount(value); setReload(!reload); }, [tableRows]);

    const [selected, setSelected] = useState(0);
    const [itemStrings, setItemStrings] = useState([
        'All',
    ]);

    const tabs = itemStrings.map((item, index) => ({
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
        { label: 'Name', value: 'name asc', directionLabel: 'Ascending' },
        { label: 'Name', value: 'name desc', directionLabel: 'Descending' },
        { label: 'Email', value: 'email asc', directionLabel: 'Ascending' },
        { label: 'Email', value: 'email desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['id asc']);

    const { mode, setMode } = useSetIndexFiltersMode();
    const onHandleCancel = () => { };


    const [queryValue, setQueryValue] = useState('');

    const [pagination, setPagination] = useState({
        path: route("users_list.get"),
        next_cursor: null,
        next_page_url: null,
        prev_cursor: null,
        prev_page_url: null,
    });

    const [currentCursor, setCurrentCursor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myUrl, setMyUrl] = useState("");
    const [reload, setReload] = useState(false);

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(tableRows);

    const [active, setActive] = useState(false);
    const [editUserId, setEditUserId] = useState(false);
    const [editPasswordId, setEditPasswordId] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [flag, setFlag] = useState(false);
    const [flagMessage, setFlagMessage] = useState("");
    const handleFlagClose = () => setFlag(false);

    const [projects, setProjects] = useState([]);

    useEffect(() => {

        let url = new URL(pagination.path);

        if (pageCount) {
            url.searchParams.set('page_count', pageCount);
        }

        if (currentCursor) {
            url.searchParams.set('cursor', currentCursor);
        }

        if (queryValue != '') {
            url.searchParams.set('q', queryValue);
        } else {
            url.searchParams.delete('q');
        }

        if (sortSelected != "") {
            url.searchParams.set('q5', sortSelected[0]);
        } else {
            url.searchParams.delete('q5');
        }

        setMyUrl(url);
        url = url.toString();
        setLoading(true)
        fetch(url)
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    console.log(result);
                    const my_rows = result.data.data.map((user, index) => {
                        return {
                            id: user.id,
                            user_full: <div className='flex items-center'>  <img style={{ borderRadius: "5px" }} src={`${window.appURL}/${user.user_picture}`} alt="" width={'40px'} /> <span className='mx-3'> <Text variant='headingMd' as='h6'>{user.name}</Text>
                                <p className='text-zinc-500'>{user.email}</p>
                            </span></div>,
                            manage: <Button variant="primary" size='slim' onClick={() => router.get(route('edit.user', { id: user.id }))}>Manage</Button>,
                            statuses: user.applications
                        }
                    });

                    // console.log(my_rows);
                    setTableRows(my_rows);
                    // setUserType(userTypes[0]);
                    setPagination({
                        path: result.data.path,
                        next_cursor: result.data.next_cursor,
                        next_page_url: result.data.next_page_url,
                        prev_cursor: result.data.prev_cursor,
                        prev_page_url: result.data.prev_page_url,
                    });
                }
                setLoading(false);
                let availableProjects = result.data2.filter(value => value.route);

                setProjects(availableProjects.map(obj => {
                    return { ...obj, alignment: 'center' };
                }));

                setFirstLoad(true);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });

    }, [reload])

    useEffect(() => {
        if (firstLoad)
            setReload(!reload);
    }, [sortSelected]);

    useEffect(() => {
        fetch(route("access.levels"))
            .then(response => response.json())
            .then(data => {
                console.log(data.data);
                const accessLevelList = [];
                data.data.access_levels.forEach(level => {
                    console.log(level);
                    accessLevelList.push({
                        label: level.name,
                        value: level.id
                    });
                });
                setAccessLevels(accessLevelList);
            });
    }, []);


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

    const handleFiltersClearAll = useCallback(() => {
        handleQueryValueRemove();
    }, [
        handleQueryValueRemove,
    ]);

    const rowMarkup = tableRows.map(
        ({ id, user_full, manage, statuses }, index) => (

            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >

                <IndexTable.Cell>
                    {id}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {user_full}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {manage}
                </IndexTable.Cell>

                {statuses.map((value, index) => {
                    // console.log(value);
                    if (value.route) {
                        return (
                            <IndexTable.Cell key={index} className='custom_column_styles'>
                                <div style={{ marginTop: "2px" }}>
                                    <ToggleSmall onClick={(e) => changeStatusHandler(e.target.checked, id, value.id)} toggled={value.pivot.status} />
                                </div>
                            </IndexTable.Cell>
                        );
                    }
                })}

            </IndexTable.Row>
        ),
    );

    const addUserHandler = () => {

        async function upload(formData) {
            try {
                const response = await fetch("/all_in_one/add_new_user", {
                    method: "POST",
                    body: formData,
                });
                const result = await response.json();
                if (result.success) {
                    Swal.fire(
                        'Success!',
                        'User Added to System.',
                        'success'
                    )
                    setReload(!reload);
                    setActive(false);
                    setFlag(false);
                } else {
                    setFlag(true);
                    setFlagMessage(result.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        const formData = new FormData();

        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("user_role", JSON.stringify(userType));
        formData.append("access_level", JSON.stringify(accessLevel));

        upload(formData);

    }

    const changeStatusHandler = (status, store_id, application_id) => {
        // console.log(status, store_id, app_name);
        fetch("/all_in_one/change_status", {
            method: "POST",
            headers: { "content-Type": "application/json" },
            body: JSON.stringify({ status: status, user_id: store_id, application_id: application_id }),
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                if (data.success == true) {
                    setReload(!reload);
                    Swal.fire(
                        'Success',
                        'User Application status updated',
                        'success'
                    )
                } else {
                    setReload(!reload);
                    Swal.fire({
                        position: "top-end",
                        text: data.message,
                        icon: "info",
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            });
    }

    return (
        <div style={{ background: `url('${window.appURL}/images/background4.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Modal
                open={active}
                onClose={() => setActive(false)}
                title={`${editUserId ? 'Edit User' : editPasswordId ? 'Edit Password' : 'Add User'}`}
                primaryAction={{
                    content: `${editUserId ? 'Update' : editPasswordId ? 'Update' : 'Add'}`,
                    onAction: () => {
                        editUserId ? editUserHandler() :
                            editPasswordId ? resetPasswordHandler() :
                                addUserHandler()
                    },
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: () => setActive(false),
                    },
                ]}
            >
                <Modal.Section>
                    <div>
                        <MessagesBanner flag={flag} message={flagMessage} handleClose={handleFlagClose} mB={"15px"} />
                    </div>
                    {!editPasswordId ?
                        <>
                            <TextField
                                value={name}
                                onChange={(e) => setName(e)}
                                label="Name"
                                type="text"
                                placeholder='Enter Name'
                            />
                            <div style={{ marginTop: "10px" }}></div>
                            <TextField
                                value={email}
                                onChange={(e) => {
                                    setEmail(e)
                                }}
                                label="Email"
                                type="text"
                                placeholder='Enter Email'
                            />
                            <div style={{ marginTop: "10px" }}></div>
                        </>
                        : null
                    }
                    {!editUserId ?
                        <>

                            <TextField
                                value={password}
                                onChange={(e) => setPassword(e)}
                                label="Password"
                                type="password"
                                placeholder='Enter Password'
                            />
                        </> : null
                    }
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



                </Modal.Section>
            </Modal>

            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('index', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Users List</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: "15px" }}>
                                <Button onClick={() => {
                                    setEditUserId(false);
                                    setEditPasswordId(false);
                                    setPassword("");
                                    setName("");
                                    setEmail("");
                                    setActive(true);
                                }}>User +</Button>
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

                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <Card>
                            <IndexFilters
                                sortOptions={sortOptions}
                                sortSelected={sortSelected}
                                queryValue={queryValue}
                                queryPlaceholder="Searching in all"
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
                                headings={[{ title: "Id" }, { title: "User" }, { title: "Authority" }].concat(projects)}
                                selectable={false}
                            >
                                {rowMarkup}
                            </IndexTable>
                        </Card>
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
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}

Users.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Users;

