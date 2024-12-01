export function findIntersection(arrayFirst, arraySecond) {
    // Map the "value" properties of the first array
    const valuesFirst = arrayFirst.map(item => item.value);
    // Filter the objects from the second array whose "value" property exists in the mapped valuesFirst array
    const intersection = arraySecond.filter((item, i) => {
        let matched = valuesFirst.includes(item.value)
        if (matched) {
            // console.log("item", i, item);
        }
        return matched
    });
    // console.log("intersection", intersection);

    // Return the intersection
    return intersection;
}

export const validate = (obj, REQUIRED_FIELDS) => {
    let errors = {}
    for (const key in obj) {
        let val = obj[key]
        if (REQUIRED_FIELDS.indexOf(key) > -1) {
            if (val === "" || (val instanceof Array && val.length <= 0)) {
                errors[key] = "Required"
            } else {
                delete errors[key]
            }
        }
    }
    return errors
}

export function randomStr(_length = 8) {
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let pw = "";

    for (let i = 0; i <= _length; i++) {
        let randomNumber = Math.floor(Math.random() * chars.length);
        pw += chars.substring(randomNumber, randomNumber + 1);
    }

    return pw;
}

export const capitalize = text => text?.toLowerCase()?.replace(/^./, str => str?.toUpperCase())
export const numbers = length => Array.from({ length: length }, (_, i) => i + 1);
export const jsonToQueryString = (params) => {
    const query = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    return query ? `?${query}` : '';
}