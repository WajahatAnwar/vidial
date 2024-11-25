import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    testProperty: ""
}

export const TestSlice = createSlice({
    name: 'test',
    initialState,
    reducers: {
        setTestProperty: (state, action) => {
            state.testProperty = action.payload;
        }
    },
})

export const {
    setTestProperty
} = ClubColorSlice.actions

export default ClubColorSlice.reducer
