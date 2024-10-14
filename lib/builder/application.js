const fs = require('fs').promises;
const path = require('path');

/**
 * Application builder.
 *
 * @return  object
 */
module.exports = function ApplicationBuilder() {
  const config = {
    app_name: null,
    root_path: null,
    docker: false,
    app_path: null,
    dockerfile_path: null,
    packagejson_path: null,
    packagejson: null,
    mikrocms: null
  };

  /**
   * Check is application createdable.
   *
   * @param   string
   * @return  object
   */
  async function isCreatedable(appName) {
    const result = {
      status: false,
      message: null
    };

    config.app_name = appName;
    config.root_path = path.resolve(`${process.cwd()}/${appName}`);

    try {
      await fs.access(config.root_path);

      result.message = [
        '\x1b[31m%s\x1b[0m',
        `Directory with "${appName}" was exists, please chose other application name.`
      ];
    } catch (err) {
      result.status = true;
    }

    return result;
  }

  /**
   * Check is application dockerable.
   *
   * @param   string
   * @return  object
   */
  async function isDockerable(appMode) {
    const result = {
      status: true,
      message: null
    };

    appMode = appMode.toLowerCase();

    if (appMode == 'yes' || appMode == 'y') {
      config.docker = true;
      config.app_path = path.resolve(`${config.root_path}/app`);
      config.dockerfile_path = path.resolve(`${config.app_path}/Dockerfile`);
    } else {
      config.docker = false;
      config.app_path = config.root_path;
    }

    config.packagejson_path = path.resolve(`${config.app_path}/package.json`);

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
   * Update file mikrocms.js.
   *
   * @return  void
   */
  async function updateMikrocmsjs() {
    console.log(`update file mikrocms, writeFile "${config.mikrocmsjs_path}"`);

    await fs.writeFile(
      config.mikrocmsjs_path,
      `module.exports = ${JSON.stringify(config.mikrocmsjs, null, 2)};\n`,
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
    const srcPackageJSON = require('../src/application/app/package.json');

    // content
    config.packagejson = { ...srcPackageJSON };

    // list directories path to make
    const mkdirDirectories = [
      path.resolve(`${config.app_path}/bin`),
      path.resolve(`${config.app_path}/public`)
    ];

    // list files path to copies
    const copyFiles = [
      [
        path.resolve(__dirname, '../src/application/app/.editorconfig'),
        path.resolve(`${config.app_path}/.editorconfig`)
      ],
      [
        path.resolve(__dirname, '../src/application/app/.gitignore'),
        path.resolve(`${config.app_path}/.gitignore`)
      ],
      [
        path.resolve(__dirname, '../src/application/app/app.js'),
        path.resolve(`${config.app_path}/app.js`)
      ],
      [
        path.resolve(__dirname, '../src/application/app/mikrocms.js'),
        path.resolve(`${config.app_path}/mikrocms.js`)
      ],
      [
        path.resolve(__dirname, '../src/application/app/LICENSE'),
        path.resolve(`${config.app_path}/LICENSE`)
      ],
      [
        path.resolve(__dirname, '../src/application/app/README.md'),
        path.resolve(`${config.app_path}/README`)
      ],
      [
        path.resolve(__dirname, '../src/application/app/bin/www'),
        path.resolve(`${config.app_path}/bin/www`)
      ],
      [
        path.resolve(__dirname, '../src/application/app/public/.gitignore'),
        path.resolve(`${config.app_path}/public/.gitignore`)
      ]
    ];

    if (config.docker) {
      console.log(`make app directory, mkdir "${config.app_path}"`);
      await fs.mkdir(config.app_path, { recursive: true });

      copyFiles.push([
        path.resolve(__dirname, '../src/application/app/entrypoint.sh'),
        path.resolve(`${config.app_path}/entrypoint.sh`)
      ]);

      copyFiles.push([
        path.resolve(__dirname, '../src/application/Dockerfile'),
        path.resolve(`${config.root_path}/Dockerfile`)
      ]);
    }

    // package.json
    config.packagejson.name = config.app_name;

    console.log(`write file package.json, writeFile ${config.packagejson_path}`);

    await updatePackagejson();

    for (var dirPath of mkdirDirectories) {
      console.log('\x1b[32m%s\x1b[0m', 'make directory:');
      console.log(dirPath);
      await fs.mkdir(dirPath, { recursive: true });
    }

    for (var fileIndex in copyFiles) {
      console.log('\x1b[32m%s\x1b[0m', 'copy file:');
      console.log(`${copyFiles[fileIndex][0]}\n${copyFiles[fileIndex][1]}`);
      await fs.copyFile(copyFiles[fileIndex][0], copyFiles[fileIndex][1]);
    }
  }

  /**
   * Open current application.
   *
   * @return  boolean
   */
  async function open() {
    const result = {
      status: false,
      message: null
    };

    config.root_path = process.cwd();
    config.dockerfile_path = path.resolve(`${config.root_path}/Dockerfile`);

    try {
      await fs.access(config.dockerfile_path);

      config.docker = true;
      config.app_path = path.resolve(`${config.root_path}/app`);
    } catch (err) {
      // is not dockerable
      config.app_path = config.root_path;
    }

    config.packagejson_path = path.resolve(`${config.app_path}/package.json`);
    config.mikrocmsjs_path = path.resolve(`${config.app_path}/mikrocms.js`);

    try {
      config.packagejson = require(config.packagejson_path);
      config.mikrocmsjs = require(config.mikrocmsjs_path);
      config.app_name = config.packagejson.name;

      result.status = true;
    } catch (err) {
      result.message = err;
    }

    return result;
  }

  return {
    config,
    isCreatedable,
    isDockerable,
    updatePackagejson,
    updateMikrocmsjs,
    init,
    open
  };
};
