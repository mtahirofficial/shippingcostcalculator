import React, { useEffect, useState } from 'react'
import { useApp } from '../../providers/AppProvider'
import { Box, List, Button } from '@shopify/polaris';
import ShopifyBanner from '../ShopifyBanner';
import { endpoints } from '../../constants';
import { request } from '../../core/api';
import { useAppBridge } from '@shopify/app-bridge-react';

const CarrierServiceWarning = () => {
    const { store, setStore } = useApp()
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
            }
        } catch (error) {
            shopify.toast.show("Carrier service not enabled!", { isError: false })
        } finally {
            setChecking(false)
        }
    }
    return (
        _store?.serviceId ? null : <ShopifyBanner
            tone={"critical"}
            title={"Your store is not compatible with this app!"}
            actionContent="Enable"
            onAction={checkCompatibility}
            loading={checking}
        >
            <p>To use this app, you must enable the carrier service feature on your store. Carrier services (also known as carrier-calculated or shipping services) provide real-time shipping rates to Shopify. Your store must meet one of the following requirements to enable this feature:</p>
            <List>{[
                "Your store must have Advanced Shopify plan or higher.",
                "Your store must have Shopify plan with yearly billing, or the carrier service feature has been added to the store for a monthly fee."
            ].map(item => <List.Item>{item}</List.Item>)}</List>
            <p>For more information, contact <Button variant='plain' url='https://help.shopify.com/questions?shpxid=9f5938d3-5963-4218-C826-481D52A62B15' target='_blank'>Shopify Support</Button></p>
        </ShopifyBanner>
    )
}

export default CarrierServiceWarning