import React, { useState, useEffect, act } from 'react';
import {
    Page,
    TextField,
    Select,
    Button,
    FormLayout,
    BlockStack,
    Layout,
    Card,
    Text,
    InlineStack
} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { validate } from '../../utilis';
import { useAppBridge } from '@shopify/app-bridge-react';
import { request } from '../../core/api';
import { endpoints, statusOptions } from '../../constants';
import { useApp } from '../../providers/AppProvider';

const FreeShipping = () => {
    const shopify = useAppBridge()
    const navigate = useNavigate();
    const { store, activeFeatures, setModalActive } = useApp()
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false)
    const [REQUIRED_FIELDS, setRequiredFields] = useState(["title", "minSpent"])
    const [validationErrors, setValidationErrors] = useState({})


    useEffect(() => {
        if (store) {
            fetchFreeRule();
        }
    }, [store]);

    const fetchFreeRule = async () => {
        try {
            setLoading(true);
            const response = await request(endpoints.free_rule, { method: "GET" }, store?.storeId);
            console.log("response", response);

            if (response && response.freeRule) {
                setForm({
                    ...response.freeRule
                });
            } else {
                setForm({
                    title: '',
                    description: '',
                    price: '',
                    status: 'active'
                });
            }
        } catch (error) {
            setForm({
                title: '',
                description: '',
                price: '',
                status: 'active'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = values => {
        let error = ""
        const [key, value] = Object.entries(values)[0];
        if (REQUIRED_FIELDS.indexOf(key) > -1) {
            if (value === "" || (value instanceof Array && value.length <= 0)) {
                error = "Required"
            }
        }
        setValidationErrors(prev => ({ ...prev, [key]: error }))
        setForm(prev => ({ ...prev, ...values }))
    };

    const handleSubmit = async () => {
        if (activeFeatures.free_shipping || form.id) {
            const errors = validate(form, REQUIRED_FIELDS)
            setValidationErrors({ ...errors })
            if (Object.values(errors).some(e => e !== "")) {
                shopify.toast.show("Required fields are missing", { isError: true })
            } else {
                try {
                    const options = {
                        "method": form.id ? "PUT" : "POST",
                        "data": { "freeRule": { ...form } }
                    }
                    setLoading(true)
                    const response = await request(endpoints.free_rule, options, store?.storeId)
                    console.log(response, "response");
                    if (response.freeRule && !form.id) {
                        setForm({ ...response.freeRule })
                    }
                    shopify.toast.show("Saved successfully!", { isError: false });
                } catch (error) {
                    console.error("Error during form submission:", error);
                    shopify.toast.show("An error occurred while saving the rule", { isError: true });
                } finally {
                    setLoading(false)
                }
            }
        } else {
            setModalActive(prev => ({ ...prev, "plans-modal": true }));
        }
    };

    return (
        <Page
            title="Free Shipping Rule"
            backAction={{
                content: 'Rules', onAction: () => {
                    // navigate(`/rules`)
                    window.history.back()
                }
            }}
            primaryAction={{
                content: form.id ? "Update" : "Save",
                loading: loading,
                disabled: loading,
                onAction: handleSubmit
            }}
        >
            <Layout>
                <Layout.Section variant='oneThird'>
                    <BlockStack gap={300}>
                        <Text id="storeDetails" variant="headingMd" as="h2">
                            Free Shipping Rule
                        </Text>
                        <Text tone="subdued" as="p">
                            Free shipping is automatically applied when the cart total exceeds a specified amount. This rule encourages larger orders by offering shipping at no cost once the minimum purchase threshold is met.
                        </Text>
                    </BlockStack>
                </Layout.Section>
                <Layout.Section>
                    <Card sectioned>
                        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                            <FormLayout>
                                <TextField
                                    label="Title"
                                    value={form.title}
                                    onChange={value => handleChange({ title: value })}
                                    autoComplete="off"
                                    error={validationErrors.title}
                                />
                                <TextField
                                    label="Description"
                                    value={form.description}
                                    onChange={value => handleChange({ description: value })}
                                    autoComplete="off"
                                />
                                <TextField
                                    label="Minimum Spent"
                                    type="number"
                                    value={form.minSpent}
                                    onChange={value => handleChange({ minSpent: value })}
                                    autoComplete="off"
                                    error={validationErrors.minSpent}
                                />
                                <Select
                                    label="Status"
                                    options={statusOptions}
                                    value={form.status}
                                    onChange={value => handleChange({ status: value })}
                                />
                                <InlineStack align='end' blockAlign='center'>
                                    <Button variant="primary" submit loading={loading} disabled={loading}>
                                        {form.id ? "Update" : "Save"}
                                    </Button>
                                </InlineStack>
                            </FormLayout>
                        </form>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page >
    )
}

export default FreeShipping