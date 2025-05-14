import React from 'react'
import { useApp } from '../../providers/AppProvider'
import { Navigate } from 'react-router-dom';

const Billing = () => {
    const { store } = useApp()
    // return <iframe className="iframe" src={`https://admin.shopify.com/store/${store.name}/charges/${process.env.REACT_APP_APP_PATH}/pricing_plans`} frameborder="0"></iframe>
    window.top.location.href = `https://admin.shopify.com/store/${store.name}/charges/${process.env.REACT_APP_APP_PATH}/pricing_plans`
    // return <Navigate to={`https://admin.shopify.com/store/${store.name}/charges/${process.env.REACT_APP_APP_PATH}/pricing_plans`} replace={true} />
    return null
}

export default Billing