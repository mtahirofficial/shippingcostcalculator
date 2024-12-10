import React from 'react';
import { Banner, List } from '@shopify/polaris';

const ShopifyBanner = ({ title, actionContent, tone, onAction, loading, onDismiss = undefined, children }) => {
    return (
        <Banner
            title={title}
            action={actionContent ? {
                "content": actionContent,
                "loading": loading,
                "disabled": loading,
                "onAction": onAction
            } : undefined}
            tone={tone}
            onDismiss={onDismiss}
        >
            {children}
        </Banner>
    );
}

export default ShopifyBanner