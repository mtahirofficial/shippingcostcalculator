import React, { useCallback, useEffect, useState } from 'react'
import { Page, BlockStack, Badge, Card, DescriptionList, Text, Button, ResourceItem, Avatar, ResourceList, Box, InlineStack, InlineGrid } from '@shopify/polaris';
import axios from 'axios'
import { endpoints } from '../../../constants';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { request } from '../../../core/api';
import { DeleteIcon, EditIcon } from '@shopify/polaris-icons';
import { useApp } from '../../../providers/AppProvider'
import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { useZoneContext } from '../../../providers/ZoneProvider';
import EmptyStateShopify from '../../../components/EmptyStateShopify';
import Skeleton from '../../../components/Skeleton';

const ZoneView = () => {
    const shopify = useAppBridge();
    const navigate = useNavigate();
    let { id } = useParams();
    const [loading, setLoading] = useState("get")
    const { zones, setZones } = useZoneContext()
    const { store } = useApp()
    const [zone, setZone] = useState(null)
    const [delRate, setDelRate] = useState(null)

    const getZone = useCallback(
        async cancelToken => {
            const options = {
                "method": "GET",
                "cancelToken": cancelToken
            }
            setLoading("get")
            const response = await request(endpoints.zone + "/" + id, options)
            if (response.zone) {
                setZone(prev => ({ ...prev, ...response.zone }))
            }
            setLoading(false)
        },
        [],
    )

    useEffect(() => {
        const cancelToken = axios.CancelToken.source()
        if (!zone) {
            getZone(cancelToken.token)
        } else {
            setLoading(false)
        }

        return () => {
            cancelToken.cancel()
        }

    }, [zone])

    const deleteRate = async () => {
        try {
            const options = {
                "method": "DELETE",
                "data": { id: delRate.id, zoneId: zone.id }
            }
            setLoading("del")
            const response = await request(endpoints.rate, options, store.storeId)
            if (response.zone) {
                let filtered = zones.map(z => z.id === response.zone.id ? response.zone : z)
                setZones(filtered)
                setZone(response.zone)
                shopify.toast.show("Deleted successfully", { isError: false })
                shopify.modal.hide("delete-rate")
            }
        } catch (e) {
            shopify.toast.show(e.message, { isError: true })
        } finally {
            setLoading(false)
        }
    }
    const deleteZone = async id => {
        try {
            const options = {
                "method": "DELETE",
                "data": { id }
            }
            setLoading("del")
            const response = await request(endpoints.zone, options, store.storeId)
            if (response.delete) {
                let filtered = zones.filter(z => z.id !== id)
                setZones([...filtered])
                shopify.toast.show("Deleted successfully", { isError: false })
                navigate("/zones")
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

    console.log("zone", zone);

    return (
        <Page
            narrowWidth
            title={zone?.name}
            subtitle={zone?.desc}
            titleMetadata={<Badge tone={zone?.status === "active" ? "success" : "info"}>{zone?.status}</Badge>}
            backAction={{ content: 'Zones', onAction: () => navigate("/zones") }}
            primaryAction={
                { content: 'Add Rate', onAction: () => navigate('rates/new', { state: { zoneId: zone.id } }) }
            }
            secondaryActions={[
                { content: 'Add Zone', onAction: () => navigate('/zones/new') },
            ]}
        >
            <BlockStack gap={400}>
                <InlineStack gap={200}>
                    <Button variant={"tertiary"} icon={EditIcon} onClick={() => navigate(`edit`, { state: { zone: zone } })}>
                        Edit
                    </Button>
                    <Button variant="tertiary" tone="critical" loading={loading === "del"} disabled={loading === "del"} icon={DeleteIcon} destructive onClick={() => {
                        shopify.modal.show("delete-zone")
                    }}>
                        Delete
                    </Button>
                </InlineStack>
                <Card padding={400}>
                    {/* <Box padding="400"> */}
                    <DescriptionList
                        items={[
                            {
                                term: 'Price',
                                description: <Text as="span" variant="headingLg">{store?.moneyFormat.replace("{{amount}}", "") + zone?.price}</Text>
                            },
                            {
                                term: 'Countries',
                                description: <InlineStack gap={200}> {
                                    zone?.countries.map(c => (<Badge>{c.label}</Badge>))
                                }</InlineStack>
                            },
                            {
                                term: 'States',
                                description: <BlockStack gap={400}> {
                                    zone?.states?.map(s => {
                                        return <InlineStack gap={200}>
                                            {
                                                zone.states?.length > 1 && <Text as='h6' fontWeight="medium">
                                                    {s?.label}:{" "}
                                                </Text>
                                            }

                                            {
                                                s?.options.map(o => {
                                                    return <Badge>{o?.label}</Badge>
                                                })
                                            }
                                        </InlineStack>
                                    })
                                }</BlockStack>
                            }
                        ]}
                    />
                    {/* </Box> */}
                </Card>
                <Card padding={0}>
                    {
                        zone?.rates?.length ? <>
                            <Box padding={400}>
                                <InlineGrid columns={['twoThirds', 'oneHalf']}>
                                    <InlineStack gap={200} align='start'>
                                        <Text as="h2" variant="headingSm">
                                            {zone?.rates?.length}{" "}Shipping rate(s) in the zone
                                        </Text>
                                    </InlineStack>
                                    <InlineStack align='end' blockAlign='center'>
                                        <Button onClick={() => navigate('rates/new', { state: { zoneId: zone.id } })}>Add Rate</Button>
                                    </InlineStack>
                                </InlineGrid>
                            </Box>
                            <ResourceList
                                items={zone?.rates}
                                resourceName={{
                                    singular: 'Rate',
                                    plural: 'Rates',
                                }}
                                renderItem={item => {
                                    const { id, key, zoneId, userId, storeId, title, description, shipTo, shipToValue, chargeBy, status, price, unit, priceBy, xQty } = item;
                                    const chars = title.split(" ")
                                    let initials = ''
                                    for (const char of chars) {
                                        initials += char[0]?.toUpperCase()
                                    }
                                    const media = <Avatar initials={initials} size="md" name={title} />;

                                    return (
                                        <ResourceItem
                                            id={id}
                                            // url={`zones/${id}`}
                                            onClick={() => navigate(`rates/${id}`, { state: { rate: item } })}
                                            media={media}
                                            accessibilityLabel={`View details for ${title}`}
                                            persistActions={true}
                                            shortcutActions={[
                                                {
                                                    content: 'Delete',
                                                    accessibilityLabel: `Delete ${title}`,
                                                    plain: true,
                                                    destructive: true,
                                                    onAction: () => {
                                                        setDelRate(item)
                                                        shopify.modal.show("delete-rate")
                                                    }
                                                },
                                            ]}
                                        >
                                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                {title} <Badge tone={status === "active" ? "success" : "info"}>{status}</Badge>
                                            </Text>
                                            <div>Price: <Text variant="bodySm" fontWeight="bold" as="span">
                                                {store?.moneyFormat.replace("{{amount}}", "") + price}
                                            </Text></div>
                                        </ResourceItem>
                                    );
                                }}
                            />
                        </> : <EmptyStateShopify
                            fullWidth={true}
                            heading={"Oops! No Shipping Rates Added Yet"}
                            message="It seems you haven't added any shipping rates for this zone yet. Shipping rates determine the costs associated with shipping to specific regions within a shipping zone. By adding shipping rates, you can specify the pricing for different shipping methods, weights, or order totals within this zone."
                            image={"https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"}
                            primaryContent={"Add rate"}
                            primaryAction={() => navigate("rates/new", { state: { zoneId: zone.id } })}
                        />
                    }
                </Card>
            </BlockStack>
            <Modal id="delete-zone">
                <Box padding={400}>
                    <p>If you delete this zone, it can't be undone.</p>
                    <p>All shipping rates will also be deleted.</p>
                </Box>
                <TitleBar title={`Delete the zone ${zone?.name}`}>
                    <button variant="primary" tone="critical" onClick={() => deleteZone(zone?.id)}>
                        Delete
                    </button>
                    <button onClick={() => shopify.modal.hide("delete-zone")}>Cancel</button>
                </TitleBar>
            </Modal>
            <Modal id="delete-rate">
                <Box padding={400}>
                    <p>If you delete this rate, it can't be undone.</p>
                    <p>All shipping ranges will also be deleted.</p>
                </Box>
                <TitleBar title={`Delete the shipping rate ${delRate?.title}`}>
                    <button variant="primary" tone="critical" onClick={() => deleteRate(delRate?.id)}>
                        Delete
                    </button>
                    <button onClick={() => shopify.modal.hide("delete-rate")}>Cancel</button>
                </TitleBar>
            </Modal>
        </Page>
    )
}

export default ZoneView