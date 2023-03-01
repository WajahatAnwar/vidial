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
    const [active, setActive] = useState(false);
    const [error, setError] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);

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
        "https://983f-2400-adc5-1b3-b500-f860-f03e-ddb-3823.in.ngrok.io"
    );
    const logoHandler = (e) => {
        setLogoImage(e.target.files[0]);
    };
    const videoHandler = (e) => {
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
                    setRows(data.data.instructions);
                    setLogoImage(data.data.logo);
                    setVideo(data.data.video);
                    setStore(data.data.store);
                    setSelected(data.data.locale);
                }
            })
            .catch((error) => {
                console.log(error.message());
            });
    }, []);
    /******** save settings into DB ******/
    const saveSettings = (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append("store_credit", priceValue);
        formData.append("page_display_to_customers", landingPageValue);
        formData.append("email_sent_to_customer", emailSentToValue);
        formData.append("page_link", landingPageDisplayedValue);
        formData.append("instructions", JSON.stringify(rows));
        formData.append("page_color", buttonColorHex);
        formData.append("logo", logoImage);
        formData.append("video", video);
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
                        toggleActive();
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };
    // copy Landing Page Link
    const copyLandingPageLink = () => {
        console.log("working ");
        const landingPageDisplayedValue =
            baseUrl + "/landingPage/" + selected + "?store=" + store;
        navigator.clipboard.writeText(landingPageDisplayedValue);
        toastMarkup && toastMarkup.show();
    };
    return (
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
                                    marginBottom: "20px",
                                }}
                            >
                                <div>
                                    <Text variant="headingLg" as="h5">
                                        Landing Page Displayed To Customers
                                    </Text>
                                    <p
                                        style={{
                                            marginTop: "5px",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        See the Landing Page that users will
                                        see.
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
                                        Preview
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
                                        We'll send a test email to ...
                                    </p>
                                </div>
                                <div
                                    style={{ width: "200px", textAlign: "end" }}
                                >
                                    <Button primary>Test Email</Button>
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
                                        Here's your custom link that you can
                                        share with your existing customers..
                                    </p>
                                </div>
                                <div
                                    style={{ width: "200px", textAlign: "end" }}
                                >
                                    <Button
                                        primary
                                        onClick={() => copyLandingPageLink()}
                                    >
                                        Copy Link
                                    </Button>
                                </div>
                            </div>
                        </Card>
                        <Card sectioned>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div style={{ width: "450px" }}>
                                    <Text variant="headingLg" as="h5">
                                        How much would you like to pay (store
                                        credit) to a customer for the right to
                                        use the UGC?
                                    </Text>
                                    <p style={{ marginTop: "15px" }}>
                                        Based on our experience try to offer at
                                        least $50 (or equivalent) to maximize
                                        response rate. You can adjust it as you
                                        go based on results (no minimum
                                        required).
                                    </p>
                                </div>
                                <div
                                    style={{ width: "170px", textAlign: "end" }}
                                >
                                    <TextField
                                        value={priceValue}
                                        onChange={priceValueHandler}
                                        prefix="$"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        </Card>
                        <Card sectioned>
                            <div
                                style={{ width: "450px", marginBottom: "20px" }}
                            >
                                <Text variant="headingLg" as="h5">
                                    Email Settings
                                </Text>
                                <p style={{ marginTop: "5px" }}>
                                    You can disable the automatic emails if you
                                    want to distribute your link by yourself
                                </p>
                            </div>
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
                                        Landing Page Displayed To Customers
                                    </Text>
                                    <p style={{ marginTop: "5px" }}>
                                        See the Landing Oage that users will
                                        see.
                                    </p>
                                </div>
                                <div
                                    style={{ width: "170px", textAlign: "end" }}
                                >
                                    <TextField
                                        value={landingPageDisplayedValue}
                                        onChange={
                                            landingPageDisplayedValueHandler
                                        }
                                        suffix="days"
                                        autoComplete="off"
                                    />
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
                                <div style={{ width: "450px" }}>
                                    <Text variant="headingLg" as="h5">
                                        Email Sent To Customers
                                    </Text>
                                    <p style={{ marginTop: "5px" }}>
                                        We'll send a test email to ...
                                    </p>
                                </div>
                                <div
                                    style={{ width: "170px", textAlign: "end" }}
                                >
                                    <TextField
                                        value={emailSentToValue}
                                        onChange={emailSentToValueHandler}
                                        suffix="weeks"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div style={{ width: "450px" }}>
                                    <Text variant="headingLg" as="h5">
                                        Landing Page Link
                                    </Text>
                                    <p style={{ marginTop: "5px" }}>
                                        Here's your custom link that you can
                                        share with your existing customers..
                                    </p>
                                </div>
                                <div
                                    style={{ width: "170px", textAlign: "end" }}
                                >
                                    <TextField
                                        value={landingPageValue}
                                        onChange={landingPageHandler}
                                        suffix="emails  "
                                        autoComplete="off"
                                    />
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
                                </div>
                            </div>
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
                            {rows.map((row, index) => (
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
                                <div style={{ width: "450px" }}>
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
                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "20px",
                                marginBottom: "100px",
                            }}
                        >
                            <Button primary onClick={saveSettings}>
                                Save Settings
                            </Button>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Frame>
        </Page>
    );
};

export default Settings;
