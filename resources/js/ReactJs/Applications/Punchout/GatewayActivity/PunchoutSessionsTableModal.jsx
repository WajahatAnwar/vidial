// import type {IndexFiltersProps, TabProps} from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";

import { useCallback, useEffect, useState } from 'react';

import { Grid, Card, Tabs, Text } from '@shopify/polaris';
import CodeDisplay from "./CodeDisplay";
import PunchoutGatewayOrderRequest from "./PunchoutGatewayOrderRequest";
function PunchoutSessionsTableModal({ selectedSession }) {

    const [session, setSession] = useState(false)

    useEffect(() => {
        fetch(route('punchout.session.detail', { session: selectedSession.id }))
            .then(response => response.json())
            .then(result => {
                console.log(result);
                setSession(result);
            });

    }, []);

    const [selected, setSelected] = useState(0);
    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);
    }, []);

    const tabs = [
        {
            id: 'Order',
            content: 'Order',
            panelID: 'Order-1',
        },
        {
            id: 'Requests',
            content: 'Requests',
            panelID: 'Requests-1',
        },
        {
            id: 'Document',
            content: 'Document',
            panelID: 'Document-1',
        },
    ];



    return (
        <>
            <span className='menu-tabs-top-popup-PO'>
                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
            </span>

            {selected === 0 ? <div className="pt-4">
                <Text variant="headingLg" as="h5">
                    Session : {session && session.session_key}
                </Text>

                <div className="PO-modal-table-cstm-wrapper mt-4">
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                            <Card title="General " sectioned>
                                <ul className="PO-modal-table-cstm-list">
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">DB ID:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.id}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Punched Out:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.created_at}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Customer:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client_customer.name} {session && session.pomw_client_customer.email}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Catalog:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client.name}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Domain:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client.domain}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Connector Type:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client.pomw_client_type.name}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Network:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client.pomw_client_network.name}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Parser:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">CXML</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Session Key:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.session_key}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Buyer Cookie:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.buyer_cookie}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Operation:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.operation}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Post URL:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.post_url}</div>
                                        </div>
                                    </li>
                                </ul>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                            <Card title="Session" sectioned>
                                <ul className="PO-modal-table-cstm-list">
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Type:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.type}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Operation:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.operation}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Mode:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.mode}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Setup URL:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.setup_url}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Post URL:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.post_url}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">To Identity:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client.to_identity}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">To Domain:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client.to_domain}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">From Identity:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client.from_identity}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">From Domain:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client.from_domain}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Sender Domain:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.header_sender_domain}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Sender Identity:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.header_sender_identity}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Sender Shared Secret:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.header_sender_shared_secret}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Sender User Agent:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.header_sender_user_agent}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Date:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.created_at}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">UTC Timestamp:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.created_at}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Unix Timestamp:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.created_at}</div>
                                        </div>
                                    </li>
                                </ul>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                            <Card title="General" sectioned>
                                <ul className="PO-modal-table-cstm-list">
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">ID:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client_customer.uuid}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Name:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client_customer.name}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Email:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client_customer.email}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">First Name:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client_customer.firstname}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Last Name:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client_customer.lastname}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Unique Name:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client_customer.uniquename}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Created At :</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client_customer.created_at}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Updated At:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_client_customer.updated_at}</div>
                                        </div>
                                    </li>

                                </ul>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                            <Card title="Address" sectioned>
                                <ul className="PO-modal-table-cstm-list">
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">ID:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.uuid} ({session && session.pomw_street_address.id})</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Ident:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.ident}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Label:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.label}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Deliver To:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.deliver_to}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Line 1:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.line1}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Line 2:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.line2}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">City:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.city}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">State:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.state}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Country:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.country}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Zip:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.zip}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Note:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.note}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Created At:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.created_at}</div>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="PO-modal-table-cstm-inner">
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-one">Updated At:</div>
                                            <div className="PO-modal-content-cstm PO-modal-table-cstm-two">{session && session.pomw_street_address.updated_at}</div>
                                        </div>
                                    </li>

                                </ul>
                            </Card>
                        </Grid.Cell>
                    </Grid>
                </div>
            </div>
                : selected === 1 ? <div>
                    <PunchoutGatewayOrderRequest orderRequests={session} />
                </div>
                    : selected === 2 ? <div>
                        <div className="pop-code-wrapper">
                            <CodeDisplay requestCxml={session.request_cxml} />
                        </div>
                    </div>
                        : null}

        </>
    );

}

PunchoutSessionsTableModal.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default PunchoutSessionsTableModal;
