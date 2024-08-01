import React from 'react'
import { BlockStack, Box, Card, EmptyState, Page, Text } from '@shopify/polaris'
import { useApp } from '../../providers/AppProvider'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
    const { store } = useApp()
    const navigate = useNavigate();
    // let dt = new Date()
    return (
        <Page
            narrowWidth
            title="Dashboard"
        >
            <BlockStack gap={400}>
                <Card>
                    <Text>
                        Welcome {store?.firstLoad ? "back" : `to ${process.env.REACT_APP_APP_NAME}`}, {store?.owner}
                    </Text>
                </Card>
                <Card>
                    <EmptyState
                        fullWidth
                        heading={"Shipping Zones"}
                        action={{
                            content: "Add zone",
                            onAction: () => navigate("/zones/new")
                        }}
                        secondaryAction={{
                            content: 'Zones',
                            onAction: () => navigate("/zones")
                        }}
                        image={"https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"}
                    >
                        <Box paddingInline={400}>
                            <p>Zones simplify your shipping by grouping regions like countries and states, each with specific rate rules. Whether shipping locally or internationally, customize rules for accurate calculations, optimizing your strategy.</p>
                        </Box>
                    </EmptyState>
                </Card>
            </BlockStack>
        </Page>
    )
}

export default Dashboard