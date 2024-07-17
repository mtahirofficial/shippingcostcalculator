const { Service } = require("../core");
const { NotFoundException } = require("../exceptions");
const models = require("../models")

class WebhookService extends Service {
  // async findByPK(id) {
  //   try {
  //     const { data, error } = await supabase
  //       .from("webhooks")
  //       .select("*")
  //       .eq("id", id)
  //       .single()

  //     if (error) {
  //       throw error
  //     }

  //     return data

  //   } catch (error) {
  //     console.log(error);
  //     throw new Error(error.message)
  //   }
  // }
  // async findAll(column, value) {
  //   try {
  //     const { data, error } = await supabase
  //       .from("webhooks")
  //       .select("*")
  //       .eq(column, value)

  //     if (error) {
  //       throw error
  //     }

  //     return data

  //   } catch (error) {
  //     console.log(error);
  //     throw new Error(error.message)
  //   }
  // }
  // async findOne(column, value) {
  //   try {
  //     const { data, error } = await supabase
  //       .from("webhooks")
  //       .select("*")
  //       .eq(column, value)
  //       .single()

  //     if (error) {
  //       throw error
  //     }

  //     return data

  //   } catch (error) {
  //     console.log(error);
  //     throw new Error(error.message)
  //   }
  // }

  async delete(column, value) {
    try {
      const { error } = await models.webhook.destroy({ where: { [column]: value } })

      if (error) {
        throw error
      }

    } catch (error) {
      console.log(error);
      throw new Error(error.message)
    }
  }
}

module.exports = new WebhookService();
