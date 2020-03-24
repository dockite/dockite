/* eslint-disable @typescript-eslint/no-var-requires */
const { cosmiconfigSync } = require('cosmiconfig');
const { union } = require('lodash');
const path = require('path');
const { default: InjectablePlugin, ENTRY_ORDER } = require('webpack-inject-plugin');

let fields = ['@dockite/field-string'];

module.exports = {
  lintOnSave: false,
  devServer: {
    proxy: {
      '^/dockite': {
        target: 'http://localhost:3000/',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  chainWebpack(config) {
    const result = cosmiconfigSync('dockite').search();

    if (result) {
      fields = union(fields, result.config.fields || []);
    }

    const injectImports = [];

    fields.forEach(field => {
      const dirname = path.dirname(require.resolve(field));
      const ui = path.join(dirname, 'ui', 'index.js');
      const abs = path.resolve(ui);

      config.module.rule('js').include.add(abs);
      config.module.rule('js').include.add(`${abs}`);

      injectImports.push(`import('${abs}')`);
    });

    config.plugin('inject').use(InjectablePlugin, [
      () => {
        return `window.resolveFields = [${injectImports.join(',')}];`;
      },
      { entryOrder: ENTRY_ORDER.First },
    ]);
  },
};