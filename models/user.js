'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init({
    key: DataTypes.INTEGER,
    storeId: DataTypes.BIGINT,
    email: DataTypes.STRING,
    password: DataTypes.TEXT,
    refreshToken: DataTypes.TEXT,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    fullName: DataTypes.STRING,
    userName: DataTypes.STRING,
    phone: DataTypes.STRING,
    otp: DataTypes.STRING,
    confirmCode: DataTypes.STRING,
    role: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    storeId: DataTypes.BIGINT,
    avatarUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });

  // Hook for before creating a new record
  user.beforeCreate(async (u, options) => {
    // Find the most recent record
    const recent = await user.findOne({
      order: [['createdAt', 'DESC']], // Assuming you have a createdAt column
      attributes: ['key'], // Only select the key column
      raw: true, // Return plain JavaScript objects
    });
    // Increment the key value of the most recent record
    const incrementedKey = recent ? recent.key + 1 : 1;
    // Set the incremented key for the new record
    u.key = incrementedKey;
  });

  return user;
};