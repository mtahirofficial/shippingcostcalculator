'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class webhook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  webhook.init({
    userId: DataTypes.INTEGER,
    storeId: DataTypes.BIGINT,
    webhookId: DataTypes.BIGINT,
    name: DataTypes.STRING,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'webhook',
  });
  return webhook;
};