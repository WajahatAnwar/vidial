

import AppLayout from '@/ReactJs/Applications/Cropica/AppLayout';
import ResizeImg from '@/ReactJs/Applications/Cropica/Assets/images/ResizeOptionImg.svg';
import TickIcon from '@/ReactJs/Applications/Cropica/Assets/images/TickIcon.svg';
import { Card, Modal, Page, Text } from '@shopify/polaris';
import "@shopify/polaris/build/esm/styles.css";
import './History.css';
import { useCallback, useState } from 'react';
import HistoryTable from './HistoryTable';

function History(props) {

    const [active, setActive] = useState(false);
    const handleChange = useCallback(() => setActive(!active), [active]);

    const activator = [];

    return (
        <div>
            <Page fullWidth>
                <div style={{ display: "flex", marginBottom: "30px", marginTop: "30px" }}>
                    <div className='fontBigger' style={{ fontWeight: "600", color: "white" }}> <p className='text-2xl'>History</p> </div>
                </div>
                <div className='ResizeOptions-wrapper mt-44 '>
                    <Card>
                        <div className='ResizeOptions-heading mt-5 pb-4'>
                            <div className='p-4 w-[68%]'>
                                <Text variant='heading2xl' as='h1' fontWeight='bold' >Product-Focused Cropping </Text>
                                <Text variant='bodyXL' as='p'  >
                                    An app for Shopify stores that effortlessly crops images to showcase products with
                                    precision, enhancing your store's visuals for a polished, professional look.
                                </Text>
                            </div>
                            <img className='w-32' src={ResizeImg} alt="Resize Img" />
                        </div>
                    </Card>
                </div>
                <div className='mt-4'>
                    <Card>
                        <div className='resize-table-wrapper '>
                            <div className='resizeoptions-text-btn'>
                                <Text variant='bodyXL' as='p' fontWeight='bold' >
                                    History
                                </Text>
                                <div className='manage-history-select'>
                                </div>
                            </div>
                            <div className='mb-3'>
                                <HistoryTable />
                            </div>
                        </div>
                    </Card>
                </div>
                <div style={{ height: '500px' }}>
                    <Modal
                        activator={activator}
                        open={active}
                        onClose={handleChange}
                    >
                        <Modal.Section>

                            <div className='flex justify-center mt-5'>
                                <img src={TickIcon} alt="tickicon" />
                            </div>
                            <div className='confirmation-btns flex mt-4 justify-center gap-3'>
                                <p className='font-bold text-lg'>Your Pictures are Successfully Upadated!</p>

                            </div>
                        </Modal.Section>
                    </Modal>
                </div>
            </Page>
        </div>
    );
}

History.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default History;
