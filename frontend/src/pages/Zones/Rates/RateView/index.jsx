import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { DeleteIcon, EditIcon } from '@shopify/polaris-icons';
import { useApp } from '../../../../providers/AppProvider';
import { Page, BlockStack, Badge, Card, DescriptionList, Text, Divider, Button, Box, InlineStack, InlineGrid, DataTable } from '@shopify/polaris';
import { useZoneContext } from '../../../../providers/ZoneProvider';
import { chargeBy, endpoints, shipTo } from '../../../../constants';
import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { request } from '../../../../core/api';
import EmptyStateShopify from '../../../../components/EmptyStateShopify';
import axios from 'axios';
import Skeleton from '../../../../components/Skeleton';

const RateView = () => {
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const { zones, setZones } = useZoneContext()
  const params = useParams()
  const { store } = useApp()
  const [rate, setRate] = useState(null)
  const [loading, setLoading] = useState("get")

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
    if (!rate) {
      getRate(cancelToken.token)
    } else {
      setLoading(false)
    }

    return () => {
      cancelToken.cancel()
    }
  }, [rate])

  const deleteRate = async () => {
    try {
      const options = {
        "method": "DELETE",
        "data": { id: rate.id, zoneId: rate.zoneId }
      }
      setLoading("del")
      const response = await request(endpoints.rate, options, store.storeId)
      if (response.zone) {
        let filteredZones = zones.map(z => z.id === response.zone.id ? response.zone : z)
        setZones(filteredZones)
        shopify.toast.show("Deleted successfully", { isError: false })
        shopify.modal.hide("delete-rate")
        navigate(-1)
      }
    } catch (e) {
      shopify.toast.show(e.message, { isError: true })
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
      title={rate?.title}
      subtitle={rate?.description}
      titleMetadata={<Badge tone={rate?.status === "active" ? "success" : "info"}>{rate?.status}</Badge>}
      backAction={{ content: 'Zone', onAction: () => navigate(`/zones/${rate?.zoneId}`) }}
      primaryAction={{
        content: "Add Rate",
        onAction: () => navigate(`/zones/${rate.zoneId}/rates/new`, { state: { zoneId: rate.zoneId } })
      }}
    >
      <BlockStack gap={400}>
        <InlineStack gap={200}>
          <Button variant={"tertiary"} icon={EditIcon} onClick={() => navigate(`edit`, { "state": { rate, zoneId: rate.zoneId } })}>
            Edit
          </Button>
          <Button variant="tertiary" tone="critical" icon={DeleteIcon} destructive onClick={() => {
            shopify.modal.show("delete-rate")
          }}>
            Delete
          </Button>
        </InlineStack>
        <Card padding={0}>
          <Box padding="400">
            <DescriptionList
              items={[
                {
                  term: 'Price',
                  description: <Text as="span" variant="headingLg">{store?.moneyFormat.replace("{{amount}}", "") + rate?.price}</Text>
                },
                {
                  term: 'Charge by',
                  description: <Badge>{chargeBy[rate?.chargeBy]}</Badge>
                },
                {
                  term: 'Ship to',
                  description: <Badge>{shipTo[rate?.shipTo]}</Badge>
                },
                {
                  term: rate?.shipTo === "zip" ? "Zipcodes" : (rate?.shipTo === "city" ? "Cities" : null),
                  description: <BlockStack gap={200}>
                    <InlineStack gap={200}>
                      {rate?.shipToValue?.map(item => <Badge>{item}</Badge>)}
                    </InlineStack>
                  </BlockStack>
                }
              ]}
            />
          </Box>
        </Card>

        <Card padding={0}>
          {rate?.ranges?.length ? <><Box padding={400}>
            <InlineGrid columns={['twoThirds', 'oneHalf']}>
              <InlineStack gap={200} align='start'>
                <Text as="h2" variant="headingSm">
                  {rate?.ranges?.length}{" "}Ranges in the shipping rate
                </Text>
              </InlineStack>
            </InlineGrid>
          </Box>
            <Divider />
            <DataTable
              columnContentTypes={[
                'text',
                'text',
                'text'
              ]}
              headings={[
                'Min',
                'Max',
                'Price'
              ]}
              rows={rate?.ranges.map(r => ([r.from, r.upto, r.price ? store?.moneyFormat.replace("{{amount}}", r.price) : '']))}
            />
          </> : <EmptyStateShopify
            fullWidth={true}
            heading={"Oops! No Shipping Ranges Added Yet"}
            message="It looks like you haven't added any shipping cost ranges for this rate yet. Shipping ranges define the specific criteria, such as weight or order value, that determine the cost of shipping within this rate. By adding shipping cost ranges, you can set tailored pricing for different conditions within this shipping rate. Edit rate to add shipping ranges."
            image={"https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"}
            primaryContent={"Edit rate"}
            primaryAction={() => navigate(`edit`, { "state": { rate, zoneId: rate.zoneId } })}
          />}
        </Card>
      </BlockStack>
      <Modal id="delete-rate">
        <Box padding={400}>
          <p>If you delete this rate, it can't be undone.</p>
          <p>All shipping ranges will also be deleted.</p>
        </Box>
        <TitleBar title={`Delete the shipping rate ${rate?.title}`}>
          <button variant="primary" tone="critical" onClick={() => deleteRate(rate?.id)}>
            Delete
          </button>
          <button onClick={() => shopify.modal.hide("delete-rate")}>Cancel</button>
        </TitleBar>
      </Modal>
    </Page>
  )
}

export default RateView
