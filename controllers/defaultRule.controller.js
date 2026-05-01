const express = require("express");
require("dotenv").config();
const { ServerException, BadRequestException, NotFoundException } = require("../exceptions");
const { StoreMiddleware } = require("../middleware");
const { Controller } = require("../core");
const models = require("../models");


class DefaultRuleController extends Controller {
  _path = "/default-rule";
  _router = express.Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  async getDefaultRule(req, res, next) {
    try {
      const store = req.store
      const defaultRule = await models.default_rule.findOne({ where: { storeId: store.storeId } })
      if (!defaultRule) {
        return next(new NotFoundException("Default rule not found"));
      }
      res.status(200).json({ defaultRule });
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }
  async addDefaultRule(req, res, next) {
    try {
      const store = req.store
      if (!Object.hasOwnProperty.call(req.body, "defaultRule")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const defaultRule = req.body.defaultRule
      const created = await models.default_rule.create({ ...defaultRule, storeId: store.storeId })
      res.status(201).json({ defaultRule: created })
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }
  async updateDefaultRule(req, res, next) {
    try {
      const store = req.store
      if (!Object.hasOwnProperty.call(req.body, "defaultRule")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const defaultRule = req.body.defaultRule
      const updated = await models.default_rule.update({ ...defaultRule, storeId: store.storeId }, {
        where: { id: defaultRule.id },
        // returning: true
      })
      console.log("updated", updated);

      res.status(200).json({ defaultRule: updated })
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }

  initializeRoutes() {
    this._router.get(this._path, StoreMiddleware, this.getDefaultRule);
    this._router.post(this._path, StoreMiddleware, this.addDefaultRule);
    this._router.put(this._path, StoreMiddleware, this.updateDefaultRule);
  }
}
module.exports = DefaultRuleController;
