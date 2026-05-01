const express = require("express");
require("dotenv").config();
const { ServerException, BadRequestException } = require("../exceptions");
const {
  StoreMiddleware,
  CheckoutAuthMiddleware,
  PlanMiddleware,
} = require("../middleware");
const { Controller } = require("../core");
const {
  StoreService,
  RateService,
  ZoneService,
  CheckoutService,
} = require("../services");
const { prepareRate, isValidState } = require("../utils");
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
      const store = req.store;
      const rates = await RateService.getRates(store.storeId);
      res.json({ rates });
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async getRate(req, res, next) {
    try {
      const id = req.params.id;
      const rate = await RateService.getSingleRateAndRange(id);
      // if (rate.zoneId) {
      //   const zone = await ZoneService.getZoneById(rate.zoneId)
      //   rate.dataValues.zoneName = zone?.name
      // }
      res.json({ rate });
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async duplicate(req, res, next) {
    try {
      const id = req.params.id;
      const created = await duplicateModelWithAssociations(models.rate, id, [
        "ranges",
      ]);

      res.status(201).json({ rate: created });
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async addRate(req, res, next) {
    try {
      const store = req.store;
      if (!Object.hasOwnProperty.call(req.body, "rate")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const rate = req.body.rate;
      if (rate.shipTo === "zip") {
        rate.modifiedCodes = rate.shipToValue;
      }
      const ranges = rate.ranges?.length ? [...rate.ranges] : null;
      delete rate.ranges;
      const created = await RateService.createRate({
        ...rate,
        storeId: store.storeId,
      });
      if (ranges?.length && created) {
        const r = await RateService.createBulkRange(
          ranges.map((r) => ({ ...r, rateId: created.id })),
        );
        created.dataValues.ranges = r;
      } else {
        created.dataValues.ranges = [];
      }
      res.status(201).json({ rate: created });
    } catch (e) {
      // console.log(e);
      next(new ServerException(e.message));
    }
  }

  async updateRate(req, res, next) {
    try {
      const store = req.store;
      if (!Object.hasOwnProperty.call(req.body, "rate")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const rate = req.body.rate;
      const deleted = req.body.deleted;
      const ranges = rate.ranges ? [...rate.ranges] : null;
      delete rate.ranges;
      delete rate.createdAt;
      delete rate.updatedAt;
      if (rate.shipTo === "zip") {
        rate.modifiedCodes = rate.shipToValue;
      }

      const updated = await RateService.updateRate(rate.id, {
        ...rate,
        storeId: store.storeId,
      });

      if (ranges?.length && updated[0]) {
        const newRanges = ranges.filter((r) => !r.id);
        const saved = ranges.filter((r) => r.id);
        if (newRanges?.length) {
          await RateService.createBulkRange(
            newRanges.map((r) => ({ ...r, rateId: rate.id })),
          );
        }
        for (const r of saved) {
          delete r.createdAt;
          delete r.updatedAt;
          await RateService.updateRange(r.id, { ...r });
        }
      }
      if (deleted?.length) {
        RateService.deleteRanges(deleted);
      }
      const current = await RateService.getSingleRateAndRange(rate.id);
      // console.log(current);

      res.status(200).json({ rate: current });
    } catch (e) {
      next(new ServerException(e.message));
    }
  }
  async deleteRate(req, res, next) {
    try {
      const store = req.store;
      if (!Object.hasOwnProperty.call(req.body, "id")) {
        return next(new BadRequestException("Unprocessable entity"));
      }
      const id = req.body.id;
      await RateService.deleteRate(id);
      await RateService.deleteRange(id);
      res.status(200).json({ deleted: id });
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
    console.log(req?.store?.myshopifyDomain);
    const isLogged = req?.store?.myshopifyDomain === "nx2ixm-di.myshopify.com";

    const rates = [];
    try {
      const activeFeatures = req.activeFeatures;
      const { origin, destination, items } = req.body.rate;
      if (isLogged) {
        console.log("destination", destination);
      }
      const store = req.store;
      const zipCode = destination.postal_code;
      const city = destination.city;
      let state = destination.province;
      if (!isValidState(destination.province)) {
        state = destination.country + "." + destination.province;
      }
      const country = destination.country;
      let grams = 0,
        price = 0,
        qty = 0;
      for (const item of items) {
        qty += item.quantity;
        grams += item.grams * item.quantity;
        price += item.price * item.quantity;
      }
      price = price / 100;
      const weight = {
        kg: Math.round((grams / KG) * 100) / 100,
        lb: Math.round((grams / LB) * 100) / 100,
        oz: Math.round((grams / OZ) * 100) / 100,
        g: Math.round((grams / G) * 100) / 100,
      };
      let result = [];
      let freeRule = null;
      if (activeFeatures.free_shipping) {
        freeRule = await models.free_rule.findOne({
          where: {
            storeId: store.storeId,
            status: "active",
            minSpent: { [models.Sequelize.Op.lte]: price }, // Only get rules where minSpent <= price
          },
          order: [["createdAt", "DESC"]],
        });
        if (freeRule) {
          rates.push(
            prepareRate({
              name: freeRule.title,
              price: 0,
              description: freeRule.description,
              currency: store.currency,
              code: "free-shipping",
            }),
          );
        }
      }
      if (activeFeatures.rules && !freeRule) {
        result = await CheckoutService.getRates({
          storeId: store.storeId,
          country: country,
          state: state,
          zipCode: zipCode,
          city: city,
          weight: weight,
          price: price,
          c_qty: qty,
          cart_items: items.length,
          price_ranges: activeFeatures.price_ranges,
        });

        if (result?.length === 0 && activeFeatures.default_rule) {
          const defaultRule = await models.default_rule.findOne({
            where: { storeId: store.storeId, status: "active" },
            order: [["createdAt", "DESC"]],
          });
          if (defaultRule) {
            result = [defaultRule];
          }
        }
        if (isLogged) {
          console.log("result getRates", result);
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
              rates.push(
                prepareRate({
                  name: r.title,
                  price: cost,
                  description: r.description,
                  currency: store.currency,
                  code: `${r.id}${range.id}`,
                }),
              );
            }
          } else {
            let price = Number(r.price);
            rates.push(
              prepareRate({
                name: r.title,
                price: price,
                description: r.description,
                currency: store.currency,
                code: `${r.id}`,
              }),
            );
          }
        }
      }
      if (isLogged) {
        console.log("rates", rates);
      }
      res.status(200).send({
        rates,
      });
    } catch (error) {
      console.error("Error in shippingMethods:", error);
      return { rates: [] };

      // } finally {
      //   res.status(200).send({
      //     rates
      //   })
    }
  }

  prepareRequestBody(req, res, next) {
    try {
      const { country, zip, state, city, currency, products = [] } = req.body;

      const hasDestination =
        (country !== undefined && country !== null && country !== "") ||
        (zip !== undefined && zip !== null && zip !== "") ||
        (state !== undefined && state !== null && state !== "") ||
        (city !== undefined && city !== null && city !== "");
      const hasProducts = Array.isArray(products) && products.length > 0;
      console.log("hasProducts", hasProducts);
      if (!hasDestination) {
        return next(
          new BadRequestException(
            "Enter Value to get estimated shipping rates",
          ),
        );
      }
      if (!hasProducts) {
        return next(
          new BadRequestException(
            "There are no products in the cart. Please add products to get estimated shipping rates",
          ),
        );
      }

      req.body = {
        rate: {
          origin: {},
          destination: {
            country,
            postal_code: zip?.toString(),
            province: state,
            city,
            name: "",
            address1: "",
            address2: "",
            address3: "",
            phone: "",
            fax: "",
            email: "",
            address_type: "",
            company_name: "",
          },
          items: products.map((product) => ({
            grams: product.grams ?? 0,
            price: product.price ?? 0,
            quantity: product.quantity ?? 1,
            name: product.name ?? "",
            sku: product.sku ?? "",
            vendor: product.vendor ?? "",
            requires_shipping: product.requires_shipping ?? "",
            taxable: product.taxable ?? "",
            fulfillment_service: product.fulfillment_service ?? "",
            properties: product.properties ?? null,
            product_id: product.product_id ?? 0,
            variant_id: product.variant_id ?? 0,
          })),
          currency,
          locale: "en",
        },
      };
      console.log(req.body.rate.items, "prepared body");

      res.setHeader("Access-Control-Allow-Origin", "*");
      return next();
    } catch (e) {
      return next(new ServerException(e.message));
    }
  }

  initializeRoutes() {
    this._router.get(`${this._path}`, StoreMiddleware, this.getRates);
    this._router.get(`${this._path}/:id`, this.getRate);
    this._router.post(`${this._path}/duplicate/:id`, this.duplicate);
    this._router.post(`${this._path}`, StoreMiddleware, this.addRate);
    this._router.put(`${this._path}`, StoreMiddleware, this.updateRate);
    this._router.delete(`${this._path}`, StoreMiddleware, this.deleteRate);
    this._router.post(
      `${this._path}/checkout`,
      CheckoutAuthMiddleware,
      PlanMiddleware,
      this.shippingMethods,
    );
    this._router.post(
      `${this._path}/product`,
      EstimatedAuthMiddleware,
      PlanMiddleware,
      this.prepareRequestBody,
      this.shippingMethods,
    );
  }
}

module.exports = RateController;
