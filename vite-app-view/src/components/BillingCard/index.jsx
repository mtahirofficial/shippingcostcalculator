import { Card, Button, Text, BlockStack, Icon, Bleed, Box, InlineStack } from '@shopify/polaris';
import { useApp } from '../../providers/AppProvider';
import { RewardIcon } from '@shopify/polaris-icons';
function BillingCard() {
    const { store, billingUrl } = useApp()
    console.log("billingUrl", billingUrl);

    return (
        <Card>
            <Box background="bg-subdued" padding="4" borderRadius="3">
                <BlockStack gap="300">
                    <InlineStack gap={200} align='start' blockAlign='center'>
                        <Box>
                            <Icon source={RewardIcon} tone="highlight" />
                        </Box>
                        <Text variant="headingLg" as="h2">
                            Upgrade to Pro
                        </Text>
                    </InlineStack>
                    <Text as="p" tone="subdued">
                        Get premium tools, priority support, and unlock advanced features to supercharge your growth.
                    </Text>
                    <Box>
                        <Button onClick={() => {
                            console.log("billingUrl Button Click", billingUrl);
                            window.open(billingUrl, '_top')
                        }} variant="primary">
                            Upgrade Plans
                        </Button>
                    </Box>
                </BlockStack>
            </Box>
        </Card>
    );
}

export default BillingCard;
