import { BlockStack, Card, SkeletonDisplayText, SkeletonBodyText, Text } from '@shopify/polaris'
import React from 'react'

const CardSkeleton = () => {
    return (
        <Card>
            <BlockStack gap={300} align='start'>
                <Text variant="headingSm" as="h4">
                    <SkeletonDisplayText size="small" />
                </Text>
                <SkeletonBodyText lines={3} />
            </BlockStack>
        </Card>
    )
}

export default CardSkeleton