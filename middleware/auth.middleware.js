const jwt = require("jsonwebtoken");
require("dotenv").config();
// const { UserRepository } = require("../schema");
const models = require("../models")
const {
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ServerException,
} = require("../exceptions");
const ShopifyController = require("../controllers/shopify.controller");

async function AuthMiddleware(req, res, next) {
  try {
    const tokenClient = req.headers["x-access-token"];
    if (!tokenClient) {
      return next(new UnauthorizedException());
    }

    const shopData = await models.store.findOne({ where: { storeId: tokenClient } })

    if (!shopData) {
      return next(new NotFoundException("Shop not found!"));
    }

    const shopResponse = await ShopifyController.getShop(shopData?.myshopifyDomain, shopData?.accessToken);

    if (!Object.hasOwnProperty.call(shopResponse, "shop")) {
      return next(new UnauthorizedException("App is not installed on your shop!"));
    }

    req.shop = shopData;
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return next(new UnauthorizedException(e.message));
    } else {
      console.log("auth catch", e);
      return next(new ServerException(e.message));
    }
  }
}

module.exports = AuthMiddleware;
