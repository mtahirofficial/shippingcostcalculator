import React, { createContext, useContext, useState } from "react";
import { StatusActiveIcon, AlertCircleIcon, DisabledIcon } from '@shopify/polaris-icons';
import { Icon } from '@shopify/polaris';

export const ZoneContext = createContext();

export const ZoneProvider = ({ children }) => {

    const [zones, setZones] = useState([]);
    const [zone, setZone] = useState({});

    return (
        <ZoneContext.Provider value={{ zones, setZones, zone, setZone }}>
            {children}
        </ZoneContext.Provider>
    );
};

export const useZoneContext = () => useContext(ZoneContext)