import "@/ReactJs/Applications/SizeChart/Assets/css/style.css";
import { Button, Card, Grid, Icon, Page, Select, TextField } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import AppLayout from '@/ReactJs/Applications/SizeChart/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { Editor } from '@tinymce/tinymce-react';
import { unstable_batchedUpdates } from 'react-dom';
import Swal from 'sweetalert2';

function NewSizeChart({ auth }) {

    const page = usePage().props;
    const { query } = page.ziggy;

    const editorRef = useRef(null);
    const log = () => {
        if (editorRef.current) {
            console.log(editorRef.current.getContent());
        }
    };
    const [selectedTags, setSelectedTags] = useState([]);
    const removeTagInside = useCallback(
        (tag) => () => {
            setSelectedTags((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag),
            );
        }, [],
    );

    const [sizeChartName, setSizeChartName] = useState('');
    const [topText, setTopText] = useState('');
    const [bottomText, setBottomText] = useState('');

    const [selectedRule, setSelectedRule] = useState('');

    const handleSelectRule = useCallback((value) => {
        setSelectedRule(value)
    }, []);

    const [rules, setRules] = useState([]);

    const handleSave = () => {
        const saveData = async () => {
            let response = await fetch(route('size_charts.save'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: sizeChartName,
                    top_text: topText,
                    chart_data: editorRef.current.getContent(),
                    bottom_text: bottomText,
                    rule_id: selectedRule
                })
            });
            let data = await response.json();
            if (data.success) {
                router.get(route('size.charts'));
            } else {
                Swal.fire(
                    'Error!',
                    data.message,
                    'error'
                );
            }
        }
        saveData();
    }

    useEffect(() => {
        const getData = async () => {
            let response = await fetch(route('rules.all.get'));
            let data = await response.json();
            if (data.success) {
                let temp = [];
                data.data.map((value) => {
                    temp.push({
                        label: value.name,
                        value: `${value.id}`
                    })
                })
                unstable_batchedUpdates(() => {
                    setSelectedRule(temp[0].value)
                    setRules(temp);
                })
            }
        }
        getData();
    }, [])

    return (
        <div style={{ background: `url('${window.appURL}/images/background3.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => router.get(route('size.charts', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}>Add Size Chart </div>
                            </div>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Size Chart Application</p>
                            <div>
                                <TextField
                                    label="Size Chart Name"
                                    value={sizeChartName}
                                    onChange={(e) => setSizeChartName(e)}
                                    autoComplete="off"
                                />
                            </div>
                            <div style={{ marginTop: "10px" }}></div>
                            <div>
                                <div className="Polaris-Labelled__LabelWrapper"><div className="Polaris-Label"><label id="PolarisTextField1Label" htmlFor="PolarisTextField1" className="Polaris-Label__Text"><span className="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Top Text</span></label></div></div>
                                <ReactQuill theme="snow" value={topText} onChange={setTopText} />
                            </div>
                        </Card>
                        <div style={{ marginTop: "18px" }}></div>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Set Size Chart</p>
                            <Editor
                                apiKey='tq4p65b0lnb116pv78swkzt8wd98nlrb29fsrtbmhqdm24a8'
                                onInit={(evt, editor) => editorRef.current = editor}
                                initialValue="<p>This is the initial content of the editor.</p>"
                                init={{
                                    height: 250,
                                    menubar: false,
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                    ],
                                    toolbar: 'undo redo |' +
                                        'table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | blocks ' +
                                        'bold italic forecolor backcolor | alignleft aligncenter ' +
                                        'removeformat | help',
                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                }}
                            />
                            <div style={{ marginTop: "10px" }}></div>
                            {/* <button onClick={log}>Log editor content</button> */}
                        </Card>
                        <div style={{ marginTop: "18px" }}></div>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Edit Bottom Text</p>
                            <div >
                                <div className="Polaris-Labelled__LabelWrapper"><div className="Polaris-Label"><label id="PolarisTextField1Label" htmlFor="PolarisTextField1" className="Polaris-Label__Text"><span className="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">Bottom Text</span></label></div></div>
                                <ReactQuill theme="snow" value={bottomText} onChange={setBottomText} />
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 4, sm: 4, md: 4, lg: 4, xl: 4 }}>
                        <Card>
                            <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px" }}>Apply Rule</p>
                            <div>
                                <Select
                                    label="Rule"
                                    options={rules}
                                    onChange={handleSelectRule}
                                    value={selectedRule}
                                />
                            </div>
                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ paddingTop: "20px", borderTop: "1px solid #e1e3e5", marginBottom: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <div style={{ display: "flex" }}>
                                    <Button onClick={() => navigate("/campaigns")}>Discard</Button>
                                    <div style={{ marginLeft: "10px" }}>

                                        <Button variant="primary" onClick={handleSave}>Save</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
            </Page>
        </div>
    );
}
NewSizeChart.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default NewSizeChart;
