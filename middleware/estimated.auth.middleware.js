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

async function EstimatedAuthMiddleware(req, res, next) {

  try {
    const origin = req.get('origin')
    // console.log("origin", origin);
    // console.log("req.body.zip", req.body.zip);
    if (!origin) {
      return next(new UnauthorizedException("Authentication failed."));
    }
    const domain = origin.replace("https://", "").replace("www.", "");
    const shopData = await models.store.findOne({ "attributes": { "exclude": ['accessToken'] }, where: { [Op.or]: { domain: domain, myshopifyDomain: domain } } })
    if (!shopData) {
      return next(new NotFoundException("Store not found!"));
    }
    if (!shopData.active) {
      return next(new UnauthorizedException("App is not installed on your shop!"));
    }
    req.headers['x-shopify-shop-domain'] = shopData.domain
    req.store = shopData;
    next();

  } catch (e) {
    return next(new ServerException(e.message))
  }
}

module.exports = EstimatedAuthMiddleware;
