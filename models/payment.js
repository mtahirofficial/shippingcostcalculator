'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  payment.init({
    chargeId: DataTypes.STRING,
    name: DataTypes.STRING,
    status: DataTypes.STRING,
    storeId: DataTypes.BIGINT,
    paymentCreatedAt: DataTypes.DATE,
    paymentUpdatedAt: DataTypes.DATE,
    paymentCancelledOn: DataTypes.DATE,
    currency: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'payment',
  });
  return payment;
};