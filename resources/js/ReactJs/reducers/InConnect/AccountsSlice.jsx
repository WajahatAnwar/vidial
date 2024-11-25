import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    reloadAccountsTable: false,
    reloadAccounts: false,
    addEditData: false,
    defaultSettings: {
        selectedUser: false,
        selectedShopType: false,
        selectedStatus: { value: false, label: "Close" },
        selectedIntactAccount: false,
        selectedIntactCustomer: false,
        order_status_open: true,
        order_status_closed: false,
        order_status_cancelled: false,
        financial_status_authorized: false,
        financial_status_pending: false,
        financial_status_paid: false,
        financial_status_partially_paid: false,
        financial_status_refunded: false,
        financial_status_voided: false,
        financial_status_partially_refunded: false,
        financial_status_unpaid: false,
        fulfillment_status_shipped: false,
        fulfillment_status_partial: false,
        fulfillment_status_fulfilled: false,
        fulfillment_status_unshipped: false,
        fulfillment_status_unfulfilled: false,

        fraud_status_low: false,
        fraud_status_medium: false,
        fraud_status_high: false,

        selectedIntactPaymentTerms: { value: 1, label: "Net 30" },
        selectedIntactTransactionStatus: { value: 1, label: "Pending" },
        selectedIntactDepartment: { value: 8, label: "10 - Sales" },
        selectedIntactClass: { value: 3, label: "CP2 - Mid-Tier" },

        fieldsMapping: [
            { selected_field: { value: 43, label: "order_number" }, intact_item: "documentno" },
            { selected_field: { value: 79, label: "line_items" }, intact_item: "potransitems" },
            { selected_field: { value: 84, label: "sku" }, intact_item: "item_id" },
            { selected_field: { value: 85, label: "quantity" }, intact_item: "quantity" }
        ],

        taxExemptNumber: '',
    },
    vendorSync: {
        temp_sync: true,
        ignoredVendors: [],
        directVendors: [],
        ignoredProducts: [],
        ignoredProductTypes: [],
        // shippingMethod: null,
    },
    decoratorSync: []
}

export const AccountsSlice = createSlice({
    name: 'InConnectAccounts',
    initialState,
    reducers: {
        setReloadAccounts: (state, action) => {
            state.reloadAccounts = action.payload;
        },
        setAddEditData: (state, action) => {
            state.addEditData = action.payload;
        },
        setDefaultSettings: (state, action) => {
            state.defaultSettings = action.payload;
        },
        setVendorSync: (state, action) => {
            state.vendorSync = action.payload;
        },
        setDecoratorSync: (state, action) => {
            state.decoratorSync = action.payload;
        },
        resetAccounts: (state, action) => {
            return initialState;
        },
        setReloadAccountsTable: (state, action) => {
            state.reloadAccountsTable = action.payload;
        },
    },
})

export const {
    setReloadAccounts,
    setAddEditData,
    setDefaultSettings,
    setVendorSync,
    setDecoratorSync,
    resetAccounts,
    setReloadAccountsTable
} = AccountsSlice.actions

export default AccountsSlice.reducer
