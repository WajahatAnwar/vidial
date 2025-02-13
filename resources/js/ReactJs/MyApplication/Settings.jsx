import { Banner, BlockStack, Button, Card, ColorPicker, DropZone, Frame, Grid, Icon, List, Page, Popover, RadioButton, Select, Spinner, Text, TextField, Thumbnail, Tooltip, hsbToHex } from "@shopify/polaris";
import { CircleCancelMajor, NoteMinor } from "@shopify/polaris-icons";
import { MenuItem, TextField as TextField2 } from "@mui/material";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useRef, useState } from "react";
import WebFont from "webfontloader";
import './css/editor.css';
import ColorWheel from "./imges/collorWheel.png";
import Delete from "./imges/Delete.svg";
const Settings = () => {

    const shopify = useAppBridge();
    const loadedFonts = useRef(new Set());
    const batchSize = 20;
    const options = [
        { label: "English", value: "en" },
        { label: "French", value: "fr" },
        { label: "Spanish  ", value: "es" },
        { label: "Portuguese", value: "pt" },
        { label: "Italian", value: "it" },
        { label: "German", value: "de" },
    ];
    const [approvedStoreHandle, setApprovedStoreHandle] = useState(null);
    const [selected, setSelected] = useState("en");
    const [fontOptions, setFontOptions] = useState([]);
    const [fontSelected, setFontSelected] = useState('');
    const [visibleFonts, setVisibleFonts] = useState([]);
    const [storeHandle, setStoreHandle] = useState(null);
    const [isHandleAvailable, setIsHandleAvailable] = useState(false);
    const [storeHandleState, setStoreHandleState] = useState(false);
    const [storeHandleResponse, setStoreHandleResponse] = useState(null);
    const [activeTootlTip, setActiveTootlTip] = useState(false);
    const [videoTitle, setVideoTitle] = useState("");
    const [instructionSubTitle, setInstructionSubTitle] = useState("Please follow the instructions below:");
    const [title, setTitle] = useState("");
    const [buttonText, setButtonText] = useState(null);
    const [error, setError] = useState(false);
    const [toggled, setToggled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [storeCurrency, setStoreCurrency] = useState("");
    const [errorMessages, setErorrMessages] = useState([]);
    const [files, setFiles] = useState([]);
    const [alreadyUploadLogo, setAlreadyUploadedLogo] = useState('');
    const [btnStyle, setBtnStyle] = useState('squaree');
    const [count, setCount] = useState('circle');
    const [standardDiscount, setStandardDiscount] = useState("50");
    const [starDiscount, setStarDiscount] = useState("75");
    const [landingPageValue, setLandingPage] = useState("12");
    const [emailSentToValue, setEmailSentToValue] = useState("2");
    const [landingPageDisplayedValue, setLandingPageDisplayedValue] = useState("5");
    const [rows, setRows] = useState([]);
    const [buttonColorHex, setButtonColorHex] = useState("#000000");
    const [buttonColor, setButtonColor] = useState({
        hue: 0,
        brightness: 0,
        saturation: 0,
    });
    const [gradientCheck, setGradientCheck] = useState(false);
    const [logoImage, setLogoImage] = useState("");
    const [video, setVideo] = useState("");
    const [baseUrl, setBaseUrl] = useState("https://app.goodauthentic.com");
    const [previewLogo, setPreviwLogo] = useState("");
    const [previewLogoHide, setPreviewLogoHide] = useState(false);
    const [previewVedio, setPreviewVedio] = useState("");
    const [previewVedioHide, setPreviewVedioHide] = useState(false);
    const [email, setEmail] = useState("");
    const [storeName, setstoreName] = useState("");
    const [favIcon, setFavIcon] = useState(null);
    const [favIconPreview, setFavIconPreview] = useState(null);
    const [popoverActive, setPopoverActive] = useState(false);
   
    const [filesVideos, setFilesVideos] = useState([]);
    const [alreadyUploadVideo, setAlreadyUploadedVideo] = useState('');
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    const validVideoTypes = ['video'];
    const handleDropzoneText = useCallback((newValue) => setVideoTitle(newValue), []);
    const handleTitle = (event) => {
        setTitle(event.target.value);
    };
    const handleInstruction = useCallback((newValue) => setInstructionSubTitle(newValue), []);
    const handleButtonText = useCallback((newValue) => setButtonText(newValue), []);
    const handleStandardDiscount = useCallback((value) => setStandardDiscount(value), []);
    const handleStarDiscount = useCallback((value) => setStarDiscount(value), []);
    const handleInputColorChange = useCallback((newValue) => setButtonColorHex(newValue), []);
    const handleStoreHandle = useCallback((newValue) => {
        setStoreHandle(newValue);
        // setIsHandleAvailable(true);
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

    const togglePopoverActive = useCallback(
        () => setPopoverActive((popoverActive) => !popoverActive),
        [],
    );

    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            setFiles((files) => acceptedFiles);
        },
        []
    );

    const handleDropZoneVideo = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            setVideo(acceptedFiles[0]);
            setFilesVideos((filesVideos) => acceptedFiles);
        },
        []
    );


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

    const viewLandingPage = () => {
        window.open(
            "/s/" + approvedStoreHandle
        );
    };

    const copyCode = () => {
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
                            <iframe src="${iframeSrc}" frameborder="0" scrolling="no"></iframe>`;
        navigator.clipboard.writeText(codeToCopy)
            .then(() => {
                shopify.toast.show('Code Copied Successfully', {
                    duration: 3000,
                });
            })
            .catch(err => {
                shopify.toast.show('Failed to copy code', {
                    duration: 3000,
                    isError: true
                });
                console.error('Failed to copy code:', err);
            });
    };

    const copyLandingPageLink = () => {
        const landingPageDisplayedValue = baseUrl + "/s/" + approvedStoreHandle;
        navigator.clipboard.writeText(landingPageDisplayedValue);
        shopify.toast.show('Copy to clipboard', {
            duration: 3000,
        });
    };

    const sendTestMail = () => {
        fetch(route("send_test_email"), {
            method: "GET",
        })
            .then((response) => {
                if (!response.ok) {
                    shopify.toast.show('Something went wrong', {
                        duration: 3000,
                        isError: true
                    });
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
                shopify.toast.show('Something went wrong', {
                    duration: 3000,
                    isError: true
                });
                console.log(error);
            });
    };

    const chooseColor = (color) => {
        setButtonColorHex(color);
    };

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

    const handleCountChange = (bol, value) => {
        setCount(value);
    };

    const handleBtnStyleChange = (bol, value) => {
        setBtnStyle(value);
    };

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
    };

    const handleFavIcon = (e) => {
        setFavIcon(e.target.files[0]);
    };

    const handleRemoveFavIcon = () => {
        setFavIcon(null);
        setFavIconPreview(null);
    };


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
            setTitle(`Send us a video and receive a discount of up to ${storeCurrency}${standardDiscount} on your next purchase`);
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
            setTitle(`Envoyez-nous une vidéo pour obtenir une carte cadeau de ${storeCurrency}${standardDiscount}`);
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
            setTitle(`Envíanos un video para obtener una tarjeta de regalo de ${storeCurrency}${standardDiscount}`);
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
            setTitle(`Envie-nos um vídeo para receber um cartão presente de ${storeCurrency}${standardDiscount}`);
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
            setTitle(`Invia un video per ottenere una carta regalo da ${storeCurrency}${standardDiscount}`);
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
            setTitle(`Senden Sie uns ein Video, um eine Geschenkkarte im Wert von ${storeCurrency}${standardDiscount} zu erhalten`);
            setVideoTitle('Hier ist ein Beispiel für ein Video, das Sie aufnehmen können:');
            setButtonText('Laden Sie ein kurzes Video hoch');

        }
    };

    const handleSelectChange = (value) => {
        setSelected(value);
        languageConvert(value);
        shopify.toast.show('Language converted successfully', {
            duration: 3000
        });
    };


    const saveSettings = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData();

        formData.append("store_credit", standardDiscount);
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
        formData.append('star_credit', starDiscount);
        formData.append('instruction_title_font', fontSelected);
        formData.append('instruction_count', count);
        formData.append('instruction_button_style', btnStyle);
        // if (!isHandleAvailable){
        //     formData.append("store_handle", storeHandle);
        // }


        formData.append("locale", selected);
        if (
            (standardDiscount == "" ||
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
                        shopify.toast.show('Setting saved successfully', {
                            duration: 3000,
                        });

                        // setIsSettingSave(new Date().getSeconds());
                    } else {
                        setIsLoading(false);
                        setError(true);
                        setErorrMessages(data.errors);
                    }
                })
                .catch((error) => {
                    setIsLoading(false);
                    setError(true);
                });
        }
    };

    const handleRemoveLogoThumbnail = () => {
        setFiles([]);
        //setLogoImage('')
        console.log('handle Remove thumbnail');
    };

    const handleRemoveAlreadyUploadedLogo = () => {
        setLogoImage('');
        setAlreadyUploadedLogo('');
    };


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

    const handleRemoveThumbnailVideo = () => {
        setFilesVideos([]);
        //console.log('handle Remove thumbnail');
    };

    const handleRemoveAlreadyUploadedVideo = () => {
        setAlreadyUploadedVideo('');
        setVideo('');
    };

    const handleSaveStoreHandle = () => {

        const formData = new FormData();
        if (!isHandleAvailable) {
            formData.append('store_handle', storeHandle);
            fetch(route('store_handle'), {
                method: "POST",
                body: formData
            }).then((response) => response.json()).then((data) => {
                if (data.success) {
                    shopify.toast.show('Landing page url saved successfully', {
                        duration: 3000
                    });
                }
            })
        }else{
            shopify.toast.show('Store handle already exists', {
                duration: 3000,
                isError: true
            });
        }

    };

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

    async function fetchSettings() {

        try {
            const response = await fetch(route(`get_settings`));
            if (!response.ok) {
                throw new Error("Something went wrong");
            }
            const data = await response.json();
            if (data.success) {
                // setPlanName(data.data.plan_name)
                console.log(data);
                console.log('data');
                setFavIconPreview(data.data.fav_icon ?? null);
                // data.data.email_creds ? setterEmailCreds(data) : ''
                // data.data.gd_creds ? setterGdCreds(data) : setGDConnected(false)
                // data.data.klavio ? setterKlavio(data) : setKlavioConnected(false)

                setApprovedStoreHandle(data.data.storeHandle);
                setStoreHandle(data.data.storeHandle);
                // setting for already existing users
                data.data.inspirational_video_title ? setVideoTitle(data.data.inspirational_video_title)
                    : setByDefaultSettings('video_title', data.data.locale)
                data.data.video_btn_text ? setButtonText(data.data.video_btn_text)
                    : setByDefaultSettings('btn_txt', data.data.locale)



                setToggled(data.data.email_status);
                setStandardDiscount(data.data.store_credit);
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
                setStarDiscount(data.data.star_credit);
                setVideo(data.data.video);
                // setStore(data.data.store);
                setSelected(data.data?.locale ?? "en");
                // setCurrentLang(data.data.locale);
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
    };

    async function fetchGoogleFonts() {
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

    useEffect(() => {
        fetchSettings();
        fetchGoogleFonts();
    }, []);

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

                                <div style={{ marginTop: "20px" }}></div>
                                <BlockStack gap='300'>
                                    <Card sectioned>
                                        <div>
                                            <Text variant="headingLg" as="h5">
                                                Landing Page Settings
                                            </Text>
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
                                                    onClick={viewLandingPage}
                                                >
                                                    View Landing Page
                                                </Button>
                                            </div>
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
                                                    onClick={copyCode}
                                                >
                                                    Copy Landing Page Code
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
                                                    onClick={copyLandingPageLink}
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
                                                    onClick={sendTestMail}
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
                                                    error={isHandleAvailable ? 'Not Available' : ''}
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
                                                    value={standardDiscount}
                                                    onChange={handleStandardDiscount}
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
                                                    value={starDiscount}
                                                    onChange={handleStarDiscount}
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
                                            <div style={{ cursor: "pointer" }} className="polaris-black-btn-global">
                                                <Button primary
                                                    onClick={() => {
                                                        saveSettings
                                                    }}
                                                >Save</Button>
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
                                                    Your Store Logo (optional)
                                                </Text>
                                                <p style={{ marginTop: "5px", marginBottom: "5px" }}>
                                                    Should be a PNG file, not bigger than 1 MB.
                                                </p>
                                            </div>
                                        </div>
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
                                    >
                                        Save Landing Page
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

export default Settings;