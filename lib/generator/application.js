const cli = require('../cli');
const message = require('./message');

/**
 * Application generator.
 *
 * @param   object    application builder
 * @param   object
 * @return  objext
 */
module.exports = function ApplicationGenerator(application, rl) {
  /**
   * Ask application name.
   *
   * @return  void
   */
  async function askAppName() {
    const inputAppName = await cli.askInput(rl, 'application name: ');
    const execCreatedable = await application.isCreatedable(inputAppName);

    if (!execCreatedable.status) {
      message(execCreatedable);
      await askAppName();
    }
  }

  /**
   * Ask application mode.
   *
   * @return  void
   */
  async function askAppMode() {
    const inputAppMode = await cli.askInput(rl, 'using docker (yes): ');
    const execDockerable = await application.isDockerable(inputAppMode);

    if (!execDockerable.status) {
      message(execDockerable);
      await askAppMode();
    }
  }

  return {
    askAppName,
    askAppMode
  };
};
