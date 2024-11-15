import React, { useEffect, useState } from 'react'
import ShopifyModal from '../ShopifyModal'
import { useAppBridge } from '@shopify/app-bridge-react'
import { randomStr } from '../../utilis'
import { Banner, BlockStack, Card, Form, FormLayout, Text, TextField } from '@shopify/polaris'
import { chargeBy } from '../../constants'
import { useApp } from '../../providers/AppProvider'

const AddRangeForm = ({ rate, range, empty_range, rangeError, rangePrefix, handleChange, handleChangeRange, setRangeError }) => {
    const shopify = useAppBridge()
    const { store } = useApp()
    const [_range, setRange] = useState(range)

    useEffect(() => {
        setRange(range)
        return () => {
            setRange(empty_range)
        }
    }, [range])

    return (
        <ShopifyModal
            id="add-range"
            title={`${_range._id ? "Update" : "Add"} range`}
            primaryBtnTxt={_range._id ? "Update" : "Add"}
            primaryAction={() => {
                if (!_range.from && !_range.upto && !_range.price) {
                    shopify.toast.show("At least one of 'Min' or 'Max', and the Price must be set.", { isError: true });
                } else if (!_range.from && !_range.upto) {
                    shopify.toast.show("At least one of 'Min' or 'Max' must be set.", { isError: true });
                } else if (!_range.price) {
                    shopify.toast.show("The 'price' field must be set.", { isError: true });
                } else if (_range.from < 1 && _range.upto < 1 && _range.price < 1) {
                    setRangeError(true)
                } else {
                    let ranges = [...rate.ranges]
                    if (_range._id) {
                        ranges = ranges.map(r => {
                            return _range._id === r._id ? range : r
                        })
                    } else {
                        ranges.unshift({ ...range, _id: randomStr(7) })
                    }
                    handleChange({ "ranges": ranges })
                    handleChangeRange(empty_range)
                    shopify.modal.hide("add-range")
                }
            }}
        >
            <BlockStack gap={400}>
                <Text variant='headingSm' as='h5'>
                    {chargeBy[rate.chargeBy]} ranges
                </Text>
                {rangeError ? <div className="no-shadow-card"><Card padding={0}>
                    <Banner tone="critical">
                        <p>'Min', 'Max', and 'Price' are all set to 0, creating an additional _range. Set values that are greater than 0, please.</p>
                    </Banner>
                </Card></div> : null}
                <Form>
                    <FormLayout>
                        <TextField type='text' label="Min" placeholder='0' prefix={rangePrefix} value={_range.from} onChange={value => handleChangeRange({ "from": value })} onBlur={e => {
                            if (isNaN(e.target.value)) {
                                handleChangeRange({ "from": "0" })
                            }
                        }} />
                        <TextField type='text' label="Max" placeholder='0' prefix={rangePrefix} value={_range.upto} onChange={value => handleChangeRange({ "upto": value })} onBlur={e => {
                            if (isNaN(e.target.value)) {
                                handleChangeRange({ "upto": "0" })
                            }
                        }} />
                        <TextField type='text' label="Price" placeholder='0' prefix={store?.moneyFormat.replace("{{amount}}", "")} value={_range.price} onChange={value => handleChangeRange({ "price": value })} onBlur={e => {
                            if (isNaN(e.target.value)) {
                                handleChangeRange({ "price": "0" })
                            }
                        }} />
                    </FormLayout>
                </Form>
            </BlockStack>
        </ShopifyModal>
    )
}

export default AddRangeForm