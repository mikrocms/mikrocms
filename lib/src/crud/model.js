const { Op } = require('sequelize');

module.exports = function /* :function */({ env, db, schema, model, lib }) {
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

  async function find({
    queries,
    offset = 0,
    limit = 10,
    sort = 'ASC',
    method = 'findOne'
  }) {
    try {
      const options = {
        /* :includes */
        order: [
          [:primary_key, sort]
        ]
      };

      if (offset !== null) options.offset = offset;
      if (limit !== null) options.limit = limit;

      options.where = lib.where(queries);

      /* return :schema[method](options); */
    } catch (err) {
      console.error(err);

      return null;
    }
  }

  return {
    migration,
    add,
    update,
    remove,
    find
  };
};
