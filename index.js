const AppServer = require("./appServer");
const {
  installationController,
  AuthController,
  UserController,
  ZoneController,
  RateController,
  StoreController,
  ShopifyController,
  AppController,
  WebhookController,
  FeedbackController,
} = require("./controllers");

const app = new AppServer([
  new installationController(),
  new AuthController(),
  new UserController(),
  new ZoneController(),
  new RateController(),
  new StoreController(),
  new ShopifyController(),
  new AppController(),
  new WebhookController(),
  new FeedbackController(),
]);

app.startListening();
