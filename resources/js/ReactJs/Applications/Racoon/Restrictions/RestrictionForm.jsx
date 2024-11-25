import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { router } from '@inertiajs/react';
import { Button, ButtonGroup, Card, Checkbox, Divider, Grid, Tag, Text, TextField } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';

function RestrictionForm({users, restriction, onCloseModal }) {


    const handleChangeRestriction = () => {
        onCloseModal(); // Call the onCloseModal callback to close the modal
    };



    const storeOptions = users.map((user) => {
        return {
            label: user.name,
            value: user.id
        }
    });

    const [collectionOptions, setCollectionOptions] = useState([]);

    const [form, setForm] = useState({
        id: restriction ? restriction.id : null,
        name: restriction ? restriction.name : '',
        user: restriction ? {
            value: restriction.user.id,
            label: restriction.user.name,
        } : null,
        collections: restriction ? restriction.collections.map((collection) => {
            return {
                value: collection.handle,
                label: collection.title
            }
        }) : [],
        emails: restriction ? restriction.emails.map((email) => email.email) : [],
        tags: restriction ? restriction.tags.map((tag) => tag.tag) : [],
        notification_email: restriction ? restriction.notification_email : '',
        auto_cancel: restriction ? restriction.auto_cancel : true,
        notifications_enabled: restriction ? restriction.notifications_enabled : false,
    });


    useEffect(() => {
        if(restriction == null || form.user.value != restriction.user.id){
            form.collections = [];
        }
        if(form.user){
            setCollectionOptions([]);
            fetchCollectionOptions(form.user.value);
        }
    }, [form.user]);

    const fetchCollectionOptions = async (user_id) => {
        try {
            const response = await fetch(route('restrictions.collections.list', user_id), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            let data = await response.json();
            if (data.success) {
                const collectionOptions = data.data.map((option) => {
                    return {
                        value: option.value,
                        label: option.label,
                    }
                });
                setCollectionOptions(collectionOptions);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleChange = useCallback(
        (object) => {
            setForm(object)
        },
        []
    );

    const saveRestriction = async () => {
        let route_url = restriction ? route('restrictions.update', restriction.id) : route('restrictions.store');
        let method_type = restriction ? 'PUT' : 'POST';

        let response = await fetch(route_url, {
            method: method_type,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form),
        });
        let data = await response.json();
        if (data.success) {
            Swal.fire({
                title: 'Success!',
                icon: 'success',
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                router.get(route('restrictions.index'));
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

    const [newTag, setNewTag] = useState("");
    const [newEmail, setNewEmail] = useState("");

    const handleEnter = (type) => {

        const check = (type == 'email') ? newEmail : newTag;

        if (check.trim() == "" || form.emails.includes(check) || form.tags.includes(check)) {
            return;
        }

        if (type == 'email') {
            let temp = [...form.emails];
            temp.push(newEmail);

            setNewEmail("");
            handleChange({
                ...form,
                emails: temp
            })
        } else {
            let temp = [...form.tags];
            temp.push(newTag);

            setNewTag("");
            handleChange({
                ...form,
                tags: temp
            })
        }
    }

    const handleRemove = (type, emailToRemove) => {
        if (type == 'email') {
            const emails = form.emails.filter(email => email !== emailToRemove);
            handleChange({
                ...form,
                emails: emails
            })
        } else {
            const tags = form.tags.filter(tag => tag !== emailToRemove);
            handleChange({
                ...form,
                tags: tags
            })
        }
    };

    return (
        <div className='main-div mb-4' >
            <Grid>
                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                    <Card>
                        <Text variant="headingLg" as="h5">
                            Create Restriction
                        </Text>
                        <Text>Choose Store and specified collection from below dropdown you want to create a restriction for.</Text>
                        <div style={{ padding: '10px 0px 0px 0px', display: 'block' }} >

                        </div>
                        <b style={{ marginBottom: '8px', display: 'block' }}>Name</b>
                        <TextField
                            value={form.name}
                            onChange={(input) => handleChange({
                                ...form,
                                name: input
                            })}
                            autoComplete="off"
                        />
                        <div style={{ padding: '20px 0px', display: 'block' }} >
                            <Divider />
                        </div>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <b style={{ marginBottom: '8px', display: 'block' }}>Choose store</b>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    onChange={(input) => {
                                        handleChange({
                                            ...form,
                                            user: input
                                        })
                                    }}
                                    value={form.user}
                                    options={storeOptions}
                                />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                <b style={{ marginBottom: '8px', display: 'block' }}>Choose Collection</b>
                                <Select
                                    isMulti
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    onChange={(input) => {
                                        handleChange({
                                            ...form,
                                            collections: input
                                        })
                                    }}
                                    value={form.collections}
                                    options={collectionOptions}
                                />
                            </Grid.Cell>
                        </Grid>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                    <Card>
                        <Text variant="headingLg" as="h5">
                            Select Emails & Customer Tags
                        </Text>
                        <Text>Choose emails and customer tags</Text>
                        <div style={{ padding: '20px 0px', display: 'block' }} >
                            <Divider />
                        </div>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <b style={{ marginBottom: '8px', display: 'block' }}>Emails</b>
                                <div style={{ marginBottom: "5px", display: "flex", justifyContent: 'space-between' }}>
                                    <div style={{ width: "100%" }} onKeyPress={(e) => { if (e.key === "Enter") { handleEnter('email'); } }}>
                                        <TextField
                                            value={newEmail}
                                            onChange={(e) => { setNewEmail(e) }}
                                            placeholder="Add email here and press enter..."
                                            type="text"
                                            style={{ width: "400px" }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: "8px" }}>
                                    {form.emails.length > 0 && <div style={{ border: "1px solid #9fa4ac", minHeight: "70px", padding: "5px", borderRadius: "4px" }}>{form.emails.map((option, index) => (
                                        <span key={index}>
                                            <Tag key={option} onRemove={() => handleRemove('email', option)}>
                                                {option}
                                            </Tag>
                                        </span>
                                    ))}</div>}
                                </div>
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                <b style={{ marginBottom: '8px', display: 'block' }}>Customer Tags</b>
                                <div style={{ marginBottom: "5px", display: "flex", justifyContent: 'space-between' }}>
                                    <div style={{ width: "100%" }} onKeyPress={(e) => { if (e.key === "Enter") { handleEnter('tag'); } }}>
                                        <TextField
                                            value={newTag}
                                            onChange={(e) => { setNewTag(e) }}
                                            placeholder="Add tag here and press enter..."
                                            type="text"
                                            style={{ width: "400px" }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: "8px" }}>
                                    {form.tags.length > 0 && <div style={{ border: "1px solid #9fa4ac", minHeight: "70px", padding: "5px", borderRadius: "4px" }}>
                                        {form.tags.map((option, index) => (
                                            <span key={index}>
                                                <Tag key={option} onRemove={() => handleRemove('tag', option)}>
                                                    {option}
                                                </Tag>
                                            </span>
                                        ))}</div>}
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                    <Card>
                        <Text variant="headingMd" as="h5">
                            <Checkbox
                                label="Auto Cancel Fraud Orders"
                                checked={form.auto_cancel}
                                onChange={(e) => handleChange({ ...form, auto_cancel: e })}
                            />

                        </Text>
                        <Text>If unchecked order will be put on hold to be processed later.</Text>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                    <Card>
                        <Text variant="headingMd" as="h5">
                            <Checkbox
                                label="Send internal email with fraud alert notification"
                                checked={form.notifications_enabled}
                                onChange={(e) => handleChange({ ...form, notifications_enabled: e })}
                            />

                        </Text>
                        <Text>If you want to have notified with fraud alert notifications, select this option.</Text>
                        {form.notifications_enabled ?
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                    <div style={{ padding: '10px 0px', display: 'block' }} >

                                    </div>
                                    <b style={{ marginBottom: '8px', display: 'block' }}>Email Address</b>
                                    <TextField
                                        value={form.notification_email}
                                        onChange={(input) => handleChange({
                                            ...form,
                                            notification_email: input
                                        })}
                                        autoComplete="off"
                                    />
                                </Grid.Cell>
                            </Grid>
                         : ''}


                    </Card>
                    <div className='vendors-cc-in-formbtns'>
                            <ButtonGroup>
                            <Button onClick={handleChangeRestriction}>Cancel</Button>
                                <Button variant="primary" onClick={saveRestriction}>Save</Button>
                            </ButtonGroup>
                        </div>
                </Grid.Cell>
            </Grid>
        </div>
    );
}

RestrictionForm.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default RestrictionForm;

