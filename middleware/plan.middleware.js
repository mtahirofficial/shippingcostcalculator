require("dotenv").config();
const { ServerException } = require("../exceptions");
const models = require("../models");

async function PlanMiddleware(req, res, next) {
  try {

    const store = req.store
    if (!store.activePlan) {
      delete store.dataValues.accessToken
      res.send({ rates: [] })
    } else {
      const plan = await models.plans.findOne({ include: { model: models.features }, where: { handle: store.activePlan } })
      const featuresResponse = await models.features.findAll()
      const featuresList = featuresResponse.map(feature => feature.handle)

      const features = {}
      for (const feature of plan.features) {
        features[feature.handle] = feature.handle
      }
      const activeFeatures = {}
      for (const key in features) {
        if (Object.prototype.hasOwnProperty.call(features, key)) {
          const element = features[key];
          activeFeatures[element] = featuresList.indexOf(element) > -1
        }
      }

      req.activeFeatures = activeFeatures
      req.activePlan = plan
      next();
    }
  } catch (e) {
    return next(new ServerException(e.message))
  }
}

module.exports = PlanMiddleware;
