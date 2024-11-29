import React, { useState } from 'react'
import { Badge, Card, Text, Avatar, InlineStack, InlineGrid, Popover, ActionList, Button, BlockStack, Thumbnail, Icon, Divider, Tooltip } from '@shopify/polaris';
import { MenuHorizontalIcon, ViewIcon, EditIcon, DeleteIcon, GlobeFilledIcon, CheckIcon, DisabledIcon } from '@shopify/polaris-icons';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Link, useNavigate } from "react-router-dom";
import { useApp } from '../../providers/AppProvider';
import { capitalize } from '../../utilis';

const ZoneCard = ({ zone, initials, loading, setDelZone }) => {
    const shopify = useAppBridge();
    const navigate = useNavigate()
    const { store } = useApp()
    const [actionActive, toggleAction] = useState(false);

    const handleToggleAction = () => {
        toggleAction(!actionActive);
    };


    return (
        <Card>
            <div className="zone-card">
                <div className='zone-card-header'>
                    <BlockStack gap={300} align='start'>
                        <InlineGrid columns={2} alignItems='center'>
                            <InlineStack gap={200} align='start' blockAlign='center'>
                                <Thumbnail source={GlobeFilledIcon} alt={zone.name} size='extrasmall' transparent />
                                <Link to={`${zone.id}`} className='zone-name'>
                                    <Text variant="headingSm" as="h4">
                                        {zone.name}
                                    </Text>
                                </Link>
                            </InlineStack>
                            <InlineStack gap={300} align='end' blockAlign='center'>
                                <span id='status-badge'>
                                    <Tooltip content={capitalize(zone.status)} dismissOnMouseOut>
                                        <Badge tone={zone.status === "active" ? "success" : "base"} ><Icon source={zone.status === "active" ? CheckIcon : DisabledIcon} color={zone.status === "active" ? "success" : "base"} /></Badge>
                                    </Tooltip>
                                </span>
                                {/* <Badge tone={zone.status === "active" ? "success" : "info"} progress="complete">{zone.status}</Badge> */}
                                <Popover
                                    active={actionActive}
                                    activator={<Button variant="plain" icon={MenuHorizontalIcon} onClick={handleToggleAction}></Button>}
                                    onClose={handleToggleAction}
                                >
                                    <ActionList items={[
                                        { content: "View", icon: ViewIcon, onAction: () => navigate(`${zone.id}`) },
                                        { content: "Edit", icon: EditIcon, onAction: () => navigate(`${zone.id}/edit`) },
                                        {
                                            content: 'Delete',
                                            icon: DeleteIcon,
                                            accessibilityLabel: `Delete ${zone.name}`,
                                            plain: true,
                                            destructive: true,
                                            loading: loading[zone.id],
                                            disabled: loading[zone.id],
                                            onAction: () => {
                                                setDelZone(zone)
                                                shopify.modal.show("delete-zone")
                                            }
                                        }
                                    ]} />
                                </Popover>
                            </InlineStack>
                        </InlineGrid>
                        <span className="country-list">
                            <InlineStack wrap={false} gap={200}>
                                <Text as="p" fontWeight="medium">
                                    Countries:
                                </Text>
                                <InlineStack gap={200}>
                                    {zone.countries.map(c => <Badge>{c.label}</Badge>)}
                                </InlineStack>
                            </InlineStack>
                        </span>
                    </BlockStack>
                </div>
                <Divider />
                <div className='zone-price'>
                    <InlineStack wrap={false} align='space-between' blockAlign='end' gap={200}>
                        <Text as="p" fontWeight="medium">
                            Price:
                        </Text>
                        <Text variant="headingMd" as="h6">
                            {store?.moneyFormat.replace("{{amount}}", "") + zone?.price}
                        </Text>
                    </InlineStack>
                </div>
            </div>
        </Card>
    )
}

export default ZoneCard