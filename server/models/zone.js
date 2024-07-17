'use strict';
const { Model } = require('sequelize');
const groupedStates = require("../data/states.json");
const countriesList = require("../data/countries.json");

module.exports = (sequelize, DataTypes) => {
  class zone extends Model {
    static associate(models) {
      this.hasMany(models.rate)
    }
  };
  zone.init({
    key: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    storeId: DataTypes.BIGINT,
    name: DataTypes.STRING,
    desc: DataTypes.STRING,
    price: DataTypes.INTEGER,
    status: DataTypes.STRING,
    states: {
      type: DataTypes.TEXT,
      get() {
        let states = [];
        const statesStr = this.getDataValue('states')
        if (statesStr) {
          states = groupedStates.filter(g => statesStr.includes(`${g.value}.`));
          const codes = statesStr.split(',')
          for (const c of states) {
            c.options = c.options.filter(o => codes.includes(o.value))
          }
        }
        return states;
      },
      set(states) {
        let valuesList = [];
        if (states) {
          states.forEach(item => {
            valuesList.push(item.value);
          });
        }
        this.setDataValue('states', valuesList.join(","));
      }
    },
    countries: {
      type: DataTypes.TEXT,
      get() {
        let countries = [];
        if (this.getDataValue('countries')) {
          countries = countriesList.filter(country => this.getDataValue('countries').split(",").indexOf(country.value) !== -1);
        }
        return countries;
      },
      set(countries) {
        if (countries) {
          countries = countries.map(country => country.value).join(",")
        }
        this.setDataValue('countries', countries);
      }
    }
  }, {
    hooks: true,
    sequelize,
    modelName: 'zone',
  });

  // Hook for before creating a new record
  zone.beforeCreate(async (u, options) => {
    // Find the most recent record
    const recent = await zone.findOne({
      order: [['createdAt', 'DESC']], // Assuming you have a createdAt column
      attributes: ['key'], // Only select the key column
      raw: true, // Return plain JavaScript objects
    });
    // Increment the key value of the most recent record
    const incrementedKey = recent ? recent.key + 1 : 1;
    // Set the incremented key for the new record
    u.key = incrementedKey;
  });

  return zone;
};