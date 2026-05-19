require("dotenv").config();
const express = require("express");
const { Controller } = require("../core");
const {
  ShopService,
  PaymentService,
  PlanService,
  WebhookService,
  ProductService,
  OrderService,
  OrderItemService,
  StoreService,
  MailerService,
} = require("../services");
const { getPayment } = require("./shopify.controller");
const { calculateTrial } = require("../utils");
const fs = require("fs");
const models = require("../models");
const crypto = require("crypto");
const ShopifyController = require("./shopify.controller");

const hostLink = process.env.HOST;
const API_SECRET = process.env.SHOPIFY_API_SECRET;

class WebhookController extends Controller {
  _path = "/webhook";
  _router = express.Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  // async appSubscribe(req, res) {
  //   try {
  //     const subscription = req.body.app_subscription;
  //     const shop_id = subscription.admin_graphql_api_shop_id.replace(
  //       "gid://shopify/Shop/",
  //       "",
  //     );
  //     const paymentId = subscription.admin_graphql_api_id;
  //     const subscriptionData = {
  //       chargeId: subscription.admin_graphql_api_id,
  //       name: subscription.name,
  //       status: subscription.status,
  //       storeId: shop_id,
  //       paymentCreatedAt: subscription.created_at,
  //       paymentUpdatedAt: subscription.updated_at,
  //       currency: subscription.currency,
  //     };

  //     const store = await StoreService.findOne("storeId", shop_id, false);
  //     const addedPayment = await models.payment.findOne({
  //       where: { chargeId: paymentId },
  //     });
  //     const isActivePay = subscription.status.toLowerCase() === "active";

  //     const plan = await models.plans.findOne({
  //       where: { name: subscription.name },
  //     });
  //     let storeUpdate = null;

  //     if (!addedPayment && isActivePay) {
  //       subscriptionData.paymentCancelledOn = null;
  //       // New active payment: create and set activePlan
  //       await models.payment.create(subscriptionData);
  //       storeUpdate = { chargeId: paymentId, activePlan: plan.handle };
  //     } else if (addedPayment && isActivePay) {
  //       // Existing payment becomes active: update status and set activePlan
  //       await models.payment.update(
  //         { status: subscriptionData.status, paymentCancelledOn: null },
  //         { where: { chargeId: paymentId } },
  //       );
  //       storeUpdate = { chargeId: paymentId, activePlan: plan.handle };
  //     } else if (
  //       addedPayment &&
  //       subscription.status.toLowerCase() === "cancelled"
  //     ) {
  //       // Payment cancelled: update status
  //       await models.payment.update(
  //         { status: subscriptionData.status, paymentCancelledOn: new Date() },
  //         { where: { chargeId: paymentId } },
  //       );
  //       // Check if any other active payment exists for this shop
  //       const activePayments = await models.payment.count({
  //         where: {
  //           storeId: shop_id,
  //           status: "ACTIVE",
  //         },
  //       });
  //       if (activePayments === 0) {
  //         // Only set activePlan to null if no other active payments
  //         storeUpdate = { activePlan: null, chargeId: null };
  //       }
  //     }

  //     if (storeUpdate) {
  //       await StoreService.update(storeUpdate, shop_id);
  //     }
  //   } catch (error) {
  //     console.log("app_subscriptions/update", error);
  //   }
  //   res.status(200).end();
  // }
  async appSubscribe(req, res) {
    try {
      const subscription = req.body.app_subscription;
      const paymentId = subscription.admin_graphql_api_id;
      const shop_id = subscription.admin_graphql_api_shop_id.replace(
        "gid://shopify/Shop/",
        "",
      );
      const status = (subscription?.status || "").toUpperCase();
      const planHandle = subscription?.plan_handle || null;
      const plan = planHandle
        ? await models.plans.findOne({ where: { handle: planHandle } })
        : null;
      const store = await models.store.findOne({ where: { storeId: shop_id } });
      const updatedAt =
        subscription?.updated_at || subscription?.updatedAt || null;

      if (!shop_id || !paymentId || !store) {
        return res.status(400).send(req.body);
      }
      const interval = subscription?.interval || null;
      const amount = subscription?.price ?? null;
      const currentPeriodEnd =
        subscription?.current_period_end ||
        subscription?.currentPeriodEnd ||
        null;
      const createdAt =
        subscription?.created_at || subscription?.createdAt || null;

      const subscriptionData = {
        chargeId: subscription.admin_graphql_api_id,
        name: subscription.name,
        status: subscription.status,
        storeId: shop_id,
        paymentCreatedAt: subscription.created_at,
        paymentUpdatedAt: subscription.updated_at,
        currency: subscription.currency,
        paymentCancelledOn:
          status === "ACTIVE"
            ? null
            : updatedAt
              ? new Date(updatedAt)
              : new Date(),
      };

      const addedPayment = await models.payment.findOne({
        where: { chargeId: paymentId },
      });
      if (addedPayment) subscriptionData.id = addedPayment.id;
      await models.payment.upsert(subscriptionData);

      // Stop if not active
      if (status !== "ACTIVE") {
        return res.status(200).end();
      }

      // Verify via Shopify API
      const activePaymentResponse =
        await ShopifyController.getActivePaymentDetails(store);

      const activeSubscriptions =
        activePaymentResponse?.data?.appInstallation?.activeSubscriptions || [];

      // Confirm payment is truly active on Shopify
      const isActiveOnShopify = activeSubscriptions.some((s) => {
        return (
          s?.id === paymentId && (s?.status || "").toUpperCase() === "ACTIVE"
        );
      });
      if (!isActiveOnShopify) {
        return res.status(200).end();
      }

      const app = await ShopifyController.getAppId(store);
      if (
        Object.hasOwnProperty.call(app.data, "data") &&
        Object.hasOwnProperty.call(app.data.data, "currentAppInstallation")
      ) {
        const id = app.data.data.currentAppInstallation.id;
        const metafieldsSet = await ShopifyController.addMetaFields(
          store,
          id,
          (planHandle === "plus" || planHandle === "plus-private").toString(),
        );
        if (
          Object.hasOwnProperty.call(metafieldsSet.data, "data") &&
          Object.hasOwnProperty.call(metafieldsSet.data.data, "metafieldsSet")
        ) {
          const { metafields, userErrors } =
            metafieldsSet.data.data.metafieldsSet;
        }
      }

      // Update Store only after Shopify verification
      await StoreService.update(
        {
          chargeId: paymentId,
          activePlan: plan?.handle || null,
        },
        shop_id,
      );
    } catch (error) {
      console.log("[app_subscriptions/update] error", {
        message: error?.message,
        stack: error?.stack,
      });
    }

    res.status(200).end();
  }
  async uninstallApp(req, res) {
    try {
      const shopFromShopify = req.body;
      StoreService.update(
        { active: false, activePlan: null, chargeId: null },
        shopFromShopify.id,
      );
      models.payment.update(
        { status: "Cancelled", paymentCancelledOn: new Date() },
        { where: { storeId: shopFromShopify.id } },
      );
      WebhookService.delete("storeId", shopFromShopify.id);
      if (process.env.NODE_ENV !== "development") {
        let mail_config = {
          to: shopFromShopify?.email || shopFromShopify?.customer_email,
          subject: `We're Sorry to See You Go – Share Your Feedback`,
          template: "uninstall",
          context: {
            appName: process.env.APP_NAME,
            user: shopFromShopify.shop_owner,
            feedbackFormLink: `logicsarcade.com/feedback?store_url=${shopFromShopify.domain}`,
            facebook_page:
              "https://www.facebook.com/profile.php?id=61567071715420",
            youtube: "https://www.youtube.com/@LogicsArcade",
            whatsapp_channel:
              "https://whatsapp.com/channel/0029VawQIp02phHPRwl37x35",
            whatsapp: "https://wa.me/923457699395",
          },
        };
        try {
          MailerService.sendEmail(mail_config);
        } catch (error) {
          fs.writeFile(
            "uninstallApp_mail_error.txt",
            JSON.stringify(error.message),
            (err) => {
              if (err) console.log(err);
            },
          );
        }
      }
    } catch (error) {
      console.log("catch uninstallApp", error);
    }
    res.status(200).end();
  }

  async verifyHmac(req, res) {
    try {
      const data = req.body;
      const hmac = req.headers["x-shopify-hmac-sha256"];
      const providedHmac = Buffer.from(hmac, "utf-8");

      const generatedHash = Buffer.from(
        crypto
          .createHmac("sha256", API_SECRET)
          .update(JSON.stringify(data))
          .digest("hex"),
        "utf-8",
      );

      const isMatched = crypto.timingSafeEqual(generatedHash, providedHmac);
      if (isMatched) {
        // res.status(200).send('OK')
      } else {
        // res.status(401).send('Not Shopify')
      }
    } catch (error) {
      // res.status(401).send('Error')
      console.log("VerifyHmac", error.message);
    } finally {
      res.status(200).send("OK");
    }
  }

  initializeRoutes() {
    this._router.post(
      `${this._path}/app_subscriptions/update`,
      this.appSubscribe,
    );
    this._router.post(`${this._path}/app/uninstalled`, this.uninstallApp);
    this._router.post(`${this._path}/customers/data_request`, this.verifyHmac);
    this._router.post(`${this._path}/customers/redact`, this.verifyHmac);
    this._router.post(`${this._path}/shop/redact`, this.verifyHmac);
  }
}

module.exports = WebhookController;
