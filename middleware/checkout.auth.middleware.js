require("dotenv").config();
// const { UserRepository } = require("../schema");
const models = require('../models')
const {
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ServerException,
} = require("../exceptions");
const { Op } = require("sequelize");
const { getShop } = require("../controllers/shopify.controller");

async function CheckoutAuthMiddleware(req, res, next) {
  try {
    const origin = req.get('origin')
    const domain = req.headers['x-shopify-shop-domain'];
    if (!domain) {
      return next(new UnauthorizedException());
    }
    const shopName = domain.replace(".myshopify.com", "");

    const shopData = await models.store.findOne({ where: { [Op.or]: { domain: domain, myshopifyDomain: domain, name: shopName } } })

    if (!shopData) {
      return next(new NotFoundException("Store not found!"));
    }

    const shopResponse = await getShop(shopData.myshopifyDomain, shopData.accessToken)
    if (!Object.hasOwnProperty.call(shopResponse, "shop")) {
      return next(new UnauthorizedException("App is not installed on your shop!"));
    }

    req.store = shopData;
    next();

  } catch (e) {
    return next(new ServerException(e.message))
  }
}

module.exports = CheckoutAuthMiddleware;
