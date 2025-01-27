import { Banner, BlockStack, Button, ButtonGroup, Card, ColorPicker, DropZone, Frame, Grid, Icon, List, Modal, Page, Popover, RadioButton, Select, Spinner, Text, TextField, Thumbnail, Tooltip, hsbToHex } from "@shopify/polaris";
import { CircleCancelMajor, NoteMinor } from "@shopify/polaris-icons";

import { useCallback, useEffect, useRef, useState } from "react";
import './css/editor.css';
import ColorWheel from "./imges/collorWheel.png";
import { router } from "@inertiajs/react";
import { MenuItem, TextField as TextField2 } from "@mui/material";
import WebFont from "webfontloader";
import Delete from "./imges/Delete.svg";
import { useAppBridge } from "@shopify/app-bridge-react";



const Settings = () => {
    const shopify = useAppBridge();

    const [storeHandle, setStoreHandle] = useState(null);
    const [approvedStoreHandle, setApprovedStoreHandle] = useState(null);
    const [isHandleAvailable, setIsHandleAvailable] = useState(true);
    const [storeHandleState, setStoreHandleState] = useState(false);
    const [storeHandleResponse, setStoreHandleResponse] = useState(null);
    const [emailCredsError, setEmailCredsError] = useState(false);
    const [emailCredsMsg, setEmailCredsMsg] = useState('');
    const [emailCredsToggle, setEmailCredsToggle] = useState(false);
    const [gDConnected, setGDConnected] = useState(true);
    const [klavioConnected, setKlavioConnected] = useState(true);
    const [planName, setPlanName] = useState(null);

    const [isEmailActive, setIsEmailActive] = useState(false);
    const handleIsEmailActive = useCallback(
        (e) => setIsEmailActive(e),
        [],
    );
    const [activeTootlTip, setActiveTootlTip] = useState(false);
    const [activeRejectionConfirmModel, setActiveRejectionConfirmModel] =
        useState(false);
    const handleChangeRejectionConfirmModel = useCallback(
        () => setActiveRejectionConfirmModel(!activeRejectionConfirmModel),
        [activeRejectionConfirmModel]
    );

    const [open, setOpen] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const handleToggle = useCallback(() => setOpen((open) => !open), []);

    const [videoTitle, setVideoTitle] = useState("");
    const [instructionSubTitle, setInstructionSubTitle] = useState("Please follow the instructions below:");
    const handleDropzoneText = useCallback((newValue) => setVideoTitle(newValue), []);
    const [senderEmail, setSenderEmail] = useState("");
    const [gdApi, setGdApi] = useState("");
    const [gdClientId, setGdClientId] = useState("");
    const [gdSecretKey, setGdSecretKey] = useState("");
    const [gdFolder, setGdFolder] = useState("");

    const [klavioApi, setKlavioApi] = useState("");
    const [klavioEmail, setKlavioEmail] = useState("");


    const handleSenderApi = useCallback((newValue) => setGdApi(newValue), []);
    const handleSenderClientId = useCallback((newValue) => setGdClientId(newValue), []);
    const handleSenderSecKey = useCallback((newValue) => setGdSecretKey(newValue), []);
    const handleSenderFolder = useCallback((newValue) => setGdFolder(newValue), []);
    const handleSenderEmail = useCallback((newValue) => setSenderEmail(newValue), []);
    const handleKlavioApi = useCallback((newValue) => setKlavioApi(newValue), []);
    const handleKlavioEmail = useCallback((newValue) => setKlavioEmail(newValue), []);


    const [mailgunAPI, setMailgunAPI] = useState("");
    const [mailgunDomain, setMailgunDomain] = useState("");
    const [mailgunEndpoint, setMailgunEndpoint] = useState("");


    const handleMailgunAPI = useCallback((newValue) => setMailgunAPI(newValue), []);
    const handleMailgunDomain = useCallback((newValue) => setMailgunDomain(newValue), []);
    const handleMailgunEndPoint = useCallback((newValue) => setMailgunEndpoint(newValue), []);
    const [title, setTitle] = useState("");
    const handleTitle = (event) => {
        console.log(event.target.value)
        setTitle(event.target.value);
    }

    const handleInstruction = useCallback((newValue) => setInstructionSubTitle(newValue), []);
    const [buttonText, setButtonText] = useState(null);
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
        fetch(route('removeInspirationalVideo'), {
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
        fetch(route("removeLogo"), {
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
        shopify.toast.show('Product saved', {
            duration: 5000,
        })
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

    const [fontOptions, setFontOptions] = useState([]);
    const [fontSelected, setFontSelected] = useState('');
    const [visibleFonts, setVisibleFonts] = useState([]);
    const batchSize = 20;
    const loadedFonts = useRef(new Set());
    useEffect(() => {
        const fetchGoogleFonts = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(
                    `https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBWdgWr0bOPpqBlROejxCqeiaGnXd35ACM`
                );
                const fonts = response.data.items.map((font) => font.family);

                setFontOptions(fonts); // Store all fonts
                setVisibleFonts(fonts.slice(0, batchSize)); // Load the first batch
                preloadFonts(fonts.slice(0, batchSize)); // Preload the first batch
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching Google Fonts:", error);
                setIsLoading(false);
            }
        };

        fetchGoogleFonts();
    }, []);

    const preloadFonts = (fonts) => {
        fonts.forEach((font) => {
            if (!loadedFonts.current.has(font)) {
                WebFont.load({
                    google: {
                        families: [font],
                    },
                });
                loadedFonts.current.add(font); // Cache the loaded font
            }
        });
    };

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        if (scrollTop + clientHeight >= scrollHeight - 50 && !isLoading) {
            loadMoreFonts();
        }
    };

    const loadMoreFonts = () => {
        setIsLoading(true);
        const currentLength = visibleFonts.length;
        const nextBatch = fontOptions.slice(currentLength, currentLength + batchSize);

        if (nextBatch.length > 0) {
            preloadFonts(nextBatch); // Preload the next batch
            setVisibleFonts((prevFonts) => [...prevFonts, ...nextBatch]); // Append new fonts
        }
        setIsLoading(false);
    };

    const [count, setCount] = useState('circle');

    const handleCountChange = (bol, value) => {
        setCount(value);
    }
    const [btnStyle, setBtnStyle] = useState('squaree');

    const handleBtnStyleChange = (bol, value) => {
        setBtnStyle(value);
    }

    const [priceValue, setPriceValue] = useState("50");
    const [starStoreCredit, setStarStoreCredit] = useState("75");

    const priceValueHandler = useCallback((value) => setPriceValue(value), []);
    const priceStarValueHandler = useCallback((value) => setStarStoreCredit(value), []);

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
        "Record a video (up to 30 seconds)"
    );

    const handleInstructionFieldChange = useCallback(
        (value) => setinstructionFieldValue(value),
        []
    );
    // add row code start
    const [rows, setRows] = useState([]);


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
    // const [baseUrl, setBaseUrl] = useState("https://031b-72-255-40-111.ngrok-free.app");
    //const [baseUrl, setBaseUrl] = useState("https://031b-72-255-40-111.ngrok-free.app");
    const [baseUrl, setBaseUrl] = useState("https://phpstack-953879-3439374.cloudwaysapps.com");
    const [imagename, setImagename] = useState("");
    const [videoname, setVideoname] = useState("");
    const [previewLogo, setPreviwLogo] = useState("");
    const [previewLogoHide, setPreviewLogoHide] = useState(false);
    const [previewVedio, setPreviewVedio] = useState("");
    const [previewVedioHide, setPreviewVedioHide] = useState(false);
    const [email, setEmail] = useState("");
    const [storeName, setstoreName] = useState("");
    const [successToastVideo, setSuccessToastVideo] = useState("");
    const [favIcon, setFavIcon] = useState(null);
    const [finalFavIcon, setFinalFavIcon] = useState(null);
    const [favIconPreview, setFavIconPreview] = useState(null);

    const [gdError, setGdError] = useState(false);
    const [klavioError, setKlavioError] = useState(false);
    const [gdErrorMsg, setGdErrorMsg] = useState('');
    const [klavioErrorMsg, setKlavioErrorMsg] = useState('');

    const logoHandler = (e) => {
        setImagename(e.target.files[0].name);
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
        // window.open(
        //     baseUrl + "/landingPage/" + currentLang + "?store=" + store
        // );
        window.open(
            "/s/" + approvedStoreHandle
        );
    };
    const copyCode = (store) => {
        const baseUrl = window.location.origin;
        const iframeSrc = `${baseUrl}/s/${approvedStoreHandle}`;
        const codeToCopy = `<style>
            iframe {
                width: 100%;
                border: none; /* Disable border */
                outline: none !important; /* Disable focus outline */
                box-shadow: none !important; /* Disable shadow */
                overflow: hidden; /* Ensure no scrollbars */
                height: 160vh;
            }
            </style>
            <iframe src="${iframeSrc}" frameborder="0" scrolling="no">
            </iframe>`;
        navigator.clipboard.writeText(codeToCopy)
            .then(() => {
                setSuccessMsg("Code Copied Successfully");
                toggleActive();
            })
            .catch(err => {
                console.error('Failed to copy code:', err);
            });
    };
    const handleFontChange = (event) => {
        const selectedFont = event.target.value;
        setFontSelected(selectedFont);
        WebFont.load({
            google: {
                families: [selectedFont],
            },
        });
    };
    const setByDefaultSettings = ($columnType, $locale) => {

        if ($locale == 'en') {
            if ($columnType == 'video_title') {
                setVideoTitle("Here's an example of a great video");
            }
            if ($columnType == 'btn_txt') {
                setButtonText('Upload Your Video');
            }
        }
        else if ($locale == 'fr') {
            if ($columnType == 'video_title') {
                setVideoTitle('Voici un exemple de vidéo que vous pouvez enregistrer:');
            }
            if ($columnType == 'btn_txt') {
                setButtonText('Téléchargez une courte vidéo');
            }
        }
        else if ($locale == 'de') {
            if ($columnType == 'video_title') {
                setVideoTitle('Hier ist ein Beispiel für ein Video, das Sie aufnehmen können:');
            }
            if ($columnType == 'btn_txt') {
                setButtonText('Laden Sie ein kurzes Video hoch');
            }
        }
        else if ($locale == 'pt') {
            if ($columnType == 'video_title') {
                setVideoTitle('Aqui está um exemplo de vídeo que você pode gravar:');
            }
            if ($columnType == 'btn_txt') {
                setButtonText('Carregue um breve vídeo');
            }
        }
        else if ($locale == 'it') {
            if ($columnType == 'video_title') {
                setVideoTitle('Ecco un esempio di video che potete registrare:');
            }
            if ($columnType == 'btn_txt') {
                setButtonText('Caricare un breve video');
            }
        }
        else if ($locale == 'es') {
            if ($columnType == 'video_title') {
                setVideoTitle('Aquí hay un ejemplo de video que puede grabar:');
            }
            if ($columnType == 'btn_txt') {
                setButtonText('Cargue un breve video');
            }
        }

        return
    }
    const handleStoreHandle = useCallback((newValue) => {
        setStoreHandle(newValue);
        setIsHandleAvailable(true);
        setStoreHandleState(true);
        setStoreHandleResponse(null);
        const formData = new FormData();
        formData.append('store_handle', newValue);
        fetch(route("check-handle"), {
            method: "POST",
            body: formData
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setIsHandleAvailable(false);
                    setStoreHandleResponse('Available');

                } else {
                    setIsHandleAvailable(true);
                    setStoreHandleResponse('Un Available');

                }
                setStoreHandleState(false)
            })
    }, []);


    /**
     * Save Merchent Email Creds
     */
    const handleSaveEmailCredentials = () => {
        setEmailCredsError(false);
        setEmailCredsMsg('');
        if (mailgunAPI.length <= 0) {
            setEmailCredsError(true);
            setEmailCredsMsg('Api field is required');
            return;
        }
        if (senderEmail.length <= 0) {
            setEmailCredsError(true);
            setEmailCredsMsg('Email field is required');
            return;
        }
        const domain = getEmailDomain(senderEmail);

        const formData = new FormData();
        formData.append('is_active', emailCredsToggle);
        formData.append('sender_email', senderEmail);
        formData.append('api_key', mailgunAPI);
        formData.append('endpoint', 'https://api.mailgun.net/v3/' + domain + '/messages');
        // formData.append('endpoint', mailgunEndpoint);
        formData.append('domain', domain);
        fetch(route('save-email-creds'), {
            method: "POST",
            body: formData
        })
            .then((response) => response.json()).then((data) => {
                if (data.success) {
                    setSuccessMsg("Settings Added Successfully");
                    toggleActive();
                    setIsSettingSave(new Date().getSeconds());
                }
            })
    }
    const setterEmailCreds = (data) => {
        setMailgunAPI(data.data.email_creds.api_secret_key);
        setIsEmailActive(data.data.email_creds.is_active);
        setEmailCredsToggle(data.data.email_creds.is_active);
        setSenderEmail(data.data.email_creds.mail_user_name);
        setMailgunDomain(data.data.email_creds.domain);
        setMailgunEndpoint(data.data.email_creds.endpoint);
    }
    const setterGdCreds = (data) => {
        setGDConnected(true);
        setGdApi(data.data.gd_creds.api_key);
        setGdClientId(data.data.gd_creds.client_id);
        setGdSecretKey(data.data.gd_creds.secret_key);
        setGdFolder(data.data.gd_creds.folder_name);
    }

    /******* setter for klavio *********/
    const setterKlavio = (data) => {
        setKlavioConnected(true);
        setKlavioApi(data.data.klavio.api_key);
        setKlavioEmail(data.data.klavio.email);
    }

    function getEmailDomain(email) {
        // Find the index of the "@" symbol
        const atIndex = email.indexOf("@");

        // Extract the domain by slicing the string after the "@"
        const domain = email.slice(atIndex + 1);

        return domain;
    }

    /******** handle fav icon **********/
    const handleFavIcon = (e) => {
        setFavIcon(e.target.files[0]);

    }

    const handleRemoveFavIcon = () => {
        setFavIcon(null);
        setFavIconPreview(null);
    }

    /************** handle Connect to Google Drive **************/
    const handleConnectGD = () => {
        setGdError(false);
        if (gdApi.length <= 0) {
            setGdError(true);
            setGdErrorMsg('Api key is required');
            return;
        }
        if (gdClientId.length <= 0) {
            setGdError(true);
            setGdErrorMsg('Client id is required');
            return;
        }
        if (gdSecretKey.length <= 0) {
            setGdError(true);
            setGdErrorMsg('Secret key is required');
            return;
        }
        if (gdFolder.length <= 0) {
            setGdError(true);
            setGdErrorMsg('Folder name is required');
            return;
        }
        let url = baseUrl + `/connect-gd?api_key=${gdApi}&client_id=${gdClientId}
        &secret_key=${gdSecretKey}&folder_name=${gdFolder}&shop=${store}`
        window.open(url, '_blank');
    }

    /************** handle Connect to Klavio **************/
    const handleConnectKlavio = () => {

        setKlavioError(false);
        if (klavioApi.length <= 0) {
            setKlavioError(true);
            setKlavioErrorMsg('Api key is required');
            return;
        }
        if (klavioEmail.length <= 0) {
            setKlavioError(true);
            setKlavioErrorMsg('Email is required');
            return;
        }

        const formData = new FormData();
        formData.append('api_key', klavioApi);
        formData.append('email', klavioEmail);
        fetch(route('save-klavio-settings'), {
            body: formData,
            method: 'POST'
        }).then(response => response.json()).then((data) => {
            console.log(data);
        })
    }

    /********  get Settings Data  ******/
    useEffect(() => {

        async function fetchSettings() {

            try {
                const response = await fetch(route(`get_settings`));
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                const data = await response.json();
                if (data.success) {
                    setPlanName(data.data.plan_name)
                    console.log(data);
                    console.log('data');
                    setFavIconPreview(data.data.fav_icon ?? null);
                    data.data.email_creds ? setterEmailCreds(data) : ''
                    data.data.gd_creds ? setterGdCreds(data) : setGDConnected(false)
                    data.data.klavio ? setterKlavio(data) : setKlavioConnected(false)

                    setApprovedStoreHandle(data.data.storeHandle);
                    setStoreHandle(data.data.storeHandle);
                    // setting for already existing users
                    data.data.inspirational_video_title ? setVideoTitle(data.data.inspirational_video_title)
                        : setByDefaultSettings('video_title', data.data.locale)
                    data.data.video_btn_text ? setButtonText(data.data.video_btn_text)
                        : setByDefaultSettings('btn_txt', data.data.locale)



                    setToggled(data.data.email_status);
                    setPriceValue(data.data.store_credit);
                    setLandingPage(data.data.page_display_to_customers);
                    setEmailSentToValue(data.data.email_sent_to_customer);
                    setLandingPageDisplayedValue(data.data.page_link);
                    setInstructionSubTitle(data.data.instruction_subtitle ?? 'Please follow the instructions below:');
                    setFontSelected(data.data.instruction_title_font);
                    setCount(data.data.instruction_count);
                    setBtnStyle(data.data.instruction_button_style);
                    WebFont.load({
                        google: {
                            families: [data.data.instruction_title_font],
                        },
                    });
                    if (!visibleFonts.includes(data.data.instruction_title_font)) {
                        setVisibleFonts((prevFonts) => [data.data.instruction_title_font, ...prevFonts]); // Add it if not present
                    }
                    setLogoImage(data.data.logo);
                    //setVideoTitle(data.data.dropzone_text)
                    setAlreadyUploadedLogo(data.data.logo)
                    setAlreadyUploadedVideo(data.data.video)
                    setStarStoreCredit(data.data.star_credit);
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
                                    value: "Record a video (up to 30 seconds)",
                                },
                                {
                                    id: 2,
                                    value: "Share your genuine experience of the product",
                                },
                                { id: 3, value: "Showcase the product" },
                                {
                                    id: 4,
                                    value: "Explain why you've decided to try the product",
                                },
                                {
                                    id: 5,
                                    value: "Describe the main benefits of the product",
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
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSettings();
    }, [isSettingSave]);

    const languageConvert = (value) => {
        if (value === "en") {
            setRows([
                { id: 1, value: "Record a video (up to 30 seconds)" },
                {
                    id: 2,
                    value: "Share your genuine experience of the product",
                },
                { id: 3, value: "Showcase the product" },
                {
                    id: 4,
                    value: "Explain why you've decided to try the product",
                },
                {
                    id: 5,
                    value: "Describe the main benefits of the product",
                },
            ]);
            setTitle(`Send us a video and receive a discount of up to ${storeCurrency}${priceValue} on your next purchase`);
            setVideoTitle("Here's an example of a great video");
            setButtonText('Upload Your Video');

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
            setVideoTitle('Voici un exemple de vidéo que vous pouvez enregistrer:');
            setButtonText('Téléchargez une courte vidéo');
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
            setVideoTitle('Aquí hay un ejemplo de video que puede grabar:');
            setButtonText('Cargue un breve video');

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
            setVideoTitle('Aqui está um exemplo de vídeo que você pode gravar:');
            setButtonText('Carregue um breve vídeo');


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
            setVideoTitle('Ecco un esempio di video che potete registrare:');
            setButtonText('Caricare un breve video');

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
            setVideoTitle('Hier ist ein Beispiel für ein Video, das Sie aufnehmen können:');
            setButtonText('Laden Sie ein kurzes Video hoch');

        }
    }

    const handleSelectChange = (value) => {
        setEmailTemplateButton(false);
        setSelected(value);
        languageConvert(value)
    };
    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            fontFamily: state.data.value, // Apply the font dynamically
        }),
        singleValue: (provided, state) => ({
            ...provided,
            fontFamily: state.data.value, // Show selected font in preview
        }),
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
        formData.append("logo", files.length > 0 ? files[0] : logoImage);
        formData.append("video", filesVideos.length > 0 ? filesVideos[0] : video);

        formData.append("setting_status", toggled);
        formData.append("instruction_title", title);
        formData.append("video_title", videoTitle);
        formData.append("instruction_subtitle", instructionSubTitle);
        formData.append("video_btn_text", buttonText);
        formData.append('fav_icon', favIcon);
        formData.append('star_credit', starStoreCredit);
        formData.append('instruction_title_font', fontSelected);
        formData.append('instruction_count', count);
        formData.append('instruction_button_style', btnStyle);
        // if (!isHandleAvailable){
        //     formData.append("store_handle", storeHandle);
        // }


        formData.append("locale", selected);
        if (
            (priceValue == "" ||
                landingPageValue == "" ||
                emailSentToValue == "" ||
                landingPageDisplayedValue == "" ||
                rows == ""
            )
        ) {
            setError(true);
            setIsLoading(false);
        } else {
            setError(false);
            // Generating request for sending Data to the server
            fetch(route("save_settings"), {
                method: "post",
                body: formData,
            }).then((response) => response.json())
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
        fetch(route("send_test_email"), {
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
                    shopify.toast.show('Email Sent Sucessfully', {
                        duration: 5000,
                    })
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // copy Landing Page Link
    const copyLandingPageLink = () => {

        // const landingPageDisplayedValue =
        //     baseUrl + "/landingPage/" + currentLang + "?store=" + store;
        const landingPageDisplayedValue = baseUrl + "/s/" + approvedStoreHandle;


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
                marginLeft: "6px",
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



    const handleRemoveLogoThumbnail = () => {
        setFiles([]);
        //setLogoImage('')
        console.log('handle Remove thumbnail');
    };
    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            setFiles((files) => acceptedFiles);
        },
        []
    );
    const successToast = active ? (
        shopify.toast.show('Setting saved successfully', {
            duration: 3000,
        })
    ) : null;

    const handleRemoveAlreadyUploadedLogo = () => {
        setLogoImage('');
        setAlreadyUploadedLogo('');
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
                            <div onClick={handleRemoveLogoThumbnail} >
                                {/* <Icon source={CircleCancelMajor} color="critical" /> */}
                                <img src={Delete} />
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
        // setActiveTootlTip(true);
        setAlreadyUploadedVideo('');
        setVideo('');

    }

    const handleSaveStoreHandle = () => {

        const formData = new FormData();
        if (!isHandleAvailable) {
            formData.append('store_handle', storeHandle);
            fetch(route('store_handle'), {
                method: "POST",
                body: formData
            }).then((response) => response.json()).then((data) => {
                if (data.success) {
                    setSuccessMsg('save store handle');
                    toggleActive();
                    setIsSettingSave(new Date().getSeconds());
                }
            })
        }

    }

    const validVideoTypes = ['video'];

    const fileUploadVideos = !filesVideos.length && <DropZone.FileUpload actionHint="Accepts .mp4, .avi, .mov" actionTitle="Upload Your Inspirational Video" />;
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
                                {/* <Icon source={CircleCancelMajor} color="critical" /> */}
                                <img src={Delete} />
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
                                        F
                                        router.get(route(pageLink));
                                        setActiveRejectionConfirmModel(false);
                                        setEmailTemplateButton(true);
                                    }}
                                >
                                    Customize Content
                                </Button>
                                <Button primary onClick={() => {
                                    document.getElementById('sab_ok_id').click();
                                    setTimeout(() => {
                                        router.get(route(pageLink));

                                    }, 5000);

                                    setActiveRejectionConfirmModel(false);
                                    router.get(route(pageLink));

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
                                {/* <Ticker></Ticker> */}
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
                                <BlockStack gap='300'>
                                    <Card sectioned>
                                        <div>
                                            <Text variant="headingLg" as="h5">
                                                Landing Page Settings
                                            </Text>
                                            {/* <p
                                            style={{
                                                marginTop: "5px",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            Here’s what your customers will see
                                            and receive by email
                                        </p> */}

                                        </div>
                                        <br></br>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                            className="polaris-black-btn-global"
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
                                                    View the page customers will see
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    width: "200px",
                                                    textAlign: "center",
                                                    alignItems: "center",
                                                    justifyContent: "end"
                                                }}
                                                className="polaris-black-btn-global flex"
                                            >
                                                <Button
                                                    primary
                                                    onClick={() => {
                                                        reviewPage(store);
                                                    }}
                                                >
                                                    View Landing Page
                                                </Button>

                                                {/* <div style={{ cursor: "pointer" }} onClick={() => {
                                                copyCode(store);
                                            }}>
                                                <Tooltip content="Copy code"
                                                    preferredPosition="above"
                                                >
                                                    <img style={{ width: "20px" }} src={Copy} alt="" />


                                                </Tooltip>
                                            </div> */}

                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                            className="polaris-black-btn-global"
                                        >
                                            <div>

                                                <p
                                                    style={{
                                                        marginTop: "5px",
                                                        marginBottom: "10px",
                                                    }}
                                                >
                                                    Copy the code to paste it on the customizer
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    width: "200px",
                                                    textAlign: "center",
                                                    alignItems: "center",
                                                    justifyContent: "end"
                                                }}
                                                className="polaris-black-btn-global flex"
                                            >
                                                <Button
                                                    primary
                                                    onClick={() => {
                                                        copyCode(store);
                                                    }}
                                                >
                                                    Copy Landing Page Code
                                                </Button>

                                                {/* <div style={{ cursor: "pointer" }} onClick={() => {
                                                copyCode(store);
                                            }}>
                                                <Tooltip content="Copy code"
                                                    preferredPosition="above"
                                                >
                                                    <img style={{ width: "20px" }} src={Copy} alt="" />


                                                </Tooltip>
                                            </div> */}

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
                                                    Copy the landing page link to send to your customers
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    width: "200px",
                                                    textAlign: "end",
                                                }}
                                                className="polaris-black-btn-global"
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
                                                    Send Test Email
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
                                                className="polaris-black-btn-global"
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
                                        <Text variant="headingLg" as="h5">
                                            Landing Page URL
                                        </Text>
                                        <p
                                            style={{
                                                marginTop: "5px",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            Update the URL of your landing page.
                                        </p>

                                        <div style={{ display: 'flex', alignItems: "center" }} className="storeHandleParent">
                                            <div>
                                                <TextField
                                                    value={storeHandle}
                                                    onChange={(handleStoreHandle)}
                                                    autoComplete="off"
                                                    prefix={baseUrl.replace('https://', '') + '/s/'}
                                                />

                                            </div>
                                            <div style={{ marginLeft: "13px", }} className="polaris-black-btn-global">
                                                {
                                                    storeHandleState ? <Spinner accessibilityLabel="Spinner example" size="large" />
                                                        : <Button primary disabled={isHandleAvailable} onClick={handleSaveStoreHandle}>Save</Button>
                                                }


                                            </div>

                                        </div>
                                        {storeHandleResponse ? <span style={{ marginTop: "10px", display: "inline-block", color: isHandleAvailable ? 'red' : 'green' }}>{storeHandleResponse}</span> : ''}
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
                                                    Choose discount code amount for Standard approved videos
                                                </Text>
                                                <p style={{ marginTop: "15px" }}>

                                                    We recommend offering a minimum of {storeCurrency}50 to improve response rates. This can be adjusted and there is no minimum.
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
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <div style={{}}>
                                                <Text variant="headingLg" as="h5">
                                                    Choose discount code amount for Star approved videos
                                                </Text>
                                                <p style={{ marginTop: "15px" }}>
                                                    We recommend a minimum of {storeCurrency}75 to improve response rates and effort. This can be adjusted and there is no minimum.
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
                                                    value={starStoreCredit}
                                                    onChange={priceStarValueHandler}
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
                                            <span className="black-global-btn">
                                                <Button primary onClick={() => {
                                                    //setPageLink("/post-purchase-email")
                                                    document.getElementById('sab_ok_id').click();
                                                    setEmailTemplateButton(true);
                                                    //setActiveRejectionConfirmModel(true);
                                                }} disabled={emailTemplateButton}>Save</Button>
                                            </span>
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
                                                    <div onClick={handleRemoveAlreadyUploadedLogo} className="del-main-icon" >
                                                        {
                                                            activeTootlTip ? <Tooltip content="">
                                                                {/* <Icon source={CircleCancelMajor} color="critical" /> */}
                                                                {/* <Icon source={DeleteIcon}  tone="base"/> */}
                                                                {/* <Icon source={DeleteMajor} color="critical" /> */}
                                                                <img src={Delete} />

                                                            </Tooltip> : <img src={Delete} className="del-main-icon" />
                                                        }

                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        <div>
                                            <p style={{ marginTop: "5px", marginBottom: "5px" }}>
                                                Choose Favicon
                                            </p>

                                        </div>
                                        <div>
                                            <input type="file" name="fav_icon" onChange={handleFavIcon}></input>
                                        </div>
                                        <div style={{ width: "60px" }} className="delete-btn-icons">
                                            <div style={{ marginTop: "10px" }}>
                                                {
                                                    favIconPreview ? <><Thumbnail
                                                        size="medium"
                                                        alt="img"
                                                        source={favIconPreview}
                                                    />
                                                        <div onClick={() => handleRemoveFavIcon()}>
                                                            <Icon source={CircleCancelMajor} color="critical" />
                                                        </div>
                                                    </>
                                                        : ''
                                                }
                                            </div>

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
                                            <TextField2
                                                value={title}
                                                onChange={handleTitle}
                                                autoComplete="off"
                                                sx={{ width: "100%" }}
                                            />
                                            <p
                                                style={{
                                                    marginTop: "5px",
                                                    marginBottom: "5px",
                                                }}
                                            >
                                                Instructions Title Font
                                            </p>
                                            <div
                                                style={{ maxHeight: "200px", overflowY: "auto" }}
                                                onScroll={handleScroll}
                                            >

                                                <TextField2
                                                    select
                                                    value={fontSelected}
                                                    onChange={handleFontChange}
                                                    fullWidth
                                                    style={{ marginBottom: "20px" }}
                                                    InputProps={{
                                                        style: { fontFamily: fontSelected }, // Apply selected font
                                                    }}
                                                    SelectProps={{
                                                        MenuProps: {
                                                            PaperProps: {
                                                                onScroll: handleScroll, // Attach scroll event
                                                                style: { maxHeight: 200, overflowY: "auto" }, // Enable scrolling
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {visibleFonts.map((font, index) => (
                                                        <MenuItem
                                                            key={index}
                                                            value={font}
                                                            style={{ fontFamily: font }} // Preview the font in the dropdown
                                                        >
                                                            {font}
                                                        </MenuItem>
                                                    ))}
                                                </TextField2>
                                            </div>

                                            <p
                                                style={{
                                                    marginTop: "5px",
                                                    marginBottom: "5px",
                                                }}
                                            >
                                                Instructions
                                            </p>
                                            <TextField
                                                value={instructionSubTitle}
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
                                            Adjust these instructions based on what kind of videos you want.
                                        </p>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                marginTop: "20px",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            {/* <img
                                            src={ErrorIcon}
                                            style={{ marginRight: "12px" }}
                                        ></img> */}

                                            <span style={{ fontSize: '30px' }} >💡</span>
                                            <div>
                                                <p>
                                                    Tip: Be very clear in your instructions. Keep it simple.
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
                                                                style={{ cursor: "pointer", width: '20px', height: '20px', marginTop: '8px' }}
                                                                src={Delete}
                                                                onClick={() =>
                                                                    handleRemoveRow(
                                                                        row.id
                                                                    )
                                                                }
                                                            ></img>

                                                            {/* <Icon
                                                            source={DeleteIcon}
                                                            tone="base"
                                                            onClick={() =>
                                                                handleRemoveRow(
                                                                    row.id
                                                                )
                                                            }
                                                        /> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        <div style={{ marginTop: "20px" }} className="polaris-black-btn-global">
                                            <Button primary onClick={handleAddRow}>
                                                Add Step
                                            </Button>
                                        </div>

                                        <p style={{ marginTop: "10px" }}>Steps Style</p>
                                        <div style={{ display: "flex", gap: "12px" }}>

                                            <RadioButton
                                                label={<div
                                                    style={{
                                                        width: "30px", // Outer circle size
                                                        height: "30px",
                                                        borderRadius: "50%",
                                                        border: "2px solid gray", // Circle outline
                                                        display: "flex", // Center content horizontally and vertically
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        fontSize: "16px", // Adjust font size for the number
                                                        color: "black", // Text color
                                                    }}
                                                >
                                                    1
                                                </div>}
                                                checked={count === 'circle'}
                                                id="circle"
                                                name="count"
                                                onChange={handleCountChange}
                                            />

                                            <RadioButton
                                                label={<div
                                                    style={{
                                                        width: "30px", // Square size
                                                        height: "30px",
                                                        border: "2px solid gray", // Square outline
                                                        display: "flex", // Center content horizontally and vertically
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        fontSize: "16px", // Adjust font size for the number
                                                        color: "black", // Text color
                                                    }}
                                                >
                                                    1
                                                </div>}
                                                id="square"
                                                name="count"
                                                checked={count === 'square'}
                                                onChange={handleCountChange}
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
                                            <div style={{ width: "500px" }}>
                                                <Text variant="headingLg" as="h5">
                                                    Inspirational Video (optional)
                                                </Text>
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
                                                        Inspirational Video Title
                                                    </p>
                                                    <TextField
                                                        value={videoTitle}
                                                        onChange={handleDropzoneText}
                                                        autoComplete="off"
                                                    />

                                                </div>
                                                <p style={{ marginTop: "5px", marginBottom: "5px" }}>
                                                    Add an example video for your customers.
                                                </p>
                                            </div>

                                        </div>

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
                                                    <div onClick={handleRemoveAlreadyUploadedVideo} className="del-main-icon" >
                                                        {
                                                            activeTootlTip ? <Tooltip content="This is default setting. You can not change it.">
                                                                {/* <Icon source={CircleCancelMajor} color="critical" /> */}
                                                                <img src={Delete} />

                                                            </Tooltip> : <img src={Delete} />
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
                                                    Button Color
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
                                        <p style={{ marginTop: "14px" }}>Button Style</p>
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <RadioButton
                                                label="Square"
                                                checked={btnStyle === 'squaree'}
                                                id="squaree"
                                                name="btnStyle"
                                                onChange={handleBtnStyleChange}
                                            />
                                            <RadioButton
                                                label="Round"
                                                id="round"
                                                name="btnStyle"
                                                checked={btnStyle === 'round'}
                                                onChange={handleBtnStyleChange}
                                            />

                                        </div>
                                    </Card>
                                </BlockStack>


                                {/* <Card sectioned>
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
                                                    Send Emails from GoodAuthentic
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                                    If you want this app to send your emails, toggle this on. Turn off if you are sending your own.
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
                                                Post Purchase Emails

                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                                    This is the timing of the first email sent to your customer.
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
                                                    Reminder Email Cadence
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                                    Design the reminder emails sent by GoodAuthentic
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
                                                    Number of Emails to Send
                                            </Text>
                                            <p style={{ marginTop: "5px" }}>
                                                GoodAuthentic will stop sending emails after this many to each customer.
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
                                </Card> */}




                                {/* <Card sectioned>
                                    {
                                        gdError ? <Banner>
                                            <List type="bullet">
                                                {
                                                    <List.Item>{gdErrorMsg}</List.Item>

                                                }


                                            </List>
                                        </Banner> : ''
                                    }
                                    <div className="googledrivesection">
                                        <div style={{ marginBottom: "15px" }}>
                                            <Text variant="headingLg" as="h5">
                                                Google Drive
                                            </Text>
                                        </div>
                                        <p
                                            style={{
                                                marginTop: "15px",
                                                marginBottom: "15px",
                                            }}
                                        >
                                            Please contact the live support to verify your store and remove our Branding “Powered by Vidial” for FREE.
                                        </p>
                                        <div style={{ marginTop: "10px", width: "450px" }}>
                                            <TextField
                                                value={gdApi}
                                                onChange={handleSenderApi}
                                                autoComplete="off"
                                                placeholder="Set Api Key"

                                            />
                                        </div>

                                        <div style={{ marginTop: "10px", width: "450px" }}>
                                            <TextField
                                                value={gdClientId}
                                                onChange={handleSenderClientId}
                                                autoComplete="off"
                                                placeholder="Set Client Id"

                                            />
                                        </div>

                                        <div style={{ marginTop: "10px", width: "450px" }}>

                                            <TextField
                                                value={gdSecretKey}
                                                onChange={handleSenderSecKey}
                                                autoComplete="off"
                                                placeholder="Set Secret Key"
                                            />
                                        </div>

                                        <div style={{ marginTop: "10px", width: "450px" }}>

                                            <TextField
                                                value={gdFolder}
                                                onChange={handleSenderFolder}
                                                autoComplete="off"
                                                placeholder="Folder Name"
                                            />

                                        </div>

                                        <div style={{ marginTop: "10px", width: "450px" }}>

                                            <TextField
                                                value={baseUrl + '/google-login'}
                                                autoComplete="off"
                                                disabled
                                                placeholder={baseUrl + '/google-login'}
                                            />

                                        </div>

                                        <div style={{ marginTop: "20px" }} className="polaris-black-btn-global">
                                            {
                                                gDConnected ?

                                                    <Button info >
                                                        <div style={{ display: "flex" }} >

                                                            <div>Connected</div>
                                                            <div>
                                                                <Icon
                                                                    source={TickMinor}
                                                                    color="base"
                                                                />
                                                            </div>
                                                        </div>
                                                    </Button>
                                                    : <Button primary onClick={handleConnectGD}>
                                                        Connect
                                                    </Button>
                                            }
                                        </div>
                                    </div>
                                </Card> */}



                                {/* <Card sectioned>
                                    <div className="polaris-black-btn-global">
                                        <Text variant="headingLg" as="h5">
                                            Remove GoodAuthentic Watermark
                                        </Text>
                                        <p
                                            style={{
                                                marginTop: "15px",
                                                marginBottom: "15px",
                                            }}
                                        >
                                            Please contact live support to verify your store and remove the "Powered by GoodAuthentic" branding for FREE.
                                        </p>
                                        <Button primary onClick={handleChatClick}>
                                            Remove Watermark
                                        </Button>
                                    </div>
                                </Card> */}


                                <div
                                    style={{
                                        textAlign: "right",
                                        marginTop: "20px",
                                        marginBottom: "100px",
                                    }}
                                    className="polaris-black-btn-global"
                                >
                                    <Button
                                        primary
                                        onClick={saveSettings}
                                        disabled={isLoading}
                                        id="sab_ok_id"
                                    >
                                        Save Landing Page
                                    </Button>
                                </div>
                            </Grid.Cell>
                        </Grid>

                        {/* <Modal
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
                        </Modal> */}
                    </Frame>
                </Page>
            )}
        </div>
    );
};

export default Settings;
