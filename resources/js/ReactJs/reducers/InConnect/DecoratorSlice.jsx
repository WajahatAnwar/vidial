import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    decorator: {
        step: 0,
        name: '',
        intact_vendor: {
            value: '',
            label: ''
        },
        intact_location: {
            value: '',
            label: ''
        },
        intact_department: {
            value: '',
            label: ''
        },
        address: {
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            zip_code: '',
        },
        notes: 'Personalization width: 4.5”',
        excluded_dates: [],
        sat_sun_exclude: false,
        po_prefix: '',
        username: '',
        password: '',
        client_id: '',
        client_secret: '',
        sizes: [
            {
                name: '',
                shopify_sizes: []
            }
        ],
        services: [
            {
                service_id: '',
                option_ids: [],
                shopify_decoration: {
                    value: '',
                    label: ''
                },
                locations: [
                    {
                        location_id: '',
                        shopify_location: {
                            value: '',
                            label: ''
                        },
                    }
                ]
            }
        ],
        logo_phrases: [''],
        second_logo_phrases: [''],
        decorations: [''],
        custom_decorations: [''],
        logo_location_phrases: [''],
        second_logo_location_phrases: [''],
        personalization_inputs: [''],
        vendor_stock_status: false,
        vendor_stocks: [],
        stitch_list: [
            {
                title:'',
                min: '',
                max: '',
                stitch_list_details: [
                    {
                        from: '',
                        to: '',
                        price: ''
                    }
                ]
            }
        ],
    },
}

export const DecoratorSlice = createSlice({
    name: 'InConnectDecorator',
    initialState,
    reducers: {
        setDecorator: (state, action) => {
            state.decorator = action.payload
            console.log(state.decorator)
        },
        resetDecorator: (state, action) => {
            return initialState;
        },
    },
})

export const {
    setDecorator,
    resetDecorator
} = DecoratorSlice.actions

export default DecoratorSlice.reducer
