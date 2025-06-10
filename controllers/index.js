const installationController = require("./installation.controller");
const UserController = require("./user.controller");
const AuthController = require("./auth.controller");
const ZoneController = require("./zone.controller");
const RateController = require("./rate.controller");
const StoreController = require("./store.controller");
const ShopifyController = require("./shopify.controller");
const AppController = require("./app.controller");
const WebhookController = require("./webhook.controller");
const FeedbackController = require("./feedback.controller");
const DefaultRuleController = require("./defaultRule.controller");

module.exports = {
  installationController,
  UserController,
  AuthController,
  ZoneController,
  RateController,
  StoreController,
  ShopifyController,
  AppController,
  DefaultRuleController,
  WebhookController,
  FeedbackController,
};
