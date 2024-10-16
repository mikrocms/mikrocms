/**
 * Convert snake or kebab to camel case.
 *
 * @param   string
 * @return  string
 */
function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[-_]+(.)/g, (_, char) => char.toUpperCase());
}

module.exports = {
  toCamelCase
};
