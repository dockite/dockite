/* eslint-disable */
const { cosmiconfigSync } = require('cosmiconfig');

const SENSITIVE_CONFIG_KEYS = ['server', 'mail', 'database', 'modules', 'entities', 'fields'];

/**
 * @returns {DockiteConfiguration}
 */
const getDockiteConfig = () => {
  const result = cosmiconfigSync('dockite').search();

  if (!result) {
    return {};
  }

  return result.config;
};

/**
 *
 * @param {String} key string
 * @param {any} value any
 */
const omitSensitiveValues = (key, value) => {
  if (String(key).includes('secret') || SENSITIVE_CONFIG_KEYS.includes(key)) {
    return undefined;
  }

  return value;
};

const getDockiteFields = () => {
  const config = getDockiteConfig();

  return config.fields;
};

module.exports = { getDockiteConfig, getDockiteFields, omitSensitiveValues };
