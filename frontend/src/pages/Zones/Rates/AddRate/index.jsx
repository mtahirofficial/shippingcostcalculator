import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Page, BlockStack, Select, Card, TextField, InlineGrid, Button, DataTable, Box, FormLayout, Form, Text, Banner, InlineStack } from '@shopify/polaris';
import { SaveIcon, UndoIcon, EditIcon, DeleteIcon } from '@shopify/polaris-icons';
import { chargeBy, chargeByOptions, endpoints, shipToOptions, weightUnits } from '../../../../constants';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import CardTitle from '../../../../components/CardTitle';
import EmptyStateShopify from '../../../../components/EmptyStateShopify';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import ShopifyCombobox from '../../../../components/ShopifyCombobox';
import { useApp } from '../../../../providers/AppProvider';
import { request } from '../../../../core/api';
import { useZoneContext } from '../../../../providers/ZoneProvider';
import Skeleton from '../../../../components/Skeleton';
import axios from 'axios';
import { randomStr, validate } from '../../../../utilis';
import AddRangeForm from '../../../../components/AddRangeForm';

const empty_range = {
  from: "",
  upto: "",
  price: "",
}

const AddRate = () => {
  const shopify = useAppBridge();
  const { setZones } = useZoneContext()
  const { store } = useApp()
  const navigate = useNavigate();
  const params = useParams()
  const addRangeRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [rangeRows, setRangeRows] = useState([])
  const [rangePrefix, setRangePrefix] = useState("")
  const [validationErrors, setValidationErrors] = useState({})
  const [REQUIRED_FIELDS, setRequiredFields] = useState(["title", "price"])
  const [rangeError, setRangeError] = useState(false)
  const [range, setRange] = useState({ ...empty_range })
  const [deleted, setDeleted] = useState([])
  const [rate, setRate] = useState({
    "title": "",
    "shipTo": "none",
    "price": "",
    "shipToValue": [],
    "chargeBy": "none",
    "unit": "kg",
    "priceBy": "flat",
    "xQty": false,
    "currency": "$",
    "status": "active",
    "zoneId": params.zoneId,
    "ranges": []
  })

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
    let cb = rate.chargeBy
    setRangePrefix(cb === "price" ? store?.moneyFormat.replace("{{amount}}", "") : (cb === "weight" ? weightUnits[rate.unit] : ""))
  }, [rate.chargeBy])

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
      }
      setLoading(false)
    },
    [],
  )

  useEffect(() => {
    const cancelToken = axios.CancelToken.source()
    if (params.id === "undefined" || params.id === "null" || isNaN(params.id)) {
      <Navigate to={`/zones/${params.zoneId}`} />
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
          setZones(prevZones => {
            let zones = prevZones.map(item => {
              if (item.id.toString() === _rate.zoneId.toString()) {
                if (rate.id) {
                  let rates = []
                  rates = item.rates.map(r => {
                    return r.id.toString() === rate.id.toString() ? _rate : rate
                  })
                  item.rates = rates
                } else {
                  item.rates = [_rate, ...item.rates]
                }
              }
              return item
            })
            return zones
          })
          shopify.toast.show("Rate added successfully.")
          navigate(`/zones/${params.zoneId}${!isNaN(params.id) ? `/rates/${params.id}` : ""}`)
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
      title={`${!isNaN(params.id) ? "Edit" : "Add"} rate`}
      backAction={{ content: 'Zone', onAction: () => navigate(`/zones/${params.zoneId}${!isNaN(params.id) ? `/rates/${params.id}` : ""}`) }}
      primaryAction={{ content: !isNaN(params.id) ? "Update" : "Save", loading: loading, disabled: loading, icon: SaveIcon, onAction: addRate }}
      secondaryActions={[
        { content: 'Cancel', destructive: true, icon: UndoIcon, onAction: () => navigate(`/zones/${params.zoneId}${!isNaN(params.id) ? `/rates/${params.id}` : ""}`) },
      ]}
    >
      <BlockStack gap={400}>
        <Card>
          <TextField type='text' placeholder='Title' label="Title" name='title' value={rate.title} error={validationErrors.title} onChange={value => handleChange({ "title": value })} />
          <TextField type='text' placeholder='Description' label="Description" name='description' value={rate.description} onChange={value => handleChange({ "description": value })} />
        </Card>
        <Card>
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
          <TextField type='text' label="Price" placeholder='0' prefix={store?.moneyFormat.replace("{{amount}}", "")} name='price' value={rate.price} error={validationErrors.price} onChange={value => handleChange({ "price": value })} onBlur={e => {
            if (isNaN(e.target.value)) {
              handleChange({ "price": "0.00" })
            }
          }} />
        </Card>
        <Card>
          <BlockStack gap={200}>
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
            {
              rate.shipTo !== "none" && <ShopifyCombobox
                label={`Add ${rate.shipTo === "zip" ? "zipcode" : "city"}`}
                helpText={"Do not use comma ( , ) in values."}
                category={rate.shipTo === "zip" ? "zipcode" : "city"}
                selected={rate.shipToValue}
                placeholder={`Write ${rate.shipTo === "zip" ? "zipcode" : "city name"} here`}
                onChange={values => handleChange({ "shipToValue": values })}
                error={validationErrors.shipToValue}
              />
            }
          </BlockStack>
        </Card>
        <Card>
          <Select
            label="Charge By"
            options={chargeByOptions}
            onChange={value => {
              // if (value !== "none") {
              //   setRequiredFields(prev => ([...prev, "ranges"]))
              // }
              handleChange({ "chargeBy": value })
            }}
            value={rate.chargeBy}
          />
          {/* {
            rate.chargeBy === "weight" ? <div style={{ marginTop: "24px" }}>
              <Select
                label="Weight unit"
                labelHidden
                options={[
                  { label: "kg", value: 'kg' },
                  { label: "lb", value: 'lb' },
                  { label: "oz", value: 'oz' },
                  { label: "g", value: 'g' }
                ]}
                value={rate.unit}
                onChange={value => {
                  handleChange({ "unit": value })
                }} />
            </div> : null
          } */}
          {/* {
            rate.chargeBy === "price" ? <div style={{ marginTop: "24px" }}>
              <Select
                label="Price"
                labelHidden
                options={[
                  { label: "%", value: '%' },
                  { label: "Flat", value: 'flat' }
                ]}
                value={rate.priceBy}
                onChange={value => {
                  handleChange({ "priceBy": value })
                }} />
            </div> : null
          } */}
          {/* {
            rate.chargeBy === "qty" ? <div style={{ marginTop: "24px" }}>
              <Select
                label="Qty"
                labelHidden
                options={[
                  { label: "Cost per Item", value: "multiply" },
                  { label: "Flat", value: "flat" }
                ]}
                value={rate.xQty ? "multiply" : "flat"}
                onChange={value => {
                  handleChange({ "xQty": value === "multiply" })
                }}
              />
            </div> : null
          } */}
        </Card>
        {
          rate.chargeBy !== "none" && <Card>
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
            {
              rate.ranges.length ? <>
                <DataTable
                  columnContentTypes={['text', 'text', 'text', '']}
                  headings={['Min', 'Max', `Price`, ``]}
                  rows={rangeRows}
                />
              </> : <EmptyStateShopify ref={addRangeRef} heading="No shipping rate ranges yet" message={"Menagae your shipping rate rangesaccirding to order price, or order weight, or checkout quantity."} primaryContent="Add range" primaryAction={() => shopify.modal.show("add-range")} />
            }
          </Card>
        }
      </BlockStack>

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

      {/* <Modal id="add-range">
        <Box padding={400}>
          <BlockStack gap={400}>
            <Text variant='headingSm' as='h5'>
              Add {chargeBy[rate.chargeBy]} ranges
            </Text>
            {rangeError ? <div className="no-shadow-card"><Card padding={0}>
              <Banner tone="critical">
                <p>'Min', 'Max', and 'Price' are all set to 0, creating an additional range. Set values that are greater than 0, please.</p>
              </Banner>
            </Card></div> : null}
            <Form>
              <FormLayout>
                <TextField type='text' label="Min" placeholder='0' prefix={rangePrefix} value={range.from} onChange={value => handleChangeRange({ "from": value })} onBlur={e => {
                  if (isNaN(e.target.value)) {
                    handleChangeRange({ "from": "0" })
                  }
                }} />
                <TextField type='text' label="Max" placeholder='0' prefix={rangePrefix} value={range.upto} onChange={value => handleChangeRange({ "upto": value })} onBlur={e => {
                  if (isNaN(e.target.value)) {
                    handleChangeRange({ "upto": "0" })
                  }
                }} />
                <TextField type='text' label="Price" placeholder='0' prefix={store?.moneyFormat.replace("{{amount}}", "")} value={range.price} onChange={value => handleChangeRange({ "price": value })} onBlur={e => {
                  if (isNaN(e.target.value)) {
                    handleChangeRange({ "price": "0" })
                  }
                }} />
              </FormLayout>
            </Form>
          </BlockStack>
        </Box>
        <TitleBar title={`${range._id ? "Update" : "Add"} range`}>
          <button variant="primary" onClick={() => {
            if (!range.from && !range.upto && !range.price) {
              shopify.toast.show("At least one of 'Min' or 'Max', and the Price must be set.", { isError: true });
            } else if (!range.from && !range.upto) {
              shopify.toast.show("At least one of 'Min' or 'Max' must be set.", { isError: true });
            } else if (!range.price) {
              shopify.toast.show("The 'price' field must be set.", { isError: true });
            } else if (range.from < 1 && range.upto < 1 && range.price < 1) {
              setRangeError(true)
            } else {
              let ranges = [...rate.ranges]
              if (range._id) {
                ranges = ranges.map(r => {
                  return range._id === r._id ? range : r
                })
              } else {
                ranges.unshift({ ...range, _id: randomStr(7) })
              }
              handleChange({ "ranges": ranges })
              handleChangeRange({ ...empty_range })
              shopify.modal.hide("add-range")
            }
          }}>{range._id ? "Update" : "Add"}</button>
          <button onClick={() => {
            shopify.modal.hide("add-range")
            handleChangeRange({ ...empty_range })
            setRangeError(false)
          }}>Cancel</button>
        </TitleBar>
      </Modal> */}
    </Page>
  )
}

export default AddRate