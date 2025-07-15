'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class plans extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.features, { through: models.plansfeatures });
      this.hasMany(models.store, { foreignKey: 'activePlan' });
    }
  }
  plans.init({
    name: DataTypes.STRING,
    handle: DataTypes.STRING,
    price: DataTypes.STRING,
    interval: DataTypes.STRING,
    rules: DataTypes.INTEGER,
    price_ranges: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'plans',
  });
  return plans;
};