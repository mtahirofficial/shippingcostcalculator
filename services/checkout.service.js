const { Service } = require("../core");
const models = require("../models");
const { Op } = require("sequelize");

class CheckoutService extends Service {
    async getRates({ storeId, country, state, city, zipCode, weight, price, qty }) {
        const rangeConditions = [
            {
                [Op.and]: {
                    '$rates.chargeBy$': 'price',
                    [Op.or]: [
                        { 'from': { [Op.lte]: price }, "upto": { [Op.gte]: price } },
                        { 'from': { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, "upto": { [Op.gte]: price } },
                        { "upto": { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, 'from': { [Op.lte]: price } }
                    ]
                }
            },
            {
                [Op.and]: {
                    '$rates.chargeBy$': 'qty',
                    [Op.or]: [
                        { 'from': { [Op.lte]: qty }, "upto": { [Op.gte]: qty } },
                        { 'from': { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, "upto": { [Op.gte]: qty } },
                        { "upto": { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, 'from': { [Op.lte]: qty } }
                    ]
                }
            },
            {
                [Op.and]: {
                    '$rates.chargeBy$': 'weight',
                    [Op.or]: [
                        {
                            [Op.and]: {
                                '$rates.unit$': 'kg',
                                [Op.or]: [
                                    { 'from': { [Op.lte]: weight['kg'] }, "upto": { [Op.gte]: weight['kg'] } },
                                    { 'from': { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, "upto": { [Op.gte]: weight['kg'] } },
                                    { "upto": { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, 'from': { [Op.lte]: weight['kg'] } }
                                ]
                            }
                        },
                        {
                            [Op.and]: {
                                '$rates.unit$': 'lb',
                                [Op.or]: [
                                    { 'from': { [Op.lte]: weight['lb'] }, "upto": { [Op.gte]: weight['lb'] } },
                                    { 'from': { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, "upto": { [Op.gte]: weight['lb'] } },
                                    { "upto": { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, 'from': { [Op.lte]: weight['lb'] } }
                                ]
                            }
                        },
                        {
                            [Op.and]: {
                                '$rates.unit$': 'oz',
                                [Op.or]: [
                                    { 'from': { [Op.lte]: weight['oz'] }, "upto": { [Op.gte]: weight['oz'] } },
                                    { 'from': { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, "upto": { [Op.gte]: weight['oz'] } },
                                    { "upto": { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, 'from': { [Op.lte]: weight['oz'] } }
                                ]
                            }
                        }
                    ]
                }
            },
        ]
        try {
            return await models.zone.findAll({
                "logging": true,
                "include": [{
                    "model": models.rate,
                    "required": false,
                    "where": {
                        "status": "active",
                        "storeId": storeId,
                        [Op.or]: [
                            { "shipTo": "none" },
                            { "shipTo": "zip", "shipToValue": { [Op.like]: `%${zipCode}%` } },
                            { "shipTo": "city", "shipToValue": { [Op.like]: `%${city}%` } },
                        ]
                    },
                    "include": [{
                        "model": models.range,
                        "required": false,
                        "where": { [Op.or]: rangeConditions }
                    }]
                }],
                "where": {
                    "status": "active",
                    "storeId": storeId,
                    "countries": { [Op.like]: `%${country}%` },
                    [Op.or]: [
                        { "states": { [Op.like]: `%${state}%` } },
                        { "states": "" },
                    ]
                },
            });
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = new CheckoutService();
