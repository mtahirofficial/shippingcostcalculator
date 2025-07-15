import React from 'react'
import { Navigate } from 'react-router-dom';
import { useApp } from '../providers/AppProvider';

const PrivateRoute = ({ children }) => {
    const { store } = useApp()
    return store?.email === "hmtahirs1@gmail.com" ? children : <Navigate to="/zones" replace={true} />;

}

export default PrivateRoute