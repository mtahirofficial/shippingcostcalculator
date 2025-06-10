import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Page, BlockStack, Select, Card, TextField, InlineGrid, Button, DataTable, InlineStack, Layout } from '@shopify/polaris';
import { SaveIcon, UndoIcon, EditIcon, DeleteIcon } from '@shopify/polaris-icons';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { useAppBridge } from '@shopify/app-bridge-react';
import { useApp } from '../../../providers/AppProvider';
import ShopifyCombobox from '../../../components/ShopifyCombobox';
import { chargeByOptions, endpoints, shipToOptions } from '../../../constants';
import EmptyStateShopify from '../../../components/EmptyStateShopify';
import CardTitle from '../../../components/CardTitle';
import AddRangeForm from '../../../components/AddRangeForm';
import { validate } from '../../../utilis';
import { request } from '../../../core/api';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import SelectList from '../../../components/SelectList';

const empty_range = {
    from: "",
    upto: "",
    price: "",
}

const CreateRate = () => {
    const shopify = useAppBridge();
    const { store, countries, states: statesList, activeFeatures, setModalActive } = useApp()
    const navigate = useNavigate();
    const params = useParams()
    const addRangeRef = useRef(null)
    const [loading, setLoading] = useState(false)
    const [rangeRows, setRangeRows] = useState([])
    const [rangePrefix, setRangePrefix] = useState("")
    const [validationErrors, setValidationErrors] = useState({})
    const [REQUIRED_FIELDS, setRequiredFields] = useState(["title", "price", "shipToValue"])
    const [rangeError, setRangeError] = useState(false)
    const [range, setRange] = useState({ ...empty_range })
    const [deleted, setDeleted] = useState([])
    const [rate, setRate] = useState({
        "title": "",
        "shipTo": "zip",
        "price": "",
        "shipToValue": [],
        "chargeBy": "none",
        "unit": "kg",
        "priceBy": "flat",
        "xQty": false,
        "currency": "$",
        "status": "active",
        // "zoneId": params.zoneId,
        "ranges": []
    })
    const [defaultStates, setDefaultStates] = useState([])


    const editRange = useCallback(
        range => {
            setRange({ ...range })
            shopify.modal.show("add-range")
        },
        [],
    )
    const deleteRange = useCallback(
        (ranges, index) => {
            let deletedRanges = ranges.splice(index, 1)
            setDeleted(prev => ([...prev, ...deletedRanges.map(r => r.id)]))
            handleChange({ "ranges": [...ranges] })
        },
        [],
    )
    const getRate = useCallback(
        async cancelToken => {
            const options = {
                "method": "GET",
                "cancelToken": cancelToken
            }
            setLoading("get")
            const response = await request(endpoints.rate + "/" + params.id, options)
            if (response.rate) {
                setRate({ ...response.rate })
                if (response.rate.shipTo === "state") {
                    setDefaultStates(response.rate.shipToValue)
                }
            }
            setLoading(false)
        },
        [],
    )
    useEffect(() => {
        let rangeRows = rate.ranges.map((r, i) => ([
            r.from,
            r.upto,
            store?.moneyFormat.replace("{{amount}}", r.price),
            <div className='range-actions'>
                <InlineStack align='center' gap={200}>
                    <Button icon={EditIcon} onClick={() => editRange(r)} accessibilityLabel="Edit shipping range" />
                    <Button icon={DeleteIcon} onClick={() => deleteRange(rate.ranges, i)} tone="critical" accessibilityLabel="Delete shipping range" />
                </InlineStack>
            </div>
        ]))
        setRangeRows(rangeRows)
    }, [rate.ranges])

    useEffect(() => {
        const cancelToken = axios.CancelToken.source()
        if (params.id === "undefined" || params.id === "null" || isNaN(params.id)) {
            <Navigate to={`/rates`} />
        } else {
            getRate(cancelToken.token)
        }
        return () => {
            cancelToken.cancel()
        }
    }, [])

    const handleChange = values => {
        // const errors = validate(values, REQUIRED_FIELDS, validationErrors)
        let error = ""
        const [key, value] = Object.entries(values)[0];
        if (REQUIRED_FIELDS.indexOf(key) > -1) {
            if (value === "" || (value instanceof Array && value.length <= 0)) {
                error = "Required"
            }
        }
        setValidationErrors(prev => ({ ...prev, [key]: error }))
        setRate(prev => ({ ...prev, ...values }))
    }
    const handleChangeRange = values => {
        setRange(prev => {
            let r = { ...prev, ...values }
            setRangeError(Object.values(r).every(value => value !== '' && !isNaN(value) && value !== null && value < 1))
            return r
        })
    }
    const addRate = async () => {

        const errors = validate(rate, REQUIRED_FIELDS)
        setValidationErrors({ ...errors })

        if (Object.values(errors).some(e => e !== "")) {
            shopify.toast.show("Required fields are missing", { isError: true })
        } else if (rate.chargeBy !== "none" && rate.ranges.length === 0) {
            shopify.toast.show("Atleast one range is required", { isError: true })
            addRangeRef.current?.focus()
        } else {
            try {
                const options = {
                    "method": rate.id ? "PUT" : "POST",
                    "data": { "rate": { ...rate } }
                }
                if (deleted.length) {
                    options.data.deleted = deleted
                }
                setLoading(true)
                const response = await request(endpoints.rate, options, store?.storeId)
                if (Object.hasOwnProperty.call(response, "rate")) {
                    const _rate = response.rate
                    // setZones(prevZones => {
                    //     let zones = prevZones.map(item => {
                    //         if (item.id.toString() === _rate.zoneId.toString()) {
                    //             if (rate.id) {
                    //                 let rates = []
                    //                 rates = item.rates.map(r => {
                    //                     return r.id.toString() === rate.id.toString() ? _rate : rate
                    //                 })
                    //                 item.rates = rates
                    //             } else {
                    //                 item.rates = [_rate, ...item.rates]
                    //             }
                    //         }
                    //         return item
                    //     })
                    //     return zones
                    // })
                    shopify.toast.show("Saved successfully.")
                    navigate(`/rules`)
                }
            } catch (e) {
                shopify.toast.show(e.message, { isError: true })
                console.log(e.message);
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <Page
            title={`${!isNaN(params.id) ? "Edit" : "Add"} rule`}
            backAction={{ content: 'Rules', onAction: () => navigate(`/rules`) }}
            primaryAction={{
                content: !isNaN(params.id) ? "Update" : "Save", loading: loading, disabled: loading, onAction: () => {

                    if (activeFeatures.rules || !isNaN(params.id)) {
                        addRate()
                    } else {
                        setModalActive(prev => ({ ...prev, "plans-modal": true }))
                    }
                }
            }}
            secondaryActions={[
                { content: 'Cancel', destructive: true, icon: UndoIcon, onAction: () => navigate(`/rules`) },
            ]}
        >
            <Layout>
                <Layout.Section>
                    <BlockStack gap={400}>
                        <Card>
                            <BlockStack gap={300}>
                                <TextField type='text' placeholder='Title' label="Title" name='title' helpText="Title displayed to the customers at checkout." value={rate.title} error={validationErrors.title} onChange={value => handleChange({ "title": value })} />
                                <TextField type='text' placeholder='Description (Optional)' label="Description" name='description' helpText="Description displayed below the shipping method name at checkout." value={rate.description} onChange={value => handleChange({ "description": value })} />
                                <Select
                                    label="Status"
                                    name="status"
                                    options={[
                                        { label: 'Active', value: 'active' },
                                        { label: 'Draft', value: 'draft' }
                                    ]}
                                    onChange={value => handleChange({ "status": value })}
                                    value={rate.status}
                                />
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap={300}>
                                <Select
                                    label="Ship to"
                                    options={shipToOptions}
                                    onChange={value => {
                                        if (value !== "none") {
                                            setRequiredFields(prev => ([...prev, "shipToValue"]))
                                        }
                                        handleChange({ "shipTo": value, shipToValue: [] })
                                    }}
                                    value={rate.shipTo}
                                />
                                {rate.shipTo === "zip" || rate.shipTo === "city" ? <ShopifyCombobox
                                    label={`Add ${rate.shipTo === "zip" ? "zipcode" : "city"}`}
                                    helpText={"Do not use comma ( , ) in values."}
                                    category={rate.shipTo === "zip" ? "zipcode" : "city"}
                                    selected={rate.shipToValue}
                                    placeholder={`Write ${rate.shipTo === "zip" ? "zipcode" : "city name"} here`}
                                    onChange={values => {
                                        handleChange({ "shipToValue": values })
                                    }}
                                    error={validationErrors.shipToValue}
                                // options={
                                //     rate.shipTo === "country"
                                //         ? countries || []
                                //         : rate.shipTo === "state"
                                //             ? statesList || []
                                //             : []
                                // }
                                /> : null}
                                {
                                    rate.shipTo === "country" ? <SelectList
                                        placeholder={`Select Countries`}
                                        label={<p>Select Countries{REQUIRED_FIELDS.indexOf("countries") > -1 ? "*" : ""}</p>}
                                        error={validationErrors.countries}
                                        options={countries}
                                        defaults={rate.shipToValue}
                                        handleChange={values => {

                                            // const states = findIntersection(values, statesList)
                                            // setStates(states)
                                            handleChange({ "shipToValue": values })
                                        }}
                                    /> : null
                                }
                                {
                                    rate.shipTo === "state" ? <SelectList
                                        placeholder={`Select States`}
                                        label={<p>Select States</p>}
                                        // error={validationErrors.states}
                                        groupedOptions={statesList}
                                        defaults={defaultStates?.length ? defaultStates : rate.shipToValue}
                                        handleChange={states => { console.log(states); handleChange({ "shipToValue": states }) }}
                                    /> : null
                                }
                            </BlockStack>
                        </Card>
                        <Card>
                            <BlockStack gap={300}>
                                <Select
                                    label="Select the criteria for calculating the shipping rate"
                                    options={chargeByOptions}
                                    onChange={value => {
                                        // if (value !== "none") {
                                        //   setRequiredFields(prev => ([...prev, "ranges"]))
                                        // }
                                        handleChange({ "chargeBy": value })
                                    }}
                                    value={rate.chargeBy}
                                />
                            </BlockStack>
                        </Card>
                        {rate.chargeBy !== "none" && <Card>
                            <InlineGrid columns="1fr auto">
                                <CardTitle title={"Shipping rate ranges"} />
                                {
                                    rate.ranges.length ? <Button
                                        variant='secondary'
                                        onClick={() => {
                                            setRange({
                                                from: "",
                                                upto: "",
                                                price: "",
                                            })
                                            shopify.modal.show("add-range")
                                        }}
                                        accessibilityLabel="Add range"
                                        // icon={PlusIcon}
                                        size='slim'
                                    >
                                        Add range
                                    </Button> : null
                                }
                            </InlineGrid>
                            {(rate.ranges.length && rangeRows.length) ? <>
                                <DataTable
                                    columnContentTypes={['text', 'text', 'text', '']}
                                    headings={['Min', 'Max', `Price`, ``]}
                                    rows={rangeRows}
                                />
                            </> : <EmptyStateShopify ref={addRangeRef} image='' heading="No shipping rate ranges yet" message={"Menagae your shipping rate rangesaccirding to order price, or order weight, or checkout quantity."} primaryContent="Add range" primaryAction={() => shopify.modal.show("add-range")} />}
                        </Card>}

                    </BlockStack>
                </Layout.Section>
                <Layout.Section variant='oneThird'>
                    <Card>
                        <TextField type='text' label="Price" placeholder='0' prefix={store?.moneyFormat.replace("{{amount}}", "")} name='price' value={rate.price} error={validationErrors.price} onChange={value => handleChange({ "price": value })} onBlur={e => {
                            if (isNaN(e.target.value)) {
                                handleChange({ "price": "0.00" })
                            }
                        }} />
                    </Card>
                </Layout.Section>
            </Layout>
            <AddRangeForm
                rate={rate}
                range={range}
                empty_range={empty_range}
                rangeError={rangeError}
                rangePrefix={rangePrefix}
                handleChange={handleChange}
                handleChangeRange={handleChangeRange}
                setRangeError={setRangeError}
            />
        </Page>
    )
}

export default CreateRate