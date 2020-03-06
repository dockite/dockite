import { cosmiconfigSync } from 'cosmiconfig';
import debug from 'debug';

import { CoreConfiguration } from './common/types/config';

let config: CoreConfiguration = {};
let hasLoadedConfig = false;

const log = debug('dockite:core:config');

export const getConfig = (): CoreConfiguration => {
  if (!hasLoadedConfig) {
    log('searching for and loading config');
    const result = cosmiconfigSync('dockite').search();

    if (result) {
      log('loaded config');

      config = result.config;
    } else {
      log('no config files found');
    }

    hasLoadedConfig = true;
  }

  return config;
};
