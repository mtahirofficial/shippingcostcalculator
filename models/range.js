'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class range extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.rate)
    }
  }
  range.init({
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
  range.beforeCreate(async (u, options) => {
    // Find the most recent record
    const recent = await range.findOne({
      order: [['createdAt', 'DESC']], // Assuming you have a createdAt column
      attributes: ['key'], // Only select the key column
      raw: true, // Return plain JavaScript objects
    });
    // Increment the key value of the most recent record
    const incrementedKey = recent ? recent.key + 1 : 1;
    // Set the incremented key for the new record
    u.key = incrementedKey;
  });

  // Hook for after creating a new record
  range.afterCreate(async (r, options) => {
    console.log("afterCreate");
    console.log(r);
    // Perform additional actions or updates after creation
    // For example, you can log, send notifications, etc.
  });

  // Hook for before creating a new record
  range.beforeBulkCreate(async (ranges, options) => {
    console.log(options);
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
      console.log("incrementedKey", incrementedKey);
      r.key = incrementedKey;
      incrementedKey++;
    }
  });

  // Hook for after creating multiple records in a bulk operation
  range.afterBulkCreate(async (r, options) => {
    console.log("afterBulkCreate");
    console.log(r);
    // Perform additional actions or updates after bulk creation
    // For example, you can log, send notifications, etc.
  });

  return range;
};