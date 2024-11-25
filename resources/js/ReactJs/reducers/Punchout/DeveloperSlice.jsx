import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    gatewayClient: {
        uuid: '0',
        name: '',
        toDomain: '',
        fromDomain: '',
        fromIdentity: '',
        toIdentity: '',
        selectedNetwork: '',
        shared_secret: '',
        invoice_receiver_url: '',
        credentials_password: '',
        discount_code: false,
    },
}

export const DeveloperSlice = createSlice({
    name: 'gatewayClient',
    initialState,
    reducers: {
        setGatewayClient: (state, action) => {
            state.gatewayClient = action.payload;
        },
        resetGatewayClient: (state, action) => {
            return initialState;
        },
    },
})

export const {
    setGatewayClient,
    resetGatewayClient
} = DeveloperSlice.actions

export default DeveloperSlice.reducer
