import React, { createContext, useContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [title, setTitle] = useState("Welcome to the App!");
    const [store, setStore] = useState(null);
    const [countries, setCountries] = useState([])
    const [states, setStates] = useState([])
    const [activePlan, setActivePlan] = useState(null)
    const [features, setFeatures] = useState([])
    const [activeFeatures, setActiveFeatures] = useState({})
    const [modalActive, setModalActive] = useState({});
    const [billingUrl, setBillingUrl] = useState("")
    return (
        <AppContext.Provider value={{
            title,
            setTitle,
            store,
            setStore,
            countries,
            setCountries,
            states,
            setStates,
            activePlan,
            setActivePlan,
            features,
            setFeatures,
            activeFeatures,
            setActiveFeatures,
            modalActive,
            setModalActive,
            billingUrl,
            setBillingUrl
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext)