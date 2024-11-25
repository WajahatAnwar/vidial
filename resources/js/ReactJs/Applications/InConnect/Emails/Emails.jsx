import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import Logo from '@/ReactJs/Applications/InConnect/Assets/images/club_color_logo.png';
import { router } from "@inertiajs/react";
import ReactSelect from 'react-select';
import { Button, ButtonGroup, Card, Grid, Icon, Modal, Page, Select, Text, TextField, Tooltip } from '@shopify/polaris';
import { ArrowLeftIcon, InfoIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import CodeEditor from './CodeEditor';
import Toggle from './Toggle';
import makeAnimated from 'react-select/animated';

function Emails({ email_templates, email_tags, order_statuses, users }) {
    const animatedComponents = makeAnimated();
    const [active, setActive] = useState(false);
    const [selected, setSelected] = useState({});
    const [usersList, setUsersList] = useState([]);

    const [emailTemplates, setEmailTemplates] = useState(email_templates);
    const [emailTags, setEmailTags] = useState(email_tags);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const orderStatusOptions = order_statuses.map((status) => ({
        label: status.name,
        value: status.id,
    }));
    const options = [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
    ]

    const handleChangeEmailTemplate = useCallback((item) => {
        console.log(item);
        if (item) {
            let ignoreUsers = JSON.parse(item.ignore_users) ?? [];
            setSelected(item);
            setForm({
                name: item.name,
                subject: item.subject,
                inconnect_order_status_id: item.inconnect_order_status_id,
                send_at: item.send_at,
                body: item.body,
                send_after: item.send_after,
                ignore_users: ignoreUsers, // Store ignore users
                pop_shop_status: item.pop_shop_status, // Store ignore users
            });
            const decoratorsList = ignoreUsers.map(user => ({
                label: user.label,
                value: user.value
            }));
            setSelectedUsers(decoratorsList); // Set initial selected users
        }
        setActive(!active);
    }, [active]);


    const [form, setForm] = useState({
        name: '',
        subject: '',
        body: '',
        inconnect_order_status_id: null,
        send_at: 'initiated',
        send_after: 0,
        pop_shop_status: false,
    });

    const handleChange = useCallback(
        (object) => {
            setForm(object)
        },
        []
    );

    const editorRef = useRef();

    const handleTagClick = (keyword) => {
        if (!form.body.includes(`${keyword}`)) {
            const textarea = editorRef.current;
            if (textarea) {
                const cursorPos = textarea.selectionStart;
                const beforeCursor = form.body.substring(0, cursorPos);
                const afterCursor = form.body.substring(cursorPos);
                const updatedBody = `${beforeCursor}${keyword}${afterCursor}`;
                handleChange({
                    ...form,
                    body: updatedBody
                });
            }
        }
    };

    const saveEmailTemplate = async () => {
        let method = selected.id ? 'PATCH' : 'POST';
        let route_url = selected.id ? route('ic_emails.update', selected.id) : route('ic_emails.store');

        // Convert ignore_users to JSON string before sending
        const formWithJsonIgnoreUsers = {
            ...form,
        };

        let response = await fetch(route_url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formWithJsonIgnoreUsers),
        });

        let data = await response.json();
        if (data.success) {
            setActive(!active);
            Swal.fire({
                title: 'Success!',
                icon: 'success',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                router.get(route('ic_emails.index'));
            });
        } else {
            Swal.fire({
                position: "top-end",
                text: data.message,
                icon: "info",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };


    useEffect(() => {
        let tempUser = [];
        let selected_users = [];

        emailTemplates.forEach((item) => {
            let ignoreUsers = item.ignore_users;
            if (ignoreUsers) {
                ignoreUsers = JSON.parse(ignoreUsers);// Replace all single quotes with double quotes
            } else {
                ignoreUsers = []; // If null or undefined, set to an empty array
            }
            // Check if it's an array and map through it
            if (Array.isArray(ignoreUsers)) {
                ignoreUsers.forEach((user) => {
                    if (user) {
                        selected_users.push({ label: user.label, value: user.value });
                    }
                });
            }
        });

        users.forEach((user) => {
            tempUser.push({ label: user.store_name, value: user.id });
        });

        setUsersList(tempUser);
        setSelectedUsers(selected_users);
    }, [emailTemplates, users]);




    useEffect(() => {
        if (!active) {
            setForm({
                name: '',
                subject: '',
                body: '',
                inconnect_order_status_id: 1,
                send_at: 'initiated',
                send_after: 0,
                ignore_users: [], // Add ignore_users to form,
                pop_shop_status: false,
            });
            setSelected({});
        }
    }, [active]);

    const updateActiveStatus = async (id, status) => {
        let response = await fetch(route('ic_emails.update', id), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                is_active: status
            }),
        });
        let data = await response.json();
        if (data.success) {
            let templates = [...emailTemplates];
            let index = emailTemplates.findIndex(item => item.id === id);
            emailTemplates[index].is_active = status;
            setEmailTemplates(templates);

            Swal.fire({
                icon: 'success',
                position: "top-end",
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <div className='cc-inconnect-body-wraper'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('ic_index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}>Emails</div>
                                </div>
                                <div className='addnewvendors'><Button onClick={() => { setActive(!active); }} style={{ cursor: 'pointer' }}>Add New Template</Button></div>
                            </div>
                        </Grid.Cell>
                        {email_templates.map(item => (
                            <Grid.Cell key={item.id} columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <Card>
                                    <div className='flex justify-between '>
                                        <img src={Logo} width="40px" height="40px" alt="Logo"></img>
                                        <Button onClick={() => {
                                            handleChangeEmailTemplate(item);
                                        }}>Edit</Button>
                                    </div>
                                    <div className='flex mt-2'>
                                        <Text variant="headingMd" as="h6">{item.name}</Text>
                                        <span className='ml-2 badge-cstm-green flex'>
                                            <Toggle toggled={item.is_active ? true : false} onClick={(e) => {
                                                updateActiveStatus(item.id, e.target.checked)
                                            }} />
                                            <span className='ml-2 mt-0'>
                                                <div style={{ padding: '0px 0' }}>
                                                    <Tooltip content={'this email is sent when order\'s ' + item.inconnect_order_status.name + ' step is ' + item.send_at + ' after ' + item.send_after + ' minutes'}>
                                                        <Text fontWeight="bold" as="span">
                                                            <span> <Icon
                                                                source={InfoIcon}
                                                                color='base'
                                                            />
                                                            </span>
                                                        </Text>
                                                    </Tooltip>
                                                </div>
                                            </span>
                                        </span>
                                    </div>
                                    <div className='mt-2'>
                                        <Text variant="headingSm" as="h6">
                                            {item.subject}
                                        </Text>
                                        <div className='pt-1'>
                                            <p style={{ lineHeight: '1.7em' }}>
                                                {item.body}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Grid.Cell>
                        ))}
                    </Grid>
                    <Modal
                        open={active}
                        onClose={() => setActive(!active)}
                        title={
                            <div>
                                <Text variant="headingLg" as="h5">
                                    Edit Email Template
                                </Text>
                            </div>
                        }
                    >
                        <Modal.Section>
                            <div className='mb-2'>
                                <Text variant="headingMd" as="h6">
                                    <span className='cust-staric'>Name</span>
                                </Text>
                            </div>
                            <TextField
                                value={form.name}
                                onChange={(input) => handleChange({
                                    ...form,
                                    name: input
                                })}
                                autoComplete="off"
                            />

                            <div className='my-2'>
                                <Text variant="headingMd" as="h6">
                                    <span className='cust-staric'>Subject</span>
                                </Text>
                            </div>
                            <TextField
                                value={form.subject}
                                onChange={(input) => handleChange({
                                    ...form,
                                    subject: input
                                })}
                                autoComplete="off"
                            />
                            <div className='my-2'>
                                <Text variant="headingMd" as="h6">
                                    Trigger
                                </Text>
                            </div>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                    <div className='mt-1'>
                                        <label className='cust-staric' style={{ marginBottom: '4px', display: 'block' }}>
                                            Order Status
                                        </label>
                                        <Select
                                            value={form.inconnect_order_status_id}
                                            onChange={(input) => handleChange({
                                                ...form,
                                                inconnect_order_status_id: parseInt(input)
                                            })}
                                            options={orderStatusOptions}
                                        />
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                    <div className='mt-1'>
                                        <label className='cust-staric' style={{ marginBottom: '4px', display: 'block' }}>
                                            Send At
                                        </label>
                                        <Select
                                            className='cust-staric'
                                            value={form.send_at}
                                            onChange={(input) => handleChange({
                                                ...form,
                                                send_at: input
                                            })}
                                            options={[
                                                { label: 'Initiated', value: 'initiated' },
                                                { label: 'Completed', value: 'completed' },
                                            ]}
                                        />
                                    </div>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                                    <div className='mt-1'>
                                        <label className='cust-staric' style={{ marginBottom: '4px', display: 'block' }}>
                                            Send After (minutes)
                                        </label>
                                        <TextField
                                            className='cust-staric'
                                            value={form.send_after}
                                            type='number'
                                            min={0}
                                            onChange={(input) => handleChange({
                                                ...form,
                                                send_after: input
                                            })}
                                            autoComplete="off"
                                        />
                                    </div>
                                </Grid.Cell>
                            </Grid>
                            <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>


                                <div className='mt-1' style={{ display: "flex" }}>
                                    <div style={{ width: "100%" }}>
                                        <label style={{ marginBottom: '4px', display: 'block' }}>
                                            Ignore Stores
                                        </label>
                                        <ReactSelect
                                            closeMenuOnSelect={false}
                                            components={animatedComponents}
                                            isMulti
                                            options={usersList}
                                            value={selectedUsers} // Show selected users
                                            onChange={(selectedOptions) => {
                                                setSelectedUsers(selectedOptions);
                                                let selectedUsers = [];
                                                selectedOptions.forEach((option) => {
                                                    console.log(option);
                                                    selectedUsers.push({
                                                        label: option.label,
                                                        value: option.value
                                                    });
                                                });
                                                console.log(selectedUsers);

                                                handleChange({
                                                    ...form,
                                                    ignore_users: selectedUsers
                                                });
                                            }}
                                        />
                                    </div>
                                    <div style={{ width: "15%", marginLeft: "10px" }}>
                                        <label style={{ marginBottom: '16px', display: 'block' }}>
                                            Pop Shop
                                        </label>
                                        <Toggle
                                            toggled={form.pop_shop_status ? true : false}
                                            onClick={(e) => handleChange({
                                                ...form,
                                                pop_shop_status: e.target.checked
                                            })}
                                        />
                                    </div>
                                </div>
                            </Grid.Cell>

                            <div className='mt-4'>
                                <div className='mb-2'>
                                    <Text variant="headingMd" as="h6">
                                        <span className='cust-staric'>Email Tags</span>
                                    </Text>
                                </div>

                                <div className='hashtags'>
                                    {emailTags.map((tag) => (
                                        <button key={tag.id} onClick={() => handleTagClick(tag.name)}>
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>

                                <div className='mt-3 mb-2'>

                                    <p style={{ color: "red" }}><b>Note:</b> <span style={{ color: "grey" }}>These tags will be replaced with customer's order specific information. </span> </p>
                                </div>

                                <div>
                                    <Text variant="headingMd" as="h6">
                                        <span className='cust-staric'>Email Body</span>
                                    </Text>
                                    <textarea
                                        ref={editorRef}
                                        className='mt-1'
                                        value={form.body}
                                        onChange={(e) => handleChange({
                                            ...form,
                                            body: e.target.value
                                        })}
                                        style={{ width: "100%", border: '1px solid #898f94', borderRadius: '5px' }}
                                        rows="4"
                                        cols="150"
                                    ></textarea>
                                    <CodeEditor />
                                </div>

                                <div className="btn-group mt-3 flex justify-end">
                                    <ButtonGroup>
                                        <Button onClick={() => setActive(!active)}>Cancel</Button>
                                        <Button variant="primary" onClick={saveEmailTemplate}>Save</Button>
                                    </ButtonGroup>
                                </div>
                            </div>
                        </Modal.Section>
                    </Modal>
                </div>
            </Page>
        </div>
    );
}

Emails.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Emails;
