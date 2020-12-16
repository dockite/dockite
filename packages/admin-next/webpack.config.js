/* eslint-disable */
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const config = require('@dockite/webpack');

const { getDockiteConfig, getDockiteFields, omitSensitiveValues } = require('./src/utils/_webpack/getDockiteConfig');
const {DockiteFieldPlugin} = require('./src/utils/_webpack/writeDockiteFieldsToFile');

module.exports = {
  ...config,
  entry: {
    main: path.resolve(__dirname, './src/main.ts'),
  },
  externals: {},
  output: {
    filename: '[name].[hash].bundle.js',
    path: path.resolve(__dirname, './dist'),
  },
  plugins: [
    ...config.plugins,
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './src/public/index.html'),
    }),
    new DefinePlugin({
      DOCKITE_CONFIG: JSON.stringify(getDockiteConfig(), omitSensitiveValues),
      DOCKITE_FIELDS: getDockiteFields(),
      __DEV__: JSON.stringify(config.mode === 'development'),
    }),
    new DockiteFieldPlugin(path.join(__dirname, './src/dockite/fields.ts')),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '.',
      automaticNameMaxLength: 30,
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          minChunks: 2,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
