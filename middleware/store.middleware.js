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
    const storeId = req.headers["x-access-token"]

    const store = await findOne("storeId", storeId)

    if (!store) {
      return next(new UnauthorizedException());
    }

    if (!store.active) {
      return next(new ForbiddenException("App is not installed your store!"));
    }
    // console.log("store mdlwr",store);
    req.store = store
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
