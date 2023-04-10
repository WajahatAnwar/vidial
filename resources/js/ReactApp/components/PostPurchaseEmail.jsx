import React, { useEffect, useRef } from "react";
import {
    hex,
    hsbToHex,
    hsbToRgb,
    hslToRgb,
    rgbToHsb,
    Page,
    Card,
    Button,
    Select,
    Icon,
    Grid,
    Modal,
    Banner,
    RadioButton,
    TextField,
    ColorPicker,
    Spinner,
    Collapsible,
} from "@shopify/polaris";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    DropZone,
    Stack,
    Thumbnail,
    LegacyStack,
    Text,
    Frame,
    Toast,
    List,
} from "@shopify/polaris";
import { CircleCancelMinor, NoteMinor, CircleCancelMajor, ChevronUpMinor, ChevronLeftMinor } from "@shopify/polaris-icons";
import {
    DeleteMajor
} from '@shopify/polaris-icons';
import { useCallback } from "react";
import UploadIcon from "./imges/uploadLogo.png";
import ErrorIcon from "./imges/error.png";
import DellIcon from "./imges/dellIcon.png";
import ColorWheel from "./imges/collorWheel.png";
import ChevronUp from "./imges/ChevronUpMinor.png";
import logo from "./imges/vidialLogoPower.png";
import arrowRight from "./imges/arrowRight.png";
import backIcon from "./imges/backIcon.png";
import Toggle from "./Toggle";
import { showStoreName } from "./utils";
import CrispChat from 'react-crisp';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

/**
const urlParams = new URLSearchParams(location.search);
const shopParam = urlParams.get('shop');
const storeName = shopParam.split('.')[0];
localStorage.setItem('store',storeName);
*/

const PostPurchaseEmail = () => {
  
    const navigate = useNavigate();
    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);
    const [content, setContent] = useState('');
    const [subject, setSubject] = useState('');
    const [buttonText, setButtonText] = useState('Leave a video review');
    const [notes1, setNotes1] = useState(`Use {{order_number}} for the customer’s order number`);
    const [notes2, setNotes2] = useState(`Use {{name}} or {{last_name}} as a placeholder for the user’s first or last name`);
    const [notes3, setNotes3] = useState(`Use {{amount}} for the store credit you are offering to your customers`);
    const [contentPlaceholder, setContentPlaceholder] = useState(``);


    // drop zone code start
    const [files, setFiles] = useState([]);

    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) =>
            setFiles((files) => [...files, ...acceptedFiles]),
        [],
    );
    const successToast = active ? (
        <Toast content="Settings Saved" onDismiss={true} />
    ) : null;

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
    const handleSaveEmailSettings = () => {
        
        setContent(editorRef.current.getContent());
        const formData = new FormData();
        formData.append('subject',subject);
        formData.append('buttonText', buttonText);
        formData.append('buttonColorHex', buttonColorHex);
        formData.append('body',editorRef.current.getContent());
        formData.append('type', 'Post_purchase')
        formData.append('logo', files[0])
       
            fetch('/save-email-settings',{
                method:"POST",
                body:formData
            }).
            then((response)=>response.json())
            .then((data)=>{
                if(data.success){
                    alert('save settings successfully');
                    //successToast();
                }
            })
           
        
    };
    const editorRef = useRef(null);
    const [htmlContent, setHtmlContent] = useState(`<p>Hello {{name}},</p>
    <p><br>The feedback of our customers about our products is extremely valuable to us.</p>
    <p><br>That's why we would like to offer you a {{amount}} gift card to our store in exchange for a video where you share your opinion about our products.</p>`);

    const handleEditorChange = (content, _) => {
        setHtmlContent(content);
    };

    useEffect(() => {
        fetch("/fetch-email-settings?type=Post_Purchase", {
            method: "GET",
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Something went wrong");
            }
            return response.json();
        }).then((data) => {
            setSubject(data.data.template.subject);
            setButtonText(data.data.template.btn_text);
            setButtonColorHex(data.data.template.btn_color);
            setHtmlContent(data.data.template.body);
            //setFiles(data.data.template.logo)

            //    console.log("data");
            //    console.log(data);
        }).catch((error) => {
            console.log(error);
        });



    }, []);

    return (
        <div>

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
                                navigate("/settings");
                            }} style={{ display: "flex", marginLeft: "10px", marginBottom: "10px", cursor: "pointer" }}>
                                <div><img src={backIcon} style={{ marginTop: "4px", }}></img></div>
                                <p style={{ fontSize: "16px", fontWeight: "500", marginLeft: "8px", marginBottom: "4px" }}>Settings</p>
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
                                            Customize all the emails your customers will receive.
                                        </p>
                                        <div style={{ width: "472px" }}>
                                            <p style={{ marginTop: "20px", marginBottom: "10px", fontWeight: "500", fontSize: "18px" }}>
                                                Header Logo
                                            </p>
                                            <DropZone onDrop={handleDropZoneDrop} variableHeight>
                                                {uploadedFiles}
                                                {fileUpload}
                                            </DropZone>
                                            <p style={{ color: "#9A9A9A", marginTop: "10px", marginBottom: "20px" }}>
                                                You can upload an image in JPG, PNG up to 5MB. Email banner will be displayed in 500px width, for best results, upload an image between 500-1200px wide.
                                            </p>
                                        </div>
                                        <Text variant="headingLg" as="h5">
                                            Texts
                                        </Text>
                                        <p style={{ fontSize: "15px", marginTop: "20px", marginBottom: "10px", fontWeight: "500" }}>Subject</p>
                                        <TextField

                                            placeholder="Win a {{amount}} gift card by sharing your experience with us!"
                                            value={subject}
                                            onChange={(e) => setSubject(e)}
                                            autoComplete="off"
                                        />
                                        <p style={{ color: "#9A9A9A", marginTop: "20px", }}>
                                            Notes:
                                        </p>
                                        <p style={{ color: "#9A9A9A", }}>
                                            {notes1}
                                        </p>
                                        <p style={{ color: "#9A9A9A", }}>
                                            {notes2}
                                        </p>
                                        <p style={{ color: "#9A9A9A", marginBottom: "10px" }}>
                                            {notes3}
                                        </p>
                                        <p style={{ fontSize: "15px", marginTop: "20px", marginBottom: "10px", fontWeight: "500" }}>Content</p>

                                        <Editor
                                            apiKey='your-api-key'
                                            onInit={(evt, editor) => editorRef.current = editor}
                                            onEditorChange={handleEditorChange}
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
                                        <p style={{ fontSize: "15px", marginTop: "20px", marginBottom: "10px", fontWeight: "500" }}>Button Text</p>
                                        <TextField

                                            placeholder="Leave a video review"
                                            value={buttonText}
                                            onChange={(e) => setButtonText(e)}

                                        />
                                        <p style={{ fontSize: "15px", marginTop: "20px", marginBottom: "10px", fontWeight: "500" }}>Button Color</p>
                                        <button
                                            style={{
                                                marginRight: "10px",
                                                background: "none",
                                                border: "none",
                                            }}
                                            onClick={() => {
                                                setButtonColorHide(
                                                    !buttonColorHide
                                                );
                                                setGradientCheck(false);

                                            }}
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
                                        {buttonColorHide && (
                                            <div
                                                className=""
                                                style={{
                                                    position: "absolute",
                                                    backgroundColor: "white",
                                                    padding: "20px",
                                                    boxShadow:
                                                        "0px 0px 6px -1px rgba(0,0,0,0.46)",
                                                    zIndex: "9999",
                                                    borderRadius: "8px",
                                                }}
                                            >
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

                                        )}
                                        <div style={{ display: "flex", marginTop: "20px" }}>
                                            <Button onClick={handleChange}>Preview Template</Button>
                                            <span style={{ marginRight: "10px" }}></span>
                                            <Button onClick={handleSaveEmailSettings} primary>Save</Button>
                                        </div>
                                    </Grid.Cell>
                                </Grid>
                            </Card>
                        </Grid.Cell>
                    </Grid>
                    <Modal
                        open={active}
                        onClose={handleChange}
                        title="Sample email"

                    >
                        <Modal.Section>
                            <div>
                                <Card sectioned>
                                    {/* <img style={{ display: "block", margin: "auto", marginTop: "20px", marginBottom: "20px" }} src={logo}></img> */}
                                    {files.map((file, index) => (
                                        <div key={index}>
                                            <img
                                                style={{ display: "block", margin: "auto", marginTop: "20px", marginBottom: "20px" }}
                                                alt={file.name}
                                                src={
                                                    validImageTypes.includes(file.type)
                                                        ? window.URL.createObjectURL(file)
                                                        : NoteMinor
                                                }
                                            />
                                        </div>
                                    ))}
                                    <div dangerouslySetInnerHTML={{ __html: htmlContent }}></div>
                                    <div style={{ marginTop: "50px" }}></div>
                                    <button style={{ fontSize: "18px", background: buttonColorHex, color: "#fff", border: "none", borderRadius: "4px", display: "block", margin: "50px auto", padding: "8px 80px" }}>{buttonText}</button>
                                </Card>
                            </div>
                        </Modal.Section>
                    </Modal>
                </Frame>
            </Page>
        </div>
    );
};

export default PostPurchaseEmail;
