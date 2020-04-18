/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const { cosmiconfigSync } = require('cosmiconfig');
const { union } = require('lodash');
const { default: InjectablePlugin, ENTRY_ORDER } = require('webpack-inject-plugin');

let fields = [
  '@dockite/field-string',
  '@dockite/field-boolean',
  '@dockite/field-number',
  '@dockite/field-datetime',
  '@dockite/field-json',
  '@dockite/field-colorpicker',
  '@dockite/field-reference',
];

module.exports = {
  lintOnSave: false,
  devServer: {
    host: '0.0.0.0',
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

      injectImports.push(`import('${abs}')`);
    });

    config.plugin('inject').use(InjectablePlugin, [
      () => {
        return `window.resolveFields = [${injectImports.join(',')}];`;
      },
      { entryOrder: ENTRY_ORDER.First },
    ]);

    config.module
      .rule('graphql')
      .test(/\.(graphql|gql)$/)
      .use('graphql-tag/loader')
      .loader('graphql-tag/loader')
      .end();
  },
};
