const express = require("express");
const nonce = require('nonce')();
const models = require("../models");
require("dotenv").config();
const { Controller } = require("../core");
const { getShop, generateAccessToken, appSubscriptionCreateWebhook, createCarrierService, createWebhook } = require("./shopify.controller");
const querystring = require('querystring');
const crypto = require('crypto');
const { BadRequestException, ServerException, UnauthorizedException } = require("../exceptions");
const AppController = require("./app.controller");
const { updateOrCreate } = require("../services/user.service");
const { MailerService } = require("../services");

const hostLink = process.env.HOST;
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const SCOPES = process.env.SCOPES;
const WEBHOOKS = process.env.WEBHOOKS.split(",");;
const APP_PATH = process.env.APP_PATH;

class InstallationController extends Controller {
    _path = "/";
    _router = express.Router();
    static _isInstalled = false;
    static _isActive = false;
    constructor() {
        super();
        this.initializeRoutes();
    }

    async createInstallUrl(req, res, next) {
        try {
            const domain = req.query.shop;
            if (domain) {
                const shop_name = domain.replace(".myshopify.com", "")
                const store = await models.store.findOne({ "where": { "name": shop_name }, "order": models.sequelize.literal('id DESC') });
                InstallationController._isInstalled = store instanceof Object
                InstallationController._isActive = store?.active;
                if (InstallationController._isActive) {
                    const shopResponse = await getShop(domain, store.accessToken);
                    InstallationController._isActive = Object.hasOwnProperty.call(shopResponse, "shop")
                }
                const token = store?.storeId
                if (InstallationController._isInstalled && InstallationController._isActive) {
                    const host = store.shopifyHost
                    // res.redirect(`http://localhost:3000?host=${host}&s=${token}`)

                    let query = `?host=${host}&shop=${store.domain}&token=${store.storeId}`
                    let renderPath = "home"
                    let redirectPath = `https://admin.shopify.com/store/${store.name}/apps/${APP_PATH}/${renderPath + query}`
                    if (req.header('sec-fetch-dest') === 'iframe') {
                        redirectPath = renderPath + query
                    }

                    res.redirect(redirectPath)
                } else {
                    // console.log("else");
                    const state = nonce();
                    const redirectUri = `${hostLink}/callback`
                    const installUrl = `https://${domain}/admin/oauth/authorize?client_id=${apiKey}&scope=${SCOPES}&state=${state}&redirect_uri=${redirectUri}`;
                    res.cookie("state", state)
                    res.redirect(installUrl);
                }
            } else {
                next(new UnauthorizedException())
            }
        } catch (e) {
            next(new ServerException(null, e.message))
        }
    }

    async install(req, res, next) {
        const { shop, hmac, code, state, host } = req.query;
        if (shop && hmac && code) {
            const map = Object.assign({}, req.query)
            delete map['signature']
            delete map['hmac']
            const message = querystring.stringify(map);
            const providedHmac = Buffer.from(hmac, 'utf-8');
            const generatedHash = Buffer.from(crypto.createHmac('sha256', apiSecret).update(message).digest('hex'), 'utf-8');
            let hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac);
            if (!hashEquals) {
                next(new BadRequestException("HMAC validation failed"))
            }
            const accessResponse = await generateAccessToken(shop, code);
            if (Object.hasOwnProperty.call(accessResponse, "access_token")) {
                const shop_name = shop.replace(".myshopify.com", "")
                const accessToken = accessResponse.access_token;
                const shopResponse = await getShop(shop, accessToken)
                if (!Object.hasOwnProperty.call(shopResponse, "shop")) {
                    next(new ServerException(null, shopResponse))
                    return false
                }
                const shopData = shopResponse.shop
                await updateOrCreate(shopData)
                await AppController.saveShop(shop_name, shopData, accessToken, host, InstallationController._isInstalled, InstallationController._isActive) // returns shop object from database
                // await appSubscriptionCreateWebhook(shop, accessToken) // late for payment
                const webhookPayloads = []
                for (const webhook of WEBHOOKS) {
                    const webhookResponse = await createWebhook(accessToken, shop, webhook)
                    if (webhookResponse.webhook) {
                        const { id, address, topic } = webhookResponse.webhook
                        const data = { "storeId": shopData.id, "name": topic, "webhookId": id, "url": address }
                        webhookPayloads.push(data)
                    }
                }
                await models.webhook.bulkCreate(webhookPayloads);
                await createCarrierService(accessToken, shop, shopData.id)

                let query = `?host=${host}&shop=${shop}&token=${shopData.id}`
                let renderPath = "home"
                let redirectPath = `https://admin.shopify.com/store/${shop.replace(".myshopify.com", '')}/apps/${APP_PATH}/${renderPath + query}`

                if (process.env.NODE_ENV !== "development") {
                    await MailerService.sendEmail({
                        to: shopData?.email || shopData?.customer_email,
                        subject: `Welcome to ${process.env.APP_NAME}`,
                        template: "welcomeToApp",
                        context: {
                            appName: process.env.APP_NAME,
                            user: shopData.shop_owner
                        },
                    });
                }

                res.redirect(redirectPath)
            } else {
                next(new ServerException(null, accessResponse))
            }
        } else {
            next(new BadRequestException("Required Parameters missing"))
        }
    }

    initializeRoutes() {
        this._router.get(`/`, this.createInstallUrl);
        this._router.get(`/callback`, this.install);
    }
}

module.exports = InstallationController;