const express = require("express");
const models = require("../models");
require("dotenv").config();
const { Controller, ConsoleLogger } = require("../core");
const { default: axios } = require("axios");

const EMAIL = process.env.EMAIL;
const HOST = process.env.HOST;
const API_VER = process.env.API_VER;
const APP_NAME = process.env.APP_NAME;
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

class ShopifyController extends Controller {
  _router = express.Router();
  constructor() {
    super();
  }

  static async generateAccessToken(shop, code) {
    const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
    const accessTokenPayload = {
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    }
    const options = {
      method: "POST",
      url: accessTokenRequestUrl,
      data: accessTokenPayload,
    };
    ConsoleLogger.info(JSON.stringify(options));
    return await axios(options)
      .then(response => response.data)
      .catch(e => {
        console.log(Object.keys(e.response));
        console.log(e.response.data);
        return e.response.data.errors
      })

  }

  static async getShop(domain, accessToken) {
    const url = `https://${domain}/${API_VER}/shop.json`;
    const header = {
      'X-Shopify-Access-Token': accessToken,
    };

    const options = {
      method: "GET",
      url: url,
      headers: header,
    };
    return await axios(options)
      .then(response => response.data)
      .catch(error => error.response.data.errors)
  }

  static async createPayment(shop_data, planName, price, interval, trialDays) {
    try {
      const variables = {
        "name": planName,
        "returnUrl": `${HOST}/payment/callback?shop_id=${shop_data.shop_id}`,
        "test": shop_data.email === EMAIL,
        "trialDays": trialDays,
        "lineItems": [
          {
            "plan": {
              "appRecurringPricingDetails": {
                "price": {
                  "amount": price,
                  "currencyCode": "USD"
                },
                "interval": interval
              }
            }
          }
        ]
      }

      const data = JSON.stringify({
        "query": `#graphql
        mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int, $test: Boolean!){
                    appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, trialDays: $trialDays, test: $test) {
                      userErrors {
                        field
                        message
                      }
                      appSubscription {
                        id
                        name
                        returnUrl
                        status
                        trialDays
                        test
                        currentPeriodEnd
                        createdAt
                        lineItems {
                          plan {
                            pricingDetails {
                              ... on AppRecurringPricing {
                                __typename
                                interval
                                price {
                                  amount
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                      }
                      confirmationUrl
                    }
                  }
                  `,
        variables
      });
      const options = {
        "method": "POST",
        "url": `https://${shop_data.domain}/${API_VER}/graphql.json`,
        "headers": {
          "content-type": "application/json",
          "X-Shopify-Access-Token": shop_data.access_token,
        },
        "json": true,
        "data": data
      };

      return await axios(options)
        .then(response => {
          const appSubscriptionCreate = response.data.data.appSubscriptionCreate
          if (appSubscriptionCreate.userErrors?.length) {
            return { "success": false, "message": appSubscriptionCreate?.userErrors[0]?.message }
          }
          return ({ "success": true, "message": 'created', "data": response.data.data.appSubscriptionCreate })
        })
        .catch(e => ({ "success": false, "message": e.message }))
    } catch (e) {
      res.json({ success: false, message: e.message });
    }
  }

  static async getActivePaymentDetails(shop_data) {
    var data = JSON.stringify({
      "query": `{
                  appInstallation {
                    activeSubscriptions {
                      createdAt
                      currentPeriodEnd
                      id
                      name
                      returnUrl
                      status
                      test
                      trialDays
                      lineItems {
                        id
                        plan {
                          pricingDetails {
                            ... on AppRecurringPricing {
                              __typename
                              interval
                              price {
                                amount
                                currencyCode
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }`,
    });
    const options = {
      "method": "POST",
      "url": `https://${shop_data.domain}/${API_VER}/graphql.json`,
      "headers": {
        "content-type": "application/json",
        "X-Shopify-Access-Token": shop_data.access_token,
      },
      "json": true,
      "data": data
    };

    return await axios(options)
      .then(response => ({ "success": response.status === 200, "message": 'Successful', "data": response.data.data }))
      .catch(e => ({ "success": false, "message": e.message }))

  }

  static async cancelPayment(charge_id, domain, access_token) {
    const options = {
      "method": "DELETE",
      "url": `https://${domain}/${API_VER}/recurring_application_charges/${charge_id}.json`,
      "headers": {
        "content-type": "application/json",
        "X-Shopify-Access-Token": access_token,
      },
      "json": true,
    };

    return await axios(options)
      .then(response => {
        return response.status
      })
      .catch(error => {
        return error.response.data
      })
  }

  static async getPayment(charge_id, domain, access_token) {
    const options = {
      "method": "GET",
      "url": `https://${domain}/${API_VER}/recurring_application_charges/${charge_id}.json`,
      "headers": {
        "content-type": "application/json",
        "X-Shopify-Access-Token": access_token,
      },
      "json": true,
    };

    return await axios(options)
      .then(response => {
        return response.data
      })
      .catch(error => {
        return error.response.data
      })
  }

  static async createCarrierService(accessToken, domain, storeId) {
    try {
      const requestBody = {
        "carrier_service": {
          "name": APP_NAME,
          "callback_url": `${HOST}/rate/checkout`,
          "service_discovery": true
        }
      }
      const options = {
        "method": "POST",
        "url": `https://${domain}/${API_VER}/carrier_services.json`,
        "headers": {
          "content-type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        "json": true,
        "data": requestBody
      };

      let service = {}
      return await axios(options)
        .then(async response => {
          if (response.data.carrier_service) {
            service = response.data.carrier_service
            await models.store.update({ "serviceId": service.id }, { "where": { "storeId": storeId } })
          }
          return { message: 'Successfully enabled!', show_warning: false }
        })
        .catch(async error => {
          console.log(error.response.data.errors);
          // let message = error.response.data.errors.base[0];
          // let show_warning = message !== 'Advance Shipping Rates is already configured'
          // await models.store.update({ show_warning }, { "where": { "storeId": storeId } })
          // return { message, show_warning }
        })

    } catch (error) {
      console.log(error);
      return error.message
    }
  }

  static async appSubscriptionCreateWebhook(shop, accessToken) {
    const data = JSON.stringify({
      query: `mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        userErrors {
          field
          message
        }
        webhookSubscription {
          id
          topic
          format
          callbackUrl
        }
      }
    }`,
      variables: { "topic": "APP_SUBSCRIPTIONS_UPDATE", "webhookSubscription": { "callbackUrl": `${HOST}/webhook/app_subscriptions/update`, "format": "JSON" } }
    });
    const options = {
      'method': 'POST',
      'url': `https://${shop}/admin/api/2022-01/graphql.json`,
      'headers': {
        'content-type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      data: data
    };
    return await axios(options)
      .then(response => {
        return response.data
      })
      .catch(error => {
        return error
      })
  }

  static async createWebhook(accessToken, shop, webhookType) {
    const requestBody = JSON.stringify({ "webhook": { "topic": webhookType, "address": `${HOST}/webhook/${webhookType}`, "format": "json" } })

    const options = {
      'method': 'POST',
      'url': `https://${shop}/${API_VER}/webhooks.json`,
      'headers': {
        'content-type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      data: requestBody
    };
    return await axios(options)
      .then(response => response.data)
      .catch(error => error)
  }
}

module.exports = ShopifyController;