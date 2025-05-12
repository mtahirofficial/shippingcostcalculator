import React, { createContext, useContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [title, setTitle] = useState("Welcome to the App!");
    const [store, setStore] = useState(null);
    const [countries, setCountries] = useState([])
    const [states, setStates] = useState([])
    const [plans, setPlans] = useState(`https://admin.shopify.com/store/${store?.name}/charges/${process.env.REACT_APP_APP_PATH}/pricing_plans`)

    return (
        <AppContext.Provider value={{ title, setTitle, store, setStore, countries, plans, setCountries, states, setStates }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext)