'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class range extends Model {
    static associate(models) {
      this.belongsTo(models.rate)
    }
  }
  range.init({
    _id: DataTypes.STRING,
    key: DataTypes.INTEGER,
    rateId: DataTypes.INTEGER,
    from: DataTypes.INTEGER,
    upto: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'range',
  });

  // Hook for before creating a new record
  range.beforeCreate(async (r, options) => {
    // Find the most recent record
    const recent = await range.findOne({
      order: [['createdAt', 'DESC']], // Assuming you have a createdAt column
      attributes: ['key'], // Only select the key column
      raw: true, // Return plain JavaScript objects
    });
    // Increment the key value of the most recent record
    const incrementedKey = recent ? recent.key + 1 : 1;
    // Set the incremented key for the new record
    r.key = incrementedKey;
    r.from = recent.from === "" ? null : recent.from
    r.upto = recent.upto === "" ? null : recent.upto
  });

  // Hook for after creating a new record
  range.afterCreate(async (r, options) => {
    // Perform additional actions or updates after creation
    // For example, you can log, send notifications, etc.
  });

  // Hook for before creating a new record
  range.beforeBulkCreate(async (ranges, options) => {
    // Find the most recent record
    const recent = await range.findOne({
      order: [['createdAt', 'DESC']], // Assuming you have a createdAt column
      attributes: ['key'], // Only select the key column
      raw: true, // Return plain JavaScript objects
    });
    // Increment the key value of the most recent record
    let incrementedKey = recent ? recent.key + 1 : 1;
    // Set the incremented key for the new record
    for (const r of ranges) {
      r.key = incrementedKey;
      r.from = r.from === "" ? null : r.from
      r.upto = r.upto === "" ? null : r.upto
      incrementedKey++;
    }
  });

  // Hook for after creating multiple records in a bulk operation
  range.afterBulkCreate(async (r, options) => {
    // Perform additional actions or updates after bulk creation
    // For example, you can log, send notifications, etc.
  });

  return range;
};