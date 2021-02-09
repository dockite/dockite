/* eslint-disable */
const {
  getDockiteConfig,
  getDockiteFields,
  omitSensitiveValues,
} = require('./src/utils/_webpack/getDockiteConfig');
const { DockiteFieldPlugin } = require('./src/utils/_webpack/writeDockiteFieldsToFile');
const { getAdminUiWebpackConfiguration } = require('@dockite/webpack');

const dockiteConfig = JSON.parse(JSON.stringify(getDockiteConfig(), omitSensitiveValues));

module.exports = getAdminUiWebpackConfiguration(
  dockiteConfig,
  getDockiteFields(),
  DockiteFieldPlugin,
);
