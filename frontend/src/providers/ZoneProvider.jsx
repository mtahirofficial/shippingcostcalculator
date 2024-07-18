import React, { createContext, useContext, useState } from "react";
import { StatusActiveIcon, AlertCircleIcon, DisabledIcon } from '@shopify/polaris-icons';
import { Icon } from '@shopify/polaris';
// import { request } from "../core/api";
// import { endpoints } from "../constants";
// import { useAuth } from "./AuthProvider";

export const ZoneContext = createContext();

const zoneList = [
    {
        id: 1,
        key: 1,
        name: "Pakistan",
        desc: "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adi",
        price: 50,
        countries: ["sadfs", "wrwer"],
        states: ["wecsd", "csw", "daccsd", "wecsd", "csw", "daccsd", "wecsd", "csw", "daccsd", "wecsd", "csw", "daccsd",],
        status: 'suspend',
        rates: [
            {
                id: 1,
                key: 1,
                zoneId: 1,
                title: "Rate 1",
                desc: "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adi",
                price: 100,
                serviceCode: 'code_1',
                status: 'active',
                chargeBy: 'price',
                weightUnit: null,
                ranges: [
                    {
                        id: 1,
                        key: 1,
                        rateId: 1,
                        from: 0,
                        upto: 100,
                        price: 20
                    },
                    {
                        id: 2,
                        key: 2,
                        rateId: 1,
                        from: 101,
                        upto: 200,
                        price: 40
                    },
                    {
                        id: 3,
                        key: 3,
                        rateId: 1,
                        from: 201,
                        upto: 300,
                        price: 60
                    },
                ]
            }
        ],
        totalRates: 4
    },
    {
        id: 2,
        key: 2,
        name: "USA",
        desc: "All over the united states",
        price: 50,
        countries: [],
        states: [],
        status: 'draft',
        rates: [],
        totalRates: 4
    },
    {
        id: 3,
        key: 3,
        name: "Pakistan",
        desc: "All over the Pakistan",
        price: 50,
        countries: [],
        states: [],
        status: 'draft',
        rates: [],
        totalRates: 4
    },
    {
        id: 4,
        key: 4,
        name: "USA",
        desc: "All over the united states",
        price: 50,
        countries: [],
        states: [],
        status: 'active',
        rates: [],
        totalRates: 4
    },
    {
        id: 5,
        key: 5,
        name: "Austrailia",
        desc: "All over the Austrailia",
        price: 50,
        countries: [],
        states: [],
        status: 'suspend',
        rates: [],
        totalRates: 4
    },
    {
        id: 6,
        key: 6,
        name: "Oman",
        desc: "All over the Oman",
        price: 50,
        countries: [],
        states: [],
        status: 'active',
        rates: [],
        totalRates: 4
    },
    {
        id: 7,
        key: 7,
        name: "USA",
        desc: "All over the united states",
        price: 50,
        countries: [],
        states: [],
        status: 'draft',
        rates: [],
        totalRates: 4
    },
    {
        id: 8,
        key: 8,
        name: "Austrailia",
        desc: "All over the Austrailia",
        price: 50,
        countries: [],
        states: [],
        status: 'active',
        rates: [],
        totalRates: 4
    },
    {
        id: 9,
        key: 9,
        name: "Oman",
        desc: "All over the Oman",
        price: 50,
        countries: [],
        states: [],
        status: 'active',
        rates: [],
        totalRates: 4
    },
]

const statuses = {
    "active": { "label": "Active", "color": "#46AB5E", "icon": <Icon source={StatusActiveIcon} tone="base" /> },
    "draft": { "label": "Draft", "color": "#667085", "icon": <Icon source={AlertCircleIcon} tone="base" /> },
    "suspend": { "label": "Suspend", "color": "#F03938", "icon": <Icon source={DisabledIcon} tone="base" /> },
}

const weightUnits = {
    "kg": "KG",
    "lb": "LB",
    "oz": "OZ",
}


export const ZoneProvider = ({ children }) => {

    const [zones, setZones] = useState([]);
    const [zone, setZone] = useState({});
    const [rates, setRates] = useState([]);
    const [rate, setRate] = useState([]);
    const [statusList] = useState(statuses);

    // const addZone = async values => {
    //     try {
    //         const options = {
    //             "method": values.id ? "PUT" : "POST",
    //             "data": { "zone": { ...values, userId: user?.id } }
    //         }
    //         const response = await request(endpoints.zone, options, accessToken)
    //         return true
    //     } catch (e) {
    //         // setError({ "message": "Error", "description": e.message })
    //         return false
    //     }

    // }
    // const getZones = async () => {
    //     try {
    //         const options = {
    //             "method": "GET",
    //         }
    //         const response = await request(endpoints.zone, options, accessToken)
    //         setZones([...response.zones])
    //     } catch (e) {
    //         // setError({ "message": "Error", "description": e.message })
    //     }
    // }
    // const getActiveZone = id => {
    //     const filtered = zones.filter(z => z.id === Number(id))
    //     return filtered[0]
    // }
    return (
        <ZoneContext.Provider value={{ zones, setZones, zone, setZone }}>
            {children}
        </ZoneContext.Provider>
    );
};

export const useZoneContext = () => useContext(ZoneContext)