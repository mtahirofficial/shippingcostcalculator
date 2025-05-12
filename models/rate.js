'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class rate extends Model {
    static associate(models) {
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
      type: DataTypes.TEXT,
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
    modifiedCodes: {
      type: DataTypes.TEXT,
      get() {
        let modifiedCodes = null;
        if (this.getDataValue('modifiedCodes')) {
          modifiedCodes = this.getDataValue('modifiedCodes').split(",")
        }
        return modifiedCodes;
      },
      set(modifiedCodes) {
        let codes = null;
        if (modifiedCodes && modifiedCodes instanceof Array) {
          codes = modifiedCodes.filter(code => !(code?.includes("*") || code?.includes(">"))).map(c => c?.replace(/\s+/g, "").replace(/-+/g, ""))
        }
        this.setDataValue('modifiedCodes', codes ? codes.join(",") : codes);
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