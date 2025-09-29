import React, { useEffect, useState } from 'react'
import axios from "axios";
import { useApp } from '../../../providers/AppProvider';
import { Avatar, Badge, BlockStack, Box, Button, Card, EmptyState, InlineStack, Layout, Page, ResourceItem, ResourceList, Text } from '@shopify/polaris';
import { useNavigate, Link } from 'react-router-dom';
import { capitalize, getInitials } from '../../../utilis';
import { DuplicateIcon, EditIcon, DeleteIcon } from '@shopify/polaris-icons';
import { chargeBy, endpoints } from '../../../constants';
import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { request } from '../../../core/api';
import CarrierServiceWarning from '../../../components/CarrierServiceWarning';
import BillingCard from '../../../components/BillingCard';

const RATES_PER_PAGE = 20

const RateList = () => {
    const shopify = useAppBridge()
    const { store, activePlan, features, activeFeatures, setModalActive } = useApp()
    const navigateTo = useNavigate()
    const [rates, setRates] = useState([])
    const [page, setPage] = useState(1)
    const [message, setMessage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [delRate, setDelRate] = useState(null)
    const [isRules, setIsRules] = useState(false)

    const fetchData = async (isMounted) => {
        const config = {
            method: 'GET',
            url: `/rate`,
            headers: { "x-access-token": store?.storeId }
        }
        try {
            setLoading(true);
            const response = await axios(config)
            if (!response.data) throw new Error("Failed to fetch data");
            if (isMounted) {
                setRates(response.data.rates);
                setMessage("Data fetched successfully!");
            }
        } catch (error) {
            if (isMounted) setMessage(error.message);
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true; // Prevent state update if component unmounts
        if (store) {
            fetchData(isMounted);
        }
        return () => {
            isMounted = false; // Cleanup to avoid memory leaks
        }
    }, [store])

    const deleteRate = async () => {
        try {
            const options = {
                "method": "DELETE",
                "data": { id: delRate.id }
            }
            setLoading("del")
            const response = await request(endpoints.rate, options, store?.storeId)
            if (response.deleted.toString() === delRate.id.toString()) {
                let filtered = rates.filter(r => r.id.toString() !== response.deleted.toString())
                setRates(filtered)
                setDelRate(null)
                shopify.toast.show("Deleted successfully", { isError: false })
                shopify.modal.hide("delete-rate")
            }
        } catch (e) {
            shopify.toast.show(e.message, { isError: true })
        } finally {
            setLoading(false)
        }
    }
    const handleDuplicate = async id => {
        try {
            const options = {
                "method": "POST",
            }
            setLoading("dup")
            const response = await request(`${endpoints.rate}/duplicate/${id}`, options, store?.storeId)
            let newId = response.rate.id
            setRates(rates => {
                return [{ ...response.rate, title: response.rate.title + " (Duplicated)" }, ...rates]
            })

            setTimeout(() => {
                setRates(rates => {
                    for (const rate of rates) {
                        if (newId === rate.id) {
                            delete rate.duplicated
                        }
                    }
                    return [...rates]
                })
            }, 4000);
        } catch (e) {
            shopify.toast.show(e.message, { isError: true })
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        if (activeFeatures.rules) {
            navigateTo(`new`)
        } else {
            setModalActive(prev => ({ ...prev, "plans-modal": true }))
        }
    }

    const emptyStateMarkup = !rates.length ? (
        <EmptyState
            heading="Add new rule"
            action={{ content: 'Add rule', onAction: handleAddNew }}
            image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
        >
            <p>
                It seems you haven't added any shipping rules yet.
            </p>
        </EmptyState>
    ) : undefined;

    return (
        <Page
            title="Shipping Calculation Rules"
            primaryAction={{
                content: 'Add Rule', onAction: handleAddNew
            }}
            secondaryActions={[
                {
                    content: 'Default Rule', onAction: () => {
                        if (activeFeatures.default_rule) {
                            navigateTo("/default_rule")
                        } else {
                            setModalActive(prev => ({ ...prev, "plans-modal": true }))
                        }
                    }
                },
                {
                    content: 'Free Shipping Rule', onAction: () => {
                        if (activeFeatures.free_shipping) {
                            navigateTo("/free_shipping_rule")
                        } else {
                            setModalActive(prev => ({ ...prev, "plans-modal": true }))
                        }
                    }
                }
            ]}
        >
            <BlockStack gap={400}>
                {store?.chargeId && <CarrierServiceWarning store={store} />}
                <Layout>
                    <Layout.Section>
                        <Card>
                            <ResourceList
                                showHeader
                                resourceName={{ singular: 'rule', plural: 'rules' }}
                                items={rates}
                                loading={loading}
                                emptyState={emptyStateMarkup}
                                totalItemsCount={rates.length}
                                renderItem={item => {
                                    return <div className={`resource-item${item.duplicated ? " border-blink" : ""}`}>
                                        <ResourceItem
                                            id={item.id}
                                            media={<Avatar initials={getInitials(item.title, 2)} name={item.title} />}
                                            onClick={() => { navigateTo(item.id.toString()) }}
                                        >
                                            <InlineStack gap={200} align='space-between'>
                                                <InlineStack gap={200}>
                                                    <Link to={`${item.id.toString()}`} style={{ textDecoration: "none" }}>
                                                        <Text variant="bodyMd" fontWeight="bold" as="h3" tone="base">
                                                            {item.title}
                                                        </Text>
                                                    </Link>
                                                    <Badge tone={item.status === "suspend" ? "critical" : (item?.status === "active" ? "success" : "info")}>{capitalize(item.status)}</Badge>
                                                </InlineStack>
                                                <InlineStack gap={200}>
                                                    <Button variant="plain" icon={DuplicateIcon} loading={loading === "dup"} onClick={event => {
                                                        event.stopPropagation();

                                                        if (activeFeatures.rules) {
                                                            handleDuplicate(item.id)
                                                        } else {
                                                            setModalActive(prev => ({ ...prev, "plans-modal": true }))
                                                        }
                                                    }} >Duplicate</Button>
                                                    <Button variant="plain" icon={EditIcon} onClick={() => { navigateTo(item.id.toString()) }}>Edit</Button>
                                                    <Button variant="plain" icon={DeleteIcon} tone="critical" onClick={event => { event.stopPropagation(); setDelRate(item); shopify.modal.show("delete-rate") }}>Delete</Button>
                                                </InlineStack>
                                            </InlineStack>
                                            <div>Criteria: {chargeBy[item?.chargeBy]} | Cost: {store?.moneyFormat.replace("{{amount}}", item.price)}/-</div>
                                        </ResourceItem>
                                    </div>
                                }}
                            />
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneThird">
                        <BillingCard />
                    </Layout.Section>
                </Layout>
            </BlockStack>
            <Modal id="delete-rate">
                <Box padding={400}>
                    <p>If you delete this rule, it can't be undone.</p>
                </Box>
                <TitleBar title={`Delete the shipping rule ${delRate?.title}`}>
                    <button variant="primary" tone="critical" loading={loading === "del"} onClick={() => deleteRate(delRate?.id)}>
                        Delete
                    </button>
                    <button onClick={() => shopify.modal.hide("delete-rate")}>Cancel</button>
                </TitleBar>
            </Modal>
        </Page>
    )
}

export default RateList