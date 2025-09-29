import React from 'react';
import { Banner, List } from '@shopify/polaris';

const ShopifyBanner = ({ title, actionContent, tone, onAction, loading, onDismiss = undefined, actionSize = "small", children }) => {
    return (
        <Banner
            title={title}
            action={actionContent ? {
                "content": actionContent,
                "variant": "primary",
                "loading": loading,
                "disabled": loading,
                "onAction": onAction,
                "size": actionSize
            } : undefined}
            tone={tone}
            onDismiss={onDismiss}
        >
            {children}
        </Banner>
    );
}

export default ShopifyBanner