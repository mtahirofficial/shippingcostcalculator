const express = require("express");
require("dotenv").config();
const { ServerException, BadRequestException } = require("../exceptions");
const { AuthMiddleware } = require("../middleware");
const { Controller } = require("../core");
const { StoreService, ZoneService, RateService } = require("../services");
const models = require("../models");
const { Op } = require("sequelize");
const countries_list = require("../data/countries_list.json");
const ShopifyController = require("./shopify.controller");
// const countries = require("../data/countries.json")
// const states = require("../data/states.json")
class StoreController extends Controller {
  _path = "/store";
  _router = express.Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  async getStores(req, res, next) {
    try {
      const query = req.query
      console.log("query", query);
      const stores = await StoreService.getAllStore(["accessToken"])
      for (const store of stores) {
        console.log("store.id", store.id);

        const zonesCounts = await ZoneService.countZones("storeId", store.storeId)
        store.dataValues.zones = zonesCounts
        const ratesCounts = await RateService.countRates("storeId", store.storeId)
        store.dataValues.rates = ratesCounts
      }
      console.log("stores.length", stores.length);
      res.json({ stores })
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async getStore(req, res, next) {
    try {
      const domain = req.query.domain
      const store = await StoreService.getStore(domain)
      let countries = countries_list.map(c => ({
        value: c.code,
        label: c.name,
      }))
      let states = countries_list.map(c => ({
        value: c.code,
        label: c.name,
        options: c.provinces.map(p => ({ value: c.code + "." + p.code, label: p.name }))
      }))
      res.json({ store, countries: [...countries], states: [...states] })
    } catch (e) {
      next(new ServerException(e.message));
    }
  }

  async addStore(req, res, next) {
    try {
      const storeUrl = req.body.storeUrl
      const store = await models.store.findOne({ "where": { [Op.or]: { "domain": storeUrl, "myshopifyDomain": storeUrl } } })
      res.json({ store })
    } catch (e) {
      next(new ServerException(e.message));
    }
  }

  async enableService(req, res, next) {
    try {
      const shop = req.shop
      const isEnabled = await ShopifyController.createCarrierService(shop.accessToken, shop.myshopifyDomain, shop.storeId)
      if (isEnabled) {
        const shopData = await models.store.findOne({ where: { storeId: shop.storeId } })
        res.json({ store: shopData })
      }
    } catch (error) {
      next(new ServerException("Internal Server Error"))
    }
  }


  initializeRoutes() {
    this._router.get(`${this._path}`, this.getStore);
    this._router.get(`${this._path}/list`, this.getStores);
    this._router.post(`${this._path}`, this.addStore);
    this._router.get(`${this._path}/carrier_services`, AuthMiddleware, this.enableService);
  }
}

module.exports = StoreController;
