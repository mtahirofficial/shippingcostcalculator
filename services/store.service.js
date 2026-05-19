const { Service } = require("../core");
const { NotFoundException } = require("../exceptions");
const models = require("../models");
const { Op } = require("sequelize");

class StoreService extends Service {
  async findOne(column, value, excludeAccessToken = true) {
    try {
      const options = {
        where: { [column]: value },
      };
      if (excludeAccessToken) {
        options.attributes = { exclude: ["accessToken"] };
      }
      return await models.store.findOne(options);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async addStore(store) {
    try {
      return await models.store.create({
        ...store,
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async update(store, storeId) {
    try {
      return await models.store.update(
        {
          ...store,
        },
        { where: { storeId } },
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getStore(domain) {
    try {
      const where = {};
      if (domain) {
        where.domain = domain;
      }
      return await models.store.findOne({
        where: { [Op.or]: where },
        attributes: { exclude: ["accessToken"] },
        order: [["id", "DESC"]],
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getAllStore(excludes) {
    try {
      return await models.store.findAll({
        attributes: { exclude: [...excludes] },
        order: [["id", "DESC"]],
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getStoreById(id) {
    try {
      const store = await models.store.findOne({ where: { id: id } });

      if (!store) {
        throw new NotFoundException(`Store with id '${id}' not found`);
      }
      return store;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

module.exports = new StoreService();
