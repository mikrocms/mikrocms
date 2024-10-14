const readline = require('readline');

/**
 * Start new readline.
 *
 * @return  void
 */
function readlines() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a question and capture the user's response
 *
 * @param   object
 * @param   string
 * @return  void
 */
async function askInput(rl, query) {
  return new Promise((res) => {
    rl.question(query, res);
  });
}

module.exports = {
  readlines,
  askInput
};
