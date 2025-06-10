'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      key: {
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      storeId: {
        type: Sequelize.BIGINT
      },
      myshopifyDomain: {
        type: Sequelize.STRING
      },
      domain: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      accessToken: {
        type: Sequelize.STRING
      },
      owner: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      customerEmail: {
        type: Sequelize.STRING
      },
      address1: {
        type: Sequelize.STRING
      },
      address2: {
        type: Sequelize.STRING
      },
      zip: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      province: {
        type: Sequelize.STRING
      },
      provinceCode: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      countryCode: {
        type: Sequelize.STRING
      },
      currency: {
        type: Sequelize.STRING
      },
      moneyFormat: {
        type: Sequelize.STRING
      },
      planDisplayName: {
        type: Sequelize.STRING
      },
      planName: {
        type: Sequelize.STRING
      },
      activePlan: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      chargeId: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      locationId: {
        type: Sequelize.BIGINT
      },
      enabledCurrencies: {
        type: Sequelize.STRING
      },
      timeZone: {
        type: Sequelize.STRING
      },
      primaryLocale: {
        type: Sequelize.STRING
      },
      active: {
        type: Sequelize.BOOLEAN
      },
      shopifyHost: {
        type: Sequelize.STRING
      },
      lattitude: {
        type: Sequelize.STRING
      },
      longitude: {
        type: Sequelize.STRING
      },
      serviceId: {
        type: Sequelize.BIGINT
      },
      closed: {
        type: Sequelize.BOOLEAN
      },
      trialDays: {
        type: Sequelize.INTEGER
      },
      timeZoneOffset: {
        type: Sequelize.STRING
      },
      firstLoad: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stores');
  }
};