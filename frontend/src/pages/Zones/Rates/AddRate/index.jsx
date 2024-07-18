import React, { useCallback, useEffect, useState } from 'react'
import { SaveIcon, UndoIcon, PlusIcon } from '@shopify/polaris-icons';
import { Page, BlockStack, Select, Card, TextField, InlineGrid, Button, DataTable, Box, FormLayout, Form, Divider, InlineStack } from '@shopify/polaris';
import { chargeBy, chargeByOptions, endpoints, shipToOptions } from '../../../../constants';
import Creatable from '../../../../components/Creatable';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import CardTitle from '../../../../components/CardTitle';
import EmptyStateShopify from '../../../../components/EmptyStateShopify';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import ShopifyCombobox from '../../../../components/ShopifyCombobox';
import { useApp } from '../../../../providers/AppProvider';
import { request } from '../../../../core/api';
import { useZoneContext } from '../../../../providers/ZoneProvider';
import Skeleton from '../../../../components/Skeleton';
import axios from 'axios';

const AddRate = () => {
  const shopify = useAppBridge();
  const { zones, setZones } = useZoneContext()
  const { store } = useApp()
  const navigate = useNavigate();
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [rangeRows, setRangeRows] = useState([])

  const [rate, setRate] = useState({
    "shipTo": "none",
    "price": "",
    "shipToValue": [],
    "chargeBy": "none",
    "unit": "g",
    "priceBy": "flat",
    "xQty": true,
    "currency": "$",
    "status": "active",
    "zoneId": params.zoneId,
    "ranges": []
  })
  const [range, setRange] = useState({
    from: "",
    upto: "",
    price: "",
  })

  useEffect(() => {
    let rangeRows = rate.ranges.map(r => ([r.from, r.upto, r.price]))
    setRangeRows(rangeRows)
  }, [rate.ranges])

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
    setRate(prev => ({ ...prev, ...values }))
  }
  const handleChangeRange = values => {
    setRange(prev => ({ ...prev, ...values }))
  }

  const lbl = <div className="Polaris-Labelled__LabelWrapper">
    <div className="Polaris-Label">
      <label id="PolarisTextField2Label" for="PolarisTextField2" className="Polaris-Label__Text">{" "}</label>
    </div>
  </div>

  const addRate = async () => {
    try {
      const options = {
        "method": rate.id ? "PUT" : "POST",
        "data": { "rate": { ...rate } }
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
          <TextField type='text' placeholder='Title' label="Title" name='title' value={rate.title} onChange={value => handleChange({ "title": value })} />
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
          <TextField type='text' label="Price" placeholder='0' prefix={store?.moneyFormat.replace("{{amount}}", "")} name='price' value={rate.price} onChange={value => handleChange({ "price": value })} />
        </Card>
        <Card>
          <BlockStack gap={200}>
            <Select
              label="Ship to"
              options={shipToOptions}
              onChange={value => handleChange({ "shipTo": value, shipToValue: [] })}
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
              />
            }
          </BlockStack>
        </Card>
        <Card>
          <FormLayout.Group condensed>
            <Select
              label="Charge By"
              options={chargeByOptions}
              onChange={value => handleChange({ "chargeBy": value })}
              value={rate.chargeBy}
            />
            {/* {
              rate.chargeBy === "weight" ? <span>
                {lbl}
                <Select
                  label=" "
                  options={[
                    { label: "kg", value: 'kg' },
                    { label: "lb", value: 'lb' },
                    { label: "oz", value: 'oz' }
                  ]}
                  value={rate.unit}
                  onChange={value => {
                    handleChange({ "unit": value })
                  }} />
              </span> : null
            }
            {
              rate.chargeBy === "price" ? <span>
                {lbl}
                <Select
                  label=" "
                  options={[
                    { label: "%", value: '%' },
                    { label: "Flat", value: 'flat' }
                  ]}
                  value={rate.priceBy}
                  onChange={value => {
                    handleChange({ "priceBy": value })
                  }} />
              </span> : null
            }
            {
              rate.chargeBy === "qty" ? <span>
                {lbl}
                <Select
                  label=" "
                  options={[
                    { label: "Multiply with price", value: "multiply" },
                    { label: "Flat", value: "flat" }
                  ]}
                  value={rate.xQty ? "multiply" : "flat"}
                  onChange={value => {
                    handleChange({ "xQty": value === "multiply" })
                  }}
                />
              </span> : null
            } */}
          </FormLayout.Group>
        </Card>
        {
          rate.chargeBy !== "none" && <Card>
            <InlineGrid columns="1fr auto">
              <CardTitle title={"Shipping rate ranges"} />
              {
                rate.ranges.length ? <Button
                  variant='primary'
                  onClick={() => shopify.modal.show("add-range")}
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
                  columnContentTypes={[
                    'text',
                    'text',
                    'text',
                  ]}
                  headings={[
                    'Min',
                    'Max',
                    'Price',
                  ]}
                  rows={rangeRows}
                />
              </> : <EmptyStateShopify heading="No shipping rate ranges yet" message={"Menagae your shipping rate rangesaccirding to order price, or order weight, or checkout quantity."} primaryContent="Add range" primaryAction={() => shopify.modal.show("add-range")} />
            }
          </Card>
        }
      </BlockStack>
      <Modal id="add-range">
        <Box padding={400}>
          <Form>
            <FormLayout>
              <TextField type='text' label="Min" placeholder='0' value={range.from} onChange={value => handleChangeRange({ "from": value })} />
              <TextField type='text' label="Max" placeholder='0' value={range.upto} onChange={value => handleChangeRange({ "upto": value })} />
              <TextField type='text' label="Price" placeholder='0' prefix={store?.moneyFormat.replace("{{amount}}", "")} value={range.price} onChange={value => handleChangeRange({ "price": value })} />
            </FormLayout>
          </Form>
          {/* <form data-save-bar>
            <label>
              From:
              <input name="from" value={range.from} autocomplete="name" onChange={event => handleChangeRange(event)} />
            </label>
            <label>
              Upto:
              <input name="upto" value={range.upto} autocomplete="name" onChange={event => handleChangeRange(event)} />
            </label>
            <label>
              Price:
              <input name="price" value={range.price} autocomplete="name" onChange={event => handleChangeRange(event)} />
            </label>
          </form> */}
        </Box>

        <TitleBar title={`Add range`}>
          <button variant="primary" onClick={() => {
            handleChange({
              "ranges": [range, ...rate.ranges]
            })
            handleChangeRange({ from: "", upto: "", price: "" })
            shopify.modal.hide("add-range")
          }}>Add</button>
          <button onClick={() => shopify.modal.hide("add-range")}>Cancel</button>
        </TitleBar>
      </Modal>
    </Page>
  )
}

export default AddRate