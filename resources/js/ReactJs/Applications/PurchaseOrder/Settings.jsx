import AppLayout from '@/ReactJs/Applications/PurchaseOrder/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { Button, Card, DropZone, Grid, Icon, Page, Text, Thumbnail } from '@shopify/polaris';
import { ArrowLeftIcon, NoteIcon } from '@shopify/polaris-icons';
import "@shopify/polaris/build/esm/styles.css";
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Settings(props) {

    const page = usePage().props;
    const { query } = page.ziggy;

    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [loading3, setLoading3] = useState(false);
    const [rowsCount, setRowsCount] = useState(0);

    useEffect(() => {
        fetch(`/purchase_order/get_button_settings`)
            .then((response) => response.json())
            .then((result) => {
                if (result.data3 > 0) {
                    setRowsCount(result.data3)
                }
                else {
                    setRowsCount(0);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const [file, setFile] = useState(false);

    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) =>
            setFile((file) => acceptedFiles[0]),
        [],
    );

    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const fileUpload = !file && <DropZone.FileUpload />;
    const uploadedFile = file && (
        <div>
            <Thumbnail
                size="small"
                alt={file.name}
                source={
                    validImageTypes.includes(file.type)
                        ? window.URL.createObjectURL(file)
                        : NoteIcon
                }
            />
            <div>
                {file.name}{' '}
                <Text variant="bodySm" as="p">
                    {file.size} bytes
                </Text>
            </div>
        </div>
    );

    function uploadCsvHanlder() {
        console.log(file);

        if (file == false) {
            Swal.fire(
                'Error',
                'Kindly upload file first!',
                'error'
            )
        }
        else {

            const formData = new FormData();
            formData.append(`csv_file`, file);
            // console.log(e);
            fetch(`/purchase_order/import_csv`, {
                method: "POST",
                // headers: { "content-Type": "application/json" },
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    if (data.status === true) {
                        setFile(false);
                        setRowsCount(data.data)
                        setLoading3(false);
                        Swal.fire(
                            'Success!',
                            'CSV file uploaded',
                            'success'
                        )
                    } else {
                        Swal.fire(
                            'Error!',
                            data.message,
                            'error'
                        )
                    }
                });
        }
    }

    function downloadCsvHandler() {
        setLoading1(true);
        // window.open("/export_csv", '_blank')
        window.open("/purchase_order/export_csv");
        setLoading1(false);;

        Swal.fire(
            'Success!',
            "CSV file downloaded",
            'success'
        )
    }

    function removeCsvHandler() {
        // console.log(file);
        setLoading2(true);
        const formData = new FormData();
        formData.append(`csv_file`, file);
        // console.log(e);
        fetch(`/purchase_order/remove_csv`, {
            method: "POST",
            // headers: { "content-Type": "application/json" },
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.status === true) {
                    setFile(false);
                    setRowsCount(0)
                    setLoading2(false);

                    Swal.fire(
                        'Success!',
                        'CSV file removed',
                        'success'
                    )
                }
            });
    }

    return (
        <div style={{ background: `url('${window.appURL}/images/background6.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex" }}>
                                    <div onClick={() => router.get(route('reports', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                    <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Settings</div>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Min & Max Settings</p>
                            <div >
                                <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "10px" }}>Upload CSV</p>
                                {rowsCount > 0 ?
                                    <p>CSV Uploaded with {rowsCount} Handles</p> :
                                    <p>CSV Not Uploaded</p>
                                }
                            </div>
                            <div style={{ display: "flex", justifyContent: 'space-between', marginBottom: "30px", marginTop: "30px" }}>
                                <div>
                                    {loading1 == false ?
                                        <Button onClick={downloadCsvHandler}>Download Current CSV</Button> :
                                        <Button loading>loading</Button>
                                    }
                                </div>
                                <div>
                                    {loading2 == false ?
                                        <Button tone="critical" onClick={removeCsvHandler}>Remove CSV</Button> :
                                        <Button loading>loading</Button>
                                    }

                                </div>
                                <div>
                                    {loading3 == false ?
                                        <Button variant="primary" onClick={uploadCsvHanlder}>Upload CSV</Button> :
                                        <Button loading>loading</Button>
                                    }
                                </div>
                            </div>
                            <div>
                                <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                                    {uploadedFile}
                                    {fileUpload}
                                </DropZone>
                            </div>
                        </Card>
                        <div style={{ marginTop: "18px" }}></div>
                    </Grid.Cell>
                </Grid>
            </Page >
        </div >
    );
}

Settings.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Settings;
