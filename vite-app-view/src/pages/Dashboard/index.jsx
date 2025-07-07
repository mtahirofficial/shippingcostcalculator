import React, { useState } from 'react'
import { BlockStack, Box, CalloutCard, Card, EmptyState, MediaCard, Page, Text, VideoThumbnail } from '@shopify/polaris'
import { useApp } from '../../providers/AppProvider'
import { useNavigate } from 'react-router-dom'
import CarrierServiceWarning from '../../components/CarrierServiceWarning'
import anim1 from "../../images/anim1.gif";
import free_shipping from "../../images/free_shipping.gif";
import help_anim from "../../images/help_anim.gif";
import defaultShip from "../../images/default.gif";
import BillingCard from '../../components/BillingCard'

const Dashboard = () => {
    const { store, activeFeatures, setModalActive } = useApp()
    const navigate = useNavigate();
    const [showVideo, setShowVideo] = useState(false)
    // let dt = new Date()
    return (
        <Page
            narrowWidth
            title="Dashboard"
        >
            <BlockStack gap={400}>
                <Card>
                    <Text>
                        Welcome {store?.firstLoad ? "back" : `to ${import.meta.env.VITE_APP_NAME}`}, {store?.owner}
                    </Text>
                </Card>
                {!store ? null : <CarrierServiceWarning store={store} />}
                <BillingCard />
                <CalloutCard
                    title="Shipping Calculation Rules"
                    illustration={anim1}
                    // illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
                    primaryAction={{
                        content: "Add rule",
                        variant: "primary",
                        onAction: () => {

                            if (activeFeatures.rules) {
                                navigate("/rules/new")
                            } else {
                                setModalActive(prev => ({ ...prev, "plans-modal": true }))
                            }
                        }
                    }}
                    secondaryAction={{
                        content: 'Rules',
                        variant: "secondary",
                        onAction: () => navigate("/rules")
                    }}
                >
                    <p>Shipping rules determine the costs associated with shipping to specific regions according to zip/postal codes or cities. By adding shipping rules, you can specify the pricing for different shipping methods, weights, or order totals.</p>
                </CalloutCard>
                <CalloutCard
                    title="Default Shipping Rule"
                    illustration={defaultShip}
                    // illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
                    primaryAction={{
                        content: "Set rule",
                        // variant: "primary",
                        onAction: () => {

                            if (activeFeatures.default_rule) {
                                navigate("/default_rule")
                            } else {
                                setModalActive(prev => ({ ...prev, "plans-modal": true }))
                            }
                        }
                    }}
                >
                    <p>A fallback rate shown at checkout when no other rule matches. No conditions apply.</p>
                </CalloutCard>
                <CalloutCard
                    title="Free Shipping Rule"
                    illustration={free_shipping}
                    // illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
                    primaryAction={{
                        content: "Set rule",
                        // variant: "primary",
                        onAction: () => {

                            if (activeFeatures.free_shipping) {
                                navigate("/free_shipping_rule")
                            } else {
                                setModalActive(prev => ({ ...prev, "plans-modal": true }))
                            }
                        }
                    }}
                >
                    <p>Applies automatically when the cart total meets the minimum threshold.</p>
                </CalloutCard>
                {/* <MediaCard
                    portrait
                    title="Grow your business using this app"
                    primaryAction={{
                        content: 'Learn more',
                        url: "https://www.youtube.com/@LogicsArcade",
                        external: true
                    }}
                    description="In this video, you’ll learn how to use this app."
                >
                    {showVideo ? <iframe width="100%" height="315" src="https://www.youtube.com/embed/sVkT-YTUXS4" frameborder="0" allowfullscreen></iframe> : <VideoThumbnail
                        thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                        onClick={() => setShowVideo(true)}
                    />}
                </MediaCard> */}
                <CalloutCard
                    title="Need help?"
                    illustration={help_anim}
                    primaryAction={{
                        content: "Get Support",
                        variant: "primary",
                        url: "https://wa.me/923457699395",
                        external: true
                    }}
                    secondaryAction={{
                        content: 'FAQs',
                        onAction: () => navigate("/help-center")
                    }}
                >
                    <p>If something’s not working or you’re unsure what to do next, don’t worry.
                        You’re not alone — we’re right here with you.
                        Take a moment, and reach out anytime. We’ll guide you step by step until everything’s back on track.</p>
                </CalloutCard>
            </BlockStack>
        </Page>
    )
}

export default Dashboard