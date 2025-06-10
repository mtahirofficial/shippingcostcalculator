import { Box, Divider, Text } from '@shopify/polaris'
import React from 'react'

const CardTitle = ({ title, divider, padding = 200 }) => {
    return (
        <React.Fragment>
            <Box padding={padding}>
                <Text as="h2" variant="headingSm">
                    {title}
                </Text>
            </Box>
            {divider && <Divider />}
        </React.Fragment>
    )
}

export default CardTitle