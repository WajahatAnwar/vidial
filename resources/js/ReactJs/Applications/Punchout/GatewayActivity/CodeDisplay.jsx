// CodeDisplay.js
import React from 'react';
const CodeDisplay = ({ requestCxml }) => {

    const codeStyle = {
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '5px',
        overflowX: 'auto',
        fontFamily: 'monospace',
        border: '1px solid #ccc',
        whiteSpace: 'pre-wrap', // This allows long lines to wrap within the container
        fontSize: '12px',
    };

    return (
        <pre style={codeStyle}>
            {requestCxml}
        </pre >
    );
};

export default CodeDisplay;
