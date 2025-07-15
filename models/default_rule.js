'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class default_rule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  default_rule.init({
    storeId: DataTypes.BIGINT,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'default_rule',
  });
  return default_rule;
};