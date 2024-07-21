import React, { createContext, useContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [title, setTitle] = useState("Welcome to the App!");
    const [store, setStore] = useState(null);
    const [countries, setCountries] = useState([])
    const [states, setStates] = useState([])

    return (
        <AppContext.Provider value={{ title, setTitle, store, setStore, countries, setCountries, states, setStates }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext)