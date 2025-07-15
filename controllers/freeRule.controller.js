const express = require("express");
require("dotenv").config();
const { ServerException, BadRequestException, NotFoundException } = require("../exceptions");
const { StoreMiddleware } = require("../middleware");
const { Controller } = require("../core");
const models = require("../models");


class FreeRuleController extends Controller {
  _path = "/free-rule";
  _router = express.Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  async getFreeRule(req, res, next) {
    try {
      const store = req.store
      const freeRule = await models.free_rule.findOne({ where: { storeId: store.storeId } })
      if (!freeRule) {
        return next(new NotFoundException("Free rule not found"));
      }
      res.status(200).json({ freeRule });
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }
  async addFreeRule(req, res, next) {
    try {
      const store = req.store
      if (!Object.hasOwnProperty.call(req.body, "freeRule")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const freeRule = req.body.freeRule
      const created = await models.free_rule.create({ ...freeRule, storeId: store.storeId })
      res.status(201).json({ freeRule: created })
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }
  async updateFreeRule(req, res, next) {
    try {
      const store = req.store
      if (!Object.hasOwnProperty.call(req.body, "freeRule")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const freeRule = req.body.freeRule
      const updated = await models.free_rule.update({ ...freeRule, storeId: store.storeId }, {
        where: { id: freeRule.id },
        // returning: true
      })
      console.log("updated", updated);

      res.status(200).json({ freeRule: updated })
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }

  initializeRoutes() {
    this._router.get(this._path, StoreMiddleware, this.getFreeRule);
    this._router.post(this._path, StoreMiddleware, this.addFreeRule);
    this._router.put(this._path, StoreMiddleware, this.updateFreeRule);
  }
}
module.exports = FreeRuleController;
