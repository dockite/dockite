import { cosmiconfigSync } from 'cosmiconfig';
import debug from 'debug';

import { CoreConfiguration } from './common/types/config';

let config: CoreConfiguration = {
  fields: [
    '@dockite/field-string',
    '@dockite/field-boolean',
    '@dockite/field-number',
    '@dockite/field-datetime',
    '@dockite/field-json',
    '@dockite/field-colorpicker',
    '@dockite/field-reference',
    '@dockite/field-reference-of',
  ],
};

let hasLoadedConfig = false;

const log = debug('dockite:core:config');

export const getConfig = (): CoreConfiguration => {
  if (!hasLoadedConfig) {
    log('searching for and loading config');
    const result = cosmiconfigSync('dockite').search();

    if (result) {
      log('loaded config');

      config = { ...config, ...result.config };
    } else {
      log('no config files found');
    }

    hasLoadedConfig = true;
  }

  return config;
};
