/* eslint-disable no-param-reassign */
import { RollupOptions } from 'rollup';
import externals from 'rollup-plugin-node-externals';

import { getBaseRollupConfiguration } from './base';

export const getNodeRollupConfiguration = (): RollupOptions => {
  const baseConfig = getBaseRollupConfiguration();

  const config: RollupOptions = {
    ...baseConfig,
  };

  if (config.plugins) {
    config.plugins.unshift(externals({ deps: true }));
  }

  return config;
};
