import { Box, EmptyState } from '@shopify/polaris'
import React from 'react'

const EmptyStateShopify = ({ heading, message, ref, image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png", primaryContent, primaryAction, fullWidth }) => {
    return (
        <EmptyState
            fullWidth={fullWidth}
            heading={heading}
            action={{
                content: primaryContent,
                onAction: primaryAction
            }}
            image={image}
        >
            <Box paddingInline={400}>
                <p ref={ref}>{message}</p>
            </Box>
        </EmptyState>
    )
}

export default EmptyStateShopify