import React from 'react'
import { SkeletonPage, BlockStack, Card, InlineStack, SkeletonDisplayText, SkeletonBodyText } from '@shopify/polaris';

const Skeleton = () => {
    return (
        <SkeletonPage primaryAction narrowWidth>
            <BlockStack gap={400}>
                <InlineStack gap={200}>
                    <SkeletonDisplayText size="medium" />
                    <SkeletonDisplayText size="medium" />
                </InlineStack>
                <Card padding={400}>
                    <SkeletonBodyText />
                </Card>
                <Card padding={400}>
                    <SkeletonBodyText />
                </Card>
            </BlockStack>
        </SkeletonPage>
    )
}

export default Skeleton