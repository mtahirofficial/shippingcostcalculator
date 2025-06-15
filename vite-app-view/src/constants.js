import { Icon } from '@shopify/polaris';
import { StatusActiveIcon, AlertCircleIcon, DisabledIcon } from '@shopify/polaris-icons';

export const endpoints = {
    auth: "/auth",
    user: "/user",
    zone: "/zone",
    rate: "/rate",
    default_rule: "/default-rule",
    free_rule: "/free-rule",
    store: "/store",
    app: "/app",
}

export const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' }
];

export const countries = [
    {
        value: "china",
        label: "China",
        aria: "🇨🇳"
    },
    {
        value: "usa",
        label: "USA",
        aria: "🇺🇸"
    },
    {
        value: "japan",
        label: "Japan",
        aria: "🇯🇵"
    },
    {
        value: "korea",
        label: "Korea",
        aria: "🇰🇷"
    },
]
export const statuses = [
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" }
]

// export const statusColors = {
//     "active": { "label": "Active", "color": "#46AB5E", "icon": <CheckOutlined /> },
//     "draft": { "label": "Draft", "color": "#667085", "icon": <ExclamationCircleOutlined /> },
//     "suspend": { "label": "Suspend", "color": "#F03938", "icon": <StopOutlined /> },
// }

// export const statusColors = {
//     "active": { "label": "Active", "color": "green", "icon": <Icon source={StatusActiveIcon} tone="base" /> },
//     "draft": { "label": "Draft", "color": "geekblue", "icon": <Icon source={AlertCircleIcon} tone="base" /> },
//     "suspend": { "label": "Suspend", "color": "volcano", "icon": <Icon source={DisabledIcon} tone="base" /> },
// }

export const headers = {
    "content-type": "application/json"
}

export const inputSize = "large"

export const currencies = [
    { label: "$", value: "$" },
    { label: "€", value: "€" },
    { label: "£", value: "£" },
    { label: "¥", value: "¥" },
]

export const chargeBy = {
    "none": "None",
    "price": "Cart Price",
    "weight": "Cart Weight",
    "c_qty": "Cart Quantity",
    "p_qty": "Product Quantity",
}

export const chargeByOptions = [
    { label: "None", value: "none" },
    { label: "Price", value: "price" },
    { label: "Weight", value: "weight" },
    { label: "Cart Quantity", value: "c_qty" },
    { label: "Product Quantity", value: "p_qty" },
]

export const shipTo = {
    "none": "Anywhere in the zone",
    "zip": "Zip/Postal codes",
    "city": "Cities",
    "state": "States",
    "country": "Countries"
}
export const shipToOptions = [
    // { label: "Anywhere in the zone", value: "none" },
    { label: "Zip/Postal codes", value: "zip" },
    { label: "Cities", value: "city" },
    { label: "States", value: "state" },
    { label: "Countries", value: "country" },
]

export const priceTypes = {
    "flat": "Flat",
    "percent": "%"
}

export const weightUnits = {
    "kg": "KG",
    "lb": "LB",
    "oz": "OZ",
    "g": "Grams",
}