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

async function AuthMiddleware(req, res, next) {
  try {
    const tokenClient = req.headers["x-access-token"];
    if (!tokenClient) {
      return next(new UnauthorizedException());
    }
    const validToken = jwt.verify(tokenClient, process.env.ACCESS_SECRET);
    // const validToken = jwt.verify(tokenClient, process.env.ACCESS_SECRET, {
    //   expiresIn: process.env.JWT_EXPIRED,
    //   algorithm: "HS256",
    // });

    if (!validToken) {
      return next(new UnauthorizedException());
    }

    const checkingUser = await models.user.findOne({ attributes: { exclude: ["password", "otp", "confirmCode"] }, "where": { "email": validToken.email } });
    if (!checkingUser) {
      return next(new UnauthorizedException());
    }

    if (!checkingUser.active) {
      return next(new ForbiddenException("Please confirm your account!"));
    }

    // const user = {
    //   "active": checkingUser.active,
    //   "avatarUrl": checkingUser.avatarUrl,
    //   "email": checkingUser.email,
    //   "firstName": checkingUser.firstName,
    //   "fullName": checkingUser.fullName,
    //   "id": checkingUser.id,
    //   "lastName": checkingUser.lastName,
    //   "phone": checkingUser.phone,
    //   "refreshToken": checkingUser.refreshToken,
    //   "role": checkingUser.role,
    //   "userName": checkingUser.userName,
    // }

    req.user = checkingUser
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
