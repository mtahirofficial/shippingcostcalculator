import React, { useCallback, useEffect, useState } from 'react'
import { BlockStack, Card, FormLayout, Page, Select, TextField } from '@shopify/polaris'
import { SaveIcon, UndoIcon } from '@shopify/polaris-icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../../providers/AppProvider';
import SelectList from '../../../components/SelectList';
import { findIntersection } from '../../../utilis';
import { request } from '../../../core/api';
import { endpoints } from '../../../constants';
import { useAppBridge } from '@shopify/app-bridge-react';
import { useZoneContext } from '../../../providers/ZoneProvider';
import { Navigate } from 'react-router-dom'
import axios from 'axios';
import Skeleton from '../../../components/Skeleton';

const AddZone = () => {
    const { state } = useLocation();
    let { id } = useParams();

    const shopify = useAppBridge();
    const navigate = useNavigate();
    const { store, countries, states: statesList } = useApp()
    const { zones, setZones } = useZoneContext()
    const [states, setStates] = useState([])
    const [defaultStates, setDefaultStates] = useState([])
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({ isErr: false, msg: null })
    const [values, setValues] = useState({
        name: "",
        desc: "",
        price: "",
        status: "active",
        states: [],
        countries: [],
    })
    const getZone = useCallback(
        async cancelToken => {
            const options = {
                "method": "GET",
                "cancelToken": cancelToken
            }
            setLoading("get")
            const response = await request(endpoints.zone + "/" + id, options)
            if (response.zone) {
                setValues(prev => ({ ...prev, ...response.zone }))
                setDefaultStates(response.zone.states.map(s => s.options).flat())

            }
            setLoading(false)
        },
        [],
    )
    useEffect(() => {
        const cancelToken = axios.CancelToken.source()
        if (id === "undefined" || id === "null" || isNaN(id)) {
            <Navigate to={"/zones"} />
        } else {
            getZone(cancelToken.token)
        }
        return () => {
            cancelToken.cancel()
        }
    }, [])

    useEffect(() => {

        const states = findIntersection(values.countries, statesList)
        setStates(states)

    }, [values.countries])

    const handleChange = obj => {
        if (obj.states) {
            setDefaultStates(obj.states)
        }
        setValues(prev => ({ ...prev, ...obj }))
    }

    const addZone = async () => {
        try {
            const options = {
                "method": values.id ? "PUT" : "POST",
                "data": { "zone": { ...values } }
            }
            setLoading("saving")
            const response = await request(endpoints.zone, options, store?.storeId)
            if (Object.hasOwnProperty.call(response, "zone")) {
                let message = "Zone added successfully."
                if (values.id) {
                    message = "Zone updated successfully."
                    setZones(prev => {
                        return prev.map(item => {
                            return item.id.toString() === values.id.toString() ? response.zone : item
                        })
                    })
                } else {
                    setZones(prev => ([response.zone, ...prev]))
                }
                shopify.toast.show(message)
                navigate(`/zones${!isNaN(id) ? `/${id}` : ""}`)
            }
        } catch (e) {
            shopify.toast.show(e.message, { isError: true })
            console.log(e.message);
        } finally {
            setLoading(false)
        }
    }
    if (loading === "get") {
        return <Skeleton />
    }
    return (
        <Page
            narrowWidth
            title={`${!isNaN(id) ? "Edit" : "Add"} zone`}
            backAction={{ content: 'Zones', onAction: () => navigate(`/zones${!isNaN(id) ? `/${id}` : ""}`) }}
            primaryAction={{ content: !isNaN(id) ? "Update" : 'Save', loading: loading === "saving", disabled: loading === "saving", icon: SaveIcon, onAction: addZone }}
            secondaryActions={[
                { content: 'Cancel', destructive: true, icon: UndoIcon, onAction: () => navigate(`/zones${!isNaN(id) ? `/${id}` : ""}`) },
            ]}
        >
            <BlockStack gap={400}>
                <Card>
                    <FormLayout>
                        <TextField type='text' placeholder='Zone name' label="Zone name" name='name' value={values.name} onChange={value => handleChange({ "name": value })} />
                        <TextField type='text' placeholder='Description' label="Description" name='desc' value={values.desc} onChange={value => handleChange({ "desc": value })} />
                    </FormLayout>
                </Card>
                <Card>
                    <FormLayout>
                        {/* <ShopifyCombobox
                            label={`Select country`}
                            helpText={"Do not use comma ( , ) in values."}
                            category={"country"}
                            selected={values.countries}
                            placeholder={`Write country name here`}
                            onChange={values => {
                                const states = findIntersection(values, statesList)
                                setStates(states)
                                handleChange({ "countries": values })
                            }}
                        />
                        <ShopifyCombobox
                            label={"Select states"}
                            helpText={"Do not use comma ( , ) in values."}
                            category={"state"}
                            selected={values.states}
                            placeholder={`Write state name here`}
                            onChange={values => handleChange({ "states": values })}
                        /> */}
                        <SelectList
                            placeholder={`Select Countries`}
                            error={errors.countries}
                            options={countries}
                            defaults={values.countries}
                            handleChange={values => {
                                // const states = findIntersection(values, statesList)
                                // setStates(states)
                                handleChange({ "countries": values })
                            }}
                        />
                        <SelectList
                            placeholder={`Select States`}
                            error={errors.states}
                            groupedOptions={states}
                            defaults={defaultStates.length ? defaultStates : values.states}
                            handleChange={states => { handleChange({ "states": states }) }}
                        />
                    </FormLayout>
                </Card>
                <Card>
                    <FormLayout>
                        <Select
                            label="Status"
                            name="status"
                            options={[
                                { label: 'Active', value: 'active' },
                                { label: 'Draft', value: 'draft' }
                            ]}
                            onChange={value => handleChange({ "status": value })}
                            value={values.status}
                        />
                        <TextField type='text' label="Price" name='price' placeholder='0' prefix={store?.moneyFormat.replace("{{amount}}", "")} value={values.price} onChange={value => handleChange({ "price": value })} />
                    </FormLayout>
                </Card>
            </BlockStack>
        </Page>
    )
}

export default AddZone