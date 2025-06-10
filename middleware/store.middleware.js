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
const { findOne } = require("../services/store.service");

async function StoreMiddleware(req, res, next) {
  try {
    const storeId = req.headers["x-access-token"];
    if (!storeId) {
      return next(new UnauthorizedException("Something went wrong. Please contact app support."));
    }
    // console.log("req.headers", req.headers);
    // const requestedStore = req.body.store;
    // console.log("requestedStore", requestedStore);
    const store = await findOne("storeId", storeId);

    if (!store) {
      return next(new UnauthorizedException());
    }

    if (!store.active) {
      return next(new ForbiddenException("App is not installed your store!"));
    }
    req.store = store;
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

module.exports = StoreMiddleware;
