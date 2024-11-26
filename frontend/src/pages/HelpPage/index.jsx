import { BlockStack, Button, Card, InlineGrid, InlineStack, Page, Text, Thumbnail } from '@shopify/polaris'
import React from 'react'
import Accordion from '../../components/Accordion'
import facebook from "../../images/facebook.svg";
import whatsApp from "../../images/whatsapp.svg";
import youtube from "../../images/youtube.svg";
import chat from "../../images/chat.svg";

const HelpPage = () => {
    return (
        <Page>
            <BlockStack align='center' inlineAlign='center' gap={500}>
                <Text variant="heading2xl" as="h2">
                    How Can We Help You?
                </Text>
                <InlineGrid gap={300} columns={3}>
                    <Card>
                        <BlockStack gap={300} align='center' inlineAlign='center'>
                            <Text variant="headingMd" as="h6">
                                Live Support
                            </Text>
                            <Button variant='plain' url='https://wa.me/923457699395' target="_blank" rel="noreferrer">

                                <InlineStack gap={200} blockAlign='center' align='center'>
                                    <span className="social-icon">
                                        <Thumbnail transparent source={chat} size="extraSmall" alt="Chat" />
                                    </span>
                                    <Text variant="bodyLg" as="p">
                                        Write us here
                                    </Text>
                                </InlineStack>
                            </Button>
                        </BlockStack>
                    </Card>
                    <Card>
                        <BlockStack gap={300} align='center' inlineAlign='center'>
                            <Text variant="headingMd" as="h6">
                                Follow Us
                            </Text>
                            <InlineGrid columns={2} gap={200}>
                                <Button variant='plain' url='https://www.facebook.com/profile.php?id=61567071715420' target="_blank" rel="noreferrer">
                                    <InlineStack gap={200} blockAlign='center' align='center'>
                                        <span className="social-icon">
                                            <Thumbnail transparent source={facebook} size="extraSmall" alt="Facebook" />
                                        </span>
                                        <Text variant="bodyLg" as="p">Facebook</Text>
                                    </InlineStack>
                                </Button>
                                <Button variant='plain' url='https://whatsapp.com/channel/0029VawQIp02phHPRwl37x35' target="_blank" rel="noreferrer">
                                    <InlineStack gap={200} blockAlign='center' align='center'>
                                        <span className="social-icon">
                                            <Thumbnail transparent source={whatsApp} size="extraSmall" alt="Whatsapp" />
                                        </span>
                                        <Text variant="bodyLg" as="p">Whatsapp</Text>
                                    </InlineStack>
                                </Button>
                            </InlineGrid>
                        </BlockStack>
                    </Card>
                    <Card>
                        <BlockStack gap={300} align='center' inlineAlign='center'>
                            <Text variant="headingMd" as="h6">
                                Subscribe
                            </Text>
                            <Button variant='plain' url='https://www.youtube.com/@LogicsArcade' target="_blank" rel="noreferrer">
                                <InlineStack gap={200} blockAlign='center' align='center'>
                                    <span className="social-icon">
                                        <Thumbnail transparent source={youtube} size="extraSmall" alt="Youtube" />
                                    </span>
                                    <Text variant="bodyLg" as="p">Video Tutorials</Text>
                                </InlineStack>
                            </Button>
                        </BlockStack>
                    </Card>
                </InlineGrid>
                <Text variant="headingLg" as="h3">
                    Have Questions? We've Got Answers
                </Text>
                <Accordion />
            </BlockStack>
        </Page>
    )
}

export default HelpPage