#!/usr/bin/env node

const generate = require('./lib/generate');

if (process.env.mikrocms !== 'MODULE') {
  const args = process.argv.splice(2);
  const command = args[0] || 'application';

  switch (command) {
    case 'application':
      generate.application();
    break;
    case 'module':
      generate.modulex();
    break;
    case 'env':
      generate.env(...args);
    break;
    case 'database':
      generate.database(...args);
    break;
    case 'schema':
      generate.schema(...args);
    break;
    case 'model':
      generate.model(...args);
    break;
    case 'locale':
      generate.locale(...args);
    break;
    case 'middleware':
      generate.middleware(...args);
    break;
    case 'router':
      generate.router(...args);
    break;
    case 'service':
      generate.service(...args);
    break;
    case 'crud':
      generate.crud(...args);
    break;
    default:
      console.log(`uknown command "${command}"`);
    break;
  }
} else {
  module.exports = {
    'commands': require('./lib/builder')
  };
}
