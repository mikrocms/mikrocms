const fs = require('fs').promises;
const path = require('path');
const libs = require('../libs');
const sequelize = require('sequelize');

/**
 * CRUD builder.
 *
 * @param   object
 * @return  object
 */
module.exports = function CRUDxBuilder(modulex) {
  const config = {
    crud_path: null,
    crud: null
  };

  /**
   * Create a new model or replace exsiting model.
   *
   * @param   string
   * @return  void
   */
  async function updateModel(schemaName) {
    try {
      // mikrocms schema
      const schema = modulex.config.indexjs.schema[schemaName].structure(sequelize);

      // mikrocms crud
      const configCrud = {
        create: true,
        read: true,
        update: true,
        delete: true
      };

      if (config.crud[schemaName].crud instanceof Object) {
        configCrud.create = config.crud[schemaName].crud.create || true;
        configCrud.read = config.crud[schemaName].crud.read || true;
        configCrud.update = config.crud[schemaName].crud.update || true;
        configCrud.delete = config.crud[schemaName].crud.delete || true;
      }

      // content model
      let contentModel = await fs.readFile(
                            path.resolve(__dirname, '../src/crud/model.js'),
                            'utf8'
                          );

      // schemas
      let varMainSchema = libs.toCamelCase(`${schemaName}_schema`);
      let contentSchemas = `const ${varMainSchema} = schema('${schemaName}');\n`;

      for (var itemSchema of config.crud[schemaName].schema) {
        if (Array.isArray(itemSchema)) {
          contentSchemas +=
`  const ${libs.toCamelCase(`${itemSchema[0]}_schema`)} = schema('${itemSchema[0]}', '${itemSchema[1]}');\n`;
        } else {
          contentSchemas +=
`  const ${libs.toCamelCase(`${itemSchema}_schema`)} = schema('${itemSchema}');\n`;
        }
      }

      // migrations
      let contentMigrations = '';

      if (Array.isArray(config.crud[schemaName].migration)) {
        for (var itemMigration of config.crud[schemaName].migration) {
          for (var itemMigrationRelation in itemMigration) {
            const itemMigrationRelationOptions = itemMigration[itemMigrationRelation];

            contentMigrations += `${varMainSchema}.${itemMigrationRelation}(${libs.toCamelCase(`${itemMigrationRelationOptions[0]}_schema`)}, ${JSON.stringify(itemMigrationRelationOptions[1], null, 2)});\n`;
          }
        }
      }

      // attributes
      let varPrimaryKey = '';
      var contentQueriesUpdate = '';
      var contentQueriesRemove = '';

      for (var attrKey in schema.attributes) {
        const attr = schema.attributes[attrKey];

        if (attr.primaryKey) {
          varPrimaryKey = `'${attrKey}'`;
        }

        if (!attr.primaryKey) {
          let options = '';

          if (attr.type instanceof sequelize.DataTypes.STRING ||
            attr.type instanceof sequelize.DataTypes.CHAR ||
            attr.type instanceof sequelize.DataTypes.TEXT ||
            attr.type instanceof sequelize.DataTypes.JSON
          ) {
            options = "[Op.like]: `%${query." + attrKey + "}%`";
          } else {
            options = `[Op.eq]: query.${attrKey}`;
          }

          if (attrKey === 'updated_at') {
            contentQueriesUpdate += `      selected.updated_at = new Date();\n`;
          } else if (attrKey === 'updated_by') {
            contentQueriesUpdate += `      selected.updated_by = newer.updated_by;\n`;
          } else if (attrKey !== 'created_at' && attrKey !== 'created_by' &&
            attrKey !== 'deleted_at' && attrKey !== 'deleted_by'
          ) {
            contentQueriesUpdate += `      selected.${attrKey} = newer.${attrKey} || selected.${attrKey};\n`;
          }

          if (attrKey === 'deleted_at') {
            contentQueriesRemove += `      selected.deleted_at = new Date();\n`;
          } else if (attrKey === 'deleted_by') {
            contentQueriesRemove += '      selected.deleted_by = remover.deleted_by;\n';
          } 
        }
      }

      if (schema.attributes.deleted_at) {
        contentQueriesRemove += '\n      await selected.save();\n';
      } else {
        contentQueriesRemove += '      await selected.destroy();\n';
      }

      // Crud operations
      let contentIncludes = '';

      if (configCrud.read instanceof Object) {
        if (configCrud.read.include) {
          contentIncludes = `        include: ${JSON.stringify(configCrud.read.include, null, 2).replaceAll('\n', '\n        ')},\n`;
        }
      }

      // write content model
      contentModel = contentModel
                      .replaceAll('/* :function */', libs.toCamelCase(`model_${schemaName}`))
                      .replaceAll('/* :schemas */\n', contentSchemas)
                      .replaceAll('    /* :migrations */\n', contentMigrations)
                      .replaceAll('/* :schema_name */', schemaName)
                      .replaceAll(':schema_name', schemaName)
                      .replaceAll(':schema', varMainSchema)
                      .replaceAll('        /* :includes */\n', contentIncludes)
                      .replaceAll(':primary_key', varPrimaryKey)
                      .replaceAll('      /* :queries_update */\n', contentQueriesUpdate)
                      .replaceAll('      /* :queries_remove */\n', contentQueriesRemove)
                      .replaceAll('/* ', '')
                      .replaceAll(' */', '');

      if (modulex.config.indexjs.model === null) {
        modulex.config.indexjs.model = {};
      }

      modulex.config.indexjs.model[schemaName] = contentModel;

      await modulex.updateModel(schemaName);
      await modulex.updateIndexjs();
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Update file crud.
   *
   * @return  void
   */
  async function updateCRUD() {
    console.log(`update file cruds.js, writeFile "${config.crud_path}"`);

    await fs.writeFile(
      config.crud_path,
      `module.exports = ${JSON.stringify(config.crud, null, 2)};\n`,
      'utf8'
    );
  }

  /**
   * Initialization application.
   *
   * @param   string
   * @return  void
   */
  async function init(schemaName) {
    const selectedSchema = config.crud[schemaName];

    await updateModel(schemaName);
  }

  /**
   * Open current crud.
   *
   * @return  boolean
   */
  async function open() {
    const result = {
      status: false,
      message: null
    };

    config.crud_path = path.resolve(`${modulex.config.root_path}/cruds.js`);

    try {
      config.crud = require(config.crud_path);

      result.status = true;
    } catch (err) {
      result.message = err;
    }

    return result;
  }

  return {
    config,
    updateCRUD,
    init,
    open
  };
};
