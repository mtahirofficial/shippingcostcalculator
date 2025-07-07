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

const DefaultRule = () => {
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
    const [REQUIRED_FIELDS, setRequiredFields] = useState(["title", "price"])
    const [validationErrors, setValidationErrors] = useState({})

    useEffect(() => {
        if (store) {
            fetchDefaultRule();
        }
    }, [store]);

    const fetchDefaultRule = async () => {
        try {
            setLoading(true);
            const response = await request(endpoints.default_rule, { method: "GET" }, store?.storeId);
            if (response && response.defaultRule) {
                setForm({
                    title: response.defaultRule.title || '',
                    description: response.defaultRule.description || '',
                    price: response.defaultRule.price || '',
                    status: response.defaultRule.status || 'active',
                    id: response.defaultRule.id // if you use id for updates
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
        if (activeFeatures.default_rule || form.id) {
            const errors = validate(form, REQUIRED_FIELDS)
            setValidationErrors({ ...errors })
            if (Object.values(errors).some(e => e !== "")) {
                shopify.toast.show("Required fields are missing", { isError: true })
            } else {
                try {
                    const options = {
                        "method": form.id ? "PUT" : "POST",
                        "data": { "defaultRule": { ...form } }
                    }
                    setLoading(true)
                    const response = await request(endpoints.default_rule, options, store?.storeId)
                    console.log(response, "response");
                    if (response.defaultRule && !form.id) {
                        setForm({ ...response.defaultRule })
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
            title="Default Rule"
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
                            Default Shipping Rule
                        </Text>
                        <Text tone="subdued" as="p">
                            The default shipping rule applies when no other specific rule matches the customer's location or order criteria. It doesn't rely on any conditions and ensures a fallback shipping price is always shown at checkout.
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
                                    label="Price"
                                    type="number"
                                    value={form.price}
                                    onChange={value => handleChange({ price: value })}
                                    autoComplete="off"
                                    error={validationErrors.price}
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
    );
};

export default DefaultRule;