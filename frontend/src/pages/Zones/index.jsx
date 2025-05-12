import React, { useCallback, useEffect, useState } from 'react'
import { Box, Page } from '@shopify/polaris'
import ZonesList from '../../components/ZonesList'
import { request } from '../../core/api'
import axios from 'axios'
import { useApp } from '../../providers/AppProvider'
import { endpoints } from '../../constants'
import { useZoneContext } from '../../providers/ZoneProvider'
import { useNavigate } from 'react-router-dom'
import CarrierServiceWarning from '../../components/CarrierServiceWarning'

const Zones = () => {
    const navigate = useNavigate();
    const { store } = useApp()
    const { zones, setZones } = useZoneContext()
    const [loading, setLoading] = useState(true)

    const getZones = useCallback(
        async (cancelToken, storeId) => {
            const options = {
                "method": "GET",
                "cancelToken": cancelToken
            }
            setLoading(true)
            const response = await request(endpoints.zone + "?storeId=" + storeId, options)
            if (response.zones) {
                setZones(prev => ([...prev, ...response.zones]))
            }
            setLoading(false)
        },
        [],
    )
    useEffect(() => {
        const cancelToken = axios.CancelToken.source()
        if (store) {
            if (zones.length === 0) {
                getZones(cancelToken.token, store.storeId)
            } else {
                setLoading(false)
            }
        }
        return () => {
            cancelToken.cancel()
        }
    }, [store])

    return (
        <Page
            title='Zones'
            primaryAction={{
                content: "Create Zone",
                onAction: () => navigate('new')
            }}
        >
            <Box paddingBlockEnd={400}>
                {!store ? null : <CarrierServiceWarning store={store} />}
            </Box>
            <ZonesList loading={loading} />
        </Page>
    )
}

export default Zones