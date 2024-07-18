import { Page } from '@shopify/polaris'
import React from 'react'
import Accordion from '../../components/Accordion'

const HelpPage = () => {
    return (
        <Page
            narrowWidth
            title='Help Center'
            primaryAction={{
                content: "Contact Support",
                url: "https://wa.me/923078185388",
                target: "_blank"
            }}
        >
            <Accordion />
        </Page>
    )
}

export default HelpPage