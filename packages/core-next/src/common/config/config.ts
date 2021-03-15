import { cosmiconfigSync as loadConfigSync } from 'cosmiconfig';
import debug from 'debug';
import { cloneDeep } from 'lodash';

import { DockiteConfiguration } from '@dockite/types';

import { ConfigurationError } from '../errors';

const log = debug('dockite:core:config');

let config: DockiteConfiguration | null = null;

/**
 * The module name to use when looking for configuration files.
 *
 * This will allow looking for the following:
 * - .dockiterc
 * - .dockiterc.(json|yaml|yml|js|cjs)
 * - dockite.config.js
 */
export const DOCKITE_CONFIG_MODULE_NAME = 'dockite';

/**
 * Retrieves the Dockite configuration for usage across the module.
 *
 * Additionally, loads the config if it hasn't already been loaded into memory.
 *
 * @throws {ConfigurationError} An error will be thrown if a configuration file can not be found.
 */
export const getConfig = (): DockiteConfiguration => {
  if (config) {
    return config;
  }

  log('searching for configuration');
  const result = loadConfigSync(DOCKITE_CONFIG_MODULE_NAME).search();

  if (result) {
    log('configuration found!');

    // TODO: Potentially validate the parsed configuration using Ajv to ensure the
    // TODO: expected attributes are there.
    config = cloneDeep(result.config) as DockiteConfiguration;

    return config;
  }

  log('unable to find configuration, aborting');

  throw new ConfigurationError(
    'Unable to load configuration file, please ensure that a relevant dockite configuration file exists!',
  );
};

export default getConfig;
