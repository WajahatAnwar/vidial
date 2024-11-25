import { Text, ButtonGroup, Button, Select, Card, TextField } from "@shopify/polaris";
import { useState, useCallback } from 'react';

function OrdersSimulatorPrepareTableModal({ street_addresses, catalog }) {

    //
    const options = street_addresses.map(function (item) {
        return {
            label: `${item.label} ${item.line1}`,
            value: item.uuid
        };
    });
    const [selected, setSelected] = useState(options.length > 0 ? options[0].value : '');

    const handleSelectChange = useCallback(
        (value) => setSelected(value),
        [],
    );
    //




    const [valueName, setValueName] = useState('');
    const handleChangeName = useCallback(
        (newValueName) => setValueName(newValueName),
        [],
    );



    const [valueCurrent, setValueCurrent] = useState('');
    const handleChangeCurrent = useCallback(
        (newValueCurrent) => setValueCurrent(newValueCurrent),
        [],
    );



    return (
        <div>

            <div className="ClientinformationWrapper">

                <div className="Clientinformationheadings">
                    <div>
                        <Text variant="headingXl" as="h6">
                            Prepare Punchout
                        </Text>
                        <Text>Prepare Punchout for {catalog.PreparePunchout}</Text>
                    </div>

                </div>

                <div className="flex PreparePunchout-modal-wrapper mb-5">

                    <div className="PreparePunchout-modal-inner">
                        <Select
                            label="Ship to the Address"
                            options={options}
                            onChange={handleSelectChange}
                            value={selected}
                        />
                    </div>
                    <div className="Clientinformationbuttons">
                        <ButtonGroup>
                            <span className="multi-clor-btn"><Button variant="primary" onClick={() => {
                                var target = route('punchout.simulator.start-punchout', {
                                    id: catalog.uuid,
                                    a: selected,
                                });
                                open(target);
                            }}>Start Punchout</Button></span>
                        </ButtonGroup>
                    </div>

                </div>
                <Card>
                    <div className="Cataloginformation-simulator">
                        <div className="text-center">
                            <Text variant="headingXl">Catalog information</Text>
                        </div>
                        <TextField
                            label="Name"
                            value={catalog.PreparePunchout}
                            onChange={handleChangeName}
                            autoComplete="off"
                            disabled
                        // placeholder={`${catalog.PreparePunchout}`}
                        />
                        <div className="mt-5">
                            <TextField
                                label="Current Setup Url"
                                value={catalog.punchout_url}
                                onChange={handleChangeCurrent}
                                autoComplete="off"
                                disabled
                            // placeholder={``}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

OrdersSimulatorPrepareTableModal.layout = (page) => <AppLayout children={page} auth={page.props.auth} />


export default OrdersSimulatorPrepareTableModal;
