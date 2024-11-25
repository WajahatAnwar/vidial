import AppLayout from '@/ReactJs/Applications/Punchout/AppLayout';
import { Button, Card, Combobox, DatePicker, DropZone, Grid, Icon, InlineStack, Label, LegacyStack, Listbox, Page, Popover, Spinner, Tabs, Tag, Text, Thumbnail } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useEffect, useState } from 'react';
import { BlockStack, Modal, Select, TextField } from '@shopify/polaris';
import ToolsCustomQuotesTable from './ToolsCustomQuotesTable';
import ToolsProductQtyLimitsTable from './ToolsProductQtyLimitsTable';
import ToolsVirtualTerminalTable from './ToolsVirtualTerminalTable';
import { ImportIcon, NoteIcon, PlusIcon, SearchIcon } from '@shopify/polaris-icons';
import '../Settings/settings.css';
import ToolsDiscountCodesTable from './ToolsDiscountCodesTable';
import { CaretDownIcon } from '@shopify/polaris-icons';
import { SelectIcon } from '@shopify/polaris-icons';
import Swal from 'sweetalert2';

function Tools() {

    const [discountCode, setDiscountCode] = useState({
        clients: '',
        type: '',
        usage: '',
        label: '',
        value: '',
        max_discount: '',
        date: {
            start: new Date(),
            end: new Date(),
        }
    })

    // Date Picker code here:
    const [{ month, year }, setDate] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });

    // new Date("2010-02-18")
    const [datePickerPopoverActive, setDatePickerPopoverActive] = useState(false);
    const setDatePickerTogglePopoverActive = useCallback(
        () => setDatePickerPopoverActive((datePickerPopoverActive) => !datePickerPopoverActive),
        [],
    );

    const [selectedDates, setSelectedDates] = useState({ start: new Date(), end: new Date() });
    const handleMonthChange = useCallback((month, year) => setDate({ month, year }), [],);
    const [reload, setReload] = useState(false);

    var date = discountCode?.date?.start;
    console.log('start', discountCode?.date?.start);

    const monthArr = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const myStartDate = date.getDate() + " " + monthArr[date.getMonth()] + " " + date.getFullYear();
    // const myEndDate = enddate.getDate() + " " + monthArr[enddate.getMonth()] + " " + enddate.getFullYear();

    const activator = (
        <div className='selectDate' onClick={setDatePickerTogglePopoverActive}>
            <TextField value={myStartDate} />
        </div>
    );

    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState(false);

    const [activeCustomQuoteModal, setActiveCustomQuoteModal] = useState(false);

    const [activeDiscountCodeModal, setActiveDiscountCodeModal] = useState(false);

    const [activeProductQuantityLimitModal, setActiveProductQuantityLimitModal] = useState(false);
    const [activeProductQuantityLimitCreateModal, setActiveProductQuantityLimitCreateModal] = useState(false);

    const [selectedOptions, setSelectedOptions] = useState([]);

    const [edit, setEdit] = useState(false)

    const [quote, setQuote] = useState({
        sku: '',
    })

    const [productQuantity, setProductQuantity] = useState({
        client: '',
        action: '',
    })

    const handleDiscountCodeChange = (name, value) => {
        setDiscountCode({
            ...discountCode,
            [name]: value
        })
        setErrors({
            ...errors,
            [name]: false
        })
    }

    const handleProductQuantityChange = (name, value) => {
        setProductQuantity({
            ...productQuantity,
            [name]: value
        })
        setErrors({
            ...errors,
            [name]: false
        })
    }

    const [file, setFile] = useState(null);

    const [csv, setCsv] = useState(null);

    const [refresh, setRefresh] = useState(false);

    const handleOpenCustomQuote = useCallback(() => {
        setQuote({
            sku: '',
        })
        setRefresh(false)
        setFile(null)
        setErrors(false)
        setActiveCustomQuoteModal(!activeCustomQuoteModal)
    }, [activeCustomQuoteModal]);

    const [buttonLabel, setbuttonLabel] = useState('Create Discount Code')

    const handleOpenDiscountCode = useCallback(() => {
        setDiscountCode({
            clients: '',
            type: '',
            usage: '',
            label: '',
            value: '',
            max_discount: '',
            date: {
                start: new Date(),
                end: new Date(),
            }
        })
        setSelectedOptions([])
        setEdit(false)
        setbuttonLabel('Create Discount Code')
        setRefresh(false)
        setErrors(false)
        setActiveDiscountCodeModal(!activeDiscountCodeModal)
    }, [activeDiscountCodeModal]);

    const handleOpenProductQuantity = useCallback(() => {
        setProductQuantity({
            client: '',
            action: '',
        })
        setRefresh(false)
        setErrors(false)
        setCsv(null)
        setActiveProductQuantityLimitModal(!activeProductQuantityLimitModal)
    }, [activeProductQuantityLimitModal]);

    const handleOpenCreateProductQuantity = useCallback(() => {
        setProductQuantity({
            client: '',
            handle: '',
            min: '',
            max: '',
            multiple: '',
        })
        setRefresh(false)
        setErrors(false)
        setActiveProductQuantityLimitCreateModal(!activeProductQuantityLimitCreateModal)
    })

    const handleEditModal = useCallback((data) => {
        setDiscountCode({
            id: data.id,
            client: `${data.client_id}`,
            type: `${data.type_id}`,
            usage: `${data.usage_type_id}`,
            label: data.label,
            value: data.value,
            max_discount: data.max_discount,
            date: {
                start: new Date(data.expiry_date),
                end: new Date(data.expiry_date),
            }
        });
        setEdit(true)
        setbuttonLabel('Edit Discount Code')
        setRefresh(false)
        setErrors(false)
        setActiveDiscountCodeModal(!activeDiscountCodeModal)
    }, [activeDiscountCodeModal]);

    const [clients, setClients] = useState([])

    const [types, setTypes] = useState([])

    const actions = [
        {
            label: 'Overwrite',
            value: 'overwrite',
        },
        {
            label: 'Add',
            value: 'add',
        },
    ]

    const [usage, setUsage] = useState([])

    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelectedTab(selectedTabIndex);
    }, []);

    const tabs = [
        {
            id: 'CustomQuotes',
            content: 'Custom Quotes',
            panelID: 'content-1',
        },
        {
            id: 'DiscountCodes',
            content: 'Discount Codes',
            panelID: 'content-2',
        },
        {
            id: 'ProductQtyLimits',
            content: 'Product Qty Limits',
            panelID: 'content-3',
        },
    ];

    const handleQuoteChange = (value) => {
        setQuote({
            sku: value
        })
        setErrors({
            ...errors,
            'sku': false
        })
    }

    const handleDropZoneDrop = useCallback((_dropFiles, acceptedFiles, _rejectedFiles) => {
        setFile(acceptedFiles[0])
    }, []);

    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const fileUpload = !file && <DropZone.FileUpload />;

    const uploadedFile = file && (
        <InlineStack>
            <Thumbnail
                size="small"
                alt={file.name}
                source={
                    validImageTypes.includes(file.type)
                        ? window.URL.createObjectURL(file)
                        : NoteIcon
                }
            />
            <div className='ms-2 flex items-center gap-3'>
                {file.name}{' '}
                <Text variant="bodySm" as="p">
                    {file.size} bytes
                </Text>
            </div>
        </InlineStack >
    );

    const handleDropZoneCSV = useCallback((_dropFiles, acceptedFiles, _rejectedFiles) => {
        setCsv(_dropFiles[0])
        setErrors({
            ...errors,
            'csv': false
        })
    }, []);

    const validCsvTypes = ['text/csv'];

    const csvUpload = !csv && <DropZone.FileUpload />;

    const uploadedCsv = csv && (
        <InlineStack>
            <Thumbnail
                size="small"
                alt={csv.name}
                source={
                    validCsvTypes.includes(csv.type)
                        ? window.URL.createObjectURL(csv)
                        : NoteIcon
                }
            />
            <div className='ms-2 flex items-center gap-3'>
                {csv.name}{' '}
                <Text variant="bodySm" as="p">
                    {csv.size} bytes
                </Text>
            </div>
        </InlineStack >
    );

    const [openRelatedModal, setOpenRelatedModal] = useState(false)

    const handleCreateCustomQuote = async () => {

        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('sku', quote.sku);

        setErrors(false)

        const response = await fetch(route('punchout.custom.quote.create'), {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        setLoading(false);
        if (result.success) {
            handleOpenCustomQuote()
            setRefresh(true)
            setOpenRelatedModal(true)
        } else {
            if (response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permission.",
                })
            }
            else {

                setErrors(result.errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    }
    const handleCreateProductQuantity = async () => {

        setLoading(true);

        const formData = new FormData();
        formData.append('csv', csv);
        formData.append('client', productQuantity.client);
        formData.append('action', productQuantity.action);

        setErrors(false)

        const response = await fetch(route('punchout.product.quantity.create'), {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        setLoading(false);
        if (result.success) {
            handleOpenProductQuantity()
            Swal.fire({
                icon: 'success',
                title: 'Created...',
                text: 'Product quantity created successfully',
            });
            setRefresh(true)
        } else {
            if (response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permission.",
                })
            }
            else {

                setErrors(result.errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    }
    const handleCreateSingleProductQuantity = async () => {

        setLoading(true);

        setErrors(false)

        const response = await fetch(route('punchout.product.quantity.single.create'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productQuantity),
        });

        const result = await response.json();

        setLoading(false);
        if (result.success) {
            handleOpenCreateProductQuantity()
            Swal.fire({
                icon: 'success',
                title: 'Created...',
                text: 'Product quantity created successfully',
            });
            setRefresh(true)
        } else {
            if (response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permission.",
                })
            }
            else {

                setErrors(result.errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    }

    useEffect(() => {
        fetch(route('punchout.discount.code.select.options'))
            .then(response => response.json())
            .then(result => {
                setTypes(result.data[0].map((type) => {
                    return {
                        label: type.name,
                        value: `${type.id}`
                    }
                }));
                setClients(result.data[1].map((client) => {
                    return {
                        label: client.name,
                        value: `${client.id}`
                    }
                }));
                setUsage(result.data[2].map((usage) => {
                    return {
                        label: usage.name,
                        value: `${usage.id}`
                    }
                }));
            });
    }, []);



    const handleCreateDiscountCode = async () => {
        setLoading(true);

        setErrors(false)
        if (!discountCode.id) {
            discountCode.clients = selectedOptions
        }
        const payload = discountCode;
        // let formData = new FormData()
        // formData.append('clients', selectedOptions);
        // formData.append('type', discountCode.type);
        // formData.append('value', discountCode.value);
        // formData.append('usage', discountCode.usage);
        // formData.append('max_discount', discountCode.max_discount);
        // formData.append('label', discountCode.label);

        const response = await fetch(route('punchout.discount.code.create'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        setLoading(false);

        if (result.success) {
            handleOpenDiscountCode()
            setRefresh(true)
            Swal.fire({
                icon: 'success',
                title: 'Success...',
                text: 'Created.',
            });
        } else {
            if (response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "You don't have write permission.",
                })
            }
            else {

                setErrors(result.errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'See the form below for more information',
                });
            }
        }
    }


    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState(clients);

    const escapeSpecialRegExCharacters = useCallback(
        (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        [],
    );

    const updateText = useCallback(
        (value) => {
            setInputValue(value);

            if (value === '') {
                setOptions(clients);
                return;
            }

            const filterRegex = new RegExp(escapeSpecialRegExCharacters(value), 'i');
            const resultOptions = clients.filter((option) =>
                option.label.match(filterRegex),
            );
            setOptions(resultOptions);
            setErrors({
                ...errors,
                'clients': false,
            })
        },
        [clients, escapeSpecialRegExCharacters],
    );



    const updateSelection = useCallback(
        (selected) => {
            if (selectedOptions.includes(selected)) {
                setSelectedOptions(
                    selectedOptions.filter((option) => option !== selected),
                );
            } else {
                setSelectedOptions([...selectedOptions, selected]);
            }

            updateText('');
        },
        [selectedOptions, updateText],
    );

    const removeTag = useCallback(
        (tag) => () => {
            const options = [...selectedOptions];
            options.splice(options.indexOf(tag), 1);
            setSelectedOptions(options);
        },
        [selectedOptions],
    );

    const showLabel = (option) => {
        const selected = options.filter((client) => client.value === option)
        return selected.length > 0 ? selected[0].label : option;
    };

    const tagsMarkup = selectedOptions.map((option) => (
        <Tag key={`option-${option}`} onRemove={removeTag(option)}>
            {showLabel(option)}
        </Tag>
    ));

    const optionsMarkup =
        options.length > 0
            ? options.map((option) => {
                const { label, value } = option;

                return (
                    <Listbox.Option
                        key={`${value}`}
                        value={value}
                        selected={selectedOptions.includes(value)}
                        accessibilityLabel={label}
                    >
                        {label}
                    </Listbox.Option>
                );
            })
            : null;

    return (
        <div>
            <Page fullWidth>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}>
                        Tools
                        {/* <small style={{ display: 'block', fontWeight: '200' }}>Increased in the last 1 month</small> */}
                    </div>
                </div>
                <div className='Gateway-Activity-boxes-wrapper-PO'>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>

                            <div className='gateway-activity-tabs-wrapper'>
                                <div className='gateway-activity-tabs-inner-wrapper'>
                                    <span className='gateway-activity-tabs-inner'>
                                        <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} />
                                    </span>
                                    {selectedTab === 0 ?
                                        <Button size='large' onClick={handleOpenCustomQuote} icon={PlusIcon}>Create</Button>
                                        :
                                        selectedTab === 1 ?
                                            <Button size='large' onClick={handleOpenDiscountCode} icon={PlusIcon}>Create </Button>
                                            :
                                            selectedTab === 2 ?
                                                <div className='flex gap-2'>
                                                    <Button size='large' onClick={handleOpenProductQuantity} icon={ImportIcon}>Import</Button>
                                                    <Button size='large' onClick={handleOpenCreateProductQuantity} icon={PlusIcon}>Create </Button>
                                                </div>
                                                :
                                                null
                                    }
                                </div>
                                <div className='tables-wrapper-PO'>
                                    <Card>
                                        {selectedTab === 0 ?
                                            <div>
                                                <div className='tables-wrapper-PO-heading'>
                                                    <Text variant="headingLg" as="h5">
                                                        Custom Quotes
                                                    </Text>
                                                </div>
                                                <div>
                                                    <ToolsCustomQuotesTable refreshTable={refresh} openRelatedModal={openRelatedModal} setOpenRelatedModal={setOpenRelatedModal} />
                                                </div>
                                            </div>
                                            :
                                            selectedTab === 1 ?
                                                <div>
                                                    <div className='tables-wrapper-PO-heading'>
                                                        <Text variant="headingLg" as="h5">
                                                            Shopify Discount Codes
                                                        </Text>
                                                    </div>
                                                    <div>
                                                        <ToolsDiscountCodesTable refreshTable={refresh} handleEditModal={handleEditModal} />
                                                    </div>
                                                </div>
                                                :
                                                selectedTab === 2 ?
                                                    <div>
                                                        <div className='tables-wrapper-PO-heading'>
                                                            <Text variant="headingLg" as="h5">
                                                                Quantity Limits
                                                            </Text>
                                                        </div>
                                                        <div>
                                                            <ToolsProductQtyLimitsTable refreshTable={refresh} />
                                                        </div>
                                                    </div>
                                                    :
                                                    // selectedTab === 3 ?
                                                    //     <div>
                                                    //         <div className='tables-wrapper-PO-heading'>
                                                    //             <Text variant="headingLg" as="h5">
                                                    //                 Virtual Paytrace Terminal
                                                    //             </Text>
                                                    //         </div>
                                                    //         <div>
                                                    //             <ToolsVirtualTerminalTable />
                                                    //         </div>
                                                    //     </div>
                                                    //     :
                                                    null
                                        }
                                    </Card>
                                </div>
                            </div>
                        </Grid.Cell>
                    </Grid>
                </div>
            </Page>

            {/* Custom Quote Modal */}
            <div>
                <Modal
                    open={activeCustomQuoteModal}
                    onClose={handleOpenCustomQuote}
                    title='Create Custom Quote'
                >
                    <Modal.Section>
                        <div className='mt-5'>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <BlockStack gap="500">
                                        <div className='cstm-aesterik'>
                                            <TextField
                                                label="Quote SKU"
                                                onChange={handleQuoteChange}
                                                value={quote.sku}
                                                error={errors ? errors.sku ? errors.sku[0] : false : false}
                                            />
                                        </div>
                                    </BlockStack>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <BlockStack gap="500">
                                        <div className='tools-upload-file'>
                                            <DropZone allowMultiple={false} onDrop={handleDropZoneDrop} label="Picture File" accept="image/*" type="image" error={errors ? errors.file ? errors.file[0] : false : false}>
                                                {uploadedFile}
                                                {fileUpload}
                                            </DropZone>
                                        </div>
                                    </BlockStack>
                                </Grid.Cell>
                            </Grid>
                        </div>
                        <div className='tools-modal-import-btn multi-color-btn mt-5' >
                            <Button onClick={handleCreateCustomQuote} disabled={loading ? true : false}>{!loading ? 'Create Custom Quote' : <Spinner size='small' />}</Button>
                        </div>
                    </Modal.Section>
                </Modal>
            </div>

            {/* Discount Code Modal */}
            <div>
                <Modal
                    open={activeDiscountCodeModal}
                    onClose={handleOpenDiscountCode}
                    title={buttonLabel}
                >
                    <Modal.Section>
                        <div className='mt-5'>
                            <Grid>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                    <BlockStack gap="500">
                                        <div>
                                            {edit ?
                                                <Select
                                                    placeholder='Select'
                                                    label="Clients"
                                                    options={clients}
                                                    value={discountCode.client}
                                                    onChange={(value) => handleDiscountCodeChange('client', value)}
                                                    error={errors ? errors.clients ? errors.clients[0] : false : false}
                                                    requiredIndicator
                                                />
                                                :
                                                <>
                                                    <Label requiredIndicator>Clients</Label>
                                                    <div className='multi-select-cstm'>

                                                        <Combobox
                                                            la
                                                            allowMultiple
                                                            activator={
                                                                <Combobox.TextField
                                                                    prefix={<Icon source={SearchIcon} />}
                                                                    onChange={updateText}
                                                                    label="clients"
                                                                    labelHidden
                                                                    value={inputValue}
                                                                    placeholder="Search Clients"
                                                                    autoComplete="off"
                                                                    requiredIndicator
                                                                    error={errors ? errors.clients ? errors.clients[0] : false : false}
                                                                />

                                                            }
                                                        >
                                                            {optionsMarkup ? (
                                                                <Listbox onSelect={updateSelection}>{optionsMarkup}</Listbox>
                                                            ) : null}
                                                        </Combobox>
                                                    </div>


                                                    <div className='tools-client-tags'>
                                                        <Text>
                                                            {tagsMarkup}
                                                        </Text>
                                                    </div>
                                                </>
                                            }
                                        </div>
                                    </BlockStack>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <BlockStack gap="500">
                                        <Select
                                            placeholder='Select'
                                            label="Type"
                                            options={types}
                                            value={discountCode.type}
                                            onChange={(value) => handleDiscountCodeChange('type', value)}
                                            error={errors ? errors.type ? errors.type[0] : false : false}
                                            requiredIndicator
                                        />
                                    </BlockStack>
                                    <BlockStack gap="500">
                                        <Select
                                            placeholder='Select'
                                            label="Usage"
                                            options={usage}
                                            value={discountCode.usage}
                                            onChange={(value) => handleDiscountCodeChange('usage', value)}
                                            error={errors ? errors.usage ? errors.usage[0] : false : false}
                                            requiredIndicator
                                        />
                                    </BlockStack>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                    <BlockStack gap="500">
                                        <TextField
                                            label="Value"
                                            value={discountCode.value}
                                            onChange={(value) => handleDiscountCodeChange('value', value)}
                                            autoComplete="off"
                                            error={errors ? errors.value ? errors.value[0] : false : false}
                                            requiredIndicator
                                        />
                                    </BlockStack>
                                    <BlockStack gap="500">
                                        <div className=''>
                                            <TextField
                                                label="Max Discount"
                                                value={discountCode.max_discount}
                                                onChange={(value) => handleDiscountCodeChange('max_discount', value)}
                                                autoComplete="off"
                                                error={errors ? errors.max_discount ? errors.max_discount[0] : false : false}
                                            />
                                        </div>
                                    </BlockStack>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                    <Label requiredIndicator>Expiry Date</Label>
                                    <Popover
                                        active={datePickerPopoverActive}
                                        activator={activator}
                                        autofocusTarget="first-node"
                                        onClose={setDatePickerTogglePopoverActive}
                                    >
                                        <div style={{ padding: "20px" }}>
                                            <DatePicker
                                                month={month}
                                                year={year}
                                                disableDatesBefore={new Date()}
                                                onChange={(date) => {
                                                    setDatePickerTogglePopoverActive(false);
                                                    handleDiscountCodeChange('date', date)
                                                }}
                                                onMonthChange={handleMonthChange}
                                                selected={discountCode.date}
                                            />
                                            <div
                                                style={{
                                                    paddingTop: "20px 20px",
                                                    borderTop: "1px solid #e1e3e5",
                                                    marginTop: "16px",
                                                    marginBottom: "0px",
                                                }}
                                            ></div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                    marginTop: "20px"
                                                }}
                                            >
                                                {/* <div style={{ marginRight: "10px", }}>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedDates({
                                                                start: new Date(),
                                                                end: new Date(),
                                                            });
                                                            setDatePickerPopoverActive(
                                                                false
                                                            );
                                                            // setReload(!reload);
                                                            // handleApply(true);
                                                        }}
                                                    >
                                                        {" "}
                                                        Cancel
                                                    </Button>
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => {

                                                        // setReload(!reload);
                                                        // handleApply(null, selectedStore.value);
                                                    }}
                                                >
                                                    Apply
                                                </Button> */}
                                            </div>
                                        </div>
                                    </Popover>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                    <BlockStack gap="500">
                                        <TextField
                                            label="Label"
                                            value={discountCode.label}
                                            onChange={(value) => handleDiscountCodeChange('label', value)}
                                            autoComplete="off"
                                            requiredIndicator
                                            error={errors ? errors.label ? errors.label[0] : false : false}
                                        />
                                    </BlockStack>
                                </Grid.Cell>
                            </Grid>
                        </div>
                        <div className='tools-modal-import-btn multi-color-btn mt-5' >
                            <Button onClick={handleCreateDiscountCode} disabled={loading ? true : false}>{!loading ? buttonLabel : <Spinner size='small' />}</Button>
                        </div>
                    </Modal.Section>
                </Modal>
            </div>

            {/* Product Quantity Modal */}

            <div>
                <Modal
                    open={activeProductQuantityLimitModal}
                    onClose={handleOpenProductQuantity}
                >
                    <Modal.Section>
                        <Text variant="headingXl" as="h4">
                            Import CSV File
                        </Text>
                        <div className='mt-5'>
                            <div className='mt-5'>
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <div className='cstm-aesterik'>
                                                <Select
                                                    placeholder='Select'
                                                    label="Client"
                                                    options={clients}
                                                    onChange={(value) => handleProductQuantityChange('client', value)}
                                                    value={productQuantity.client}
                                                    error={errors ? errors.client ? errors.client[0] : false : false}
                                                />
                                            </div>
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <div className='tools-upload-file cstm-aesterik'>
                                                <DropZone allowMultiple={false} onDrop={handleDropZoneCSV} label="CSV File" accept="text/csv" type="file" out>
                                                    {uploadedCsv}
                                                    {csvUpload}
                                                </DropZone>
                                                {
                                                    errors && errors.csv &&
                                                    <div class="Polaris-Labelled__Error"><div id=":r1n:Error" class="Polaris-InlineError"><div class="Polaris-InlineError__Icon"><span class="Polaris-Icon"><svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true"><path d="M10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z"></path><path d="M11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path><path fill-rule="evenodd" d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-1.5 0a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z"></path></svg></span></div><span class="Polaris-Text--root Polaris-Text--bodyMd">{errors.csv[0]}</span></div></div>
                                                }
                                            </div>
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <div className='cstm-aesterik'>
                                                <Select
                                                    placeholder='Select'
                                                    label="Action"
                                                    options={actions}
                                                    onChange={(value) => handleProductQuantityChange('action', value)}
                                                    value={productQuantity.action}
                                                    error={errors ? errors.action ? errors.action[0] : false : false}
                                                />
                                            </div>
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <div className='multi-color-btn text-right mt-5 pt-1'>
                                                <Button onClick={handleCreateProductQuantity} disabled={loading ? true : false}>{!loading ? 'Import' : <Spinner size='small' />}</Button>
                                            </div>
                                        </BlockStack>
                                    </Grid.Cell>
                                </Grid>
                            </div>


                        </div>
                    </Modal.Section>
                </Modal>

            </div>
            <div>
                <Modal
                    open={activeProductQuantityLimitCreateModal}
                    onClose={handleOpenCreateProductQuantity}
                >
                    <Modal.Section>
                        <Text variant="headingXl" as="h4">
                            Create Product Quantity
                        </Text>
                        <div className='mt-5'>
                            <div className='mt-5'>
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <Select
                                                placeholder='Select'
                                                label="Client"
                                                options={clients}
                                                onChange={(value) => handleProductQuantityChange('client', value)}
                                                value={productQuantity.client}
                                                error={errors ? errors.client ? errors.client[0] : false : false}
                                                requiredIndicator
                                            />
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <Select
                                                placeholder='Select'
                                                label="Action"
                                                options={actions}
                                                onChange={(value) => handleProductQuantityChange('action', value)}
                                                value={productQuantity.action}
                                                error={errors ? errors.action ? errors.action[0] : false : false}
                                                requiredIndicator
                                            />
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <TextField
                                                label="Handle"
                                                value={productQuantity.handle}
                                                onChange={(value) => handleProductQuantityChange('handle', value)}
                                                autoComplete="off"
                                                requiredIndicator
                                                error={errors ? errors.handle ? errors.handle[0] : false : false}
                                            />
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <TextField
                                                label="Min"
                                                value={productQuantity.min}
                                                onChange={(value) => handleProductQuantityChange('min', value)}
                                                autoComplete="off"
                                                requiredIndicator
                                                error={errors ? errors.min ? errors.min[0] : false : false}
                                            />
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <TextField
                                                label="Max"
                                                value={productQuantity.max}
                                                onChange={(value) => handleProductQuantityChange('max', value)}
                                                autoComplete="off"
                                                requiredIndicator
                                                error={errors ? errors.max ? errors.max[0] : false : false}
                                            />
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                                        <BlockStack gap="500">
                                            <TextField
                                                label="Multiple"
                                                value={productQuantity.multiple}
                                                onChange={(value) => handleProductQuantityChange('multiple', value)}
                                                autoComplete="off"
                                                requiredIndicator
                                                error={errors ? errors.multiple ? errors.multiple[0] : false : false}
                                            />
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                                        <BlockStack gap="500">
                                            <div className='multi-color-btn text-right mt-5 pt-1'>
                                                <Button onClick={handleCreateSingleProductQuantity} disabled={loading ? true : false}>{!loading ? 'Create' : <Spinner size='small' />}</Button>
                                            </div>
                                        </BlockStack>
                                    </Grid.Cell>
                                </Grid>
                            </div>


                        </div>
                    </Modal.Section>
                </Modal>

            </div>
            {/* Third Modal ends */}

        </div>
    );
}
Tools.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Tools;
