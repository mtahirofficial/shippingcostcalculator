import React, { useCallback, useEffect, useState } from 'react'
import { BlockStack, Card, FormLayout, Page, Select, TextField } from '@shopify/polaris'
import { SaveIcon, UndoIcon } from '@shopify/polaris-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../../providers/AppProvider';
import SelectList from '../../../components/SelectList';
import { findIntersection, validate } from '../../../utilis';
import { request } from '../../../core/api';
import { endpoints } from '../../../constants';
import { useAppBridge } from '@shopify/app-bridge-react';
import { useZoneContext } from '../../../providers/ZoneProvider';
import { Navigate } from 'react-router-dom'
import axios from 'axios';
import Skeleton from '../../../components/Skeleton';

const REQUIRED_FIELDS = ["name", "countries", "price"]

const AddZone = () => {
    let { id } = useParams();
    const shopify = useAppBridge();
    const navigate = useNavigate();
    const { store, countries, states: statesList } = useApp()
    const { setZones } = useZoneContext()
    const [states, setStates] = useState([])
    const [defaultStates, setDefaultStates] = useState([])
    const [loading, setLoading] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
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
                let defaultStates = response.zone.states.map(s => s.options).flat()
                setValues(prev => ({ ...prev, ...response.zone, states: [...defaultStates] }))
                setDefaultStates([...defaultStates])

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
        const errors = validate(obj, REQUIRED_FIELDS, validationErrors)
        setValidationErrors({ ...errors })
        if (obj.states) {
            setDefaultStates(obj.states)
        }
        setValues(prev => ({ ...prev, ...obj }))
    }
    const addZone = async () => {
        const errors = validate(values, REQUIRED_FIELDS, validationErrors)
        setValidationErrors({ ...errors })
        if (Object.values(errors).some(e => e !== "")) {
            shopify.toast.show("Required fields are missing", { isError: true })
        } else {
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
                        <TextField type='text' placeholder='Zone name' label={`Zone name${REQUIRED_FIELDS.indexOf("name") > -1 ? "*" : ""}`} name='name' value={values.name} error={validationErrors.name} onChange={value => handleChange({ "name": value })} />
                        <TextField type='text' placeholder='Description' label="Description" name='desc' value={values.desc} onChange={value => handleChange({ "desc": value })} />
                    </FormLayout>
                </Card>
                <Card>
                    <FormLayout>
                        {/* <ShopifyCombobox
                            label={`Select Countries${REQUIRED_FIELDS.indexOf("countries") > -1 ? "*" : ""}`}
                            category={"country"}
                            selected={values.countries}
                            options={countries}
                            placeholder={`Search countries`}
                            onChange={values => {
                                // const states = findIntersection(values, statesList)
                                // setStates(states)
                                handleChange({ "countries": values })
                            }}
                        /> */}
                        {/* <ShopifyCombobox
                            label={"Select states"}
                            helpText={"Do not use comma ( , ) in values."}
                            category={"state"}
                            selected={values.states}
                            placeholder={`Write state name here`}
                            onChange={values => handleChange({ "states": values })}
                        /> */}
                        <SelectList
                            placeholder={`Select Countries`}
                            label={<p>Select Countries{REQUIRED_FIELDS.indexOf("countries") > -1 ? "*" : ""}</p>}
                            error={validationErrors.countries}
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
                            label={<p>Select States</p>}
                            // error={validationErrors.states}
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
                        <TextField type='text' label={`Price${REQUIRED_FIELDS.indexOf("price") > -1 ? "*" : ""}`} name='price' placeholder='0' prefix={store?.moneyFormat.replace("{{amount}}", "")} error={validationErrors.price} value={values.price} onChange={value => handleChange({ "price": value })} helpText="This price will be added to each shipping rate in the current zone, if you do not want to set zone price then set it to '0' (zero)." onBlur={e => {
                            if (isNaN(e.target.value)) {
                                handleChange({ "price": "0.00" })
                            }
                        }} />
                    </FormLayout>
                </Card>
            </BlockStack>
        </Page>
    )
}

export default AddZone