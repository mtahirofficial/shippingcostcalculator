const AuthMiddleware = require("./auth.middleware");
const LoggerMiddleware = require("./logger.middleware");
const ErrorsMiddleware = require("./errors.middleware");
const SocketAuthMiddleware = require("./socket-auth.middleware");
const StoreMiddleware = require("./store.middleware");
const CheckoutAuthMiddleware = require("./checkout.auth.middleware");
const PlanMiddleware = require("./plan.middleware");

module.exports = {
	AuthMiddleware,
	LoggerMiddleware,
	ErrorsMiddleware,
	StoreMiddleware,
	SocketAuthMiddleware,
	CheckoutAuthMiddleware,
	PlanMiddleware
};
