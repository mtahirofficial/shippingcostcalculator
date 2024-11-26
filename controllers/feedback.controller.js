const express = require("express");
require("dotenv").config();
const { ServerException } = require("../exceptions");
const { Controller } = require("../core");
const fs = require('fs');
const { MailerService } = require("../services");

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
            if (process.env.NODE_ENV !== "development") {
                let mail_config = {
                    to: "hmtahirs1@gmail.com",
                    subject: `Feedback Received - ${process.env.APP_NAME}`,
                    template: "feedbackReceived",
                    context: {
                        appName: process.env.APP_NAME,
                        email: body.email,
                        store_url: body.store_url,
                        rating: body.rating,
                        feedback: body.feedback,
                        suggestions: body.suggestions,
                    },
                }
                try {
                    MailerService.sendEmail(mail_config);
                    // fs.writeFile("feedback_sent.txt", JSON.stringify(sent), err => { if (err) console.log(err) });
                } catch (error) {
                    fs.writeFile("feedback_mail_error.txt", JSON.stringify(error.message), err => { if (err) console.log(err) });
                }
            }
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
