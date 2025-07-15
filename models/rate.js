const ungroupedStates = require("../data/states-ungrouped.json");
const countriesList = require("../data/countries.json");

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
        const shipTo = this.getDataValue('shipTo');
        // console.log("shipTo", shipTo);

        let shipToValue = null;
        if (this.getDataValue('shipToValue')) {
          if (shipTo === "state") {
            shipToValue = ungroupedStates.filter(state => this.getDataValue('shipToValue').split(",").indexOf(state.value) !== -1);
            console.log("shipToValue if", shipToValue);
          } else if (shipTo === "country") {
            shipToValue = countriesList.filter(country => this.getDataValue('shipToValue').split(",").indexOf(country.value) !== -1);
            console.log("shipToValue else if", shipToValue);
          } else {
            shipToValue = this.getDataValue('shipToValue').split(",");
          }
        }
        return shipToValue;
      },
      set(shipToValue) {
        if (Array.isArray(shipToValue)) {
          // Check if first element is an object with a value property
          if (shipToValue.length > 0 && typeof shipToValue[0] === 'object' && shipToValue[0] !== null && 'value' in shipToValue[0]) {
            shipToValue = shipToValue.map(item => item.value).join(",");
          } else {
            shipToValue = shipToValue.join(",");
          }
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
    hooks: {
      // beforeUpdate: (instance, options) => {
      //   console.log("options", options);
      //   const shipTo = instance.shipTo; // new value to be saved
      //   let shipToValue = JSON.parse(instance.shipToValue);
      //   console.log("shipToValue", shipToValue); // Output: "AR.U"
      //   // Do your logic here using both shipTo and shipToValue
      //   // For example:
      //   if (shipToValue) {
      //     if (shipTo === "state" || shipTo === "country") {
      //       // If the shipTo is 'state' or 'country',

      //       const result = shipToValue ? shipToValue?.map(item => item?.value).join(",") : "";
      //       console.log("result", result); // Output: "AR.U"
      //       instance.shipToValue = result;
      //     } else {
      //       shipToValue = shipToValue.join(",")
      //     }
      //   }
      // },
      beforeCreate: async (u, options) => {
        // Find the most recent record
        const recent = await rate.findOne({
          order: [['createdAt', 'DESC']], // Assuming you have a createdAt column
          attributes: ['key'], // Only select the key column
          raw: true, // Return plain JavaScript objects
        });


        // if (u.shipTo === "state" || u.shipTo === "country") {
        //   // If the shipTo is 'state' or 'country',
        //   const arr = [...u.shipToValue];
        //   console.log("u.shipToValue", u.shipToValue); // Output: "AR.U"

        //   const result = arr?.map(item => item?.value).join(",");
        //   console.log("result", result); // Output: "AR.U"
        //   u.shipToValue = result;
        // }



        // Increment the key value of the most recent record
        const incrementedKey = recent ? recent.key + 1 : 1;
        // Set the incremented key for the new record
        u.key = incrementedKey;
      },
    },
    sequelize,
    modelName: 'rate',
  });

  // Hook for before creating a new record
  // rate.beforeCreate(async (u, options) => {
  //   // Find the most recent record
  //   const recent = await rate.findOne({
  //     order: [['createdAt', 'DESC']], // Assuming you have a createdAt column
  //     attributes: ['key'], // Only select the key column
  //     raw: true, // Return plain JavaScript objects
  //   });


  //   // if (u.shipTo === "state" || u.shipTo === "country") {
  //   //   // If the shipTo is 'state' or 'country',
  //   //   const arr = [...u.shipToValue];
  //   //   console.log("u.shipToValue", u.shipToValue); // Output: "AR.U"

  //   //   const result = arr?.map(item => item?.value).join(",");
  //   //   console.log("result", result); // Output: "AR.U"
  //   //   u.shipToValue = result;
  //   // }



  //   // Increment the key value of the most recent record
  //   const incrementedKey = recent ? recent.key + 1 : 1;
  //   // Set the incremented key for the new record
  //   u.key = incrementedKey;
  // });
  // rate.beforeSave((instance, options) => {
  //   const shipTo = instance.shipTo; // new value to be saved
  //   let shipToValue = instance.shipToValue;
  //   // Do your logic here using both shipTo and shipToValue
  //   // For example:
  //   if (shipTo === "state" || shipTo === "country") {
  //     // If the shipTo is 'state' or 'country',
  //     const arr = [...shipToValue];
  //     console.log("shipToValue", shipToValue); // Output: "AR.U"

  //     const result = arr?.map(item => item?.value).join(",");
  //     console.log("result", result); // Output: "AR.U"
  //     u.shipToValue = result;
  //   }
  // });

  return rate;
};