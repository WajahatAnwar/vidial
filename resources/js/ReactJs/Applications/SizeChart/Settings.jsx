import "@/ReactJs/Applications/SizeChart/Assets/css/style.css";
import { Button, Card, ColorPicker, Grid, hsbToHex, Icon, Page, TextField, Toast } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useCallback, useState } from 'react';
// import rulerIcon from './images/rulerIcon.svg'
import AppLayout from "@/ReactJs/Applications/SizeChart/AppLayout";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faCapsules,
    faCartShopping,
    faDollarSign,
    faHospitalUser,
    faHouseUser,
    faMoneyBill1,
    faMoneyBillTrendUp,
    faPersonWalking,
    faRulerHorizontal,
    faRupeeSign,
    faSterlingSign,
    faTruck,
    faUserDoctor,
    faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { router, usePage } from "@inertiajs/react";
library.add(faCapsules, faHouseUser, faUserDoctor, faHospitalUser, faUserGroup, faMoneyBill1, faPersonWalking,
    faMoneyBillTrendUp, faDollarSign, faSterlingSign, faRupeeSign, faCartShopping, faTruck, faRulerHorizontal,
);
const Settings = ({ auth, setting }) => {

    const page = usePage().props;
    const { query } = page.ziggy;

    // const navigate = useNavigate();
    const [active, setActive] = useState(false);
    const [message, setMessage] = useState('');
    const [buttonText, setButtonText] = useState(setting?.button_text ?? '');
    const [colorHandleHideButtonBg, setColorHandleButtonBg] = useState(false);
    const [hexColorButtonBg, setHexColorButoonBg] = useState(setting?.button_background ?? '');
    const [colorButoonTextBg, setColorButtonBg] = useState({
        hue: 120,
        brightness: 1,
        saturation: 1,
    });
    const [colorHandleHideButtonText, setColorHandleButtonText] = useState(false);
    const [hexColorButtonText, setHexColorButoonText] = useState(setting?.button_text_color ?? '');
    const [colorButoonText, setColorButtonText] = useState({
        hue: 120,
        brightness: 1,
        saturation: 1,
    });

    const toggleActive = useCallback((message) => {
        setActive((active) => !active);
        setMessage(message);
    }, []);

    const toastMarkup = active ? (
        <Toast content={message} onDismiss={toggleActive} duration={3000} />
    ) : null;

    const handleUpdate = () => {
        const updateSetting = async () => {
            let response = await fetch(route('settings.update'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    button_text: buttonText,
                    button_background: hexColorButtonBg,
                    button_text_color: hexColorButtonText
                })
            });
            let data = await response.json();
            if (data.success) {
                toggleActive(data.message);
                // router.get(route('rules'))
            }
        }
        updateSetting();
    }


    return (
        <div style={{ background: `url('${window.appURL}/images/background3.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => router.get(route('index_size_chart', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Button Settings</div>
                            </div>
                            <Button onClick={() => router.get(route('new.rule'))}>New Rules +</Button>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Manage Button</p>
                            <TextField
                                value={buttonText}
                                type="text"
                                label="Button Text"
                                onChange={(e) => {
                                    setButtonText(e);
                                }}
                            />
                            <div style={{ paddingTop: "20px" }}>
                                <div  >
                                    <TextField
                                        value={hexColorButtonBg}
                                        label="Button Background"
                                        type="text"
                                        onBlur={() => setColorHandleButtonBg(!colorHandleHideButtonBg)}
                                        onFocus={() => setColorHandleButtonBg(!colorHandleHideButtonBg)}
                                        onChange={(e) => {
                                            let rgb_temp = convert.hex.rgb(e);
                                            // console.log(rgb_temp);
                                            setColorButtonBg(rgbToHsb({
                                                red: rgb_temp[0],
                                                green: rgb_temp[1],
                                                blue: rgb_temp[2]
                                            }));
                                            setHexColorCTAButoonBg(e);
                                        }}
                                    />
                                </div>
                                {colorHandleHideButtonBg &&
                                    <div style={{ marginTop: "20px" }}>
                                        <ColorPicker onChange={(e) => {
                                            setColorButtonBg(e)
                                            setHexColorButoonBg(hsbToHex(e))
                                        }} color={colorButoonTextBg} />
                                    </div>
                                }
                            </div>
                            <div style={{ paddingTop: "20px" }}>
                                <div  >
                                    <TextField
                                        value={hexColorButtonText}
                                        label="Button Text Color"
                                        type="text"
                                        onBlur={() => setColorHandleButtonText(!colorHandleHideButtonText)}
                                        onFocus={() => setColorHandleButtonText(!colorHandleHideButtonText)}
                                        onChange={(e) => {
                                            let rgb_temp = convert.hex.rgb(e);
                                            // console.log(rgb_temp);
                                            setColorButtonText(rgbToHsb({
                                                red: rgb_temp[0],
                                                green: rgb_temp[1],
                                                blue: rgb_temp[2]
                                            }));
                                            setHexColorButoonText(e);
                                        }}
                                    />
                                </div>
                                {colorHandleHideButtonText &&
                                    <div style={{ marginTop: "20px" }}>
                                        <ColorPicker onChange={(e) => {
                                            setColorButtonText(e)
                                            setHexColorButoonText(hsbToHex(e))
                                        }} color={colorButoonText} />
                                    </div>
                                }
                            </div>

                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Preview</p>
                            <div style={{ textAlign: "center" }}>
                                <button style={{ padding: "10px 20px", borderTopRightRadius: "5px", borderTopLeftRadius: "5px", border: "none", color: hexColorButtonText, background: hexColorButtonBg }}><div style={{ display: "flex", alignItems: "center" }}><FontAwesomeIcon icon={faRulerHorizontal} style={{ marginRight: "3px", marginTop: "1px" }} />{buttonText}</div></button>
                            </div>

                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ paddingTop: "20px", borderTop: "1px solid #e1e3e5", marginTop: "0px", marginBottom: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <div style={{ display: "flex" }}>
                                    <Button onClick={() => router.get(route('index'))}>Discard</Button>
                                    <div style={{ marginLeft: "10px" }}>
                                        <Button variant="primary" onClick={handleUpdate}>Save</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
                {toastMarkup}
            </Page>
        </div>
    );
};
Settings.layout = (page, auth) => <AppLayout children={page} auth={page.props.auth} />
export default Settings;
