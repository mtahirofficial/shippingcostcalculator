const express = require("express");
require("dotenv").config();
const { ServerException, BadRequestException } = require("../exceptions");
const { StoreMiddleware, CheckoutAuthMiddleware, PlanMiddleware } = require("../middleware");
const { Controller } = require("../core");
const { StoreService, RateService, ZoneService, CheckoutService } = require("../services");
const { prepareRate, checkParamIsPresent, isValidState } = require("../utils");
const { KG, LB, OZ, G } = require("../constants");
const { duplicateModelWithAssociations } = require("../helpers");
const models = require("../models");
const EstimatedAuthMiddleware = require("../middleware/estimated.auth.middleware");


class RateController extends Controller {
  _path = "/rate";
  _router = express.Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  async getRates(req, res, next) {
    try {
      const store = req.store
      const rates = await RateService.getRates(store.storeId)
      res.json({ rates })
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async getRate(req, res, next) {
    try {
      const id = req.params.id
      const rate = await RateService.getSingleRateAndRange(id)
      // if (rate.zoneId) {
      //   const zone = await ZoneService.getZoneById(rate.zoneId)
      //   rate.dataValues.zoneName = zone?.name
      // }
      res.json({ rate })
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async duplicate(req, res, next) {
    try {
      const id = req.params.id
      const created = await duplicateModelWithAssociations(models.rate, id, ['ranges']);

      res.status(201).json({ rate: created })
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
      if (rate.shipTo === "zip") {
        rate.modifiedCodes = rate.shipToValue
      }
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
      const deleted = req.body.deleted
      const ranges = rate.ranges ? [...rate.ranges] : null
      delete rate.ranges
      delete rate.createdAt
      delete rate.updatedAt
      if (rate.shipTo === "zip") {
        rate.modifiedCodes = rate.shipToValue
      }

      const updated = await RateService.updateRate(rate.id, { ...rate, storeId: store.storeId })

      if (ranges?.length && updated[0]) {
        const newRanges = ranges.filter(r => !r.id)
        const saved = ranges.filter(r => r.id)
        if (newRanges?.length) {
          await RateService.createBulkRange(newRanges.map(r => ({ ...r, "rateId": rate.id })))
        }
        for (const r of saved) {
          delete r.createdAt
          delete r.updatedAt
          await RateService.updateRange(r.id, { ...r })
        }
      }
      if (deleted?.length) {
        RateService.deleteRanges(deleted)
      }
      const current = await RateService.getSingleRateAndRange(rate.id)
      // console.log(current);

      res.status(200).json({ rate: current })
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
      await RateService.deleteRate(id)
      await RateService.deleteRange(id)
      res.status(200).json({ "deleted": id })
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }

  // async checkoutRates(req, res, next) {
  //   const rates = []
  //   const { origin, destination, items } = req.body.rate
  //   const store = req.store
  //   const zipCode = destination.postal_code
  //   const city = destination.city
  //   let state = destination.province
  //   if (!isValidState(destination.province)) {
  //     state = destination.country + "." + destination.province
  //   }
  //   console.log("state", state);

  //   const country = destination.country
  //   let grams = 0, price = 0, qty = 0
  //   for (const item of items) {
  //     qty += item.quantity
  //     grams += item.grams * item.quantity
  //     price += item.price * item.quantity
  //   }
  //   price = price / 100
  //   const weight = {
  //     "kg": Math.round((grams / KG) * 100) / 100,
  //     "lb": Math.round((grams / LB) * 100) / 100,
  //     "oz": Math.round((grams / OZ) * 100) / 100,
  //     "g": Math.round((grams / G) * 100) / 100,
  //   }

  //   const result = await CheckoutService.getZones({
  //     "storeId": store.storeId,
  //     "country": country,
  //     "state": state,
  //     "zipCode": zipCode,
  //     "city": city,
  //     "weight": weight,
  //     "price": price,
  //     "qty": qty
  //   })

  //   for (const z of result) {
  //     const zonePrice = z.price
  //     for (const r of z.rates) {
  //       if (r.ranges.length) {
  //         for (const range of r.ranges) {
  //           let cost = range.price;
  //           // if (r.chargeBy === "weight") {
  //           //   cost = cost * weight[r.unit]
  //           // } else if (r.chargeBy === "price") {
  //           //   if (r.priceBy === "percent") {
  //           //     cost = (price * cost) / 100
  //           //   }
  //           // } else if (r.chargeBy === "qty" && r.xQty) {
  //           //   cost = cost * qty
  //           // }
  //           cost += Number(zonePrice)
  //           rates.push(prepareRate({ name: r.title, price: cost, description: r.description, currency: store.currency, code: `${z.id}${r.id}${range.id}` }))
  //         }
  //       } else {
  //         let price = Number(r.price) + Number(zonePrice)
  //         rates.push(prepareRate({ name: r.title, price: price, description: r.description, currency: store.currency, code: `${z.id}${r.id}` }))
  //       }
  //     }
  //   }
  //   console.log({ rates });
  //   res.status(200).send({
  //     rates
  //   })
  // }

  async shippingMethods(req, res, next) {

    const rates = []
    try {
      const activeFeatures = req.activeFeatures
      const { origin, destination, items } = req.body.rate

      const store = req.store
      const zipCode = destination.postal_code
      const city = destination.city
      let state = destination.province
      if (!isValidState(destination.province)) {
        state = destination.country + "." + destination.province
      }
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
      let result = []
      let freeRule = null
      if (activeFeatures.free_shipping) {
        freeRule = await models.free_rule.findOne({
          where: {
            storeId: store.storeId,
            status: "active",
            minSpent: { [models.Sequelize.Op.lte]: price } // Only get rules where minSpent <= price
          },
          order: [["createdAt", "DESC"]]
        });
        if (freeRule) {
          rates.push(prepareRate({
            name: freeRule.title,
            price: 0,
            description: freeRule.description,
            currency: store.currency,
            code: "free-shipping"
          }))
        }
      }
      if (activeFeatures.rules && !freeRule) {
        result = await CheckoutService.getRates({
          "storeId": store.storeId,
          "country": country,
          "state": state,
          "zipCode": zipCode,
          "city": city,
          "weight": weight,
          "price": price,
          "c_qty": qty,
          "cart_items": items.length,
          "price_ranges": activeFeatures.price_ranges
        })
        if (result?.length === 0 && activeFeatures.default_rule) {
          const defaultRule = await models.default_rule.findOne({
            where: { storeId: store.storeId, status: "active" },
            order: [["createdAt", "DESC"]]
          });
          if (defaultRule) {
            result = [defaultRule]
          }
        }
        for (const r of result) {
          if (r.ranges?.length) {
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
              rates.push(prepareRate({ name: r.title, price: cost, description: r.description, currency: store.currency, code: `${r.id}${range.id}` }))
            }
          } else {
            let price = Number(r.price)
            rates.push(prepareRate({ name: r.title, price: price, description: r.description, currency: store.currency, code: `${r.id}` }))
          }
        }
      }
      // res.status(200).send({
      //   rates
      // })
    } catch (error) {
      console.error("Error in shippingMethods:", error);
      return { rates: [] };

    } finally {
      console.log("rates", rates);
      res.status(200).send({
        rates
      })
    }
  }

  async prepareRequestBody(req, res, next) {

    // const request_options = {
    //     method: 'POST',
    //     url: "https://shipping.logiceverest.com/calculate-rates",
    //     data: { zip: 10001, city: "New York", state: "New York",country: "United States" grams: 3278, price: 3565, currency: "USD",product_id:1234567890 , variant_id: 123456789 }
    // }

    const params = {
      "country": req.body.country,
      "postal_code": req.body.zip,
      "province": req.body.state,
      "city": req.body.city,
    }

    try {
      // const store = req.store
      const isAnyPropertyPresent = checkParamIsPresent(params)
      if (isAnyPropertyPresent) {
        const body = {
          "rate": {
            "origin": {
            },
            "destination": {
              "country": params.country,
              "postal_code": params.postal_code?.toString(),
              "province": params.province, // '%US.AK%'
              "city": params.city,
              "name": "",
              "address1": "",
              "address2": "",
              "address3": "",
              "phone": "",
              "fax": "",
              "email": "",
              "address_type": "",
              "company_name": "",
            },
            "items": [
              {
                grams: req.body.grams ?? 0,
                price: req.body.price ?? 0,
                quantity: 1,
                "name": "",
                "sku": "",
                "vendor": "",
                "requires_shipping": "",
                "taxable": "",
                "fulfillment_service": "",
                "properties": null,
                "product_id": req.body.product_id ?? 0,
                "variant_id": req.body.variant_id ?? 0
              }
            ],
            currency: req.body.currency,
            "locale": "en"
          }
        }

        // if (params.province) {
        //   const [country_code, state_code] = params.province.split(".")
        //   body.rate.destination.province = state_code
        //   if (!params.country || params.country === "") {
        //     body.rate.destination.country = country_code
        //   }
        // }
        req.body = body
        res.setHeader('Access-Control-Allow-Origin', '*');
        next()
      } else {
        return next(new BadRequestException("Enter Value to get estimated shipping rates"))
      }
    } catch (e) {
      return next(new ServerException(e.message))
    }

  }

  initializeRoutes() {
    this._router.get(`${this._path}`, StoreMiddleware, this.getRates);
    this._router.get(`${this._path}/:id`, this.getRate);
    this._router.post(`${this._path}/duplicate/:id`, this.duplicate);
    this._router.post(`${this._path}`, StoreMiddleware, this.addRate);
    this._router.put(`${this._path}`, StoreMiddleware, this.updateRate);
    this._router.delete(`${this._path}`, StoreMiddleware, this.deleteRate);
    this._router.post(`${this._path}/checkout`, CheckoutAuthMiddleware, PlanMiddleware, this.shippingMethods);
    this._router.post(`${this._path}/product`, EstimatedAuthMiddleware, PlanMiddleware, this.prepareRequestBody, this.shippingMethods);

  }
}

module.exports = RateController;
