import React from 'react'
import { ZoneProvider } from "./ZoneProvider";
import { AppProvider } from './AppProvider';

const ContextProvider = ({ children }) => {
    return (
        <AppProvider>
            <ZoneProvider>
                {children}
            </ZoneProvider>
        </AppProvider>
    )
}

export default ContextProvider
