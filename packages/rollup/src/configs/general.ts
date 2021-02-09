/* eslint-disable no-param-reassign */
import { RollupOptions } from 'rollup';

import { getBaseRollupConfiguration } from './base';

export const getGeneralRollupConfiguration = (): RollupOptions => {
  const baseConfig = getBaseRollupConfiguration();

  const config: RollupOptions = {
    ...baseConfig,
  };

  return config;
};
