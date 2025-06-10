import React, { createContext, useContext, useState } from "react";
import { endpoints } from "../constants";
import { useNavigate } from "react-router-dom";
import { request } from "../core/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()
    const [authPageTitle, setAuthPageTitle] = useState("Login")
    const [accessToken, setAccessToken] = useState(null)
    const [refreshToken, setRefreshToken] = useState(null)
    const [user, setUser] = useState(null);
    const [fetchingUser, setFetchingUser] = useState(false);

    const getUser = async token => {
        const config = {
            "method": "GET",
        }
        const url = endpoints.auth + "/me"
        const res = await request(url, config, token)
        if (res.status === 200) {
            updateInfo({ user: res, accessToken: token, refreshToken: getItem("refreshToken") })
        } else {
            updateInfo(null)
            navigate("/auth")
        }
        return res

    }

    const register = async data => {
        try {
            const config = {
                "method": "POST",
                "data": data,
            }
            const url = endpoints.auth + "/register"

            const res = await request(url, config)
            // updateInfo(res)
            navigate(endpoints.auth + "/verify", { state: { "email": data.user.email } })
            return res
        }
        catch (e) {
            // setError({ "description": e.response?.data?.message })
        }
    }

    const addStore = async data => {
        try {
            const config = {
                "method": "POST",
                "data": data,
            }
            const url = endpoints.store

            const res = await request(url, config)
            // updateInfo(res)
            // navigate(endpoints.auth + "/verify", { state: { "email": data.user.email } })
            return res
        }
        catch (e) {
            // setError({ "description": e.response?.data?.message })
        }
    }

    const login = async data => {
        const options = {
            "method": "POST",
            "data": data,
        }
        const url = endpoints.auth + "/login"
        const res = await request(url, options)
        if (res.status === 200) {
            updateInfo(res)
            navigate("/")
        } else if (res.status === 403) {
            navigate(endpoints.auth + "/verify", { state: { "email": data.user } })
        } else if (res.status === 500) {
            // setError({ "description": res.message })
        } else {
            return res
        }
    }
    const updateInfo = data => {
        if (data) {
            setItem("accessToken", data.accessToken)
            setItem("refreshToken", data.refreshToken)
            setItem("user", data.user)
            setUser({ ...data.user })
            setAccessToken(data.accessToken)
            setRefreshToken(data.refreshToken)
        } else {
            setUser(null);
            localStorage.clear()
        }

    }
    const setItem = (key, val) => {
        if (typeof val !== "string") {
            val = JSON.stringify(val)
        }
        localStorage.setItem(key, val)
    }
    const removeItem = key => {
        localStorage.removeItem(key)
    }
    const getItem = key => {
        let val = localStorage.getItem(key)
        if (typeof val !== "string") {
            val = JSON.parse(val)
        }
        return val
    }
    const logout = (cb) => {
        // Remove user data from local storage
        updateInfo(null)
        cb && cb();
    };

    return <AuthContext.Provider value={{ user, authPageTitle, accessToken, fetchingUser, logout, getUser, getItem, updateInfo, setAuthPageTitle, register, login, addStore }}>
        {children}
    </AuthContext.Provider>
};

export const useAuth = () => useContext(AuthContext)