import React from 'react'
import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { Box } from '@shopify/polaris';

const ShopifyModal = ({ children, id, title, primaryBtnTxt, disabled, primaryTone, primaryAction, secondaryBtnTxt, secondaryAction, handleHide = () => { } }) => {
    const shopify = useAppBridge()
    return (
        <Modal id={id} onHide={handleHide}>
            <Box padding={400}>
                {children}
            </Box>
            <TitleBar title={title}>
                {
                    primaryBtnTxt ? <button
                        variant="primary"
                        disabled={disabled}
                        tone={primaryTone}
                        onClick={primaryAction}
                    >
                        {primaryBtnTxt}
                    </button> : null
                }
                {
                    secondaryBtnTxt ? <button onClick={() => {
                        shopify.modal.hide(id)
                        if (secondaryAction) {
                            secondaryAction()
                        }
                    }}>{secondaryBtnTxt}</button> : null
                }
            </TitleBar>
        </Modal>
    )
}

export default ShopifyModal