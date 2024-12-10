import React, { useCallback, useEffect, useState } from 'react'
import { } from '@shopify/polaris'
import {
    Card,
    Icon,
    TextField,
    Listbox,
    AutoSelection,
    Page,
    Scrollable,
    EmptySearchResult,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { ShopifyListBox } from '../../components/ShopifyListBox';
import axios from 'axios';
import { request } from '../../core/api';
import { endpoints } from '../../constants';
import StoresList from '../../components/StoresList';
import { jsonToQueryString } from '../../utilis';
import { useSearchParams } from "react-router-dom";

const AdminArea = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [stores, setStores] = useState([])

    const getStores = useCallback(
        async (params, cancelToken) => {
            const options = {
                "method": "GET",
                "cancelToken": cancelToken
            }
            const queryString = jsonToQueryString(params);
            console.log("queryString", queryString);

            const response = await request("https://shippingcostcalculator.logicsarcade.com" + endpoints.store + `/list${queryString}`, options)
            if (response.stores) {
                setStores(prev => ([...response.stores]))
            }
        },
        [],
    )

    useEffect(() => {
        const cancelToken = axios.CancelToken.source()
        getStores(searchParams, cancelToken.token)
        return () => {
            cancelToken.cancel()
        }
    }, [searchParams])

    return (
        <Page title='AdminArea'>
            <StoresList stores={stores} />
            {/* <ShopifyListBox stores={stores} /> */}
        </Page>
    )
}

export default AdminArea