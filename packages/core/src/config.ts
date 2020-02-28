import { cosmiconfigSync } from 'cosmiconfig';
import debug from 'debug';

import { CoreConfiguration } from './common/types/config';

let config: CoreConfiguration = {};
const hasLoadedConfig = false;

const log = debug('prime:core');

export const getConfig = (): CoreConfiguration => {
  if (!hasLoadedConfig) {
    const result = cosmiconfigSync('dockite').search();

    if (result) {
      log('loaded config');
      config = result.config;
    } else {
      log('no config files found');
    }
  }

  return config;
};
