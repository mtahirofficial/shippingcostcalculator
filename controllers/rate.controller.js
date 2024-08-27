const express = require("express");
require("dotenv").config();
const { ServerException, BadRequestException } = require("../exceptions");
const { AuthMiddleware, StoreMiddleware, CheckoutAuthMiddleware } = require("../middleware");
const { Controller } = require("../core");
const { StoreService, RateService, ZoneService, CheckoutService } = require("../services");
const { prepareRate } = require("../utils");
const { KG, LB, OZ, G } = require("../constants");

class UserController extends Controller {
  _path = "/rate";
  _router = express.Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  async getRates(req, res, next) {
    try {
      const user = req.user
      const store = await StoreService.getStore(user.id)
      const rates = await RateService.getRates(user.id, store.storeId)
      res.json({ rates })
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async getRate(req, res, next) {
    try {
      const id = req.params.id
      // const user = req.user
      // const store = req.store
      const rate = await RateService.getSingleRateAndRange(id)
      const zone = await ZoneService.getZoneById(rate.zoneId)
      rate.dataValues.zoneName = zone.name
      res.json({ rate })
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async addRate(req, res, next) {
    try {
      const store = req.store
      if (!Object.hasOwnProperty.call(req.body, "rate")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const rate = req.body.rate
      const ranges = rate.ranges?.length ? [...rate.ranges] : null
      delete rate.ranges
      const created = await RateService.createRate({ ...rate, storeId: store.storeId })
      if (ranges?.length && created) {
        const r = await RateService.createBulkRange(ranges.map(r => ({ ...r, "rateId": created.id })))
        created.dataValues.ranges = r
      } else {
        created.dataValues.ranges = []
      }
      res.status(201).json({ rate: created })
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }
  async updateRate(req, res, next) {
    try {
      const store = req.store
      if (!Object.hasOwnProperty.call(req.body, "rate")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const rate = req.body.rate
      // console.log(rate);
      const ranges = rate.ranges ? [...rate.ranges] : null
      delete rate.ranges
      delete rate.createdAt
      delete rate.updatedAt
      const updated = await RateService.updateRate(rate.id, { ...rate, storeId: store.storeId })
      // console.log(updated);

      if (ranges?.length && updated[0]) {
        const newRanges = ranges.filter(r => !r.id)
        const saved = ranges.filter(r => r.id)
        if (newRanges.length) {
          await RateService.createBulkRange(newRanges.map(r => ({ ...r, "rateId": rate.id })))
        }
        for (const r of saved) {
          delete r.createdAt
          delete r.updatedAt
          await RateService.updateRange(r.id, { ...r })
        }
      }
      const current = await RateService.getSingleRateAndRange(rate.id)
      // console.log(current);

      res.status(201).json({ rate: current })
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async deleteRate(req, res, next) {
    try {
      const store = req.store
      if (!Object.hasOwnProperty.call(req.body, "id")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const id = req.body.id
      const zoneId = req.body.zoneId
      await RateService.deleteRate(id)
      await RateService.deleteRanges(id)
      const zone = await ZoneService.getSingleZoneAndRate(zoneId)
      res.status(200).json({ zone })
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }

  async checkoutRates(req, res, next) {
    const rates = []
    const { origin, destination, items } = req.body.rate
    const store = req.store
    const zipCode = destination.postal_code
    const city = destination.city
    const state = destination.country + "." + destination.province
    const country = destination.country
    let grams = 0, price = 0, qty = 0
    for (const item of items) {
      qty += item.quantity
      grams += item.grams * item.quantity
      price += item.price * item.quantity
    }
    price = price / 100
    const weight = {
      "kg": Math.round((grams / KG) * 100) / 100,
      "lb": Math.round((grams / LB) * 100) / 100,
      "oz": Math.round((grams / OZ) * 100) / 100,
      "g": Math.round((grams / G) * 100) / 100,
    }

    const result = await CheckoutService.getRates({
      "storeId": store.storeId,
      "country": country,
      "state": state,
      "zipCode": zipCode,
      "city": city,
      "weight": weight,
      "price": price,
      "qty": qty
    })

    for (const z of result) {
      const zonePrice = z.price
      for (const r of z.rates) {
        if (r.ranges.length) {
          for (const range of r.ranges) {
            let cost = range.price;
            // if (r.chargeBy === "weight") {
            //   cost = cost * weight[r.unit]
            // } else if (r.chargeBy === "price") {
            //   if (r.priceBy === "percent") {
            //     cost = (price * cost) / 100
            //   }
            // } else if (r.chargeBy === "qty" && r.xQty) {
            //   cost = cost * qty
            // }
            cost += Number(zonePrice)
            rates.push(prepareRate({ name: r.title, price: cost, description: r.description, currency: store.currency, code: `${z.id}${r.id}${range.id}` }))
          }
        } else {
          let price = Number(r.price) + Number(zonePrice)
          rates.push(prepareRate({ name: r.title, price: price, description: r.description, currency: store.currency, code: `${z.id}${r.id}` }))
        }
      }
    }
    console.log({ rates });
    res.status(200).send({
      rates
    })
  }

  initializeRoutes() {
    this._router.get(`${this._path}`, StoreMiddleware, this.getRates);
    this._router.get(`${this._path}/:id`, this.getRate);

    this._router.post(`${this._path}`, StoreMiddleware, this.addRate);

    this._router.put(`${this._path}`, StoreMiddleware, this.updateRate);

    this._router.delete(`${this._path}`, StoreMiddleware, this.deleteRate);

    this._router.post(`${this._path}/checkout`, CheckoutAuthMiddleware, this.checkoutRates);

  }
}

module.exports = UserController;
