'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class store extends Model {
    static associate(models) {
    }
  };
  store.init({
    key: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    storeId: DataTypes.BIGINT,
    myshopifyDomain: DataTypes.STRING,
    domain: DataTypes.STRING,
    name: DataTypes.STRING,
    accessToken: DataTypes.STRING,
    owner: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    customerEmail: DataTypes.STRING,
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    zip: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    provinceCode: DataTypes.STRING,
    country: DataTypes.STRING,
    countryCode: DataTypes.STRING,
    currency: DataTypes.STRING,
    moneyFormat: DataTypes.STRING,
    planDisplayName: DataTypes.STRING,
    planName: DataTypes.STRING,
    locationId: DataTypes.BIGINT,
    enabledCurrencies: DataTypes.STRING,
    timeZone: DataTypes.STRING,
    primaryLocale: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    shopifyHost: DataTypes.STRING,
    lattitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    serviceId: DataTypes.BIGINT,
    closed: DataTypes.BOOLEAN,
    trialDays: DataTypes.INTEGER,
    timeZoneOffset: DataTypes.STRING,
    firstLoad: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'store',
  });


  // Hook for before creating a new record
  store.beforeCreate(async (u, options) => {
    // Find the most recent record
    const recent = await store.findOne({
      order: [['createdAt', 'DESC']], // Assuming you have a createdAt column
      attributes: ['key'], // Only select the key column
      raw: true, // Return plain JavaScript objects
    });
    // Increment the key value of the most recent record
    const incrementedKey = recent ? recent.key + 1 : 1;
    // Set the incremented key for the new record
    u.key = incrementedKey;
  });

  return store;
};