const { Op } = require('sequelize');

module.exports = function /* :function */({ env, db, schema, model }) {
  /* :schemas */

  function migration() {
    /* :migrations */
  }

  async function add(data) {
    try {
      /* return await :schema.create(data); */
    } catch (err) {
      console.error(err);

      return null;
    }
  }

  async function select(query) {
    try {
      const options = {
        /* :includes */
        where: {}
      };

      /* :queries_select */

      /* return :schema.findOne(options); */
    } catch (err) {
      console.error(err);

      return null;
    }
  }

  async function list(query, offset = 0, limit = 10) {
    try {
      const options = {
        /* :includes */
        where: {},
        order: [
          /* [:primary_key, query.sort || 'ASC'] */
        ]
      };

      /* :queries_list */

      if (offset !== null) options.offset = offset;
      if (limit !== null) options.limit = limit;

      /* return :schema.findAndCountAll(options); */
    } catch (err) {
      console.error(err);

      return null;
    }
  }

  async function update(selected, newer) {
    try {
      /* :queries_update */

      await selected.save();

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  async function remove(selected, remover) {
    try {
      /* :queries_remove */

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  return {
    migration,
    add,
    select,
    list,
    update,
    remove
  };
};
