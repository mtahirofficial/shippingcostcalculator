const express = require("express");
require("dotenv").config();
const { ServerException } = require("../exceptions");
const { Controller } = require("../core");

class FeedbackController extends Controller {
    _path = "/feedback";
    _router = express.Router();
    constructor() {
        super();
        this.initializeRoutes();
    }

    async handleFeedback(req, res, next) {
        try {
            const body = req.body
            console.log(body);
            res.json(body)
        } catch (e) {
            next(new ServerException(e.message));
        }
    }
    initializeRoutes() {
        this._router.post(`${this._path}`, this.handleFeedback);
    }
}

module.exports = FeedbackController;
