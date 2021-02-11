/* eslint-disable no-param-reassign */
import { RollupOptions } from 'rollup';
import sizes from 'rollup-plugin-sizes';

import { getBaseRollupConfiguration } from './base';

export const getGeneralRollupConfiguration = (): RollupOptions => {
  const baseConfig = getBaseRollupConfiguration();

  const config: RollupOptions = {
    ...baseConfig,
  };

  if (config.plugins) {
    config.plugins.unshift(sizes());
  }

  return config;
};
