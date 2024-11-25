import { Text } from '@shopify/polaris';
import React from 'react'

const OrderInvoiceSimulatedCXML = ({pushedCXML, simulatedCXML}) => {
    const codeStyle = {
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '5px',
        overflowX: 'auto',
        fontFamily: 'monospace',
        border: '1px solid #ccc',
        whiteSpace: 'pre-wrap', // This allows long lines to wrap within the container
        marginTop: '20px',
    };

    return (
        <div style={{padding:"20px"}}>
            <div>

                <Text variant="headingLg" as="h4">Pushed CXML</Text>
                <pre style={codeStyle}>
                    <code>
                        {pushedCXML}
                    </code >
                </pre >
            </div>
            <div>
                <p style={{marginTop:"20px"}}>
                <Text variant="headingLg" as="h4">Simulated CXML</Text>
                </p>
                <pre style={codeStyle}>
                    <code>
                        {simulatedCXML}
                    </code >
                </pre >
            </div>
        </div>
    )
}

export default OrderInvoiceSimulatedCXML
