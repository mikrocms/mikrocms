const fs = require('fs').promises;
const path = require('path');

/**
 * Module builder.
 *
 * @return  object
 */
module.exports = function ModulexBuilder() {
  const config = {
    module_name: null,
    root_path: null,
    packagejson_path: null,
    description: null,
    repository: null,
    author: null,
    packagejson: null,
    indexjs_path: null,
    indexjs: null,
    database_path: null,
    database: null,
    schema_path: null,
    schema: null,
    model_path: null,
    model: null,
    locale_path: null,
    locale: null,
    view_path: null,
    view: null,
    middleware_path: null,
    middleware: null,
    router_path: null,
    router: null,
    service_path: null,
    service: null,
    public_path: null,
    public: null
  };

  /**
   * Check is module createdable.
   *
   * @param   string
   * @return  object
   */
  async function isCreatedable(moduleName) {
    const result = {
      status: false,
      message: null
    };
  
    config.module_name = moduleName;
    config.root_path = path.resolve(`${process.cwd()}/${moduleName}`);
    config.packagejson_path = path.resolve(`${config.root_path}/package.json`);
  
    try {
      await fs.access(config.root_path);
  
      result.message = [
        '\x1b[31m%s\x1b[0m',
        `Directory with "${moduleName}" was exists, please chose other module name.`
      ];
    } catch (err) {
      result.status = true;
    }
  
    return result;
  }

  /**
   * Update file packagejson.
   *
   * @return  void
   */
  async function updatePackagejson() {
    console.log(`update file package.json, writeFile "${config.packagejson_path}"`);

    await fs.writeFile(
      config.packagejson_path,
      JSON.stringify(config.packagejson, null, 2),
      'utf8'
    );
  }

  /**
   * Update file indexjs.
   *
   * @return  void
   */
  async function updateIndexjs() {
    console.log(`update file index.js, writeFile "${config.indexjs_path}"`);

    let indexjs = '';

    if (config.indexjs.database) {
      indexjs += `  'database': require('./databases'),\n`;
    }

    if (config.indexjs.schema) {
      indexjs += `  'schema': require('./schemas'),\n`;
    }

    if (config.indexjs.model) {
      indexjs += `  'model': require('./models'),\n`;
    }

    if (config.indexjs.locale) {
      indexjs += `  'locale': require('./locales'),\n`;
    }

    if (config.indexjs.view) {
      indexjs += `  'view': require('./views'),\n`;
    }

    if (config.indexjs.middleware) {
      indexjs += `  'middleware': require('./middlewares'),\n`;
    }

    if (config.indexjs.router) {
      indexjs += `  'router': require('./routers'),\n`;
    }

    if (config.indexjs.service) {
      indexjs += `  'service': require('./services'),\n`;
    }

    if (config.indexjs.public) {
      indexjs += `  'public': require('./publics'),\n`;
    }

    await fs.writeFile(
      config.indexjs_path,
      `module.exports = {\n${indexjs}};\n`,
      'utf8'
    );
  }

  /**
   * Update file database.
   *
   * @param   string
   * @return  void
   */
  async function updateDatabase(connectionName) {
    console.log(`make databases directory, mkdir "${config.database_path}"`);
    await fs.mkdir(config.database_path, { recursive: true });

    let databases = '';

    for (var index in config.indexjs.database) {
      databases += `  '${index}': require('./${index.replaceAll('_', '-')}'),\n`;

      if (index === connectionName) {
        const databaseConnectionPath = path.resolve(`${config.database_path}/${index.replaceAll('_', '-')}.js`);

        console.log(`update file connection, writeFile "${databaseConnectionPath}"`);

        await fs.writeFile(
          databaseConnectionPath,
          `module.exports = ${JSON.stringify(config.indexjs.database[index], null, 2)};\n`,
          'utf8'
        );
      }
    }

    const databaseIndexjsPath = path.resolve(`${config.database_path}/index.js`);

    console.log(`update file index.js, writeFile "${databaseIndexjsPath}"`);

    await fs.writeFile(
      databaseIndexjsPath,
      `module.exports = {\n${databases}};\n`,
      'utf8'
    );
  }

  /**
   * Update file schema.
   *
   * @param   string
   * @return  void
   */
  async function updateSchema(schemaName) {
    console.log(`make schemas directory, mkdir "${config.schema_path}"`);
    await fs.mkdir(config.schema_path, { recursive: true });

    let schemas = '';

    for (var index in config.indexjs.schema) {
      schemas += `
  '${index}': {
    'connection': '${config.indexjs.schema[index].connection}',
    'structure': require('./${index.replaceAll('_', '-')}'),
  },`;

      if (index === schemaName) {        
        const schemaStructurePath = path.resolve(`${config.schema_path}/${index.replaceAll('_', '-')}.js`);

        console.log(`update file structure, writeFile "${schemaStructurePath}"`);

        await fs.writeFile(
          schemaStructurePath,
          config.indexjs.schema[index].structure,
          'utf8'
        );
      }
    }

    const schemaIndexjsPath = path.resolve(`${config.schema_path}/index.js`);

    console.log(`update file index.js, writeFile "${schemaIndexjsPath}"`);

    await fs.writeFile(
      schemaIndexjsPath,
      `module.exports = {${schemas}\n};\n`,
      'utf8'
    );
  }

  /**
   * Update file model.
   *
   * @param   string
   * @return  void
   */
  async function updateModel(modelName) {
    console.log(`make models directory, mkdir "${config.model_path}"`);
    await fs.mkdir(config.model_path, { recursive: true });

    let models = '';

    for (var index in config.indexjs.model) {
      models += `  '${index}': require('./${index.replaceAll('_', '-')}'),\n`;

      if (index === modelName) {
        const modelContentPath = path.resolve(`${config.model_path}/${index.replaceAll('_', '-')}.js`);

        console.log(`update file model, writeFile "${modelContentPath}"`);

        await fs.writeFile(
          modelContentPath,
          config.indexjs.model[index],
          'utf8'
        );
      }
    }

    const modelIndexjsPath = path.resolve(`${config.model_path}/index.js`);

    console.log(`update file index.js, writeFile "${modelIndexjsPath}"`);

    await fs.writeFile(
      modelIndexjsPath,
      `module.exports = {\n${models}};\n`,
      'utf8'
    );
  }

  /**
   * Update file locale.
   *
   * @param   string
   * @return  void
   */
  async function updateLocale(languageCode) {
    console.log(`make locales directory, mkdir "${config.locale_path}"`);
    await fs.mkdir(config.locale_path, { recursive: true });

    let locales = '';

    for (var index in config.indexjs.locale) {
      locales += `  '${index}': require('./${index.replaceAll('_', '-')}'),\n`;

      if (index === languageCode) {
        const localeContentPath = path.resolve(`${config.locale_path}/${index.replaceAll('_', '-')}.js`);

        console.log(`update file locale, writeFile "${localeContentPath}"`);

        const sortedLocales =
          Object.keys(config.indexjs.locale[index])
            .sort()
            .reduce((result, key) => {
              result[key] = config.indexjs.locale[index][key];

              return result;
            }, {});

        await fs.writeFile(
          localeContentPath,
          `module.exports = ${JSON.stringify(sortedLocales, null, 2)};\n`,
          'utf8'
        );
      }
    }

    const localeIndexjsPath = path.resolve(`${config.locale_path}/index.js`);

    console.log(`update file index.js, writeFile "${localeIndexjsPath}"`);

    await fs.writeFile(
      localeIndexjsPath,
      `module.exports = {\n${locales}};\n`,
      'utf8'
    );
  }

  /**
   * Update file middleware.
   *
   * @param   string
   * @return  void
   */
  async function updateMiddleware(middlewareName) {
    console.log(`make middlewares directory, mkdir "${config.middleware_path}"`);
    await fs.mkdir(config.middleware_path, { recursive: true });

    let middlewares = '';

    for (var index in config.indexjs.middleware) {
      middlewares += `  '${index}': require('./${index.replaceAll('_', '-')}'),\n`;

      if (index === middlewareName) {
        const middlewareContentPath = path.resolve(`${config.middleware_path}/${index.replaceAll('_', '-')}.js`);

        console.log(`update file middleware, writeFile "${middlewareContentPath}"`);

        await fs.writeFile(
          middlewareContentPath,
          config.indexjs.middleware[index],
          'utf8'
        );
      }
    }

    const middlewareIndexjsPath = path.resolve(`${config.middleware_path}/index.js`);

    console.log(`update file index.js, writeFile "${middlewareIndexjsPath}"`);

    await fs.writeFile(
      middlewareIndexjsPath,
      `module.exports = {\n${middlewares}};\n`,
      'utf8'
    );
  }

  /**
   * Update file middleware.
   *
   * @param   string
   * @return  void
   */
  async function updateMiddleware(middlewareName) {
    console.log(`make middlewares directory, mkdir "${config.middleware_path}"`);
    await fs.mkdir(config.middleware_path, { recursive: true });

    let middlewares = '';

    for (var index in config.indexjs.middleware) {
      middlewares += `  '${index}': require('./${index.replaceAll('_', '-')}'),\n`;

      if (index === middlewareName) {
        const middlewareContentPath = path.resolve(`${config.middleware_path}/${index.replaceAll('_', '-')}.js`);

        console.log(`update file middleware, writeFile "${middlewareContentPath}"`);

        await fs.writeFile(
          middlewareContentPath,
          config.indexjs.middleware[index],
          'utf8'
        );
      }
    }

    const middlewareIndexjsPath = path.resolve(`${config.middleware_path}/index.js`);

    console.log(`update file index.js, writeFile "${middlewareIndexjsPath}"`);

    await fs.writeFile(
      middlewareIndexjsPath,
      `module.exports = {\n${middlewares}};\n`,
      'utf8'
    );
  }

  /**
   * Update file router.
   *
   * @return  void
   */
  async function updateRouter() {
    console.log(`update file routers.js, writeFile "${config.router_path}"`);

    await fs.writeFile(
      config.router_path,
      `module.exports = ${JSON.stringify(config.indexjs.router, null, 2)};\n`,
      'utf8'
    );
  }

  /**
   * Update file service.
   *
   * @param   number
   * @param   string
   * @param   string
   * @return  void
   */
  async function updateService(routerIndex, endpoint, httpMethod) {
    console.log(`make service directory, mkdir "${config.service_path}"`);
    await fs.mkdir(config.service_path, { recursive: true });

    let services = '';

    for (var rIndex in config.indexjs.service) {
      const r = config.indexjs.service[rIndex];
      const rEndpointRouter = Array.isArray(r.router) ? r.router[1] : r.router;

      services +=
`  {
    'router': ${JSON.stringify(r.router)},
    'handler': {\n`;

      for (var hEndpoint in r.handler) {
        services += `      '${hEndpoint}': {\n`;

        for (var hHttpMethod in r.handler[hEndpoint]) {
          const serviceName = path.resolve(`${rEndpointRouter}${hEndpoint}-${hHttpMethod}`)
                               .substr(1)
                               .replaceAll(/[\/:]/g, '-')
                               .replaceAll(/[-]+/g, '-');

          services += `        '${hHttpMethod}': require('./${serviceName.replaceAll('_', '-')}'),\n`;

          if (rIndex == routerIndex && hEndpoint == endpoint && hHttpMethod == httpMethod) {
            const serviceContentPath = path.resolve(`${config.service_path}/${serviceName.replaceAll('_', '-')}.js`);

            console.log(`update file service, writeFile "${serviceContentPath}"`);

            await fs.writeFile(
              serviceContentPath,
              r.handler[hEndpoint][hHttpMethod],
              'utf8'
            );
          }
        }

        services += `      },\n`;
      }

      services +=
`    },
  },\n`;
    }

    const serviceIndexjsPath = path.resolve(`${config.service_path}/index.js`);

    console.log(`update file index.js, writeFile "${serviceIndexjsPath}"`);

    await fs.writeFile(
      serviceIndexjsPath,
      `module.exports = [\n${services}];\n`,
      'utf8'
    );
  }

  /**
   * Initialization application.
   *
   * @return  void
   */
  async function init() {
    console.log(`make root directory, mkdir "${config.root_path}"`);
    await fs.mkdir(config.root_path, { recursive: true });

    // sources
    const srcPackageJSON = require('../src/module/package.json');

    // content
    config.packagejson = { ...srcPackageJSON };

    // list files path to copies
    const copyFiles = [
      [
        path.resolve(__dirname, '../src/module/.editorconfig'),
        path.resolve(`${config.root_path}/.editorconfig`)
      ],
      [
        path.resolve(__dirname, '../src/module/_gitignore'),
        path.resolve(`${config.root_path}/.gitignore`)
      ],
      [
        path.resolve(__dirname, '../src/module/index.js'),
        path.resolve(`${config.root_path}/index.js`)
      ],
      [
        path.resolve(__dirname, '../src/module/LICENSE'),
        path.resolve(`${config.root_path}/LICENSE`)
      ],
      [
        path.resolve(__dirname, '../src/module/README.md'),
        path.resolve(`${config.root_path}/README.md`)
      ]
    ];

    // package.json
    config.packagejson.name = config.module_name;
    config.packagejson.description = config.description;
    config.packagejson.repository.url = `git+${config.repository}.git`;
    config.packagejson.bugs.url = `${config.repository}/issues`;
    config.packagejson.homepage = `${config.repository}#readme`;
    config.packagejson.author = config.author;

    console.log(`write file package.json, writeFile ${config.packagejson_path}`);

    await updatePackagejson();
  
    for (var fileIndex in copyFiles) {
      console.log('\x1b[32m%s\x1b[0m', 'copy file:');
      console.log(`${copyFiles[fileIndex][0]}\n${copyFiles[fileIndex][1]}`);
      await fs.copyFile(copyFiles[fileIndex][0], copyFiles[fileIndex][1]);
    }
  }

  /**
   * Open current module.
   *
   * @return  boolean
   */
  async function open() {
    const result = {
      status: false,
      message: null
    };

    config.root_path = process.cwd();
    config.packagejson_path = path.resolve(`${config.root_path}/package.json`);
    config.indexjs_path = path.resolve(`${config.root_path}/index.js`);
    config.database_path = path.resolve(`${config.root_path}/databases`);
    config.schema_path = path.resolve(`${config.root_path}/schemas`);
    config.model_path = path.resolve(`${config.root_path}/models`);
    config.locale_path = path.resolve(`${config.root_path}/locales`);
    config.view_path = path.resolve(`${config.root_path}/views`);
    config.middleware_path = path.resolve(`${config.root_path}/middlewares`);
    config.router_path = path.resolve(`${config.root_path}/routers.js`);
    config.service_path = path.resolve(`${config.root_path}/services`);
    config.public_path = path.resolve(`${config.root_path}/publics`);

    try {
      config.packagejson = require(config.packagejson_path);
      config.module_name = config.packagejson.name;
      config.description = config.packagejson.description;
      config.repository = config.packagejson.repository;
      config.author = config.packagejson.author;
      config.indexjs = require(config.indexjs_path);

      if (typeof config.indexjs.database === 'undefined') {
        config.indexjs.database = null;
      }

      if (typeof config.indexjs.schema === 'undefined') {
        config.indexjs.schema = null;
      }

      if (typeof config.indexjs.model === 'undefined') {
        config.indexjs.model = null;
      }

      if (typeof config.indexjs.locale === 'undefined') {
        config.indexjs.locale = null;
      }

      if (typeof config.indexjs.view === 'undefined') {
        config.indexjs.view = null;
      }

      if (typeof config.indexjs.middleware === 'undefined') {
        config.indexjs.middleware = null;
      }

      if (typeof config.indexjs.router === 'undefined') {
        config.indexjs.router = null;
      }

      if (typeof config.indexjs.service === 'undefined') {
        config.indexjs.service = null;
      }

      if (typeof config.indexjs.public === 'undefined') {
        config.indexjs.public = null;
      }

      result.status = true;
    } catch (err) {
      result.message = err;
    }

    return result;
  }

  return {
    config,
    isCreatedable,
    updatePackagejson,
    updateIndexjs,
    updateDatabase,
    updateSchema,
    updateModel,
    updateLocale,
    updateMiddleware,
    updateRouter,
    updateService,
    init,
    open
  };
};
