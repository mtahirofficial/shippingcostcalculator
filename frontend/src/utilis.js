export function findIntersection(arrayFirst, arraySecond) {
    // Map the "value" properties of the first array
    const valuesFirst = arrayFirst.map(item => item.value);
    console.log("arraySecond", arraySecond);
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