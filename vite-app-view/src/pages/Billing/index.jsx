import React from 'react'
import { useApp } from '../../providers/AppProvider'
import { Navigate } from 'react-router-dom';

const Billing = () => {
    const { store } = useApp()
    window.top.location.href = `https://admin.shopify.com/store/${store.name}/charges/${import.meta.env.VITE_APP_PATH}/pricing_plans`
    return null
}

export default Billing