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
    selected = null,
    queries = null,
    offset = null,
    limit = null,
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

      if (selected !== null) options.attributes = libModel.attributes(selected);
      if (queries !== null) options.where = libModel.where(queries);
      if (offset !== false) options.offset = offset;
      if (limit !== false) options.limit = limit;

      options.where = lib.where(queries);

      /* return await :schema[method](options); */
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
