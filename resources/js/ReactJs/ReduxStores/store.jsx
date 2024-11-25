import { configureStore } from '@reduxjs/toolkit'
import ClubColorReducer from '@/ReactJs/reducers/ClubColorSlice';
import AccountsReducer from '@/ReactJs/reducers/InConnect/AccountsSlice';
import DecoratorReducer from '@/ReactJs/reducers/InConnect/DecoratorSlice';
import DeveloperReducer from '@/ReactJs/reducers/Punchout/DeveloperSlice';

export const store = configureStore({
    reducer: {
        clubColor: ClubColorReducer,
        inConnectAccounts: AccountsReducer,
        inConnectDecorator: DecoratorReducer,
        punchoutDeveloper: DeveloperReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
})
