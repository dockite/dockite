import { DockiteConfiguration } from '@dockite/types';
import { cosmiconfigSync } from 'cosmiconfig';
import debug from 'debug';

let config: DockiteConfiguration;

let hasLoadedConfig = false;

const log = debug('dockite:core:config');

export const getConfig = (): DockiteConfiguration => {
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
