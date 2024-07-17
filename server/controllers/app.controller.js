const express = require("express");
require("dotenv").config();
const models = require("../models");
const { Controller } = require("../core");
const countries_list = require("../data/countries_list.json")
const countries = require("../data/countries.json")
const states = require("../data/states.json")

class AppController extends Controller {
    _path = "/app";
    _router = express.Router();

    constructor() {
        super();
        this.initializeRoutes();
    }
    static async saveShop(name, shop, accessToken, shopifyHost, isInstalled, isActive) {
        const data = {
            "storeId": shop.id,
            "myshopifyDomain": shop.myshopify_domain,
            "domain": shop.domain,
            "name": name,
            "accessToken": accessToken,
            "owner": shop.shop_owner,
            "phone": shop.phone,
            "email": shop.email,
            "customerEmail": shop.customer_email,
            "address1": shop.address1,
            "address2": shop.address2,
            "zip": shop.zip,
            "city": shop.city,
            "province": shop.province,
            "provinceCode": shop.province_code,
            "country": shop.country_name,
            "countryCode": shop.country_code,
            "currency": shop.currency,
            "moneyFormat": shop.money_format,
            "planDisplayName": shop.plan_display_name,
            "planName": shop.plan_name,
            "locationId": shop.primary_location_id,
            "enabledCurrencies": shop.enabled_presentment_currencies.join(','),
            "timezone": shop.iana_timezone,
            "primaryLocale": shop.primary_locale,
            "store_createdAt": shop.created_at,
            "active": true,
            "updated": true,
            "shopifyHost": shopifyHost,
            "latitude": shop.latitude,
            "longitude": shop.longitude,
        }
        const where = { name }
        if (isInstalled && !isActive) {
            await models.store.update(data, { where });
            return await models.store.findOne({ where })
        } else if (!isInstalled) {
            return await models.store.create(data);
        } else {
            return await models.store.findOne({ where })
        }
    }
    async getCountries(req, res, next) {
        // const countries = countries_list.map(c => ({ value: c.code, label: c.name, options: c.provinces.map(p => ({ value: c.code + "." + p.code, label: p.name })) }))
        res.json({ countries, states })
    }

    initializeRoutes() {
        this._router.get(`${this._path}/countries`, this.getCountries);

    }
}

module.exports = AppController;