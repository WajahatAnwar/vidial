import React, { useEffect } from "react";
import {Page, Card, Button, Select, Icon, Grid, Banner, RadioButton} from '@shopify/polaris';
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftMinor } from '@shopify/polaris-icons';
import "./css/style.css";
import {DropZone, Stack, Thumbnail, Text} from '@shopify/polaris';
import {NoteMinor} from '@shopify/polaris-icons';
import {useCallback} from 'react';

const Settings = () => {

    useEffect(() => {
        fetch( "/get_current_settings")
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success === true) {
                setValue(data.data.pop_up_type);
                if(data.data.pop_up_type == "client_gif") {
                    setSavedImageLink(data.data.pop_up_data);
                }
            } else if(data.success === false) {

            }
        });
    },[]);

    const navigate = useNavigate();

    const [value, setValue] = useState('basic');
    const [savedImageLink, setSavedImageLink] = useState('images/placeholder_image.png');

    const handleChange = useCallback(
        (_checked, newValue) => {
            setValue(newValue);
            if(newValue == "client_gif") {
                setFileUploadCheck(true);
            } else {
                setFileUploadCheck(false);
            }
        },
        [],
    );

    const [fileUploadCheck, setFileUploadCheck] = useState(false);

    const [saveLoading, setSaveLoading] = useState(false);

    const [myError, setMyError] = useState("");
    const [myErrorVisibility, setMyErrorVisibility] = useState(false);

    const [file, setFile] = useState();

    const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
        setFile((file) => acceptedFiles[0]),
    [],
    );

    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const fileUpload = !file && <DropZone.FileUpload />;
    const uploadedFile = file && (
    <Stack>
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
    </Stack>
    );



    const setPopUpHandler = () => {

        setSaveLoading(true);

        console.log(file);
        console.log(value);

        const formData = new FormData();

        formData.append("pop_up_type", value);
        formData.append("new_file", file);

        fetch( "/change_pop_up_type", {
                method: "POST",
                // headers: { "content-Type": "application/json" },
                body: formData,
            }
        )
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success === true) {
                setSaveLoading(false);

                if(data.data != "") {
                    setSavedImageLink(data.data);
                }

            } else if(data.success === false) {
                setSaveLoading(false);
            }
        });
    }



    return (
        <Page>
            <Grid>
                {myErrorVisibility &&
                    <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                        <Banner
                            title="Error"
                            // action={{content: 'Review risk analysis'}}
                            status="critical"
                            onDismiss={(e) => {setMyErrorVisibility(false)}}
                        >
                            <p>
                                {myError}
                            </p>
                        </Banner>
                    </Grid.Cell>
                }
                <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                    <div style={{display:"flex"}}>
                        <div style={{ border: "1px solid", cursor:"pointer", borderColor: "#c1c1c1", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px"}}
                        onClick={() => {
                            navigate("/campaigns");
                        }}> <Icon color='base' source={ArrowLeftMinor} /> </div>
                        <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px"}}> Pop Up Settings </div>
                    </div>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 8, sm: 8, md: 8, lg: 8, xl: 8}}>
                    <Card title="Manage Pop Up">
                        <Card.Section>
                            <div>
                                <Stack vertical>
                                    <RadioButton
                                        label="Basic Text"
                                        helpText="Simple text will be display in the pop up."
                                        checked={value === 'basic'}
                                        id="basic"
                                        name="pop_up_type"
                                        onChange={handleChange}
                                    />
                                    <RadioButton
                                        label="Counter and Text"
                                        helpText="Counter will be shown after that text will be displayed."
                                        id="system_counter"
                                        name="pop_up_type"
                                        checked={value === 'system_counter'}
                                        onChange={handleChange}
                                    />
                                    <RadioButton
                                        label="System Animation"
                                        helpText="System animation will be displayed alongside with text."
                                        id="system_gif"
                                        name="pop_up_type"
                                        checked={value === 'system_gif'}
                                        onChange={handleChange}
                                    />
                                    <RadioButton
                                        label="Custom Animation"
                                        helpText="Custom animation will be displayed alongside with text."
                                        id="client_gif"
                                        name="pop_up_type"
                                        checked={value === 'client_gif'}
                                        onChange={handleChange}
                                    />
                                    <div style={{display:"flex",justifyContent:"space-between"}}>
                                        <div style={{fontWeight: "500",fontSize: "16px",paddingTop: "12px"}}>Current Image</div>
                                        <img src={`https://4e1f-2400-adc5-1b3-b500-c4af-fdd3-6142-5728.in.ngrok.io/${savedImageLink}`} width="50" alt="image"></img>
                                    </div>
                                </Stack>
                            </div>
                            {fileUploadCheck &&
                                <div style={{marginTop:"15px"}}>
                                    <DropZone allowMultiple={false}  label="Upload File" onDrop={handleDropZoneDrop}>
                                        {uploadedFile}
                                        {fileUpload}
                                    </DropZone>
                                </div>
                            }
                        </Card.Section>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 4, sm: 4, md: 4, lg: 4, xl: 4}}>
                    <Card title="Preview">
                        <Card.Section>
                            <div>
                                <img src={`https://4e1f-2400-adc5-1b3-b500-c4af-fdd3-6142-5728.in.ngrok.io/images/preview.png`} width="268" alt=""></img>
                            </div>
                        </Card.Section>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                    <div style={{paddingTop:"20px",borderTop: "1px solid #e1e3e5",marginTop:"16px", marginBottom:"13px"}}>
                        <div style={{display:"flex",justifyContent:"flex-end"}}>
                            <div style={{display:"flex"}}>
                                <Button onClick={() => navigate("/campaigns")}>Discard</Button>
                                <div style={{marginLeft:"10px"}}>
                                    {saveLoading ?
                                    <Button primary loading>Save</Button> :
                                    <Button primary onClick={setPopUpHandler}>Save</Button> }
                                </div>
                            </div>
                        </div>
                    </div>
                </Grid.Cell>
            </Grid>
        </Page>
    );
};

export default Settings;
