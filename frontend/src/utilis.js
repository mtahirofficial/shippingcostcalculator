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

export const validate = (obj, REQUIRED_FIELDS, validationErrors) => {
    let errors = { ...validationErrors }
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