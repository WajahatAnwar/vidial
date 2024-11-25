import { configureStore } from '@reduxjs/toolkit'
import TestReducer from '@/ReactJs/reducers/TestSlice';

export const store = configureStore({
    reducer: {
        test: TestReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
})
