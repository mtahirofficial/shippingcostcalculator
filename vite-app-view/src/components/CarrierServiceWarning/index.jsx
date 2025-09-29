import React, { useEffect, useState } from 'react'
import { useApp } from '../../providers/AppProvider'
import { Box, List, Button } from '@shopify/polaris';
import ShopifyBanner from '../ShopifyBanner';
import { endpoints } from '../../constants';
import { request } from '../../core/api';
import { useAppBridge } from '@shopify/app-bridge-react';

const CarrierServiceWarning = ({ store }) => {
    const { setStore } = useApp()
    const shopify = useAppBridge();
    const [checking, setChecking] = useState(false)
    const [_store, _setStore] = useState({})

    useEffect(() => {
        _setStore({ ...store })
    }, [store])

    const checkCompatibility = async () => {
        try {
            const options = {
                "method": "GET"
            }
            setChecking(true)
            const response = await request(endpoints.store + "/carrier_services", options, store?.storeId)
            if (Object.hasOwnProperty.call(response, "store")) {
                setStore({ ...response.store })
                _setStore({ ...response.store })
                shopify.toast.show("Carrier service enabled successfully!", { isError: false })
            } else {
                shopify.toast.show(response.message, { isError: true })
            }
        } catch (error) {
            shopify.toast.show("Carrier service not enabled!", { isError: true })
        } finally {
            setChecking(false)
        }
    }
    // "74930454769"
    return (
        _store?.serviceId ? null : <ShopifyBanner
            tone={"info"}
            title={"This app will be ready to use once you activate the carrier service"}
            actionContent="Enabled"
            onAction={checkCompatibility}
            loading={checking}
            actionSize={"large"}
        >
            <p className='banner-text'>Carrier services (also known as carrier-calculated or shipping services) provide real-time shipping rates to Shopify. Please take these steps to use this app:</p>
            <List>{[
                <p className='banner-text'>Contact <Button variant='plain' url='https://help.shopify.com/questions?shpxid=9f5938d3-5963-4218-C826-481D52A62B15' target='_blank'>Shopify Support</Button> to enable carrier service.</p>,
                <p className='banner-text'>Click <b>Enabled</b> after activation of carrier service.</p>
            ].map(item => <List.Item>{item}</List.Item>)}</List>
        </ShopifyBanner >
    )
}

export default CarrierServiceWarning