import React, { createContext, useContext, useEffect, useState } from "react";
import { request } from "../core/api";
import { endpoints } from "../constants";

export const StoreContext = createContext();


export const StoreProvider = ({ children }) => {
    const [store, setStore] = useState(null);
    const [countries, setCountries] = useState([])

    const getStore = async accessToken => {
        try {
            const options = {
                "method": "GET"
            }
            if (accessToken) {
                const response = await request(endpoints.store, options, accessToken)
                setStore(response.store)
                return response
            }
        } catch (e) {
            // setError({ "message": "Error", "description": e.message })
            return false
        }
    }

    const getcountries = async () => {
        try {
            const options = {
                "method": "GET",
            }
            const response = await request(`${endpoints.app}/countries`, options)
            if (response.status === 200) {
                setCountries(c => ([...response.countries]))
            }
        } catch (e) {
            // setError({ "message": "Error", "description": e.message })

        }
    }

    useEffect(() => {
        if (countries.length === 0) {
            getcountries()
        }
    }, [])

    return (
        <StoreContext.Provider value={{ store, setStore, countries, getStore }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStoreContext = () => useContext(StoreContext)