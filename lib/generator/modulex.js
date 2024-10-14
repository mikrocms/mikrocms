const cli = require('../cli');
const message = require('./message');

/**
 * Module generator.
 *
 * @param   object    module builder
 * @param   object
 * @return  object
 */
module.exports = function ModulexGenerator(modulex, rl) {
  /**
   * Ask module name.
   *
   * @return  void
   */
  async function askModuleName() {
    const inputModuleName = await cli.askInput(rl, 'module name: ');
    const execCreatedable = await modulex.isCreatedable(inputModuleName);

    if (!execCreatedable.status) {
      message(execCreatedable);
      await askModuleName();
    }
  }

  /**
   * Ask repository.
   *
   * @return  void
   */
  async function askDescription() {
    const inputDescription = await cli.askInput(rl, 'description: ');

    modulex.config.description = inputDescription;
  }

  /**
   * Ask repository.
   *
   * @return  void
   */
  async function askRepository() {
    const inputRepository = await cli.askInput(rl, 'git repository: ');

    modulex.config.repository = inputRepository;
  }

  /**
   * Ask author.
   *
   * @return  void
   */
  async function askAuthor() {
    const inputAuthor = await cli.askInput(rl, 'author: ');

    modulex.config.author = inputAuthor;
  }

  return {
    askModuleName,
    askDescription,
    askRepository,
    askAuthor
  }
};
