import { router } from "@inertiajs/react";
import {
    Banner,
    BlockStack,
    Button,
    Card,
    Collapsible,
    DropZone,
    Frame,
    Grid,
    Icon,
    List,
    Page,
    Spinner,
    Text,
    TextField,
    Thumbnail
} from "@shopify/polaris";
import { CircleCancelMajor, HideMinor, NoteMinor, ViewMinor } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import Toggle from "./Toggle";
import './css/editor.css';
import ChevronUp from "./imges/ChevronUpMinor.png";
import arrowRight from "./imges/arrowRight.png";
import ColorWheel from "./imges/collorWheel.png";


const Email = () => {

    const [klavioError, setKlavioError] = useState(false);
    const [klavioErrorMsg, setKlavioErrorMsg] = useState('');
    const [storeHandle, setStoreHandle] = useState(null);
    const [approvedStoreHandle, setApprovedStoreHandle] = useState(null);
    const [isHandleAvailable, setIsHandleAvailable] = useState(true);
    const [storeHandleState, setStoreHandleState] = useState(false);
    const [storeHandleResponse, setStoreHandleResponse] = useState(null);
    const [emailCredsError, setEmailCredsError] = useState(false);
    const [emailCredsMsg, setEmailCredsMsg] = useState('');
    const [emailCredsToggle, setEmailCredsToggle] = useState(false);
    const [gDConnected, setGDConnected] = useState(true);


    const [isEmailActive, setIsEmailActive] = useState(false);
    const [emailConnected, setEmailConnected] = useState(null);

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
    const [activeRejectionModel, setActiveRejectionModel] = useState(false);
    const handleChangeRejectionModel = useCallback(
        () => setActiveRejectionModel(!activeRejectionModel),
        [activeRejectionModel]
    );
    const [videoTitle, setVideoTitle] = useState("");
    const [instructionSubTitle, setInstructionSubTitle] = useState("Instructions");
    const handleDropzoneText = useCallback((newValue) => setVideoTitle(newValue), []);
    const [senderEmail, setSenderEmail] = useState("");
    const [gdApi, setGdApi] = useState("");
    const [gdClientId, setGdClientId] = useState("");
    const [gdSecretKey, setGdSecretKey] = useState("");
    const [gdFolder, setGdFolder] = useState("");


    const handleSenderApi = useCallback((newValue) => setGdApi(newValue), []);
    const handleSenderClientId = useCallback((newValue) => setGdClientId(newValue), []);
    const handleSenderSecKey = useCallback((newValue) => setGdSecretKey(newValue), []);
    const handleSenderFolder = useCallback((newValue) => setGdFolder(newValue), []);
    const handleSenderEmail = useCallback((newValue) => setSenderEmail(newValue), []);


    const [mailgunAPI, setMailgunAPI] = useState("");
    const [mailgunDomain, setMailgunDomain] = useState("");
    const [mailgunEndpoint, setMailgunEndpoint] = useState("");


    const handleMailgunAPI = useCallback((newValue) => setMailgunAPI(newValue), []);
    const handleMailgunDomain = useCallback((newValue) => setMailgunDomain(newValue), []);
    const handleMailgunEndPoint = useCallback((newValue) => setMailgunEndpoint(newValue), []);
    const [title, setTitle] = useState("");
    const handleTitle = useCallback((newValue) => setTitle(newValue), []);

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
    const [isSettingSave, setIsSettingSave] = useState(false);
    const [emailTemplateButton, setEmailTemplateButton] = useState(true);
    const [files, setFiles] = useState([]);
    const [alreadyUploadLogo, setAlreadyUploadedLogo] = useState('');
    const [showApiKey, setShowApiKey] = useState(true);

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
                    setIsSettingSave(!isSettingSave);
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
        fetch(route('removeLogo'), {
            method: "post",

            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    //setPreviewVedio("")
                    setPreviewLogoHide(false);
                    setPreviwLogo("");
                    setIsSettingSave(!isSettingSave);
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
        // <Toast content={successMsg} onDismiss={toggleActive} />
        shopify.toast.show('Settings Added Sucessfullt', {
            duration: 3000,
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

    const [priceValue, setPriceValue] = useState("50");
    const [starStoreCredit, setStarStoreCredit] = useState("50");

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
    const [planName, setPlanName] = useState(null);
    const [plan, setPlan] = useState([]);
    const [favIconPreview, setFavIconPreview] = useState(null);

    const [gdError, setGdError] = useState(false);
    const [gdErrorMsg, setGdErrorMsg] = useState('');
    const [klavioApi, setKlavioApi] = useState("");
    const [klavioEmail, setKlavioEmail] = useState("");
    const [klavioConnected, setKlavioConnected] = useState(true);
    const handleKlavioEmail = useCallback((newValue) => setKlavioEmail(newValue), []);

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
        // window.open(
        //     baseUrl + "/landingPage/" + currentLang + "?store=" + store
        // );
        window.open(
            baseUrl + "/s/" + approvedStoreHandle
        );
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
        fetch(route('connect.klavio'), {
            body: formData,
            method: 'POST'
        }).then(response => response.json()).then((data) => {
            setSuccessMsg("Connected Successfully");
            setIsSettingSave(!isSettingSave);

            toggleActive();
        })
    }

    const handleDeleteKlavio = () => {

        setKlavioError(false);


        const formData = new FormData();

        fetch(route('delete.klavio'), {
            body: formData,
            method: 'POST'
        }).then(response => response.json()).then((data) => {
            setSuccessMsg("Deleted Klaviyo Credentials Successfully");
            setIsSettingSave(!isSettingSave);
            setKlavioApi('');
            setKlavioEmail('');
            toggleActive();
        })
    }


    /******* setter for klavio *********/
    const setterKlavio = (data) => {
        setKlavioConnected(true);
        setKlavioApi(data.data.klavio.api_key);
        setKlavioEmail(data.data.klavio.email);
    }
    const handleStoreHandle = useCallback((newValue) => {
        setStoreHandle(newValue);
        setIsHandleAvailable(true);
        setStoreHandleState(true);
        setStoreHandleResponse(null);
        const formData = new FormData();
        formData.append('store_handle', newValue);
        fetch(route('check-handle'), {
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
                    setIsSettingSave(!isSettingSave);
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
        setEmailConnected(data.data.email_creds);
    }
    const setterGdCreds = (data) => {
        setGDConnected(true);
        setGdApi(data.data.gd_creds.api_key);
        setGdClientId(data.data.gd_creds.client_id);
        setGdSecretKey(data.data.gd_creds.secret_key);
        setGdFolder(data.data.gd_creds.folder_name);
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
    const handleKlavioApi = useCallback((newValue) => setKlavioApi(newValue), []);


    /********  get Settings Data  ******/
    useEffect(() => {

        async function fetchSettings() {

            try {
                const response = await fetch(route('get_settings'))
                if (!response.ok) {
                    throw new Error("Something went wrong");
                }
                const data = await response.json();
                if (data.success) {
                    setPlanName(data.data.plan_name)
                    setPlan(data.data.plan)
                    setFavIconPreview(data.data.fav_icon ?? null);
                    data.data.email_creds ? setterEmailCreds(data) : ''
                    data.data.gd_creds ? setterGdCreds(data) : setGDConnected(false)

                    setApprovedStoreHandle(data.data.storeHandle);
                    setStoreHandle(data.data.storeHandle);
                    // setting for already existing users
                    data.data.inspirational_video_title ? setVideoTitle(data.data.inspirational_video_title)
                        : setByDefaultSettings('video_title', data.data.locale)
                    data.data.video_btn_text ? setButtonText(data.data.video_btn_text)
                        : setByDefaultSettings('btn_txt', data.data.locale)


                    data.data.klavio ? setterKlavio(data) : setKlavioConnected(false)
                    setToggled(data.data.email_status);
                    setPriceValue(data.data.store_credit);
                    setLandingPage(data.data.page_display_to_customers);
                    setEmailSentToValue(data.data.email_sent_to_customer);
                    setLandingPageDisplayedValue(data.data.page_link);
                    setInstructionSubTitle(data.data.instruction_subtitle ?? 'Please follow the instructions below:');
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

    /******** save settings into DB ******/
    const saveSettings = (e) => {

        e.preventDefault();
        setIsLoading(true);
        setSuccessMsg('');

        const formData = new FormData();

        formData.append("page_display_to_customers", landingPageValue);
        formData.append("email_sent_to_customer", emailSentToValue);
        formData.append("page_link", landingPageDisplayedValue);
        formData.append("setting_status", toggled);

        // setError(false);
        // Generating request for sending Data to the server
        fetch(route('save-email-tab'), {
            method: "post",
            body: formData,
        }).then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setIsLoading(false);
                    setSuccessMsg("Settings Added Successfully");
                    toggleActive();
                    setIsSettingSave(!isSettingSave);
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
    };

    function handletestemail() {
        fetch(route('send_test_email'), {
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
        // <Toast content="Settings Saved" onDismiss={true} />
        shopify.toast.show('Settings Saved', {
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
                    setIsSettingSave(!isSettingSave);
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
                                <br></br>
                                {error && (
                                    <Card sectioned>
                                        <Banner>
                                            <List type="bullet">


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


                                            </List>
                                        </Banner>
                                    </Card>
                                )}

                                {toastMarkup}
                                <div style={{ marginTop: "20px" }}></div>



                                <BlockStack gap='500'>
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
                                            <div style={{ marginTop: "20px" }}></div>


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
                                                    router.get(route('post-purchase-email'));
                                                }}
                                            >
                                                <div style={{ width: "550px" }}>
                                                    <Text variant="headingLg" as="h5">
                                                        Post Purchase
                                                    </Text>
                                                    <p style={{ marginTop: "5px" }}>
                                                        Design the post purchase emails sent by GoodAuthentic
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
                                                    router.get(route('reminder-email'));

                                                }}
                                            >
                                                <div style={{ width: "550px" }}>
                                                    <Text variant="headingLg" as="h5">
                                                        Reminder
                                                    </Text>
                                                    <p style={{ marginTop: "5px" }}>
                                                        Design the reminder emails sent by GoodAuthentic
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
                                                    router.get(route('ugc-approved-email'));

                                                }}
                                            >
                                                <div style={{ width: "550px" }}>
                                                    <Text variant="headingLg" as="h5">
                                                        Standard Approval
                                                    </Text>
                                                    <p style={{ marginTop: "5px" }}>
                                                        Design the standard approval emails sent by GoodAuthentic
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
                                                    router.get(route('ugc-star-approved'));
                                                }}
                                            >
                                                <div style={{ width: "550px" }}>
                                                    <Text variant="headingLg" as="h5">
                                                        Star Approval
                                                    </Text>
                                                    <p style={{ marginTop: "5px" }}>
                                                        Design the star approval emails sent by GoodAuthentic
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
                                                    router.get(route('ugc-declined-email'));
                                                }}
                                            >
                                                <div style={{ width: "550px" }}>
                                                    <Text variant="headingLg" as="h5">
                                                        UGC Declined
                                                    </Text>
                                                    <p style={{ marginTop: "5px" }}>
                                                        Design the declined emails sent by GoodAuthentic
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

                                    {

                                        // (planName == 'Premium' || planName == 'Enterprise' || planName == 'Standard' || planName == 'Free') ?
                                        plan.klaviyo_access ?
                                            <>
                                                {/********* Klavio  *********/}
                                                <Card sectioned>
                                                    {klavioError ? (
                                                        <Banner>
                                                            <List type="bullet">
                                                                <List.Item>{klavioErrorMsg}</List.Item>
                                                            </List>
                                                        </Banner>
                                                    ) : (
                                                        ''
                                                    )}
                                                    <div className="googledrivesection">
                                                        <div style={{ marginBottom: '15px' }}>
                                                            <Text variant="headingLg" as="h5">
                                                                Connect Klaviyo
                                                            </Text>
                                                        </div>


                                                        <div style={{ marginTop: '10px', width: '450px', position: 'relative' }}>
                                                            {console.log("data", klavioApi)}
                                                            <TextField
                                                                value={klavioApi}
                                                                onChange={handleKlavioApi}
                                                                autoComplete="off"
                                                                placeholder="Set Klaviyo API Key"
                                                                type={showApiKey ? 'password' : 'text'}
                                                            />
                                                            {klavioApi && (
                                                                <div
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: '8px',
                                                                        right: '10px',
                                                                        zIndex: '9999999',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                    onClick={() => setShowApiKey(!showApiKey)}
                                                                >
                                                                    <Icon
                                                                        source={showApiKey ? HideMinor : ViewMinor}
                                                                        color={error ? "critical" : "success"}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>




                                                        <div style={{ marginTop: '10px', width: '450px' }}>
                                                            <TextField
                                                                value={klavioEmail}
                                                                onChange={handleKlavioEmail}
                                                                autoComplete="off"
                                                                placeholder="Set Email"
                                                            />
                                                        </div>

                                                        <div style={{ marginTop: '20px' }} className="polaris-black-btn-global">
                                                            {/* {klavioConnected ? (
                                                                // <Button info>
                                                                //   <div style={{ display: 'flex' }}>
                                                                //     <div>Connected</div>
                                                                //     <div>
                                                                //       <Icon source={TickMinor} color="base" />
                                                                //     </div>
                                                                //   </div>
                                                                // </Button>
                                                                <Button primary onClick={handleConnectKlavio}>
                                                                Connect
                                                            </Button>  


                                                            ) : ( */}


                                                            <div style={{ display: "flex", alignItems: "center", }}>


                                                                {
                                                                    klavioConnected ?
                                                                        <div id="greenDisButton" className="green-disconnect-button">
                                                                            <Button onClick={handleDeleteKlavio}

                                                                                style={{ marginRight: "10px" }}
                                                                            >
                                                                                {/* <div style={{ display: "flex" }}>
                                                                                <div> */}
                                                                                Disconnect
                                                                                {/* </div> */}
                                                                            </Button>
                                                                        </div>


                                                                        : <Button primary onClick={handleConnectKlavio} style={{ marginRight: "10px" }} >
                                                                            Connect
                                                                        </Button>
                                                                }
                                                                {/* <Button style={{marginLeft: "10px" }} primary onClick={handleDeleteKlavio}>
                                                                    Delete Credientials
                                                                </Button> */}

                                                                {/* {klavioConnected ?
                                                                <div style={{marginLeft:"20px",cursor: 'pointer'}} onClick={handleDeleteKlavio}   > */}
                                                                {/* <Icon 
                                                                    source={DeleteMajor} 
                                                                    color="critical" // Red color for a delete action
                                                                    accessibilityLabel="Delete Credentials"
                                                                    
                                                                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                                                                /> */}
                                                                {/* <Button primary  style={{marginRight: "10px" }} >
                                                                    Disconnet
                                                                </Button> */}

                                                                {/* </div> : ""
                                                                } */}


                                                            </div>


                                                            {/* )} */}
                                                        </div>
                                                    </div>
                                                </Card>



                                                {/* <Card sectioned>
                                        <div className="googledrivesection">
                                            <div style={{ marginTop: "20px" }}></div>
                                            <div style={{ display: "flex", alignItems: "center", marginRight: "5px" }} >
                                                <div style={{ width: "450px" }}>
                                                    <Text variant="headingLg" as="h5">
                                                        Connect Mailgun
                                                    </Text>


                                                    {
                                                        emailCredsError ? <Banner>
                                                            <List type="bullet">
                                                                {
                                                                    <List.Item>{emailCredsMsg}</List.Item>

                                                                }


                                                            </List>
                                                        </Banner> : ''
                                                    }
                                                </div>


                                            </div>

                                                    <>

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
                                                            <p style={{ color: "#717171", marginTop: "5px" }}>Paste your <a href="https://www.mailgun.com/blog/product/getting-started-with-mailgun-introduction-to-platform-training/" target="blank" style={{ color: "#008060", textDecoration: "underline" }}>Mailgun</a> API Key here. <a href="https://documentation.mailgun.com/en/latest/index.html" target="blank" style={{ color: "#008060", textDecoration: "underline" }}>See how it works</a></p>
                                                        </div>
                                                        <div
                                                            style={{
                                                                width: "450px",
                                                                marginTop: "10px",
                                                            }}
                                                        >



                                                            <TextField
                                                                value={senderEmail}
                                                                onChange={handleSenderEmail}
                                                                autoComplete="off"
                                                                placeholder="noreply@goodauthentic.com"
                                                            />
                                                            <p style={{ color: "#717171", marginTop: "5px" }}>Enter the email address that will be used as the sender.</p>

                                                        </div>

                                                        <div
                                                style={{
                                                    width: "450px",
                                                    marginTop: "10px",
                                                }}
                                            >


                                                <TextField
                                                    value={mailgunDomain}
                                                    onChange={handleMailgunDomain}
                                                    autoComplete="off"
                                                    placeholder="Mailgun Domain"
                                                />
                                                <p style={{ color: "#717171", marginTop: "5px" }}>Enter the Mailgun Domain.</p>

                                            </div>


                                            <div
                                                style={{
                                                    width: "450px",
                                                    marginTop: "10px",
                                                }}
                                            >

                                                <TextField
                                                    value={mailgunEndpoint}
                                                    onChange={handleMailgunEndPoint}
                                                    autoComplete="off"
                                                    placeholder="Mailgun Endpoint"
                                                />
                                                <p style={{ color: "#717171", marginTop: "5px" }}>Enter the Mailgun endpoint.</p>

                                            </div>
                                                        {
                                                            emailConnected ?
                                                                <div
                                                                    style={{
                                                                        width: "450px",
                                                                        marginTop: "10px",
                                                                    }}
                                                                    className="polaris-black-btn-global"
                                                                >
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
                                                                </div> : <div
                                                                    style={{
                                                                        width: "450px",
                                                                        marginTop: "10px",
                                                                    }}
                                                                >
                                                                    <Button primary onClick={handleSaveEmailCredentials}>Connect</Button>
                                                                </div>}
                                                    </>
                                        </div>
                                    </Card> */}
                                            </>
                                            : null

                                    }
                                </BlockStack>
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
                                        Save Emails
                                    </Button>
                                </div>
                            </Grid.Cell>
                        </Grid>
                    </Frame>
                </Page>
            )}
        </div>
    );
};

export default Email;
