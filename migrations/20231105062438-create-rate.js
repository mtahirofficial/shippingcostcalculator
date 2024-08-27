'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rates', {
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
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      shipTo: {
        type: Sequelize.STRING
      },
      shipToValue: {
        type: Sequelize.STRING
      },
      chargeBy: {
        type: Sequelize.STRING
      },
      zoneId: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.STRING
      },
      unit: {
        type: Sequelize.STRING
      },
      priceBy: {
        type: Sequelize.STRING
      },
      xQty: {
        type: Sequelize.BOOLEAN,
        defaultVAlue: false
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
    await queryInterface.dropTable('rates');
  }
};