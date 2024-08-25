const express = require("express");
require("dotenv").config();
const { ServerException, BadRequestException } = require("../exceptions");
const { AuthMiddleware, StoreMiddleware } = require("../middleware");
const { Controller } = require("../core");
const { StoreService, ZoneService, RateService } = require("../services");

class UserController extends Controller {
  _path = "/zone";
  _router = express.Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  async getZones(req, res, next) {
    try {
      const storeId = req.query.storeId
      const zones = await ZoneService.getZonesAndRates(storeId)
      // console.log(zones);
      res.json({ zones })
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async getZone(req, res, next) {
    try {
      const id = req.params.id
      const zone = await ZoneService.getSingleZoneAndRate(id)
      res.json({ zone })
    } catch (e) {
      next(new ServerException(e.message));
    }
  }

  async addZone(req, res, next) {
    try {
      const store = req.store
      if (!Object.hasOwnProperty.call(req.body, "zone")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const zone = req.body.zone
      const created = await ZoneService.createZone({ ...zone, storeId: store.storeId })
      created.dataValues.rates = []
      res.json({ zone: created })
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }

  async updateZone(req, res, next) {
    try {
      const store = req.store
      if (!Object.hasOwnProperty.call(req.body, "zone")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const zone = req.body.zone
      delete zone.createdAt
      delete zone.updatedAt
      delete zone.rates
      const updated = await ZoneService.updateZone({ ...zone, storeId: store.storeId }, "id", zone.id)
      const updatedZone = await ZoneService.getSingleZoneAndRate(zone.id)
      res.json({ zone: updatedZone })
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }
  async deleteZone(req, res, next) {
    try {
      const store = req.store
      if (!Object.hasOwnProperty.call(req.body, "id")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const id = req.body.id
      await ZoneService.deleteZone(id)
      await RateService.deleteRate(id)
      // const zones = await ZoneService.getZonesAndRates(store.storeId)
      res.status(200).json({ delete: true })
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }



  initializeRoutes() {
    this._router.get(`${this._path}`, this.getZones);
    this._router.get(`${this._path}/:id`, this.getZone);
    this._router.post(`${this._path}`, StoreMiddleware, this.addZone);
    this._router.put(`${this._path}`, StoreMiddleware, this.updateZone);
    this._router.delete(`${this._path}`, StoreMiddleware, this.deleteZone);

  }
}

module.exports = UserController;
