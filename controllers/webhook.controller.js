require("dotenv").config();
const express = require("express");
const { Controller } = require("../core");
const { ShopService, PaymentService, PlanService, WebhookService, ProductService, OrderService, OrderItemService, StoreService, MailerService } = require("../services");
const { getPayment } = require("./shopify.controller");
const { calculateTrial } = require("../utils");
const fs = require('fs');

const hostLink = process.env.HOST;

class WebhookController extends Controller {
    _path = "/webhook"
    _router = express.Router();

    constructor() {
        super();
        this.initializeRoutes();
    }
    async appSubscribe(req, res) {
        try {
            const subscription = req.body.app_subscription;
            console.log("subscription", subscription);

            // const paymentId = Number(subscription.admin_graphql_api_id.replace('gid://shopify/AppSubscription/', ''))
            // const shop_id = subscription.admin_graphql_api_shop_id.replace('gid://shopify/Shop/', "")
            // const shop_data = await ShopService.findOne("shopId", shop_id)
            // const prevPaymentId = shop_data.paymentId
            // let trialDays = shop_data.trialDays
            // const dataToUpdateShop = {}
            // const dataToUpdatePayment = {}
            // let isActivePay = subscription.status.toLowerCase() === 'active'
            // if (isActivePay) {
            //     const addeddPayment = await PaymentService.findOne("paymentId", paymentId)
            //     const plan = await PlanService.findOne("handle", addeddPayment.planHandle)
            //     dataToUpdateShop.paymentId = paymentId
            //     dataToUpdateShop.planId = plan.id
            // } else if (paymentId !== prevPaymentId) {
            //     const prevPaymentResponse = await getPayment(prevPaymentId, shop_data.domain, shop_data.accessToken)
            //     if (prevPaymentResponse.recurring_application_charge?.status?.toLowerCase() !== "active") {
            //         dataToUpdatePayment.status = subscription.status
            //         dataToUpdatePayment.cancelledOn = subscription.updated_at
            //         trialDays = calculateTrial(trialDays, subscription.created_at)
            //         dataToUpdateShop.trialDays = trialDays
            //     }
            // } else {
            //     trialDays = calculateTrial(trialDays, subscription.created_at)
            //     dataToUpdateShop.trialDays = trialDays
            //     dataToUpdatePayment.status = subscription.status
            //     dataToUpdatePayment.cancelledOn = subscription.updated_at
            // }
            // await PaymentService.update(dataToUpdatePayment, "paymentId", paymentId)
            // await ShopService.update(dataToUpdateShop, "shopId", shop_data.shopId)
        } catch (error) {
            console.log('app_subscriptions/update', error);
        }
        res.status(200).end();
    }
    async uninstallApp(req, res) {
        try {
            const shopFromShopify = req.body;
            // const shop = await StoreService.getStore(null, shopFromShopify.id)
            // let trialDays = shop.trialDays
            // if (shop.paymentId) {
            //     const paymentRes = await PaymentService.findOne("paymentId", shop.paymentId)
            //     if (paymentRes) {
            //         trialDays = calculateTrial(trialDays, paymentRes.paymentCreatedAt)
            //         PaymentService.update({ status: "CANCELLED", cancelledOn: new Date() }, "paymentId", paymentRes.paymentId)
            //     }
            // }
            // console.log("uninstallApp", shopFromShopify.id);
            StoreService.update({ active: false }, shopFromShopify.id)
            WebhookService.delete('storeId', shopFromShopify.id)
            if (process.env.NODE_ENV !== "development") {
                let mail_config = {
                    to: shopFromShopify?.email || shopFromShopify?.customer_email,
                    subject: `We're Sorry to See You Go – Share Your Feedback`,
                    template: "uninstall",
                    context: {
                        appName: process.env.APP_NAME,
                        user: shopFromShopify.shop_owner,
                        feedbackFormLink: `logicsarcade.com/feedback?store_url=${shopFromShopify.domain}`,
                        facebook_page: "https://www.facebook.com/profile.php?id=61567071715420",
                        youtube: "https://www.youtube.com/@LogicsArcade",
                        whatsapp_channel: "https://whatsapp.com/channel/0029VawQIp02phHPRwl37x35",
                        whatsapp: "https://wa.me/923457699395",
                    },
                }
                try {
                    MailerService.sendEmail(mail_config);
                    // fs.writeFile("uninstallApp_sent.txt", JSON.stringify(sent), err => { if (err) console.log(err) });
                } catch (error) {
                    fs.writeFile("uninstallApp_mail_error.txt", JSON.stringify(error.message), err => { if (err) console.log(err) });
                }
            }
        } catch (error) {
            console.log("catch uninstallApp", error);
        }
        res.status(200).end();
    }


    async verifyHmac(req, res) {
        try {
            const data = req.body
            const hmac = req.headers['x-shopify-hmac-sha256']
            const providedHmac = Buffer.from(hmac, 'utf-8');

            const generatedHash = Buffer.from(crypto.createHmac('sha256', API_SECRET).update(JSON.stringify(data)).digest('hex'), 'utf-8');

            const isMatched = crypto.timingSafeEqual(generatedHash, providedHmac)
            if (isMatched) {
                // res.status(200).send('OK')
            } else {
                // res.status(401).send('Not Shopify')
            }
        } catch (error) {
            // res.status(401).send('Error')
            console.log("VerifyHmac", error.message);

        } finally {
            res.status(200).send('OK')
        }
    }

    initializeRoutes() {
        this._router.post(`${this._path}/app_subscriptions/update`, this.appSubscribe);
        this._router.post(`${this._path}/app/uninstalled`, this.uninstallApp);

        this._router.post(`${this._path}/customers/data_request`, this.verifyHmac);
        this._router.post(`${this._path}/customers/redact`, this.verifyHmac);
        this._router.post(`${this._path}/shop/redact`, this.verifyHmac);
    }
}

module.exports = WebhookController;