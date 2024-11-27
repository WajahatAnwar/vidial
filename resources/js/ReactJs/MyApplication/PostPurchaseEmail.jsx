import { router, usePage } from "@inertiajs/react";
import {
    Button,
    Card,
    ColorPicker,
    DropZone,
    Frame,
    Grid,
    hsbToHex,
    Icon,
    Modal,
    Page,
    Popover,
    Text,
    TextField,
    Thumbnail,
    Toast,
    Tooltip
} from "@shopify/polaris";
import { CircleCancelMajor, NoteMinor } from "@shopify/polaris-icons";
import { Editor } from '@tinymce/tinymce-react';
import { useCallback, useEffect, useRef, useState } from "react";
import backIcon from "./imges/backIcon.png";
import ColorWheel from "./imges/collorWheel.png";
import Delete from "./imges/Delete.svg";


/**
const urlParams = new URLSearchParams(location.search);
const shopParam = urlParams.get('shop');
const storeName = shopParam.split('.')[0];
localStorage.setItem('store',storeName);
*/

const PostPurchaseEmail = () => {
    const page = usePage().props;
    const query = page.ziggy.query;
    const id = page.ziggy.id;
    const [activeTootlTip, setActiveTootlTip] = useState(false);
    const [activeToggle, setActiveToggle] = useState(false);
    const toggleActive = useCallback(() => setActiveToggle((activeToggle) => !activeToggle), []);
    const toastMarkup = activeToggle ? (
        <Toast content="Template Saved" onDismiss={toggleActive} />
    ) : null;
    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);
    const [content, setContent] = useState('');
    const [subject, setSubject] = useState('');
    const [from, setFrom] = useState('');
    const [buttonText, setButtonText] = useState('Record Video');
    const [notes1, setNotes1] = useState(`Use {{order_number}} for the customer’s order number`);
    const [notes2, setNotes2] = useState(`Use {{name}} or {{last_name}} as a placeholder for the user’s first or last name`);
    const [notes3, setNotes3] = useState(`Use {{amount}} for the store credit you are offering to your customers`);
    const [contentPlaceholder, setContentPlaceholder] = useState(``);


    // drop zone code start
    const [files, setFiles] = useState([]);
    const [alreadyUploadLogo, setAlreadyUploadedLogo] = useState('');


    const handleRemoveThumbnail = () => {
        setFiles([]);
        //console.log('handle Remove thumbnail');
    };
    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            //setAlreadyUploadedLogo('');
            setFiles((files) => acceptedFiles);
        },
        []
    );
    const successToast = active ? (
        <Toast content="Settings Saved" onDismiss={true} />
    ) : null;

    const handleRemoveAlreadyUploadedLogo = () => {
        setActiveTootlTip(true);
        setAlreadyUploadedLogo('');

    }

    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const fileUpload = !files.length && <DropZone.FileUpload />;
    const uploadedFiles = files.length > 0 && (
        <div style={{ padding: '0' }}>
            <div>
                {files.map((file, index) => (
                    <div key={index}>
                        <Thumbnail
                            size="small"
                            alt={file.name}
                            source={
                                validImageTypes.includes(file.type)
                                    ? window.URL.createObjectURL(file)
                                    : NoteMinor
                            }
                        />

                        <div>
                            {file.name}{' '}
                            <Text variant="bodySm" as="p">
                                {file.size} bytes
                            </Text>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    const uploadedFilesPreview = files.length > 0 && (
        <div style={{ padding: '0' }}>
            <div style={{ width: "60px", marginBottom: "10px" }} >
                {files.map((file, index) => (
                    <div key={index}>
                        <Thumbnail
                            size="medium"
                            alt={file.name}
                            source={
                                validImageTypes.includes(file.type)
                                    ? window.URL.createObjectURL(file)
                                    : NoteMinor
                            }
                        />
                        <div>
                            <div onClick={handleRemoveThumbnail} >
                                {/* <Icon source={CircleCancelMajor}  color="critical" /> */}
                                <img src={Delete} style={{ cursor: "pointer" }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    // drop zone code end
    const [buttonColorHide, setButtonColorHide] = useState(false);
    const [buttonColorHex, setButtonColorHex] = useState("#000000");
    const handleInputColorChange = useCallback((newValue) => setButtonColorHex(newValue), []);
    const [buttonColor, setButtonColor] = useState({
        hue: 0,
        brightness: 0,
        saturation: 0,
    });
    const [gradientCheck, setGradientCheck] = useState(false);
    console.log(files)
    const handleSaveEmailSettings = () => {
        let saveUrl = route('save-email-settings', query);
        if (id) {
            saveUrl = route('save-email-settings', { id: id, ...query });
        }
        let logo_file;
        setContent(editorRef.current.getContent());
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('buttonText', buttonText);
        formData.append('buttonColorHex', buttonColorHex);
        formData.append('body', editorRef.current.getContent());
        formData.append('type', 'Post_purchase')
        if (files[0]) {
            logo_file = files[0]
        } else {
            logo_file = alreadyUploadLogo == '' ? 'empty_logo' : 'already_uploaded_logo';
        }
        formData.append('logo', logo_file)
        formData.append('from', from)


        fetch(saveUrl, {
            method: "POST",
            body: formData
        }).
            then((response) => response.json())
            .then((data) => {

                if (data.success) {
                    let redirect = route('email', query);
                    if (id) {
                        redirect = route('user-email-settings' + id, query);
                    }
                    toggleActive()
                    setTimeout(() => {

                        router.get(redirect);
                    }, 3000);

                    //alert('save settings successfully');
                    //successToast();
                }
            })


    };
    const editorRef = useRef(null);
    const log = () => {
        if (editorRef.current) {
            console.log(editorRef.current.getContent());
        }
    };
    const [htmlContent, setHtmlContent] = useState(`<p>Hello {{name}},</p>
    <p><br>The feedback of our customers about our products is extremely valuable to us.</p>
    <p><br>That's why we would like to offer you a {{amount}} gift card to our store in exchange for a video where you share your opinion about our products.</p>`);

    const handleEditorChange = () => {
        setContent(content);
    };

    const createUrl = (url, paramsObj) => {
        const params = new URLSearchParams(window.location.search);
        for (const [key, value] of Object.entries(paramsObj)) {
            params.set(key, value);
        }
        return `${url}?${params.toString()}`;
    };


    useEffect(() => {
        let url = ''
        if (id) {
             url = route('single-fetch-user-email-settings', { id: id, type: 'Post_Purchase' });
        }else{
            console.log('useEffect post purchase email');
             url = route('fetch-email-settings', query);
        }
        fetch(url, {
            method: "GET",
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Something went wrong");
            }
            return response.json();
        }).then((data) => {
            if (data.success) {
                setSubject(data.data.template.subject);
                setButtonText(data.data.template.btn_text);
                setButtonColorHex(data.data.template.btn_color);
                setHtmlContent(data.data.template.body);
                setAlreadyUploadedLogo(data.data.template.logo);
                setFrom(data.data.template.from);
                //setFiles([data.data.template.logo])
                //setAlreadyUploadedLogo(data.data.template.logo);

                console.table(data.data.template.logo);
            }

            //    console.log("data");
            //    console.log(data);
        }).catch((error) => {
            console.log(error);
        });



    }, []);
    const buttonHtml = `<button style="font-size: 15px;background: ${buttonColorHex};color: rgb(255, 255, 255);border: none;border-radius: 4px;display: block;margin: 0px auto ;padding: 16px 30px;border-radius: 25px;" >${buttonText}</button>`;
    const processedContent = content.replace('{{button}}', buttonHtml);
    // popover code start
    const [popoverActive, setPopoverActive] = useState(false);

    const togglePopoverActive = useCallback(
        () => setPopoverActive((popoverActive) => !popoverActive),
        [],
    );

    const activator = (
        <button
            style={{
                marginRight: "10px",
                background: "none",
                border: "none",
            }}
            onClick={togglePopoverActive}
        >
            <img
                className="colorWheel"
                src={ColorWheel}
                style={{
                    marginTop: "3px",
                    marginLeft: "4px",
                }}
            ></img>
        </button>
    );
    // popover code end
    return (
        <div >

            <Page>
                <Frame>
                    <Grid>
                        <Grid.Cell
                            columnSpan={{
                                xs: 6,
                                sm: 6,
                                md: 6,
                                lg: 12,
                                xl: 12,
                            }}
                        >
                            <div onClick={() => {
                                if (id) {
                                    router.get(route('user-email-settings' + id, query));
                                }
                                else {
                                    router.get(route('email', query));
                                }
                            }} style={{ display: "flex", marginLeft: "10px", marginBottom: "10px", cursor: "pointer" }}>
                                <div><img src={backIcon} style={{ marginTop: "4px", }}></img></div>
                                <p style={{ fontSize: "16px", fontWeight: "500", marginLeft: "8px", marginBottom: "4px" }}>Emails</p>
                            </div>
                            <Card sectioned>
                                <Grid>
                                    <Grid.Cell
                                        columnSpan={{
                                            xs: 6,
                                            sm: 6,
                                            md: 6,
                                            lg: 8,
                                            xl: 8,
                                        }}
                                    >
                                        <Text variant="headingLg" as="h5">
                                            Post Purchase Email
                                        </Text>
                                        <p style={{ marginTop: "5px" }}>
                                            Design the post purchase emails sent by GoodAuthentic
                                        </p>
                                        <div style={{ width: "472px" }}>
                                            <p style={{ marginTop: "20px", marginBottom: "10px", fontWeight: "500", fontSize: "18px" }}>
                                                Header Image
                                            </p>
                                            <DropZone onDrop={handleDropZoneDrop} variableHeight allowMultiple={false}>
                                                {uploadedFiles}
                                                {fileUpload}
                                            </DropZone>

                                            <p style={{ color: "#9A9A9A", marginTop: "10px", marginBottom: "20px" }}>
                                                You can upload an image in JPG, PNG up to 5MB. Email banner will be displayed in 500px width, for best results, upload an image between 500-1200px wide.
                                            </p>
                                            {uploadedFilesPreview}
                                            {(!files.length && alreadyUploadLogo) &&

                                                <div style={{ padding: '0' }}>
                                                    <div style={{ width: "60px", marginBottom: "10px" }} >
                                                        <Thumbnail
                                                            size="medium"
                                                            alt="img"
                                                            source={alreadyUploadLogo}
                                                        />
                                                        <div onClick={handleRemoveAlreadyUploadedLogo} >
                                                            {
                                                                activeTootlTip ? <Tooltip content="This is default setting. You can not change it.">
                                                                    <Icon source={CircleCancelMajor} color="critical" />

                                                                </Tooltip> : <Icon source={CircleCancelMajor} color="critical" />
                                                            }

                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        <Text variant="headingLg" as="h5">
                                            Body Text
                                        </Text>
                                        <p style={{ fontSize: "15px", marginTop: "20px", marginBottom: "10px", fontWeight: "500" }}>Email Name</p>
                                        <TextField

                                            placeholder=""
                                            value={from}
                                            onChange={(e) => setFrom(e)}
                                            autoComplete="off"
                                        />
                                        <p style={{ fontSize: "15px", marginTop: "20px", marginBottom: "10px", fontWeight: "500" }}>Email Subject </p>
                                        <TextField

                                            placeholder="Win a {{amount}} gift card by sharing your experience with us!"
                                            value={subject}
                                            onChange={(e) => setSubject(e)}
                                            autoComplete="off"
                                        />

                                        <p style={{ color: "#9A9A9A", marginTop: "20px", }}>
                                            Variables:
                                        </p>

                                        <p style={{ color: "#9A9A9A", }}>
                                            Use &#123;&#123;name&#125;&#125; to display the customer's first name
                                        </p>

                                        <p style={{ color: "#9A9A9A", }}>
                                            Use &#123;&#123;button&#125;&#125; to display the call-to-action button
                                        </p>
                                        <p style={{ fontSize: "15px", marginTop: "20px", marginBottom: "10px", fontWeight: "500" }}>Content</p>

                                        <Editor
                                            apiKey='hqm26nvds57hdfxpid020b1eoxyt6py4dbngc1zww0704kh3'
                                            onInit={(evt, editor) => editorRef.current = editor}
                                            initialValue={htmlContent}
                                            init={{
                                                height: 500,
                                                menubar: false,
                                                plugins: [
                                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                ],
                                                toolbar: 'undo redo | blocks | ' +
                                                    'bold italic forecolor | alignleft aligncenter ' +
                                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                                    'removeformat | help',
                                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                            }}
                                        />
                                        <p style={{ fontSize: "15px", marginTop: "20px", marginBottom: "10px", fontWeight: "500" }}>Button Text(Linked to Landing Page)</p>
                                        <TextField

                                            placeholder="Record Video"
                                            value={buttonText}
                                            onChange={(e) => setButtonText(e)}

                                        />
                                        <p style={{ fontSize: "15px", marginTop: "20px", marginBottom: "10px", fontWeight: "500" }}>Button Color</p>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <Popover
                                                active={popoverActive}
                                                activator={activator}
                                                autofocusTarget="first-node"
                                                onClose={togglePopoverActive}
                                            >
                                                <div style={{ padding: "20px" }}>
                                                    <ColorPicker
                                                        onChange={(e) => {
                                                            // console.log(hsbToRgb(e));
                                                            setButtonColor(e);
                                                            setButtonColorHex(
                                                                hsbToHex(e)
                                                            );
                                                            setGradientCheck(false);
                                                        }}
                                                        color={buttonColor}
                                                    />
                                                    <div style={{ marginTop: "20px" }}></div>
                                                    <TextField
                                                        value={buttonColorHex}
                                                        onChange={handleInputColorChange}
                                                    />
                                                </div>
                                            </Popover>
                                            <div
                                                style={{
                                                    background: `${buttonColorHex}`,
                                                }}
                                                className="colorOptions"
                                            ></div>
                                        </div>

                                        <div style={{ display: "flex", marginTop: "20px" }}>
                                            <Button onClick={() => {
                                                setActive(true);
                                                console.log(editorRef.current.getContent());
                                                setContent(editorRef.current.getContent());
                                            }}>Preview Template</Button>
                                            <span style={{ marginRight: "10px" }}></span>
                                            <div className="polaris-black-btn-global">

                                                <Button onClick={handleSaveEmailSettings} primary>Save</Button>
                                            </div>
                                        </div>
                                    </Grid.Cell>
                                </Grid>
                            </Card>
                            <div style={{ marginBottom: "200px" }}></div>
                        </Grid.Cell>
                    </Grid>
                    <Modal
                        open={active}
                        onClose={handleChange}
                        title="Sample email"

                    >
                        <Modal.Section>
                            <div className="previewModel">
                                <div style={{ background: "#fff", borderRadius: "15px", paddingTop: "20px" }}>
                                    {/* <img style={{ display: "block", margin: "auto", marginTop: "20px", marginBottom: "20px" }} src={logo}></img> */}
                                    {files.map((file, index) => (
                                        <div key={index}>
                                            <img
                                                style={{ display: "block", margin: "auto", marginTop: "20px", marginBottom: "20px", maxWidth: "250px" }}
                                                alt={file.name}
                                                src={
                                                    validImageTypes.includes(file.type)
                                                        ? window.URL.createObjectURL(file)
                                                        : NoteMinor
                                                }
                                            />
                                        </div>
                                    ))}

                                    {files.length <= 0 && <img
                                        style={{ display: "block", margin: "auto", marginTop: "20px", marginBottom: "20px", maxWidth: "250px", }}

                                        src={alreadyUploadLogo} />}
                                    <div className="previewEditor">
                                        <Editor
                                            apiKey='your-api-key'
                                            value={processedContent}
                                            onEditorChange={handleEditorChange}
                                            init={{
                                                readonly: true,
                                                height: 500,
                                                menubar: false,
                                                toolbar: false
                                            }}
                                        />
                                    </div>

                                </div>
                            </div>
                        </Modal.Section>
                    </Modal>
                    {toastMarkup && toastMarkup}
                </Frame>
            </Page>
        </div>
    );
};

export default PostPurchaseEmail;
