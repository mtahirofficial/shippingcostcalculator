const { Service, ConsoleLogger } = require("../core");
const models = require("../models");
const { Op } = require("sequelize");

class CheckoutService extends Service {
    async getZones({ storeId, country, state, city, zipCode, weight, price, qty }) {
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
                "logging": false,
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

    async getRates({ storeId, country, state, city, zipCode, weight, price, c_qty, cart_items, price_ranges }) {
        const rangeConditions = [
            {
                [Op.and]: {
                    '$rate.chargeBy$': 'price',
                    [Op.or]: [
                        { 'from': { [Op.lte]: price }, "upto": { [Op.gte]: price } },
                        { 'from': { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, "upto": { [Op.gte]: price } },
                        { "upto": { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, 'from': { [Op.lte]: price } }
                    ]
                }
            },
            {
                [Op.and]: {
                    '$rate.chargeBy$': 'c_qty',
                    [Op.or]: [
                        { 'from': { [Op.lte]: c_qty }, "upto": { [Op.gte]: c_qty } },
                        { 'from': { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, "upto": { [Op.gte]: c_qty } },
                        { "upto": { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, 'from': { [Op.lte]: c_qty } }
                    ]
                }
            },
            {
                [Op.and]: {
                    '$rate.chargeBy$': 'cart_items',
                    [Op.or]: [
                        { 'from': { [Op.lte]: cart_items }, "upto": { [Op.gte]: cart_items } },
                        { 'from': { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, "upto": { [Op.gte]: cart_items } },
                        { "upto": { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, 'from': { [Op.lte]: cart_items } }
                    ]
                }
            },
            {
                [Op.and]: {
                    '$rate.chargeBy$': 'weight',
                    [Op.or]: [
                        {
                            [Op.and]: {
                                '$rate.unit$': 'kg',
                                [Op.or]: [
                                    { 'from': { [Op.lte]: weight['kg'] }, "upto": { [Op.gte]: weight['kg'] } },
                                    { 'from': { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, "upto": { [Op.gte]: weight['kg'] } },
                                    { "upto": { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, 'from': { [Op.lte]: weight['kg'] } }
                                ]
                            }
                        },
                        {
                            [Op.and]: {
                                '$rate.unit$': 'lb',
                                [Op.or]: [
                                    { 'from': { [Op.lte]: weight['lb'] }, "upto": { [Op.gte]: weight['lb'] } },
                                    { 'from': { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, "upto": { [Op.gte]: weight['lb'] } },
                                    { "upto": { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: 0 }] }, 'from': { [Op.lte]: weight['lb'] } }
                                ]
                            }
                        },
                        {
                            [Op.and]: {
                                '$rate.unit$': 'oz',
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
            const cleanCity = city?.replace(/\s+/g, "").replace(/-+/g, "");
            const cleanZip = zipCode?.replace(/\s+/g, "").replace(/-+/g, "");
            const cleanSpaceZip = zipCode?.replace(/\s+/g, "");
            const options = {
                logging: false,
                // logging: console.log,
                "where": {
                    "status": "active",
                    "storeId": storeId,
                    [Op.or]: [
                        { "shipTo": "none" },
                        { "shipTo": "zip", "shipToValue": { [Op.like]: `%${zipCode}%` } },
                        { "shipTo": "zip", "shipToValue": { [Op.like]: `%${cleanZip}%` } },
                        { "shipTo": "city", "shipToValue": { [Op.like]: `%${city}%` } },
                        { "shipTo": "city", "shipToValue": { [Op.like]: `%${cleanCity}%` } },
                        { "shipTo": "state", "shipToValue": { [Op.like]: `%${state}%` } },
                        { "shipTo": "country", "shipToValue": { [Op.like]: `%${country}%` } },
                    ]
                }
            }
            if (price_ranges) {
                options.include = [{
                    "model": models.range,
                    "required": false,
                    "where": { [Op.or]: rangeConditions }
                }]
            }
            return await models.rate.findAll(options)
        } catch (e) {
            ConsoleLogger.error(e.message)
        }
    }
}

module.exports = new CheckoutService();
