/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { cosmiconfigSync } from 'cosmiconfig';

import { getAdminUiRollupConfiguration } from '@dockite/rollup';

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
 * @returns {any}
 */
const omitSensitiveValues = (key, value) => {
  if (String(key).includes('secret') || SENSITIVE_CONFIG_KEYS.includes(key)) {
    return undefined;
  }

  return value;
};

const getDockiteFields = () => {
  const config = getDockiteConfig();

  const imports = config.fields.map(field => {
    return `import('${field}/lib/ui')`;
  });

  return `[${imports.join(',')}]`;
};

export default getAdminUiRollupConfiguration(
  getDockiteConfig,
  omitSensitiveValues,
  getDockiteFields,
);
