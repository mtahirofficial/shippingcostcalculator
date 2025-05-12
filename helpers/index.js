const { RateService } = require("../services");

const duplicateModelWithAssociations = async (model, id, includeAssociations = []) => {
    const original = await model.findByPk(id, {
        include: includeAssociations
    });

    if (!original) throw new Error('Record not found.');


    // Prepare parent data
    const parentData = original.toJSON();
    delete parentData.id;
    // Handle virtual fields (e.g., getters/setters)
    for (const key of Object.keys(model.rawAttributes)) {
        const attr = model.rawAttributes[key];
        if (attr.get && typeof original[key] !== 'undefined') {
            parentData[key] = original[key];
        }
    }

    if (parentData.shipTo === "zip") {
        parentData.modifiedCodes = parentData.shipToValue
    }
    // Create duplicated parent
    const newParent = await model.create(parentData);

    const duplicatedChildren = {};

    // Process each association
    for (const assoc of includeAssociations) {
        const assocName = typeof assoc === 'string' ? assoc : assoc.as || assoc.model.name;
        const children = original[assocName];

        if (!children || !Array.isArray(children)) continue;

        const childModel = model.associations[assocName].target;
        const foreignKey = model.associations[assocName].foreignKey;

        const childData = children.map(c => {
            const cData = c.toJSON();
            delete cData.id;
            cData[foreignKey] = newParent.id;
            return cData;
        });

        const createdChildren = await childModel.bulkCreate(childData);
        duplicatedChildren[assocName] = createdChildren;
    }

    const created = await RateService.getSingleRateAndRange(newParent.id)
    created.dataValues.duplicated = true;
    return await created

}
module.exports = { duplicateModelWithAssociations }