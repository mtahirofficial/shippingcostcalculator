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
                            <p>Zones are designed to simplify your shipping process by grouping regions such as countries and states. Each Zone contains specific shipping rate calculation rules tailored to the regions it encompasses."</p>
                            <p>Whether you're shipping nationally, internationally, or within specific states, our Zones streamline the process. Customize your shipping strategy efficiently by setting rules for each Zone, ensuring accurate and personalized calculations for the regions that matter to your business.</p>

                        </Box>
                    </EmptyState>
                </Card>
            </BlockStack>
        </Page>
    )
}

export default Dashboard