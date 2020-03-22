/* eslint-disable @typescript-eslint/no-var-requires */
const { cosmiconfigSync } = require('cosmiconfig');
const { union } = require('lodash');

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

    // fields.forEach(field => {
    //   config.module.rule('js').include.add(require.resolve(`${field}/ui`));
    // });
  },
};
