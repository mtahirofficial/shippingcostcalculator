const { Service } = require("../core");
const { NotFoundException } = require("../exceptions");
const models = require("../models");
const { Op } = require("sequelize");

class RateService extends Service {
  async createRate(rate) {
    try {

      return await models.rate.create({
        ...rate,
      });
    } catch (e) {
      console.log(e);
      throw new Error(e.message);
    }
  }
  async createBulkRange(ranges) {
    try {
      return await models.range.bulkCreate(ranges);
    } catch (e) {
      console.log(e);
      throw new Error(e.message);
    }
  }
  async getRates(userId, shopId) {
    try {

      return await models.rate.findAll({
        include: [{
          model: models.range
        }],
        where: { [Op.or]: { "userId": userId, "storeId": shopId } }
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getSingleRateAndRange(id) {
    try {

      return await models.rate.findOne({
        include: [{
          model: models.range,
        }],
        where: { id }
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getRateById(id) {
    try {
      const user = await models.rate.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException(`Shipping rate with id ${id} not found`);
      }
      return user;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async updateRate(id, rateUpdate) {
    try {
      return await models.rate.update(
        {
          ...rateUpdate,
        },
        { where: { id } }
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async updateRange(id, rangeUpdate) {
    try {
      return await models.range.update(
        {
          ...rangeUpdate,
        },
        { where: { id } }
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async deleteRate(id) {
    try {

      return await models.rate.destroy({
        where: { id: id }
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async deleteRanges(id) {
    try {

      return await models.range.destroy({
        where: { rateId: id }
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

module.exports = new RateService();
