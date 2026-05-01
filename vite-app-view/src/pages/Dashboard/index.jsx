import React from 'react'
import { Badge, BlockStack, Button, ButtonGroup, Card, DescriptionList, Divider, Icon, InlineStack, Layout, List, Page, Text } from '@shopify/polaris'
import { useApp } from '../../providers/AppProvider'
import { useNavigate } from 'react-router-dom'
import CarrierServiceWarning from '../../components/CarrierServiceWarning'
import BillingCard from '../../components/BillingCard'
import { DeliveryIcon, DiscountIcon, QuestionCircleIcon, ShippingLabelIcon } from '@shopify/polaris-icons'

const Dashboard = () => {
    const { store, activeFeatures, setModalActive } = useApp()
    const navigate = useNavigate()

    const handleRules = () => {
        if (activeFeatures.rules) {
            navigate('/rules/new')
        } else {
            setModalActive(prev => ({ ...prev, 'plans-modal': true }))
        }
    }

    const handleDefaultRule = () => {
        if (activeFeatures.default_rule) {
            navigate('/default_rule')
        } else {
            setModalActive(prev => ({ ...prev, 'plans-modal': true }))
        }
    }

    const handleFreeShipping = () => {
        if (activeFeatures.free_shipping) {
            navigate('/free_shipping_rule')
        } else {
            setModalActive(prev => ({ ...prev, 'plans-modal': true }))
        }
    }

    const billingStatus = store?.chargeId ? 'Active' : 'Not set'
    const rulesStatus = activeFeatures.rules ? 'Enabled' : 'Upgrade required'
    const defaultRuleStatus = activeFeatures.default_rule ? 'Enabled' : 'Upgrade required'
    const freeShippingStatus = activeFeatures.free_shipping ? 'Enabled' : 'Upgrade required'
    const statusBadge = (status) => {
        if (status === 'Active' || status === 'Enabled') return <Badge tone="success">{status}</Badge>
        if (status === 'Not set') return <Badge tone="warning">{status}</Badge>
        return <Badge tone="critical">{status}</Badge>
    }

    return (
        <Page
            title="Dashboard"
            primaryAction={{
                content: 'Add rule',
                onAction: handleRules,
            }}
            secondaryActions={[
                {
                    content: 'View rules',
                    onAction: () => navigate('/rules'),
                }
            ]}
        >
            <Layout>
                <Layout.Section>
                    <BlockStack gap={400}>
                        {store?.chargeId && <CarrierServiceWarning store={store} />}

                        <Card>
                            <BlockStack gap={200}>
                                <Text variant="headingMd" as="h2">
                                    Welcome {store?.firstLoad ? 'back' : `to ${import.meta.env.VITE_APP_NAME}`}, {store?.owner}
                                </Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    Build a clean shipping setup with clear rules, a fallback rate, and a free shipping threshold.
                                </Text>
                                {/* <ButtonGroup>
                                    <Button variant="primary" onClick={handleRules}>Add rule</Button>
                                    <Button onClick={() => navigate('/rules')}>View rules</Button>
                                </ButtonGroup> */}
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap={300}>
                                <Text variant="headingMd" as="h2">Core setup</Text>
                                <InlineStack gap={400} align="space-between" blockAlign="center" wrap={false}>
                                    <InlineStack gap={200} align="start" blockAlign="center">
                                        <Icon source={ShippingLabelIcon} tone="highlight" />
                                        <BlockStack gap={100}>
                                            <Text as="p" variant="bodyMd">Shipping rules</Text>
                                            <Text as="p" variant="bodySm" tone="subdued">Region, weight, quantity, or order total</Text>
                                        </BlockStack>
                                    </InlineStack>
                                    <Button variant="primary" onClick={handleRules}>Add rule</Button>
                                </InlineStack>

                                <Divider />

                                <InlineStack gap={400} align="space-between" blockAlign="center" wrap={false}>
                                    <InlineStack gap={200} align="start" blockAlign="center">
                                        <Icon source={DeliveryIcon} tone="highlight" />
                                        <BlockStack gap={100}>
                                            <Text as="p" variant="bodyMd">Default shipping rule</Text>
                                            <Text as="p" variant="bodySm" tone="subdued">Fallback rate when no rule matches</Text>
                                        </BlockStack>
                                    </InlineStack>
                                    <Button onClick={handleDefaultRule}>Set rule</Button>
                                </InlineStack>

                                <Divider />

                                <InlineStack gap={400} align="space-between" blockAlign="center" wrap={false}>
                                    <InlineStack gap={200} align="start" blockAlign="center">
                                        <Icon source={DiscountIcon} tone="highlight" />
                                        <BlockStack gap={100}>
                                            <Text as="p" variant="bodyMd">Free shipping rule</Text>
                                            <Text as="p" variant="bodySm" tone="subdued">Apply when cart hits your threshold</Text>
                                        </BlockStack>
                                    </InlineStack>
                                    <Button onClick={handleFreeShipping}>Set rule</Button>
                                </InlineStack>
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap={200}>
                                <Text variant="headingMd" as="h2">Best practices</Text>
                                <List type="bullet">
                                    <List.Item>Keep one default rule as a safety net</List.Item>
                                    <List.Item>Prefer narrower rules for higher priority</List.Item>
                                    <List.Item>Test with a few real cart values</List.Item>
                                </List>
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>

                <Layout.Section secondary>
                    <BlockStack gap={400}>
                        <Card>
                            <BlockStack gap={300}>
                                <Text variant="headingMd" as="h2">Status</Text>
                                <DescriptionList
                                    items={[
                                        { term: 'Billing', description: statusBadge(billingStatus) },
                                        { term: 'Rules feature', description: statusBadge(rulesStatus) },
                                        { term: 'Default rule', description: statusBadge(defaultRuleStatus) },
                                        { term: 'Free shipping', description: statusBadge(freeShippingStatus) },
                                    ]}
                                />
                            </BlockStack>
                        </Card>
                        <BillingCard />
                        <Card>
                            <BlockStack gap={300}>
                                {/* <InlineStack gap={200} align="start" blockAlign="center">
                                    <Icon source={QuestionCircleIcon} tone="highlight" />
                                </InlineStack> */}
                                <Text variant="headingMd" as="h2">Need help?</Text>
                                <Text as="p" variant="bodyMd">
                                    Having trouble? We are here with you. Reach out anytime for step-by-step support.
                                </Text>
                                <ButtonGroup>
                                    <Button variant="primary" url="https://wa.me/923457699395" external>Get support</Button>
                                    <Button onClick={() => navigate('/help-center')}>FAQs</Button>
                                </ButtonGroup>
                            </BlockStack>
                        </Card>
                    </BlockStack>
                </Layout.Section>
            </Layout>
        </Page>
    )
}

export default Dashboard
