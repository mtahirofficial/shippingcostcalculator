const express = require("express");
require("dotenv").config();
const { ServerException, BadRequestException, ForbiddenException } = require("../exceptions");
const { AuthMiddleware } = require("../middleware");
const { Controller } = require("../core");
const { StoreService, ZoneService, RateService } = require("../services");
const models = require("../models");
const { Op } = require("sequelize");
const countries_list = require("../data/countries_list.json");
const ShopifyController = require("./shopify.controller");
const { getStore } = require("../services/store.service");
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
      const stores = await StoreService.getAllStore(["accessToken"])
      for (const store of stores) {

        const zonesCounts = await ZoneService.countZones("storeId", store.storeId)
        store.dataValues.zones = zonesCounts
        const ratesCounts = await RateService.countRates("storeId", store.storeId)
        store.dataValues.rates = ratesCounts
      }
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
      let activePlan = null
      if (store.activePlan) {
        activePlan = await models.plans.findOne({
          logging: false,
          include: { model: models.features },
          where: { handle: store.activePlan }
        });
      }
      const features = await models.features.findAll();

      res.json({ activePlan, features, store, countries: [...countries], states: [...states] })
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
        // const shopData = await models.store.findOne({ where: { storeId: shop.storeId } })
        const shopData = await getStore(shop.domain)
        res.json({ store: shopData })
      } else {
        next(new ForbiddenException("Carrier Service not enabled on this store. Please contact Shopify support."))
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
