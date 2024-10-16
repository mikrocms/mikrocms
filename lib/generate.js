const libs = require('./libs');
const cli = require('./cli');
const editor = require('./editor');
const generator = require('./generator');
const builder = require('./builder');

/**
 * Generate a new application.
 *
 * @return  void
 */
async function application() {
  const rl = cli.readlines();

  const applicationBuilder = builder.application();
  const applicationGenerator = generator.application(applicationBuilder, rl);

  try {
    await applicationGenerator.askAppName();
    await applicationGenerator.askAppMode();
    await applicationBuilder.init();
  } catch (err) {
    console.error(err);
  }

  rl.close();
};

/**
 * Generate a new module.
 *
 * @return  void
 */
async function modulex() {
  const rl = cli.readlines();

  const modulexBuilder = builder.modulex();
  const modulexGenerator = generator.modulex(modulexBuilder, rl);

  try {
    await modulexGenerator.askModuleName();
    await modulexGenerator.askDescription();
    await modulexGenerator.askRepository();
    await modulexGenerator.askAuthor();
    await modulexBuilder.init();
  } catch (err) {
    console.error(err);
  }

  rl.close();
}

/**
 * Modified application environment.
 *
 * @param   string
 * @param   string
 * @return  void
 */
async function env(x, environment) {
  if (!environment) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'no environment name!'
    );

    return;
  }

  const applicationBuilder = builder.application();

  try {
    const opened = await applicationBuilder.open();

    if (opened.status) {
      const selectedEnv = applicationBuilder.config.mikrocmsjs.env[environment] || '';
      const writeEnv = await editor.open(
                        '.temp.mikrocms.env.json',
                        `{"${environment}": ${typeof selectedEnv === 'object' ? JSON.stringify(selectedEnv, null, 2) : ''}}`,
                        true,
                        true
                      );
      const resultEnv = JSON.parse(writeEnv);

      applicationBuilder.config.mikrocmsjs.env[environment] = resultEnv[environment];

      await applicationBuilder.updateMikrocmsjs();
    } else {
      throw new Error(opened.message);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Modified module database.
 *
 * @param   string
 * @param   string
 * @return  void
 */
async function database(x, connectionName) {
  if (!connectionName) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'no connection name!'
    );

    return;
  }

  const modulexBuilder = builder.modulex();

  try {
    const opened = await modulexBuilder.open();

    if (opened.status) {
      const defaultDB =
`{
  "database": "name_of_database",
  "username": "username_of_user",
  "password": "password_of_user",
  "sequelize": {
    "host": "hostname",
    "port": "port",
    "dialect": "mysql"
  }
}`;

      const selectedDB = modulexBuilder.config.indexjs.database?.[connectionName] || defaultDB;
      const writeDB = await editor.open(
                        '.temp.mikrocms.database.json',
                        `{"${connectionName}": ${typeof selectedDB === 'object' ? JSON.stringify(selectedDB, null, 2) : selectedDB}}`,
                        true,
                        true
                      );
      const resultDB = JSON.parse(writeDB);

      if (modulexBuilder.config.indexjs.database === null) {
        modulexBuilder.config.indexjs.database = {};
      }

      modulexBuilder.config.indexjs.database[connectionName] = resultDB[connectionName];

      await modulexBuilder.updateDatabase(connectionName);
      await modulexBuilder.updateIndexjs();
    } else {
      throw new Error(opened.message);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Modified module schema.
 *
 * @param   string
 * @param   string
 * @param   string
 * @return  void
 */
async function schema(x, schemaName, connectionName) {
  if (!schemaName) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'no schema name!'
    );

    return;
  }

  if (!connectionName) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'no connection name!'
    );

    return;
  }

  const modulexBuilder = builder.modulex();

  try {
    const opened = await modulexBuilder.open();

    if (opened.status) {
      const defaultStructure =
`function (sequelize) {
  return {
    attributes: {
      // defining the fields of the model
    },
    options: {
      tableName: 'name_of_table',
      // other Sequelize schema options
    }
  };
}\n`;

      const selectedStructure = (modulexBuilder.config.indexjs.schema?.[schemaName] || null)?.structure || defaultStructure;
      const writeStructure = await editor.open(
                             '.temp.mikrocms.schema.js',
                             `module.exports = ${typeof selectedStructure === 'function' ? selectedStructure.toString() : selectedStructure}`,
                             true,
                             true
                            );

      if (modulexBuilder.config.indexjs.schema === null) {
        modulexBuilder.config.indexjs.schema = {};
      }

      modulexBuilder.config.indexjs.schema[schemaName] = {
        'connection': connectionName,
        'structure': writeStructure
      };

      await modulexBuilder.updateSchema(schemaName);
      await modulexBuilder.updateIndexjs();
    } else {
      throw new Error(opened.message);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Modified module model.
 *
 * @param   string
 * @param   string
 * @return  void
 */
async function model(x, modelName) {
  if (!modelName) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'no model name!'
    );

    return;
  }

  const modulexBuilder = builder.modulex();

  try {
    const opened = await modulexBuilder.open();

    if (opened.status) {
      const defaultModel =
`function ${libs.toCamelCase('model_' + modelName)}({ env, db, schema, model }) {
  function migration() {
    // Define migrations here
  }

  return {
    migration,
    // other model methods
  };
};\n`;

      const selectedModel = modulexBuilder.config.indexjs.model?.[modelName] || defaultModel;
      const writeModel = await editor.open(
                             '.temp.mikrocms.model.js',
                             `module.exports = ${typeof selectedModel === 'function' ? selectedModel.toString() : selectedModel}`,
                             true,
                             true
                            );

      if (modulexBuilder.config.indexjs.model === null) {
        modulexBuilder.config.indexjs.model = {};
      }

      modulexBuilder.config.indexjs.model[modelName] = writeModel;

      await modulexBuilder.updateModel(modelName);
      await modulexBuilder.updateIndexjs();
    } else {
      throw new Error(opened.message);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Modified module locale.
 *
 * @param   string
 * @param   string
 * @return  void
 */
async function locale(x, languageCode) {
  if (!languageCode) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'language code is required!'
    );

    return;
  }

  const rl = cli.readlines();

  const modulexBuilder = builder.modulex();

  try {
    const opened = await modulexBuilder.open();

    if (opened.status) {
      if (modulexBuilder.config.indexjs.locale === null) {
        modulexBuilder.config.indexjs.locale = {};
      }

      if (typeof modulexBuilder.config.indexjs.locale[languageCode] === 'undefined') {
        modulexBuilder.config.indexjs.locale[languageCode] = {};
      }

      let askStatus = true;

      while (askStatus) {
        const localeId = await cli.askInput(rl, 'id: ');
        const localeValue = await cli.askInput(rl, 'value: ');

        modulexBuilder.config.indexjs.locale[languageCode][localeId] = localeValue;

        let inputMore = await cli.askInput(rl, 'add more input (yes): ');

        inputMore = inputMore.toLowerCase();

        if (inputMore === 'yes' || inputMore === 'y') {
          askStatus = true;
        } else {
          askStatus = false;
        }
      }

      await modulexBuilder.updateLocale(languageCode);
      await modulexBuilder.updateIndexjs();
    } else {
      throw new Error(opened.message);
    }
  } catch (err) {
    console.error(err);
  }

  rl.close();
}

/**
 * Modified module middleware.
 *
 * @param   string
 * @param   string
 * @return  void
 */
async function middleware(x, middlewareName) {
  if (!middlewareName) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'no middleware name!'
    );

    return;
  }

  const modulexBuilder = builder.modulex();

  try {
    const opened = await modulexBuilder.open();

    if (opened.status) {
      const defaultMiddleware =
`function ${libs.toCamelCase('middleware_' + middlewareName)}({ env, model, locale, middleware }) {
  return [
    // all handler methods
  ];
};\n`;

      const selectedMiddleware = modulexBuilder.config.indexjs.middleware?.[middlewareName] || defaultMiddleware;
      const writeMiddleware = await editor.open(
        '.temp.mikrocms.middleware.js',
        `module.exports = ${typeof selectedMiddleware === 'function' ? selectedMiddleware.toString() : selectedMiddleware}`,
        true,
        true
      );

      if (modulexBuilder.config.indexjs.middleware === null) {
        modulexBuilder.config.indexjs.middleware = {};
      }

      modulexBuilder.config.indexjs.middleware[middlewareName] = writeMiddleware;

      await modulexBuilder.updateMiddleware(middlewareName);
      await modulexBuilder.updateIndexjs();
    } else {
      throw new Error(opened.message);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Modified module router.
 *
 * @param   string
 * @param   string
 * @return  void
 */
async function router(x, endpoint) {
  if (!endpoint) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'no router endpoint!'
    );

    return;
  }

  const modulexBuilder = builder.modulex();

  try {
    const opened = await modulexBuilder.open();

    if (opened.status) {
      const selectedRouter = modulexBuilder.config.indexjs.router?.[endpoint] || '[\n  // "middleware name" or ["module name", "middleware name"]\n]';
      const writeRouter = await editor.open(
                        '.temp.mikrocms.router.json',
                        `{"${endpoint}": ${typeof selectedRouter === 'object' ? JSON.stringify(selectedRouter, null, 2) : selectedRouter}}`,
                        true,
                        true
                      );
      const resultRouter = JSON.parse(writeRouter);

      if (modulexBuilder.config.indexjs.router === null) {
        modulexBuilder.config.indexjs.router = {};
      }

      modulexBuilder.config.indexjs.router[endpoint] = resultRouter[endpoint];

      await modulexBuilder.updateRouter();
      await modulexBuilder.updateIndexjs();
    } else {
      throw new Error(opened.message);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Modified module service.
 *
 * @param   string
 * @param   string
 * @param   string
 * @param   string
 * @param   string
 * @return  void
 */
async function service(x, httpMethod, endpoint, endpointRouter, moduleRouter = null) {
  if (!httpMethod || !endpoint || !endpointRouter) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'no complete service config {http_method} {endpoint} {endpoint_router} {module_router}!'
    );

    return;
  }

  if (['get', 'post', 'put', 'patch', 'delete'].indexOf(httpMethod) < 0) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'only allowed http method get, post, put, patch or delete!'
    );

    return;
  }

  const modulexBuilder = builder.modulex();

  try {
    const opened = await modulexBuilder.open();

    if (opened.status) {
      const defaultService =
`function ${libs.toCamelCase('service_' + `${endpoint}_${httpMethod}`.replaceAll(/[\/:]/g, '_'))}({ env, model, locale, middleware }) {
  return [
    // all handler methods
  ];
};\n`;

      let selectedRouter = null;
      let selectedRouterIndex = null;

      if (modulexBuilder.config.indexjs.service !== null) {
        for (var rIndex in modulexBuilder.config.indexjs.service) {
          r = modulexBuilder.config.indexjs.service[rIndex];

          if (moduleRouter) {
            if (Array.isArray(r.router)) {
              if (r.router[0] === moduleRouter && r.router[1] === endpointRouter) {
                selectedRouter = r;
                selectedRouterIndex = rIndex;

                break;
              }
            }
          } else {
            if (Array.isArray(r.router)) {
              if (r.router[0] === moduleRouter && r.router[1] === endpointRouter) {
                selectedRouter = r;
                selectedRouterIndex = rIndex;

                break;
              }
            } else if (r.router === endpointRouter) {
              selectedRouter = r;
              selectedRouterIndex = rIndex;

              break;
            }
          }
        }
      }

      let selectedService = null;

      if (selectedRouter) {
        if (selectedRouter.handler[endpoint] && selectedRouter.handler[endpoint][httpMethod]) {
          selectedService = selectedRouter.handler[endpoint][httpMethod];
        } else {
          selectedService = defaultService;
        }
      } else {
        selectedService = defaultService;
      }

      const writeService = await editor.open(
        '.temp.mikrocms.service.js',
        `module.exports = ${typeof selectedService === 'function' ? selectedService.toString() : selectedService}`,
        true,
        true
      );

      if (modulexBuilder.config.indexjs.service === null) {
        modulexBuilder.config.indexjs.service = [];
      }

      if (selectedRouter === null) {
        selectedRouterIndex = modulexBuilder.config.indexjs.service.length;
        modulexBuilder.config.indexjs.service[selectedRouterIndex] = {
          router: moduleRouter ? [moduleRouter, endpointRouter] : endpointRouter,
          handler: {
            [endpoint]: {
              [httpMethod]: writeService
            }
          }
        }
      } else {
        if (modulexBuilder.config.indexjs.service[selectedRouterIndex].handler[endpoint]) {
          modulexBuilder.config.indexjs
            .service[selectedRouterIndex]
            .handler[endpoint][httpMethod] = writeService;
        } else {
          modulexBuilder.config.indexjs
            .service[selectedRouterIndex]
            .handler[endpoint] = { [httpMethod]: writeService };
        }
      }

      await modulexBuilder.updateService(
        selectedRouterIndex,
        endpoint,
        httpMethod
      );
      await modulexBuilder.updateIndexjs();
    } else {
      throw new Error(opened.message);
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  application,
  modulex,
  env,
  database,
  schema,
  model,
  locale,
  middleware,
  router,
  service
};
