import {Page, Card, Button, TextField, Select, DatePicker, Tag, Stack, Tooltip, Text, Icon, Popover, TextContainer, Modal, Grid, Banner} from '@shopify/polaris';
import {useState,useCallback, useEffect} from 'react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftMinor, ArrowRightMinor, InfoMinor } from '@shopify/polaris-icons';
import "./css/style.css";

function EditCampaign() {

    const { id } = useParams();
    console.log(id);


    useEffect(() => {

        fetch( `/get_editing_campaign?campaign_id=${id}` )
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success === true) {
                setFetchResponse([data.data1,data.data2]);

                if(data.data3.discount_on == "product" || data.data3.discount_on == "all_store") {
                    const temp = [];
                    data.data1.forEach(element => temp.push({value:`${element.product_id}`, label:`${element.product_title}`}));
                    setFurtherOptions(temp);
                }

                if(data.data3.discount_on == "collection") {
                    const temp2 = [];
                    data.data2.forEach(element => temp2.push({value: `${element.collection_id}`, label:`${element.collection_title}`}));
                    setFurtherOptions(temp2);
                }

                setDeletingCampaignName(data.data3.name);
                setCampaignName(data.data3.name);
                setSelectedFurtherOption(data.data3.discount_on_data);
                setSelectedApplyOnOptions(data.data3.discount_on);

                if(data.data3.discount_on == "all_store") {
                    setShowProductCollection(false);
                }

                setSelectedDiscount(data.data3.discount_type);

                // setSelectedTags(JSON.parse(data.data3.discount_tags));

                let temp = [];
                JSON.parse(data.data3.discount_tags).forEach(element => {
                    if(data.data3.discount_type == 'fixed') {
                        temp.push(`$${element}`);
                    } else {
                        temp.push(`${element}%`);
                    }
                });
                setSelectedTags(temp);

                setSelectedDates({ start: new Date(data.data3.start_date), end: new Date(data.data3.end_date) })
            } else if(data.success === false) {

            }
        });

    },[]);





    const [newTag, setNewTag] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const removeTagInside = useCallback(
        (tag) => () => {
            setSelectedTags((previousTags) =>
            previousTags.filter((previousTag) => previousTag !== tag),
            );
        }, [],
    );

    const tagMarkup = selectedTags.map((option) => (
        <Tag key={option} onRemove={removeTagInside(option)}>
            {option}
        </Tag>
    ));

    const navigate = useNavigate();

    const [campaignName, setCampaignName] = useState('');

    const [showProductCollection, setShowProductCollection] = useState(true);

    const [fetchResponse, setFetchResponse] = useState(false);

    const [selectedApplyOnOptions, setSelectedApplyOnOptions] = useState('product');
    const applyOnOptions = [
        {label: 'Particular Product', value: 'product'},
        {label: 'Particular Collection', value: 'collection'},
        {label: 'Store Wide', value: 'all_store'},
    ];

    const [selectedFurtherOption, setSelectedFurtherOption] = useState("");
    const [furtherOptions, setFurtherOptions] = useState([]);

    const [selectedDiscount, setSelectedDiscount] = useState('fixed');
    const discountOptions = [
        {label: 'Fixed Discount', value: 'fixed'},
        {label: 'Percentage', value: 'percentage'},
    ];




    const [{month, year}, setDate] = useState({month: new Date().getMonth(), year: new Date().getFullYear()});
    // new Date("2010-02-18")
    const [datePickerPopoverActive, setDatePickerPopoverActive] = useState(false);
    const setDatePickerTogglePopoverActive = useCallback(
      () => setDatePickerPopoverActive((datePickerPopoverActive) => !datePickerPopoverActive),
      [],
    );

    const [selectedDates, setSelectedDates] = useState({ start: new Date(), end: new Date() });
    const handleMonthChange = useCallback((month, year) => setDate({month, year}), [],);

    var date = new Date(selectedDates['start']);
    var enddate = new Date(selectedDates['end']);

    const monthArr = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sep","Oct","Nov","Dec"];
    const myStartDate = date.getDate()+ " " +monthArr[date.getMonth()]+ " " +date.getFullYear();
    const myEndDate = enddate.getDate()+ " " +monthArr[enddate.getMonth()]+ " " +enddate.getFullYear();

    // console.log(myStartDate);
    // console.log(myEndDate);

    const dateRange= `${myStartDate} - ${myEndDate}`;

    const activator = (
        <div className='selectDate'>
            <div style={{marginBottom:"4px"}}>Select Duration</div>
            <Button fullWidth onClick={setDatePickerTogglePopoverActive} disclosure>
                {dateRange}
            </Button>
        </div>
    );

    const [duplicateLoading, setDuplicateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);

    const [deletingCampaignName, setDeletingCampaignName] = useState("");

    const [saveLoading, setSaveLoading] = useState(false);

    const [myError, setMyError] = useState("");
    const [myErrorVisibility, setMyErrorVisibility] = useState(false);



    const syncHandler = () => {
        fetch( "/sync_store", {
                method: "POST",
                // headers: { "content-Type": "application/json" },
                // body: formData,
            }
        )
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success === true) {

            } else if(data.success === false) {

            }
        });
    }

    const changeDiscountByHandler = (e) => {
        setSelectedApplyOnOptions(e);
        // console.log(e);

        if(e == "all_store")
        {
            setShowProductCollection(false);
        }
        else if(e == "collection"){
            setShowProductCollection(true);
            const temp = [];
            console.log(fetchResponse);
            fetchResponse[1].forEach(element => temp.push({value: `${element.collection_id}`, label:`${element.collection_title}`}));
            setFurtherOptions(temp);
            if(temp.length > 0)
                setSelectedFurtherOption(`${temp[0].value}`);
        }
        else if(e == "product"){
            setShowProductCollection(true);
            const temp = [];
            console.log(fetchResponse);
            fetchResponse[0].forEach(element => temp.push({value: `${element.product_id}`, label:`${element.product_title}`}));
            setFurtherOptions(temp);
            if(temp.length > 0)
                setSelectedFurtherOption(`${temp[0].value}`);
        }
    }

    const updateCampaignHandler = () => {

        setSaveLoading(true);

        var date = new Date(selectedDates['start']),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
        const startDate = [date.getFullYear(), mnth, day].join("-");
        var enddate = new Date(selectedDates['end']),
        endMnth = ("0" + (enddate.getMonth() + 1)).slice(-2),
        endDay = ("0" + enddate.getDate()).slice(-2);
        const endDate = [enddate.getFullYear(), endMnth, endDay].join("-");

        let temp = [...selectedTags];

        temp.forEach((element,index) => {
            element = element.replace('$','');
            element = element.replace('%','');
            temp[index] = (element);
        });

        const formData = new FormData();

        formData.append("campaign_id", id);
        formData.append("campaign_name", campaignName);
        formData.append("discount_by", selectedApplyOnOptions);
        formData.append("further_option", selectedFurtherOption);
        formData.append("start_date", startDate);
        formData.append("end_date", endDate);
        formData.append("discount_type", selectedDiscount);
        formData.append("discount_tags", JSON.stringify(temp));
        formData.append("editing_check", true);

        fetch( "/add_new_campaign", {
                method: "POST",
                // headers: { "content-Type": "application/json" },
                body: formData,
            }
        )
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success === true) {
                navigate("/campaigns");
                setSaveLoading(false);
            } else if(data.success === false) {
                setSaveLoading(false);
                setMyError(data.message)
                setMyErrorVisibility(true);
                window.scrollTo(0,0);
            }
        });
    }

    const addTagHandler = () => {

        const check = selectedDiscount == 'fixed' ? '$'+newTag : newTag+'%';
        let noErrors = true;

        if (/^\d+$/.test(newTag) == false) {

            noErrors = false;
            setMyErrorVisibility(true);
            setMyError(`"${newTag}" Tag cannot incude characters, any special charcters or spaces. Only Numbers allowed.`);
            window.scrollTo(0,0);

        } else if(selectedTags.includes(check)) {

            noErrors = false;
            setMyErrorVisibility(true);
            setMyError(`"${newTag}" Same Tag cannot be entered again.`);
            window.scrollTo(0,0);

        } else if(selectedDiscount == 'percentage') {

            if(newTag > 100) {

                noErrors = false;
                setMyErrorVisibility(true);
                setMyError(`"${newTag}" Tag cannot be greater than 100 as discount type is percentage.`);
                window.scrollTo(0,0);
            }
        }

        if(noErrors == true) {
            let temp = [...selectedTags];
            if(selectedDiscount == 'fixed') {
                temp.push(`$${newTag}`);
            } else {
                temp.push(`${newTag}%`);
            }

            setNewTag("");
            setSelectedTags(temp);
            setMyErrorVisibility(false);
        }

    }

    const duplicateHandler = () => {
        setDuplicateLoading(true);

        const formData = new FormData();
        formData.append("campaign_id", id);

        fetch( "/make_campaign_duplicate", {
                method: "POST",
                // headers: { "content-Type": "application/json" },
                body: formData,
            }
        )
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success === true) {
                setDuplicateLoading(false);
                navigate("/campaigns");
            } else if(data.success === false) {
                setDuplicateLoading(false);
            }
        });
    }

    const deleteCampaignHandler = () => {
        setDeleteLoading(true);

        fetch( `/delete_campaign?campaign_id=${id}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.success === true) {
                setDeleteLoading(false);
                navigate("/campaigns");
            } else if(data.success === false) {
                setDeleteLoading(false);
            }
        });
    }

    return (
        <Page>
            <div>
                <Modal
                    open={active}
                    onClose={handleChange}
                    title={`Delete ${deletingCampaignName}?`}
                >
                    <Modal.Section>
                    <TextContainer>
                        <p>
                            Are you sure you want to delete the campaign <strong>{deletingCampaignName}</strong>? This can't be undone.
                        </p>
                    </TextContainer>
                    </Modal.Section>
                    <Modal.Section>
                        <div style={{display:"flex",justifyContent:"flex-end"}}>
                            <div style={{display:"flex"}}>
                                <Button onClick={() => setActive(false)}>Cancel</Button>
                                <div style={{marginLeft:"10px"}}>
                                    {deleteLoading ?
                                    <Button primary loading>Delete Campaign</Button> :
                                    <Button destructive onClick={deleteCampaignHandler}>Delete Campaign</Button> }
                                </div>
                            </div>
                        </div>
                    </Modal.Section>
                </Modal>
            </div>
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
                        <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px"}}> Update Campaign </div>
                    </div>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 8, sm: 8, md: 8, lg: 8, xl: 8}}>
                <Card title="Campaign Application">
                        <Card.Section>
                            <div>
                                <TextField
                                    label="Campaign Name"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e)}
                                    autoComplete="off"
                                />
                            </div>
                        </Card.Section>
                        <Card.Section>
                            <div>
                                <Select
                                    label="Apply Mystery Discount to"
                                    options={applyOnOptions}
                                    onChange={(e) => changeDiscountByHandler(e)}
                                    value={selectedApplyOnOptions}
                                />
                            </div>
                            {showProductCollection &&
                                <div style={{marginTop:"15px"}}>
                                    <Select
                                        label={selectedApplyOnOptions == "product" ? 'Select Product' : 'Select Collection'}
                                        options={furtherOptions}
                                        onChange={(e) => setSelectedFurtherOption(e)}
                                        value={selectedFurtherOption}
                                    />
                                </div>
                            }
                        </Card.Section>
                    </Card>
                    <Card title="Make It Live">
                        <Card.Section>
                            <div className='datePickerPopover'>
                                <Popover
                                    labe
                                    active={datePickerPopoverActive}
                                    activator={activator}
                                    autofocusTarget="first-node"
                                    onClose={setDatePickerTogglePopoverActive}
                                >
                                    <div style={{padding:"20px"}}>
                                        <div className='datepickerDropdownFields'>
                                            <TextField
                                                value={myStartDate}
                                                autoComplete="off"
                                            />
                                                <div className='iconDateDropdown'>
                                                    <Icon
                                                    source={ArrowRightMinor}
                                                    color="base"
                                                    />
                                                </div>
                                            <TextField
                                                value={myEndDate}
                                                autoComplete="off"
                                            />
                                        </div>
                                        <DatePicker
                                            month={month}
                                            year={year}
                                            onChange={setSelectedDates}
                                            onMonthChange={handleMonthChange}
                                            selected={selectedDates}
                                            allowRange
                                            multiMonth
                                        />
                                        <div style={{paddingTop:"20px",borderTop: "1px solid #e1e3e5",marginTop:"16px", marginBottom:"0px"}}>
                                        </div>
                                        <div style={{display:"flex",justifyContent:"flex-end"}}>
                                            <div style={{marginRight:"10px"}}>
                                                <Button onClick={() => {setSelectedDates({ start: new Date(), end: new Date() }); setDatePickerPopoverActive(false)}}> Cancel</Button>
                                            </div>
                                            <Button primary onClick={() => setDatePickerPopoverActive(false)}> Apply </Button>
                                        </div>
                                    </div>
                                </Popover>
                            </div>
                        </Card.Section>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 4, sm: 4, md: 4, lg: 4, xl: 4}}>
                <Card title="Create Discount" subdued>
                        <Card.Section>
                            <div>
                                <Select
                                    label="Select Discount Type"
                                    options={discountOptions}
                                    onChange={(e) => {
                                        setSelectedDiscount(e);
                                        let temp = [...selectedTags];

                                        if(e == "percentage") {
                                            let secondTemp = [];
                                            temp.forEach(element => {
                                                element = element.replace('$','');
                                                element = element.replace('%','');
                                                if(element <= 100) {
                                                    secondTemp.push(element);
                                                }
                                            });
                                            temp = secondTemp;
                                        }

                                        temp.forEach((element,index) => {
                                            if(e == "percentage") {
                                                element = element.replace('$','');
                                                temp[index] = element+"%";
                                            } else {
                                                element = element.replace('%','');
                                                temp[index] = "$"+element;
                                            }
                                        });

                                        setSelectedTags(temp);
                                    }}
                                    value={selectedDiscount}
                                />
                            </div>
                            <div style={{width:"100%",marginRight:"15px"}} onKeyPress={(e) => {if (e.key === "Enter") { addTagHandler(); }}}>
                                <div style={{display:"flex", marginBottom:"4px", marginTop:"15px"}}>
                                    <p>Discount Tags</p>
                                    <Tooltip active content="This is info regarding this function.">
                                        <Text variant="bodyMd" fontWeight="bold" as="span">
                                            <div style={{marginLeft:"10px"}}> <Icon source={InfoMinor} color="base" /> </div>
                                        </Text>
                                    </Tooltip>
                                </div>
                                <TextField
                                    prefix={selectedDiscount == "fixed" ? '$' : ''}
                                    suffix={selectedDiscount == "percentage" ? '%' : ''}
                                    value={newTag}
                                    onChange={(e) => {setNewTag(e)}}
                                    placeholder="Add tag here and press enter..."
                                    type="text"
                                    style={{width:"400px"}}
                                    onKeyPress={(e) => console.log(e)}
                                />
                            </div>
                            <div style={{marginTop:"8px"}}>
                                <Stack spacing="tight">{tagMarkup}</Stack>
                            </div>
                        </Card.Section>
                    </Card>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                    <div style={{paddingTop:"20px",borderTop: "1px solid #e1e3e5",marginTop:"16px", marginBottom:"13px"}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                            <div style={{display:"flex"}}>
                                {duplicateLoading ?
                                <Button primary loading> Duplicate </Button> :
                                <Button onClick={duplicateHandler}> Duplicate </Button>}
                                <div style={{marginLeft:"10px"}}>
                                    <Button outline destructive onClick={() => setActive(true)}> Delete </Button>
                                </div>
                            </div>

                            <div style={{display:"flex"}}>
                                <Button onClick={() => navigate("/campaigns")}>Cancel</Button>
                                <div style={{marginLeft:"10px"}}>
                                    {saveLoading ?
                                    <Button primary loading>Save</Button> :
                                    <Button primary onClick={updateCampaignHandler}>Save</Button> }
                                </div>
                            </div>
                        </div>
                    </div>
                </Grid.Cell>
            </Grid>
        </Page>
    );
}
export default EditCampaign;
