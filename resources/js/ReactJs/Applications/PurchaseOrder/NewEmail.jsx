import AppLayout from '@/ReactJs/Applications/PurchaseOrder/AppLayout';
import "@/ReactJs/Applications/PurchaseOrder/Assets/css/style.css";
import { router, usePage } from '@inertiajs/react';
import { Button, Card, Grid, Icon, Page, Select, Tag, TextField } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useCallback, useState } from 'react';
import Swal from 'sweetalert2';

const NewEmail = () => {

    const page = usePage().props;
    const { query } = page.ziggy;

    const [emailTitle, setEmailTitle] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [emailSubject, setEmailSubject] = useState('');

    const [newTag, setNewTag] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);

    const [emailSenderType, setEmailSenderType] = useState('order_draft');

    const options = [
        { label: 'Send email when draft order is created', value: 'order_draft' },
        { label: 'Send email when draft order is accepted', value: 'order_accept' },
    ];

    function addNewEmailHandler() {
        console.log(selectedTags);
        console.log(emailTitle);
        console.log(emailSubject);
        console.log(emailBody);

        const formData = new FormData();

        formData.append('email_title', emailTitle);
        formData.append('email_subject', emailSubject);
        formData.append('email_body', emailBody);
        formData.append('sender_type', emailSenderType);
        formData.append('senders_list', JSON.stringify(selectedTags));

        fetch(
            "/purchase_order/add_new_email",
            {
                method: "POST",
                body: formData,
            }
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success === true) {
                    router.get(route('emails_purchase_order', query));
                } else if (data.success === false) {
                    Swal.fire(
                        'Error!',
                        data.message,
                        'error'
                    )
                }
            });
    }


    const removeTag = useCallback(
        (tag) => () => {
            setSelectedTags((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag),
            );
        },
        [],
    );

    const tagMarkup = selectedTags.map((option, index) => (
        <span key={index} style={{ marginLeft: `${index == 0 ? '0px' : '5px'}` }}>
            <Tag key={option} onRemove={removeTag(option)}>
                {option}
            </Tag>
        </span>
    ));

    const addTagHandler = () => {

        const check = newTag;
        let noErrors = true;

        if (check.trim() == "") {

            noErrors = false;
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Tag cannot be null.',
            })
        }

        if (selectedTags.includes(check)) {

            noErrors = false;
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Same Tag cannot be entered again.',
            })
        }

        if (noErrors == true) {
            let temp = [...selectedTags];
            temp.push(newTag);

            setNewTag("");
            setSelectedTags(temp);
        }

    }

    return (
        <div style={{ background: `url('${window.appURL}/images/background6.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('emails_purchase_order', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> New Email</div>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
                        <Card>
                            <div>
                                <TextField
                                    value={emailTitle}
                                    onChange={(e) => setEmailTitle(e)}
                                    label="Email Title"
                                    type="text"
                                />
                            </div>
                            <div style={{ marginTop: "10px" }}></div>
                            <div>
                                <TextField
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e)}
                                    label="Email Subject"
                                    type="text"
                                />
                            </div>
                            <div style={{ marginTop: "18px" }}> </div>
                            <div>
                                <div style={{ marginBottom: "5px", display: "flex", justifyContent: 'space-between' }}>
                                    <div style={{ width: "100%" }} onKeyPress={(e) => { if (e.key === "Enter") { addTagHandler(); } }}>
                                        <TextField
                                            label="Email"
                                            value={newTag}
                                            onChange={(e) => { setNewTag(e) }}
                                            placeholder="Add email here and press enter..."
                                            type="text"
                                            style={{ width: "400px" }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: "8px" }}>
                                    {selectedTags.length > 0 && <div style={{ border: "1px solid #9fa4ac", minHeight: "70px", padding: "5px", borderRadius: "4px" }}>{tagMarkup}</div>}
                                </div>
                            </div>
                            <div style={{ marginTop: "18px" }}> </div>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <div style={{ display: "flex" }}>
                                    <div style={{ marginBottom: "8px" }}> Email Body</div>
                                </div>
                                <div className='' style={{ display: "flex", justifyContent: 'space-between' }}>
                                    <p>Use [order_details] tag for Order Details</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: 'space-between', marginTop: '0px' }}>
                                <div style={{ width: '100%' }}>
                                    <TextField
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e)}
                                        multiline={10}
                                        type="text"
                                    />
                                </div>
                            </div>
                        </Card>

                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <div>
                                <Select
                                    label="Select Email Send Type"
                                    options={options}
                                    onChange={(e) => { setEmailSenderType(e); }}
                                    value={emailSenderType}
                                />
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ marginTop: "6px", paddingTop: "20px", borderTop: "1px solid #e1e3e5", marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <div style={{ display: "flex" }}>
                                    <Button onClick={() => router.get(route('emails_purchase_order', query))}>Discard</Button>
                                    <div style={{ marginLeft: "10px" }}>
                                        <Button variant="primary" onClick={addNewEmailHandler}>Save</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}

NewEmail.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default NewEmail;

