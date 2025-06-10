const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AuthMiddleware } = require("../middleware");
const { Controller, ConsoleLogger } = require("../core");
const { UserService, AuthService, MailerService, StoreService } = require("../services");
const { generateOTP, getSecondBetween2Date, randomStr, createHash } = require("../utils");
const { REGEX_EMAIL, MAX_TIME_OTP, MIN_LENGTH_PASS, DEFAULT_AVATAR } = require("../constants");
const { rateLimit } = require("express-rate-limit");
const models = require("../models")

const { ServerException, NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } = require("../exceptions");
const { Op } = require("sequelize");
const { mailBySendGrid } = require("../services/mailer.service");

const APP_NAME = process.env.APP_NAME

class AuthController extends Controller {
  _path = "/auth";
  _router = express.Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  async validateBeforeCreateAccount(req, res, next) {
    try {
      const user = req.body.user;
      if (!user) {
        return next(new BadRequestException("User is not provider"));
      }
      const { email, password } = user;

      const userExisting = await models.user.findOne({ where: { email } });
      if (userExisting) {
        return next(new BadRequestException("User already exists"));
      }

      if (!email || !password) {
        const errors = [];
        if (!email) {
          errors.push({
            field: "email",
            message: "Email can not be null or empty!",
          });
        }

        if (!password) {
          errors.push({
            field: "password",
            message: "Password can not be null or empty!",
          });
        }

        if (!REGEX_EMAIL.test(email)) {
          errors.push({
            field: "email",
            message: "Invalid email!",
          });
        }

        if (password.length < MIN_LENGTH_PASS) {
          errors.push({
            field: "password",
            message: "Password must be greater than or equal to 8 characters!",
          });
        }

        return next(new NotFoundException("Failure", errors));
      }
      next();
    } catch (error) {
      console.log("catch", error);
      next(new ServerException(error.message));

    }
  }

  async registerAccount(req, res, next) {
    try {
      const user = req.body.user;
      const hashPassword = await createHash(user.password);
      const payloadForToken = { "email": user.email }
      const token = await AuthService.generateAccessToken(payloadForToken);
      const refreshToken = await AuthService.generateRefreshToken(payloadForToken);
      const OTP = randomStr(8)
      const payload = {
        "firstName": user.firstName,
        "lastName": user.lastName,
        "fullName": user.firstName + " " + user.lastName,
        "email": user.email,
        "password": hashPassword,
        "refreshToken": refreshToken,
        "confirmCode": OTP,
        "avatarUrl": `https://xsgames.co/randomusers/assets/avatars/pixel/${Math.floor(Math.random() * 53)}.jpg`
      }
      const created = await models.user.create(payload);

      // console.log(OTP);
      const envelop = {
        to: user.email,
        subject: `Account created (Confirm your account)`,
        html: `<div>
        <h4>Welcome to ${APP_NAME}!</h4>
        <p>Dear ${payload.fullName}!</p>
        <p>Your account is created at ${APP_NAME}, Please use this OTP to activate your account</p>
        <br>
        <span style="background-color: whitesmoke; font-family: calibri; font-size: 18px; padding: 5px; border: 1px solid #ddd; border-radius: 8px; color: skyblue; letter-spacing: 3px;">${OTP}</span>
        </div>`,
      };
      const aknowledge = await mailBySendGrid(envelop)
      // console.log({ aknowledge });
      const responseUser = {
        "active": created.active,
        "avatarUrl": created.avatarUrl,
        "email": created.email,
        "firstName": created.firstName,
        "fullName": created.fullName,
        "id": created.id,
        "lastName": created.lastName,
        "phone": created.phone,
        "refreshToken": refreshToken,
        "role": created.role,
        "userName": created.userName,
      }
      res.send({
        "user": responseUser,
        "accessToken": token,
        "refreshToken": refreshToken,
      })
    } catch (error) {
      next(new ServerException(error.message));
    }
  }

  async validateBeforeLogin(req, res, next) {
    try {
      const { user, password } = req.body;
      const existing = await models.user.findOne({ attributes: { exclude: ["otp", "confirmCode"] }, "where": { [Op.or]: [{ "email": user }, { "userName": user }] } });
      if (!existing) {
        return next(new NotFoundException("The email address you entered isn't connected to an account."));
      }
      const isMatch = await bcrypt.compare(password, existing.password);
      if (!isMatch) {
        return next(new BadRequestException("Invalid credentials"));
      }

      if (!existing.active) {
        return next(new ForbiddenException("Please confirm your account!"));
      }
      req.user = existing;
      next();
    } catch (e) {
      console.log(e);
      next(new ServerException());
    }
  }

  async login(req, res, next) {
    try {
      const user = req.user
      const { id, email, firstName, lastName, fullName, userName, phone, role, active, avatarUrl } = user;

      const payload = {
        id: id,
        email,
      };
      const token = await AuthService.generateAccessToken(payload);
      const refreshToken = await AuthService.generateRefreshToken(payload);
      user.update({ refreshToken })
      delete user.dataValues.password
      return res.json({
        "accessToken": token,
        "refreshToken": refreshToken,
        "user": user,
      });
    } catch (error) {
      next(new ServerException(error.message));
    }
  }

  async verifyAccount(req, res, next) {
    try {
      const body = req.body
      const user = await models.user.findOne({ attributes: { exclude: ["password", "otp", "confirmCode"] }, "where": { [Op.or]: { "email": body.email, userName: body.email }, "otp": body.code } })
      if (user) {
        const token = await AuthService.generateAccessToken({ id: user.id, email: user.email });
        const refreshToken = await AuthService.generateRefreshToken({ id: user.id, email: user.email });
        const store = await StoreService.findOne("email", body.email)
        user.update({ "active": true, refreshToken })
        return res.json({
          "store": store,
          "user": user,
          "accessToken": token,
          "refreshToken": user.refreshToken,
        });
      } else {
        return next(new ForbiddenException("Inalid code!"));
      }
    } catch (e) {
      next(new ServerException(e.message));
    }
  }

  async whoAmI(req, res, next) {
    try {
      return res.json(req.user);
    } catch (e) {
      next(new ServerException(e.message));
    }
  }

  async validateBeforeRefreshToken(req, res, next) {
    const { oldToken } = req.body;
    const decoded = jwt.decode(oldToken);

    if (!decoded) {
      return next(new BadRequestException("Bad request!"));
    }

    const { id } = decoded;

    const userExist = await models.user.findOne({ _id: id });

    if (!userExist) {
      return next(new NotFoundException("User not found"));
    }

    req.user = userExist;

    next();
  }

  async refreshToken(req, res, next) {
    try {
      const { id, email } = req.user;

      const newToken = await AuthService.generateAccessToken({
        id: id,
        email,
      });

      const newRefreshToken = await AuthService.generateRefreshToken({
        id: id,
        email,
      });

      return res.json({
        status: 200,
        message: "success",
        data: {
          accessToken: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (e) {
      next(new UnauthorizedException());
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email, _id } = req.user;
      await MailerService.sendEmail({
        to: email,
        subject: "Send otp verify forgot password!",
        template: "verifyResetPassword",
        context: {
          email,
          code: req.otp,
        },
      });

      await UserService.updateUser(_id, {
        otp: req.otp,
        active: false,
        updatedAt: new Date(),
      });

      return res.json({
        status: 200,
        message: "success",
      });
    } catch (e) {
      next(new ServerException(e.message));
    }
  }

  async verifyOtpForgotPassword(req, res, next) {
    const { email, _id } = req.user;

    const newPass = randomStr(8);

    const hashPassword = await bcrypt.hash(newPass, 10);

    await UserService.updateUser(_id, {
      active: true,
      updatedAt: new Date(),
      password: hashPassword,
    });

    await MailerService.sendEmail({
      to: email,
      subject: "Send new password!",
      template: "sendNewPassword",
      context: {
        email,
        password: newPass,
      },
    });

    return res.json({
      status: 200,
      message: "success",
    });
  }

  async validateBeforeVerifyOtpForgot(req, res, next) {
    try {
      const { otp, email } = req.body;
      const userExist = await models.user.findOne({ email });
      if (!userExist) {
        return next(new NotFoundException("User not found!"));
      }
      if (userExist.active) {
        return next(new BadRequestException("Api unAvailable!"));
      }

      const seconds = getSecondBetween2Date(userExist.updatedAt, new Date());

      if (otp !== userExist.otp) {
        return next(new BadRequestException("Otp expired!"));
      }

      if (seconds > MAX_TIME_OTP) {
        return next(new BadRequestException("Otp expired!"));
      }
      req.user = userExist;
      next();
    } catch (e) {
      next(new ServerException(e.message));
    }
  }



  async validateBeforeForgotPassword(req, res, next) {
    const { email } = req.body;
    const existUser = await models.user.findOne({ email });
    if (!existUser) {
      return next(new NotFoundException("User not found!"));
    }

    req.otp = generateOTP(6);
    req.user = existUser;

    next();
  }

  async logout(req, res) {
    try {
      const user = req.user
      res.status(200).end()
    } catch (e) {
      console.log(e.message);
    }
  }

  apiLimiter(max = 100) {
    return rateLimit({
      windowMs: 3 * 60 * 1000, // 3 minutes
      max, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
  }

  initializeRoutes() {
    this._router.post(`${this._path}/register`, this.validateBeforeCreateAccount, this.registerAccount);
    this._router.post(`${this._path}/login`, this.validateBeforeLogin, this.login);
    this._router.post(`${this._path}/refresh-token`, this.validateBeforeRefreshToken, this.refreshToken);
    this._router.get(`${this._path}/me`, AuthMiddleware, this.whoAmI);
    this._router.post(`${this._path}/verify`, this.verifyAccount);
    this._router.post(`${this._path}/forgot-password`, this.apiLimiter(1), this.validateBeforeForgotPassword, this.forgotPassword);
    this._router.post(`${this._path}/verify-otp-forgot`, this.apiLimiter(5), this.validateBeforeVerifyOtpForgot, this.verifyOtpForgotPassword);
    this._router.get(`${this._path}/logout`, AuthMiddleware, this.logout);
  }
}

module.exports = AuthController;
