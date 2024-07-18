import axios from "axios";
import { endpoints } from "../constants";

export const request = async (
    endpoint = '',
    options = {},
    token = null,
    headers = {}
) => {
    const config = {
        "url": endpoint,
        "headers": {
            "content-type": "application/json",
            ...headers
        },
        ...options
    }
    if (token) {
        config.headers["x-access-token"] = token
    }
    // console.log(config);
    try {
        const res = await axios(config);
        return { ...res.data };
    } catch (e) {
        return e.response.data
    }
}

export const getStore = async storeId => {
    try {
        const options = {
            "method": "GET"
        }
        if (storeId) {
            const response = await request(endpoints.store + "?storeId=" + storeId, options)

            return response.store
        }
    } catch (e) {
        // setError({ "message": "Error", "description": e.message })
        return false
    }
}