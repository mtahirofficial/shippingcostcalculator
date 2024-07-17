'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class rate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.zone)
      this.hasMany(models.range)
    }
  };
  rate.init({
    key: DataTypes.INTEGER,
    zoneId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    storeId: DataTypes.BIGINT,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    shipTo: DataTypes.STRING,
    shipToValue: {
      type: DataTypes.STRING,
      get() {
        let shipToValue = null;
        if (this.getDataValue('shipToValue')) {
          shipToValue = this.getDataValue('shipToValue').split(",");
        }
        return shipToValue;
      },
      set(shipToValue) {
        if (shipToValue) {
          shipToValue = shipToValue.join(",")
        }
        this.setDataValue('shipToValue', shipToValue);
      }
    },
    chargeBy: DataTypes.STRING,
    status: DataTypes.STRING,
    price: DataTypes.STRING,
    unit: DataTypes.STRING,
    priceBy: DataTypes.STRING,
    xQty: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'rate',
  });

  // Hook for before creating a new record
  rate.beforeCreate(async (u, options) => {
    // Find the most recent record
    const recent = await rate.findOne({
      order: [['createdAt', 'DESC']], // Assuming you have a createdAt column
      attributes: ['key'], // Only select the key column
      raw: true, // Return plain JavaScript objects
    });
    // Increment the key value of the most recent record
    const incrementedKey = recent ? recent.key + 1 : 1;
    // Set the incremented key for the new record
    u.key = incrementedKey;
  });

  return rate;
};