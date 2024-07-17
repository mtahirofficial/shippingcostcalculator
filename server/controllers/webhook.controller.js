require("dotenv").config();
const express = require("express");
const { Controller } = require("../core");
const { ShopService, PaymentService, PlanService, WebhookService, ProductService, OrderService, OrderItemService, StoreService } = require("../services");
const { getPayment } = require("./shopify.controller");
const { calculateTrial } = require("../utils");
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
            const paymentId = Number(subscription.admin_graphql_api_id.replace('gid://shopify/AppSubscription/', ''))
            const shop_id = subscription.admin_graphql_api_shop_id.replace('gid://shopify/Shop/', "")
            const shop_data = await ShopService.findOne("shopId", shop_id)
            const prevPaymentId = shop_data.paymentId
            let trialDays = shop_data.trialDays
            const dataToUpdateShop = {}
            const dataToUpdatePayment = {}
            let isActivePay = subscription.status.toLowerCase() === 'active'
            if (isActivePay) {
                const addeddPayment = await PaymentService.findOne("paymentId", paymentId)
                const plan = await PlanService.findOne("handle", addeddPayment.planHandle)
                dataToUpdateShop.paymentId = paymentId
                dataToUpdateShop.planId = plan.id
            } else if (paymentId !== prevPaymentId) {
                const prevPaymentResponse = await getPayment(prevPaymentId, shop_data.domain, shop_data.accessToken)
                if (prevPaymentResponse.recurring_application_charge?.status?.toLowerCase() !== "active") {
                    dataToUpdatePayment.status = subscription.status
                    dataToUpdatePayment.cancelledOn = subscription.updated_at
                    trialDays = calculateTrial(trialDays, subscription.created_at)
                    dataToUpdateShop.trialDays = trialDays
                }
            } else {
                trialDays = calculateTrial(trialDays, subscription.created_at)
                dataToUpdateShop.trialDays = trialDays
                dataToUpdatePayment.status = subscription.status
                dataToUpdatePayment.cancelledOn = subscription.updated_at
            }
            await PaymentService.update(dataToUpdatePayment, "paymentId", paymentId)
            await ShopService.update(dataToUpdateShop, "shopId", shop_data.shopId)
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
        } catch (error) {
            console.log("catch uninstallApp", error);
        }
        res.status(200).end();
    }


    webhookResponse(req, res) {
        res.status(200).end();
    }

    initializeRoutes() {
        // this._router.post(`${this._path}/app_subscriptions/update`, this.appSubscribe);
        this._router.post(`${this._path}/app/uninstalled`, this.uninstallApp);

        this._router.post(`${this._path}/customers/data_request`, this.webhookResponse);
        this._router.post(`${this._path}/customers/redact`, this.webhookResponse);
        this._router.post(`${this._path}/shop/redact`, this.webhookResponse);
    }
}

module.exports = WebhookController;