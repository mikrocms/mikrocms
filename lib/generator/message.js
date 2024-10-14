/**
 * Console message.
 *
 * @param   object
 * @return  void
 */
function message(result) {
  if (result.message) {
    console.log(...result.message);
  }
}

module.exports = {
  message
};
