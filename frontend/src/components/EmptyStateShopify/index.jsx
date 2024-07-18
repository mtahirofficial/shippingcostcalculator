import { Box, EmptyState } from '@shopify/polaris'
import React from 'react'

const EmptyStateShopify = ({ heading, message, image, primaryContent, primaryAction, fullWidth }) => {
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
                <p>{message}</p>
            </Box>
        </EmptyState>
    )
}

export default EmptyStateShopify