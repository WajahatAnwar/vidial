import React, { useEffect } from "react";
import {
    Page,
    hex,
    hsbToHex,
    hsbToRgb,
    hslToRgb,
    rgbToHsb,
    Card,
    Button,
    Select,
    Icon,
    Grid,
    Banner,
    RadioButton,
    TextField,
    ColorPicker,
    Spinner
} from "@shopify/polaris";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    DropZone,
    Stack,
    Thumbnail,
    Text,
    Frame,
    Toast,
    List,
} from "@shopify/polaris";
import { CircleCancelMinor, NoteMinor } from "@shopify/polaris-icons";
import { useCallback } from "react";
import UploadIcon from "./imges/uploadLogo.png";
import ErrorIcon from "./imges/error.png";
import DellIcon from "./imges/dellIcon.png";
import ColorWheel from "./imges/collorWheel.png";
import Toggle from "./Toggle";
const Settings = () => {
    const [title, setTitle] = useState('');
  const handleTitle = useCallback((newValue) => setTitle(newValue), []);
    const [active, setActive] = useState(false);
    const [error, setError] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const [toggled, setToggled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [storeCurrency, setStoreCurrency] = useState("");

    function handleChange() {
        setToggled(prevCheck => !prevCheck)
    }

    const toastMarkup = active ? (
        <Toast content="Settings Added Successfully" onDismiss={toggleActive} />
    ) : null;
    const [selected, setSelected] = useState("en");

    //const handleSelectChange = useCallback((value) => setSelected(value), ["english"]);
    const handleSelectChange = useCallback(
        (value) => {
            setSelected(value);
            // save Locale into DB
            fetch("/saveLocale", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ value }),
            })
                .then((response) => response.json())
                .then((data) => console.log(data))
                .catch((error) => console.error(error));
        },
        ["english"]
    );
    const options = [
        { label: "English", value: "en" },
        { label: "French", value: "fr" },
        { label: "Spanish  ", value: "es" },
        { label: "Portuguese", value: "pt" },
        { label: "Italian", value: "it" },
        { label: "German", value: "de" },
    ];

    const [priceValue, setPriceValue] = useState("50");

    const priceValueHandler = useCallback((value) => setPriceValue(value), []);
    const [landingPageValue, setLandingPage] = useState("12");

    const landingPageHandler = useCallback(
        (value) => setLandingPage(value),
        []
    );
    const [emailSentToValue, setEmailSentToValue] = useState("2");

    const emailSentToValueHandler = useCallback(
        (value) => setEmailSentToValue(value),
        []
    );
    const [landingPageDisplayedValue, setLandingPageDisplayedValue] =
        useState("5");

    const landingPageDisplayedValueHandler = useCallback(
        (value) => setLandingPageDisplayedValue(value),
        []
    );
    const [instructionFieldValue, setinstructionFieldValue] = useState(
        "Record a video off up to 30 seconds"
    );

    const handleInstructionFieldChange = useCallback(
        (value) => setinstructionFieldValue(value),
        []
    );
    // add row code start
    const [rows, setRows] = useState([
        { id: 1, value: "Record a video off up to 30 seconds" },
        { id: 2, value: "Share your genuine experience of the product" },
        { id: 3, value: "Showcase the product" },
        { id: 4, value: "Tell why you've decided to try JihiyiStore" },
        { id: 5, value: "Describe the main benefits of JihiyiStore" },
    ]);

    const handleAddRow = () => {

        setRows([
            ...rows,
            { id: (rows[rows.length - 1]?.id ?? 0) + 1, value: "" },
        ]);
    };

    const handleRemoveRow = (id) => {
        setRows(rows.filter((row) => row.id !== id));
    };
    const handleTextChange = (e, index) => {
        let temp = [...rows];

        temp[index] = { ...temp[index], value: e };

        setRows(temp);
    };
    // add row code end

    const [buttonColorHide, setButtonColorHide] = useState(false);
    const [buttonColorHex, setButtonColorHex] = useState("#000000");
    const [buttonColor, setButtonColor] = useState({
        hue: 0,
        brightness: 0,
        saturation: 0,
    });
    const [gradientCheck, setGradientCheck] = useState(false);
    const [logoImage, setLogoImage] = useState("");
    const [video, setVideo] = useState("");
    const [store, setStore] = useState("");
    const [baseUrl, setBaseUrl] = useState(
        "https://phpstack-953879-3323622.cloudwaysapps.com"
    );
    const [imagename, setImagename] = useState("");
    const [videoname, setVideoname] = useState("");

    // alert(logoImage);
    const logoHandler = (e) => {
        setImagename(e.target.files[0].name);
        // imagename
        setLogoImage(e.target.files[0]);
    };
    const videoHandler = (e) => {
        setVideoname(e.target.files[0].name)
        setVideo(e.target.files[0]);
    };

    // Review Landing Page
    const reviewPage = (store) => {
        window.open(baseUrl + "/landingPage/" + selected + "?store=" + store);
    };
    /********  get Settings Data  ******/
    useEffect(() => {
        fetch("/get_settings")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    setPriceValue(data.data.store_credit);
                    setLandingPage(data.data.page_display_to_customers);
                    setEmailSentToValue(data.data.email_sent_to_customer);
                    setLandingPageDisplayedValue(data.data.page_link);
                    setRows(data.data.instructions ? data.data.instructions : []);
                    setLogoImage(data.data.logo);
                    setVideo(data.data.video);
                    setStore(data.data.store);
                    setSelected(data.data.locale);
                    setStoreCurrency(data.data.store_currency)
                }
            })
            .catch((error) => {
                console.log(error.message());
            });
    }, []);
    /******** save settings into DB ******/
    const saveSettings = (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();

        formData.append("store_credit", priceValue);
        formData.append("page_display_to_customers", landingPageValue);
        formData.append("email_sent_to_customer", emailSentToValue);
        formData.append("page_link", landingPageDisplayedValue);
        formData.append("instructions", JSON.stringify(rows));
        formData.append("page_color", buttonColorHex);
        formData.append("logo", logoImage);
        formData.append("video", video);
        formData.append("setting_status", toggled);
        if (
            (priceValue == "" ||
                landingPageValue == "" ||
                emailSentToValue == "" ||
                landingPageDisplayedValue == "" ||
                rows == "",
                logoImage == "")
        ) {
            setError(true);
        } else {
            setError(false);
            // Generating request for sending Data to the server
            fetch("/save_settings", {
                method: "post",

                body: formData,
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Something went wrong");
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.success) {
                        setIsLoading(false)
                        toggleActive();
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };



    function handletestemail() {
        fetch('/send_test_email', {
            method: "GET",
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Something went wrong');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert("Email Sent Sucessfully");
                }
            })
            .catch(error => {
                console.log(error);
            });


    }

    // copy Landing Page Link
    const copyLandingPageLink = () => {
        console.log("working ");
        const landingPageDisplayedValue =
            baseUrl + "/landingPage/" + selected + "?store=" + store;
        navigator.clipboard.writeText(landingPageDisplayedValue);
        toastMarkup && toastMarkup.show();
    };
    return (

        <div>
            {isLoading ?
                <div>
                    <Spinner accessibilityLabel="Spinner example" size="large" />
                </div>
                :
                <Page>
                    <Frame>
                        <Grid>
                            <Grid.Cell
                                columnSpan={{ xs: 6, sm: 6, md: 6, lg: 12, xl: 12 }}
                            >
                                {error && (
                                    <Card sectioned>
                                        <Banner>
                                            <List type="bullet">
                                                {priceValue.length <= 0 && (
                                                    <List.Item>
                                                        Store Credit Field is required
                                                    </List.Item>
                                                )}
                                                {landingPageValue.length <= 0 && (
                                                    <List.Item>
                                                        Customer Display Field is
                                                        required
                                                    </List.Item>
                                                )}
                                                {emailSentToValue.length <= 0 && (
                                                    <List.Item>
                                                        Email Field is required
                                                    </List.Item>
                                                )}
                                                {landingPageDisplayedValue.length <=
                                                    0 && (
                                                        <List.Item>
                                                            Landing Page Field is required
                                                        </List.Item>
                                                    )}
                                                {rows.length <= 0 && (
                                                    <List.Item>
                                                        Instruction Required
                                                    </List.Item>
                                                )}
                                                {logoImage.length <= 0 && (
                                                    <List.Item>
                                                        Logo image is required
                                                    </List.Item>
                                                )}
                                            </List>
                                        </Banner>
                                    </Card>
                                )}
                                <Card sectioned>
                                    <Text variant="headingXl" as="h4">
                                        Language
                                    </Text>
                                    <p
                                        style={{
                                            marginTop: "5px",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        Select the language of your store
                                    </p>

                                    <div style={{ width: "150px" }}>
                                        <Select
                                            options={options}
                                            onChange={handleSelectChange}
                                            value={selected}
                                        />
                                    </div>
                                </Card>
                                {toastMarkup}
                                <Card sectioned>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <div style={{  }}>
                                            <Text variant="headingLg" as="h5">
                                                What amount of store credit would you offer to the customers for the usage of their UGC videos?
                                            </Text>
                                            <p style={{ marginTop: "15px" }}>
                                                We recommend offering a minimum of {storeCurrency} 50 to improve response rates.
                                                This can be adjusted as necessary, with not set minimum limit in place.
                                            </p>
                                        </div>
                                        <div className="textFieldjoin"
                                            style={{ marginLeft:"204px",width: "200px", textAlign: "end",display:"flex",alignItems:"center" }}
                                        >
                                            <div className="Polaris-TextField__Prefix prefixCustom">
                                                {storeCurrency}
                                            </div>
                                            <TextField
                                                value={priceValue}
                                                onChange={priceValueHandler}
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                </Card>
                                <Card sectioned>


                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        <div style={{ width: "450px" }}>
                                            <Text variant="headingLg" as="h5">
                                            Set up Emails
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                            Choose the time to send the first email to your customers
                                            </p>
                                        </div>
                                        <div
                                            style={{ width: "170px", textAlign: "end" }}
                                        >
                                            <Toggle toggled={toggled} onClick={handleChange} />

                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        <div style={{ width: "550px" }}>
                                            <Text variant="headingLg" as="h5">
                                            Post Purchase Emails Sent To Customers
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                            Choose the time to send the first email to your customers
                                            </p>
                                        </div>
                                        <div className="textFieldjoinRight"
                                            style={{ marginLeft:"204px",width: "103px", textAlign: "end",display:"flex",alignItems:"center" }}
                                        >

                                            <TextField
                                                value={landingPageDisplayedValue}
                                                onChange={
                                                    landingPageDisplayedValueHandler
                                                }
                                                autoComplete="off"
                                            />
                                            <div className="Polaris-TextField__Prefix prefixCustomRight">
                                                days
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        <div style={{ width: "550px" }}>
                                            <Text variant="headingLg" as="h5">
                                            Reminder Emails Sent To Customers
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                            Choose the delay between each reminder emails (we’ll send emails each defined weeks)
                                            </p>
                                        </div>
                                        <div className="textFieldjoinRight"
                                            style={{ marginLeft:"204px",width: "103px", textAlign: "end",display:"flex",alignItems:"center" }}
                                        >
                                            <TextField
                                                value={emailSentToValue}
                                                onChange={emailSentToValueHandler}

                                                autoComplete="off"
                                            />
                                            <div className="Polaris-TextField__Prefix prefixCustomRight">
                                            weeks
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <div style={{ width: "550px" }}>
                                            <Text variant="headingLg" as="h5">
                                            Maximum Sent Emails To Customers
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                            Choose the maximum of emails you want to send to your customers
                                            </p>
                                        </div>
                                        <div className="textFieldjoinRight"
                                            style={{ marginLeft:"204px",width: "103px", textAlign: "end",display:"flex",alignItems:"center" }}
                                        >
                                            <TextField
                                                value={landingPageValue}
                                                onChange={landingPageHandler}
                                                autoComplete="off"
                                            />
                                            <div className="Polaris-TextField__Prefix prefixCustomRight">
                                            emails
                                            </div>
                                        </div>
                                    </div>
                                </Card>



                                <Card sectioned>
                                    <Text variant="headingXl" as="h4">
                                        Landing Page Customization
                                    </Text>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginTop: "20px",
                                        }}
                                    >
                                        <div style={{ width: "450px" }}>
                                            <Text variant="headingLg" as="h5">
                                                Your Store Logo
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                                Should be a PNG file, not bigger than 1
                                                MB.
                                            </p>
                                        </div>
                                        <div style={{ textAlign: "end" }}>
                                            <div class="upload-btn-wrapper">
                                                <button class="btnCustomUpload">
                                                    <img
                                                        style={{ marginRight: "10px" }}
                                                        src={UploadIcon}
                                                    ></img>
                                                    Upload Your Logo
                                                </button>
                                                <input
                                                    type="file"
                                                    name="myfile"
                                                    onChange={logoHandler}
                                                />
                                            </div>
                                            <p>{`${imagename}`} {imagename && <span>Uploaded</span>} </p>
                                        </div>
                                    </div>
                                    <div style={{ width: "450px",marginTop:"30px" }}>
                                            <Text variant="headingLg" as="h5">
                                            Instructions
                                            </Text>
                                            <p style={{ marginTop: "5px",marginBottom:"5px" }}>
                                                Instructions Title
                                            </p>
                                            <TextField
                                                value={title}
                                                onChange={handleTitle}
                                                autoComplete="off"
                                                />
                                        </div>
                                        <p style={{ marginTop: "20px",marginBottom:"5px" }}>
                                        You may adjust these instructions according to the needs of your Store.
                                            </p>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginTop: "20px",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        <img
                                            src={ErrorIcon}
                                            style={{ marginRight: "12px" }}
                                        ></img>
                                        <div>
                                            <p>
                                                Be very clear about what your costumers
                                                should video.
                                            </p>
                                            <p>
                                                Keep it simple, with minimum
                                                instructions as possible.
                                            </p>
                                        </div>
                                    </div>
                                            <p>
                                            Instructions Steps
                                            </p>
                                    {rows && rows.map((row, index) => (
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr .3fr",
                                                marginTop: "10px",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            <div>
                                                <TextField
                                                    value={row.value}
                                                    onChange={(e) =>
                                                        handleTextChange(e, index)
                                                    }
                                                />
                                            </div>
                                            <div style={{ marginLeft: "10px" }}>
                                                <div
                                                    onClick={() =>
                                                        handleRemoveRow(row.id)
                                                    }
                                                >
                                                    <img src={DellIcon}></img>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ marginTop: "20px" }}>
                                        <Button primary onClick={handleAddRow}>
                                            Add another instruction
                                        </Button>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginTop: "20px",
                                        }}
                                    >
                                        <div style={{ width: "500px" }}>
                                            <Text variant="headingLg" as="h5">
                                                Inspirational Video (optional)
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                                Add a video for your customers to get
                                                inspired and make a UGC almost similar.
                                            </p>
                                        </div>
                                        <div style={{ textAlign: "end" }}>
                                            <div class="upload-btn-wrapper">
                                                <button class="btnCustomUpload">
                                                    <img
                                                        style={{ marginRight: "10px" }}
                                                        src={UploadIcon}
                                                    ></img>
                                                    Upload Your Video
                                                </button>
                                                <input
                                                    type="file"
                                                    name="myvideoFile"
                                                    onChange={videoHandler}
                                                />
                                            </div>
                                            <p>{`${videoname}`} {videoname && "uploaded"}  </p>

                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginTop: "20px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "450px",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            <Text variant="headingLg" as="h5">
                                                Button Colours
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                                Choose the branding color of your
                                                landing page.
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: "none",
                                                border: "5px solid #24A3E1",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#FF4A4B" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#FF5175" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#E91E62" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#EB0045" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#D70049" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#FF59DE" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#FF98F7" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#9C27B0" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#673AB6" }}
                                            className="colorOptions"
                                        ></div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        <div
                                            style={{ background: "#3F50B5" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#0D0083" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#2096F3" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#3CBAFA" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#74D4FF" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#00BCD4" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#009688" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#01B780" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#03D39C" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#4CAF4F" }}
                                            className="colorOptions"
                                        ></div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        <div
                                            style={{ background: "#AEFF14" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#FFDB91" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#FFBA00" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#FF9800" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#FFA383" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#D64C1E" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#795548" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#ACACAC" }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            style={{ background: "#000000" }}
                                            className="colorOptions"
                                        ></div>
                                        <button
                                            style={{
                                                marginRight: "10px",
                                                background: "none",
                                                border: "none",
                                            }}
                                            onBlur={() => {
                                                setButtonColorHide(!buttonColorHide);
                                                setGradientCheck(false);
                                            }}
                                            onClick={() => {
                                                setButtonColorHide(!buttonColorHide);
                                                setGradientCheck(false);
                                                setReload(!reload);
                                            }}
                                        >
                                            <img
                                                className="colorWheel"
                                                src={ColorWheel}
                                                style={{ marginTop: "3px" }}
                                            ></img>
                                        </button>
                                        {buttonColorHide && (
                                            <div
                                                className="buttonColorPicker"
                                                style={{
                                                    marginTop: "166px",
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
                                                        setButtonColorHex(hsbToHex(e));
                                                        setGradientCheck(false);
                                                    }}
                                                    color={buttonColor}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>
                                <Card sectioned>
                                <div>
                                            <Text variant="headingLg" as="h5">
                                            Preview
                                            </Text>
                                            <p
                                                style={{
                                                    marginTop: "5px",
                                                    marginBottom: "20px",
                                                }}
                                            >
                                                Here’s what your customers will see and receive by email
                                            </p>
                                        </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",

                                        }}
                                    >
                                        <div>
                                            <Text variant="headingLg" as="h5">
                                            Preview Landing Page
                                            </Text>
                                            <p
                                                style={{
                                                    marginTop: "5px",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                Here’s the Landing Page that your users will see
                                            </p>
                                        </div>
                                        <div
                                            style={{ width: "200px", textAlign: "end" }}
                                        >
                                            <Button
                                                primary
                                                onClick={() => {
                                                    reviewPage(store);
                                                }}
                                            >
                                                View The Landing Page
                                            </Button>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <div>
                                            <Text variant="headingLg" as="h5">
                                                Landing Page Link
                                            </Text>
                                            <p
                                                style={{
                                                    marginTop: "5px",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                Share the landing page link with your customers to get them to send UGC videos
                                            </p>
                                        </div>
                                        <div
                                            style={{ width: "200px", textAlign: "end" }}
                                        >
                                            <Button
                                                primary
                                                onClick={() => copyLandingPageLink()}
                                            >
                                                Copy Landing Page Link
                                            </Button>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        <div>
                                            <Text variant="headingLg" as="h5">
                                            Email Sent To Customers
                                            </Text>
                                            <p
                                                style={{
                                                    marginTop: "5px",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                We'll send a test email to (STORE EMAIL)
                                            </p>
                                        </div>
                                        <div
                                            style={{ width: "200px", textAlign: "end" }}
                                        >
                                            <Button primary onClick={handletestemail}>Send Test Email</Button>
                                        </div>
                                    </div>

                                </Card>
                                <div
                                    style={{
                                        textAlign: "center",
                                        marginTop: "20px",
                                        marginBottom: "100px",
                                    }}
                                >
                                    <Button primary onClick={saveSettings} disabled={isLoading}>
                                        Save Settings
                                    </Button>
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </Frame>
                </Page>}
        </div>
    );
};

export default Settings;
