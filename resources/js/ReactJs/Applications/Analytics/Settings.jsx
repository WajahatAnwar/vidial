
import "@/ReactJs/Applications/Analytics/Assets/css/style.css";
import "@/ReactJs/Components/toggle.css";
import { Button, Card, Form, FormLayout, Frame, Grid, Icon, Page, TextField, Toast } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';

import AppLayout from '@/ReactJs/Applications/Analytics/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
function Settings(props) {

    const page = usePage().props;
    const { query } = page.ziggy;

    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lowStock, setLowStock] = useState('5');
    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toastMarkup = active ? (
        <Toast content="Settings added successfully" onDismiss={toggleActive} />
    ) : null;



    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('low_stock', lowStock.length == 0 ? 5 : lowStock)

        try {
            const response = await fetch("/analytics/save-settings", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                toggleActive()

            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong");
        }
    }




    const handleLowStockChange = useCallback((value) => setLowStock(value), []);
    useEffect(() => {

        fetch(`/analytics/fetch-settings-content`)
            .then((response) => response.json())
            .then((result) => {
                // console.log(result);
                if (result.data.settings) {
                    setLowStock(result.data.settings.low_stock || '5')
                }
            })
            .catch((err) => {
                console.log(err);
            });

    }, [reload])


    return (
        <div style={{ background: `url('${window.appURL}/images/background.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: 'none' }}>
                            <Frame>
                                {toastMarkup}
                            </Frame>
                        </div>
                        <div style={{ display: "flex", justifyContent: 'space-between' }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => router.get(route('index_analytics', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}> Settings</div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
                <div style={{ marginTop: "18px" }}></div>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ marginRight: "150px", marginLeft: "150px" }}>
                            <Card>
                                <div style={{ fontWeight: "600", marginTop: "6px", fontSize: "16px" }}>Low Stock Quantity</div>
                                <Form onSubmit={handleSubmit}>
                                    <FormLayout>
                                        <div style={{ marginTop: "40px" }}>
                                            <TextField
                                                value={lowStock}
                                                onChange={handleLowStockChange}
                                                type="number"
                                                autoComplete="number"

                                            />
                                        </div>
                                        <div style={{ float: "right", marginTop: "15px" }}><Button submit variant="primary">Save</Button></div>
                                    </FormLayout>
                                </Form>

                            </Card>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Page >
        </div >
    );
}

Settings.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Settings;

