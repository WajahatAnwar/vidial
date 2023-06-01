import React, { useEffect } from "react";
import {
    Page,
    hsbToHex,
    hsbToRgb,
    hslToRgb,
    rgbToHsb,
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
    Popover,
    ButtonGroup,
    Checkbox,
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
import { CircleCancelMinor, NoteMinor, CircleCancelMajor, ChevronUpMinor, PlayMinor } from "@shopify/polaris-icons";
import {
    DeleteMajor
} from '@shopify/polaris-icons';
import { useCallback } from "react";
import UploadIcon from "./imges/uploadLogo.png";
import ErrorIcon from "./imges/error.png";
import DellIcon from "./imges/dellIcon.png";
import ColorWheel from "./imges/collorWheel.png";
import ChevronUp from "./imges/ChevronUpMinor.png";
import arrowRight from "./imges/arrowRight.png";
import Toggle from "./Toggle";
import Dropzone from "dropzone";

/**
const urlParams = new URLSearchParams(location.search);
const shopParam = urlParams.get('shop');
const storeName = shopParam.split('.')[0];
localStorage.setItem('store',storeName);
*/

const Settings = () => {
    const [checkedOwnEmail, setOwnEmail] = useState(false);
    const handleOwnEmail = useCallback(
        (e) => setOwnEmail(e),
        [],
    );
    const [activeTootlTip, setActiveTootlTip] = useState(false);
    const [activeRejectionConfirmModel, setActiveRejectionConfirmModel] =
        useState(false);
    const handleChangeRejectionConfirmModel = useCallback(
        () => setActiveRejectionConfirmModel(!activeRejectionConfirmModel),
        [activeRejectionConfirmModel]
    );

    const navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const handleToggle = useCallback(() => setOpen((open) => !open), []);
    const [activeRejectionModel, setActiveRejectionModel] = useState(false);
    const handleChangeRejectionModel = useCallback(
        () => setActiveRejectionModel(!activeRejectionModel),
        [activeRejectionModel]
    );
    const [dropzoneText, setDropzoneText] = useState("");
    const handleDropzoneText = useCallback((newValue) => setDropzoneText(newValue), []);
    const [replyEmail, setReplyEmail] = useState("");
    const handleReplyEmail = useCallback((newValue) => setReplyEmail(newValue), []);
    const [mailgunAPI, setMailgunAPI] = useState("");
    const handleMailgunAPI = useCallback((newValue) => setMailgunAPI(newValue), []);
    const [title, setTitle] = useState("");
    const handleTitle = useCallback((newValue) => setTitle(newValue), []);
    const [instruction, setInstruction] = useState("Instruction");
    const handleInstruction = useCallback((newValue) => setInstruction(newValue), []);
    const [buttonText, setButtonText] = useState("Upload a short video");
    const handleButtonText = useCallback((newValue) => setButtonText(newValue), []);
    const [active, setActive] = useState(false);
    const [error, setError] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const [toggled, setToggled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [storeCurrency, setStoreCurrency] = useState("");
    const [errorMessages, setErorrMessages] = useState([]);
    const [currentLang, setCurrentLang] = useState("en");
    const [isSettingSave, setIsSettingSave] = useState("");
    const [emailTemplateButton, setEmailTemplateButton] = useState(true);
    const [files, setFiles] = useState([]);
    const [alreadyUploadLogo, setAlreadyUploadedLogo] = useState('');

    function handleChange() {
        let isChecked;
        if (toggled == "false" || toggled == false) {
            isChecked = false;
        } else if (toggled == "true" || toggled == true) {
            isChecked = true;
        }
        setToggled(!isChecked);
    }

    // remove inpirational video

    const removeInspirationalVideo = () => {
        var formData = {};
        fetch("/removeInspirationalVideo", {
            method: "post",

            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setPreviewVedio("")
                    setPreviewVedioHide(false);
                    setIsSettingSave(new Date().getSeconds());
                } else {
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
    // remove inpirational video

    const removeLogo = () => {
        var formData = {};
        fetch("/removeLogo", {
            method: "post",

            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    //setPreviewVedio("")
                    setPreviewLogoHide(false);
                    setPreviwLogo("");
                    setIsSettingSave(new Date().getSeconds());
                } else {
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // Choose selected color

    const chooseColor = (color) => {
        setButtonColorHex(color);
    };

    const toastMarkup = active ? (
        <Toast content={successMsg} onDismiss={toggleActive} />
    ) : null;
    const [selected, setSelected] = useState("en");

    //const handleSelectChange = useCallback((value) => setSelected(value), ["english"]);

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
    const [rows, setRows] = useState([]);
    console.log(rows);

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
    const handleInputColorChange = useCallback((newValue) => setButtonColorHex(newValue), []);
    const [buttonColor, setButtonColor] = useState({
        hue: 0,
        brightness: 0,
        saturation: 0,
    });
    const [gradientCheck, setGradientCheck] = useState(false);
    const [logoImage, setLogoImage] = useState("");
    // console.log(logoImage);
    const [video, setVideo] = useState("");
    const [store, setStore] = useState("");
    const [baseUrl, setBaseUrl] = useState("https://app.vidial.co");
    //const [baseUrl, setBaseUrl] = useState("https://phpstack-953879-3439374.cloudwaysapps.com");
    const [imagename, setImagename] = useState("");
    const [videoname, setVideoname] = useState("");
    const [previewLogo, setPreviwLogo] = useState("");
    const [previewLogoHide, setPreviewLogoHide] = useState(false);
    const [previewVedio, setPreviewVedio] = useState("");
    const [previewVedioHide, setPreviewVedioHide] = useState(false);
    const [email, setEmail] = useState("");
    const [storeName, setstoreName] = useState("");
    const [successToastVideo, setSuccessToastVideo] = useState("");
    // const successToastVideo = active ? (
    //     <Toast content="Settings Saved" onDismiss={true} />
    // ) : null;

    // alert(logoImage);
    const logoHandler = (e) => {
        setImagename(e.target.files[0].name);
        // imagename
        setLogoImage(e.target.files[0]);
        setPreviwLogo(URL.createObjectURL(e.target.files[0]));
        setPreviewLogoHide(true);
    };
    const videoHandler = (e) => {
        setVideoname(e.target.files[0].name);
        setVideo(e.target.files[0]);
        setPreviewVedio(URL.createObjectURL(e.target.files[0]));
        setPreviewVedioHide(true);
        console.log(e.target.files[0]);
    };

    // Review Landing Page
    const reviewPage = (store) => {
        window.open(
            baseUrl + "/landingPage/" + currentLang + "?store=" + store
        );
    };
    /********  get Settings Data  ******/
    useEffect(() => {
        async function fetchSettings() {
            try {
                const response = await fetch("/get_settings");
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                const data = await response.json();
                if (data.success) {

                    setToggled(data.data.email_status);
                    setPriceValue(data.data.store_credit);
                    setLandingPage(data.data.page_display_to_customers);
                    setEmailSentToValue(data.data.email_sent_to_customer);
                    setLandingPageDisplayedValue(data.data.page_link);

                    setLogoImage(data.data.logo);
                    console.log(data.data.video);
                    setAlreadyUploadedLogo(data.data.logo)
                    setAlreadyUploadedVideo(data.data.video)

                    setVideo(data.data.video);
                    setStore(data.data.store);
                    setSelected(data.data?.locale ?? "en");
                    setCurrentLang(data.data.locale);
                    setStoreCurrency(data.data.store_currency);
                    setTitle(data.data.instruction_title);
                    setEmail(data.data.email);
                    setstoreName(data.data.store_name)
                    setButtonColorHex(data.data.btn_color);
                    setRows(
                        data.data.instructions
                            ? data.data.instructions
                            : [
                                {
                                    id: 1,
                                    value: "Record a video off up to 30 seconds",
                                },
                                {
                                    id: 2,
                                    value: "Share your genuine experience of the product",
                                },
                                { id: 3, value: "Showcase the product" },
                                {
                                    id: 4,
                                    value: "Tell why you've decided to try " + data.data.store_name,
                                },
                                {
                                    id: 5,
                                    value: "Describe the main benefits of " + data.data.store_name,
                                },
                            ]
                    );
                    if (data.data.logo) {
                        setPreviewLogoHide(true);
                        setPreviwLogo(baseUrl + "/" + "logo/" + data.data.logo);
                    }

                    if (data.data.video && data.data.video !== "undefined") {
                        setPreviewVedioHide(true);
                        setPreviewVedio(
                            baseUrl + "/" + "video/" + data.data.video
                        );
                    }
                    console.log(store);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSettings();
    }, [isSettingSave]);

    const handleSelectChange = (value) => {
        setEmailTemplateButton(false);
        setSelected(value);

        if (value === "en") {
            setRows([
                { id: 1, value: "Record a video off up to 30 seconds" },
                {
                    id: 2,
                    value: "Share your genuine experience of the product",
                },
                { id: 3, value: "Showcase the product" },
                {
                    id: 4,
                    value: "Tell why you've decided to try " + storeName,
                },
                {
                    id: 5,
                    value: "Describe the main benefits of " + storeName,
                },
            ]);
            setTitle(`Send us a video to receive a ${storeCurrency}${priceValue} Gift Card`);
        } else if (value === "fr") {
            setRows([
                {
                    id: 1,
                    value: "Enregistrer une vidéo jusqu'à 30 secondes",
                },
                {
                    id: 2,
                    value: "Partagez votre expérience authentique du produit",
                },
                { id: 3, value: "Présenter le produit" },
                {
                    id: 4,
                    value: "Dites pourquoi vous avez décidé d'essayer " + storeName,
                },
                {
                    id: 5,
                    value: "Décrire les principaux avantages de " + storeName,
                },
            ]);
            setTitle(`Envoyez-nous une vidéo pour obtenir une carte cadeau de ${storeCurrency}${priceValue}`);
        } else if (value === "es") {
            setRows([
                { id: 1, value: "Graba un video de hasta 30 segundos" },
                {
                    id: 2,
                    value: "Comparta su experiencia genuina del producto",
                },
                { id: 3, value: "Mostrar el producto" },
                {
                    id: 4,
                    value: "Di por qué has decidido probar " + storeName,
                },
                {
                    id: 5,
                    value: "Describir los principales beneficios de " + storeName,
                },
            ]);
            setTitle(`Envíanos un video para obtener una tarjeta de regalo de ${storeCurrency}${priceValue}`);
        } else if (value === "pt") {
            setRows([
                { id: 1, value: "Grave um vídeo de até 30 segundos" },
                {
                    id: 2,
                    value: "Compartilhe sua experiência genuína com o produto",
                },
                { id: 3, value: "Mostre o produto" },
                {
                    id: 4,
                    value: "Diga por que você decidiu experimentar a " + storeName,
                },
                {
                    id: 5,
                    value: "Descrever os principais benefícios da " + storeName,
                },
            ]);
            setTitle(`Envie-nos um vídeo para receber um cartão presente de ${storeCurrency}${priceValue}`);
        } else if (value === "it") {
            setRows([
                { id: 1, value: "Registra un video fino a 30 secondi" },
                {
                    id: 2,
                    value: "Condividi la tua vera esperienza del prodotto",
                },
                { id: 3, value: "Mostra il prodotto" },
                {
                    id: 4,
                    value: "Spiega perché hai deciso di provare " + storeName,
                },
                {
                    id: 5,
                    value: "Descrivi i principali vantaggi di " + storeName,
                },
            ]);
            setTitle(`Invia un video per ottenere una carta regalo da ${storeCurrency}${priceValue}`);
        } else if (value === "de") {
            setRows([
                {
                    id: 1,
                    value: "Nehmen Sie ein Video von bis zu 30 Sekunden auf",
                },
                { id: 2, value: "Präsentieren Sie das Produkt" },
                { id: 3, value: "Präsentieren Sie das Produkt" },
                {
                    id: 4,
                    value:
                        "Sagen Sie, warum Sie sich entschieden haben, " +
                        storeName +
                        " auszuprobieren",
                },
                {
                    id: 5,
                    value: "Beschreiben Sie die Hauptvorteile von " + storeName,
                },
            ]);
            setTitle(`Senden Sie uns ein Video, um eine Geschenkkarte im Wert von ${storeCurrency}${priceValue} zu erhalten`);
        }
        // save Locale into DB
        // fetch("/saveLocale", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ value }),
        // })
        //     .then((response) => response.json())
        //     .then((data) => toggleActive())
        //     .catch((error) => console.error(error));
    };

    /******** save settings into DB ******/
    const saveSettings = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMsg('');

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
        formData.append("instruction_title", title);

        formData.append("locale", selected);
        if (
            (priceValue == "" ||
                landingPageValue == "" ||
                emailSentToValue == "" ||
                landingPageDisplayedValue == "" ||
                rows == "",
            )
        ) {
            setError(true);
        } else {
            setError(false);
            // Generating request for sending Data to the server
            fetch("/save_settings", {
                method: "post",

                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setIsLoading(false);
                        setSuccessMsg("Settings Added Successfully");
                        toggleActive();
                        setIsSettingSave(new Date().getSeconds());
                    } else {
                        setIsLoading(false);
                        setError(true);
                        setErorrMessages(data.errors);
                    }
                })
                .catch((error) => {
                    setIsLoading(false);
                    setError(true);
                    // console.log(error);
                });
        }
    };

    function handletestemail() {
        fetch("/send_test_email", {
            method: "GET",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    setActiveRejectionModel(true);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // toast markup



    // copy Landing Page Link
    const copyLandingPageLink = () => {

        const landingPageDisplayedValue =
            baseUrl + "/landingPage/" + currentLang + "?store=" + store;
        navigator.clipboard.writeText(landingPageDisplayedValue);
        setSuccessMsg("Copied to Clipboard");

        toggleActive();

    };


    const handleChatClick = () => {
        if (window.$crisp) {
            window.$crisp.push(['do', 'chat:toggle']);
        } else {
            console.warn('Crisp chat script not loaded yet!');
        }
    };
    // popover code start
    const [popoverActive, setPopoverActive] = useState(false);

    const togglePopoverActive = useCallback(
        () => setPopoverActive((popoverActive) => !popoverActive),
        [],
    );

    const [pageLink, setPageLink] = useState('');

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
    // drop zone code start



    const handleRemoveThumbnail = () => {
        setFiles([]);
        // setLogoImage(alread)
        //console.log('handle Remove thumbnail');
    };
    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            setLogoImage(acceptedFiles[0]);
            //setAlreadyUploadedLogo('');
            setFiles((files) => acceptedFiles);
        },
        []
    );
    const successToast = active ? (
        <Toast content="Settings Saved" onDismiss={true} />
    ) : null;

    const handleRemoveAlreadyUploadedLogo = () => {
        //setLogoImage('');
        //setActiveTootlTip(true);
        // setAlreadyUploadedLogo('');
        // console.log('heree me');
        // const formData = new FormData();
        // fetch('/checkuploadedlogo', {
        //     method: 'POST',
        //     body: formData

        // }).then((response) => response.json()).then((data) => {
        //     console.log(data);
        // })

    }

    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const fileUpload = !files.length && <DropZone.FileUpload actionHint="Accepts .jpg, and .png" actionTitle="Upload Your Brand Logo" />;
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
                                <Icon source={CircleCancelMajor} color="critical" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    // drop zone code end
    // drop zone code start
    const [filesVideos, setFilesVideos] = useState([]);
    const [alreadyUploadVideo, setAlreadyUploadedVideo] = useState('');


    const handleRemoveThumbnailVideo = () => {
        setFilesVideos([]);


        //console.log('handle Remove thumbnail');
    };
    const handleDropZoneVideo = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            setVideo(acceptedFiles[0]);
            //setAlreadyUploadedLogo('');
            setFilesVideos((filesVideos) => acceptedFiles);
            // setAlreadyUploadedVideo((filesVideos) => acceptedFiles);
        },
        []
    );


    const handleRemoveAlreadyUploadedVideo = () => {
        setActiveTootlTip(true);
        setAlreadyUploadedVideo('');
        setVideo('');

    }

    const validVideoTypes = ['video'];

    const fileUploadVideos = !filesVideos.length && <DropZone.FileUpload actionHint="Accepts .mp4, .avi ..... (please fill all formats)" actionTitle="Upload Your Inspirational Video" />;
    const uploadedFilesVideos = filesVideos.length > 0 && (
        <div style={{ padding: '0' }}>
            <div>
                {filesVideos.map((file, index) => (
                    <div key={index}>
                        <Thumbnail
                            size="small"
                            alt={file.name}
                            source={
                                validVideoTypes.includes(file.type)
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
    const uploadedFilesVideosPreview = filesVideos.length > 0 && (
        <div style={{ padding: '0' }}>
            <div style={{ width: "108px", marginBottom: "10px" }} >
                {filesVideos.map((file, index) => (
                    <div key={index}>
                        {/* <Thumbnail
                            size="medium"
                            alt={file.name}
                            source={
                                validVideoTypes.includes(file.type)
                                    ? window.URL.createObjectURL(file)
                                    : NoteMinor
                            }
                        /> */}
                        <video
                            width="108"
                            height="193"
                            src={window.URL.createObjectURL(file)}
                            muted
                            autoPlay
                            loop
                        ></video>
                        <div>
                            <div onClick={handleRemoveThumbnailVideo} >
                                <Icon source={CircleCancelMajor} color="critical" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    // drop zone code end


    return (
        <div>
            <Modal
                open={activeRejectionConfirmModel}
                onClose={handleChangeRejectionConfirmModel}
                title={'Important Notice'}
            >
                <Modal.Section>
                    <div style={{ textAlign: "center" }}>
                        <Text variant="headingMd" as="h6">
                            Your current email content will be replaced with the new content. Are you absolutely certain that you wish to proceed with the replacement? on cancellation email will remain same.
                        </Text>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "20px",
                            }}
                        >
                            <ButtonGroup>
                                <Button
                                    onClick={() => {
                                        navigate(pageLink);
                                        setActiveRejectionConfirmModel(false);
                                        setEmailTemplateButton(true);
                                    }}
                                >
                                    Customize Content
                                </Button>
                                <Button primary onClick={() => {
                                    document.getElementById('sab_ok_id').click();
                                    setTimeout(() => {
                                        navigate(pageLink)
                                    }, 5000);

                                    setActiveRejectionConfirmModel(false);
                                    navigate(pageLink);
                                    setEmailTemplateButton(true);
                                }}
                                >
                                    Sure
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </Modal.Section>
            </Modal>
            {isLoading ? (
                <div>
                    <Spinner
                        accessibilityLabel="Spinner example"
                        size="large"
                    />
                </div>
            ) : (
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
                                <Banner
                                    title="Welcome to Vidial, Bravelsaus  👋 "

                                    status="info"
                                    onDismiss={() => { }}
                                >
                                    <p>Vidial will help you receive authentic UGC from your customers in autopilot.<br></br>
                                        Let’s get started by setting up the application.</p>
                                    <a style={{ textDecoration: "none" }} href="#">
                                        <button onClick={() => {
                                            window.open(
                                                'https://www.youtube.com/watch?v=WMcggJ9QXDc&t=7s'
                                            );
                                        }} style={{
                                            cursor: 'pointer',
                                            display: "flex", padding: "7px 10px",
                                            marginTop: "20px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid #95c9b4", borderRadius: "4px"
                                        }}>
                                            <Icon
                                                source={PlayMinor}
                                                color="base"
                                            /><span style={{ marginLeft: "10px" }}>How Vidial Works</span></button></a>
                                </Banner>
                                {error && (
                                    <Card sectioned>
                                        <Banner>
                                            <List type="bullet">
                                                {errorMessages.store_credit &&
                                                    errorMessages.store_credit.map(
                                                        (error) => {
                                                            return (
                                                                <List.Item>
                                                                    {error}
                                                                </List.Item>
                                                            );
                                                        }
                                                    )}

                                                {errorMessages.page_display_to_customers &&
                                                    errorMessages.page_display_to_customers.map(
                                                        (error) => {
                                                            return (
                                                                <List.Item>
                                                                    {error}
                                                                </List.Item>
                                                            );
                                                        }
                                                    )}
                                                {errorMessages.email_sent_to_customer &&
                                                    errorMessages.email_sent_to_customer.map(
                                                        (error) => {
                                                            return (
                                                                <List.Item>
                                                                    {error}
                                                                </List.Item>
                                                            );
                                                        }
                                                    )}
                                                {errorMessages.page_link &&
                                                    errorMessages.page_link.map(
                                                        (error) => {
                                                            return (
                                                                <List.Item>
                                                                    {error}
                                                                </List.Item>
                                                            );
                                                        }
                                                    )}
                                                {errorMessages.instructions &&
                                                    errorMessages.instructions.map(
                                                        (error) => {
                                                            return (
                                                                <List.Item>
                                                                    {error}
                                                                </List.Item>
                                                            );
                                                        }
                                                    )}
                                                {errorMessages.email_sent_to_customer &&
                                                    errorMessages.email_sent_to_customer.map(
                                                        (error) => {
                                                            return (
                                                                <List.Item>
                                                                    {error}
                                                                </List.Item>
                                                            );
                                                        }
                                                    )}
                                                {errorMessages.logo &&
                                                    errorMessages.logo.map(
                                                        (error) => {
                                                            return (
                                                                <List.Item>
                                                                    {error}
                                                                </List.Item>
                                                            );
                                                        }
                                                    )}
                                                {errorMessages.video &&
                                                    errorMessages.video.map(
                                                        (error) => {
                                                            return (
                                                                <List.Item>
                                                                    {error}
                                                                </List.Item>
                                                            );
                                                        }
                                                    )}
                                            </List>
                                        </Banner>
                                    </Card>
                                )}

                                {toastMarkup}
                                <div style={{ marginTop: "20px" }}></div>
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
                                            Here’s what your customers will see
                                            and receive by email
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
                                                Here’s the Landing Page that
                                                your users will see
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                width: "200px",
                                                textAlign: "end",
                                            }}
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
                                                Share the landing page link with
                                                your customers to get them to
                                                send UGC videos
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                width: "200px",
                                                textAlign: "end",
                                            }}
                                        >
                                            <Button
                                                primary
                                                onClick={() =>
                                                    copyLandingPageLink()
                                                }
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

                                        }}
                                    >
                                        <div>
                                            <Text variant="headingLg" as="h5">
                                                Email Sent To Customers
                                            </Text>
                                            <p
                                                style={{
                                                    marginTop: "5px",
                                                }}
                                            >
                                                We'll send a test email to {email}
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                width: "200px",
                                                textAlign: "end",
                                            }}
                                        >
                                            <Button
                                                primary
                                                onClick={handletestemail}
                                            >
                                                Send Test Email
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
                                        <div style={{}}>
                                            <Text variant="headingLg" as="h5">
                                                What amount of store credit
                                                would you offer to the customers
                                                for the usage of their UGC
                                                videos?
                                            </Text>
                                            <p style={{ marginTop: "15px" }}>
                                                We recommend offering a minimum
                                                of {storeCurrency}50 to improve
                                                response rates. This can be
                                                adjusted as necessary, with not
                                                set minimum limit in place.
                                            </p>
                                        </div>
                                        <div
                                            className="textFieldjoin"
                                            style={{
                                                marginLeft: "204px",
                                                width: "200px",
                                                textAlign: "end",
                                                display: "flex",
                                                alignItems: "center",
                                            }}
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

                                    <div style={{ display: 'flex', alignItems: "center" }}>
                                        <Select
                                            options={options}
                                            onChange={(e) => {
                                                handleSelectChange(e);
                                            }}
                                            value={selected}
                                        />
                                        &nbsp;
                                        <Button primary onClick={() => {
                                            //setPageLink("/post-purchase-email")
                                            document.getElementById('sab_ok_id').click();
                                            setEmailTemplateButton(true);
                                            //setActiveRejectionConfirmModel(true);
                                        }} disabled={emailTemplateButton}>Save</Button>
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
                                                Your Store Logo (optional)
                                            </Text>
                                            <p style={{ marginTop: "5px", marginBottom: "5px" }}>
                                                Should be a PNG file, not bigger than 1 MB.
                                            </p>
                                        </div>
                                        {/* <div style={{ textAlign: "end" }}>
                                            <div class="upload-btn-wrapper">
                                                <button class="btnCustomUpload">
                                                    <img
                                                        style={{
                                                            marginRight: "10px",
                                                        }}
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
                                            <p>
                                                {`${imagename}`}{" "}
                                                {imagename && (
                                                    <span>Uploaded</span>
                                                )}{" "}
                                            </p>
                                        </div> */}
                                    </div>
                                    {/* {previewLogoHide && (logoImage == 'undefined' || logoImage == '') ? '' :
                                        (
                                            <div style={{ width: "108px" }}>

                                                <img
                                                    style={{
                                                        marginTop: "20px",
                                                        boxShadow:
                                                            "0px 0px 6px 2px rgb(0 0 0 / 20%) !important",
                                                    }}
                                                    width="100px"
                                                    src={previewLogo}
                                                ></img>
                                                <div onClick={removeLogo} > <Icon source={CircleCancelMajor} color="critical" /></div>
                                            </div>
                                        )
                                    } */}
                                    <div style={{ maxWidth: "470px", marginBottom: "20px" }}>
                                        <DropZone actionTitle="Upload Your Brand Logo" onDrop={handleDropZoneDrop} variableHeight allowMultiple={false}>
                                            {uploadedFiles}
                                            {fileUpload}
                                        </DropZone>
                                    </div>
                                    {uploadedFilesPreview}
                                    {(!files.length && !(alreadyUploadLogo == 'undefined' || alreadyUploadLogo == '')) &&

                                        <div style={{ padding: '0' }}>
                                            <div style={{ width: "60px", marginBottom: "10px" }} >
                                                <Thumbnail
                                                    size="medium"
                                                    alt="img"
                                                    source={baseUrl + '/logo/' + alreadyUploadLogo}
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
                                    <div
                                        style={{
                                            width: "450px",
                                            marginTop: "20px",
                                        }}
                                    >

                                        <p
                                            style={{
                                                marginTop: "5px",
                                                marginBottom: "5px",
                                            }}
                                        >
                                            Dropzone Text
                                        </p>
                                        <TextField
                                            value={dropzoneText}
                                            onChange={handleDropzoneText}
                                            autoComplete="off"
                                        />

                                    </div>
                                    <div
                                        style={{
                                            width: "450px",
                                            marginTop: "20px",
                                        }}
                                    >
                                        <Text variant="headingLg" as="h5">
                                            Instructions
                                        </Text>
                                        <p
                                            style={{
                                                marginTop: "5px",
                                                marginBottom: "5px",
                                            }}
                                        >
                                            Instructions Title
                                        </p>
                                        <TextField
                                            value={title}
                                            onChange={handleTitle}
                                            autoComplete="off"
                                        />
                                        <p
                                            style={{
                                                marginTop: "5px",
                                                marginBottom: "5px",
                                            }}
                                        >
                                            Instruction
                                        </p>
                                        <TextField
                                            value={instruction}
                                            onChange={handleInstruction}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <p
                                        style={{
                                            marginTop: "20px",
                                            marginBottom: "5px",
                                        }}
                                    >
                                        You may adjust these instructions
                                        according to the needs of your Store.
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
                                                Be very clear about what your
                                                costumers should video.
                                            </p>
                                            <p>
                                                Keep it simple, with minimum
                                                instructions as possible.
                                            </p>
                                        </div>
                                    </div>
                                    <p>Instructions Steps</p>
                                    {rows &&
                                        rows.map((row, index) => (
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "1fr .3fr",
                                                    marginTop: "10px",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                <div>
                                                    <TextField
                                                        value={row.value}
                                                        onChange={(e) =>
                                                            handleTextChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        marginLeft: "10px",
                                                    }}
                                                >
                                                    <div>
                                                        <img
                                                            style={{ cursor: "pointer" }}
                                                            src={DellIcon}
                                                            onClick={() =>
                                                                handleRemoveRow(
                                                                    row.id
                                                                )
                                                            }
                                                        ></img>
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
                                            <p style={{ marginTop: "5px", marginBottom: "5px" }}>
                                                Add a video for your customers
                                                to get inspired and make a UGC
                                                almost similar.
                                            </p>
                                        </div>
                                        {/* <div style={{ textAlign: "end" }}>
                                            <div class="upload-btn-wrapper">
                                                <button class="btnCustomUpload">
                                                    <img
                                                        style={{
                                                            marginRight: "10px",
                                                        }}
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
                                            <p>
                                                {`${videoname}`}{" "}
                                                {videoname && "uploaded"}{" "}
                                            </p>
                                        </div> */}
                                    </div>
                                    {/* {previewVedioHide && (
                                        <div style={{ width: "108px" }}>
                                            <video
                                                width="108"
                                                height="193"
                                                src={previewVedio}
                                                muted
                                                autoPlay
                                                loop
                                            ></video>
                                            <div onClick={removeInspirationalVideo} > <Icon source={CircleCancelMajor} color="critical" /></div>
                                        </div>
                                    )} */}
                                    <div style={{ maxWidth: "470px", marginBottom: "20px" }}>
                                        <DropZone onDrop={handleDropZoneVideo} variableHeight allowMultiple={false}>
                                            {uploadedFilesVideos}
                                            {fileUploadVideos}
                                        </DropZone>
                                    </div>
                                    {uploadedFilesVideosPreview}
                                    {(!filesVideos.length && !(alreadyUploadVideo == 'undefined' || alreadyUploadVideo == '')) &&

                                        <div style={{ padding: '0' }}>
                                            <div style={{ width: "108px", marginBottom: "10px", textAlign: "center" }} >

                                                <video
                                                    width="108"
                                                    height="193"
                                                    src={baseUrl + '/video/' + alreadyUploadVideo}
                                                    muted
                                                    autoPlay
                                                    loop
                                                ></video>
                                                <div onClick={handleRemoveAlreadyUploadedVideo} >
                                                    {
                                                        activeTootlTip ? <Tooltip content="This is default setting. You can not change it.">
                                                            <Icon source={CircleCancelMajor} color="critical" />

                                                        </Tooltip> : <Icon source={CircleCancelMajor} color="critical" />
                                                    }

                                                </div>
                                            </div>
                                        </div>
                                    }
                                    <div
                                        style={{
                                            width: "450px",
                                            marginTop: "20px",
                                        }}
                                    >


                                        <p
                                            style={{
                                                marginTop: "5px",
                                                marginBottom: "5px",
                                            }}
                                        >
                                            Button Text
                                        </p>
                                        <TextField
                                            value={buttonText}
                                            onChange={handleButtonText}
                                            autoComplete="off"
                                        />
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
                                                Choose the branding color of
                                                your landing page.
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
                                            onClick={() => {
                                                chooseColor("#FF4A4B");
                                            }}
                                            style={{
                                                background: "#FF4A4B",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#FF5175");
                                            }}
                                            style={{
                                                background: "#FF5175",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#E91E62");
                                            }}
                                            style={{
                                                background: "#E91E62",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#EB0045");
                                            }}
                                            style={{
                                                background: "#EB0045",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#D70049");
                                            }}
                                            style={{
                                                background: "#D70049",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#FF59DE");
                                            }}
                                            style={{
                                                background: "#FF59DE",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#FF98F7");
                                            }}
                                            style={{
                                                background: "#FF98F7",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#9C27B0");
                                            }}
                                            style={{
                                                background: "#9C27B0",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#673AB6");
                                            }}
                                            style={{
                                                background: "#673AB6",
                                                cursor: "pointer",
                                            }}
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
                                            onClick={() => {
                                                chooseColor("#3F50B5");
                                            }}
                                            style={{
                                                background: "#3F50B5",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#0D0083");
                                            }}
                                            style={{
                                                background: "#0D0083",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#2096F3");
                                            }}
                                            style={{
                                                background: "#2096F3",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#3CBAFA");
                                            }}
                                            style={{
                                                background: "#3CBAFA",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#74D4FF");
                                            }}
                                            style={{
                                                background: "#74D4FF",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#00BCD4");
                                            }}
                                            style={{
                                                background: "#00BCD4",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#009688");
                                            }}
                                            style={{
                                                background: "#009688",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#01B780");
                                            }}
                                            style={{
                                                background: "#01B780",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#03D39C");
                                            }}
                                            style={{
                                                background: "#03D39C",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#4CAF4F");
                                            }}
                                            style={{
                                                background: "#4CAF4F",
                                                cursor: "pointer",
                                            }}
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
                                            onClick={() => {
                                                chooseColor("#AEFF14");
                                            }}
                                            style={{
                                                background: "#AEFF14",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#FFDB91");
                                            }}
                                            style={{
                                                background: "#FFDB91",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#FFBA00");
                                            }}
                                            style={{
                                                background: "#FFBA00",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#FF9800");
                                            }}
                                            style={{
                                                background: "#FF9800",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#FFA383");
                                            }}
                                            style={{
                                                background: "#FFA383",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#D64C1E");
                                            }}
                                            style={{
                                                background: "#D64C1E",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#795548");
                                            }}
                                            style={{
                                                background: "#795548",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#ACACAC");
                                            }}
                                            style={{
                                                background: "#ACACAC",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>
                                        <div
                                            onClick={() => {
                                                chooseColor("#000000");
                                            }}
                                            style={{
                                                background: "#000000",
                                                cursor: "pointer",
                                            }}
                                            className="colorOptions"
                                        ></div>

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

                                    </div>
                                    <p>Selected Color Preview</p>
                                    <br />
                                    <div
                                        style={{
                                            background: `${buttonColorHex}`,
                                        }}
                                        className="colorOptions"
                                    ></div>
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
                                                Choose the time to send the
                                                first email to your customers
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                width: "170px",
                                                textAlign: "end",
                                            }}
                                        >
                                            <Toggle
                                                toggled={toggled}
                                                onClick={handleChange}
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
                                        <div style={{ width: "550px" }}>
                                            <Text variant="headingLg" as="h5">
                                                Post Purchase Emails Sent To
                                                Customers
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                                Choose the time to send the
                                                first email to your customers
                                            </p>
                                        </div>
                                        <div
                                            className="textFieldjoinRight"
                                            style={{
                                                marginLeft: "204px",
                                                width: "103px",
                                                textAlign: "end",
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <TextField
                                                value={
                                                    landingPageDisplayedValue
                                                }
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
                                                Reminder Emails Sent To
                                                Customers
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                                Choose the delay between each
                                                reminder emails (we’ll send
                                                emails each defined weeks)
                                            </p>
                                        </div>
                                        <div
                                            className="textFieldjoinRight"
                                            style={{
                                                marginLeft: "204px",
                                                width: "103px",
                                                textAlign: "end",
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <TextField
                                                value={emailSentToValue}
                                                onChange={
                                                    emailSentToValueHandler
                                                }
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
                                                Choose the maximum of emails you
                                                want to send to your customers
                                            </p>
                                        </div>
                                        <div
                                            className="textFieldjoinRight"
                                            style={{
                                                marginLeft: "204px",
                                                width: "103px",
                                                textAlign: "end",
                                                display: "flex",
                                                alignItems: "center",
                                            }}
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
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            cursor: "pointer",

                                        }}
                                        onClick={handleToggle}
                                        ariaExpanded={open}
                                    >
                                        <div style={{ width: "450px" }}>
                                            <Text variant="headingLg" as="h5">
                                                Email Customization
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                                Customize all the emails your customers will receive
                                            </p>
                                        </div>
                                        <div
                                            style={{

                                                textAlign: "end",
                                            }}
                                        >
                                            <img
                                                className=""
                                                src={ChevronUp}
                                                style={{ transition: "transform 0.5s ease-in-out 0s", transform: open ? 'rotate(180deg)' : '' }}
                                            ></img>
                                        </div>
                                    </div>
                                    <Collapsible
                                        open={open}
                                        id="basic-collapsible"
                                        transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                                        expandOnPrint
                                    >
                                        <div style={{marginTop:"20px"}}></div>
                                        <Checkbox
                                            label="Send with your own email"
                                            checked={checkedOwnEmail}
                                            onChange={handleOwnEmail}
                                        />
                                        <div
                                            style={{
                                                width: "450px",
                                                marginTop: "10px",
                                            }}
                                        >



                                            <TextField
                                                value={mailgunAPI}
                                                onChange={handleMailgunAPI}
                                                autoComplete="off"
                                                placeholder="Mailgun API Key"
                                            />
                                            <p style={{color:"#717171",marginTop:"5px"}}>Paste your <a href="https://www.google.com/" target="blank" style={{color:"#008060",textDecoration:"underline"}}>Mailgun</a> API Key here. <a href="https://www.google.com/" target="blank" style={{color:"#008060",textDecoration:"underline"}}>See how it works</a></p>
                                        </div>
                                        <div
                                            style={{
                                                width: "450px",
                                                marginTop: "10px",
                                            }}
                                        >



                                            <TextField
                                                value={replyEmail}
                                                onChange={handleReplyEmail}
                                                autoComplete="off"
                                                placeholder="noreply@vidialapp.com"
                                            />
                                            <p style={{color:"#717171",marginTop:"5px"}}>Enter the email address that will be used as the sender.</p>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "20px",
                                                marginTop: "20px",
                                                border: "1px solid #C9CCCF",
                                                borderRadius: "10px",
                                                padding: "8px 20px",
                                                cursor: "pointer",

                                            }}
                                            onClick={() => {
                                                navigate("/post-purchase-email")

                                            }}
                                        >
                                            <div style={{ width: "550px" }}>
                                                <Text variant="headingLg" as="h5">
                                                    Post Purchase
                                                </Text>
                                                <p style={{ marginTop: "5px" }}>
                                                    Customize all the emails your customers will receive.
                                                </p>
                                            </div>
                                            <div

                                            >
                                                <img
                                                    className=""
                                                    src={arrowRight}
                                                    style={{
                                                        marginTop: "8px",
                                                    }}
                                                ></img>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "20px",
                                                marginTop: "20px",
                                                border: "1px solid #C9CCCF",
                                                borderRadius: "10px",
                                                padding: "8px 20px",
                                                cursor: "pointer",

                                            }}
                                            onClick={() => {
                                                navigate("/reminder-email")

                                            }}
                                        >
                                            <div style={{ width: "550px" }}>
                                                <Text variant="headingLg" as="h5">
                                                    Reminder
                                                </Text>
                                                <p style={{ marginTop: "5px" }}>
                                                    Customize all the emails your customers will receive.
                                                </p>
                                            </div>
                                            <div

                                            >
                                                <img
                                                    className=""
                                                    src={arrowRight}
                                                    style={{
                                                        marginTop: "8px",
                                                    }}
                                                ></img>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "20px",
                                                marginTop: "20px",
                                                border: "1px solid #C9CCCF",
                                                borderRadius: "10px",
                                                padding: "8px 20px",
                                                cursor: "pointer",

                                            }}
                                            onClick={() => {
                                                navigate("/ugc-approved-email")

                                            }}
                                        >
                                            <div style={{ width: "550px" }}>
                                                <Text variant="headingLg" as="h5">
                                                    UGC Approved
                                                </Text>
                                                <p style={{ marginTop: "5px" }}>
                                                    Customize all the emails your customers will receive.
                                                </p>
                                            </div>
                                            <div

                                            >
                                                <img
                                                    className=""
                                                    src={arrowRight}
                                                    style={{
                                                        marginTop: "8px",
                                                    }}
                                                ></img>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                marginBottom: "20px",
                                                marginTop: "20px",
                                                border: "1px solid #C9CCCF",
                                                borderRadius: "10px",
                                                padding: "8px 20px",
                                                cursor: "pointer",

                                            }}
                                            onClick={() => {
                                                navigate("/ugc-declined-email");

                                            }}
                                        >
                                            <div style={{ width: "550px" }}>
                                                <Text variant="headingLg" as="h5">
                                                    UGC Declined
                                                </Text>
                                                <p style={{ marginTop: "5px" }}>
                                                    Customize all the emails your customers will receive.
                                                </p>
                                            </div>
                                            <div

                                            >
                                                <img
                                                    className=""
                                                    src={arrowRight}
                                                    style={{
                                                        marginTop: "8px",
                                                    }}
                                                ></img>
                                            </div>
                                        </div>
                                    </Collapsible>


                                </Card>

                                <Card sectioned>
                                    <div>
                                        <Text variant="headingLg" as="h5">
                                            Remove Vidial Watermark
                                        </Text>
                                        <p
                                            style={{
                                                marginTop: "15px",
                                                marginBottom: "15px",
                                            }}
                                        >
                                            Please contact the live support to verify your store and remove our Branding “Powered by Vidial” for FREE.
                                        </p>
                                        <Button primary onClick={handleChatClick}>
                                            Remove The Watermark
                                        </Button>
                                    </div>
                                </Card>
                                <div
                                    style={{
                                        textAlign: "right",
                                        marginTop: "20px",
                                        marginBottom: "100px",
                                    }}
                                >
                                    <Button
                                        primary
                                        onClick={saveSettings}
                                        disabled={isLoading}
                                        id="sab_ok_id"
                                    >
                                        Save Settings
                                    </Button>
                                </div>
                            </Grid.Cell>
                        </Grid>

                        <Modal
                            open={activeRejectionModel}
                            onClose={handleChangeRejectionModel}
                            title="Test Email"

                            secondaryActions={[
                                {
                                    content: "Cancel",
                                    onAction: handleChangeRejectionModel,
                                },
                            ]}
                        >
                            <Modal.Section>
                                <Text variant="headingMd" as="h6">
                                    Email Sent Sucessfully
                                </Text>
                            </Modal.Section>
                        </Modal>
                    </Frame>
                </Page>
            )}
        </div>
    );
};

export default Settings;
