const express = require("express");
require("dotenv").config();
const { ServerException, BadRequestException } = require("../exceptions");
const { AuthMiddleware } = require("../middleware");
const { Controller } = require("../core");
const { StoreService } = require("../services");
const models = require("../models");
const { Op } = require("sequelize");
const countries_list = require("../data/countries_list.json")
// const countries = require("../data/countries.json")
// const states = require("../data/states.json")
class StoreController extends Controller {
  _path = "/store";
  _router = express.Router();
  constructor() {
    super();
    this.initializeRoutes();
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


  initializeRoutes() {
    this._router.get(`${this._path}`, this.getStore);
    this._router.post(`${this._path}`, this.addStore);
  }
}

module.exports = StoreController;
