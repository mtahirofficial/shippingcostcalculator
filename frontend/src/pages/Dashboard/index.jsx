import React from 'react'
import { BlockStack, Box, Card, EmptyState, Page, Text } from '@shopify/polaris'
import { useApp } from '../../providers/AppProvider'
import { useNavigate } from 'react-router-dom'
import CarrierServiceWarning from '../../components/CarrierServiceWarning'

const Dashboard = () => {
    const { store } = useApp()
    const navigate = useNavigate();
    // let dt = new Date()
    return (
        <Page
            narrowWidth
        >
            <BlockStack gap={400}>
                <Card>
                    <Text>
                        Welcome {store?.firstLoad ? "back" : `to ${process.env.REACT_APP_APP_NAME}`}, {store?.owner}
                    </Text>
                </Card>
                {store ? <CarrierServiceWarning store={store} /> : null}
                <Card>
                    <EmptyState
                        fullWidth
                        heading={"Shipping Zones"}
                        // action={{
                        //     content: "Create zone",
                        //     onAction: () => navigate("/zones/new")
                        // }}
                        secondaryAction={{
                            content: 'Zones',
                            onAction: () => navigate("/zones")
                        }}
                        image={"https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"}
                    >
                        <Box paddingInline={400}>
                            <p>Group regions like countries or states into zones with specific rates. Customize rates for accurate shipping, locally or internationally.</p>
                        </Box>
                    </EmptyState>
                </Card>
            </BlockStack>
        </Page>
    )
}

export default Dashboard