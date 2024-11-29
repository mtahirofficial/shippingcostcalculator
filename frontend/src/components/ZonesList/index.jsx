import { Badge, Card, Text, Divider, ResourceItem, Avatar, ResourceList, Box, InlineStack, InlineGrid, Popover, ActionList, Button, BlockStack } from '@shopify/polaris';
import { useState } from 'react';
import { useZoneContext } from '../../providers/ZoneProvider';
import { Link, useNavigate } from "react-router-dom";
import { useApp } from '../../providers/AppProvider';
import { request } from '../../core/api';
import { endpoints } from '../../constants';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import EmptyStateShopify from '../EmptyStateShopify';
import { MenuHorizontalIcon } from '@shopify/polaris-icons';
import ZoneCard from '../ZoneCard';
import { numbers } from '../../utilis';
import CardSkeleton from '../skeletons/CardSkeleton';

const ZonesList = props => {
    const shopify = useAppBridge();
    const { zones, setZones } = useZoneContext()
    const navigate = useNavigate();
    const { store } = useApp()
    const [delZone, setDelZone] = useState(null)
    const [loading, setLoading] = useState({})

    const deleteZone = async id => {
        try {
            const options = {
                "method": "DELETE",
                "data": { id }
            }
            setLoading(prev => ({ ...prev, id: true }))
            const response = await request(endpoints.zone, options, store.storeId)
            if (response.delete) {
                let filtered = zones.filter(z => z.id !== id)
                setZones([...filtered])
                shopify.toast.show("Deleted successfully", { isError: false })
                shopify.modal.hide("delete-zone")
            }
        } catch (e) {
            shopify.toast.show(e.message, { isError: true })
        } finally {
            setLoading(prev => ({ ...prev, id: false }))
        }
    }
    console.log((zones.length || loading) ? 3 : 1);

    return (
        <>
            <InlineGrid columns={(zones.length || loading) ? 3 : 1} gap={300}>
                {props.loading ? numbers(5).map(num => <CardSkeleton />) : (
                    zones.length ? zones?.map((zone, i) => {
                        const { id, name, price, status } = zone;
                        const chars = name.split(" ")
                        let initials = ''
                        for (const char of chars) {
                            initials += char[0].toUpperCase()
                        }
                        return <ZoneCard zone={zone} initials={initials} loading={loading} setDelZone={setDelZone} />
                    }) : <Card><EmptyStateShopify
                        fullWidth={true}
                        heading={"Oops! No Shipping Zones Created Yet"}
                        message="Start by creating a shipping zone to set your rates and regions!"
                        image={"https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"}
                        primaryContent={"Create zone"}
                        primaryAction={() => navigate("new")}
                    /></Card>
                )}
            </InlineGrid>
            {/* <Box
                padding="400"
                background="bg-surface-active"
                borderWidth="025"
                borderRadius="200"
                borderColor="border"
                overflowX="scroll"
            >
                <pre>
                    <code>{JSON.stringify(zones[3] ?? {}, null, 2)}</code>
                </pre>
            </Box> */}

            {/* <Card padding={0} roundedAbove="sm">
                {zones.length ? <>
                    <Box padding={400}>
                        <Text as="h2" variant="headingSm">
                            Manage your shipping rates in zones
                        </Text>
                    </Box>
                    <Divider />
                </> : null}
                <ResourceList
                    items={zones}
                    resourceName={{
                        singular: 'Zone',
                        plural: 'Zones',
                    }}
                    emptyState={props.loading ? null : (zones.length < 1 ? <EmptyStateShopify
                        fullWidth={true}
                        heading={"Oops! No Shipping Zones Added Yet"}
                        message="It looks like you haven't added any shipping zones yet. Shipping zones define the regions where you offer shipping services. By adding shipping zones, you can set specific shipping rates and rules for different geographical areas."
                        image={"https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"}
                        primaryContent={"Add zone"}
                        primaryAction={() => navigate("new")}
                    /> : undefined)}
                    loading={props.loading}
                    renderItem={item => {
                        const { id, name, price, status } = item;
                        const chars = name.split(" ")
                        let initials = ''
                        for (const char of chars) {
                            initials += char[0].toUpperCase()
                        }
                        const media = <Avatar initials={initials} size="md" name={name} />;

                        return (
                            <ResourceItem
                                id={id}
                                onClick={() => navigate(`${id}`)}
                                media={media}
                                accessibilityLabel={`View details for ${name}`}
                                persistActions={true}
                                shortcutActions={[
                                    {
                                        content: 'Delete',
                                        accessibilityLabel: `Delete ${name}`,
                                        plain: true,
                                        destructive: true,
                                        loading: loading[id],
                                        disabled: loading[id],
                                        onAction: () => {
                                            setDelZone(item)
                                            shopify.modal.show("delete-zone")
                                        }
                                    },
                                ]}
                            >
                                <Text variant="bodyMd" fontWeight="bold" as="h3">
                                    {name} <Badge tone={status === "active" ? "success" : "info"}>{status}</Badge>
                                </Text>
                                <InlineStack gap={800}>
                                    <div>Price: <Text variant="bodySm" fontWeight="bold" as="span">
                                        {store?.moneyFormat.replace("{{amount}}", "") + price}
                                    </Text></div>
                                </InlineStack>
                            </ResourceItem>
                        );
                    }}
                />
            </Card> */}
            <Modal id="delete-zone">
                <Box padding={400}>
                    <p>If you delete this zone, it can't be undone.</p>
                    <p>All shipping rates will also be deleted.</p>
                </Box>
                <TitleBar title={`Delete the zone ${delZone?.name}`}>
                    <button variant="primary" tone="critical" onClick={() => deleteZone(delZone.id)}>
                        Delete
                    </button>
                    <button onClick={() => shopify.modal.hide("delete-zone")}>Cancel</button>
                </TitleBar>
            </Modal>
        </>
    );

}

export default ZonesList