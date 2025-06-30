// eslint.config.js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const importPlugin = require('eslint-plugin-import');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/no-unresolved': 'error',
    },
    settings: {
      'import/resolver': {
        'babel-module': {},
      },
    },
    ignores: ['dist/*'],
  },
]);
