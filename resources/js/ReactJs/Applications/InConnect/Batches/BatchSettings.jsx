import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { router, usePage, } from "@inertiajs/react";
import { Button, Card, Grid, Icon, Modal, Page, Text, TextField } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import Toggle from '@/ReactJs/Components/ToggleSmall';


function BatchSettings({ batchSettings, shopify_vendors }) {
    const [vendors, setVendors] = useState([]);
    const [active, setActive] = useState(false);
    const page = usePage().props;
    const [singleBatchSetting, setSingleBatchSetting] = useState({});
    const handleChange = useCallback((batchSettingId = null) => {
        setSingleBatchSetting({
            id: '',
            batch_name: '',
            batch_threshold: '',
            batch_day: '',
            days_count: '',
            vendor_id: '',
        });
        if (batchSettingId) {
            const foundBatchSetting = batchSettings.find(batchSetting => batchSetting.id === batchSettingId);
            if (foundBatchSetting) {
                setSingleBatchSetting({
                    id: foundBatchSetting.id,
                    batch_name: foundBatchSetting.batch_name,
                    batch_threshold: foundBatchSetting.batch_threshold,
                    batch_day: foundBatchSetting.batch_day,
                    vendor_id: foundBatchSetting.vendor_id,
                    days_count: foundBatchSetting.days_count,
                });
            }
        }
        setActive(!active); // Toggle modal visibility
    }, [active]);

    const days = [
        { value: 'Monday', label: 'Monday' },
        { value: 'Tuesday', label: 'Tuesday' },
        { value: 'Wednesday', label: 'Wednesday' },
        { value: 'Thursday', label: 'Thursday' },
        { value: 'Friday', label: 'Friday' },
        { value: 'Saturday', label: 'Saturday' },
        { value: 'Sunday', label: 'Sunday' },
    ]

    const handleSubmit = () => {
        fetch(route('ic_batch.store'), {
            method: 'POST',
            headers: { "Content-Type": "application/json" }, // Capitalized "Content-Type"
            body: JSON.stringify(singleBatchSetting)
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success...',
                        text: data.message,
                    });
                    router.reload();
                    setActive(false);
                } else {
                    Swal.fire({
                        position: "top-end",
                        text: data.message,
                        icon: "info",
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
                console.log(data);

            });
    };

    const handleBatchList = (id) => {
        router.get(route('ic_batch.listing', { id: id }));
    };

    const updateActiveStatus = async (id, status) => {
        let response = await fetch(route('ic_batch.status'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                is_active: status,
                id: id
            }),
        });
        let data = await response.json();
        if (data.success) {
            router.reload()
            Swal.fire({
                icon: 'success',
                position: "top-end",
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    const updateMasterPoStatus = async (id, status) => {
        let response = await fetch(route('ic_batch.master_po.status'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                is_active: status,
                id: id
            }),
        });
        let data = await response.json();
        if (data.success) {
            router.reload()
            Swal.fire({
                icon: 'success',
                position: "top-end",
                text: data.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    useEffect(() => {
        let pushVendors = [];
        shopify_vendors.map((vendor) => {
            pushVendors.push({ value: vendor.id, label: vendor.name })
        });
        setVendors(pushVendors);
    }, [])

    return (
        <div className='' style={{ background: `url('${window.appURL}/images/background9.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Modal
                open={active}
                onClose={handleChange}
                title="Batch Settings"
                primaryAction={{
                    content: 'Save',
                    onAction: handleSubmit,  // Triggering the save
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleChange,
                    },
                ]}
            >
                <Modal.Section>
                    <div>
                        <TextField
                            label="Name"
                            value={singleBatchSetting.batch_name}
                            onChange={(value) => setSingleBatchSetting({ ...singleBatchSetting, batch_name: value })}
                        />

                        <div style={{ marginBottom: "10px" }}></div>
                        <TextField
                            label="Threshold ($)"
                            value={singleBatchSetting.batch_threshold}
                            type='number'
                            onChange={(value) => setSingleBatchSetting({ ...singleBatchSetting, batch_threshold: value })}
                        />

                        <div style={{ marginBottom: "10px" }}></div>
                        <div style={{ marginBottom: "3px" }}>Batch Vendor</div>
                        <Select
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            closeMenuOnSelect={true}
                            options={vendors}
                            value={vendors.find(vendor => vendor.value == singleBatchSetting.vendor_id)}  // Ensure correct vendor is selected
                            onChange={(selectedOption) => {
                                // Updating vendor_id directly
                                setSingleBatchSetting(prevState => ({
                                    ...prevState,
                                    vendor_id: selectedOption.value
                                }));
                            }}
                        />

                        <div style={{ marginBottom: "10px" }}></div>
                        <div style={{ marginBottom: "3px" }}>Batch Running Day</div>
                        <Select
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            closeMenuOnSelect={true}
                            options={days}
                            value={days.find(day => day.value == singleBatchSetting.batch_day)}  // Ensure correct day is selected
                            onChange={(selectedOption) => {
                                // Updating batch_day directly
                                setSingleBatchSetting(prevState => ({
                                    ...prevState,
                                    batch_day: selectedOption.value
                                }));
                            }}
                        />
                        {/* <div style={{ marginBottom: "10px" }}></div>
                        <TextField
                            label="Days Count"
                            value={singleBatchSetting.days_count}
                            type='number'
                            onChange={(value) => setSingleBatchSetting({ ...singleBatchSetting, days_count: value })}
                        /> */}

                    </div>
                </Modal.Section>
            </Modal>
            <Page>
                <div className='cc-inconnect-body-wraper'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                            <div style={{ display: "flex", justifyContent: 'space-between' }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('ic_index'))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Batch Settings </div>
                                </div>
                                <div>
                                    <Button variant="secondary" size='large' onClick={handleChange}>Add</Button>
                                </div>
                            </div>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}>
                            <Grid>
                                {
                                    batchSettings && batchSettings.map((batchSetting, index) => {
                                        return (
                                            <Grid.Cell key={index} columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                                <Card>
                                                    <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "15px" }}>
                                                        <div style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
                                                            Title:
                                                        </div>
                                                        <div style={{ fontSize: "14px" }}>
                                                            {batchSetting.batch_name}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "15px" }}>
                                                        <div style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
                                                            Status:
                                                        </div>
                                                        <div style={{ fontSize: "14px" }}>
                                                            <Toggle toggled={batchSetting.batch_status ? true : false} onClick={(e) => {
                                                                updateActiveStatus(batchSetting.id, e.target.checked)
                                                            }} />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "15px" }}>
                                                        <div style={{ fontSize: "14px", fontWeight: "600", marginRight: "10px" }}>
                                                            Master PO:
                                                        </div>
                                                        <div style={{ fontSize: "14px" }}>
                                                            <Toggle toggled={batchSetting.master_po ? true : false} onClick={(e) => {
                                                                updateMasterPoStatus(batchSetting.id, e.target.checked)
                                                            }} />
                                                        </div>
                                                    </div>
                                                    <Button fullWidth primary onClick={() => handleBatchList(batchSetting.id)}>Batches</Button>
                                                    <div style={{ marginBottom: "15px" }}></div>
                                                    <Button fullWidth variant='primary' onClick={() => handleChange(batchSetting.id)}>Edit</Button>
                                                </Card>
                                            </Grid.Cell>
                                        );
                                    })
                                }
                            </Grid>
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page >
        </div >
    );
}

BatchSettings.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default BatchSettings;
