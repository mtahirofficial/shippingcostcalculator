const { DEFAULT_AVATAR } = require("../constants");
const { Service } = require("../core");
const bcrypt = require("bcrypt");
const { NotFoundException } = require("../exceptions");
const models = require("../models");
const { Op } = require("sequelize");

class ZoneService extends Service {
  async createZone(zone) {
    try {
      return await models.zone.create({
        ...zone
      });
    } catch (e) {
      // [ 'name', 'errors', 'parent', 'original', 'fields', 'sql' ] error keys
      console.log(Object.keys(e));
      console.log(e.message);
      throw new Error(e.name);
    }
  }
  async updateZone(zone, column, value) {
    try {
      return await models.zone.update(
        { ...zone },
        {
          logging: false,
          where: {
            [column]: value
          }
        }
      );
    } catch (e) {
      // [ 'name', 'errors', 'parent', 'original', 'fields', 'sql' ] error keys
      console.log(Object.keys(e));
      console.log(e.parent);
      throw new Error(e.name);
    }
  }

  async getZones(userId, shopId) {
    try {

      return await models.zone.findAll({
        where: { [Op.and]: { "userId": userId, "storeId": shopId } }
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async deleteZone(id) {
    try {

      return await models.zone.destroy({
        where: { id: id }
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getZonesAndRates(storeId) {
    try {

      return await models.zone.findAll({
        include: [{
          model: models.rate,
          include: [{
            model: models.range
          }]
        }],
        where: { [Op.and]: { "storeId": storeId } },
        order: [['id', 'DESC']]
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async getSingleZoneAndRate(id) {
    try {

      return await models.zone.findOne({
        include: [{
          model: models.rate,
          include: [{
            model: models.range
          }]
        }],
        where: { id }
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getZoneById(id) {
    try {
      const zone = await models.zone.findOne({ "where": { id } });

      if (!zone) {
        throw new NotFoundException(`Zone with id ${id} not found`);
      }
      return zone;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

module.exports = new ZoneService();
