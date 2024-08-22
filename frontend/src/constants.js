import { Icon } from '@shopify/polaris';

import { StatusActiveIcon, AlertCircleIcon, DisabledIcon } from '@shopify/polaris-icons';

export const endpoints = {
    auth: "/auth",
    user: "/user",
    zone: "/zone",
    rate: "/rate",
    store: "/store",
    app: "/app",
}

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

export const statusColors = {
    "active": { "label": "Active", "color": "green", "icon": <Icon source={StatusActiveIcon} tone="base" /> },
    "draft": { "label": "Draft", "color": "geekblue", "icon": <Icon source={AlertCircleIcon} tone="base" /> },
    "suspend": { "label": "Suspend", "color": "volcano", "icon": <Icon source={DisabledIcon} tone="base" /> },
}

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
    "price": "Price",
    "weight": "Weight",
    "qty": "Quantity",
}

export const chargeByOptions = [
    { label: "None", value: "none" },
    { label: "Price", value: "price" },
    { label: "Weight", value: "weight" },
    { label: "Quantity", value: "qty" },
]

export const shipTo = {
    "none": "Anywhere in the zone",
    "zip": "Zip/Postal codes",
    "city": "Cities"
}
export const shipToOptions = [
    { label: "Anywhere in the zone", value: "none" },
    { label: "Zip/Postal codes", value: "zip" },
    { label: "Cities", value: "city" },
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