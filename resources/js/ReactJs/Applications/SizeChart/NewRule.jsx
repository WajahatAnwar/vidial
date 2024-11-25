import AppLayout from '@/ReactJs/Applications/SizeChart/AppLayout';
import "@/ReactJs/Applications/SizeChart/Assets/css/style.css";
import { router, usePage } from '@inertiajs/react';
import { Button, Card, Grid, Icon, Page, Select, TextField, Toast } from '@shopify/polaris';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useCallback, useState } from 'react';
import Swal from 'sweetalert2';

function NewRule({ auth }) {

    const page = usePage().props;
    const { query } = page.ziggy;

    const [value, setValue] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const [active, setActive] = useState(false);

    const toggleActive = useCallback((message) => {
        setActive((active) => !active);
        setMessage(message);
    }, []);
    const toastMarkup = active ? (
        <Toast content={message} onDismiss={toggleActive} duration={3000} />
    ) : null;

    const handleChange = useCallback((newValue) => setValue(newValue), []);

    const [qualifier, setSelectedQualifier] = useState('select');

    const handleSelectQualifier = useCallback((value) => setSelectedQualifier(value), []);

    const qualifierOptions = [
        { label: 'Select', value: '' },
        { label: 'Tag', value: 'tag' },
        { label: 'Handle', value: 'handle' },
        { label: 'Product Name', value: 'product_name' },
    ];
    const [condition, setSelectedCondition] = useState('select');

    const handleSelectCondition = useCallback((value) => setSelectedCondition(value), []);

    const conditionOptions = [
        { label: 'Select', value: '' },
        { label: 'Equal', value: 'equal' },
        { label: 'Contains', value: 'contains' },
        { label: 'Begins With', value: 'begins_with' }
    ];
    const [andOr, setSelectedAndOr] = useState('select');

    const handleSelectAndOR = useCallback((value) => setSelectedAndOr(value), []);

    const andOrOptions = [
        { label: 'Select', value: '' },
        { label: 'And', value: 'and' },
        { label: 'Or', value: 'or' },
    ];
    // Add row code start
    const [rows, setRows] = useState([{ id: 1, qualifier: '', condition: "", value: 'heelo1', andOr: "" }, { id: 2, qualifier: 'tag', condition: "equal", value: 'heelo2', andOr: "and" }]);

    const handleAddRow = () => {
        setRows([...rows, { id: (rows[rows.length - 1]?.id ?? 0) + 1, qualifier: 'select', condition: "select", value: '', andOr: "select" }]);
    }

    const handleRemoveRow = (id) => {
        setRows(rows.filter(row => row.id !== id));

    }

    const handleQualifierChange = (e, index) => {


        let temp = [...rows];

        temp[index] = { ...temp[index], qualifier: e }

        setRows(temp);

    }
    const handleConditionChange = (e, index) => {


        let temp = [...rows];

        temp[index] = { ...temp[index], condition: e }

        setRows(temp);

    }

    const handleTextChange = (e, index) => {
        let temp = [...rows];

        temp[index] = { ...temp[index], value: e }

        setRows(temp);
    }
    const handleAndORChange = (e, index) => {
        let temp = [...rows];

        temp[index] = { ...temp[index], andOr: e }

        setRows(temp);
    }
    // Add row code end
    // useEffect(() => {
    //     console.log(rows)
    // }, [rows])


    const handleSave = () => {
        const saveData = async () => {
            let response = await fetch(route('add.rule'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    data: rows,
                })
            });
            let data = await response.json();
            if (data.success) {
                toggleActive(data.message);
                router.get(route('rules'))
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


    return (
        <div style={{ background: `url('${window.appURL}/images/background3.png')`, backgroundSize: "cover", marginTop: "-55px", paddingTop: "55px", height: "300px", }}>
            <Page>
                <Grid>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex" }}>
                                <div onClick={() => router.get(route('rules', query))} style={{ border: "1px solid white", cursor: "pointer", borderRadius: "4px", width: "35px", height: "35px", paddingTop: "6px", marginRight: "15px" }}> <span className="my_custom_svg_color"><Icon color='base' style={{ color: "white" }} source={ArrowLeftIcon} /></span> </div>
                                <div className='fontBigger' style={{ fontWeight: "600", marginTop: "6px", color: "white" }}>Add Rule</div>
                            </div>
                        </div>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <Card>
                            <div style={{ paddingBottom: "20px" }}><TextField label="Rule Name" value={name} onChange={setName} /></div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
                                    <h2 className="Polaris-Text--root Polaris-Text--headingMd Polaris-Text--semibold">Rules</h2>
                                    <div style={{ display: "flex" }}>
                                        {/* <Button onClick={() => navigate("/campaigns")}>Discard</Button> */}
                                        <Button onClick={handleAddRow}>Add Rule</Button>
                                        <div style={{ marginLeft: "10px" }}>

                                            <Button variant="primary" onClick={handleSave}>Save</Button>
                                        </div>
                                    </div>
                                </div>
                                {rows.map((row, index) => (
                                    <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) .4fr", gridColumnGap: "10px", marginTop: "20px" }}>
                                        <Select
                                            label="Qualifier"
                                            options={qualifierOptions}
                                            onChange={e => handleQualifierChange(e, index)}
                                            value={row.qualifier}
                                        />
                                        <Select
                                            label="Condition"
                                            options={conditionOptions}
                                            onChange={e => handleConditionChange(e, index)}
                                            value={row.condition}
                                        />
                                        <TextField
                                            label="Text"
                                            value={row.value}
                                            onChange={e => handleTextChange(e, index)}
                                            autoComplete="off"
                                        />
                                        <Select
                                            label="And / Or"
                                            options={andOrOptions}
                                            onChange={e => handleAndORChange(e, index)}
                                            value={row.andOr}
                                        />
                                        <div style={{ marginTop: "23px" }}>
                                            <Button onClick={() => handleRemoveRow(row.id)} tone="critical">Remove</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </Card>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
                        <div style={{ paddingTop: "20px", borderTop: "1px solid #e1e3e5", marginTop: "0px", marginBottom: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>

                            </div>
                        </div>
                    </Grid.Cell>
                </Grid>
                {toastMarkup}
            </Page>
        </div>
    );
}
NewRule.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default NewRule;
