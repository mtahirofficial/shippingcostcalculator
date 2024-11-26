const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { join } = require("path");
const {
	ErrorsMiddleware,
	LoggerMiddleware
} = require("./middleware");
const { ConsoleLogger } = require("./core");

class AppServer {
	_app = express();
	_port = process.env.PORT;
	_server;

	constructor(controllers = []) {
		dotenv.config();
		this.initMiddleWares();
		this.enableStaticFile();
		this.initLogger();
		this.initializeControllers(controllers);
		this.initErrorHandling();
		if (process.env.IS_SSR) {
			this.loadSSRView();
		}
	}

	buildCorsOpt() {
		const configCors = process.env.CORS_ALLOW_ORIGINS;
		if (!configCors) {
			throw new Error("ENV CORS not provider!");
		}
		return {
			origin: configCors.toString().split(","),
			methods: "OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE",
			preflightContinue: true,
			optionsSuccessStatus: 204,
			credentials: true,
		};
	}

	initMiddleWares() {
		this._app.use(cors(this.buildCorsOpt()));
		this._app.use(bodyParser.json());
		this._app.options('*', cors(this.buildCorsOpt()));
	}

	loadSSRView() {
		this._app.use(express.static(join(__dirname, "build")));
		this._app.get("*", (req, res) => {
			res.removeHeader("X-Frame-Options")
			res.sendFile(join(__dirname, "./build/index.html"));
		});
	}

	initErrorHandling() {
		this._app.use(ErrorsMiddleware);
	}

	initLogger() {
		this._app.use(LoggerMiddleware);
	}

	enableStaticFile() {
		this._app.use(express.static(join(__dirname, "public")));
	}

	initializeControllers(controllers = []) {
		controllers.forEach((c) => {
			this._app.use("/", c._router);
		});
	}

	startListening() {
		const PORT = process.env.PORT || this._port;
		this._server = this._app.listen(PORT, () => {
			ConsoleLogger.info(`Server started on ${PORT}!`);
		});
	}
}

module.exports = AppServer;
